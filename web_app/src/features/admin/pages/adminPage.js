import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { dashboardService } from "../../dashboard/services/dashboardService.js";
import {
  renderMetricCard,
  renderPageHero,
  renderSectionCard,
  renderTimeline,
  renderRecentPatientTimeline,
  renderRecentAppointmentTimeline,
  renderAuditLogTimeline,
  renderChartBars,
  renderLineChart,
  renderPieChart,
  renderAdminQuickActions,
  renderEmptyState
} from "../../../shared/components/ui.js";

export const adminPage = {
  title: "Admin Panel",
  subtitle: "System administration, staff oversight, and reporting.",
  allowedRoles: [roles.ADMIN],

  async render() {
    const [summary, appointmentTrends, staffDistribution, patientGrowth, auditLogs, todayAppointments, pendingAppointments] = await Promise.all([
      dashboardService.getSummary().catch(() => ({})),
      dashboardService.getAppointmentTrends().catch(() => ({ trends: [] })),
      dashboardService.getStaffDistribution().catch(() => ({ distribution: [] })),
      dashboardService.getPatientGrowth().catch(() => ({ growth: [] })),
      dashboardService.getAuditLogs(5).catch(() => ({ logs: [] })),
      dashboardService.getTodayAppointments().catch(() => ({ appointments: [] })),
      dashboardService.getPendingAppointments().catch(() => ({ count: 0 }))
    ]);

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

        <!-- Section 1: Key Performance Indicators -->
        <section class="metric-grid mb-5">
          ${renderMetricCard({
            label: "Total Patients",
            value: summary.totalPatients ?? 0,
            note: "Registered patient records",
            icon: "bi-people-fill"
          })}
          ${renderMetricCard({
            label: "Active Staff",
            value: (summary.totalDoctors ?? 0) + (summary.totalReceptionists ?? 0),
            note: "Doctors & Receptionists",
            icon: "bi-person-workspace"
          })}
          ${renderMetricCard({
            label: "Today's Appointments",
            value: todayAppointments.appointments?.length ?? 0,
            note: "Scheduled for today",
            icon: "bi-calendar2-day-fill"
          })}
          ${renderMetricCard({
            label: "Pending Appointments",
            value: pendingAppointments.count ?? summary.pendingAppointments ?? 0,
            note: "Awaiting approval",
            icon: "bi-hourglass-split"
          })}
        </section>

        <!-- Section 2: Operational Analytics (Charts) -->
        <section class="analytics-section mb-5">
          <h2 class="section-title mb-4">Operational Analytics</h2>
          <div class="analytics-grid">
            ${renderSectionCard({
              title: "Appointment Volume Trend",
              subtitle: "Weekly/Monthly appointment scheduling patterns.",
              className: "analytics-card",
              content:
                appointmentTrends.trends && appointmentTrends.trends.length > 0
                  ? renderLineChart(appointmentTrends.trends, "Appointments")
                  : renderEmptyState({
                      title: "No data available",
                      description: "Appointment trends will appear as data accumulates."
                    })
            })}
            ${renderSectionCard({
              title: "Staff Distribution by Specialization",
              subtitle: "Breakdown of doctors by medical specialization.",
              className: "analytics-card",
              content:
                staffDistribution.distribution && staffDistribution.distribution.length > 0
                  ? renderPieChart(staffDistribution.distribution)
                  : renderEmptyState({
                      title: "No staff data",
                      description: "Staff distribution will appear once doctors are registered."
                    })
            })}
            ${renderSectionCard({
              title: "Patient Growth Trend",
              subtitle: "Monthly new patient registration patterns.",
              className: "analytics-card",
              content:
                patientGrowth.growth && patientGrowth.growth.length > 0
                  ? renderLineChart(patientGrowth.growth, "New Patients")
                  : renderEmptyState({
                      title: "No growth data",
                      description: "Patient growth trends will appear as registrations occur."
                    })
            })}
          </div>
        </section>

        <!-- Section 3: Recent Activity & Management -->
        <section class="activity-section mb-5">
          <h2 class="section-title mb-4">Recent Activity & Management</h2>
          <div class="activity-grid">
            ${renderSectionCard({
              title: "Latest Registered Patients",
              subtitle: "Most recent patient onboarding activity.",
              content:
                summary.recentPatients && summary.recentPatients.length > 0
                  ? renderTimeline(summary.recentPatients, renderRecentPatientTimeline)
                  : renderEmptyState({
                      title: "No patients yet",
                      description: "New patient registrations will appear here."
                    })
            })}
            ${renderSectionCard({
              title: "Upcoming Appointments",
              subtitle: "Next scheduled appointments across the hospital.",
              content:
                summary.latestAppointments && summary.latestAppointments.length > 0
                  ? renderTimeline(summary.latestAppointments, renderRecentAppointmentTimeline)
                  : renderEmptyState({
                      title: "No upcoming appointments",
                      description: "Scheduled appointments will appear here as they are created."
                    })
            })}
            ${renderSectionCard({
              title: "System Audit Logs",
              subtitle: "Recent logins, record updates, and security events.",
              content:
                auditLogs.logs && auditLogs.logs.length > 0
                  ? renderTimeline(auditLogs.logs, renderAuditLogTimeline)
                  : renderEmptyState({
                      title: "No audit logs",
                      description: "User activity and system events will be logged here."
                    })
            })}
          </div>
        </section>

        <!-- Section 4: Quick Actions -->
        <section class="quick-actions-section">
          <h2 class="section-title mb-4">Admin Quick Actions</h2>
          ${renderAdminQuickActions()}
        </section>
      `
    };
  }
};
