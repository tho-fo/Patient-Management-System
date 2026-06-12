import { appConfig } from "../../config/appConfig.js";
import { roles } from "../constants/roles.js";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getTimestamp(offsetDays = 0, time = "09:00:00") {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const day = date.toISOString().slice(0, 10);
  return `${day}T${time}`;
}

function getAvailabilityTimestamp(dayOffset, time = "09:00:00") {
  return getTimestamp(dayOffset, time);
}

function seedDatabase() {
  const today = getTodayDate();
  
  return {
    admins: [
      {
        adminId: "admin-001",
        firstName: "Admin",
        lastName: "User",
        email: "admin@hospital.local",
        password: "admin123",
        phone: "+1-555-0101",
        createdAt: today,
        updatedAt: today
      }
    ],
    doctors: [
      {
        doctorId: "doctor-001",
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@hospital.local",
        password: "doctor123",
        phone: "+1-555-0102",
        specialization: ["Cardiology"],
        availability: {},
        createdAt: today,
        updatedAt: today
      },
      {
        doctorId: "doctor-002",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@hospital.local",
        password: "doctor123",
        phone: "+1-555-0103",
        specialization: ["Neurology"],
        availability: {},
        createdAt: today,
        updatedAt: today
      }
    ],
    receptionists: [
      {
        receptionistId: "receptionist-001",
        firstName: "Emma",
        lastName: "Wilson",
        email: "emma.wilson@hospital.local",
        password: "receptionist123",
        phone: "+1-555-0104",
        createdAt: today,
        updatedAt: today
      }
    ],
    patients: [
      {
        patientId: "patient-001",
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@hospital.local",
        password: "patient123",
        phone: "+1-555-0105",
        gender: "Male",
        address: "123 Main St, City, State 12345",
        otherInfo: {
          bloodType: "O",
          bloodGroup: "O+",
          weight: 75,
          height: 180,
          dob: "1990-05-15"
        },
        createdAt: today,
        updatedAt: today
      },
      {
        patientId: "patient-002",
        firstName: "Jennifer",
        lastName: "Davis",
        email: "jennifer.davis@hospital.local",
        password: "patient123",
        phone: "+1-555-0106",
        gender: "Female",
        address: "456 Oak Ave, Town, State 54321",
        otherInfo: {
          bloodType: "A",
          bloodGroup: "A+",
          weight: 65,
          height: 165,
          dob: "1992-08-22"
        },
        createdAt: today,
        updatedAt: today
      }
    ],
    appointments: [],
    medicalRecords: []
  };
}

function readDatabase() {
  const existing = localStorage.getItem(appConfig.storageKeys.mockDatabase);

  if (existing) {
    return JSON.parse(existing);
  }

  const seeded = seedDatabase();
  localStorage.setItem(appConfig.storageKeys.mockDatabase, JSON.stringify(seeded));
  return seeded;
}

function writeDatabase(database) {
  localStorage.setItem(appConfig.storageKeys.mockDatabase, JSON.stringify(database));
}

function delay() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 180);
  });
}

function normalizeUser(record, role) {
  const fullName = record.fullName ?? `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim();
  const map = {
    [roles.ADMIN]: {
      id: record.adminId,
      firstName: record.firstName ?? "",
      lastName: record.lastName ?? "",
      fullName,
      email: record.email,
      phone: record.phone ?? "",
      role
    },
    [roles.DOCTOR]: {
      id: record.doctorId,
      firstName: record.firstName ?? "",
      lastName: record.lastName ?? "",
      fullName,
      email: record.email,
      phone: record.phone,
      specialization: Array.isArray(record.specialization) ? record.specialization.join(", ") : record.specialization,
      availability: record.availability ?? {},
      role
    },
    [roles.RECEPTIONIST]: {
      id: record.receptionistId,
      firstName: record.firstName ?? "",
      lastName: record.lastName ?? "",
      fullName,
      email: record.email,
      phone: record.phone,
      role
    },
    [roles.PATIENT]: {
      id: record.patientId,
      firstName: record.firstName ?? "",
      lastName: record.lastName ?? "",
      fullName,
      email: record.email,
      phone: record.phone,
      role
    }
  };

  return map[role];
}

function getFullName(record) {
  return record.fullName ?? `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim();
}

