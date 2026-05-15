import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { patientService } from "../services/patientService.js";
import { renderDataTable, renderModal, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { escapeHtml, formatDate, getInitials } from "../../../utils/formatters.js";
import { qs, formToObject } from "../../../utils/dom.js";

function canManagePatients(role) {
  return role === roles.ADMIN || role === roles.DOCTOR || role === roles.RECEPTIONIST;
}

function buildRows(patients, role) {
  return patients.map((patient) => `
    <tr>
      <td>
        <div class="patient-cell">
          <span class="patient-avatar-sm">${escapeHtml(getInitials(patient.fullName))}</span>
          <div>
            <strong>${escapeHtml(patient.fullName)}</strong>
            <div class="text-soft small">#${escapeHtml(patient.patientId)}</div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(patient.gender)}</td>
      <td>${escapeHtml(patient.age)}</td>
      <td>${escapeHtml(patient.phone)}</td>
      <td>${escapeHtml(patient.bloodGroup || "-")}</td>
      <td>${formatDate(patient.createdAt)}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm" role="group" aria-label="Patient actions">
          <a class="btn btn-outline-primary" href="#/patients/${patient.patientId}" title="View patient"><i class="bi bi-eye"></i></a>
          ${canManagePatients(role) ? `
            <a class="btn btn-outline-secondary" href="#/patients/${patient.patientId}/edit" title="Edit patient"><i class="bi bi-pencil"></i></a>
            <button class="btn btn-outline-danger" data-delete-patient="${patient.patientId}" data-patient-name="${escapeHtml(patient.fullName)}" type="button" title="Delete patient"><i class="bi bi-trash"></i></button>
          ` : ""}
        </div>
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
          subtitle: "Search patients by name, phone, or email and filter key demographics.",
          actions: canManagePatients(context.currentUser.role)
            ? `<a class="btn btn-primary" href="#${routePaths.addPatient}"><i class="bi bi-person-plus me-2"></i>Add patient</a>`
            : ""
        })}

        ${renderSectionCard({
          title: "Search and filter",
          subtitle: "Find patients quickly during registration, appointments, or clinical review.",
          content: `
            <form id="patientFilterForm" class="filter-bar mb-4">
              <div class="row g-3 align-items-end">
                <div class="col-lg-5">
                  <label class="form-label fw-semibold" for="search">Search</label>
                  <input class="form-control" id="search" name="search" type="search" placeholder="Name, phone, or email">
                </div>
                <div class="col-lg-2">
                  <label class="form-label fw-semibold" for="gender">Gender</label>
                  <select class="form-select" id="gender" name="gender">
                    <option value="">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="col-lg-2">
                  <label class="form-label fw-semibold" for="bloodGroup">Blood group</label>
                  <select class="form-select" id="bloodGroup" name="bloodGroup">
                    <option value="">All</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div class="col-lg-3 d-flex gap-2">
                  <button class="btn btn-primary flex-fill" type="submit">Apply</button>
                  <button class="btn btn-outline-secondary" id="patientFilterReset" type="button">Reset</button>
                </div>
              </div>
            </form>
            <div id="patientTableRegion">
              ${renderDataTable({
                headers: ["Patient", "Gender", "Age", "Phone", "Blood", "Registered", "Actions"],
                rows: buildRows(patients, context.currentUser.role),
                emptyMessage: "Create a patient to see records in the patient list."
              })}
            </div>
          `
        })}

        ${renderModal({
          id: "deletePatientModal",
          title: "Delete patient",
          body: `<p class="mb-0">Are you sure you want to delete this patient?</p><p class="text-soft mb-0 mt-2" id="deletePatientName"></p>`,
          footer: `
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDeletePatient">Delete patient</button>
          `
        })}
      `
    };
  },

  mount(root, context) {
    const form = qs("#patientFilterForm", root);
    const tableRegion = qs("#patientTableRegion", root);
    const resetButton = qs("#patientFilterReset", root);
    const confirmDeleteButton = qs("#confirmDeletePatient", root);
    const deletePatientName = qs("#deletePatientName", root);
    const deleteModalElement = qs("#deletePatientModal", root);
    const deleteModal = window.bootstrap ? new window.bootstrap.Modal(deleteModalElement) : null;
    let selectedPatientId = null;

    const renderTable = async (filters = {}) => {
      const patients = await patientService.list(filters);
      tableRegion.innerHTML = renderDataTable({
        headers: ["Patient", "Gender", "Age", "Phone", "Blood", "Registered", "Actions"],
        rows: buildRows(patients, context.currentUser.role),
        emptyMessage: "No patients matched the current filters."
      });
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await renderTable(formToObject(form));
    });

    form.search.addEventListener("input", async () => {
      await renderTable(formToObject(form));
    });

    resetButton.addEventListener("click", async () => {
      form.reset();
      await renderTable();
    });

    tableRegion.addEventListener("click", (event) => {
      const button = event.target.closest("[data-delete-patient]");
      if (!button) {
        return;
      }

      selectedPatientId = button.dataset.deletePatient;
      deletePatientName.textContent = button.dataset.patientName ? `Patient: ${button.dataset.patientName}` : "";
      deleteModal?.show();
    });

    confirmDeleteButton.addEventListener("click", async () => {
      if (!selectedPatientId) {
        return;
      }

      try {
        await patientService.remove(selectedPatientId);
        selectedPatientId = null;
        deleteModal?.hide();
        await renderTable(formToObject(form));
      } catch (error) {
        window.alert(error.message);
      }
    });
  }
};
