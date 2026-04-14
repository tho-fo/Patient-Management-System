import { renderHeader } from "../components/header.js";
import { renderSidebar } from "../components/sidebar.js";

export function renderAppShell({ root, page, user, pathname, flash }) {
  root.innerHTML = `
    <div class="app-shell">
      ${renderSidebar({ user, pathname })}
      <div class="app-main">
        ${renderHeader({
          title: page.title,
          subtitle: page.subtitle,
          actions: page.actions ?? "",
          user
        })}
        <main class="page-content">
          <div class="app-overlay" data-sidebar-close></div>
          <div class="flash-banner mb-3">
            ${flash ? `<div class="alert alert-${flash.type ?? "info"}" role="alert">${flash.message}</div>` : ""}
          </div>
          ${page.content}
        </main>
      </div>
    </div>
  `;
}

export function bindAppShell(root, { onLogout }) {
  root.querySelectorAll("[data-sidebar-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      document.body.classList.add("sidebar-open");
    });
  });

  root.querySelectorAll("[data-sidebar-close]").forEach((button) => {
    button.addEventListener("click", () => {
      document.body.classList.remove("sidebar-open");
    });
  });

  root.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", onLogout);
  });

  root.querySelectorAll(".app-sidebar a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("sidebar-open");
    });
  });
}
