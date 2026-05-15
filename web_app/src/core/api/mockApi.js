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

function seedDatabase() {
  return {
    admins: [
      {
        adminId: 1,
        fullName: "System Administrator",
        email: "admin@hospital.local",
        password: "admin123"
      }
    ],
    doctors: [
      {
        doctorId: 1,
        fullName: "Dr. Miriam Kato",
        specialization: "Cardiology",
        phone: "555-0111",
        email: "miriam.kato@hospital.local",
        password: "doctor123"
      },
      {
        doctorId: 2,
        fullName: "Dr. James Okoye",
        specialization: "Pediatrics",
        phone: "555-0112",
        email: "james.okoye@hospital.local",
        password: "doctor123"
      },
      {
        doctorId: 3,
        fullName: "Dr. Linda Chen",
        specialization: "General Medicine",
        phone: "555-0113",
        email: "linda.chen@hospital.local",
        password: "doctor123"
      }
    ],
    receptionists: [
      {
        receptionistId: 1,
        fullName: "Grace Njeri",
        phone: "555-0201",
        email: "grace.njeri@hospital.local",
        password: "desk123"
      },
      {
        receptionistId: 2,
        fullName: "Daniel Mensah",
        phone: "555-0202",
        email: "daniel.mensah@hospital.local",
        password: "desk123"
      }
    ],
    patients: [
      {
        patientId: 1,
        fullName: "Alice Mumo",
        age: 29,
        gender: "Female",
        phone: "555-1001",
        address: "12 Riverside Avenue",
        createdAt: getTimestamp(-5, "08:10:00"),
        email: "alice.mumo@patients.local",
        password: "patient123"
      },
      {
        patientId: 2,
        fullName: "Brian Owino",
        age: 41,
        gender: "Male",
        phone: "555-1002",
        address: "44 Palm Street",
        createdAt: getTimestamp(-4, "11:20:00"),
        email: "brian.owino@patients.local",
        password: "patient123"
      },
      {
        patientId: 3,
        fullName: "Chloe Banda",
        age: 35,
        gender: "Female",
        phone: "555-1003",
        address: "9 Westview Close",
        createdAt: getTimestamp(-3, "10:45:00"),
        email: "chloe.banda@patients.local",
        password: "patient123"
      },
      {
        patientId: 4,
        fullName: "David Kimani",
        age: 52,
        gender: "Male",
        phone: "555-1004",
        address: "71 Kingsway Road",
        createdAt: getTimestamp(-2, "09:15:00"),
        email: "david.kimani@patients.local",
        password: "patient123"
      },
      {
        patientId: 5,
        fullName: "Eva Ncube",
        age: 23,
        gender: "Female",
        phone: "555-1005",
        address: "27 Cedar Court",
        createdAt: getTimestamp(-1, "15:30:00"),
        email: "eva.ncube@patients.local",
        password: "patient123"
      },
      {
        patientId: 6,
        fullName: "Frank Adebayo",
        age: 47,
        gender: "Male",
        phone: "555-1006",
        address: "63 Garden Lane",
        createdAt: getTimestamp(0, "08:50:00"),
        email: "frank.adebayo@patients.local",
        password: "patient123"
      }
    ],
    appointments: [
      {
        appointmentId: 1,
        patientId: 1,
        doctorId: 2,
        appointmentDate: getTodayDate(),
        appointmentTime: "09:30",
        status: "Pending"
      },
      {
        appointmentId: 2,
        patientId: 2,
        doctorId: 1,
        appointmentDate: getTodayDate(),
        appointmentTime: "11:00",
        status: "Completed"
      },
      {
        appointmentId: 3,
        patientId: 3,
        doctorId: 3,
        appointmentDate: getTodayDate(),
        appointmentTime: "14:30",
        status: "Pending"
      },
      {
        appointmentId: 4,
        patientId: 4,
        doctorId: 1,
        appointmentDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        appointmentTime: "10:00",
        status: "Pending"
      },
      {
        appointmentId: 5,
        patientId: 5,
        doctorId: 3,
        appointmentDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        appointmentTime: "13:00",
        status: "Completed"
      },
      {
        appointmentId: 6,
        patientId: 1,
        doctorId: 1,
        appointmentDate: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
        appointmentTime: "15:00",
        status: "Cancelled"
      }
    ],
    medicalRecords: [
      {
        recordId: 1,
        patientId: 1,
        doctorId: 2,
        diagnosis: "Seasonal respiratory infection",
        treatment: "Prescribed antibiotics and hydration guidance.",
        recordDate: getTimestamp(-4, "12:00:00")
      },
      {
        recordId: 2,
        patientId: 2,
        doctorId: 1,
        diagnosis: "Blood pressure review",
        treatment: "Medication dosage adjusted and follow-up booked.",
        recordDate: getTimestamp(-3, "15:10:00")
      },
      {
        recordId: 3,
        patientId: 3,
        doctorId: 3,
        diagnosis: "Routine general consultation",
        treatment: "Lifestyle advice and lab follow-up recommended.",
        recordDate: getTimestamp(-2, "10:20:00")
      },
      {
        recordId: 4,
        patientId: 4,
        doctorId: 1,
        diagnosis: "Chest pain assessment",
        treatment: "ECG requested and observation started.",
        recordDate: getTimestamp(-1, "09:35:00")
      }
    ]
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
  const map = {
    [roles.ADMIN]: {
      id: record.adminId,
      fullName: record.fullName,
      email: record.email,
      role
    },
    [roles.DOCTOR]: {
      id: record.doctorId,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      specialization: record.specialization,
      role
    },
    [roles.RECEPTIONIST]: {
      id: record.receptionistId,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      role
    },
    [roles.PATIENT]: {
      id: record.patientId,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      role
    }
  };

  return map[role];
}

function nextId(items, key) {
  return items.reduce((max, item) => Math.max(max, Number(item[key])), 0) + 1;
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
  return database.doctors.find((doctor) => Number(doctor.doctorId) === Number(doctorId));
}

function findPatient(database, patientId) {
  return database.patients.find((patient) => Number(patient.patientId) === Number(patientId));
}

function joinAppointment(database, appointment) {
  const patient = findPatient(database, appointment.patientId);
  const doctor = findDoctor(database, appointment.doctorId);

  return {
    ...appointment,
    patientName: patient?.fullName ?? "Unknown patient",
    doctorName: doctor?.fullName ?? "Unknown doctor"
  };
}

function joinMedicalRecord(database, record) {
  const patient = findPatient(database, record.patientId);
  const doctor = findDoctor(database, record.doctorId);

  return {
    ...record,
    patientName: patient?.fullName ?? "Unknown patient",
    doctorName: doctor?.fullName ?? "Unknown doctor"
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

  return sortByTimestamp(database.patients, "createdAt").filter((patient) => {
    const matchesSearch =
      !search ||
      patient.fullName.toLowerCase().includes(search) ||
      String(patient.patientId).includes(search);
    const matchesDate = !createdDate || patient.createdAt.startsWith(createdDate);
    return matchesSearch && matchesDate;
  });
}

function getPatientDetails(database, patientId) {
  const patient = findPatient(database, patientId);

  if (!patient) {
    throw createHttpError("Patient not found.", 404);
  }

  const appointments = sortByDateTime(
    database.appointments
      .filter((appointment) => Number(appointment.patientId) === Number(patientId))
      .map((appointment) => joinAppointment(database, appointment)),
    "appointmentDate",
    "appointmentTime",
    "desc"
  );

  const medicalRecords = sortByTimestamp(
    database.medicalRecords
      .filter((record) => Number(record.patientId) === Number(patientId))
      .map((record) => joinMedicalRecord(database, record)),
    "recordDate"
  );

  return {
    ...patient,
    appointments,
    medicalRecords
  };
}

function listAppointments(database, searchParams) {
  const filters = {
    appointmentDate: searchParams.get("appointmentDate"),
    doctorId: searchParams.get("doctorId"),
    status: searchParams.get("status"),
    patientId: searchParams.get("patientId")
  };

  return sortByDateTime(
    database.appointments
      .filter((appointment) => {
        const matchesDate = !filters.appointmentDate || appointment.appointmentDate === filters.appointmentDate;
        const matchesDoctor = !filters.doctorId || Number(appointment.doctorId) === Number(filters.doctorId);
        const matchesStatus = !filters.status || appointment.status === filters.status;
        const matchesPatient = !filters.patientId || Number(appointment.patientId) === Number(filters.patientId);
        return matchesDate && matchesDoctor && matchesStatus && matchesPatient;
      })
      .map((appointment) => joinAppointment(database, appointment)),
    "appointmentDate",
    "appointmentTime"
  );
}

function assertAppointmentAvailability(database, payload, currentAppointmentId = null) {
  const hasConflict = database.appointments.some((appointment) => {
    if (currentAppointmentId && Number(appointment.appointmentId) === Number(currentAppointmentId)) {
      return false;
    }

    return (
      Number(appointment.doctorId) === Number(payload.doctorId) &&
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
        const matchesPatient = !patientId || Number(record.patientId) === Number(patientId);
        const matchesDoctor = !doctorId || Number(record.doctorId) === Number(doctorId);
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
    ...database.admins.map((admin) => ({
      staffKey: `admin-${admin.adminId}`,
      fullName: admin.fullName,
      role: roles.ADMIN,
      phone: "",
      email: admin.email,
      specialization: ""
    })),
    ...database.doctors.map((doctor) => ({
      staffKey: `doctor-${doctor.doctorId}`,
      fullName: doctor.fullName,
      role: roles.DOCTOR,
      phone: doctor.phone,
      email: doctor.email,
      specialization: doctor.specialization
    })),
    ...database.receptionists.map((receptionist) => ({
      staffKey: `receptionist-${receptionist.receptionistId}`,
      fullName: receptionist.fullName,
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
  const [role, id] = staffKey.split("-");

  if (role === roles.ADMIN) {
    const admin = database.admins.find((item) => Number(item.adminId) === Number(id));
    if (!admin) {
      throw createHttpError("Staff member not found.", 404);
    }

    return {
      staffKey: staffKey,
      fullName: admin.fullName,
      role,
      phone: "",
      email: admin.email,
      specialization: ""
    };
  }

  if (role === roles.DOCTOR) {
    const doctor = database.doctors.find((item) => Number(item.doctorId) === Number(id));
    if (!doctor) {
      throw createHttpError("Staff member not found.", 404);
    }

    return {
      staffKey: staffKey,
      fullName: doctor.fullName,
      role,
      phone: doctor.phone,
      email: doctor.email,
      specialization: doctor.specialization
    };
  }

  const receptionist = database.receptionists.find((item) => Number(item.receptionistId) === Number(id));
  if (!receptionist) {
    throw createHttpError("Staff member not found.", 404);
  }

  return {
    staffKey: staffKey,
    fullName: receptionist.fullName,
    role,
    phone: receptionist.phone,
    email: receptionist.email,
    specialization: ""
  };
}

function emailExists(database, email, ignoreKey = null) {
  return buildStaffList(database, new URLSearchParams())
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
    value: appointments.filter((appointment) => Number(appointment.doctorId) === Number(doctor.doctorId)).length
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
  const id = Number(searchParams.get("id"));

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

function updateProfile(database, payload) {
  const role = payload.role;
  const id = Number(payload.id);

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
  const id = Number(payload.id);
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
  const [currentRole, currentIdText] = staffKey.split("-");
  const currentId = Number(currentIdText);

  if (currentRole === payload.role) {
    if (currentRole === roles.ADMIN) {
      const admin = database.admins.find((item) => item.adminId === currentId);
      admin.fullName = payload.fullName;
      admin.email = payload.email;
      if (payload.password) {
        admin.password = payload.password;
      }
      return { staffKey: staffKey };
    }

    if (currentRole === roles.DOCTOR) {
      const doctor = database.doctors.find((item) => item.doctorId === currentId);
      doctor.fullName = payload.fullName;
      doctor.email = payload.email;
      doctor.phone = payload.phone;
      doctor.specialization = payload.specialization;
      if (payload.password) {
        doctor.password = payload.password;
      }
      return { staffKey: staffKey };
    }

    const receptionist = database.receptionists.find((item) => item.receptionistId === currentId);
    receptionist.fullName = payload.fullName;
    receptionist.email = payload.email;
    receptionist.phone = payload.phone;
    if (payload.password) {
      receptionist.password = payload.password;
    }
    return { staffKey: staffKey };
  }

  if (currentRole === roles.ADMIN) {
    database.admins = database.admins.filter((item) => item.adminId !== currentId);
  } else if (currentRole === roles.DOCTOR) {
    database.doctors = database.doctors.filter((item) => item.doctorId !== currentId);
  } else {
    database.receptionists = database.receptionists.filter((item) => item.receptionistId !== currentId);
  }

  if (payload.role === roles.ADMIN) {
    const adminId = nextId(database.admins, "adminId");
    database.admins.push({
      adminId: adminId,
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password || "admin123"
    });
    return { staffKey: `admin-${adminId}` };
  }

  if (payload.role === roles.DOCTOR) {
    const doctorId = nextId(database.doctors, "doctorId");
    database.doctors.push({
      doctorId: doctorId,
      fullName: payload.fullName,
      specialization: payload.specialization,
      phone: payload.phone,
      email: payload.email,
      password: payload.password || "doctor123"
    });
    return { staffKey: `doctor-${doctorId}` };
  }

  const receptionistId = nextId(database.receptionists, "receptionistId");
  database.receptionists.push({
    receptionistId: receptionistId,
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    password: payload.password || "desk123"
  });
  return { staffKey: `receptionist-${receptionistId}` };
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
      const newId = nextId(database.patients, "patientId");
      const patient = {
        patientId: newId,
        fullName: payload.fullName,
        age: Number(payload.age),
        gender: payload.gender,
        phone: payload.phone,
        address: payload.address,
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
        patient.fullName = payload.fullName;
        patient.age = Number(payload.age);
        patient.gender = payload.gender;
        patient.phone = payload.phone;
        patient.address = payload.address;
        writeDatabase(database);
        return getPatientDetails(database, patientId);
      }

      if (method === "DELETE") {
        const hasHistory = database.medicalRecords.some(
          (record) => Number(record.patientId) === Number(patientId)
        );

        if (hasHistory) {
          throw createHttpError("Patients with medical history cannot be deleted from this interface.");
        }

        database.patients = database.patients.filter(
          (patient) => Number(patient.patientId) !== Number(patientId)
        );
        database.appointments = database.appointments.filter(
          (appointment) => Number(appointment.patientId) !== Number(patientId)
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
        patientId: Number(payload.patientId),
        doctorId: Number(payload.doctorId),
        appointmentDate: payload.appointmentDate,
        appointmentTime: payload.appointmentTime,
        status: payload.status || "Pending"
      };
      database.appointments.push(appointment);
      writeDatabase(database);
      return joinAppointment(database, appointment);
    }

    if (pathname.startsWith("/appointments/")) {
      const appointmentId = Number(pathname.split("/")[2]);
      const appointment = database.appointments.find((item) => Number(item.appointmentId) === appointmentId);

      if (!appointment) {
        throw createHttpError("Appointment not found.", 404);
      }

      if (method === "PUT") {
        assertAppointmentAvailability(database, payload, appointmentId);
        appointment.patientId = Number(payload.patientId);
        appointment.doctorId = Number(payload.doctorId);
        appointment.appointmentDate = payload.appointmentDate;
        appointment.appointmentTime = payload.appointmentTime;
        appointment.status = payload.status;
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
        patientId: Number(payload.patientId),
        doctorId: Number(payload.doctorId),
        diagnosis: payload.diagnosis,
        treatment: payload.treatment,
        recordDate: new Date().toISOString()
      };
      database.medicalRecords.push(record);
      writeDatabase(database);
      return joinMedicalRecord(database, record);
    }

    if (pathname.startsWith("/medical-records/")) {
      const recordId = Number(pathname.split("/")[2]);
      const record = database.medicalRecords.find((item) => Number(item.recordId) === recordId);

      if (!record) {
        throw createHttpError("Medical record not found.", 404);
      }

      if (method === "PUT") {
        record.patientId = Number(payload.patientId);
        record.doctorId = Number(payload.doctorId);
        record.diagnosis = payload.diagnosis;
        record.treatment = payload.treatment;
        writeDatabase(database);
        return joinMedicalRecord(database, record);
      }
    }

    if (method === "GET" && pathname === "/staff") {
      return buildStaffList(database, searchParams);
    }

    if (method === "POST" && pathname === "/staff") {
      if (emailExists(database, payload.email)) {
        throw createHttpError("A staff account with this email already exists.");
      }

      if (payload.role === roles.ADMIN) {
        const adminId = nextId(database.admins, "adminId");
        database.admins.push({
          adminId: adminId,
          fullName: payload.fullName,
          email: payload.email,
          password: payload.password
        });
        writeDatabase(database);
        return getStaffMember(database, `admin-${adminId}`);
      }

      if (payload.role === roles.DOCTOR) {
        const doctorId = nextId(database.doctors, "doctorId");
        database.doctors.push({
          doctorId: doctorId,
          fullName: payload.fullName,
          specialization: payload.specialization,
          phone: payload.phone,
          email: payload.email,
          password: payload.password
        });
        writeDatabase(database);
        return getStaffMember(database, `doctor-${doctorId}`);
      }

      const receptionistId = nextId(database.receptionists, "receptionistId");
      database.receptionists.push({
        receptionistId: receptionistId,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        password: payload.password
      });
      writeDatabase(database);
      return getStaffMember(database, `receptionist-${receptionistId}`);
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
        const [role, idText] = staffKey.split("-");
        const id = Number(idText);

        if (role === roles.ADMIN) {
          if (database.admins.length === 1) {
            throw createHttpError("At least one admin account must remain in the system.");
          }
          database.admins = database.admins.filter((item) => item.adminId !== id);
        } else if (role === roles.DOCTOR) {
          const hasLinks =
            database.appointments.some((appointment) => Number(appointment.doctorId) === id) ||
            database.medicalRecords.some((record) => Number(record.doctorId) === id);
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
