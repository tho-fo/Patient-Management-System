import { appConfig } from "../../../config/appConfig.js";
import { httpClient } from "../../../core/api/httpClient.js";
import { roles } from "../../../core/constants/roles.js";

function getCollectionName(role) {
  return {
    [roles.ADMIN]: "admins",
    [roles.DOCTOR]: "doctors",
    [roles.RECEPTIONIST]: "receptionists",
    [roles.PATIENT]: "patients"
  }[role] ?? "patients";
}

function normalizeProfileData(data, role) {
  return {
    fullName: data.fullName ?? `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
    email: data.email ?? "",
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
        user ? resolve(user) : reject(new Error("Please sign in to view your settings."));
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

async function firestoreGetProfile({ role, id }) {
  const firebase = await loadFirebase();
  const { db, doc, getDoc } = firebase;
  const collectionName = getCollectionName(role);
  const snapshot = await getDoc(doc(db, collectionName, id));

  if (!snapshot.exists()) {
    throw new Error("Profile not found.");
  }

  return normalizeProfileData(snapshot.data(), role);
}

async function firestoreUpdateProfile(payload) {
  const firebase = await loadFirebase();
  const { db, doc, getDoc, updateDoc } = firebase;
  const user = await waitForCurrentUser(firebase);
  const collectionName = getCollectionName(payload.role);
  const profileRef = doc(db, collectionName, user.uid);
  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    throw new Error("Profile not found.");
  }

  const existingData = snapshot.data();
  const updatedProfile = {
    fullName: payload.fullName?.trim() ?? existingData.fullName ?? "",
    email: payload.email?.trim().toLowerCase() ?? existingData.email ?? "",
    phone: payload.phone?.trim() ?? existingData.phone ?? ""
  };

  if (payload.role === roles.DOCTOR) {
    updatedProfile.specialization = payload.specialization?.trim() ?? existingData.specialization ?? "";
  }

  await updateDoc(profileRef, updatedProfile);
  return normalizeProfileData({ ...existingData, ...updatedProfile }, payload.role);
}

async function firestoreChangePassword(payload) {
  const firebase = await loadFirebase();
  const { auth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } = firebase;
  const user = auth.currentUser ?? await waitForCurrentUser(firebase);
  const credential = EmailAuthProvider.credential(user.email, payload.currentPassword);

  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, payload.newPassword);

  return { success: true };
}

export const settingsService = {
  async getProfile(params) {
    if (appConfig.useMockApi) {
      return httpClient.get("/settings/profile", params);
    }

    return firestoreGetProfile(params);
  },

  async updateProfile(payload) {
    if (appConfig.useMockApi) {
      return httpClient.put("/settings/profile", payload);
    }

    return firestoreUpdateProfile(payload);
  },

  async changePassword(payload) {
    if (appConfig.useMockApi) {
      return httpClient.put("/settings/password", payload);
    }

    return firestoreChangePassword(payload);
  }
};
