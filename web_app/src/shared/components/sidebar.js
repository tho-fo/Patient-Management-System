import { appConfig } from "../../config/appConfig.js";
import { navigationItems, getBaseSection } from "../../core/constants/routes.js";
import { roleLabels } from "../../core/constants/roles.js";
import { escapeHtml, getInitials } from "../../utils/formatters.js";

export function renderSidebar({ user, pathname }) {
  const activePath = getBaseSection(pathname);
  const items = navigationItems
    .filter((item) => item.roles.includes(user.role))
    .map((item) => {
      const isActive = activePath === item.path;

      return `
        <a href="#${item.path}" class="${isActive ? "active" : ""}">
          <span class="d-flex align-items-center gap-3">
            <span class="nav-icon"><i class="bi ${escapeHtml(item.icon)}"></i></span>
            <span>${escapeHtml(item.label)}</span>
          </span>
          <i class="bi bi-chevron-right small"></i>
        </a>
      `;
    })
    .join("");

  return `
    <aside class="app-sidebar d-flex flex-column gap-4">
      <div class="sidebar-brand">
        <div class="brand-mark"><i class="bi bi-heart-pulse"></i></div>
        <h1>${escapeHtml(appConfig.appName)}</h1>
        <div class="sidebar-meta">${escapeHtml(appConfig.appSubtitle)}</div>
      </div>

      <nav class="sidebar-nav" aria-label="Primary">
        ${items}
      </nav>

      <div class="sidebar-user">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="brand-mark">${escapeHtml(getInitials(user.fullName))}</div>
          <div>
            <strong class="d-block">${escapeHtml(user.fullName)}</strong>
            <span class="sidebar-meta">${escapeHtml(user.email)}</span>
          </div>
        </div>
        <span class="role-chip ${escapeHtml(user.role)}">${escapeHtml(roleLabels[user.role])}</span>
        <button type="button" class="mt-3" data-logout>
          <span class="d-flex align-items-center gap-3">
            <span class="nav-icon"><i class="bi bi-box-arrow-right"></i></span>
            <span>Logout</span>
          </span>
          <i class="bi bi-chevron-right small"></i>
        </button>
      </div>
    </aside>
  `;
}
