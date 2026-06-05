import { appConfig } from "../../../config/appConfig.js";
import { routePaths } from "../../../core/constants/routes.js";
import { authService } from "../services/authService.js";
import { store } from "../../../shared/state/store.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, setBusyState, renderInlineAlert } from "../../../utils/dom.js";
import { validateLogin } from "../../../utils/validators.js";

export const loginPage = {
  public: true,
  title: "Login",

  async render(context) {
    return {
      layout: "auth",
      content: `
        <section class="auth-page">
          <aside class="auth-showcase d-flex flex-column">
            <div class="brand-mark mb-4"><i class="bi bi-heart-pulse"></i></div>
            <span class="eyebrow mb-4">Hospital Operations</span>
            <h1 class="display-5 fw-bold mb-3">${appConfig.appName}</h1>
            <p class="fs-5 text-white-50 mb-4">
              Clean, fast access to patient registration, appointment scheduling, medical records, staff administration, and reporting.
            </p>
            <ul class="auth-list text-white-50">
              <li><i class="bi bi-check2-circle"></i><span>Secure login for Admin, Doctor, Receptionist, and Patient roles.</span></li>
              <li><i class="bi bi-check2-circle"></i><span>Single operational dashboard with documented module navigation.</span></li>
              <li><i class="bi bi-check2-circle"></i><span>Bootstrap-based, desktop-first UI with mobile support.</span></li>
            </ul>
            <div class="demo-credentials mt-auto p-4">
              <h2 class="h5 mb-3">Account access</h2>
              <p class="small text-white-50 mb-0">Login here, or create a Patient, Doctor, or Receptionist account from the registration options.</p>
            </div>
          </aside>

          <section class="auth-card d-flex flex-column justify-content-center">
            <span class="eyebrow light mb-4">Authentication</span>
            <h2 class="page-title mb-2">Sign in to continue</h2>
            <p class="page-subtitle mb-4">
              Use your registered email and password to access the Patient Management System.
            </p>

            ${context.flash ? `<div class="alert alert-${context.flash.type ?? "info"}" role="alert">${context.flash.message}</div>` : ""}

            <div id="loginAlert" class="mb-3"></div>

            <form id="loginForm" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold" for="email">Email address</label>
                <input class="form-control form-control-lg" id="email" name="email" type="email" placeholder="name@hospital.local">
                <div class="invalid-feedback" data-error-for="email"></div>
              </div>
              <div class="mb-4">
                <label class="form-label fw-semibold" for="password">Password</label>
                <input class="form-control form-control-lg" id="password" name="password" type="password" placeholder="Enter your password">
                <div class="invalid-feedback" data-error-for="password"></div>
              </div>
              <button class="btn btn-primary btn-lg w-100" type="submit" id="loginSubmit">
                <i class="bi bi-box-arrow-in-right me-2"></i>Login
              </button>
              <div class="auth-register-actions mt-4">
                <a class="btn btn-outline-primary w-100" href="#${routePaths.registerPatient}">
                  <i class="bi bi-person-plus me-2"></i>Register as Patient
                </a>
                <a class="btn btn-outline-primary w-100" href="#${routePaths.registerDoctor}">
                  <i class="bi bi-person-badge me-2"></i>Register as Doctor
                </a>
                <a class="btn btn-outline-primary w-100" href="#${routePaths.registerReceptionist}">
                  <i class="bi bi-headset me-2"></i>Register as Receptionist
                </a>
              </div>
            </form>
          </section>
        </section>
      `
    };
  },

  mount(root, context) {
    const form = qs("#loginForm", root);
    const submitButton = qs("#loginSubmit", root);
    const alertContainer = qs("#loginAlert", root);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(form);
      renderInlineAlert(alertContainer, "");

      const payload = formToObject(form);
      const errors = validateLogin(payload);

      if (Object.keys(errors).length > 0) {
        applyFormErrors(form, errors);
        return;
      }

      setBusyState(submitButton, true, "Signing in...");

      try {
        const session = await authService.login(payload);
        store.setSession(session);
        store.setFlash({
          type: "success",
          message: `Welcome back, ${session.user.fullName}.`
        });
        context.navigate(routePaths.dashboard);
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
      } finally {
        setBusyState(submitButton, false);
      }
    });
  }
};
