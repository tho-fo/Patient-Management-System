import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { appointmentService } from "../services/appointmentService.js";
import { patientService } from "../../patients/services/patientService.js";
import { userService } from "../../users/services/userService.js";
import { renderDataTable, renderKeyValueList, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
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
  allowedRoles: [roles.ADMIN, roles.RECEPTIONIST, roles.PATIENT],

  async render(context) {
    const [patients, doctors] = await Promise.all([
      patientService.list(),
      userService.list({ role: roles.DOCTOR })
    ]);

    const scopedPatientId = context.currentUser.role === roles.PATIENT ? context.currentUser.id : "";

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
                    <select class="form-select" id="doctorId" name="doctorId">
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
                </div>
                ${scopedPatientId ? `<input type="hidden" name="patientId" value="${scopedPatientId}">` : ""}
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

    const syncPatientCard = async () => {
      const patientId = context.currentUser.role === roles.PATIENT ? context.currentUser.id : patientSelect.value;
      if (!patientId) {
        return;
      }

      const patient = await patientService.getById(patientId);
      patientCard.innerHTML = renderKeyValueList([
        { label: "Patient", value: patient.fullName },
        { label: "Phone", value: patient.phone },
        { label: "Address", value: patient.address }
      ]);
    };

    const syncAvailability = async () => {
      const doctorId = doctorSelect.value?.split("-")[1];
      const appointmentDate = dateInput.value;

      if (!doctorId || !appointmentDate) {
        availabilityRegion.innerHTML = renderDataTable({
          headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
          rows: [],
          emptyMessage: "Select a doctor and date to preview booked slots."
        });
        return;
      }

      const appointments = await appointmentService.list({
        doctorId: doctorId,
        appointmentDate: appointmentDate
      });

      availabilityRegion.innerHTML = renderDataTable({
        headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
        rows: appointments.map((appointment) => `
          <tr>
            <td>${appointment.patientName}</td>
            <td>${appointment.doctorName}</td>
            <td>${appointment.appointmentDate}</td>
            <td>${appointment.appointmentTime}</td>
            <td>${appointment.status}</td>
            <td class="text-end">Booked</td>
          </tr>
        `),
        emptyMessage: "This doctor has no appointments for the selected date."
      });
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
      if (payload.doctorId) {
        payload.doctorId = payload.doctorId.split("-")[1];
      }
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
