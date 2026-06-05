import { appConfig } from "../../../config/appConfig.js";
import { httpClient } from "../../../core/api/httpClient.js";

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

function timestampToDateValue(value) {
  return timestampToDateString(value).slice(0, 10);
}

function getFullName(record = {}) {
  return record.fullName ?? `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim();
}

function normalizeAppointmentRecord(data, documentId, patientsById, doctorsById) {
  const patientId = data.patientId ?? "";
  const doctorId = data.doctorId ?? "";
  const patient = patientsById.get(patientId);
  const doctor = doctorsById.get(doctorId);

  return {
    id: documentId,
    appointmentId: data.appointmentId ?? documentId,
    patientId,
    doctorId,
    appointmentDate: timestampToDateValue(data.appointmentDate),
    appointmentTime: data.appointmentTime ?? "",
    status: data.status ?? "Pending",
    receptionistId: data.receptionistId ?? "",
    otherInfo: data.otherInfo ?? "",
    patientName: data.patientName ?? (patient ? getFullName(patient) : "Unknown patient"),
    doctorName: data.doctorName ?? (doctor ? getFullName(doctor) : "Unknown doctor"),
    createdAt: timestampToDateString(data.createdAt),
    updatedAt: timestampToDateString(data.updatedAt)
  };
}

function buildAppointmentPayload(payload, firestore, existing = {}) {
  return {
    patientId: payload.patientId,
    doctorId: payload.doctorId,
    appointmentDate: payload.appointmentDate,
    appointmentTime: payload.appointmentTime,
    status: payload.status || existing.status || "Pending",
    receptionistId: payload.receptionistId ?? existing.receptionistId ?? "",
    otherInfo: payload.otherInfo?.trim?.() ?? payload.otherInfo ?? existing.otherInfo ?? "",
    updatedAt: firestore.serverTimestamp()
  };
}

function formatAppointmentError(error) {
  const messages = {
    "permission-denied": "You do not have permission to manage appointments.",
    unavailable: "Appointment data is temporarily unavailable. Check the connection and try again."
  };

  return new Error(messages[error?.code] ?? error?.message ?? "Appointment request failed.");
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
  const directSnapshot = await getDoc(doc(db, collectionName, value));

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

async function firestoreList(filters = {}) {
  const firestore = await loadFirestore();
  const { db, collection, getDocs } = firestore;
  const [appointmentSnapshot, lookups] = await Promise.all([
    getDocs(collection(db, "appointments")),
    buildLookupMaps(firestore)
  ]);

  return appointmentSnapshot.docs
    .map((snapshot) => normalizeAppointmentRecord(snapshot.data(), snapshot.id, lookups.patientsById, lookups.doctorsById))
    .filter((appointment) => {
      const matchesDate = !filters.appointmentDate || appointment.appointmentDate === filters.appointmentDate;
      const matchesDoctor = !filters.doctorId || String(appointment.doctorId) === String(filters.doctorId);
      const matchesStatus = !filters.status || appointment.status === filters.status;
      const matchesPatient = !filters.patientId || String(appointment.patientId) === String(filters.patientId);
      const matchesReceptionist = !filters.receptionistId || String(appointment.receptionistId) === String(filters.receptionistId);
      return matchesDate && matchesDoctor && matchesStatus && matchesPatient && matchesReceptionist;
    })
    .sort((left, right) => new Date(`${left.appointmentDate}T${left.appointmentTime || "00:00"}`) - new Date(`${right.appointmentDate}T${right.appointmentTime || "00:00"}`));
}

async function firestoreGetById(appointmentId) {
  const firestore = await loadFirestore();
  const appointmentSnapshot = await findDocumentByIdOrField(firestore, "appointments", "appointmentId", appointmentId);

  if (!appointmentSnapshot) {
    throw new Error("Appointment not found.");
  }

  const lookups = await buildLookupMaps(firestore);
  return normalizeAppointmentRecord(appointmentSnapshot.data(), appointmentSnapshot.id, lookups.patientsById, lookups.doctorsById);
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

async function assertAppointmentAvailability(firestore, payload, currentAppointmentId = null) {
  const { db, collection, getDocs } = firestore;
  const appointmentSnapshot = await getDocs(collection(db, "appointments"));
  const hasConflict = appointmentSnapshot.docs.some((snapshot) => {
    const appointment = snapshot.data();
    const existingId = appointment.appointmentId ?? snapshot.id;

    if (currentAppointmentId && String(existingId) === String(currentAppointmentId)) {
      return false;
    }

    return (
      String(appointment.doctorId) === String(payload.doctorId) &&
      timestampToDateValue(appointment.appointmentDate) === payload.appointmentDate &&
      appointment.appointmentTime === payload.appointmentTime &&
      appointment.status !== "Cancelled"
    );
  });

  if (hasConflict) {
    throw new Error("This doctor already has an appointment at the selected time.");
  }
}

async function firestoreCreate(payload) {
  const firestore = await loadFirestore();
  await assertLinkedRecordsExist(firestore, payload);
  await assertAppointmentAvailability(firestore, payload);

  const { db, addDoc, collection, serverTimestamp, updateDoc } = firestore;
  const documentReference = await addDoc(collection(db, "appointments"), {
    ...buildAppointmentPayload(payload, firestore),
    createdAt: serverTimestamp()
  });
  await updateDoc(documentReference, { appointmentId: documentReference.id });

  return firestoreGetById(documentReference.id);
}

async function firestoreUpdate(id, payload) {
  const firestore = await loadFirestore();
  const appointmentSnapshot = await findDocumentByIdOrField(firestore, "appointments", "appointmentId", id);

  if (!appointmentSnapshot) {
    throw new Error("Appointment not found.");
  }

  await assertLinkedRecordsExist(firestore, payload);
  await assertAppointmentAvailability(firestore, payload, id);

  const { db, doc, updateDoc } = firestore;
  await updateDoc(doc(db, "appointments", appointmentSnapshot.id), buildAppointmentPayload(payload, firestore, appointmentSnapshot.data()));
  return firestoreGetById(appointmentSnapshot.id);
}

export const appointmentService = {
  async list(filters = {}) {
    if (appConfig.useMockApi) {
      return httpClient.get("/appointments", filters);
    }

    try {
      return await firestoreList(filters);
    } catch (error) {
      throw formatAppointmentError(error);
    }
  },

  async create(payload) {
    if (appConfig.useMockApi) {
      return httpClient.post("/appointments", payload);
    }

    try {
      return await firestoreCreate(payload);
    } catch (error) {
      throw formatAppointmentError(error);
    }
  },

  async update(id, payload) {
    if (appConfig.useMockApi) {
      return httpClient.put(`/appointments/${id}`, payload);
    }

    try {
      return await firestoreUpdate(id, payload);
    } catch (error) {
      throw formatAppointmentError(error);
    }
  }
};
