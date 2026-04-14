import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { appointmentService } from "../services/appointmentService.js";
import { patientService } from "../../patients/services/patientService.js";
import { userService } from "../../users/services/userService.js";
import { renderAppointmentRow, renderDataTable, renderModal, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { validateAppointment } from "../../../utils/validators.js";

function canManageAppointments(role) {
  return role === roles.ADMIN || role === roles.RECEPTIONIST;
}

function getScopedFilters(role, currentUser) {
  if (role === roles.PATIENT) {
    return { patient_id: currentUser.id };
  }

  if (role === roles.DOCTOR) {
    return { doctor_id: currentUser.id };
  }

  return {};
}

function buildAppointmentRows(appointments, role) {
  return appointments.map((appointment) =>
    renderAppointmentRow({
      ...appointment,
      actions: canManageAppointments(role)
        ? `<button class="btn btn-sm btn-outline-primary" data-edit-appointment="${appointment.appointment_id}" type="button">Update</button>`
        : ""
    })
  );
}

function buildOptions(items, valueKey, labelBuilder) {
  return items
    .map((item) => `<option value="${item[valueKey]}">${labelBuilder(item)}</option>`)
    .join("");
}

export const appointmentListPage = {
  title: "Appointments",
  subtitle: "Appointment schedule, filters, and appointment status updates.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT],

  async render(context) {
    const [patients, doctors, appointments] = await Promise.all([
      patientService.list(),
      userService.list({ role: roles.DOCTOR }),
      appointmentService.list(getScopedFilters(context.currentUser.role, context.currentUser))
    ]);

    return {
      title: "Appointments",
      subtitle: "Filter by date, doctor, and status while keeping schedule changes in one place.",
      content: `
        ${renderPageHero({
          eyebrow: "Appointment Module",
          title: "Appointment schedule",
          subtitle: "Monitor scheduled visits, filter by doctor and status, and update appointment details when permitted.",
          actions: canManageAppointments(context.currentUser.role) || context.currentUser.role === roles.PATIENT
            ? `<a class="btn btn-primary" href="#${routePaths.bookAppointment}"><i class="bi bi-calendar-plus me-2"></i>Book appointment</a>`
            : ""
        })}

        ${renderSectionCard({
          title: "Appointment list",
          subtitle: "Filter the appointment module by date, doctor, and status.",
          content: `
            <form id="appointmentFilterForm" class="filter-bar mb-4">
              <div class="row g-3 align-items-end">
                <div class="col-lg-4">
                  <label class="form-label fw-semibold" for="appointment_date">Date</label>
                  <input class="form-control" id="appointment_date" name="appointment_date" type="date">
                </div>
                <div class="col-lg-4">
                  <label class="form-label fw-semibold" for="doctor_id">Doctor</label>
                  <select class="form-select" id="doctor_id" name="doctor_id" ${context.currentUser.role === roles.DOCTOR ? "disabled" : ""}>
                    <option value="">All doctors</option>
                    ${buildOptions(doctors, "staff_key", (doctor) => `${doctor.full_name} - ${doctor.specialization}`)}
                  </select>
                  <div class="form-note">Doctor filters follow the staff module roles.</div>
                </div>
                <div class="col-lg-2">
                  <label class="form-label fw-semibold" for="status">Status</label>
                  <select class="form-select" id="status" name="status">
                    <option value="">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div class="col-lg-2 d-flex gap-2">
                  <button class="btn btn-primary flex-fill" type="submit">Apply</button>
                  <button class="btn btn-outline-secondary" id="appointmentFilterReset" type="button">Reset</button>
                </div>
              </div>
            </form>
            <div id="appointmentTableRegion">
              ${renderDataTable({
                headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
                rows: buildAppointmentRows(appointments, context.currentUser.role),
                emptyMessage: "No appointments matched the current filters."
              })}
            </div>
          `
        })}

        ${canManageAppointments(context.currentUser.role) ? renderModal({
          id: "appointmentUpdateModal",
          title: "Update appointment",
          body: `
            <div id="appointmentModalAlert" class="mb-3"></div>
            <form id="appointmentUpdateForm" novalidate>
              <input type="hidden" name="appointment_id" id="modal_appointment_id">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="modal_patient_id">Patient</label>
                  <select class="form-select" id="modal_patient_id" name="patient_id">
                    <option value="">Select patient</option>
                    ${buildOptions(patients, "patient_id", (patient) => `${patient.full_name} - #${patient.patient_id}`)}
                  </select>
                  <div class="invalid-feedback" data-error-for="patient_id"></div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="modal_doctor_id">Doctor</label>
                  <select class="form-select" id="modal_doctor_id" name="doctor_id">
                    <option value="">Select doctor</option>
                    ${buildOptions(doctors, "staff_key", (doctor) => `${doctor.full_name} - ${doctor.specialization}`)}
                  </select>
                  <div class="invalid-feedback" data-error-for="doctor_id"></div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold" for="modal_appointment_date">Date</label>
                  <input class="form-control" id="modal_appointment_date" name="appointment_date" type="date">
                  <div class="invalid-feedback" data-error-for="appointment_date"></div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold" for="modal_appointment_time">Time</label>
                  <input class="form-control" id="modal_appointment_time" name="appointment_time" type="time">
                  <div class="invalid-feedback" data-error-for="appointment_time"></div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold" for="modal_status">Status</label>
                  <select class="form-select" id="modal_status" name="status">
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </form>
          `,
          footer: `
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" form="appointmentUpdateForm" class="btn btn-primary" id="appointmentUpdateSubmit">Save changes</button>
          `
        }) : ""}
      `
    };
  },

  mount(root, context) {
    const form = qs("#appointmentFilterForm", root);
    const resetButton = qs("#appointmentFilterReset", root);
    const tableRegion = qs("#appointmentTableRegion", root);
    const scopedFilters = getScopedFilters(context.currentUser.role, context.currentUser);

    const loadTable = async (extraFilters = {}) => {
      const filters = { ...scopedFilters, ...extraFilters };

      if (filters.doctor_id && String(filters.doctor_id).startsWith("doctor-")) {
        filters.doctor_id = filters.doctor_id.split("-")[1];
      }

      const appointments = await appointmentService.list(filters);
      tableRegion.innerHTML = renderDataTable({
        headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
        rows: buildAppointmentRows(appointments, context.currentUser.role),
        emptyMessage: "No appointments matched the current filters."
      });
      return appointments;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await loadTable(formToObject(form));
    });

    resetButton.addEventListener("click", async () => {
      form.reset();
      await loadTable();
    });

    if (!canManageAppointments(context.currentUser.role)) {
      return;
    }

    const modalElement = qs("#appointmentUpdateModal", root);
    const modalForm = qs("#appointmentUpdateForm", root);
    const submitButton = qs("#appointmentUpdateSubmit", root);
    const alertContainer = qs("#appointmentModalAlert", root);
    const modalInstance = new window.bootstrap.Modal(modalElement);

    const openModal = async (appointmentId) => {
      const appointments = await loadTable(formToObject(form));
      const appointment = appointments.find((item) => Number(item.appointment_id) === Number(appointmentId));
      if (!appointment) {
        return;
      }

      modalForm.reset();
      renderInlineAlert(alertContainer, "");
      qs("#modal_appointment_id", modalForm).value = appointment.appointment_id;
      qs("#modal_patient_id", modalForm).value = appointment.patient_id;
      qs("#modal_doctor_id", modalForm).value = `doctor-${appointment.doctor_id}`;
      qs("#modal_appointment_date", modalForm).value = appointment.appointment_date;
      qs("#modal_appointment_time", modalForm).value = appointment.appointment_time;
      qs("#modal_status", modalForm).value = appointment.status;
      modalInstance.show();
    };

    tableRegion.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-edit-appointment]");
      if (!button) {
        return;
      }

      await openModal(button.dataset.editAppointment);
    });

    modalForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(modalForm);
      renderInlineAlert(alertContainer, "");

      const payload = formToObject(modalForm);
      payload.doctor_id = payload.doctor_id.split("-")[1];
      const errors = validateAppointment(payload);

      if (Object.keys(errors).length > 0) {
        applyFormErrors(modalForm, errors);
        return;
      }

      setBusyState(submitButton, true);

      try {
        await appointmentService.update(payload.appointment_id, payload);
        modalInstance.hide();
        await loadTable(formToObject(form));
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
      } finally {
        setBusyState(submitButton, false);
      }
    });
  }
};
