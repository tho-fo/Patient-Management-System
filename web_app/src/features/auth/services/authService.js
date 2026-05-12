import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { roles } from "../../../core/constants/roles.js";
import { auth, db } from "../../../services/firebase_config.js";

function buildFullName(payload) {
  return `${payload.first_name ?? ""} ${payload.last_name ?? ""}`.trim();
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age > 0 ? age : null;
}

function formatAuthError(error) {
  const messages = {
    "auth/email-already-in-use": "This email is already registered. Please use another email or sign in.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/network-request-failed": "Network error. Check your connection and try again."
  };

  return new Error(messages[error.code] ?? error.message ?? "Authentication failed. Please try again.");
}

function normalizeProfile(documentSnapshot, role) {
  const data = documentSnapshot.data();

  return {
    id: data.patient_id ?? data.doctor_id ?? documentSnapshot.id,
    auth_uid: data.auth_uid,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone ?? "",
    specialization: data.specialization ?? "",
    role
  };
}

async function resolveUserRole(uid) {
  const patientSnapshot = await getDoc(doc(db, "patients", uid));

  if (patientSnapshot.exists()) {
    return normalizeProfile(patientSnapshot, roles.PATIENT);
  }

  const doctorSnapshot = await getDoc(doc(db, "doctors", uid));

  if (doctorSnapshot.exists()) {
    return normalizeProfile(doctorSnapshot, roles.DOCTOR);
  }

  throw new Error("No patient or doctor profile was found for this account.");
}

async function buildSession(userCredential) {
  const firebaseUser = userCredential.user;
  const token = await firebaseUser.getIdToken();
  const user = await resolveUserRole(firebaseUser.uid);

  return {
    token,
    user
  };
}

async function registerWithProfile(payload, role) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
    const uid = userCredential.user.uid;
    const fullName = buildFullName(payload);

    if (role === roles.PATIENT) {
      await setDoc(doc(db, "patients", uid), {
        patient_id: uid,
        uid,
        auth_uid: uid,
        full_name: fullName,
        age: calculateAge(payload.date_of_birth),
        date_of_birth: payload.date_of_birth,
        gender: payload.gender,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        created_at: serverTimestamp()
      });
    }

    if (role === roles.DOCTOR) {
      await setDoc(doc(db, "doctors", uid), {
        doctor_id: uid,
        uid,
        auth_uid: uid,
        full_name: fullName,
        specialization: payload.specialization,
        license_number: payload.license_number,
        years_of_experience: Number(payload.years_of_experience),
        phone: payload.phone,
        email: payload.email,
        created_at: serverTimestamp()
      });
    }

    return buildSession(userCredential);
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

  async login(payload) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.password);
      return buildSession(userCredential);
    } catch (error) {
      throw formatAuthError(error);
    }
  },

  async logout() {
    await signOut(auth);
    return { success: true };
  }
};
