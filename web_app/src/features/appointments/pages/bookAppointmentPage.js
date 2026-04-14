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
  return doctors.map((doctor) => `<option value="${doctor.staff_key}">${doctor.full_name} - ${doctor.specialization}</option>`).join("");
}

function buildPatientOptions(patients) {
  return patients.map((patient) => `<option value="${patient.patient_id}">${patient.full_name} - #${patient.patient_id}</option>`).join("");
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
                    <label class="form-label fw-semibold" for="patient_id">Patient</label>
                    <select class="form-select" id="patient_id" name="patient_id" ${context.currentUser.role === roles.PATIENT ? "disabled" : ""}>
                      <option value="">Select patient</option>
                      ${buildPatientOptions(patients)}
                    </select>
                    <div class="invalid-feedback" data-error-for="patient_id"></div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="doctor_id">Doctor</label>
                    <select class="form-select" id="doctor_id" name="doctor_id">
                      <option value="">Select doctor</option>
                      ${buildDoctorOptions(doctors)}
                    </select>
                    <div class="invalid-feedback" data-error-for="doctor_id"></div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="appointment_date">Appointment date</label>
                    <input class="form-control" id="appointment_date" name="appointment_date" type="date">
                    <div class="invalid-feedback" data-error-for="appointment_date"></div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold" for="appointment_time">Appointment time</label>
                    <input class="form-control" id="appointment_time" name="appointment_time" type="time">
                    <div class="invalid-feedback" data-error-for="appointment_time"></div>
                  </div>
                </div>
                ${scopedPatientId ? `<input type="hidden" name="patient_id" value="${scopedPatientId}">` : ""}
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
    const patientSelect = qs("#patient_id", root);
    const doctorSelect = qs("#doctor_id", root);
    const dateInput = qs("#appointment_date", root);

    const syncPatientCard = async () => {
      const patientId = context.currentUser.role === roles.PATIENT ? context.currentUser.id : patientSelect.value;
      if (!patientId) {
        return;
      }

      const patient = await patientService.getById(patientId);
      patientCard.innerHTML = renderKeyValueList([
        { label: "Patient", value: patient.full_name },
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
        doctor_id: doctorId,
        appointment_date: appointmentDate
      });

      availabilityRegion.innerHTML = renderDataTable({
        headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
        rows: appointments.map((appointment) => `
          <tr>
            <td>${appointment.patient_name}</td>
            <td>${appointment.doctor_name}</td>
            <td>${appointment.appointment_date}</td>
            <td>${appointment.appointment_time}</td>
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
      if (payload.doctor_id) {
        payload.doctor_id = payload.doctor_id.split("-")[1];
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
