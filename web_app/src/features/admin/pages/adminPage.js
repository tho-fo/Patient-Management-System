import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { dashboardService } from "../../dashboard/services/dashboardService.js";
import { renderMetricCard, renderPageHero, renderSectionCard, renderTimeline, renderRecentPatientTimeline, renderRecentAppointmentTimeline } from "../../../shared/components/ui.js";

export const adminPage = {
  title: "Admin Panel",
  subtitle: "System administration, staff oversight, and reporting.",
  allowedRoles: [roles.ADMIN],

  async render() {
    const summary = await dashboardService.getSummary();

    return {
      title: "Admin Panel",
      subtitle: "Monitor hospital activity and manage core system workflows.",
      content: `
        ${renderPageHero({
          eyebrow: "Admin Console",
          title: "System administration",
          subtitle: "Review user activity, monitor system health, and access staff management tools.",
          actions: `
            <a class="btn btn-primary" href="#${routePaths.staff}">
              <i class="bi bi-person-badge me-2"></i>Manage staff
            </a>
            <a class="btn btn-outline-secondary" href="#${routePaths.reports}">
              <i class="bi bi-bar-chart-line me-2"></i>View reports
            </a>
          `
        })}

        <section class="metric-grid mb-4">
          ${renderMetricCard({ label: "Patients", value: summary.totalPatients, note: "Registered patient records", icon: "bi-people-fill" })}
          ${renderMetricCard({ label: "Doctors", value: summary.totalDoctors, note: "Active medical staff", icon: "bi-person-workspace" })}
          ${renderMetricCard({ label: "Appointments", value: summary.totalAppointments, note: "Scheduled visits", icon: "bi-calendar2-week-fill" })}
          ${renderMetricCard({ label: "Pending", value: summary.pendingAppointments, note: "Requests awaiting approval", icon: "bi-hourglass-split" })}
        </section>

        <section class="chart-grid">
          ${renderSectionCard({
            title: "Recent patient registrations",
            subtitle: "Latest patient onboarding activity.",
            content: renderTimeline(summary.recentPatients, renderRecentPatientTimeline)
          })}
          ${renderSectionCard({
            title: "Recent appointments",
            subtitle: "Recent appointment activity across the system.",
            content: renderTimeline(summary.latestAppointments, renderRecentAppointmentTimeline)
          })}
        </section>
      `
    };
  }
};
