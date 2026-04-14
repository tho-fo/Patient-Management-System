import { routePaths } from "./core/constants/routes.js";
import { isRoleAllowed } from "./core/constants/roles.js";
import { authService } from "./features/auth/services/authService.js";
import { renderLoading } from "./shared/components/ui.js";
import { renderAppShell, bindAppShell } from "./shared/layouts/appShell.js";
import { store } from "./shared/state/store.js";
import { getCurrentLocation, navigate, resolveRoute } from "./routes/router.js";

const root = document.getElementById("app");
let cleanup = null;

function renderErrorPage(message) {
  root.innerHTML = `
    <section class="auth-page">
      <div class="auth-card mx-auto" style="max-width: 720px;">
        <span class="eyebrow light mb-4">Application Error</span>
        <h1 class="page-title mb-3">Unable to load page</h1>
        <p class="page-subtitle mb-4">${message}</p>
        <a class="btn btn-primary" href="#${routePaths.dashboard}">Return to dashboard</a>
      </div>
    </section>
  `;
}

async function handleLogout() {
  try {
    await authService.logout();
  } finally {
    store.clearSession();
    store.setFlash({
      type: "success",
      message: "You have been logged out successfully."
    });
    navigate(routePaths.login);
  }
}

async function renderApp() {
  document.body.classList.remove("sidebar-open");
  const flash = store.consumeFlash();
  const { pathname, query } = getCurrentLocation();
  const resolved = resolveRoute(pathname);
  const currentUser = store.getCurrentUser();

  if (!resolved) {
    renderErrorPage("The requested page could not be found.");
    return;
  }

  if (!resolved.page.public && !currentUser) {
    navigate(routePaths.login);
    return;
  }

  if (resolved.page.public && currentUser) {
    navigate(routePaths.dashboard);
    return;
  }

  if (currentUser && resolved.page.allowedRoles && !isRoleAllowed(currentUser.role, resolved.page.allowedRoles)) {
    store.setFlash({
      type: "warning",
      message: "Your current role does not have access to that page."
    });
    navigate(routePaths.dashboard);
    return;
  }

  if (cleanup) {
    cleanup();
    cleanup = null;
  }

  const context = {
    currentUser,
    params: resolved.params,
    query,
    flash,
    navigate
  };

  try {
    if (!resolved.page.public) {
      renderAppShell({
        root,
        page: {
          title: resolved.page.title,
          subtitle: resolved.page.subtitle ?? "Loading...",
          content: renderLoading("Loading page...")
        },
        user: currentUser,
        pathname,
        flash: null
      });
      bindAppShell(root, { onLogout: handleLogout });
    }

    const page = await resolved.page.render(context);

    if (resolved.page.public) {
      root.innerHTML = page.content;
    } else {
      renderAppShell({
        root,
        page,
        user: currentUser,
        pathname,
        flash
      });
      bindAppShell(root, { onLogout: handleLogout });
    }

    cleanup = resolved.page.mount?.(root, context, page) || null;
  } catch (error) {
    if (currentUser) {
      renderAppShell({
        root,
        page: {
          title: resolved.page.title,
          subtitle: resolved.page.subtitle ?? "",
          content: `<div class="alert alert-danger" role="alert">${error.message}</div>`
        },
        user: currentUser,
        pathname,
        flash: null
      });
      bindAppShell(root, { onLogout: handleLogout });
    } else {
      renderErrorPage(error.message || "An unexpected error occurred.");
    }
  }
}

window.addEventListener("hashchange", renderApp);
window.addEventListener("DOMContentLoaded", () => {
  if (!window.location.hash) {
    navigate(store.isAuthenticated() ? routePaths.dashboard : routePaths.login);
    return;
  }

  renderApp();
});
