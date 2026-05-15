import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from "../../../services/firebase_config.js";

const patientsCollection = collection(db, "patients");

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
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

function buildFullName(patient) {
  const firstName = patient.firstName ?? "";
  const lastName = patient.lastName ?? "";
  return patient.fullName ?? `${firstName} ${lastName}`.trim();
}

function normalizePatient(snapshot) {
  const data = snapshot.data();
  const fullName = buildFullName(data);
  const [fallbackFirstName = "", ...fallbackLastNameParts] = fullName.split(" ");
  const firstName = data.firstName ?? fallbackFirstName;
  const lastName = data.lastName ?? fallbackLastNameParts.join(" ");
  const dateOfBirth = data.dateOfBirth ?? "";
  const createdAt = timestampToDateString(data.createdAt);
  const patientId = data.patientId ?? snapshot.id;
  const authUid = data.authUid ?? data.uid ?? "";

  return {
    id: snapshot.id,
    patientId,
    uid: data.uid ?? authUid,
    authUid,
    firstName,
    lastName,
    fullName,
    gender: data.gender ?? "",
    dateOfBirth,
    age: Number(data.age ?? (dateOfBirth ? calculateAge(dateOfBirth) : 0)),
    phone: data.phone ?? "",
    email: data.email ?? "",
    address: data.address ?? "",
    bloodGroup: data.bloodGroup ?? "",
    emergencyContact: data.emergencyContact ?? "",
    medicalCondition: data.medicalCondition ?? "",
    createdAt,
    createdAtRaw: data.createdAt ?? null,
    appointments: [],
    medicalRecords: []
  };
}

function normalizeFilters(filters = {}) {
  return {
    search: filters.search?.trim().toLowerCase() ?? "",
    gender: filters.gender ?? "",
    bloodGroup: filters.bloodGroup ?? "",
    createdDate: filters.createdDate ?? ""
  };
}

function matchesFilters(patient, filters) {
  const normalized = normalizeFilters(filters);
  const searchable = [
    patient.fullName,
    patient.firstName,
    patient.lastName,
    patient.phone,
    patient.email,
    patient.patientId
  ].join(" ").toLowerCase();

  const matchesSearch = !normalized.search || searchable.includes(normalized.search);
  const matchesGender = !normalized.gender || patient.gender === normalized.gender;
  const matchesBloodGroup = !normalized.bloodGroup || patient.bloodGroup === normalized.bloodGroup;
  const matchesDate = !normalized.createdDate || patient.createdAt.startsWith(normalized.createdDate);

  return matchesSearch && matchesGender && matchesBloodGroup && matchesDate;
}

function buildPatientPayload(payload, currentUser = null) {
  const firstName = payload.firstName?.trim() ?? "";
  const lastName = payload.lastName?.trim() ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const age = payload.dateOfBirth ? calculateAge(payload.dateOfBirth) : Number(payload.age ?? 0);
  const ownerUid = payload.uid?.trim() ?? "";

  return {
    uid: ownerUid,
    authUid: ownerUid,
    firstName,
    lastName,
    fullName,
    gender: payload.gender,
    dateOfBirth: payload.dateOfBirth,
    age,
    phone: payload.phone?.trim() ?? "",
    email: payload.email?.trim() ?? "",
    address: payload.address?.trim() ?? "",
    bloodGroup: payload.bloodGroup ?? "",
    emergencyContact: payload.emergencyContact?.trim() ?? "",
    medicalCondition: payload.medicalCondition?.trim() ?? ""
  };
}

async function getLinkedRecords(collectionName, patientId) {
  const recordsQuery = query(collection(db, collectionName), where("patientId", "==", patientId));
  const recordsSnapshot = await getDocs(recordsQuery);

  return recordsSnapshot.docs.map((recordSnapshot) => {
    const data = recordSnapshot.data();

    return {
      id: recordSnapshot.id,
      ...data,
      patientId: data.patientId ?? patientId,
      patientName: data.patientName ?? "Selected patient",
      doctorName: data.doctorName ?? data.doctorId ?? "-",
      createdAt: timestampToDateString(data.createdAt),
      recordDate: timestampToDateString(data.recordDate) || data.recordDate || "",
      appointmentDate: data.appointmentDate ?? "",
      appointmentTime: data.appointmentTime ?? "",
      status: data.status ?? "Pending"
    };
  });
}

export const patientService = {
  async list(filters = {}) {
    const snapshot = await getDocs(patientsCollection);

    return snapshot.docs
      .map(normalizePatient)
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
      .filter((patient) => matchesFilters(patient, filters));
  },

  async getById(id) {
    const patientSnapshot = await getDoc(doc(db, "patients", id));

    if (!patientSnapshot.exists()) {
      throw new Error("Patient record was not found.");
    }

    const patient = normalizePatient(patientSnapshot);
    const [appointments, medicalRecords] = await Promise.all([
      getLinkedRecords("appointments", patient.patientId),
      getLinkedRecords("medicalRecords", patient.patientId)
    ]);

    return {
      ...patient,
      appointments,
      medicalRecords
    };
  },

  async create(payload, currentUser = null) {
    const patientData = {
      ...buildPatientPayload(payload, currentUser),
      createdBy: currentUser?.id ?? currentUser?.uid ?? currentUser?.authUid ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const documentReference = await addDoc(patientsCollection, patientData);
    await updateDoc(documentReference, { patientId: documentReference.id });

    return this.getById(documentReference.id);
  },

  async update(id, payload, currentUser = null) {
    const existingSnapshot = await getDoc(doc(db, "patients", id));

    if (!existingSnapshot.exists()) {
      throw new Error("Patient record was not found.");
    }

    const existingPatient = normalizePatient(existingSnapshot);
    const patientData = {
      ...buildPatientPayload(payload, currentUser),
      uid: payload.uid?.trim() || existingPatient.uid,
      authUid: payload.uid?.trim() || existingPatient.authUid,
      createdBy: existingSnapshot.data().createdBy ?? "",
      updatedBy: currentUser?.id ?? currentUser?.uid ?? currentUser?.authUid ?? "",
      updatedAt: serverTimestamp()
    };
    await updateDoc(doc(db, "patients", id), patientData);

    return this.getById(id);
  },

  async remove(id) {
    await deleteDoc(doc(db, "patients", id));
    return { success: true };
  }
};
