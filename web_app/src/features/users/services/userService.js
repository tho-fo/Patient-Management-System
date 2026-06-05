import { appConfig } from "../../../config/appConfig.js";
import { httpClient } from "../../../core/api/httpClient.js";
import { roles } from "../../../core/constants/roles.js";

function splitFullName(fullName = "") {
  const [firstName = "", ...lastNameParts] = fullName.trim().split(/\s+/);
  return {
    firstName,
    lastName: lastNameParts.join(" ")
  };
}

function normalizeSpecialization(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }

  return value ?? "";
}

function timestampToDateString(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return "";
}

function normalizeStaffRecord(data, id, role) {
  const fullName = data.fullName ?? `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();

  return {
    id,
    staffKey: data.doctorId ?? data.receptionistId ?? id,
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    fullName,
    role,
    phone: data.phone ?? "",
    email: data.email ?? "",
    specialization: role === roles.DOCTOR ? normalizeSpecialization(data.specialization) : "",
    availability: data.availability ?? {},
    createdAt: timestampToDateString(data.createdAt),
    updatedAt: timestampToDateString(data.updatedAt)
  };
}

function collectionNameForRole(role) {
  if (role === roles.DOCTOR) {
    return "doctors";
  }

  if (role === roles.RECEPTIONIST) {
    return "receptionists";
  }

  throw new Error("Only doctor and receptionist profiles can be managed here.");
}

function roleForCollection(collectionName) {
  return collectionName === "doctors" ? roles.DOCTOR : roles.RECEPTIONIST;
}

function buildStaffPayload(payload, role, firestore, existing = {}) {
  const { firstName, lastName } = splitFullName(payload.fullName);
  const data = {
    firstName,
    lastName,
    fullName: payload.fullName.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    updatedAt: firestore.serverTimestamp()
  };

  if (role === roles.DOCTOR) {
    data.specialization = payload.specialization
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    data.availability = existing.availability ?? {};
  }

  return data;
}

function formatStaffError(error) {
  const messages = {
    "auth/email-already-in-use": "A staff account with this email already exists.",
    "auth/invalid-email": "Enter a valid staff email address.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "permission-denied": "You do not have permission to manage staff profiles."
  };

  return new Error(messages[error?.code] ?? error?.message ?? "Staff request failed.");
}

async function loadFirebase() {
  const [{ db, firebaseConfig }, appSdk, authSdk, firestoreSdk] = await Promise.all([
    import("../../../services/firebase_config.js"),
    import("https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js")
  ]);

  return { db, firebaseConfig, ...appSdk, ...authSdk, ...firestoreSdk };
}

async function createAuthAccount(firestore, payload) {
  const appName = `staff-create-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const secondaryApp = firestore.initializeApp(firestore.firebaseConfig, appName);
  const secondaryAuth = firestore.getAuth(secondaryApp);

  try {
    const userCredential = await firestore.createUserWithEmailAndPassword(
      secondaryAuth,
      payload.email.trim(),
      payload.password
    );
    await firestore.signOut(secondaryAuth).catch(() => null);
    return userCredential.user.uid;
  } finally {
    await firestore.deleteApp(secondaryApp).catch(() => null);
  }
}

async function findStaffProfile(firestore, staffKey) {
  const { db, doc, getDoc } = firestore;
  const [doctorSnapshot, receptionistSnapshot] = await Promise.all([
    getDoc(doc(db, "doctors", staffKey)),
    getDoc(doc(db, "receptionists", staffKey))
  ]);

  if (doctorSnapshot.exists()) {
    return {
      collectionName: "doctors",
      role: roles.DOCTOR,
      snapshot: doctorSnapshot
    };
  }

  if (receptionistSnapshot.exists()) {
    return {
      collectionName: "receptionists",
      role: roles.RECEPTIONIST,
      snapshot: receptionistSnapshot
    };
  }

  throw new Error("Staff member not found.");
}

async function emailExists(firestore, email, ignoreKey = null) {
  const { db, collection, getDocs } = firestore;
  const normalizedEmail = email.trim().toLowerCase();
  const collections = ["doctors", "receptionists", "admin"];
  const snapshots = await Promise.all(
    collections.map((collectionName) => getDocs(collection(db, collectionName)))
  );

  return snapshots.some((snapshot) =>
    snapshot.docs.some((documentSnapshot) => {
      const data = documentSnapshot.data();
      const profileId = data.doctorId ?? data.receptionistId ?? data.adminId ?? documentSnapshot.id;
      return profileId !== ignoreKey && data.email?.toLowerCase() === normalizedEmail;
    })
  );
}