function normalizeSpecialization(value) {
  return Array.isArray(value) ? value.join(", ") : value ?? "";
}

function nextId(items, key) {
  const max = items.reduce((currentMax, item) => {
    const parts = String(item[key]).match(/\d+$/);
    return Math.max(currentMax, Number(parts?.[0] ?? 0));
  }, 0);

  return max + 1;
}

function sortByDateTime(items, dateKey, timeKey, direction = "asc") {
  return [...items].sort((left, right) => {
    const leftValue = new Date(`${left[dateKey]}T${left[timeKey] ?? "00:00"}`).getTime();
    const rightValue = new Date(`${right[dateKey]}T${right[timeKey] ?? "00:00"}`).getTime();
    return direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
  });
}

function sortByTimestamp(items, key, direction = "desc") {
  return [...items].sort((left, right) => {
    const leftValue = new Date(left[key]).getTime();
    const rightValue = new Date(right[key]).getTime();
    return direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
  });
}

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function findDoctor(database, doctorId) {
  return database.doctors.find((doctor) => String(doctor.doctorId) === String(doctorId));
}

function findPatient(database, patientId) {
  return database.patients.find((patient) => String(patient.patientId) === String(patientId));
}

function joinAppointment(database, appointment) {
  const patient = findPatient(database, appointment.patientId);
  const doctor = findDoctor(database, appointment.doctorId);

  return {
    ...appointment,
    patientName: patient ? getFullName(patient) : "Unknown patient",
    doctorName: doctor ? getFullName(doctor) : "Unknown doctor"
  };
}

function joinMedicalRecord(database, record) {
  const patient = findPatient(database, record.patientId);
  const doctor = findDoctor(database, record.doctorId);

  return {
    ...record,
    patientName: patient ? getFullName(patient) : "Unknown patient",
    doctorName: doctor ? getFullName(doctor) : "Unknown doctor"
  };
}

function buildDashboard(database) {
  const appointments = sortByDateTime(
    database.appointments.map((item) => joinAppointment(database, item)),
    "appointmentDate",
    "appointmentTime"
  );

  const today = getTodayDate();

  return {
    totalPatients: database.patients.length,
    totalDoctors: database.doctors.length,
    totalAppointments: database.appointments.length,
    todaysAppointments: database.appointments.filter(
      (appointment) => appointment.appointmentDate === today && appointment.status !== "Cancelled"
    ).length,
    pendingAppointments: database.appointments.filter((appointment) => appointment.status === "Pending").length,
    recentPatients: sortByTimestamp(database.patients, "createdAt").slice(0, 5),
    latestAppointments: appointments.slice(0, 5)
  };
}

function listPatients(database, searchParams) {
  const search = searchParams.get("search")?.toLowerCase().trim() ?? "";
  const createdDate = searchParams.get("createdDate");

  return sortByTimestamp(database.patients.map(normalizePatient), "createdAt").filter((patient) => {
    const matchesSearch =
      !search ||
      patient.fullName.toLowerCase().includes(search) ||
      String(patient.patientId).includes(search) ||
      String(patient.email ?? "").toLowerCase().includes(search) ||
      String(patient.phone ?? "").toLowerCase().includes(search);
    const matchesGender = !searchParams.get("gender") || patient.gender === searchParams.get("gender");
    const matchesBloodGroup = !searchParams.get("bloodGroup") || patient.bloodGroup === searchParams.get("bloodGroup");
    const matchesDate = !createdDate || patient.createdAt.startsWith(createdDate);
    return matchesSearch && matchesGender && matchesBloodGroup && matchesDate;
  });
}

function getPatientDetails(database, patientId) {
  const patient = findPatient(database, patientId);

  if (!patient) {
    throw createHttpError("Patient not found.", 404);
  }

  const appointments = sortByDateTime(
    database.appointments
      .filter((appointment) => String(appointment.patientId) === String(patientId))
      .map((appointment) => joinAppointment(database, appointment)),
    "appointmentDate",
    "appointmentTime",
    "desc"
  );

  const medicalRecords = sortByTimestamp(
    database.medicalRecords
      .filter((record) => String(record.patientId) === String(patientId))
      .map((record) => joinMedicalRecord(database, record)),
    "recordDate"
  );

  return {
    ...normalizePatient(patient),
    appointments,
    medicalRecords
  };
}

