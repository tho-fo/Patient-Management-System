import { roles } from "./roles.js";

export const routePaths = {
  login: "/login",
  registerPatient: "/register/patient",
  registerDoctor: "/register/doctor",
  dashboard: "/dashboard",
  patients: "/patients",
  addPatient: "/patients/new",
  editPatient: "/patients/:id/edit",
  appointments: "/appointments",
  bookAppointment: "/appointments/new",
  medicalHistory: "/medical-records/history",
  addMedicalRecord: "/medical-records/new",
  staff: "/staff",
  addStaff: "/staff/new",
  profile: "/profile",
  reports: "/reports",
  settings: "/settings"
};

export const navigationItems = [
  {
    label: "Dashboard",
    path: routePaths.dashboard,
    icon: "bi-grid",
    roles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT]
  },
  {
    label: "Patients",
    path: routePaths.patients,
    icon: "bi-people",
    roles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST]
  },
  {
    label: "Appointments",
    path: routePaths.appointments,
    icon: "bi-calendar-check",
    roles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT]
  },
  {
    label: "Medical Records",
    path: routePaths.medicalHistory,
    icon: "bi-journal-medical",
    roles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT]
  },
  {
    label: "Users",
    path: routePaths.staff,
    icon: "bi-person-badge",
    roles: [roles.ADMIN]
  },
  {
    label: "Reports",
    path: routePaths.reports,
    icon: "bi-bar-chart-line",
    roles: [roles.ADMIN]
  },
  {
    label: "Profile",
    path: routePaths.profile,
    icon: "bi-person-circle",
    roles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT]
  },
  {
    label: "Settings",
    path: routePaths.settings,
    icon: "bi-gear",
    roles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT]
  }
];

export function getBaseSection(pathname) {
  if (pathname.startsWith("/patients")) {
    return routePaths.patients;
  }

  if (pathname.startsWith("/appointments")) {
    return routePaths.appointments;
  }

  if (pathname.startsWith("/medical-records")) {
    return routePaths.medicalHistory;
  }

  if (pathname.startsWith("/staff")) {
    return routePaths.staff;
  }

  if (pathname.startsWith("/profile")) {
    return routePaths.profile;
  }

  return pathname;
}
