import { appConfig } from "../../../config/appConfig.js";
import { httpClient } from "../../../core/api/httpClient.js";
import { roles } from "../../../core/constants/roles.js";
import { store } from "../../../shared/state/store.js";

function buildFullName(data) {
  return data.fullName ?? `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
}

function normalizeProfile(snapshot, role) {
  const data = snapshot.data();
  const otherInfo = data.otherInfo ?? {};

  return {
    id: data.adminId ?? data.patientId ?? data.doctorId ?? data.receptionistId ?? snapshot.id,
    role,
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    fullName: buildFullName(data),
    email: data.email ?? "",
    phone: data.phone ?? "",
    gender: otherInfo.gender ?? data.gender ?? "",
    dateOfBirth: otherInfo.dob ?? data.dateOfBirth ?? "",
    age: data.age ?? "",
    address: data.address ?? "",
    specialization: Array.isArray(data.specialization) ? data.specialization.join(", ") : data.specialization ?? "",
    availability: data.availability ?? {}
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

async function waitForCurrentUser(firebase) {
  const { auth, onAuthStateChanged } = firebase;

  if (auth.currentUser) {
    return auth.currentUser;
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        user ? resolve(user) : reject(new Error("Please sign in to view your profile."));
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

export function calculateAge(dob) {
  if (!dob) {
    return "";
  }

  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return "";
  }

  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export const profileService = {
  async getCurrentProfile() {
    const currentUser = store.getCurrentUser();

    if (appConfig.useMockApi && currentUser) {
      return httpClient.get("/settings/profile", {
        role: currentUser.role,
        id: currentUser.id
      });
    }

    const firebase = await loadFirebase();
    const { db, doc, getDoc } = firebase;
    const user = await waitForCurrentUser(firebase);
    const collectionByRole = {
      [roles.ADMIN]: "admins",
      [roles.DOCTOR]: "doctors",
      [roles.RECEPTIONIST]: "receptionists",
      [roles.PATIENT]: "patients"
    };

    for (const [role, collectionName] of Object.entries(collectionByRole)) {
      const snapshot = await getDoc(doc(db, collectionName, user.uid));

      if (snapshot.exists()) {
        return normalizeProfile(snapshot, role);
      }
    }

    throw new Error("No role profile was found for this account.");
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