function listAppointments(database, searchParams) {
  const filters = {
    appointmentDate: searchParams.get("appointmentDate"),
    doctorId: searchParams.get("doctorId"),
    status: searchParams.get("status"),
    patientId: searchParams.get("patientId"),
    receptionistId: searchParams.get("receptionistId")
  };

  return sortByDateTime(
    database.appointments
      .filter((appointment) => {
        const matchesDate = !filters.appointmentDate || appointment.appointmentDate === filters.appointmentDate;
        const matchesDoctor = !filters.doctorId || String(appointment.doctorId) === String(filters.doctorId);
        const matchesStatus = !filters.status || appointment.status === filters.status;
        const matchesPatient = !filters.patientId || String(appointment.patientId) === String(filters.patientId);
        const matchesReceptionist = !filters.receptionistId || String(appointment.receptionistId) === String(filters.receptionistId);
        return matchesDate && matchesDoctor && matchesStatus && matchesPatient && matchesReceptionist;
      })
      .map((appointment) => joinAppointment(database, appointment)),
    "appointmentDate",
    "appointmentTime"
  );
}

function assertAppointmentAvailability(database, payload, currentAppointmentId = null) {
  const hasConflict = database.appointments.some((appointment) => {
    if (currentAppointmentId && String(appointment.appointmentId) === String(currentAppointmentId)) {
      return false;
    }

    return (
      String(appointment.doctorId) === String(payload.doctorId) &&
      appointment.appointmentDate === payload.appointmentDate &&
      appointment.appointmentTime === payload.appointmentTime &&
      appointment.status !== "Cancelled"
    );
  });

  if (hasConflict) {
    throw createHttpError("This doctor already has an appointment at the selected time.");
  }
}

function listMedicalRecords(database, searchParams) {
  const patientId = searchParams.get("patientId");
  const doctorId = searchParams.get("doctorId");

  return sortByTimestamp(
    database.medicalRecords
      .filter((record) => {
        const matchesPatient = !patientId || String(record.patientId) === String(patientId);
        const matchesDoctor = !doctorId || String(record.doctorId ?? record.diagnosedBy) === String(doctorId);
        return matchesPatient && matchesDoctor;
      })
      .map((record) => joinMedicalRecord(database, record)),
    "recordDate"
  );
}

function buildStaffList(database, searchParams) {
  const roleFilter = searchParams.get("role");
  const search = searchParams.get("search")?.toLowerCase().trim() ?? "";

  const staff = [
    ...database.doctors.map((doctor) => ({
      staffKey: doctor.doctorId,
      fullName: getFullName(doctor),
      role: roles.DOCTOR,
      phone: doctor.phone,
      email: doctor.email,
      specialization: normalizeSpecialization(doctor.specialization),
      availability: doctor.availability ?? {}
    })),
    ...database.receptionists.map((receptionist) => ({
      staffKey: receptionist.receptionistId,
      fullName: getFullName(receptionist),
      role: roles.RECEPTIONIST,
      phone: receptionist.phone,
      email: receptionist.email,
      specialization: ""
    }))
  ];

  return staff.filter((member) => {
    const matchesRole = !roleFilter || member.role === roleFilter;
    const matchesSearch =
      !search ||
      member.fullName.toLowerCase().includes(search) ||
      member.email.toLowerCase().includes(search);
    return matchesRole && matchesSearch;
  });
}

function getStaffMember(database, staffKey) {
  const role = staffKey.split("-")[0];
  const id = staffKey;

  if (role === roles.ADMIN) {
    throw createHttpError("Admin profiles are not managed from the staff module.", 403);
  }

  if (role === roles.DOCTOR) {
    const doctor = database.doctors.find((item) => String(item.doctorId) === String(id));
    if (!doctor) {
      throw createHttpError("Staff member not found.", 404);
    }

    return {
      staffKey: staffKey,
      fullName: getFullName(doctor),
      role,
      phone: doctor.phone,
      email: doctor.email,
      specialization: normalizeSpecialization(doctor.specialization),
      availability: doctor.availability ?? {}
    };
  }

  const receptionist = database.receptionists.find((item) => String(item.receptionistId) === String(id));
  if (!receptionist) {
    throw createHttpError("Staff member not found.", 404);
  }

  return {
    staffKey: staffKey,
    fullName: getFullName(receptionist),
    role,
    phone: receptionist.phone,
    email: receptionist.email,
    specialization: ""
  };
}

