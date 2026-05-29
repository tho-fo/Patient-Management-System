import { escapeHtml, formatDate, formatDateTime, formatNumber, formatTime, getStatusTone } from "../../utils/formatters.js";

export function renderStatusPill(status) {
  const tone = getStatusTone(status);
  return `<span class="status-pill ${tone}">${escapeHtml(status)}</span>`;
}

export function renderPageHero({ eyebrow, title, subtitle, actions = "" }) {
  return `
    <section class="hero-panel mb-4">
      <div class="d-flex flex-column flex-xl-row justify-content-between gap-3 align-items-start">
        <div>
          ${eyebrow ? `<span class="eyebrow light mb-3">${escapeHtml(eyebrow)}</span>` : ""}
          <h1 class="page-title">${escapeHtml(title)}</h1>
          <p class="page-subtitle mt-2 mb-0">${escapeHtml(subtitle)}</p>
        </div>
        <div class="hero-actions">${actions}</div>
      </div>
    </section>
  `;
}

export function renderMetricCard({ label, value, note, icon = "bi-activity" }) {
  return `
    <article class="metric-card">
      <div class="d-flex align-items-center justify-content-between">
        <span class="metric-label">${escapeHtml(label)}</span>
        <i class="bi ${escapeHtml(icon)} text-soft"></i>
      </div>
      <div class="metric-value">${escapeHtml(formatNumber(value))}</div>
      <div class="metric-note">${escapeHtml(note)}</div>
    </article>
  `;
}

export function renderSectionCard({ title, subtitle = "", actions = "", content = "", className = "" }) {
  return `
    <section class="section-card ${className}">
      <div class="section-heading">
        <div>
          <h2>${escapeHtml(title)}</h2>
          ${subtitle ? `<p class="section-subtitle mb-0">${escapeHtml(subtitle)}</p>` : ""}
        </div>
        ${actions}
      </div>
      ${content}
    </section>
  `;
}

export function renderEmptyState({ title, description, action = "" }) {
  return `
    <div class="empty-state">
      <h3 class="h5 mb-2">${escapeHtml(title)}</h3>
      <p class="text-soft mb-3">${escapeHtml(description)}</p>
      ${action}
    </div>
  `;
}

export function renderLoading(message = "Loading data...") {
  return `
    <div class="loading-shell">
      <div class="d-flex align-items-center gap-3 text-soft">
        <div class="spinner-border text-info" role="status" aria-hidden="true"></div>
        <span>${escapeHtml(message)}</span>
      </div>
    </div>
  `;
}

