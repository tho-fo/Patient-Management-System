import { appConfig } from "../../../config/appConfig.js";
import { httpClient } from "../../../core/api/httpClient.js";
import { roles } from "../../../core/constants/roles.js";

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

function getFullName(record = {}) {
  return record.fullName ?? `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim();
}

function normalizeRecord(data, documentId, patientsById = new Map(), doctorsById = new Map()) {
  const patientId = data.patientId ?? "";
  const doctorId = data.doctorId ?? data.diagnosedBy ?? "";
  const patient = patientsById.get(patientId);
  const doctor = doctorsById.get(doctorId);

  return {
    id: documentId,
    recordId: data.recordId ?? documentId,
    patientId,
    doctorId,
    diagnosedBy: data.diagnosedBy ?? doctorId,
    patientName: data.patientName ?? (patient ? getFullName(patient) : "Unknown patient"),
    doctorName: data.doctorName ?? (doctor ? getFullName(doctor) : "Unknown doctor"),
    diagnosis: data.diagnosis ?? "",
    treatment: data.treatment ?? "",
    status: data.status ?? "Active",
    recordDate: timestampToDateString(data.recordDate ?? data.createdAt),
    createdAt: timestampToDateString(data.createdAt),
    updatedAt: timestampToDateString(data.updatedAt)
  };
}

function buildRecordPayload(payload, firestore, existing = {}) {
  return {
    patientId: payload.patientId,
    doctorId: payload.doctorId,
    diagnosedBy: payload.doctorId,
    diagnosis: payload.diagnosis?.trim() ?? "",
    treatment: payload.treatment?.trim() ?? "",
    status: payload.status || existing.status || "Active",
    updatedAt: firestore.serverTimestamp()
  };
}

function formatRecordError(error) {
  const messages = {
    "permission-denied": "You do not have permission to manage medical records.",
    unavailable: "Medical record data is temporarily unavailable. Check the connection and try again."
  };

  return new Error(messages[error?.code] ?? error?.message ?? "Medical record request failed.");
}

async function loadFirestore() {
  const [{ db }, firestoreSdk] = await Promise.all([
    import("../../../services/firebase_config.js"),
    import("https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js")
  ]);

  return { db, ...firestoreSdk };
}

async function findDocumentByIdOrField(firestore, collectionName, fieldName, value) {
  const { db, collection, doc, getDoc, getDocs, query, where } = firestore;
  const directSnapshot = await getDoc(doc(db, collectionName, String(value)));

  if (directSnapshot.exists()) {
    return directSnapshot;
  }

  const fieldSnapshot = await getDocs(query(collection(db, collectionName), where(fieldName, "==", value)));
  return fieldSnapshot.docs[0] ?? null;
}

async function buildLookupMaps(firestore) {
  const { db, collection, getDocs } = firestore;
  const [patientSnapshot, doctorSnapshot] = await Promise.all([
    getDocs(collection(db, "patients")),
    getDocs(collection(db, "doctors"))
  ]);
  const patientsById = new Map();
  const doctorsById = new Map();

  patientSnapshot.docs.forEach((snapshot) => {
    const data = snapshot.data();
    patientsById.set(snapshot.id, data);
    if (data.patientId) {
      patientsById.set(data.patientId, data);
    }
  });

  doctorSnapshot.docs.forEach((snapshot) => {
    const data = snapshot.data();
    doctorsById.set(snapshot.id, data);
    if (data.doctorId) {
      doctorsById.set(data.doctorId, data);
    }
  });

  return { patientsById, doctorsById };
}

async function assertLinkedRecordsExist(firestore, payload) {
  const [patientSnapshot, doctorSnapshot] = await Promise.all([
    findDocumentByIdOrField(firestore, "patients", "patientId", payload.patientId),
    findDocumentByIdOrField(firestore, "doctors", "doctorId", payload.doctorId)
  ]);

  if (!patientSnapshot || !doctorSnapshot) {
    throw new Error("Patient or doctor could not be found.");
  }
}

async function firestoreList(filters = {}) {
  const firestore = await loadFirestore();
  const { db, collection, getDocs } = firestore;
  const [recordSnapshot, lookups] = await Promise.all([
    getDocs(collection(db, "medicalRecords")),
    buildLookupMaps(firestore)
  ]);

  return recordSnapshot.docs
    .map((snapshot) => normalizeRecord(snapshot.data(), snapshot.id, lookups.patientsById, lookups.doctorsById))
    .filter((record) => {
      const matchesPatient = !filters.patientId || String(record.patientId) === String(filters.patientId);
      const matchesDoctor = !filters.doctorId || String(record.doctorId ?? record.diagnosedBy) === String(filters.doctorId);
      return matchesPatient && matchesDoctor;
    })
    .sort((left, right) => new Date(right.recordDate || 0) - new Date(left.recordDate || 0));
}

async function firestoreCreate(payload) {
  const firestore = await loadFirestore();
  await assertLinkedRecordsExist(firestore, payload);

  const { db, addDoc, collection, serverTimestamp, updateDoc } = firestore;
  const documentReference = await addDoc(collection(db, "medicalRecords"), {
    ...buildRecordPayload(payload, firestore),
    recordDate: serverTimestamp(),
    createdAt: serverTimestamp()
  });
  await updateDoc(documentReference, { recordId: documentReference.id });

  const lookups = await buildLookupMaps(firestore);
  const snapshot = await firestore.getDoc(documentReference);
  return normalizeRecord(snapshot.data(), snapshot.id, lookups.patientsById, lookups.doctorsById);
}

async function firestoreUpdate(id, payload, currentUser = null) {
  const firestore = await loadFirestore();
  const recordSnapshot = await findDocumentByIdOrField(firestore, "medicalRecords", "recordId", id);

  if (!recordSnapshot) {
    throw new Error("Medical record not found.");
  }

  const existing = recordSnapshot.data();
  const existingDoctorId = existing.doctorId ?? existing.diagnosedBy;
  if (currentUser?.role === roles.DOCTOR && String(existingDoctorId) !== String(currentUser.id)) {
    throw new Error("Doctors can only edit medical records diagnosed by them.");
  }

  await assertLinkedRecordsExist(firestore, payload);

  const { db, doc, updateDoc } = firestore;
  await updateDoc(doc(db, "medicalRecords", recordSnapshot.id), buildRecordPayload(payload, firestore, existing));

  const lookups = await buildLookupMaps(firestore);
  const updatedSnapshot = await firestore.getDoc(doc(db, "medicalRecords", recordSnapshot.id));
  return normalizeRecord(updatedSnapshot.data(), updatedSnapshot.id, lookups.patientsById, lookups.doctorsById);
}

export const medicalRecordService = {
  async list(filters = {}) {
    if (appConfig.useMockApi) {
      return httpClient.get("/medical-records", filters);
    }

    try {
      return await firestoreList(filters);
    } catch (error) {
      throw formatRecordError(error);
    }
  },

  async create(payload) {
    if (appConfig.useMockApi) {
      return httpClient.post("/medical-records", payload);
    }

    try {
      return await firestoreCreate(payload);
    } catch (error) {
      throw formatRecordError(error);
    }
  },

  async update(id, payload, currentUser = null) {
    if (appConfig.useMockApi) {
      return httpClient.put(`/medical-records/${id}`, {
        ...payload,
        currentUserId: currentUser?.id ?? "",
        currentUserRole: currentUser?.role ?? ""
      });
    }

    try {
      return await firestoreUpdate(id, payload, currentUser);
    } catch (error) {
      throw formatRecordError(error);
    }
  }
};