async function firestoreList(filters = {}) {
  const firestore = await loadFirebase();
  const { db, collection, getDocs } = firestore;
  const [doctorSnapshot, receptionistSnapshot] = await Promise.all([
    getDocs(collection(db, "doctors")),
    getDocs(collection(db, "receptionists"))
  ]);
  const search = filters.search?.trim().toLowerCase() ?? "";

  return [
    ...doctorSnapshot.docs.map((snapshot) => normalizeStaffRecord(snapshot.data(), snapshot.id, roles.DOCTOR)),
    ...receptionistSnapshot.docs.map((snapshot) => normalizeStaffRecord(snapshot.data(), snapshot.id, roles.RECEPTIONIST))
  ]
    .sort((left, right) => left.fullName.localeCompare(right.fullName))
    .filter((member) => {
      const searchable = [member.fullName, member.email, member.phone, member.specialization].join(" ").toLowerCase();
      const matchesRole = !filters.role || member.role === filters.role;
      const matchesSearch = !search || searchable.includes(search);
      return matchesRole && matchesSearch;
    });
}

async function firestoreGetByKey(staffKey) {
  const firestore = await loadFirebase();
  const profile = await findStaffProfile(firestore, staffKey);
  return normalizeStaffRecord(profile.snapshot.data(), profile.snapshot.id, profile.role);
}

async function firestoreCreate(payload) {
  const firestore = await loadFirebase();

  if (await emailExists(firestore, payload.email)) {
    throw new Error("A staff account with this email already exists.");
  }

  const role = payload.role;
  const collectionName = collectionNameForRole(role);
  const uid = await createAuthAccount(firestore, payload);
  const { db, doc, setDoc, serverTimestamp } = firestore;
  const staffData = {
    ...buildStaffPayload(payload, role, firestore),
    [role === roles.DOCTOR ? "doctorId" : "receptionistId"]: uid,
    authUid: uid,
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, collectionName, uid), staffData);
  return firestoreGetByKey(uid);
}

async function firestoreUpdate(staffKey, payload) {
  const firestore = await loadFirebase();
  const profile = await findStaffProfile(firestore, staffKey);
  const targetCollectionName = collectionNameForRole(payload.role);

  if (await emailExists(firestore, payload.email, staffKey)) {
    throw new Error("A staff account with this email already exists.");
  }

  const { db, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } = firestore;
  const existingData = profile.snapshot.data();
  const targetRole = roleForCollection(targetCollectionName);
  const identityField = targetRole === roles.DOCTOR ? "doctorId" : "receptionistId";
  const staffData = {
    ...buildStaffPayload(payload, targetRole, firestore, existingData),
    [identityField]: staffKey,
    authUid: existingData.authUid ?? staffKey,
    createdAt: existingData.createdAt ?? serverTimestamp()
  };

  if (profile.collectionName === targetCollectionName) {
    await updateDoc(doc(db, targetCollectionName, staffKey), staffData);
  } else {
    await setDoc(doc(db, targetCollectionName, staffKey), staffData);
    await deleteDoc(doc(db, profile.collectionName, staffKey));
  }

  return firestoreGetByKey(staffKey);
}

async function firestoreRemove(staffKey) {
  const firestore = await loadFirebase();
  const profile = await findStaffProfile(firestore, staffKey);
  const { db, deleteDoc, doc } = firestore;
  await deleteDoc(doc(db, profile.collectionName, staffKey));
  return { success: true };
}

async function firestoreUpdateDoctorAvailability(staffKey, availability) {
  const firestore = await loadFirebase();
  const profile = await findStaffProfile(firestore, staffKey);

  if (profile.role !== roles.DOCTOR) {
    throw new Error("Only doctors can update availability.");
  }

  const { db, doc, updateDoc, serverTimestamp } = firestore;
  await updateDoc(doc(db, "doctors", profile.snapshot.id), {
    availability,
    updatedAt: serverTimestamp()
  });

  return firestoreGetByKey(staffKey);
}

export const userService = {
  async list(filters = {}) {
    if (appConfig.useMockApi) {
      return httpClient.get("/staff", filters);
    }

    try {
      return await firestoreList(filters);
    } catch (error) {
      throw formatStaffError(error);
    }
  },

  async getByKey(staffKey) {
    if (appConfig.useMockApi) {
      return httpClient.get(`/staff/${staffKey}`);
    }

    try {
      return await firestoreGetByKey(staffKey);
    } catch (error) {
      throw formatStaffError(error);
    }
  },

  async create(payload) {
    if (appConfig.useMockApi) {
      return httpClient.post("/staff", payload);
    }

    try {
      return await firestoreCreate(payload);
    } catch (error) {
      throw formatStaffError(error);
    }
  },

  async update(staffKey, payload) {
    if (appConfig.useMockApi) {
      return httpClient.put(`/staff/${staffKey}`, payload);
    }

    try {
      return await firestoreUpdate(staffKey, payload);
    } catch (error) {
      throw formatStaffError(error);
    }
  },

  async remove(staffKey) {
    if (appConfig.useMockApi) {
      return httpClient.delete(`/staff/${staffKey}`);
    }

    try {
      return await firestoreRemove(staffKey);
    } catch (error) {
      throw formatStaffError(error);
    }
  },

  async updateDoctorAvailability(staffKey, availability) {
    if (appConfig.useMockApi) {
      return httpClient.put(`/doctors/${staffKey}/availability`, { availability });
    }

    try {
      return await firestoreUpdateDoctorAvailability(staffKey, availability);
    } catch (error) {
      throw formatStaffError(error);
    }
  }
};
