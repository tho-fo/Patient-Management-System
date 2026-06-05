import { appConfig } from "../../../config/appConfig.js";
import { httpClient } from "../../../core/api/httpClient.js";
import { roles } from "../../../core/constants/roles.js";

function buildFullName(payload) {
  return `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim();
}

function formatAuthError(error) {
  const messages = {
    "auth/email-already-in-use": "This email is already registered. Please use another email or sign in.",
    "auth/email-already-exists": "This email is already registered. Please use another email or sign in.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-not-found": "User doesn't exist. Please Register",
    "auth/wrong-password": "Invalid email or password.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/too-many-requests": "Too many failed attempts. Please wait and try again later.",
    "permission-denied": "The account was created, but the profile could not be saved. Check Firestore permissions."
  };

  return new Error(messages[error?.code] ?? error?.message ?? "Authentication failed. Please try again.");
}

function normalizeProfile(documentSnapshot, role) {
  const data = documentSnapshot.data();
  const fullName = data.fullName ?? buildFullName(data);

  return {
    id: data.adminId ?? data.patientId ?? data.doctorId ?? data.receptionistId ?? documentSnapshot.id,
    authUid: data.authUid ?? documentSnapshot.id,
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    fullName,
    email: data.email,
    phone: data.phone ?? "",
    specialization: Array.isArray(data.specialization) ? data.specialization.join(", ") : data.specialization ?? "",
    role
  };
}

async function loadFirebase() {
  const [{ auth, db }, authSdk, firestoreSdk] = await Promise.all([
    import("../../../services/firebase_config.js"),
    import("https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js")
  ]);

  return { auth, db, ...authSdk, ...firestoreSdk };
}

async function resolveUserRole(uid, firestore) {
  const { db, doc, getDoc } = firestore;

  // Optimized: Check all collections in parallel for better performance
  const [patientSnapshot, doctorSnapshot, receptionistSnapshot, adminSnapshot] = await Promise.all([
    getDoc(doc(db, "patients", uid)),
    getDoc(doc(db, "doctors", uid)),
    getDoc(doc(db, "receptionists", uid)),
    getDoc(doc(db, "admin", uid))
  ]);

  // Check most common roles first (statistically: patient > doctor > receptionist > admin)
  if (patientSnapshot.exists()) {
    return normalizeProfile(patientSnapshot, roles.PATIENT);
  }

  if (doctorSnapshot.exists()) {
    return normalizeProfile(doctorSnapshot, roles.DOCTOR);
  }

  if (receptionistSnapshot.exists()) {
    return normalizeProfile(receptionistSnapshot, roles.RECEPTIONIST);
  }

  if (adminSnapshot.exists()) {
    return normalizeProfile(adminSnapshot, roles.ADMIN);
  }

  throw new Error("No role profile was found for this account.");
}

async function buildSession(userCredential, firestore) {
  const firebaseUser = userCredential.user;
  const token = await firebaseUser.getIdToken();
  const user = await resolveUserRole(firebaseUser.uid, firestore);

  return {
    token,
    user
  };
}

async function registerWithProfile(payload, role) {
  try {
    if (appConfig.useMockApi) {
      return httpClient.post(`/auth/register-${role}`, payload);
    }

    const {
      auth,
      db,
      createUserWithEmailAndPassword,
      doc,
      getDoc,
      serverTimestamp,
      setDoc
    } = await loadFirebase();
    const firstName = payload.firstName?.trim() ?? "";
    const lastName = payload.lastName?.trim() ?? "";
    const email = payload.email?.trim().toLowerCase() ?? "";
    const phone = payload.phone?.trim() ?? "";
    const userCredential = await createUserWithEmailAndPassword(auth, email, payload.password);
    const uid = userCredential.user.uid;
    const fullName = buildFullName({ firstName, lastName });
    const dob = payload.dateOfBirth ?? payload.dob ?? "";
    const baseProfile = {
      authUid: uid,
      role,
      firstName,
      lastName,
      fullName,
      phone,
      email,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    if (role === roles.PATIENT) {
      await setDoc(doc(db, "patients", uid), {
        ...baseProfile,
        patientId: uid,
        gender: payload.gender ?? "",
        dateOfBirth: dob,
        address: payload.address?.trim() ?? "",
        emergencyContact: payload.emergencyContact?.trim() ?? "",
        medicalCondition: payload.medicalCondition?.trim() ?? "",
        otherInfo: {
          bloodType: payload.bloodType ?? "",
          bloodGroup: payload.bloodGroup ?? "",
          weight: Number(payload.weight ?? 0),
          height: Number(payload.height ?? 0),
          gender: payload.gender ?? "",
          dob,
          emergencyContact: payload.emergencyContact?.trim() ?? "",
          medicalCondition: payload.medicalCondition?.trim() ?? ""
        }
      });
    }

    if (role === roles.DOCTOR) {
      await setDoc(doc(db, "doctors", uid), {
        ...baseProfile,
        doctorId: uid,
        gender: payload.gender ?? "",
        specialization: [payload.specialization].filter(Boolean),
        availability: {}
      });
    }

    if (role === roles.RECEPTIONIST) {
      await setDoc(doc(db, "receptionists", uid), {
        ...baseProfile,
        receptionistId: uid,
      });
    }

    return buildSession(userCredential, { db, doc, getDoc });
  } catch (error) {
    throw formatAuthError(error);
  }
}

export const authService = {
  async registerPatient(payload) {
    return registerWithProfile(payload, roles.PATIENT);
  },

  async registerDoctor(payload) {
    return registerWithProfile(payload, roles.DOCTOR);
  },

  async registerReceptionist(payload) {
    return registerWithProfile(payload, roles.RECEPTIONIST);
  },

  async login(payload) {
    console.log("Attempting login with payload:", payload);
    try {
      if (appConfig.useMockApi) {
        return httpClient.post("/auth/login", payload);
      }

      console.log("Loading Firebase modules...");
      const firebase = await loadFirebase();
      const { auth, signInWithEmailAndPassword } = firebase;
      const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.password);
      return buildSession(userCredential, firebase);
    } catch (error) {
      console.error("Login error details:", error);
      throw formatAuthError(error);
    }
  },

  async logout() {
    if (appConfig.useMockApi) {
      return httpClient.post("/auth/logout");
    }

    const { auth, signOut } = await loadFirebase();
    await signOut(auth);
    return { success: true };
  }
};