function emailExists(database, email, ignoreKey = null) {
  const accounts = [
    ...database.admins.map((admin) => ({ staffKey: admin.adminId, email: admin.email })),
    ...buildStaffList(database, new URLSearchParams())
  ];

  return accounts
    .filter((member) => member.staffKey !== ignoreKey)
    .some((member) => member.email.toLowerCase() === email.toLowerCase());
}

function buildReports(database, searchParams) {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");

  const appointments = database.appointments.filter((appointment) => {
    const matchesFrom = !from || appointment.appointmentDate >= from;
    const matchesTo = !to || appointment.appointmentDate <= to;
    const matchesStatus = !status || appointment.status === status;
    return matchesFrom && matchesTo && matchesStatus;
  });

  const joinedAppointments = appointments.map((appointment) => joinAppointment(database, appointment));
  const statusSummary = ["Pending", "Completed", "Cancelled"].map((label) => ({
    label,
    value: appointments.filter((appointment) => appointment.status === label).length
  }));
  const doctorLoad = database.doctors.map((doctor) => ({
    label: doctor.fullName,
    value: appointments.filter((appointment) => String(appointment.doctorId) === String(doctor.doctorId)).length
  }));
  const patientGrowth = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayValue = date.toISOString().slice(0, 10);
    return {
      label,
      value: database.patients.filter((patient) => patient.createdAt.startsWith(dayValue)).length
    };
  });

  return {
    totals: {
      patients: database.patients.length,
      appointments: appointments.length,
      completed: appointments.filter((appointment) => appointment.status === "Completed").length,
      pending: appointments.filter((appointment) => appointment.status === "Pending").length
    },
    statusSummary,
    doctorLoad,
    patientGrowth,
    latestAppointments: sortByDateTime(joinedAppointments, "appointmentDate", "appointmentTime", "desc").slice(0, 5)
  };
}

function getProfile(database, searchParams) {
  const role = searchParams.get("role");
  const id = searchParams.get("id");

  if (role === roles.ADMIN) {
    return normalizeUser(database.admins.find((item) => item.adminId === id), role);
  }

  if (role === roles.DOCTOR) {
    return normalizeUser(database.doctors.find((item) => item.doctorId === id), role);
  }

  if (role === roles.RECEPTIONIST) {
    return normalizeUser(database.receptionists.find((item) => item.receptionistId === id), role);
  }

  return normalizeUser(database.patients.find((item) => item.patientId === id), role);
}

