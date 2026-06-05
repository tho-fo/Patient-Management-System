import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { appointmentService } from "../services/appointmentService.js";
import { patientService } from "../../patients/services/patientService.js";
import { userService } from "../../users/services/userService.js";
import { renderAppointmentRow, renderDataTable, renderKeyValueList, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { validateAppointment } from "../../../utils/validators.js";
import { store } from "../../../shared/state/store.js";

function buildDoctorOptions(doctors) {
  return doctors.map((doctor) => `<option value="${doctor.staffKey}">${doctor.fullName} - ${doctor.specialization}</option>`).join("");
}

function buildPatientOptions(patients) {
  return patients.map((patient) => `<option value="${patient.patientId}">${patient.fullName} - #${patient.patientId}</option>`).join("");
}

export const bookAppointmentPage = {
  title: "Book Appointment",
  subtitle: "Select patient, doctor, date, and time for a new appointment.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT],

  async render(context) {
    const [patients, doctors] = await Promise.all([
      patientService.list(),
      userService.list({ role: roles.DOCTOR })
    ]);

    const scopedPatientId = context.currentUser.role === roles.PATIENT ? context.currentUser.id : "";
    const scopedDoctorId = context.currentUser.role === roles.DOCTOR ? context.currentUser.id : "";

    return {
      title: "Book Appointment",
      subtitle: "Schedule patient visits while preventing double booking for doctors.",
      content: `
        ${renderPageHero({
          eyebrow: "Appointment Booking",
          title: "Schedule appointment",
          subtitle: "Choose patient, doctor, date, and time based on documented appointment workflow.",
          actions: `<a class="btn btn-outline-secondary" href="#${routePaths.appointments}">Back to schedule</a>`
        })}

        <div class="detail-grid">
          ${renderSectionCard({
            title: "Appointment details",
            subtitle: "Auto-fill patient context and review doctor availability before saving.",
            content: `
              <div id="appointmentFormAlert" class="mb-3"></div>
              <form id="appointmentForm" novalidate>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="patientId">Patient</label>
                    <select class="form-select" id="patientId" name="patientId" ${context.currentUser.role === roles.PATIENT ? "disabled" : ""}>
                      <option value="">Select patient</option>
                      ${buildPatientOptions(patients)}
                    </select>
                    <div class="invalid-feedback" data-error-for="patientId"></div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="doctorId">Doctor</label>
                    <select class="form-select" id="doctorId" name="doctorId" ${context.currentUser.role === roles.DOCTOR ? "disabled" : ""}>
                      <option value="">Select doctor</option>
                      ${buildDoctorOptions(doctors)}
                    </select>
                    <div class="invalid-feedback" data-error-for="doctorId"></div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="appointmentDate">Appointment date</label>
                    <input class="form-control" id="appointmentDate" name="appointmentDate" type="date">
                    <div class="invalid-feedback" data-error-for="appointmentDate"></div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="appointmentTime">Appointment time</label>
                    <input class="form-control" id="appointmentTime" name="appointmentTime" type="time">
                    <div class="invalid-feedback" data-error-for="appointmentTime"></div>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold" for="otherInfo">Additional info</label>
                    <textarea class="form-control" id="otherInfo" name="otherInfo" rows="3"></textarea>
                  </div>
                </div>
                ${scopedPatientId ? `<input type="hidden" name="patientId" value="${scopedPatientId}">` : ""}
                ${scopedDoctorId ? `<input type="hidden" name="doctorId" value="${scopedDoctorId}">` : ""}
                <input type="hidden" name="status" value="${context.currentUser.role === roles.DOCTOR ? "Approved" : "Pending"}">
                ${context.currentUser.role === roles.RECEPTIONIST ? `<input type="hidden" name="receptionistId" value="${context.currentUser.id}">` : ""}
                <div class="d-flex gap-2 mt-4">
                  <button class="btn btn-primary" id="appointmentSubmit" type="submit"><i class="bi bi-save me-2"></i>Save appointment</button>
                  <a class="btn btn-outline-secondary" href="#${routePaths.appointments}">Cancel</a>
                </div>
              </form>
            `
          })}

          <div class="d-grid gap-3">
            ${renderSectionCard({
              title: "Selected patient",
              subtitle: "Patient details auto-fill from the patient module.",
              content: `<div id="selectedPatientCard">${renderKeyValueList([
                { label: "Status", value: "Choose a patient" },
                { label: "Phone", value: "-" },
                { label: "Address", value: "-" }
              ])}</div>`
            })}

            ${renderSectionCard({
              title: "Doctor availability",
              subtitle: "Existing appointments for the selected doctor and date.",
              content: `<div id="availabilityRegion">${renderDataTable({
                headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
                rows: [],
                emptyMessage: "Select a doctor and date to preview booked slots."
              })}</div>`
            })}
          </div>
        </div>
      `
    };
  },

  mount(root, context) {
    const form = qs("#appointmentForm", root);
    const submitButton = qs("#appointmentSubmit", root);
    const alertContainer = qs("#appointmentFormAlert", root);
    const patientCard = qs("#selectedPatientCard", root);
    const availabilityRegion = qs("#availabilityRegion", root);
    const patientSelect = qs("#patientId", root);
    const doctorSelect = qs("#doctorId", root);
    const dateInput = qs("#appointmentDate", root);

    if (context.currentUser.role === roles.PATIENT && patientSelect) {
      patientSelect.value = context.currentUser.id;
    } else if (context.query.patientId && patientSelect) {
      patientSelect.value = context.query.patientId;
    }

    if (context.currentUser.role === roles.DOCTOR) {
      doctorSelect.value = context.currentUser.id;
    }

    const syncPatientCard = async () => {
      const patientId = context.currentUser.role === roles.PATIENT ? context.currentUser.id : patientSelect.value;
      if (!patientId) {
        return;
      }

      try {
        const patient = await patientService.getById(patientId);
        patientCard.innerHTML = renderKeyValueList([
          { label: "Patient", value: patient.fullName },
          { label: "Phone", value: patient.phone },
          { label: "Address", value: patient.address }
        ]);
      } catch (error) {
        patientCard.innerHTML = `<div class="alert alert-danger mb-0" role="alert">${error.message}</div>`;
      }
    };

    const syncAvailability = async () => {
      const doctorId = context.currentUser.role === roles.DOCTOR ? context.currentUser.id : doctorSelect.value;
      const appointmentDate = dateInput.value;

      if (!doctorId || !appointmentDate) {
        availabilityRegion.innerHTML = renderDataTable({
          headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
          rows: [],
          emptyMessage: "Select a doctor and date to preview booked slots."
        });
        return;
      }

      try {
        const appointments = await appointmentService.list({
          doctorId: doctorId,
          appointmentDate: appointmentDate
        });

        availabilityRegion.innerHTML = renderDataTable({
          headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
          rows: appointments.map((appointment) => renderAppointmentRow({ ...appointment, actions: "Booked" })),
          emptyMessage: "This doctor has no appointments for the selected date."
        });
      } catch (error) {
        availabilityRegion.innerHTML = `<div class="alert alert-danger" role="alert">${error.message}</div>`;
      }
    };

    patientSelect?.addEventListener("change", syncPatientCard);
    doctorSelect.addEventListener("change", syncAvailability);
    dateInput.addEventListener("change", syncAvailability);

    syncPatientCard();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(form);
      renderInlineAlert(alertContainer, "");

      const payload = formToObject(form);
      const errors = validateAppointment(payload);

      if (Object.keys(errors).length > 0) {
        applyFormErrors(form, errors);
        return;
      }

      setBusyState(submitButton, true);

      try {
        await appointmentService.create(payload);
        store.setFlash({
          type: "success",
          message: "Appointment booked successfully."
        });
        context.navigate(routePaths.appointments);
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
      } finally {
        setBusyState(submitButton, false);
      }
    });
  }
};
