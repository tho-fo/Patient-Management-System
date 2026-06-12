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

function dateValue(value) {
  return timestampToDateString(value).slice(0, 10);
}

function getFullName(record = {}) {
  return record.fullName ?? `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim();
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDayValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function toDayLabel(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function safeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

async function loadFirestore() {
  try {
    const [{ db }, firestoreSdk] = await Promise.all([
      import("../../../services/firebase_config.js"),
      import("https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js")
    ]);

    return { db, ...firestoreSdk };
  } catch (error) {
    console.warn("Dashboard data source could not be loaded:", error);
    return null;
  }
}

async function readCollection(firestore, collectionName) {
  if (!firestore) {
    return [];
  }

  const { db, collection, getDocs } = firestore;

  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((documentSnapshot) => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data()
    }));
  } catch (error) {
    console.warn(`Dashboard could not read ${collectionName}.`, error);
    return [];
  }
}

function buildLookupMap(items, fieldName) {
  const map = new Map();

  items.forEach((item) => {
    map.set(item.id, item);
    if (item[fieldName]) {
      map.set(item[fieldName], item);
    }
  });

  return map;
}

function normalizePatient(patient) {
  const otherInfo = patient.otherInfo ?? {};

  return {
    ...patient,
    patientId: patient.patientId ?? patient.id,
    fullName: getFullName(patient),
    gender: otherInfo.gender ?? patient.gender ?? "",
    age: safeNumber(patient.age),
    phone: patient.phone ?? "",
    address: patient.address ?? "",
    createdAt: timestampToDateString(patient.createdAt)
  };
}

function normalizeAppointment(appointment, patientsById, doctorsById) {
  const patientId = appointment.patientId ?? "";
  const doctorId = appointment.doctorId ?? "";
  const patient = patientsById.get(patientId);
  const doctor = doctorsById.get(doctorId);

  return {
    ...appointment,
    appointmentId: appointment.appointmentId ?? appointment.id,
    patientId,
    doctorId,
    patientName: appointment.patientName ?? (patient ? getFullName(patient) : "Unknown patient"),
    doctorName: appointment.doctorName ?? (doctor ? getFullName(doctor) : "Unknown doctor"),
    appointmentDate: dateValue(appointment.appointmentDate) || appointment.appointmentDate || "",
    appointmentTime: appointment.appointmentTime ?? "",
    status: appointment.status ?? "Pending",
    createdAt: timestampToDateString(appointment.createdAt),
    updatedAt: timestampToDateString(appointment.updatedAt)
  };
}

function sortAppointments(appointments, direction = "asc") {
  return [...appointments].sort((left, right) => {
    const leftValue = new Date(`${left.appointmentDate}T${left.appointmentTime || "00:00"}`).getTime();
    const rightValue = new Date(`${right.appointmentDate}T${right.appointmentTime || "00:00"}`).getTime();
    return direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
  });
}

function sortPatients(patients) {
  return [...patients].sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
}

function scopeAppointments(appointments, currentUser) {
  if (!currentUser) {
    return appointments;
  }

  if (currentUser.role === roles.DOCTOR) {
    return appointments.filter((appointment) => String(appointment.doctorId) === String(currentUser.id));
  }

  if (currentUser.role === roles.PATIENT) {
    return appointments.filter((appointment) => String(appointment.patientId) === String(currentUser.id));
  }

  if (currentUser.role === roles.RECEPTIONIST) {
    return appointments.filter((appointment) => String(appointment.receptionistId ?? "") === String(currentUser.id));
  }

  return appointments;
}

function scopePatients(patients, appointments, currentUser) {
  if (!currentUser) {
    return patients;
  }

  if (currentUser.role === roles.PATIENT) {
    return patients.filter((patient) => String(patient.patientId) === String(currentUser.id));
  }

  if (currentUser.role === roles.DOCTOR) {
    const patientIds = new Set(appointments.map((appointment) => String(appointment.patientId)));
    return patients.filter((patient) => patientIds.has(String(patient.patientId)));
  }

  return patients;
}

async function getDashboardData(currentUser = null) {
  try {
    const firestore = await loadFirestore();
    const [patients, doctors, receptionists, appointments, records] = await Promise.all([
      readCollection(firestore, "patients"),
      readCollection(firestore, "doctors"),
      readCollection(firestore, "receptionists"),
      readCollection(firestore, "appointments"),
      readCollection(firestore, "medicalRecords")
    ]);
    const normalizedPatients = patients.map(normalizePatient);
    const patientsById = buildLookupMap(normalizedPatients, "patientId");
    const doctorsById = buildLookupMap(doctors, "doctorId");
    const normalizedAppointments = appointments.map((appointment) => normalizeAppointment(appointment, patientsById, doctorsById));
    const scopedAppointments = scopeAppointments(normalizedAppointments, currentUser);
    const scopedPatients = scopePatients(normalizedPatients, scopedAppointments, currentUser);

    return {
      currentUser,
      patients: normalizedPatients,
      doctors,
      receptionists,
      records,
      appointments: normalizedAppointments,
      scopedPatients,
      scopedAppointments
    };
  } catch (error) {
    console.warn("Dashboard could not load data:", error);
    return {
      currentUser,
      patients: [],
      doctors: [],
      receptionists: [],
      records: [],
      appointments: [],
      scopedPatients: [],
      scopedAppointments: []
    };
  }
}

function getVisiblePatients(data) {
  if (data.currentUser?.role === roles.ADMIN || data.currentUser?.role === roles.RECEPTIONIST || !data.currentUser) {
    return data.patients;
  }

  if (data.currentUser.role === roles.PATIENT && data.scopedPatients.length === 0) {
    return [{
      patientId: data.currentUser.id,
      fullName: data.currentUser.fullName,
      phone: data.currentUser.phone ?? "",
      createdAt: ""
    }];
  }

  return data.scopedPatients;
}

function buildSummary(data) {
  const today = getTodayDate();
  const latestAppointments = sortAppointments(data.scopedAppointments, "asc").slice(0, 5);
  const visiblePatients = getVisiblePatients(data);

  return {
    totalPatients: visiblePatients.length,
    totalDoctors: data.doctors.length,
    totalReceptionists: data.receptionists.length,
    totalAppointments: data.scopedAppointments.length,
    todaysAppointments: data.scopedAppointments.filter(
      (appointment) => appointment.appointmentDate === today && appointment.status !== "Cancelled"
    ).length,
    pendingAppointments: data.scopedAppointments.filter((appointment) => appointment.status === "Pending").length,
    recentPatients: sortPatients(visiblePatients).slice(0, 5),
    latestAppointments
  };
}

function buildAppointmentTrends(data) {
  const trends = Array.from({ length: 7 }, (_, index) => {
    const value = getDayValue(index - 6);
    return {
      label: toDayLabel(value),
      value: data.scopedAppointments.filter((appointment) => appointment.appointmentDate === value).length
    };
  });

  return { trends };
}

function buildStaffDistribution(data) {
  const counts = data.doctors.reduce((summary, doctor) => {
    const specialization = Array.isArray(doctor.specialization)
      ? doctor.specialization.join(", ")
      : doctor.specialization || "General";
    summary.set(specialization, (summary.get(specialization) ?? 0) + 1);
    return summary;
  }, new Map());

  return {
    distribution: [...counts.entries()].map(([label, value]) => ({ label, value }))
  };
}

function buildPatientGrowth(data) {
  const growth = Array.from({ length: 7 }, (_, index) => {
    const value = getDayValue(index - 6);
    return {
      label: toDayLabel(value),
      value: data.patients.filter((patient) => dateValue(patient.createdAt) === value).length
    };
  });

  return { growth };
}

function buildAuditLogs(limit) {
  return {
    logs: [
      {
        action: "Dashboard refreshed",
        userEmail: "system",
        timestamp: new Date().toISOString(),
        details: "Dashboard data was calculated from Firebase collections."
      }
    ].slice(0, limit)
  };
}

export const dashboardService = {
  async getSummary(currentUser = null) {
    if (appConfig.useMockApi) {
      return httpClient.get("/dashboard/summary");
    }

    return buildSummary(await getDashboardData(currentUser));
  },

  async getAppointmentTrends(currentUser = null) {
    if (appConfig.useMockApi) {
      return httpClient.get("/dashboard/appointment-trends");
    }

    return buildAppointmentTrends(await getDashboardData(currentUser));
  },

  async getStaffDistribution() {
    if (appConfig.useMockApi) {
      return httpClient.get("/dashboard/staff-distribution");
    }

    return buildStaffDistribution(await getDashboardData());
  },

  async getPatientGrowth() {
    if (appConfig.useMockApi) {
      return httpClient.get("/dashboard/patient-growth");
    }

    return buildPatientGrowth(await getDashboardData());
  },

  async getAuditLogs(limit = 10) {
    if (appConfig.useMockApi) {
      return httpClient.get(`/dashboard/audit-logs?limit=${limit}`);
    }

    return buildAuditLogs(limit);
  },

  async getTodayAppointments(currentUser = null) {
    if (appConfig.useMockApi) {
      return httpClient.get("/dashboard/today-appointments");
    }

    const data = await getDashboardData(currentUser);
    const today = getTodayDate();

    return {
      appointments: sortAppointments(data.scopedAppointments).filter(
        (appointment) => appointment.appointmentDate === today && appointment.status !== "Cancelled"
      )
    };
  },

  async getPendingAppointments(currentUser = null) {
    if (appConfig.useMockApi) {
      return httpClient.get("/dashboard/pending-appointments");
    }

    const data = await getDashboardData(currentUser);

    return {
      count: data.scopedAppointments.filter((appointment) => appointment.status === "Pending").length
    };
  }
};
