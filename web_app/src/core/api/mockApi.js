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
        admin_id: 1,
        full_name: "System Administrator",
        email: "admin@hospital.local",
        password: "admin123"
      }
    ],
    doctors: [
      {
        doctor_id: 1,
        full_name: "Dr. Miriam Kato",
        specialization: "Cardiology",
        phone: "555-0111",
        email: "miriam.kato@hospital.local",
        password: "doctor123"
      },
      {
        doctor_id: 2,
        full_name: "Dr. James Okoye",
        specialization: "Pediatrics",
        phone: "555-0112",
        email: "james.okoye@hospital.local",
        password: "doctor123"
      },
      {
        doctor_id: 3,
        full_name: "Dr. Linda Chen",
        specialization: "General Medicine",
        phone: "555-0113",
        email: "linda.chen@hospital.local",
        password: "doctor123"
      }
    ],
    receptionists: [
      {
        receptionist_id: 1,
        full_name: "Grace Njeri",
        phone: "555-0201",
        email: "grace.njeri@hospital.local",
        password: "desk123"
      },
      {
        receptionist_id: 2,
        full_name: "Daniel Mensah",
        phone: "555-0202",
        email: "daniel.mensah@hospital.local",
        password: "desk123"
      }
    ],
    patients: [
      {
        patient_id: 1,
        full_name: "Alice Mumo",
        age: 29,
        gender: "Female",
        phone: "555-1001",
        address: "12 Riverside Avenue",
        created_at: getTimestamp(-5, "08:10:00"),
        email: "alice.mumo@patients.local",
        password: "patient123"
      },
      {
        patient_id: 2,
        full_name: "Brian Owino",
        age: 41,
        gender: "Male",
        phone: "555-1002",
        address: "44 Palm Street",
        created_at: getTimestamp(-4, "11:20:00"),
        email: "brian.owino@patients.local",
        password: "patient123"
      },
      {
        patient_id: 3,
        full_name: "Chloe Banda",
        age: 35,
        gender: "Female",
        phone: "555-1003",
        address: "9 Westview Close",
        created_at: getTimestamp(-3, "10:45:00"),
        email: "chloe.banda@patients.local",
        password: "patient123"
      },
      {
        patient_id: 4,
        full_name: "David Kimani",
        age: 52,
        gender: "Male",
        phone: "555-1004",
        address: "71 Kingsway Road",
        created_at: getTimestamp(-2, "09:15:00"),
        email: "david.kimani@patients.local",
        password: "patient123"
      },
      {
        patient_id: 5,
        full_name: "Eva Ncube",
        age: 23,
        gender: "Female",
        phone: "555-1005",
        address: "27 Cedar Court",
        created_at: getTimestamp(-1, "15:30:00"),
        email: "eva.ncube@patients.local",
        password: "patient123"
      },
      {
        patient_id: 6,
        full_name: "Frank Adebayo",
        age: 47,
        gender: "Male",
        phone: "555-1006",
        address: "63 Garden Lane",
        created_at: getTimestamp(0, "08:50:00"),
        email: "frank.adebayo@patients.local",
        password: "patient123"
      }
    ],
    appointments: [
      {
        appointment_id: 1,
        patient_id: 1,
        doctor_id: 2,
        appointment_date: getTodayDate(),
        appointment_time: "09:30",
        status: "Pending"
      },
      {
        appointment_id: 2,
        patient_id: 2,
        doctor_id: 1,
        appointment_date: getTodayDate(),
        appointment_time: "11:00",
        status: "Completed"
      },
      {
        appointment_id: 3,
        patient_id: 3,
        doctor_id: 3,
        appointment_date: getTodayDate(),
        appointment_time: "14:30",
        status: "Pending"
      },
      {
        appointment_id: 4,
        patient_id: 4,
        doctor_id: 1,
        appointment_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        appointment_time: "10:00",
        status: "Pending"
      },
      {
        appointment_id: 5,
        patient_id: 5,
        doctor_id: 3,
        appointment_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        appointment_time: "13:00",
        status: "Completed"
      },
      {
        appointment_id: 6,
        patient_id: 1,
        doctor_id: 1,
        appointment_date: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
        appointment_time: "15:00",
        status: "Cancelled"
      }
    ],
    medicalRecords: [
      {
        record_id: 1,
        patient_id: 1,
        doctor_id: 2,
        diagnosis: "Seasonal respiratory infection",
        treatment: "Prescribed antibiotics and hydration guidance.",
        record_date: getTimestamp(-4, "12:00:00")
      },
      {
        record_id: 2,
        patient_id: 2,
        doctor_id: 1,
        diagnosis: "Blood pressure review",
        treatment: "Medication dosage adjusted and follow-up booked.",
        record_date: getTimestamp(-3, "15:10:00")
      },
      {
        record_id: 3,
        patient_id: 3,
        doctor_id: 3,
        diagnosis: "Routine general consultation",
        treatment: "Lifestyle advice and lab follow-up recommended.",
        record_date: getTimestamp(-2, "10:20:00")
      },
      {
        record_id: 4,
        patient_id: 4,
        doctor_id: 1,
        diagnosis: "Chest pain assessment",
        treatment: "ECG requested and observation started.",
        record_date: getTimestamp(-1, "09:35:00")
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
      id: record.admin_id,
      full_name: record.full_name,
      email: record.email,
      role
    },
    [roles.DOCTOR]: {
      id: record.doctor_id,
      full_name: record.full_name,
      email: record.email,
      phone: record.phone,
      specialization: record.specialization,
      role
    },
    [roles.RECEPTIONIST]: {
      id: record.receptionist_id,
      full_name: record.full_name,
      email: record.email,
      phone: record.phone,
      role
    },
    [roles.PATIENT]: {
      id: record.patient_id,
      full_name: record.full_name,
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
  return database.doctors.find((doctor) => Number(doctor.doctor_id) === Number(doctorId));
}

function findPatient(database, patientId) {
  return database.patients.find((patient) => Number(patient.patient_id) === Number(patientId));
}

function joinAppointment(database, appointment) {
  const patient = findPatient(database, appointment.patient_id);
  const doctor = findDoctor(database, appointment.doctor_id);

  return {
    ...appointment,
    patient_name: patient?.full_name ?? "Unknown patient",
    doctor_name: doctor?.full_name ?? "Unknown doctor"
  };
}

function joinMedicalRecord(database, record) {
  const patient = findPatient(database, record.patient_id);
  const doctor = findDoctor(database, record.doctor_id);

  return {
    ...record,
    patient_name: patient?.full_name ?? "Unknown patient",
    doctor_name: doctor?.full_name ?? "Unknown doctor"
  };
}

function buildDashboard(database) {
  const appointments = sortByDateTime(
    database.appointments.map((item) => joinAppointment(database, item)),
    "appointment_date",
    "appointment_time"
  );

  const today = getTodayDate();

  return {
    totalPatients: database.patients.length,
    totalDoctors: database.doctors.length,
    totalAppointments: database.appointments.length,
    todaysAppointments: database.appointments.filter(
      (appointment) => appointment.appointment_date === today && appointment.status !== "Cancelled"
    ).length,
    pendingAppointments: database.appointments.filter((appointment) => appointment.status === "Pending").length,
    recentPatients: sortByTimestamp(database.patients, "created_at").slice(0, 5),
    latestAppointments: appointments.slice(0, 5)
  };
}

function listPatients(database, searchParams) {
  const search = searchParams.get("search")?.toLowerCase().trim() ?? "";
  const createdDate = searchParams.get("createdDate");

  return sortByTimestamp(database.patients, "created_at").filter((patient) => {
    const matchesSearch =
      !search ||
      patient.full_name.toLowerCase().includes(search) ||
      String(patient.patient_id).includes(search);
    const matchesDate = !createdDate || patient.created_at.startsWith(createdDate);
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
      .filter((appointment) => Number(appointment.patient_id) === Number(patientId))
      .map((appointment) => joinAppointment(database, appointment)),
    "appointment_date",
    "appointment_time",
    "desc"
  );

  const medicalRecords = sortByTimestamp(
    database.medicalRecords
      .filter((record) => Number(record.patient_id) === Number(patientId))
      .map((record) => joinMedicalRecord(database, record)),
    "record_date"
  );

  return {
    ...patient,
    appointments,
    medicalRecords
  };
}

function listAppointments(database, searchParams) {
  const filters = {
    appointment_date: searchParams.get("appointment_date"),
    doctor_id: searchParams.get("doctor_id"),
    status: searchParams.get("status"),
    patient_id: searchParams.get("patient_id")
  };

  return sortByDateTime(
    database.appointments
      .filter((appointment) => {
        const matchesDate = !filters.appointment_date || appointment.appointment_date === filters.appointment_date;
        const matchesDoctor = !filters.doctor_id || Number(appointment.doctor_id) === Number(filters.doctor_id);
        const matchesStatus = !filters.status || appointment.status === filters.status;
        const matchesPatient = !filters.patient_id || Number(appointment.patient_id) === Number(filters.patient_id);
        return matchesDate && matchesDoctor && matchesStatus && matchesPatient;
      })
      .map((appointment) => joinAppointment(database, appointment)),
    "appointment_date",
    "appointment_time"
  );
}

function assertAppointmentAvailability(database, payload, currentAppointmentId = null) {
  const hasConflict = database.appointments.some((appointment) => {
    if (currentAppointmentId && Number(appointment.appointment_id) === Number(currentAppointmentId)) {
      return false;
    }

    return (
      Number(appointment.doctor_id) === Number(payload.doctor_id) &&
      appointment.appointment_date === payload.appointment_date &&
      appointment.appointment_time === payload.appointment_time &&
      appointment.status !== "Cancelled"
    );
  });

  if (hasConflict) {
    throw createHttpError("This doctor already has an appointment at the selected time.");
  }
}

function listMedicalRecords(database, searchParams) {
  const patientId = searchParams.get("patient_id");
  const doctorId = searchParams.get("doctor_id");

  return sortByTimestamp(
    database.medicalRecords
      .filter((record) => {
        const matchesPatient = !patientId || Number(record.patient_id) === Number(patientId);
        const matchesDoctor = !doctorId || Number(record.doctor_id) === Number(doctorId);
        return matchesPatient && matchesDoctor;
      })
      .map((record) => joinMedicalRecord(database, record)),
    "record_date"
  );
}

function buildStaffList(database, searchParams) {
  const roleFilter = searchParams.get("role");
  const search = searchParams.get("search")?.toLowerCase().trim() ?? "";

  const staff = [
    ...database.admins.map((admin) => ({
      staff_key: `admin-${admin.admin_id}`,
      full_name: admin.full_name,
      role: roles.ADMIN,
      phone: "",
      email: admin.email,
      specialization: ""
    })),
    ...database.doctors.map((doctor) => ({
      staff_key: `doctor-${doctor.doctor_id}`,
      full_name: doctor.full_name,
      role: roles.DOCTOR,
      phone: doctor.phone,
      email: doctor.email,
      specialization: doctor.specialization
    })),
    ...database.receptionists.map((receptionist) => ({
      staff_key: `receptionist-${receptionist.receptionist_id}`,
      full_name: receptionist.full_name,
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
      member.full_name.toLowerCase().includes(search) ||
      member.email.toLowerCase().includes(search);
    return matchesRole && matchesSearch;
  });
}

function getStaffMember(database, staffKey) {
  const [role, id] = staffKey.split("-");

  if (role === roles.ADMIN) {
    const admin = database.admins.find((item) => Number(item.admin_id) === Number(id));
    if (!admin) {
      throw createHttpError("Staff member not found.", 404);
    }

    return {
      staff_key: staffKey,
      full_name: admin.full_name,
      role,
      phone: "",
      email: admin.email,
      specialization: ""
    };
  }

  if (role === roles.DOCTOR) {
    const doctor = database.doctors.find((item) => Number(item.doctor_id) === Number(id));
    if (!doctor) {
      throw createHttpError("Staff member not found.", 404);
    }

    return {
      staff_key: staffKey,
      full_name: doctor.full_name,
      role,
      phone: doctor.phone,
      email: doctor.email,
      specialization: doctor.specialization
    };
  }

  const receptionist = database.receptionists.find((item) => Number(item.receptionist_id) === Number(id));
  if (!receptionist) {
    throw createHttpError("Staff member not found.", 404);
  }

  return {
    staff_key: staffKey,
    full_name: receptionist.full_name,
    role,
    phone: receptionist.phone,
    email: receptionist.email,
    specialization: ""
  };
}

function emailExists(database, email, ignoreKey = null) {
  return buildStaffList(database, new URLSearchParams())
    .filter((member) => member.staff_key !== ignoreKey)
    .some((member) => member.email.toLowerCase() === email.toLowerCase());
}

function buildReports(database, searchParams) {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");

  const appointments = database.appointments.filter((appointment) => {
    const matchesFrom = !from || appointment.appointment_date >= from;
    const matchesTo = !to || appointment.appointment_date <= to;
    const matchesStatus = !status || appointment.status === status;
    return matchesFrom && matchesTo && matchesStatus;
  });

  const joinedAppointments = appointments.map((appointment) => joinAppointment(database, appointment));
  const statusSummary = ["Pending", "Completed", "Cancelled"].map((label) => ({
    label,
    value: appointments.filter((appointment) => appointment.status === label).length
  }));
  const doctorLoad = database.doctors.map((doctor) => ({
    label: doctor.full_name,
    value: appointments.filter((appointment) => Number(appointment.doctor_id) === Number(doctor.doctor_id)).length
  }));
  const patientGrowth = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayValue = date.toISOString().slice(0, 10);
    return {
      label,
      value: database.patients.filter((patient) => patient.created_at.startsWith(dayValue)).length
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
    latestAppointments: sortByDateTime(joinedAppointments, "appointment_date", "appointment_time", "desc").slice(0, 5)
  };
}

function getProfile(database, searchParams) {
  const role = searchParams.get("role");
  const id = Number(searchParams.get("id"));

  if (role === roles.ADMIN) {
    return normalizeUser(database.admins.find((item) => item.admin_id === id), role);
  }

  if (role === roles.DOCTOR) {
    return normalizeUser(database.doctors.find((item) => item.doctor_id === id), role);
  }

  if (role === roles.RECEPTIONIST) {
    return normalizeUser(database.receptionists.find((item) => item.receptionist_id === id), role);
  }

  return normalizeUser(database.patients.find((item) => item.patient_id === id), role);
}

function updateProfile(database, payload) {
  const role = payload.role;
  const id = Number(payload.id);

  if (role === roles.ADMIN) {
    const admin = database.admins.find((item) => item.admin_id === id);
    admin.full_name = payload.full_name;
    admin.email = payload.email;
    return normalizeUser(admin, role);
  }

  if (role === roles.DOCTOR) {
    const doctor = database.doctors.find((item) => item.doctor_id === id);
    doctor.full_name = payload.full_name;
    doctor.email = payload.email;
    doctor.phone = payload.phone;
    doctor.specialization = payload.specialization;
    return normalizeUser(doctor, role);
  }

  if (role === roles.RECEPTIONIST) {
    const receptionist = database.receptionists.find((item) => item.receptionist_id === id);
    receptionist.full_name = payload.full_name;
    receptionist.email = payload.email;
    receptionist.phone = payload.phone;
    return normalizeUser(receptionist, role);
  }

  const patient = database.patients.find((item) => item.patient_id === id);
  patient.full_name = payload.full_name;
  patient.email = payload.email;
  patient.phone = payload.phone;
  return normalizeUser(patient, role);
}

function updatePassword(database, payload) {
  const role = payload.role;
  const id = Number(payload.id);
  let target;

  if (role === roles.ADMIN) {
    target = database.admins.find((item) => item.admin_id === id);
  } else if (role === roles.DOCTOR) {
    target = database.doctors.find((item) => item.doctor_id === id);
  } else if (role === roles.RECEPTIONIST) {
    target = database.receptionists.find((item) => item.receptionist_id === id);
  } else {
    target = database.patients.find((item) => item.patient_id === id);
  }

  if (!target || target.password !== payload.current_password) {
    throw createHttpError("Current password is incorrect.");
  }

  target.password = payload.new_password;
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
      const admin = database.admins.find((item) => item.admin_id === currentId);
      admin.full_name = payload.full_name;
      admin.email = payload.email;
      if (payload.password) {
        admin.password = payload.password;
      }
      return { staff_key: staffKey };
    }

    if (currentRole === roles.DOCTOR) {
      const doctor = database.doctors.find((item) => item.doctor_id === currentId);
      doctor.full_name = payload.full_name;
      doctor.email = payload.email;
      doctor.phone = payload.phone;
      doctor.specialization = payload.specialization;
      if (payload.password) {
        doctor.password = payload.password;
      }
      return { staff_key: staffKey };
    }

    const receptionist = database.receptionists.find((item) => item.receptionist_id === currentId);
    receptionist.full_name = payload.full_name;
    receptionist.email = payload.email;
    receptionist.phone = payload.phone;
    if (payload.password) {
      receptionist.password = payload.password;
    }
    return { staff_key: staffKey };
  }

  if (currentRole === roles.ADMIN) {
    database.admins = database.admins.filter((item) => item.admin_id !== currentId);
  } else if (currentRole === roles.DOCTOR) {
    database.doctors = database.doctors.filter((item) => item.doctor_id !== currentId);
  } else {
    database.receptionists = database.receptionists.filter((item) => item.receptionist_id !== currentId);
  }

  if (payload.role === roles.ADMIN) {
    const adminId = nextId(database.admins, "admin_id");
    database.admins.push({
      admin_id: adminId,
      full_name: payload.full_name,
      email: payload.email,
      password: payload.password || "admin123"
    });
    return { staff_key: `admin-${adminId}` };
  }

  if (payload.role === roles.DOCTOR) {
    const doctorId = nextId(database.doctors, "doctor_id");
    database.doctors.push({
      doctor_id: doctorId,
      full_name: payload.full_name,
      specialization: payload.specialization,
      phone: payload.phone,
      email: payload.email,
      password: payload.password || "doctor123"
    });
    return { staff_key: `doctor-${doctorId}` };
  }

  const receptionistId = nextId(database.receptionists, "receptionist_id");
  database.receptionists.push({
    receptionist_id: receptionistId,
    full_name: payload.full_name,
    phone: payload.phone,
    email: payload.email,
    password: payload.password || "desk123"
  });
  return { staff_key: `receptionist-${receptionistId}` };
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
      const newId = nextId(database.patients, "patient_id");
      const patient = {
        patient_id: newId,
        full_name: payload.full_name,
        age: Number(payload.age),
        gender: payload.gender,
        phone: payload.phone,
        address: payload.address,
        created_at: new Date().toISOString()
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
        patient.full_name = payload.full_name;
        patient.age = Number(payload.age);
        patient.gender = payload.gender;
        patient.phone = payload.phone;
        patient.address = payload.address;
        writeDatabase(database);
        return getPatientDetails(database, patientId);
      }

      if (method === "DELETE") {
        const hasHistory = database.medicalRecords.some(
          (record) => Number(record.patient_id) === Number(patientId)
        );

        if (hasHistory) {
          throw createHttpError("Patients with medical history cannot be deleted from this interface.");
        }

        database.patients = database.patients.filter(
          (patient) => Number(patient.patient_id) !== Number(patientId)
        );
        database.appointments = database.appointments.filter(
          (appointment) => Number(appointment.patient_id) !== Number(patientId)
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
      const newId = nextId(database.appointments, "appointment_id");
      const appointment = {
        appointment_id: newId,
        patient_id: Number(payload.patient_id),
        doctor_id: Number(payload.doctor_id),
        appointment_date: payload.appointment_date,
        appointment_time: payload.appointment_time,
        status: payload.status || "Pending"
      };
      database.appointments.push(appointment);
      writeDatabase(database);
      return joinAppointment(database, appointment);
    }

    if (pathname.startsWith("/appointments/")) {
      const appointmentId = Number(pathname.split("/")[2]);
      const appointment = database.appointments.find((item) => Number(item.appointment_id) === appointmentId);

      if (!appointment) {
        throw createHttpError("Appointment not found.", 404);
      }

      if (method === "PUT") {
        assertAppointmentAvailability(database, payload, appointmentId);
        appointment.patient_id = Number(payload.patient_id);
        appointment.doctor_id = Number(payload.doctor_id);
        appointment.appointment_date = payload.appointment_date;
        appointment.appointment_time = payload.appointment_time;
        appointment.status = payload.status;
        writeDatabase(database);
        return joinAppointment(database, appointment);
      }
    }

    if (method === "GET" && pathname === "/medical-records") {
      return listMedicalRecords(database, searchParams);
    }

    if (method === "POST" && pathname === "/medical-records") {
      const patient = findPatient(database, payload.patient_id);
      const doctor = findDoctor(database, payload.doctor_id);

      if (!patient || !doctor) {
        throw createHttpError("Patient or doctor could not be found.");
      }

      const newId = nextId(database.medicalRecords, "record_id");
      const record = {
        record_id: newId,
        patient_id: Number(payload.patient_id),
        doctor_id: Number(payload.doctor_id),
        diagnosis: payload.diagnosis,
        treatment: payload.treatment,
        record_date: new Date().toISOString()
      };
      database.medicalRecords.push(record);
      writeDatabase(database);
      return joinMedicalRecord(database, record);
    }

    if (pathname.startsWith("/medical-records/")) {
      const recordId = Number(pathname.split("/")[2]);
      const record = database.medicalRecords.find((item) => Number(item.record_id) === recordId);

      if (!record) {
        throw createHttpError("Medical record not found.", 404);
      }

      if (method === "PUT") {
        record.patient_id = Number(payload.patient_id);
        record.doctor_id = Number(payload.doctor_id);
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
        const adminId = nextId(database.admins, "admin_id");
        database.admins.push({
          admin_id: adminId,
          full_name: payload.full_name,
          email: payload.email,
          password: payload.password
        });
        writeDatabase(database);
        return getStaffMember(database, `admin-${adminId}`);
      }

      if (payload.role === roles.DOCTOR) {
        const doctorId = nextId(database.doctors, "doctor_id");
        database.doctors.push({
          doctor_id: doctorId,
          full_name: payload.full_name,
          specialization: payload.specialization,
          phone: payload.phone,
          email: payload.email,
          password: payload.password
        });
        writeDatabase(database);
        return getStaffMember(database, `doctor-${doctorId}`);
      }

      const receptionistId = nextId(database.receptionists, "receptionist_id");
      database.receptionists.push({
        receptionist_id: receptionistId,
        full_name: payload.full_name,
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
        return getStaffMember(database, result.staff_key);
      }

      if (method === "DELETE") {
        const [role, idText] = staffKey.split("-");
        const id = Number(idText);

        if (role === roles.ADMIN) {
          if (database.admins.length === 1) {
            throw createHttpError("At least one admin account must remain in the system.");
          }
          database.admins = database.admins.filter((item) => item.admin_id !== id);
        } else if (role === roles.DOCTOR) {
          const hasLinks =
            database.appointments.some((appointment) => Number(appointment.doctor_id) === id) ||
            database.medicalRecords.some((record) => Number(record.doctor_id) === id);
          if (hasLinks) {
            throw createHttpError("Doctors with appointments or medical records cannot be deleted.");
          }
          database.doctors = database.doctors.filter((item) => item.doctor_id !== id);
        } else {
          database.receptionists = database.receptionists.filter((item) => item.receptionist_id !== id);
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
