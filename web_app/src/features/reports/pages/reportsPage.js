import { roles } from "../../../core/constants/roles.js";
import { reportService } from "../services/reportService.js";
import {
  renderChartBars,
  renderDataTable,
  renderMetricCard,
  renderPageHero,
  renderSectionCard
} from "../../../shared/components/ui.js";
import { qs, formToObject } from "../../../utils/dom.js";

function renderReportBlocks(data) {
  return `
    <section class="metric-grid mb-4">
      ${renderMetricCard({
        label: "Patients",
        value: data.totals.patients,
        note: "Registered patient records",
        icon: "bi-people-fill"
      })}
      ${renderMetricCard({
        label: "Appointments",
        value: data.totals.appointments,
        note: "Appointments in current report view",
        icon: "bi-calendar2-week-fill"
      })}
      ${renderMetricCard({
        label: "Completed",
        value: data.totals.completed,
        note: "Completed consultations",
        icon: "bi-check-circle-fill"
      })}
      ${renderMetricCard({
        label: "Pending",
        value: data.totals.pending,
        note: "Appointments awaiting action",
        icon: "bi-hourglass-split"
      })}
      ${renderMetricCard({
        label: "Doctors",
        value: data.doctorLoad.length,
        note: "Doctors represented in this report",
        icon: "bi-person-vcard-fill"
      })}
    </section>

    <section class="chart-grid mb-4">
      ${renderSectionCard({
        title: "Appointment status summary",
        subtitle: "Quick status distribution for the selected report filters.",
        content: renderChartBars(data.statusSummary)
      })}
      ${renderSectionCard({
        title: "Doctor workload",
        subtitle: "Appointments currently assigned to each doctor.",
        content: renderChartBars(data.doctorLoad)
      })}
    </section>

    <section class="chart-grid">
      ${renderSectionCard({
        title: "Patient registration trend",
        subtitle: "Registrations across the latest seven-day window.",
        content: renderChartBars(data.patientGrowth)
      })}
      ${renderSectionCard({
        title: "Latest appointments",
        subtitle: "Recent appointments included in this report snapshot.",
        content: renderDataTable({
          headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
          rows: data.latestAppointments.map((appointment) => `
            <tr>
              <td>${appointment.patient_name}</td>
              <td>${appointment.doctor_name}</td>
              <td>${appointment.appointment_date}</td>
              <td>${appointment.appointment_time}</td>
              <td>${appointment.status}</td>
              <td class="text-end">Summary</td>
            </tr>
          `),
          emptyMessage: "No appointments were returned for the selected report filters."
        })
      })}
    </section>
  `;
}

export const reportsPage = {
  title: "Reports",
  subtitle: "Analytics dashboard, filters, and operational summaries.",
  allowedRoles: [roles.ADMIN],

  async render() {
    const data = await reportService.getAnalytics();

    return {
      title: "Reports & Analytics",
      subtitle: "Filter-driven summaries for patients, appointments, and workload distribution.",
      content: `
        ${renderPageHero({
          eyebrow: "Reports Module",
          title: "Operational analytics",
          subtitle: "Use date and status filters to review system-wide summaries and activity patterns."
        })}

        ${renderSectionCard({
          title: "Report filters",
          subtitle: "Filter analytics by date range and appointment status.",
          content: `
            <form id="reportsFilterForm" class="filter-bar mb-4">
              <div class="row g-3 align-items-end">
                <div class="col-lg-4">
                  <label class="form-label fw-semibold" for="from">From</label>
                  <input class="form-control" id="from" name="from" type="date">
                </div>
                <div class="col-lg-4">
                  <label class="form-label fw-semibold" for="to">To</label>
                  <input class="form-control" id="to" name="to" type="date">
                </div>
                <div class="col-lg-2">
                  <label class="form-label fw-semibold" for="status">Status</label>
                  <select class="form-select" id="status" name="status">
                    <option value="">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div class="col-lg-2 d-flex gap-2">
                  <button class="btn btn-primary flex-fill" type="submit">Apply</button>
                  <button class="btn btn-outline-secondary" id="reportsReset" type="button">Reset</button>
                </div>
              </div>
            </form>
            <div id="reportsRegion">
              ${renderReportBlocks(data)}
            </div>
          `
        })}
      `
    };
  },

  mount(root) {
    const form = qs("#reportsFilterForm", root);
    const resetButton = qs("#reportsReset", root);
    const region = qs("#reportsRegion", root);

    const refreshReports = async (filters = {}) => {
      const data = await reportService.getAnalytics(filters);
      region.innerHTML = renderReportBlocks(data);
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await refreshReports(formToObject(form));
    });

    resetButton.addEventListener("click", async () => {
      form.reset();
      await refreshReports();
    });
  }
};
