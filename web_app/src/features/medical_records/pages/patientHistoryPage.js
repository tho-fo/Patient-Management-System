import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { medicalRecordService } from "../services/medicalRecordService.js";
import { patientService } from "../../patients/services/patientService.js";
import { userService } from "../../users/services/userService.js";
import { renderDataTable, renderModal, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { validateMedicalRecord } from "../../../utils/validators.js";

function canEditRecords(role) {
  return role === roles.ADMIN || role === roles.DOCTOR;
}

function buildPatientOptions(patients) {
  return patients.map((patient) => `<option value="${patient.patientId}">${patient.fullName} - #${patient.patientId}</option>`).join("");
}

function buildDoctorOptions(doctors) {
  return doctors.map((doctor) => `<option value="${doctor.staffKey}">${doctor.fullName} - ${doctor.specialization}</option>`).join("");
}

function buildRows(records, role) {
  return records.map((record) => `
    <tr>
      <td>${record.patientName}</td>
      <td>${record.doctorName}</td>
      <td>${record.diagnosis}</td>
      <td>${record.treatment}</td>
      <td>${new Date(record.recordDate).toLocaleDateString()}</td>
      <td class="text-end">
        ${canEditRecords(role) ? `<button class="btn btn-sm btn-outline-primary" type="button" data-edit-record="${record.recordId}">Edit</button>` : ""}
      </td>
    </tr>
  `);
}

export const patientHistoryPage = {
  title: "Patient History",
  subtitle: "Patient medical history, diagnoses, and treatment records.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT],

  async render(context) {
    const [patients, doctors, records] = await Promise.all([
      patientService.list(),
      userService.list({ role: roles.DOCTOR }),
      medicalRecordService.list(context.currentUser.role === roles.PATIENT ? { patientId: context.currentUser.id } : {})
    ]);

    return {
      title: "Patient History",
      subtitle: "View patient medical history and update records where permitted.",
      content: `
        ${renderPageHero({
          eyebrow: "History View",
          title: "Medical history",
          subtitle: "Review diagnoses, treatments, and the doctors linked to each clinical record.",
          actions: canEditRecords(context.currentUser.role)
            ? `<a class="btn btn-primary" href="#${routePaths.addMedicalRecord}"><i class="bi bi-journal-plus me-2"></i>Add record</a>`
            : ""
        })}

        ${renderSectionCard({
          title: "History records",
          subtitle: "Filter records by patient to narrow down the clinical history view.",
          content: `
            ${context.currentUser.role !== roles.PATIENT ? `
              <form id="historyFilterForm" class="filter-bar mb-4">
                <div class="row g-3 align-items-end">
                  <div class="col-lg-8">
                    <label class="form-label fw-semibold" for="history_patientId">Patient</label>
                    <select class="form-select" id="history_patientId" name="patientId">
                      <option value="">All patients</option>
                      ${buildPatientOptions(patients)}
                    </select>
                  </div>
                  <div class="col-lg-4 d-flex gap-2">
                    <button class="btn btn-primary flex-fill" type="submit">Apply</button>
                    <button class="btn btn-outline-secondary" id="historyFilterReset" type="button">Reset</button>
                  </div>
                </div>
              </form>
            ` : ""}
            <div id="historyTableRegion">
              ${renderDataTable({
                headers: ["Patient", "Doctor", "Diagnosis", "Treatment", "Date", "Actions"],
                rows: buildRows(records, context.currentUser.role),
                emptyMessage: "No medical records matched the current selection."
              })}
            </div>
          `
        })}

        ${canEditRecords(context.currentUser.role) ? renderModal({
          id: "recordEditModal",
          title: "Edit medical record",
          body: `
            <div id="recordModalAlert" class="mb-3"></div>
            <form id="recordEditForm" novalidate>
              <input type="hidden" name="recordId" id="modal_recordId">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="modal_record_patientId">Patient</label>
                  <select class="form-select" id="modal_record_patientId" name="patientId">
                    <option value="">Select patient</option>
                    ${buildPatientOptions(patients)}
                  </select>
                  <div class="invalid-feedback" data-error-for="patientId"></div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="modal_record_doctorId">Doctor</label>
                  <select class="form-select" id="modal_record_doctorId" name="doctorId">
                    <option value="">Select doctor</option>
                    ${buildDoctorOptions(doctors)}
                  </select>
                  <div class="invalid-feedback" data-error-for="doctorId"></div>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold" for="modal_diagnosis">Diagnosis</label>
                  <textarea class="form-control" id="modal_diagnosis" name="diagnosis" rows="4"></textarea>
                  <div class="invalid-feedback" data-error-for="diagnosis"></div>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold" for="modal_treatment">Treatment</label>
                  <textarea class="form-control" id="modal_treatment" name="treatment" rows="4"></textarea>
                  <div class="invalid-feedback" data-error-for="treatment"></div>
                </div>
              </div>
            </form>
          `,
          footer: `
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" form="recordEditForm" class="btn btn-primary" id="recordUpdateButton">Save changes</button>
          `
        }) : ""}
      `
    };
  },

  mount(root, context) {
    const filterForm = qs("#historyFilterForm", root);
    const resetButton = qs("#historyFilterReset", root);
    const tableRegion = qs("#historyTableRegion", root);
    const scopedFilter = context.currentUser.role === roles.PATIENT ? { patientId: context.currentUser.id } : {};

    const loadRecords = async (extra = {}) => {
      const records = await medicalRecordService.list({ ...scopedFilter, ...extra });
      tableRegion.innerHTML = renderDataTable({
        headers: ["Patient", "Doctor", "Diagnosis", "Treatment", "Date", "Actions"],
        rows: buildRows(records, context.currentUser.role),
        emptyMessage: "No medical records matched the current selection."
      });
      return records;
    };

    filterForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      await loadRecords(formToObject(filterForm));
    });

    resetButton?.addEventListener("click", async () => {
      filterForm.reset();
      await loadRecords();
    });

    if (!canEditRecords(context.currentUser.role)) {
      return;
    }

    const modalElement = qs("#recordEditModal", root);
    const modalForm = qs("#recordEditForm", root);
    const updateButton = qs("#recordUpdateButton", root);
    const alertContainer = qs("#recordModalAlert", root);
    const modalInstance = new window.bootstrap.Modal(modalElement);

    tableRegion.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-edit-record]");
      if (!button) {
        return;
      }

      const records = await loadRecords(filterForm ? formToObject(filterForm) : {});
      const record = records.find((item) => Number(item.recordId) === Number(button.dataset.editRecord));
      if (!record) {
        return;
      }

      modalForm.reset();
      renderInlineAlert(alertContainer, "");
      qs("#modal_recordId", modalForm).value = record.recordId;
      qs("#modal_record_patientId", modalForm).value = record.patientId;
      qs("#modal_record_doctorId", modalForm).value = `doctor-${record.doctorId}`;
      qs("#modal_diagnosis", modalForm).value = record.diagnosis;
      qs("#modal_treatment", modalForm).value = record.treatment;
      modalInstance.show();
    });

    modalForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(modalForm);
      renderInlineAlert(alertContainer, "");

      const payload = formToObject(modalForm);
      payload.doctorId = payload.doctorId.split("-")[1];
      const errors = validateMedicalRecord(payload);
      if (Object.keys(errors).length > 0) {
        applyFormErrors(modalForm, errors);
        return;
      }

      setBusyState(updateButton, true);

      try {
        await medicalRecordService.update(payload.recordId, payload);
        modalInstance.hide();
        await loadRecords(filterForm ? formToObject(filterForm) : {});
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
      } finally {
        setBusyState(updateButton, false);
      }
    });
  }
};
