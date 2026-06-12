import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { dashboardService } from "../../dashboard/services/dashboardService.js";
import { appointmentService } from "../../appointments/services/appointmentService.js";
import { renderMetricCard, renderPageHero, renderSectionCard, renderDataTable, renderTimeline, renderRecentAppointmentTimeline } from "../../../shared/components/ui.js";

function buildAppointmentRows(appointments) {
  return appointments.map((appointment) => `
    <tr>
      <td><strong>${appointment.patientName}</strong></td>
      <td>${appointment.doctorName}</td>
      <td>${appointment.appointmentDate}</td>
      <td>${appointment.appointmentTime}</td>
      <td>${appointment.status}</td>
    </tr>
  `);
}

export const receptionistPage = {
  title: "Receptionist Workspace",
  subtitle: "Scheduling, patient intake, and appointment coordination.",
  allowedRoles: [roles.RECEPTIONIST],

  async render(context) {
    const [summary, appointments] = await Promise.all([
      dashboardService.getSummary(context.currentUser),
      appointmentService.list({ receptionistId: context.currentUser.id })
    ]);

    return {
      title: "Receptionist Workspace",
      subtitle: "Schedule visits, register patients, and manage appointment requests.",
      content: `
        ${renderPageHero({
          eyebrow: "Front Desk",
          title: "Receptionist dashboard",
          subtitle: "Quick access to patient registration and appointment scheduling workflows.",
          actions: `
            <a class="btn btn-primary" href="#${routePaths.addPatient}">
              <i class="bi bi-person-plus me-2"></i>Add patient
            </a>
            <a class="btn btn-outline-secondary" href="#${routePaths.bookAppointment}">
              <i class="bi bi-calendar-plus me-2"></i>Schedule appointment
            </a>
          `
        })}

        <section class="metric-grid mb-4">
          ${renderMetricCard({ label: "Patients", value: summary.totalPatients, note: "Registered patients", icon: "bi-people-fill" })}
          ${renderMetricCard({ label: "Today's visits", value: summary.todaysAppointments, note: "Appointments due today", icon: "bi-sunrise" })}
          ${renderMetricCard({ label: "Pending", value: summary.pendingAppointments, note: "Appointments awaiting approval", icon: "bi-hourglass-split" })}
          ${renderMetricCard({ label: "Recent bookings", value: appointments.length, note: "Appointments booked by you", icon: "bi-calendar-check" })}
        </section>

        <section class="chart-grid">
          ${renderSectionCard({
            title: "Recent appointment requests",
            subtitle: "Appointments you have scheduled.",
            content: renderDataTable({
              headers: ["Patient", "Doctor", "Date", "Time", "Status"],
              rows: buildAppointmentRows(appointments),
              emptyMessage: "No appointments were booked with this receptionist account yet."
            })
          })}
          ${renderSectionCard({
            title: "Latest activity",
            subtitle: "Latest appointment workflow activity in the system.",
            content: renderTimeline(summary.latestAppointments, renderRecentAppointmentTimeline)
          })}
        </section>
      `
    };
  }
};