function calculateAgeFromDob(dob) {
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

function normalizePatient(patient) {
  const otherInfo = patient.otherInfo ?? {};
  const fullName = getFullName(patient);
  const dob = otherInfo.dob ?? patient.dateOfBirth ?? "";

  return {
    ...patient,
    fullName,
    gender: otherInfo.gender ?? patient.gender ?? "",
    dateOfBirth: dob,
    dob,
    age: dob ? calculateAgeFromDob(dob) : patient.age ?? "",
    bloodType: otherInfo.bloodType ?? patient.bloodType ?? "",
    bloodGroup: otherInfo.bloodGroup ?? patient.bloodGroup ?? "",
    weight: otherInfo.weight ?? "",
    height: otherInfo.height ?? "",
    emergencyContact: otherInfo.emergencyContact ?? patient.emergencyContact ?? "",
    medicalCondition: otherInfo.medicalCondition ?? patient.medicalCondition ?? ""
  };
}

function updateProfile(database, payload) {
  const role = payload.role;
  const id = payload.id;

  if (role === roles.ADMIN) {
    const admin = database.admins.find((item) => item.adminId === id);
    admin.fullName = payload.fullName;
    admin.email = payload.email;
    return normalizeUser(admin, role);
  }

  if (role === roles.DOCTOR) {
    const doctor = database.doctors.find((item) => item.doctorId === id);
    doctor.fullName = payload.fullName;
    doctor.email = payload.email;
    doctor.phone = payload.phone;
    doctor.specialization = payload.specialization;
    return normalizeUser(doctor, role);
  }

  if (role === roles.RECEPTIONIST) {
    const receptionist = database.receptionists.find((item) => item.receptionistId === id);
    receptionist.fullName = payload.fullName;
    receptionist.email = payload.email;
    receptionist.phone = payload.phone;
    return normalizeUser(receptionist, role);
  }

  const patient = database.patients.find((item) => item.patientId === id);
  patient.fullName = payload.fullName;
  patient.email = payload.email;
  patient.phone = payload.phone;
  return normalizeUser(patient, role);
}

function updatePassword(database, payload) {
  const role = payload.role;
  const id = payload.id;
  let target;

  if (role === roles.ADMIN) {
    target = database.admins.find((item) => item.adminId === id);
  } else if (role === roles.DOCTOR) {
    target = database.doctors.find((item) => item.doctorId === id);
  } else if (role === roles.RECEPTIONIST) {
    target = database.receptionists.find((item) => item.receptionistId === id);
  } else {
    target = database.patients.find((item) => item.patientId === id);
  }

  if (!target || target.password !== payload.currentPassword) {
    throw createHttpError("Current password is incorrect.");
  }

  target.password = payload.newPassword;
  return { success: true };
}

async function handleAuth(method, database, pathname, payload) {
  if (
    method === "POST" &&
    ["/auth/register-patient", "/auth/register-doctor", "/auth/register-receptionist"].includes(pathname)
  ) {
    const role = pathname.endsWith("patient")
      ? roles.PATIENT
      : pathname.endsWith("doctor")
        ? roles.DOCTOR
        : roles.RECEPTIONIST;
    const collectionName = {
      [roles.PATIENT]: "patients",
      [roles.DOCTOR]: "doctors",
      [roles.RECEPTIONIST]: "receptionists"
    }[role];
    const idKey = {
      [roles.PATIENT]: "patientId",
      [roles.DOCTOR]: "doctorId",
      [roles.RECEPTIONIST]: "receptionistId"
    }[role];

    const existingEmail = [
      ...database.admins,
      ...database.doctors,
      ...database.receptionists,
      ...database.patients
    ].some((record) => record.email.toLowerCase() === payload.email.toLowerCase());

    if (existingEmail) {
      throw createHttpError("This email is already registered.");
    }

    const id = `${role}-${nextId(database[collectionName], idKey)}`;
    const record = {
      [idKey]: id,
      authUid: id,
      role,
      firstName: payload.firstName,
      lastName: payload.lastName,
      fullName: `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim(),
      phone: payload.phone,
      email: payload.email,
      password: payload.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (role === roles.PATIENT) {
      record.address = payload.address ?? "";
      record.gender = payload.gender ?? "";
      record.dateOfBirth = payload.dateOfBirth ?? payload.dob ?? "";
      record.emergencyContact = payload.emergencyContact ?? "";
      record.medicalCondition = payload.medicalCondition ?? "";
      record.otherInfo = {
        bloodType: payload.bloodType ?? "",
        bloodGroup: payload.bloodGroup ?? "",
        weight: Number(payload.weight ?? 0),
        height: Number(payload.height ?? 0),
        gender: payload.gender ?? "",
        dob: payload.dateOfBirth ?? payload.dob ?? "",
        emergencyContact: payload.emergencyContact ?? "",
        medicalCondition: payload.medicalCondition ?? ""
      };
    }

    if (role === roles.DOCTOR) {
      record.gender = payload.gender ?? "";
      record.specialization = [payload.specialization].filter(Boolean);
      record.availability = {};
    }

    database[collectionName].push(record);
    writeDatabase(database);

    return {
      token: `mock-token-${role}-${Date.now()}`,
      user: normalizeUser(record, role)
    };
  }

  if (method === "POST" && pathname === "/auth/login") {
    const candidates = [
      ...database.admins.map((item) => ({ record: item, role: roles.ADMIN })),
      ...database.doctors.map((item) => ({ record: item, role: roles.DOCTOR })),
      ...database.receptionists.map((item) => ({ record: item, role: roles.RECEPTIONIST })),
      ...database.patients.map((item) => ({ record: item, role: roles.PATIENT }))
    ];

    const match = candidates.find(
      (candidate) =>
        candidate.record.email.toLowerCase() === payload.email.toLowerCase() &&
        candidate.record.password === payload.password
    );

    if (!match) {
      throw createHttpError("Invalid email or password.", 401);
    }

    return {
      token: `mock-token-${match.role}-${Date.now()}`,
      user: normalizeUser(match.record, match.role)
    };
  }

  if (method === "POST" && pathname === "/auth/logout") {
    return { success: true };
  }

  throw createHttpError("Unsupported authentication route.", 404);
}

function updateStaffRecord(database, staffKey, payload) {
  const currentRole = staffKey.split("-")[0];
  const currentId = staffKey;

  if (currentRole === payload.role) {
    if (currentRole === roles.ADMIN) {
      const admin = database.admins.find((item) => item.adminId === currentId);
      const [firstName = "", ...lastNameParts] = payload.fullName.split(" ");
      admin.firstName = firstName;
      admin.lastName = lastNameParts.join(" ");
      admin.fullName = payload.fullName;
      admin.email = payload.email;
      admin.phone = payload.phone;
      if (payload.password) {
        admin.password = payload.password;
      }
      return { staffKey: staffKey };
    }

    if (currentRole === roles.DOCTOR) {
      const doctor = database.doctors.find((item) => item.doctorId === currentId);
      const [firstName = "", ...lastNameParts] = payload.fullName.split(" ");
      doctor.firstName = firstName;
      doctor.lastName = lastNameParts.join(" ");
      doctor.fullName = payload.fullName;
      doctor.email = payload.email;
      doctor.phone = payload.phone;
      doctor.specialization = payload.specialization.split(",").map((item) => item.trim()).filter(Boolean);
      if (payload.password) {
        doctor.password = payload.password;
      }
      return { staffKey: staffKey };
    }

    const receptionist = database.receptionists.find((item) => item.receptionistId === currentId);
    const [firstName = "", ...lastNameParts] = payload.fullName.split(" ");
    receptionist.firstName = firstName;
    receptionist.lastName = lastNameParts.join(" ");
    receptionist.fullName = payload.fullName;
    receptionist.email = payload.email;
    receptionist.phone = payload.phone;
    if (payload.password) {
      receptionist.password = payload.password;
    }
    return { staffKey: staffKey };
  }

  if (currentRole === roles.ADMIN) {
    throw createHttpError("Admin role changes are not available from the frontend.");
  } else if (currentRole === roles.DOCTOR) {
    database.doctors = database.doctors.filter((item) => item.doctorId !== currentId);
  } else {
    database.receptionists = database.receptionists.filter((item) => item.receptionistId !== currentId);
  }

  if (payload.role === roles.DOCTOR) {
    const doctorId = `doctor-${nextId(database.doctors, "doctorId")}`;
    const [firstName = "", ...lastNameParts] = payload.fullName.split(" ");
    database.doctors.push({
      doctorId,
      firstName,
      lastName: lastNameParts.join(" "),
      fullName: payload.fullName,
      specialization: payload.specialization.split(",").map((item) => item.trim()).filter(Boolean),
      availability: {},
      phone: payload.phone,
      email: payload.email,
      password: payload.password || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { staffKey: doctorId };
  }

  const receptionistId = `receptionist-${nextId(database.receptionists, "receptionistId")}`;
  const [firstName = "", ...lastNameParts] = payload.fullName.split(" ");
  database.receptionists.push({
    receptionistId,
    firstName,
    lastName: lastNameParts.join(" "),
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    password: payload.password || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return { staffKey: receptionistId };
}

export const mockApi = {
  async request(method, url, payload = null) {
    await delay();

    const database = readDatabase();
    const parsedUrl = new URL(url, "http://localhost");
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

    if (pathname.startsWith("/auth/")) {
      return handleAuth(method, database, pathname, payload);
    }

    if (method === "GET" && pathname === "/dashboard/summary") {
      return buildDashboard(database);
    }

    if (method === "GET" && pathname === "/patients") {
      return listPatients(database, searchParams);
    }

    if (method === "POST" && pathname === "/patients") {
      const newId = `patient-${nextId(database.patients, "patientId")}`;
      const patient = {
        patientId: newId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName: payload.fullName ?? `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim(),
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        otherInfo: payload.otherInfo ?? {},
        createdAt: new Date().toISOString()
      };
      database.patients.push(patient);
      writeDatabase(database);
      return patient;
    }

    if (pathname.startsWith("/patients/")) {
      const patientId = pathname.split("/")[2];

      if (method === "GET") {
        return getPatientDetails(database, patientId);
      }

      if (method === "PUT") {
        const patient = findPatient(database, patientId);
        if (!patient) {
          throw createHttpError("Patient not found.", 404);
        }
        patient.firstName = payload.firstName;
        patient.lastName = payload.lastName;
        patient.fullName = payload.fullName ?? `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim();
        patient.phone = payload.phone;
        patient.email = payload.email;
        patient.address = payload.address;
        patient.otherInfo = payload.otherInfo ?? {};
        patient.updatedAt = new Date().toISOString();
        writeDatabase(database);
        return getPatientDetails(database, patientId);
      }

      if (method === "DELETE") {
        const hasHistory = database.medicalRecords.some(
          (record) => String(record.patientId) === String(patientId)
        );

        if (hasHistory) {
          throw createHttpError("Patients with medical history cannot be deleted from this interface.");
        }

        database.patients = database.patients.filter(
          (patient) => String(patient.patientId) !== String(patientId)
        );
        database.appointments = database.appointments.filter(
          (appointment) => String(appointment.patientId) !== String(patientId)
        );
        writeDatabase(database);
        return { success: true };
      }
    }

    if (method === "GET" && pathname === "/appointments") {
      return listAppointments(database, searchParams);
    }

    if (method === "POST" && pathname === "/appointments") {
      assertAppointmentAvailability(database, payload);
      const newId = nextId(database.appointments, "appointmentId");
      const appointment = {
        appointmentId: newId,
        patientId: payload.patientId,
        doctorId: payload.doctorId,
        appointmentDate: payload.appointmentDate,
        appointmentTime: payload.appointmentTime,
        status: payload.status || "Pending",
        receptionistId: payload.receptionistId ?? "",
        otherInfo: payload.otherInfo ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      database.appointments.push(appointment);
      writeDatabase(database);
      return joinAppointment(database, appointment);
    }

    if (pathname.startsWith("/appointments/")) {
      const appointmentId = pathname.split("/")[2];
      const appointment = database.appointments.find((item) => String(item.appointmentId) === String(appointmentId));

      if (!appointment) {
        throw createHttpError("Appointment not found.", 404);
      }

      if (method === "PUT") {
        assertAppointmentAvailability(database, payload, appointmentId);
        appointment.patientId = payload.patientId;
        appointment.doctorId = payload.doctorId;
        appointment.appointmentDate = payload.appointmentDate;
        appointment.appointmentTime = payload.appointmentTime;
        appointment.status = payload.status;
        appointment.otherInfo = payload.otherInfo ?? appointment.otherInfo ?? "";
        appointment.updatedAt = new Date().toISOString();
        writeDatabase(database);
        return joinAppointment(database, appointment);
      }
    }

    if (method === "GET" && pathname === "/medical-records") {
      return listMedicalRecords(database, searchParams);
    }

    if (method === "POST" && pathname === "/medical-records") {
      const patient = findPatient(database, payload.patientId);
      const doctor = findDoctor(database, payload.doctorId);

      if (!patient || !doctor) {
        throw createHttpError("Patient or doctor could not be found.");
      }

      const newId = nextId(database.medicalRecords, "recordId");
      const record = {
        recordId: newId,
        patientId: payload.patientId,
        doctorId: payload.doctorId,
        diagnosedBy: payload.doctorId,
        diagnosis: payload.diagnosis,
        treatment: payload.treatment,
        status: payload.status || "Active",
        recordDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      database.medicalRecords.push(record);
      writeDatabase(database);
      return joinMedicalRecord(database, record);
    }

    if (pathname.startsWith("/medical-records/")) {
      const recordId = pathname.split("/")[2];
      const record = database.medicalRecords.find((item) => String(item.recordId) === String(recordId));

      if (!record) {
        throw createHttpError("Medical record not found.", 404);
      }

      if (method === "PUT") {
        if (
          payload.currentUserRole === roles.DOCTOR &&
          String(record.doctorId ?? record.diagnosedBy) !== String(payload.currentUserId)
        ) {
          throw createHttpError("Doctors can only edit medical records diagnosed by them.", 403);
        }

        record.patientId = payload.patientId;
        record.doctorId = payload.doctorId;
        record.diagnosedBy = payload.doctorId;
        record.diagnosis = payload.diagnosis;
        record.treatment = payload.treatment;
        record.status = payload.status || record.status || "Active";
        record.updatedAt = new Date().toISOString();
        writeDatabase(database);
        return joinMedicalRecord(database, record);
      }
    }

    if (method === "PUT" && pathname.match(/^\/doctors\/[^/]+\/availability$/)) {
      const doctorId = pathname.split("/")[2];
      const doctor = findDoctor(database, doctorId);

      if (!doctor) {
        throw createHttpError("Doctor not found.", 404);
      }

      doctor.availability = payload.availability ?? {};
      doctor.updatedAt = new Date().toISOString();
      writeDatabase(database);
      return {
        staffKey: doctor.doctorId,
        fullName: getFullName(doctor),
        role: roles.DOCTOR,
        phone: doctor.phone,
        email: doctor.email,
        specialization: normalizeSpecialization(doctor.specialization),
        availability: doctor.availability
      };
    }

    if (method === "GET" && pathname === "/staff") {
      return buildStaffList(database, searchParams);
    }

    if (method === "POST" && pathname === "/staff") {
      if (emailExists(database, payload.email)) {
        throw createHttpError("A staff account with this email already exists.");
      }

      if (payload.role === roles.ADMIN) {
        throw createHttpError("Admin accounts cannot be created from the frontend.");
      }

      if (payload.role === roles.DOCTOR) {
        const doctorId = `doctor-${nextId(database.doctors, "doctorId")}`;
        const [firstName = "", ...lastNameParts] = payload.fullName.split(" ");
        database.doctors.push({
          doctorId,
          firstName,
          lastName: lastNameParts.join(" "),
          fullName: payload.fullName,
          specialization: payload.specialization.split(",").map((item) => item.trim()).filter(Boolean),
          availability: {},
          phone: payload.phone,
          email: payload.email,
          password: payload.password,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        writeDatabase(database);
        return getStaffMember(database, doctorId);
      }

      const receptionistId = `receptionist-${nextId(database.receptionists, "receptionistId")}`;
      const [firstName = "", ...lastNameParts] = payload.fullName.split(" ");
      database.receptionists.push({
        receptionistId,
        firstName,
        lastName: lastNameParts.join(" "),
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        password: payload.password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      writeDatabase(database);
      return getStaffMember(database, receptionistId);
    }

    if (pathname.startsWith("/staff/")) {
      const staffKey = pathname.split("/")[2];

      if (method === "GET") {
        return getStaffMember(database, staffKey);
      }

      if (method === "PUT") {
        if (emailExists(database, payload.email, staffKey)) {
          throw createHttpError("A staff account with this email already exists.");
        }

        const result = updateStaffRecord(database, staffKey, payload);
        writeDatabase(database);
        return getStaffMember(database, result.staffKey);
      }

      if (method === "DELETE") {
        const role = staffKey.split("-")[0];
        const id = staffKey;

        if (role === roles.ADMIN) {
          throw createHttpError("Admin profiles are not managed from the staff module.", 403);
        } else if (role === roles.DOCTOR) {
          const hasLinks =
            database.appointments.some((appointment) => String(appointment.doctorId) === String(id)) ||
            database.medicalRecords.some((record) => String(record.doctorId ?? record.diagnosedBy) === String(id));
          if (hasLinks) {
            throw createHttpError("Doctors with appointments or medical records cannot be deleted.");
          }
          database.doctors = database.doctors.filter((item) => item.doctorId !== id);
        } else {
          database.receptionists = database.receptionists.filter((item) => item.receptionistId !== id);
        }

        writeDatabase(database);
        return { success: true };
      }
    }

    if (method === "GET" && pathname === "/reports/analytics") {
      return buildReports(database, searchParams);
    }

    if (method === "GET" && pathname === "/settings/profile") {
      return getProfile(database, searchParams);
    }

    if (method === "PUT" && pathname === "/settings/profile") {
      const profile = updateProfile(database, payload);
      writeDatabase(database);
      return profile;
    }

    if (method === "PUT" && pathname === "/settings/password") {
      const result = updatePassword(database, payload);
      writeDatabase(database);
      return result;
    }

    throw createHttpError("The requested mock endpoint does not exist.", 404);
  }
};
