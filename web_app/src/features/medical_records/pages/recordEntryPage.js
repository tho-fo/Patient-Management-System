import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { medicalRecordService } from "../services/medicalRecordService.js";
import { patientService } from "../../patients/services/patientService.js";
import { userService } from "../../users/services/userService.js";
import { renderDataTable, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { validateMedicalRecord } from "../../../utils/validators.js";
import { store } from "../../../shared/state/store.js";

function buildPatientOptions(patients) {
  return patients.map((patient) => `<option value="${patient.patient_id}">${patient.full_name} - #${patient.patient_id}</option>`).join("");
}

function buildDoctorOptions(doctors) {
  return doctors.map((doctor) => `<option value="${doctor.staff_key}">${doctor.full_name} - ${doctor.specialization}</option>`).join("");
}

export const recordEntryPage = {
  title: "Medical Record Entry",
  subtitle: "Record diagnosis and treatment for the selected patient.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR],

  async render(context) {
    const [patients, doctors] = await Promise.all([
      patientService.list(),
      userService.list({ role: roles.DOCTOR })
    ]);

    const currentDoctorValue = context.currentUser.role === roles.DOCTOR ? `doctor-${context.currentUser.id}` : "";

    return {
      title: "Medical Record Entry",
      subtitle: "Document diagnosis and treatment while referencing prior patient history.",
      content: `
        ${renderPageHero({
          eyebrow: "Medical Records",
          title: "Create medical record",
          subtitle: "Doctors can add diagnosis and treatment details while reviewing previous clinical history.",
          actions: `<a class="btn btn-outline-secondary" href="#${routePaths.medicalHistory}">View history</a>`
        })}

        <div class="detail-grid">
          ${renderSectionCard({
            title: "Clinical record form",
            subtitle: "Patient, doctor, diagnosis, and treatment are all required.",
            content: `
              <div id="recordFormAlert" class="mb-3"></div>
              <form id="recordForm" novalidate>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="record_patient_id">Patient</label>
                    <select class="form-select" id="record_patient_id" name="patient_id">
                      <option value="">Select patient</option>
                      ${buildPatientOptions(patients)}
                    </select>
                    <div class="invalid-feedback" data-error-for="patient_id"></div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="record_doctor_id">Doctor</label>
                    <select class="form-select" id="record_doctor_id" name="doctor_id" ${context.currentUser.role === roles.DOCTOR ? "disabled" : ""}>
                      <option value="">Select doctor</option>
                      ${buildDoctorOptions(doctors)}
                    </select>
                    <div class="invalid-feedback" data-error-for="doctor_id"></div>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold" for="diagnosis">Diagnosis</label>
                    <textarea class="form-control" id="diagnosis" name="diagnosis" rows="4"></textarea>
                    <div class="invalid-feedback" data-error-for="diagnosis"></div>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold" for="treatment">Treatment</label>
                    <textarea class="form-control" id="treatment" name="treatment" rows="4"></textarea>
                    <div class="invalid-feedback" data-error-for="treatment"></div>
                  </div>
                </div>
                ${currentDoctorValue ? `<input type="hidden" name="doctor_id" value="${currentDoctorValue}">` : ""}
                <div class="d-flex gap-2 mt-4">
                  <button class="btn btn-primary" id="recordSubmit" type="submit"><i class="bi bi-save me-2"></i>Save record</button>
                  <a class="btn btn-outline-secondary" href="#${routePaths.medicalHistory}">Cancel</a>
                </div>
              </form>
            `
          })}

          ${renderSectionCard({
            title: "Patient history preview",
            subtitle: "Recent medical records for the currently selected patient.",
            content: `<div id="historyPreview">${renderDataTable({
              headers: ["Patient", "Doctor", "Diagnosis", "Treatment", "Date", "Actions"],
              rows: [],
              emptyMessage: "Select a patient to preview existing medical history."
            })}</div>`
          })}
        </div>
      `
    };
  },

  mount(root, context) {
    const form = qs("#recordForm", root);
    const submitButton = qs("#recordSubmit", root);
    const alertContainer = qs("#recordFormAlert", root);
    const patientSelect = qs("#record_patient_id", root);
    const historyPreview = qs("#historyPreview", root);

    const refreshHistory = async () => {
      const patientId = patientSelect.value;
      if (!patientId) {
        historyPreview.innerHTML = renderDataTable({
          headers: ["Patient", "Doctor", "Diagnosis", "Treatment", "Date", "Actions"],
          rows: [],
          emptyMessage: "Select a patient to preview existing medical history."
        });
        return;
      }

      const records = await medicalRecordService.list({ patient_id: patientId });
      historyPreview.innerHTML = renderDataTable({
        headers: ["Patient", "Doctor", "Diagnosis", "Treatment", "Date", "Actions"],
        rows: records.slice(0, 5).map((record) => `
          <tr>
            <td>${record.patient_name}</td>
            <td>${record.doctor_name}</td>
            <td>${record.diagnosis}</td>
            <td>${record.treatment}</td>
            <td>${new Date(record.record_date).toLocaleDateString()}</td>
            <td class="text-end">Existing</td>
          </tr>
        `),
        emptyMessage: "No medical records exist for this patient yet."
      });
    };

    patientSelect.addEventListener("change", refreshHistory);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(form);
      renderInlineAlert(alertContainer, "");

      const payload = formToObject(form);
      if (payload.doctor_id) {
        payload.doctor_id = payload.doctor_id.split("-")[1];
      }
      const errors = validateMedicalRecord(payload);

      if (Object.keys(errors).length > 0) {
        applyFormErrors(form, errors);
        return;
      }

      setBusyState(submitButton, true);

      try {
        await medicalRecordService.create(payload);
        store.setFlash({
          type: "success",
          message: "Medical record saved successfully."
        });
        context.navigate(routePaths.medicalHistory);
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
      } finally {
        setBusyState(submitButton, false);
      }
    });
  }
};
