import { appConfig } from "../../../config/appConfig.js";
import { routePaths } from "../../../core/constants/routes.js";
import { authService } from "../services/authService.js";
import { store } from "../../../shared/state/store.js";
import { qs, qsa, formToObject, clearFormErrors, applyFormErrors, renderInlineAlert } from "../../../utils/dom.js";
import { escapeHtml } from "../../../utils/formatters.js";
import { validateRegistrationStep } from "../../../utils/validators.js";

const genderOptions = ["Male", "Female", "Other"];
const specializationOptions = ["General Medicine", "Cardiology", "Pediatrics", "Orthopedics", "Dermatology", "Neurology"];

function renderOptions(options, placeholder) {
  return `
    <option value="">${escapeHtml(placeholder)}</option>
    ${options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
  `;
}

function fieldMarkup(field) {
  const common = `
    id="${escapeHtml(field.name)}"
    name="${escapeHtml(field.name)}"
    ${field.required ? "required" : ""}
  `;

  if (field.type === "select") {
    return `
      <select class="form-select form-select-lg" ${common}>
        ${renderOptions(field.options, field.placeholder)}
      </select>
    `;
  }

  if (field.type === "textarea") {
    return `<textarea class="form-control form-control-lg" rows="3" ${common} placeholder="${escapeHtml(field.placeholder ?? "")}"></textarea>`;
  }

  return `<input class="form-control form-control-lg" type="${escapeHtml(field.type)}" ${common} placeholder="${escapeHtml(field.placeholder ?? "")}">`;
}

function renderStep(step, index) {
  return `
    <fieldset class="registration-step ${index === 0 ? "active" : ""}" data-step-panel="${index}">
      <legend class="h5 fw-bold mb-1">${escapeHtml(step.title)}</legend>
      <p class="page-subtitle mb-4">${escapeHtml(step.description)}</p>
      <div class="row g-3">
        ${step.fields.map((field) => `
          <div class="${escapeHtml(field.className ?? "col-12")}">
            <label class="form-label fw-semibold" for="${escapeHtml(field.name)}">${escapeHtml(field.label)}</label>
            ${fieldMarkup(field)}
            <div class="invalid-feedback" data-error-for="${escapeHtml(field.name)}"></div>
          </div>
        `).join("")}
      </div>
    </fieldset>
  `;
}

function renderProgress(steps) {
  return `
    <ol class="registration-progress" aria-label="Registration steps">
      ${steps.map((step, index) => `
        <li class="${index === 0 ? "active" : ""}" data-step-indicator="${index}">
          <span>${index + 1}</span>
          <strong>${escapeHtml(step.shortTitle)}</strong>
        </li>
      `).join("")}
    </ol>
  `;
}

