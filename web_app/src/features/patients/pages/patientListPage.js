import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { patientService } from "../services/patientService.js";
import { renderDataTable, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { formatDate } from "../../../utils/formatters.js";
import { qs, formToObject } from "../../../utils/dom.js";

function canManagePatients(role) {
  return role === roles.ADMIN || role === roles.RECEPTIONIST;
}

function buildRows(patients, role) {
  return patients.map((patient) => `
    <tr>
      <td>#${patient.patient_id}</td>
      <td><strong>${patient.full_name}</strong></td>
      <td>${patient.age}</td>
      <td>${patient.gender}</td>
      <td>${patient.phone}</td>
      <td>${formatDate(patient.created_at)}</td>
      <td class="text-end">
        <a class="btn btn-sm btn-outline-primary me-2" href="#/patients/${patient.patient_id}">View</a>
        ${canManagePatients(role) ? `<button class="btn btn-sm btn-outline-danger" data-delete-patient="${patient.patient_id}" type="button">Delete</button>` : ""}
      </td>
    </tr>
  `);
}

export const patientListPage = {
  title: "Patients",
  subtitle: "Search, review, and manage registered patient records.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],

  async render(context) {
    const patients = await patientService.list();

    return {
      title: "Patient Management",
      subtitle: "Patient list, search, filters, and record access.",
      content: `
        ${renderPageHero({
          eyebrow: "Patient Module",
          title: "Patient records",
          subtitle: "Search by patient name or ID and filter by registration date.",
          actions: canManagePatients(context.currentUser.role)
            ? `<a class="btn btn-primary" href="#${routePaths.addPatient}"><i class="bi bi-person-plus me-2"></i>Add patient</a>`
            : ""
        })}

        ${renderSectionCard({
          title: "Search and filter",
          subtitle: "Find patients by name, identifier, or registration date.",
          content: `
            <form id="patientFilterForm" class="filter-bar mb-4">
              <div class="row g-3 align-items-end">
                <div class="col-lg-6">
                  <label class="form-label fw-semibold" for="search">Search</label>
                  <input class="form-control" id="search" name="search" type="text" placeholder="Name or patient ID">
                </div>
                <div class="col-lg-3">
                  <label class="form-label fw-semibold" for="createdDate">Registration date</label>
                  <input class="form-control" id="createdDate" name="createdDate" type="date">
                </div>
                <div class="col-lg-3 d-flex gap-2">
                  <button class="btn btn-primary flex-fill" type="submit">Apply</button>
                  <button class="btn btn-outline-secondary" id="patientFilterReset" type="button">Reset</button>
                </div>
              </div>
            </form>
            <div id="patientTableRegion">
              ${renderDataTable({
                headers: ["ID", "Name", "Age", "Gender", "Contact", "Registered", "Actions"],
                rows: buildRows(patients, context.currentUser.role),
                emptyMessage: "Create a patient to see records in the patient list."
              })}
            </div>
          `
        })}
      `
    };
  },

  mount(root, context) {
    const form = qs("#patientFilterForm", root);
    const tableRegion = qs("#patientTableRegion", root);
    const resetButton = qs("#patientFilterReset", root);

    const renderTable = async (filters = {}) => {
      const patients = await patientService.list(filters);
      tableRegion.innerHTML = renderDataTable({
        headers: ["ID", "Name", "Age", "Gender", "Contact", "Registered", "Actions"],
        rows: buildRows(patients, context.currentUser.role),
        emptyMessage: "No patients matched the current filters."
      });
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await renderTable(formToObject(form));
    });

    resetButton.addEventListener("click", async () => {
      form.reset();
      await renderTable();
    });

    tableRegion.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-delete-patient]");
      if (!button) {
        return;
      }

      const patientId = button.dataset.deletePatient;
      const confirmed = window.confirm("Delete this patient record?");
      if (!confirmed) {
        return;
      }

      try {
        await patientService.remove(patientId);
        await renderTable(formToObject(form));
      } catch (error) {
        window.alert(error.message);
      }
    });
  }
};
