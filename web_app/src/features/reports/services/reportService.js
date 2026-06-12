import { appConfig } from "../../../config/appConfig.js";
import { httpClient } from "../../../core/api/httpClient.js";

function buildDateString(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString().slice(0, 10);
  }

  return "";
}

function normalizeRecord(record = {}, id = "") {
  return {
    id,
    appointmentId: record.appointmentId ?? id,
    patientId: record.patientId ?? "",
    doctorId: record.doctorId ?? "",
    appointmentDate: buildDateString(record.appointmentDate),
    appointmentTime: record.appointmentTime ?? "",
    status: record.status ?? "Pending",
    patientName: record.patientName ?? "Unknown patient",
    doctorName: record.doctorName ?? "Unknown doctor",
    createdAt: buildDateString(record.createdAt)
  };
}

function buildLookup(items, fieldName) {
  return items.reduce((map, item) => {
    if (item.id) {
      map.set(item.id, item);
    }

    if (item[fieldName]) {
      map.set(item[fieldName], item);
    }

    return map;
  }, new Map());
}

function inDateRange(value, from, to) {
  if (!value) {
    return false;
  }

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return false;
  }

  if (from && new Date(value) < new Date(from)) {
    return false;
  }

  if (to && new Date(value) > new Date(to)) {
    return false;
  }

  return true;
}

function summarizeAppointments(appointments = []) {
  const statusMap = new Map();
  appointments.forEach((appointment) => {
    const label = appointment.status || "Pending";
    statusMap.set(label, (statusMap.get(label) || 0) + 1);
  });

  return Array.from(statusMap.entries()).map(([label, value]) => ({ label, value }));
}

function buildDoctorLoad(appointments = [], doctorsById = new Map()) {
  const counts = new Map();

  appointments.forEach((appointment) => {
    const doctorId = appointment.doctorId || "";
    const name = appointment.doctorName || doctorsById.get(doctorId)?.fullName || "Unknown doctor";
    counts.set(name, (counts.get(name) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
}

function buildPatientGrowth(patients = [], filters = {}) {
  const from = filters.from ? new Date(filters.from) : null;
  const to = filters.to ? new Date(filters.to) : null;

  const growthMap = new Map();
  const range = [];
  const now = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    const label = date.toISOString().slice(0, 10);
    range.push(label);
    growthMap.set(label, 0);
  }

  patients.forEach((patient) => {
    const date = buildDateString(patient.createdAt || patient.createdAt);
    if (!date) {
      return;
    }

    if (from && new Date(date) < from) {
      return;
    }

    if (to && new Date(date) > to) {
      return;
    }

    if (growthMap.has(date)) {
      growthMap.set(date, growthMap.get(date) + 1);
    }
  });

  return range.map((label) => ({ label, value: growthMap.get(label) ?? 0 }));
}

async function loadFirestore() {
  const [{ db }, firestoreSdk] = await Promise.all([
    import("../../../services/firebase_config.js"),
    import("https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js")
  ]);

  return { db, ...firestoreSdk };
}

async function firestoreGetAnalytics(filters = {}) {
  const firestore = await loadFirestore();
  const { db, collection, getDocs } = firestore;

  const [patientSnapshot, doctorSnapshot, appointmentSnapshot] = await Promise.all([
    getDocs(collection(db, "patients")),
    getDocs(collection(db, "doctors")),
    getDocs(collection(db, "appointments"))
  ]);

  const patients = patientSnapshot.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
  const doctors = doctorSnapshot.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
  const doctorsById = buildLookup(doctors, "doctorId");
  const appointments = appointmentSnapshot.docs
    .map((snapshot) => normalizeRecord(snapshot.data(), snapshot.id))
    .filter((appointment) => {
      if (filters.status && filters.status !== "") {
        if (appointment.status !== filters.status) {
          return false;
        }
      }

      if (filters.from || filters.to) {
        return inDateRange(appointment.appointmentDate, filters.from, filters.to);
      }

      return true;
    });

  const filteredAppointments = appointments.sort((left, right) => new Date(`${right.appointmentDate}T${right.appointmentTime || "00:00"}`) - new Date(`${left.appointmentDate}T${left.appointmentTime || "00:00"}`));

  return {
    totals: {
      patients: patients.length,
      appointments: filteredAppointments.length,
      completed: filteredAppointments.filter((appointment) => appointment.status === "Completed").length,
      pending: filteredAppointments.filter((appointment) => appointment.status === "Pending").length
    },
    statusSummary: summarizeAppointments(filteredAppointments),
    doctorLoad: buildDoctorLoad(filteredAppointments, doctorsById),
    patientGrowth: buildPatientGrowth(patients, filters),
    latestAppointments: filteredAppointments.slice(0, 5)
  };
}

export const reportService = {
  async getAnalytics(filters = {}) {
    if (appConfig.useMockApi) {
      return httpClient.get("/reports/analytics", filters);
    }

    return firestoreGetAnalytics(filters);
  }
};
