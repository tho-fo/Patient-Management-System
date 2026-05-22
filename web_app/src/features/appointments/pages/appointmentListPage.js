import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { appointmentService } from "../services/appointmentService.js";
import { patientService } from "../../patients/services/patientService.js";
import { userService } from "../../users/services/userService.js";
import { renderAppointmentRow, renderDataTable, renderModal, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { validateAppointment } from "../../../utils/validators.js";

function canManageAppointments(role) {
  return role === roles.ADMIN || role === roles.DOCTOR || role === roles.RECEPTIONIST;
}

function getScopedFilters(role, currentUser) {
  if (role === roles.PATIENT) {
    return { patientId: currentUser.id };
  }

  if (role === roles.DOCTOR) {
    return { doctorId: currentUser.id };
  }

  return {};
}

function buildAppointmentRows(appointments, role) {
  return appointments.map((appointment) =>
    renderAppointmentRow({
      ...appointment,
      actions: canManageAppointments(role)
        ? `<button class="btn btn-sm btn-outline-primary" data-edit-appointment="${appointment.appointmentId}" type="button">Update</button>`
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
                  <label class="form-label fw-semibold" for="appointmentDate">Date</label>
                  <input class="form-control" id="appointmentDate" name="appointmentDate" type="date">
                </div>
                <div class="col-lg-4">
                  <label class="form-label fw-semibold" for="doctorId">Doctor</label>
                  <select class="form-select" id="doctorId" name="doctorId" ${context.currentUser.role === roles.DOCTOR ? "disabled" : ""}>
                    <option value="">All doctors</option>
                    ${buildOptions(doctors, "staffKey", (doctor) => `${doctor.fullName} - ${doctor.specialization}`)}
                  </select>
                  <div class="form-note">Doctor filters follow the staff module roles.</div>
                </div>
                <div class="col-lg-2">
                  <label class="form-label fw-semibold" for="status">Status</label>
                  <select class="form-select" id="status" name="status">
                    <option value="">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                    <option value="Completed">Completed</option>
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
              <input type="hidden" name="appointmentId" id="modal_appointmentId">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="modal_patientId">Patient</label>
                  <select class="form-select" id="modal_patientId" name="patientId">
                    <option value="">Select patient</option>
                    ${buildOptions(patients, "patientId", (patient) => `${patient.fullName} - #${patient.patientId}`)}
                  </select>
                  <div class="invalid-feedback" data-error-for="patientId"></div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="modal_doctorId">Doctor</label>
                  <select class="form-select" id="modal_doctorId" name="doctorId">
                    <option value="">Select doctor</option>
                    ${buildOptions(doctors, "staffKey", (doctor) => `${doctor.fullName} - ${doctor.specialization}`)}
                  </select>
                  <div class="invalid-feedback" data-error-for="doctorId"></div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold" for="modal_appointmentDate">Date</label>
                  <input class="form-control" id="modal_appointmentDate" name="appointmentDate" type="date">
                  <div class="invalid-feedback" data-error-for="appointmentDate"></div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold" for="modal_appointmentTime">Time</label>
                  <input class="form-control" id="modal_appointmentTime" name="appointmentTime" type="time">
                  <div class="invalid-feedback" data-error-for="appointmentTime"></div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold" for="modal_status">Status</label>
                  <select class="form-select" id="modal_status" name="status">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                    <option value="Completed">Completed</option>
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
      const appointment = appointments.find((item) => String(item.appointmentId) === String(appointmentId));
      if (!appointment) {
        return;
      }

      modalForm.reset();
      renderInlineAlert(alertContainer, "");
      qs("#modal_appointmentId", modalForm).value = appointment.appointmentId;
      qs("#modal_patientId", modalForm).value = appointment.patientId;
      qs("#modal_doctorId", modalForm).value = appointment.doctorId;
      qs("#modal_appointmentDate", modalForm).value = appointment.appointmentDate;
      qs("#modal_appointmentTime", modalForm).value = appointment.appointmentTime;
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
      const errors = validateAppointment(payload);

      if (Object.keys(errors).length > 0) {
        applyFormErrors(modalForm, errors);
        return;
      }

      setBusyState(submitButton, true);

      try {
        await appointmentService.update(payload.appointmentId, payload);
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
