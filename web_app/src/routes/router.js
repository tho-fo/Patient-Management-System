import { routePaths } from "../core/constants/routes.js";
import { loginPage } from "../features/auth/pages/loginPage.js";
import { patientRegistrationPage, doctorRegistrationPage } from "../features/auth/pages/registrationPage.js";
import { dashboardPage } from "../features/dashboard/pages/dashboardPage.js";
import { patientListPage } from "../features/patients/pages/patientListPage.js";
import { patientEditPage, patientFormPage } from "../features/patients/pages/patientFormPage.js";
import { patientDetailsPage } from "../features/patients/pages/patientDetailsPage.js";
import { appointmentListPage } from "../features/appointments/pages/appointmentListPage.js";
import { bookAppointmentPage } from "../features/appointments/pages/bookAppointmentPage.js";
import { recordEntryPage } from "../features/medicalRecords/pages/recordEntryPage.js";
import { patientHistoryPage } from "../features/medicalRecords/pages/patientHistoryPage.js";
import { staffListPage } from "../features/users/pages/staffListPage.js";
import { staffFormPage } from "../features/users/pages/staffFormPage.js";
import { profilePage } from "../features/profile/pages/profilePage.js";
import { reportsPage } from "../features/reports/pages/reportsPage.js";
import { settingsPage } from "../features/settings/pages/settingsPage.js";

const routes = [
  { pattern: /^\/login$/, page: loginPage, params: [] },
  { pattern: /^\/register\/patient$/, page: patientRegistrationPage, params: [] },
  { pattern: /^\/register\/doctor$/, page: doctorRegistrationPage, params: [] },
  { pattern: /^\/dashboard$/, page: dashboardPage, params: [] },
  { pattern: /^\/patients$/, page: patientListPage, params: [] },
  { pattern: /^\/patients\/new$/, page: patientFormPage, params: [] },
  { pattern: /^\/patients\/([^/]+)\/edit$/, page: patientEditPage, params: ["id"] },
  { pattern: /^\/patients\/([^/]+)$/, page: patientDetailsPage, params: ["id"] },
  { pattern: /^\/appointments$/, page: appointmentListPage, params: [] },
  { pattern: /^\/appointments\/new$/, page: bookAppointmentPage, params: [] },
  { pattern: /^\/medical-records\/new$/, page: recordEntryPage, params: [] },
  { pattern: /^\/medical-records\/history$/, page: patientHistoryPage, params: [] },
  { pattern: /^\/staff$/, page: staffListPage, params: [] },
  { pattern: /^\/staff\/new$/, page: staffFormPage, params: [] },
  { pattern: /^\/staff\/([^/]+)\/edit$/, page: staffFormPage, params: ["staffKey"] },
  { pattern: /^\/profile$/, page: profilePage, params: [] },
  { pattern: /^\/reports$/, page: reportsPage, params: [] },
  { pattern: /^\/settings$/, page: settingsPage, params: [] }
];

export function getCurrentLocation() {
  const rawHash = window.location.hash.replace(/^#/, "") || routePaths.login;
  const normalized = rawHash.startsWith("/") ? rawHash : `/${rawHash}`;
  const url = new URL(`http://localhost${normalized}`);

  return {
    pathname: url.pathname,
    query: Object.fromEntries(url.searchParams.entries())
  };
}

export function resolveRoute(pathname) {
  for (const route of routes) {
    const match = pathname.match(route.pattern);

    if (match) {
      const params = route.params.reduce((accumulator, key, index) => {
        accumulator[key] = match[index + 1];
        return accumulator;
      }, {});

      return {
        page: route.page,
        params
      };
    }
  }

  return null;
}

export function navigate(path) {
  window.location.hash = path;
}
