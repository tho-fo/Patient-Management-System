import { escapeHtml, formatDate } from "../../utils/formatters.js";
import { roleLabels } from "../../core/constants/roles.js";

export function renderHeader({ title, subtitle, actions = "", user }) {
  return `
    <header class="app-header">
      <div class="header-card">
        <div class="d-flex align-items-start gap-3">
          <button class="btn btn-outline-secondary sidebar-toggle" type="button" data-sidebar-toggle aria-label="Toggle sidebar">
            <i class="bi bi-list fs-4"></i>
          </button>
          <div>
            <h1 class="page-title">${escapeHtml(title)}</h1>
            <p class="page-subtitle mt-2 mb-0">${escapeHtml(subtitle)}</p>
          </div>
        </div>
        <div class="header-meta">
          <div class="header-meta-card">
            <strong>Today</strong>
            <span>${escapeHtml(formatDate(new Date()))}</span>
          </div>
          <div class="header-meta-card">
            <strong>Active role</strong>
            <span>${escapeHtml(roleLabels[user.role])}</span>
          </div>
          <div class="page-actions">${actions}</div>
        </div>
      </div>
    </header>
  `;
}