export function renderDataTable({ headers, rows, emptyMessage, action = "" }) {
  if (!rows.length) {
    return renderEmptyState({
      title: "No records found",
      description: emptyMessage,
      action
    });
  }

  return `
    <div class="table-shell">
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>${headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderTimeline(items, formatter) {
  if (!items.length) {
    return renderEmptyState({
      title: "Nothing to display yet",
      description: "New activity will appear here as soon as records are created."
    });
  }

  return `
    <ul class="timeline-list">
      ${items.map((item) => formatter(item)).join("")}
    </ul>
  `;
}

export function renderQuickAction({ title, description, href, icon = "bi-arrow-right-circle" }) {
  return `
    <a class="quick-action-card d-block" href="#${href}">
      <div class="d-flex align-items-start justify-content-between gap-3">
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p class="mb-0">${escapeHtml(description)}</p>
        </div>
        <i class="bi ${escapeHtml(icon)} fs-4 text-soft"></i>
      </div>
    </a>
  `;
}

export function renderKeyValueList(items) {
  return `
    <ul class="key-value-list">
      ${items.map((item) => `
        <li>
          <span class="text-soft">${escapeHtml(item.label)}</span>
          <strong class="text-end">${escapeHtml(item.value ?? "-")}</strong>
        </li>
      `).join("")}
    </ul>
  `;
}

export function renderChartBars(items) {
  if (!items.length) {
    return renderEmptyState({
      title: "No chart data",
      description: "Adjust the filters to load more report data."
    });
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return `
    <div class="chart-stack">
      ${items.map((item) => `
        <div class="chart-bar">
          <strong>${escapeHtml(item.label)}</strong>
          <div class="chart-track">
            <div class="chart-fill" style="width: ${(item.value / max) * 100}%"></div>
          </div>
          <span class="text-soft fw-semibold">${escapeHtml(formatNumber(item.value))}</span>
        </div>
      `).join("")}
    </div>
  `;
}

export function renderAppointmentRow(appointment) {
  return `
    <tr>
      <td><strong>${escapeHtml(appointment.patientName)}</strong></td>
      <td>${escapeHtml(appointment.doctorName)}</td>
      <td>${escapeHtml(formatDate(appointment.appointmentDate))}</td>
      <td>${escapeHtml(formatTime(appointment.appointmentTime))}</td>
      <td>${renderStatusPill(appointment.status)}</td>
      <td class="text-end">${appointment.actions ?? ""}</td>
    </tr>
  `;
}

export function renderTimelineItem({ title, subtitle, meta, body }) {
  return `
    <li class="timeline-item">
      <span class="timeline-marker" aria-hidden="true"></span>
      <div class="timeline-content">
        <div class="d-flex justify-content-between gap-3 flex-wrap">
          <div>
            <strong>${escapeHtml(title)}</strong>
            <div class="text-soft">${escapeHtml(subtitle)}</div>
          </div>
          <span class="text-soft fw-semibold">${escapeHtml(meta)}</span>
        </div>
        ${body ? `<p class="mb-0 mt-2">${escapeHtml(body)}</p>` : ""}
      </div>
    </li>
  `;
}

export function renderModal({ id, title, body, footer }) {
  return `
    <div class="modal fade" id="${escapeHtml(id)}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header">
            <h2 class="modal-title fs-5">${escapeHtml(title)}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">${body}</div>
          <div class="modal-footer">${footer}</div>
        </div>
      </div>
    </div>
  `;
}

export function renderRecentPatientTimeline(patient) {
  return renderTimelineItem({
    title: patient.fullName,
    subtitle: `${patient.gender} - ${patient.age} years`,
    meta: formatDate(patient.createdAt),
    body: `${patient.phone} - ${patient.address}`
  });
}

export function renderRecentAppointmentTimeline(appointment) {
  return renderTimelineItem({
    title: `${appointment.patientName} with ${appointment.doctorName}`,
    subtitle: formatDateTime(appointment.appointmentDate, appointment.appointmentTime),
    meta: appointment.status,
    body: appointment.status === "Pending" ? "Awaiting consultation." : "Updated in the appointment workflow."
  });
}

export function renderAuditLogTimeline(log) {
  return renderTimelineItem({
    title: log.action,
    subtitle: log.userEmail,
    meta: formatDateTime(log.timestamp),
    body: log.details
  });
}

export function renderLineChart(items, label = "Trend") {
  if (!items.length) {
    return renderEmptyState({
      title: "No chart data",
      description: "Adjust the date range to load more data."
    });
  }

  const max = Math.max(...items.map((item) => item.value), 1);
  const points = items
    .map((item, index) => {
      const height = (item.value / max) * 100;
      return `
        <div class="chart-point" title="${escapeHtml(item.label)}: ${formatNumber(item.value)}">
          <div class="chart-bar-mini" style="height: ${height}%"></div>
          <span class="text-soft x-axis-label">${escapeHtml(item.label)}</span>
        </div>
      `;
    })
    .join("");

  return `
    <div class="chart-line">
      <div class="chart-container">
        ${points}
      </div>
    </div>
  `;
}

export function renderPieChart(items) {
  if (!items.length) {
    return renderEmptyState({
      title: "No chart data",
      description: "Staff distribution will appear once data is available."
    });
  }

  const total = items.reduce((sum, item) => sum + item.value, 0);
  const colors = ["#0d6efd", "#198754", "#fd7e14", "#dc3545", "#6f42c1", "#17a2b8"];

  const segments = items
    .map((item, index) => {
      const percentage = (item.value / total) * 100;
      return {
        label: item.label,
        value: item.value,
        percentage: percentage.toFixed(1),
        color: colors[index % colors.length]
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const legend = segments
    .map(
      (seg, index) =>
        `
    <div class="pie-legend-item">
      <span class="pie-legend-color" style="background-color: ${seg.color}"></span>
      <span class="pie-legend-label">${escapeHtml(seg.label)}</span>
      <span class="pie-legend-value">${formatNumber(seg.value)} (${seg.percentage}%)</span>
    </div>
  `
    )
    .join("");

  return `
    <div class="chart-pie-container">
      <div class="pie-legend">
        ${legend}
      </div>
    </div>
  `;
}

export function renderAdminQuickActions() {
  return `
    <div class="quick-actions-grid">
      ${renderQuickAction({
        title: "Add New Staff",
        description: "Register a new doctor or receptionist to the system.",
        href: "/staff/new",
        icon: "bi-person-plus-fill"
      })}
      ${renderQuickAction({
        title: "System Settings",
        description: "Configure app settings and manage role permissions.",
        href: "/settings",
        icon: "bi-gear-fill"
      })}
      ${renderQuickAction({
        title: "Generate Report",
        description: "Download analytics and appointment summaries.",
        href: "/reports",
        icon: "bi-file-earmark-pdf"
      })}
      ${renderQuickAction({
        title: "View Audit Logs",
        description: "Monitor user activity and system security events.",
        href: "/audit-logs",
        icon: "bi-shield-check"
      })}
    </div>
  `;
}