function renderReviewList(payload, fields) {
  return `
    <ul class="key-value-list registration-review-list">
      ${fields.map((field) => {
        const value = field.secret ? "Entered securely" : payload[field.name];
        return `
          <li>
            <span class="text-soft">${escapeHtml(field.label)}</span>
            <strong class="text-end">${escapeHtml(value || "-")}</strong>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function createRegistrationPage(config) {
  return {
    public: true,
    title: config.title,

    async render() {
      return {
        layout: "auth",
        content: `
          <section class="auth-page">
            <aside class="auth-showcase d-flex flex-column">
              <div class="brand-mark mb-4"><i class="bi ${escapeHtml(config.icon)}"></i></div>
              <span class="eyebrow mb-4">${escapeHtml(config.eyebrow)}</span>
              <h1 class="display-5 fw-bold mb-3">${escapeHtml(appConfig.appName)}</h1>
              <p class="fs-5 text-white-50 mb-4">${escapeHtml(config.showcaseText)}</p>
              <ul class="auth-list text-white-50">
                ${config.sourceNotes.map((note) => `<li><i class="bi bi-check2-circle"></i><span>${escapeHtml(note)}</span></li>`).join("")}
              </ul>
              <div class="demo-credentials mt-auto p-4">
                <h2 class="h5 mb-3">Secure registration</h2>
                <p class="small text-white-50 mb-0">Account details are validated before the profile is created.</p>
              </div>
            </aside>

            <section class="auth-card auth-card-wide d-flex flex-column justify-content-center">
              <div class="d-flex justify-content-between gap-3 align-items-start mb-4">
                <div>
                  <span class="eyebrow light mb-4">${escapeHtml(config.eyebrow)}</span>
                  <h2 class="page-title mb-2">${escapeHtml(config.title)}</h2>
                  <p class="page-subtitle mb-0">${escapeHtml(config.subtitle)}</p>
                </div>
                <a class="btn btn-outline-secondary flex-shrink-0" href="#${routePaths.login}">
                  <i class="bi bi-arrow-left me-2"></i>Login
                </a>
              </div>

              ${renderProgress(config.steps)}
              <div id="registrationAlert" class="mb-3"></div>

              <form id="registrationForm" novalidate>
                ${config.steps.map(renderStep).join("")}

                <fieldset class="registration-step" data-step-panel="${config.steps.length}">
                  <legend class="h5 fw-bold mb-1">Review & Submit</legend>
                  <p class="page-subtitle mb-4">Confirm the details before creating the account.</p>
                  <div id="registrationReview" class="registration-review"></div>
                </fieldset>

                <div class="d-flex gap-2 mt-4">
                  <button class="btn btn-outline-secondary btn-lg" id="registrationBack" type="button" disabled>
                    <i class="bi bi-arrow-left me-2"></i>Back
                  </button>
                  <button class="btn btn-primary btn-lg ms-auto" id="registrationNext" type="button">
                    Next<i class="bi bi-arrow-right ms-2"></i>
                  </button>
                  <button class="btn btn-primary btn-lg ms-auto d-none" id="registrationSubmit" type="submit">
                    <i class="bi bi-check2-circle me-2"></i>Submit
                  </button>
                </div>
              </form>
            </section>
          </section>
        `
      };
    },

    mount(root) {
      const form = qs("#registrationForm", root);
      const alertContainer = qs("#registrationAlert", root);
      const backButton = qs("#registrationBack", root);
      const nextButton = qs("#registrationNext", root);
      const submitButton = qs("#registrationSubmit", root);
      const reviewContainer = qs("#registrationReview", root);
      const panels = qsa("[data-step-panel]", root);
      const indicators = qsa("[data-step-indicator]", root);
      const reviewIndex = config.steps.length;
      let currentStep = 0;

      const allFields = config.steps.flatMap((step) => step.fields);

      const updateReview = () => {
        reviewContainer.innerHTML = renderReviewList(formToObject(form), allFields);
      };

      const syncStep = () => {
        panels.forEach((panel, index) => {
          panel.classList.toggle("active", index === currentStep);
        });
        indicators.forEach((indicator, index) => {
          indicator.classList.toggle("active", index === currentStep);
          indicator.classList.toggle("completed", index < currentStep);
        });
        backButton.disabled = currentStep === 0;
        nextButton.classList.toggle("d-none", currentStep === reviewIndex);
        submitButton.classList.toggle("d-none", currentStep !== reviewIndex);

        if (currentStep === reviewIndex) {
          updateReview();
        }
      };

      const validateCurrentStep = () => {
        clearFormErrors(form);
        renderInlineAlert(alertContainer, "");

        const step = config.steps[currentStep];
        if (!step) {
          return true;
        }

        const errors = validateRegistrationStep(formToObject(form), step.fields.map((field) => field.name));
        if (Object.keys(errors).length) {
          applyFormErrors(form, errors);
          return false;
        }

        return true;
      };

      nextButton.addEventListener("click", () => {
        if (!validateCurrentStep()) {
          return;
        }

        currentStep = Math.min(currentStep + 1, reviewIndex);
        syncStep();
      });

      backButton.addEventListener("click", () => {
        currentStep = Math.max(currentStep - 1, 0);
        renderInlineAlert(alertContainer, "");
        syncStep();
      });

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearFormErrors(form);
        renderInlineAlert(alertContainer, "");

        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Creating account...`;

        try {
          const session = await config.register(formToObject(form));
          store.setSession(session);
          store.setFlash({
            type: "success",
            message: config.successMessage
          });
          window.location.hash = routePaths.dashboard;
        } catch (error) {
          renderInlineAlert(alertContainer, error.message);
          submitButton.disabled = false;
          submitButton.innerHTML = `<i class="bi bi-check2-circle me-2"></i>Submit`;
        }
      });
    }
  };
}

export const patientRegistrationPage = createRegistrationPage({
  title: "Patient Registration",
  eyebrow: "Patient Registration",
  icon: "bi-person-plus",
  subtitle: "Create a patient self-service account with demographic, contact, and account setup details.",
  showcaseText: "Fast patient onboarding supports the documented flow: register patient, schedule appointment, treat patient, and store records.",
  sourceNotes: [
    "Patient module supports registration, profile access, appointments, and records.",
    "Data requirements identify patient name, gender, phone, email, and address.",
    "Authentication screens use email and password."
  ],
  successMessage: "Patient registration UI submitted successfully.",
  register: authService.registerPatient,
  steps: [
    {
      title: "Basic Information",
      shortTitle: "Basic",
      description: "Capture the patient identity details used during registration.",
      fields: [
        { name: "firstName", label: "First Name", type: "text", placeholder: "Enter first name", className: "col-md-6", required: true },
        { name: "lastName", label: "Last Name", type: "text", placeholder: "Enter last name", className: "col-md-6", required: true },
        { name: "gender", label: "Gender", type: "select", placeholder: "Select gender", options: genderOptions, className: "col-md-6", required: true },
        { name: "dateOfBirth", label: "Date of Birth", type: "date", className: "col-md-6", required: true }
      ]
    },
    {
      title: "Contact Information",
      shortTitle: "Contact",
      description: "Add contact details for patient communication and profile records.",
      fields: [
        { name: "phone", label: "Phone Number", type: "tel", placeholder: "Enter phone number", className: "col-md-6", required: true },
        { name: "email", label: "Email", type: "email", placeholder: "name@example.com", className: "col-md-6", required: true },
        { name: "address", label: "Address", type: "textarea", placeholder: "Enter residential address", required: true }
      ]
    },
    {
      title: "Account Setup",
      shortTitle: "Account",
      description: "Set the password fields for the future authentication connection.",
      fields: [
        { name: "password", label: "Password", type: "password", placeholder: "Enter password", className: "col-md-6", required: true, secret: true },
        { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm password", className: "col-md-6", required: true, secret: true }
      ]
    }
  ]
});

export const doctorRegistrationPage = createRegistrationPage({
  title: "Doctor Registration",
  eyebrow: "Doctor Registration",
  icon: "bi-person-badge",
  subtitle: "Create a doctor account with personal, professional, contact, and account setup details.",
  showcaseText: "Doctor onboarding supports documented medical workflows: view appointments, access records, add diagnosis, and prescribe treatment.",
  sourceNotes: [
    "Doctor module supports patient care, appointments, diagnosis, and treatment.",
    "Data requirements identify doctor name, specialization, phone, and email.",
    "Authentication screens use email and password."
  ],
  successMessage: "Doctor registration UI submitted successfully.",
  register: authService.registerDoctor,
  steps: [
    {
      title: "Personal Information",
      shortTitle: "Personal",
      description: "Capture the doctor identity details needed for a staff profile.",
      fields: [
        { name: "firstName", label: "First Name", type: "text", placeholder: "Enter first name", className: "col-md-6", required: true },
        { name: "lastName", label: "Last Name", type: "text", placeholder: "Enter last name", className: "col-md-6", required: true },
        { name: "gender", label: "Gender", type: "select", placeholder: "Select gender", options: genderOptions, required: true }
      ]
    },
    {
      title: "Professional Information",
      shortTitle: "Professional",
      description: "Add professional details before contact and account setup.",
      fields: [
        { name: "specialization", label: "Specialization", type: "select", placeholder: "Select specialization", options: specializationOptions, required: true },
        { name: "licenseNumber", label: "License Number", type: "text", placeholder: "Enter license number", className: "col-md-6", required: true },
        { name: "yearsOfExperience", label: "Years of Experience", type: "number", placeholder: "Enter years", className: "col-md-6", required: true }
      ]
    },
    {
      title: "Contact Information",
      shortTitle: "Contact",
      description: "Add the doctor contact details used by staff and scheduling workflows.",
      fields: [
        { name: "phone", label: "Phone Number", type: "tel", placeholder: "Enter phone number", className: "col-md-6", required: true },
        { name: "email", label: "Email", type: "email", placeholder: "doctor@hospital.local", className: "col-md-6", required: true }
      ]
    },
    {
      title: "Account Setup",
      shortTitle: "Account",
      description: "Set password fields for the future authentication connection.",
      fields: [
        { name: "password", label: "Password", type: "password", placeholder: "Enter password", className: "col-md-6", required: true, secret: true },
        { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm password", className: "col-md-6", required: true, secret: true }
      ]
    }
  ]
});
