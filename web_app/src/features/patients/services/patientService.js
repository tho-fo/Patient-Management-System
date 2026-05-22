import { appConfig } from "../../../config/appConfig.js";
import { httpClient } from "../../../core/api/httpClient.js";

function buildFullName(patient) {
  return patient.fullName ?? `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim();
}

function calculateAge(dob) {
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

function normalizePatientRecord(data, id) {
  const otherInfo = data.otherInfo ?? {};
  const fullName = buildFullName(data);
  const [fallbackFirstName = "", ...fallbackLastNameParts] = fullName.split(" ");
  const dob = otherInfo.dob ?? data.dateOfBirth ?? data.dob ?? "";

  return {
    id,
    patientId: data.patientId ?? id,
    firstName: data.firstName ?? fallbackFirstName,
    lastName: data.lastName ?? fallbackLastNameParts.join(" "),
    fullName,
    phone: data.phone ?? "",
    email: data.email ?? "",
    address: data.address ?? "",
    otherInfo,
    gender: otherInfo.gender ?? data.gender ?? "",
    dob,
    dateOfBirth: dob,
    age: dob ? calculateAge(dob) : Number(data.age ?? 0),
    bloodType: otherInfo.bloodType ?? data.bloodType ?? "",
    bloodGroup: otherInfo.bloodGroup ?? data.bloodGroup ?? "",
    weight: otherInfo.weight ?? "",
    height: otherInfo.height ?? "",
    emergencyContact: otherInfo.emergencyContact ?? data.emergencyContact ?? "",
    medicalCondition: otherInfo.medicalCondition ?? data.medicalCondition ?? "",
    createdAt: timestampToDateString(data.createdAt),
    updatedAt: timestampToDateString(data.updatedAt),
    appointments: data.appointments ?? [],
    medicalRecords: data.medicalRecords ?? []
  };
}

function buildPatientPayload(payload) {
  const firstName = payload.firstName?.trim() ?? "";
  const lastName = payload.lastName?.trim() ?? "";
  const dob = payload.dateOfBirth ?? payload.dob ?? "";

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    phone: payload.phone?.trim() ?? "",
    email: payload.email?.trim() ?? "",
    address: payload.address?.trim() ?? "",
    otherInfo: {
      bloodType: payload.bloodType?.trim() ?? "",
      bloodGroup: payload.bloodGroup ?? "",
      weight: Number(payload.weight ?? 0),
      height: Number(payload.height ?? 0),
      gender: payload.gender ?? "",
      dob,
      emergencyContact: payload.emergencyContact?.trim() ?? "",
      medicalCondition: payload.medicalCondition?.trim() ?? ""
    }
  };
}

async function loadFirestore() {
  const [{ db }, firestoreSdk] = await Promise.all([
    import("../../../services/firebase_config.js"),
    import("https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js")
  ]);

  return { db, ...firestoreSdk };
}

async function getLinkedRecords(firestore, collectionName, patientId) {
  const { db, collection, getDocs, query, where } = firestore;
  const recordsQuery = query(collection(db, collectionName), where("patientId", "==", patientId));
  const recordsSnapshot = await getDocs(recordsQuery);

  return recordsSnapshot.docs.map((recordSnapshot) => {
    const data = recordSnapshot.data();

    return {
      id: recordSnapshot.id,
      ...data,
      appointmentId: data.appointmentId ?? recordSnapshot.id,
      recordId: data.recordId ?? recordSnapshot.id,
      patientId: data.patientId ?? patientId,
      patientName: data.patientName ?? "Selected patient",
      doctorId: data.doctorId ?? data.diagnosedBy ?? "",
      doctorName: data.doctorName ?? data.diagnosedBy ?? "-",
      createdAt: timestampToDateString(data.createdAt),
      updatedAt: timestampToDateString(data.updatedAt),
      recordDate: timestampToDateString(data.createdAt ?? data.recordDate),
      appointmentDate: data.appointmentDate ?? "",
      appointmentTime: data.appointmentTime ?? "",
      status: data.status ?? "Pending"
    };
  });
}

async function firestoreList(filters = {}) {
  const firestore = await loadFirestore();
  const { db, collection, getDocs } = firestore;
  const snapshot = await getDocs(collection(db, "patients"));
  const search = filters.search?.trim().toLowerCase() ?? "";

  return snapshot.docs
    .map((patientSnapshot) => normalizePatientRecord(patientSnapshot.data(), patientSnapshot.id))
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
    .filter((patient) => {
      const searchable = [patient.fullName, patient.phone, patient.email, patient.patientId].join(" ").toLowerCase();
      const matchesSearch = !search || searchable.includes(search);
      const matchesGender = !filters.gender || patient.gender === filters.gender;
      const matchesBloodGroup = !filters.bloodGroup || patient.bloodGroup === filters.bloodGroup;
      return matchesSearch && matchesGender && matchesBloodGroup;
    });
}

export const patientService = {
  async list(filters = {}) {
    if (appConfig.useMockApi) {
      return httpClient.get("/patients", filters);
    }

    return firestoreList(filters);
  },

  async getById(id) {
    if (appConfig.useMockApi) {
      return httpClient.get(`/patients/${id}`);
    }

    const firestore = await loadFirestore();
    const { db, doc, getDoc } = firestore;
    const patientSnapshot = await getDoc(doc(db, "patients", id));

    if (!patientSnapshot.exists()) {
      throw new Error("Patient record was not found.");
    }

    const patient = normalizePatientRecord(patientSnapshot.data(), patientSnapshot.id);
    const [appointments, medicalRecords] = await Promise.all([
      getLinkedRecords(firestore, "appointments", patient.patientId),
      getLinkedRecords(firestore, "medicalRecords", patient.patientId)
    ]);

    return {
      ...patient,
      appointments,
      medicalRecords
    };
  },

  async create(payload, currentUser = null) {
    if (appConfig.useMockApi) {
      return httpClient.post("/patients", buildPatientPayload(payload));
    }

    const firestore = await loadFirestore();
    const { db, addDoc, collection, serverTimestamp, updateDoc } = firestore;
    const patientData = {
      ...buildPatientPayload(payload),
      createdBy: currentUser?.id ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const documentReference = await addDoc(collection(db, "patients"), patientData);
    await updateDoc(documentReference, { patientId: documentReference.id });

    return this.getById(documentReference.id);
  },

  async update(id, payload, currentUser = null) {
    if (appConfig.useMockApi) {
      return httpClient.put(`/patients/${id}`, buildPatientPayload(payload));
    }

    const firestore = await loadFirestore();
    const { db, doc, getDoc, serverTimestamp, updateDoc } = firestore;
    const existingSnapshot = await getDoc(doc(db, "patients", id));

    if (!existingSnapshot.exists()) {
      throw new Error("Patient record was not found.");
    }

    await updateDoc(doc(db, "patients", id), {
      ...buildPatientPayload(payload),
      updatedBy: currentUser?.id ?? "",
      updatedAt: serverTimestamp()
    });

    return this.getById(id);
  },

  async remove(id) {
    if (appConfig.useMockApi) {
      return httpClient.delete(`/patients/${id}`);
    }

    const { db, deleteDoc, doc } = await loadFirestore();
    await deleteDoc(doc(db, "patients", id));
    return { success: true };
  }
};
