import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { roles } from "../../../core/constants/roles.js";
import { auth, db } from "../../../services/firebase_config.js";

function waitForCurrentUser() {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
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

async function findProfile(collectionName, uid) {
  const directSnapshot = await getDoc(doc(db, collectionName, uid));

  if (directSnapshot.exists()) {
    return directSnapshot;
  }

  const authUidQuery = query(collection(db, collectionName), where("authUid", "==", uid), limit(1));
  const authUidSnapshot = await getDocs(authUidQuery);

  if (!authUidSnapshot.empty) {
    return authUidSnapshot.docs[0];
  }

  const uidQuery = query(collection(db, collectionName), where("uid", "==", uid), limit(1));
  const uidSnapshot = await getDocs(uidQuery);

  return uidSnapshot.empty ? null : uidSnapshot.docs[0];
}

function normalizeProfile(snapshot, role) {
  const data = snapshot.data();
  const authUid = data.authUid ?? data.uid ?? snapshot.id;

  return {
    id: data.patientId ?? data.doctorId ?? snapshot.id,
    uid: data.uid ?? authUid,
    authUid,
    role,
    fullName: data.fullName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    gender: data.gender ?? "",
    dateOfBirth: data.dateOfBirth ?? "",
    age: data.age ?? "",
    address: data.address ?? "",
    specialization: data.specialization ?? "",
    licenseNumber: data.licenseNumber ?? "",
    yearsOfExperience: data.yearsOfExperience ?? ""
  };
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
    const user = await waitForCurrentUser();
    const patientSnapshot = await findProfile("patients", user.uid);

    if (patientSnapshot) {
      return normalizeProfile(patientSnapshot, roles.PATIENT);
    }

    const doctorSnapshot = await findProfile("doctors", user.uid);

    if (doctorSnapshot) {
      return normalizeProfile(doctorSnapshot, roles.DOCTOR);
    }

    throw new Error("No patient or doctor profile was found for this account.");
  },

  async logout() {
    await signOut(auth);
  }
};
