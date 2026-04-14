import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { patientService } from "../services/patientService.js";
import {
  renderDataTable,
  renderKeyValueList,
  renderPageHero,
  renderRecentAppointmentTimeline,
  renderSectionCard,
  renderTimeline
} from "../../../shared/components/ui.js";
import { formatDate } from "../../../utils/formatters.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { validatePatient } from "../../../utils/validators.js";
import { store } from "../../../shared/state/store.js";

function canManagePatients(role) {
  return role === roles.ADMIN || role === roles.RECEPTIONIST;
}

function buildAppointmentRows(appointments) {
  return appointments.slice(0, 5).map((appointment) => `
    <tr>
      <td>${appointment.doctor_name}</td>
      <td>${formatDate(appointment.appointment_date)}</td>
      <td>${appointment.appointment_time}</td>
      <td>${appointment.status}</td>
    </tr>
  `);
}

function buildMedicalRecordRows(records) {
  return records.slice(0, 5).map((record) => `
    <tr>
      <td>${record.doctor_name}</td>
      <td>${record.diagnosis}</td>
      <td>${record.treatment}</td>
      <td>${formatDate(record.record_date)}</td>
    </tr>
  `);
}

export const patientDetailsPage = {
  title: "Patient Details",
  subtitle: "Patient demographics, related appointments, and medical history.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],

  async render(context) {
    const patient = await patientService.getById(context.params.id);
    const editable = canManagePatients(context.currentUser.role);

    return {
      title: patient.full_name,
      subtitle: "Patient details, history preview, and record maintenance.",
      content: `
        ${renderPageHero({
          eyebrow: "Patient Profile",
          title: patient.full_name,
          subtitle: "Review demographics, recent appointments, and medical history from a single record view.",
          actions: `
            <a class="btn btn-primary" href="#${routePaths.bookAppointment}"><i class="bi bi-calendar-plus me-2"></i>Book appointment</a>
            <a class="btn btn-outline-secondary" href="#${routePaths.medicalHistory}">View history</a>
          `
        })}

        <div class="detail-grid">
          <div class="d-grid gap-3">
            ${renderSectionCard({
              title: "Patient summary",
              subtitle: "Core demographic fields from the patient schema.",
              content: renderKeyValueList([
                { label: "Patient ID", value: `#${patient.patient_id}` },
                { label: "Age", value: `${patient.age} years` },
                { label: "Gender", value: patient.gender },
                { label: "Phone", value: patient.phone },
                { label: "Address", value: patient.address },
                { label: "Registered", value: formatDate(patient.created_at) }
              ])
            })}

            ${renderSectionCard({
              title: "Recent appointments",
              subtitle: "Latest visits linked to this patient.",
              content: patient.appointments.length
                ? renderTimeline(patient.appointments.slice(0, 5), renderRecentAppointmentTimeline)
                : renderDataTable({
                    headers: ["Doctor", "Date", "Time", "Status"],
                    rows: buildAppointmentRows(patient.appointments),
                    emptyMessage: "No appointments have been scheduled for this patient yet."
                  })
            })}

            ${renderSectionCard({
              title: "Medical history preview",
              subtitle: "Latest diagnosis and treatment records for this patient.",
              content: renderDataTable({
                headers: ["Doctor", "Diagnosis", "Treatment", "Recorded"],
                rows: buildMedicalRecordRows(patient.medicalRecords),
                emptyMessage: "No medical records have been added for this patient yet."
              })
            })}
          </div>

          ${renderSectionCard({
            title: editable ? "Edit patient" : "Patient details",
            subtitle: editable
              ? "Reception and admin users can update the stored patient details."
              : "Doctors can view patient details but cannot edit registration data.",
            content: `
              <div id="patientDetailAlert" class="mb-3"></div>
              <form id="patientDetailForm" novalidate>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="detail_full_name">Full name</label>
                    <input class="form-control" id="detail_full_name" name="full_name" type="text" value="${patient.full_name}" ${editable ? "" : "disabled"}>
                    <div class="invalid-feedback" data-error-for="full_name"></div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-semibold" for="detail_age">Age</label>
                    <input class="form-control" id="detail_age" name="age" type="number" min="0" value="${patient.age}" ${editable ? "" : "disabled"}>
                    <div class="invalid-feedback" data-error-for="age"></div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-semibold" for="detail_gender">Gender</label>
                    <select class="form-select" id="detail_gender" name="gender" ${editable ? "" : "disabled"}>
                      <option value="Male" ${patient.gender === "Male" ? "selected" : ""}>Male</option>
                      <option value="Female" ${patient.gender === "Female" ? "selected" : ""}>Female</option>
                      <option value="Other" ${patient.gender === "Other" ? "selected" : ""}>Other</option>
                    </select>
                    <div class="invalid-feedback" data-error-for="gender"></div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="detail_phone">Phone</label>
                    <input class="form-control" id="detail_phone" name="phone" type="tel" value="${patient.phone}" ${editable ? "" : "disabled"}>
                    <div class="invalid-feedback" data-error-for="phone"></div>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold" for="detail_address">Address</label>
                    <textarea class="form-control" id="detail_address" name="address" rows="4" ${editable ? "" : "disabled"}>${patient.address}</textarea>
                    <div class="invalid-feedback" data-error-for="address"></div>
                  </div>
                </div>
                ${editable ? `
                  <div class="d-flex gap-2 mt-4">
                    <button class="btn btn-primary" id="patientUpdateButton" type="submit"><i class="bi bi-save me-2"></i>Save changes</button>
                    <button class="btn btn-outline-danger" id="patientDeleteButton" type="button">Delete patient</button>
                  </div>
                ` : ""}
              </form>
            `
          })}
        </div>
      `
    };
  },

  mount(root, context) {
    if (!canManagePatients(context.currentUser.role)) {
      return;
    }

    const form = qs("#patientDetailForm", root);
    const submitButton = qs("#patientUpdateButton", root);
    const deleteButton = qs("#patientDeleteButton", root);
    const alertContainer = qs("#patientDetailAlert", root);
    const patientId = context.params.id;

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
        const patient = await patientService.update(patientId, payload);
        store.setFlash({
          type: "success",
          message: `${patient.full_name} was updated successfully.`
        });
        context.navigate(`/patients/${patientId}`);
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
      } finally {
        setBusyState(submitButton, false);
      }
    });

    deleteButton.addEventListener("click", async () => {
      const confirmed = window.confirm("Delete this patient record?");
      if (!confirmed) {
        return;
      }

      try {
        await patientService.remove(patientId);
        store.setFlash({
          type: "success",
          message: "Patient record deleted successfully."
        });
        context.navigate(routePaths.patients);
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
      }
    });
  }
};
