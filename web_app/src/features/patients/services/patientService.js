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
  const firstName = patient.firstName ?? patient.first_name ?? "";
  const lastName = patient.lastName ?? patient.last_name ?? "";
  return patient.fullName ?? patient.full_name ?? `${firstName} ${lastName}`.trim();
}

function normalizePatient(snapshot) {
  const data = snapshot.data();
  const fullName = buildFullName(data);
  const [fallbackFirstName = "", ...fallbackLastNameParts] = fullName.split(" ");
  const firstName = data.firstName ?? data.first_name ?? fallbackFirstName;
  const lastName = data.lastName ?? data.last_name ?? fallbackLastNameParts.join(" ");
  const dateOfBirth = data.dateOfBirth ?? data.date_of_birth ?? "";
  const createdAt = timestampToDateString(data.createdAt ?? data.created_at);

  return {
    id: snapshot.id,
    patient_id: data.patient_id ?? snapshot.id,
    uid: data.uid ?? data.auth_uid ?? "",
    auth_uid: data.auth_uid ?? data.uid ?? "",
    firstName,
    lastName,
    first_name: firstName,
    last_name: lastName,
    fullName,
    full_name: fullName,
    gender: data.gender ?? "",
    dateOfBirth,
    date_of_birth: dateOfBirth,
    age: Number(data.age ?? (dateOfBirth ? calculateAge(dateOfBirth) : 0)),
    phone: data.phone ?? "",
    email: data.email ?? "",
    address: data.address ?? "",
    bloodGroup: data.bloodGroup ?? data.blood_group ?? "",
    blood_group: data.bloodGroup ?? data.blood_group ?? "",
    emergencyContact: data.emergencyContact ?? data.emergency_contact ?? "",
    emergency_contact: data.emergencyContact ?? data.emergency_contact ?? "",
    medicalCondition: data.medicalCondition ?? data.medical_condition ?? "",
    medical_condition: data.medicalCondition ?? data.medical_condition ?? "",
    createdAt,
    createdAtRaw: data.createdAt ?? data.created_at ?? null,
    created_at: createdAt,
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
    patient.full_name,
    patient.firstName,
    patient.lastName,
    patient.phone,
    patient.email,
    patient.patient_id
  ].join(" ").toLowerCase();

  const matchesSearch = !normalized.search || searchable.includes(normalized.search);
  const matchesGender = !normalized.gender || patient.gender === normalized.gender;
  const matchesBloodGroup = !normalized.bloodGroup || patient.bloodGroup === normalized.bloodGroup;
  const matchesDate = !normalized.createdDate || patient.created_at.startsWith(normalized.createdDate);

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
    auth_uid: ownerUid,
    firstName,
    lastName,
    first_name: firstName,
    last_name: lastName,
    fullName,
    full_name: fullName,
    gender: payload.gender,
    dateOfBirth: payload.dateOfBirth,
    date_of_birth: payload.dateOfBirth,
    age,
    phone: payload.phone?.trim() ?? "",
    email: payload.email?.trim() ?? "",
    address: payload.address?.trim() ?? "",
    bloodGroup: payload.bloodGroup ?? "",
    blood_group: payload.bloodGroup ?? "",
    emergencyContact: payload.emergencyContact?.trim() ?? "",
    emergency_contact: payload.emergencyContact?.trim() ?? "",
    medicalCondition: payload.medicalCondition?.trim() ?? "",
    medical_condition: payload.medicalCondition?.trim() ?? ""
  };
}

async function getLinkedRecords(collectionName, patientId) {
  const recordsQuery = query(collection(db, collectionName), where("patient_id", "==", patientId));
  const recordsSnapshot = await getDocs(recordsQuery);

  return recordsSnapshot.docs.map((recordSnapshot) => {
    const data = recordSnapshot.data();

    return {
      id: recordSnapshot.id,
      ...data,
      patient_id: data.patient_id ?? patientId,
      patient_name: data.patient_name ?? "Selected patient",
      doctor_name: data.doctor_name ?? data.doctor_id ?? "-",
      created_at: timestampToDateString(data.created_at),
      record_date: timestampToDateString(data.record_date) || data.record_date || "",
      appointment_date: data.appointment_date ?? "",
      appointment_time: data.appointment_time ?? "",
      status: data.status ?? "Pending"
    };
  });
}

export const patientService = {
  async list(filters = {}) {
    const snapshot = await getDocs(patientsCollection);

    return snapshot.docs
      .map(normalizePatient)
      .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))
      .filter((patient) => matchesFilters(patient, filters));
  },

  async getById(id) {
    const patientSnapshot = await getDoc(doc(db, "patients", id));

    if (!patientSnapshot.exists()) {
      throw new Error("Patient record was not found.");
    }

    const patient = normalizePatient(patientSnapshot);
    const [appointments, medicalRecords] = await Promise.all([
      getLinkedRecords("appointments", patient.patient_id),
      getLinkedRecords("medical_records", patient.patient_id)
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
      createdBy: currentUser?.id ?? currentUser?.uid ?? currentUser?.auth_uid ?? "",
      createdAt: serverTimestamp(),
      created_at: serverTimestamp()
    };
    const documentReference = await addDoc(patientsCollection, patientData);
    await updateDoc(documentReference, { patient_id: documentReference.id });

    return this.getById(documentReference.id);
  },

  async update(id, payload, currentUser = null) {
    const patientData = {
      ...buildPatientPayload(payload, currentUser),
      updatedBy: currentUser?.id ?? currentUser?.uid ?? currentUser?.auth_uid ?? ""
    };
    await updateDoc(doc(db, "patients", id), patientData);

    return this.getById(id);
  },

  async remove(id) {
    await deleteDoc(doc(db, "patients", id));
    return { success: true };
  }
};
