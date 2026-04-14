import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { patientService } from "../services/patientService.js";
import { renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, setBusyState, renderInlineAlert } from "../../../utils/dom.js";
import { validatePatient } from "../../../utils/validators.js";
import { store } from "../../../shared/state/store.js";

export const patientFormPage = {
  title: "Add Patient",
  subtitle: "Register a new patient record with the documented demographic fields.",
  allowedRoles: [roles.ADMIN, roles.RECEPTIONIST],

  async render() {
    return {
      title: "Add Patient",
      subtitle: "Patient registration using name, age, gender, contact, and address.",
      content: `
        ${renderPageHero({
          eyebrow: "Patient Registration",
          title: "Create patient record",
          subtitle: "Capture the demographic data required by the patient module and database schema.",
          actions: `<a class="btn btn-outline-secondary" href="#${routePaths.patients}">Back to list</a>`
        })}

        <div class="detail-grid">
          ${renderSectionCard({
            title: "Patient details",
            subtitle: "Fields are aligned to the documented patient data requirements.",
            content: `
              <div id="patientFormAlert" class="mb-3"></div>
              <form id="patientForm" novalidate>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="full_name">Full name</label>
                    <input class="form-control" id="full_name" name="full_name" type="text">
                    <div class="invalid-feedback" data-error-for="full_name"></div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-semibold" for="age">Age</label>
                    <input class="form-control" id="age" name="age" type="number" min="0">
                    <div class="invalid-feedback" data-error-for="age"></div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-semibold" for="gender">Gender</label>
                    <select class="form-select" id="gender" name="gender">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div class="invalid-feedback" data-error-for="gender"></div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="phone">Phone</label>
                    <input class="form-control" id="phone" name="phone" type="tel">
                    <div class="invalid-feedback" data-error-for="phone"></div>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold" for="address">Address</label>
                    <textarea class="form-control" id="address" name="address" rows="4"></textarea>
                    <div class="invalid-feedback" data-error-for="address"></div>
                  </div>
                </div>
                <div class="d-flex gap-2 mt-4">
                  <button class="btn btn-primary" id="patientSubmit" type="submit">
                    <i class="bi bi-save me-2"></i>Save patient
                  </button>
                  <a class="btn btn-outline-secondary" href="#${routePaths.patients}">Cancel</a>
                </div>
              </form>
            `
          })}
          ${renderSectionCard({
            title: "Registration guidance",
            subtitle: "Keep the receptionist workflow fast and accurate.",
            content: `
              <ul class="summary-list">
                <li><i class="bi bi-check2-circle text-success"></i><span>Patient name must not be empty.</span></li>
                <li><i class="bi bi-check2-circle text-success"></i><span>Age must be a positive number.</span></li>
                <li><i class="bi bi-check2-circle text-success"></i><span>Contact and address help reception staff coordinate future visits.</span></li>
              </ul>
            `
          })}
        </div>
      `
    };
  },

  mount(root, context) {
    const form = qs("#patientForm", root);
    const submitButton = qs("#patientSubmit", root);
    const alertContainer = qs("#patientFormAlert", root);

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
        const patient = await patientService.create(payload);
        store.setFlash({
          type: "success",
          message: `${patient.full_name} was added successfully.`
        });
        context.navigate(`/patients/${patient.patient_id}`);
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
      } finally {
        setBusyState(submitButton, false);
      }
    });
  }
};
