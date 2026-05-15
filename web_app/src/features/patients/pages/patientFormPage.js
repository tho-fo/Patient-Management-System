import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { patientService } from "../services/patientService.js";
import { renderKeyValueList, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { escapeHtml } from "../../../utils/formatters.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, setBusyState, renderInlineAlert } from "../../../utils/dom.js";
import { validatePatient } from "../../../utils/validators.js";
import { store } from "../../../shared/state/store.js";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function value(patient, field) {
  return escapeHtml(patient?.[field] ?? "");
}

function selected(currentValue, optionValue) {
  return currentValue === optionValue ? "selected" : "";
}

function renderPatientForm(patient = null) {
  return `
    <div id="patientFormAlert" class="mb-3"></div>
    <form id="patientForm" novalidate>
      <div class="d-grid gap-4">
        <fieldset>
          <legend class="form-section-title">Personal information</legend>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold" for="firstName">First name</label>
              <input class="form-control" id="firstName" name="firstName" type="text" value="${value(patient, "firstName")}">
              <div class="invalid-feedback" data-error-for="firstName"></div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold" for="lastName">Last name</label>
              <input class="form-control" id="lastName" name="lastName" type="text" value="${value(patient, "lastName")}">
              <div class="invalid-feedback" data-error-for="lastName"></div>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold" for="gender">Gender</label>
              <select class="form-select" id="gender" name="gender">
                <option value="">Select</option>
                <option value="Male" ${selected(patient?.gender, "Male")}>Male</option>
                <option value="Female" ${selected(patient?.gender, "Female")}>Female</option>
                <option value="Other" ${selected(patient?.gender, "Other")}>Other</option>
              </select>
              <div class="invalid-feedback" data-error-for="gender"></div>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold" for="dateOfBirth">Date of birth</label>
              <input class="form-control" id="dateOfBirth" name="dateOfBirth" type="date" value="${value(patient, "dateOfBirth")}">
              <div class="invalid-feedback" data-error-for="dateOfBirth"></div>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold" for="age">Age</label>
              <input class="form-control" id="age" name="age" type="number" min="0" value="${value(patient, "age")}" readonly>
              <div class="invalid-feedback" data-error-for="age"></div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend class="form-section-title">Contact information</legend>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold" for="phone">Phone</label>
              <input class="form-control" id="phone" name="phone" type="tel" value="${value(patient, "phone")}">
              <div class="invalid-feedback" data-error-for="phone"></div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold" for="email">Email</label>
              <input class="form-control" id="email" name="email" type="email" value="${value(patient, "email")}">
              <div class="invalid-feedback" data-error-for="email"></div>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold" for="address">Address</label>
              <textarea class="form-control" id="address" name="address" rows="3">${value(patient, "address")}</textarea>
              <div class="invalid-feedback" data-error-for="address"></div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend class="form-section-title">Medical information</legend>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold" for="bloodGroup">Blood group</label>
              <select class="form-select" id="bloodGroup" name="bloodGroup">
                <option value="">Select</option>
                ${bloodGroups.map((group) => `<option value="${group}" ${selected(patient?.bloodGroup, group)}>${group}</option>`).join("")}
              </select>
            </div>
            <div class="col-md-8">
              <label class="form-label fw-semibold" for="emergencyContact">Emergency contact</label>
              <input class="form-control" id="emergencyContact" name="emergencyContact" type="text" value="${value(patient, "emergencyContact")}">
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold" for="medicalCondition">Medical condition</label>
              <textarea class="form-control" id="medicalCondition" name="medicalCondition" rows="3">${value(patient, "medicalCondition")}</textarea>
            </div>
          </div>
        </fieldset>
      </div>

      <div class="d-flex gap-2 mt-4">
        <button class="btn btn-primary" id="patientSubmit" type="submit">
          <i class="bi bi-save me-2"></i>${patient ? "Save changes" : "Save patient"}
        </button>
        <a class="btn btn-outline-secondary" href="#${patient ? `/patients/${patient.patientId}` : routePaths.patients}">Cancel</a>
      </div>
    </form>
  `;
}

function bindPatientForm(root, context, patient = null) {
  const form = qs("#patientForm", root);
  const submitButton = qs("#patientSubmit", root);
  const alertContainer = qs("#patientFormAlert", root);
  const dateOfBirthInput = qs("#dateOfBirth", form);
  const ageInput = qs("#age", form);

  const syncAge = () => {
    ageInput.value = dateOfBirthInput.value ? calculateAge(dateOfBirthInput.value) : "";
  };

  dateOfBirthInput.addEventListener("change", syncAge);
  dateOfBirthInput.addEventListener("input", syncAge);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFormErrors(form);
    renderInlineAlert(alertContainer, "");

    const payload = formToObject(form);
    const errors = validatePatient(payload);

    if (Object.keys(errors).length > 0) {
      applyFormErrors(form, errors);
      return;
    }

    setBusyState(submitButton, true);

    try {
      const savedPatient = patient
        ? await patientService.update(patient.patientId, payload, context.currentUser)
        : await patientService.create(payload, context.currentUser);

      store.setFlash({
        type: "success",
        message: `${savedPatient.fullName} was ${patient ? "updated" : "added"} successfully.`
      });
      context.navigate(`/patients/${savedPatient.patientId}`);
    } catch (error) {
      renderInlineAlert(alertContainer, error.message);
    } finally {
      setBusyState(submitButton, false);
    }
  });
}

export const patientFormPage = {
  title: "Add Patient",
  subtitle: "Register a new patient record with the documented demographic fields.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],

  async render() {
    return {
      title: "Add Patient",
      subtitle: "Patient registration using personal, contact, and medical fields.",
      content: `
        ${renderPageHero({
          eyebrow: "Patient Registration",
          title: "Create patient record",
          subtitle: "Capture the patient information required by the patient management module.",
          actions: `<a class="btn btn-outline-secondary" href="#${routePaths.patients}">Back to list</a>`
        })}

        <div class="detail-grid">
          ${renderSectionCard({
            title: "Patient details",
            subtitle: "Required fields are first name, last name, gender, date of birth, and phone.",
            content: renderPatientForm()
          })}
          ${renderSectionCard({
            title: "Registration checks",
            subtitle: "The form validates inputs before saving to Firestore.",
            content: renderKeyValueList([
              { label: "Collection", value: "patients" },
              { label: "Age", value: "Auto-calculated from DOB" },
              { label: "Access", value: "Admin, Doctor, Receptionist" }
            ])
          })}
        </div>
      `
    };
  },

  mount(root, context) {
    bindPatientForm(root, context);
  }
};

export const patientEditPage = {
  title: "Edit Patient",
  subtitle: "Update an existing patient record.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],

  async render(context) {
    const patient = await patientService.getById(context.params.id);

    return {
      title: "Edit Patient",
      subtitle: `Update ${patient.fullName}.`,
      patient,
      content: `
        ${renderPageHero({
          eyebrow: "Patient Update",
          title: "Edit patient record",
          subtitle: "Review the existing patient data, make changes, and save updates to Firestore.",
          actions: `<a class="btn btn-outline-secondary" href="#/patients/${patient.patientId}">Back to profile</a>`
        })}

        ${renderSectionCard({
          title: patient.fullName,
          subtitle: `Patient #${patient.patientId}`,
          content: renderPatientForm(patient)
        })}
      `
    };
  },

  mount(root, context, page) {
    bindPatientForm(root, context, page?.patient);
  }
};
