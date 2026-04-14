import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import {
  renderMetricCard,
  renderPageHero,
  renderQuickAction,
  renderRecentAppointmentTimeline,
  renderRecentPatientTimeline,
  renderSectionCard,
  renderTimeline
} from "../../../shared/components/ui.js";
import { dashboardService } from "../services/dashboardService.js";

function getQuickActions(role) {
  const actions = [];

  if (role === roles.ADMIN || role === roles.RECEPTIONIST) {
    actions.push(
      renderQuickAction({
        title: "Add Patient",
        description: "Register a new patient record from the reception workflow.",
        href: routePaths.addPatient,
        icon: "bi-person-plus"
      }),
      renderQuickAction({
        title: "Schedule Appointment",
        description: "Book a doctor visit with the patient and date already selected.",
        href: routePaths.bookAppointment,
        icon: "bi-calendar-plus"
      })
    );
  }

  if (role === roles.DOCTOR || role === roles.ADMIN) {
    actions.push(
      renderQuickAction({
        title: "Add Medical Record",
        description: "Record diagnosis and treatment for the selected patient.",
        href: routePaths.addMedicalRecord,
        icon: "bi-journal-plus"
      })
    );
  }

  if (role === roles.ADMIN) {
    actions.push(
      renderQuickAction({
        title: "Manage Staff",
        description: "Create, edit, or review doctors, receptionists, and admin users.",
        href: routePaths.staff,
        icon: "bi-person-badge"
      }),
      renderQuickAction({
        title: "View Reports",
        description: "Inspect analytics, summaries, and module performance indicators.",
        href: routePaths.reports,
        icon: "bi-bar-chart-line"
      })
    );
  }

  if (role === roles.PATIENT) {
    actions.push(
      renderQuickAction({
        title: "Book Appointment",
        description: "Choose an available doctor and request a new visit.",
        href: routePaths.bookAppointment,
        icon: "bi-calendar-plus"
      }),
      renderQuickAction({
        title: "View Medical History",
        description: "Access your diagnosis and treatment records in one place.",
        href: routePaths.medicalHistory,
        icon: "bi-journal-medical"
      })
    );
  }

  return actions.join("");
}

export const dashboardPage = {
  title: "Dashboard",
  subtitle: "System overview, quick actions, and recent hospital activity.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT],

  async render(context) {
    const summary = await dashboardService.getSummary();

    return {
      title: "Dashboard",
      subtitle: "Overview cards, quick actions, and live operational activity.",
      content: `
        ${renderPageHero({
          eyebrow: "Hospital Overview",
          title: "Operational snapshot",
          subtitle: "Track patients, doctors, appointments, and recent workflow activity from one place.",
          actions: `
            <a class="btn btn-primary" href="#${routePaths.bookAppointment}">
              <i class="bi bi-calendar-plus me-2"></i>Schedule appointment
            </a>
          `
        })}

        <section class="metric-grid mb-4">
          ${renderMetricCard({
            label: "Total Patients",
            value: summary.totalPatients,
            note: "Registered patient records",
            icon: "bi-people-fill"
          })}
          ${renderMetricCard({
            label: "Total Doctors",
            value: summary.totalDoctors,
            note: "Available medical staff",
            icon: "bi-person-vcard-fill"
          })}
          ${renderMetricCard({
            label: "Appointments",
            value: summary.totalAppointments,
            note: "All scheduled visits",
            icon: "bi-calendar2-week-fill"
          })}
          ${renderMetricCard({
            label: "Today's Visits",
            value: summary.todaysAppointments,
            note: "Appointments due today",
            icon: "bi-sunrise"
          })}
          ${renderMetricCard({
            label: "Pending",
            value: summary.pendingAppointments,
            note: "Awaiting completion",
            icon: "bi-hourglass-split"
          })}
        </section>

        <section class="quick-actions-grid mb-4">
          ${getQuickActions(context.currentUser.role)}
        </section>

        <section class="chart-grid">
          ${renderSectionCard({
            title: "Recently registered patients",
            subtitle: "Latest registrations from the patient management module.",
            content: renderTimeline(summary.recentPatients, renderRecentPatientTimeline)
          })}
          ${renderSectionCard({
            title: "Latest appointments",
            subtitle: "Recent and upcoming appointment activity across the system.",
            content: renderTimeline(summary.latestAppointments, renderRecentAppointmentTimeline)
          })}
        </section>
      `
    };
  }
};
