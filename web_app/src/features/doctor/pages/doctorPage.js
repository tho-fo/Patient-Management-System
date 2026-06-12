import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { appointmentService } from "../../appointments/services/appointmentService.js";
import { medicalRecordService } from "../../medical_records/services/medicalRecordService.js";
import { patientService } from "../../patients/services/patientService.js";
import { userService } from "../../users/services/userService.js";
import {
  renderAppointmentRow,
  renderDataTable,
  renderKeyValueList,
  renderMetricCard,
  renderModal,
  renderPageHero,
  renderSectionCard
} from "../../../shared/components/ui.js";
import { applyFormErrors, clearFormErrors, formToObject, qs, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { escapeHtml, formatDate, formatTime } from "../../../utils/formatters.js";
import { validateAppointment, validateMedicalRecord } from "../../../utils/validators.js";

function buildPatientOptions(patients) {
  return patients.map((patient) => `<option value="${escapeHtml(patient.patientId)}">${escapeHtml(patient.fullName)} - #${escapeHtml(patient.patientId)}</option>`).join("");
}

function renderPatientRows(patients) {
  return patients.map((patient) => `
    <tr>
      <td><strong>${escapeHtml(patient.fullName)}</strong><div class="text-soft small">#${escapeHtml(patient.patientId)}</div></td>
      <td>${escapeHtml(patient.phone)}</td>
      <td>${escapeHtml(patient.gender || "-")}</td>
      <td>${escapeHtml(patient.bloodGroup || patient.bloodType || "-")}</td>
      <td class="text-end">
        <div class="d-flex justify-content-end gap-2 flex-wrap">
          <button class="btn btn-sm btn-outline-secondary" type="button" data-view-patient="${escapeHtml(patient.patientId)}">
            <i class="bi bi-eye me-1"></i>View
          </button>
          <button class="btn btn-sm btn-primary" type="button" data-diagnose-patient="${escapeHtml(patient.patientId)}">
            <i class="bi bi-journal-plus me-1"></i>Diagnose
          </button>
        </div>
      </td>
    </tr>
  `);
}

function renderRecordRows(records, currentUser) {
  return records.map((record) => {
    const isOwnRecord = String(record.doctorId ?? record.diagnosedBy) === String(currentUser.id);

    return `
      <tr>
        <td><strong>${escapeHtml(record.patientName)}</strong></td>
        <td>${escapeHtml(record.doctorName)}</td>
        <td>${escapeHtml(record.diagnosis)}</td>
        <td>${escapeHtml(record.treatment)}</td>
        <td>${escapeHtml(formatDate(record.recordDate))}</td>
        <td class="text-end">
          ${isOwnRecord ? `<button class="btn btn-sm btn-outline-primary" type="button" data-edit-record="${escapeHtml(record.recordId)}">Edit</button>` : `<span class="text-soft small">View only</span>`}
        </td>
      </tr>
    `;
  });
}

function renderDoctorAppointmentActions(appointment) {
  const pendingActions = appointment.status === "Pending"
    ? `
      <button class="btn btn-sm btn-success" data-appointment-status="${escapeHtml(appointment.appointmentId)}" data-next-status="Approved" type="button">
        <i class="bi bi-check2 me-1"></i>Approve
      </button>
      <button class="btn btn-sm btn-outline-danger" data-appointment-status="${escapeHtml(appointment.appointmentId)}" data-next-status="Declined" type="button">
        <i class="bi bi-x-lg me-1"></i>Decline
      </button>
    `
    : "";

  return `
    <div class="d-flex justify-content-end gap-2 flex-wrap">
      <button class="btn btn-sm btn-outline-secondary" data-view-appointment="${escapeHtml(appointment.appointmentId)}" type="button">
        <i class="bi bi-eye me-1"></i>View
      </button>
      ${pendingActions}
      <button class="btn btn-sm btn-outline-primary" data-postpone-appointment="${escapeHtml(appointment.appointmentId)}" type="button">
        <i class="bi bi-calendar2-plus me-1"></i>Postpone
      </button>
    </div>
  `;
}

function renderAppointmentRows(appointments) {
  return appointments.map((appointment) => renderAppointmentRow({
    ...appointment,
    actions: renderDoctorAppointmentActions(appointment)
  }));
}

function renderAppointmentDetails(appointment) {
  return renderKeyValueList([
    { label: "Patient", value: appointment.patientName },
    { label: "Doctor", value: appointment.doctorName },
    { label: "Date", value: formatDate(appointment.appointmentDate) },
    { label: "Time", value: formatTime(appointment.appointmentTime) },
    { label: "Status", value: appointment.status },
    { label: "Notes", value: appointment.otherInfo || "-" },
    { label: "Created", value: appointment.createdAt ? formatDate(appointment.createdAt) : "-" },
    { label: "Updated", value: appointment.updatedAt ? formatDate(appointment.updatedAt) : "-" }
  ]);
}

function getAvailability(profile) {
  return profile?.availability ?? {};
}

function renderAvailabilitySummary(availability) {
  const items = [
    { label: "Date", value: availability.availableDate ? formatDate(availability.availableDate) : "Not set" },
    { label: "Start time", value: availability.startTime ? formatTime(availability.startTime) : "Not set" },
    { label: "End time", value: availability.endTime ? formatTime(availability.endTime) : "Not set" },
    { label: "Notes", value: availability.notes || "-" }
  ];

  return renderKeyValueList(items);
}

function renderStatusOptions(selectedStatus = "Approved") {
  return ["Pending", "Approved", "Declined", "Completed", "Cancelled"]
    .map((status) => `<option value="${status}" ${selectedStatus === status ? "selected" : ""}>${status}</option>`)
    .join("");
}

export const doctorPage = {
  title: "Doctor Workspace",
  subtitle: "Patient care, diagnosis, records, appointments, and availability.",
  allowedRoles: [roles.DOCTOR],

  async render(context) {
    const [patients, appointments, records, profile] = await Promise.all([
      patientService.list(),
      appointmentService.list({ doctorId: context.currentUser.id }),
      medicalRecordService.list(),
      userService.getByKey(context.currentUser.id).catch(() => context.currentUser)
    ]);
    const ownRecords = records.filter((record) => String(record.doctorId ?? record.diagnosedBy) === String(context.currentUser.id));
    const pendingAppointments = appointments.filter((appointment) => appointment.status === "Pending");
    const todaysAppointments = appointments.filter((appointment) => appointment.appointmentDate === new Date().toISOString().slice(0, 10));
    const availability = getAvailability(profile);

    return {
      title: "Doctor Workspace",
      subtitle: "Manage consultations and schedule from one clinical workspace.",
      data: { patients, appointments, records, profile },
      content: `
        ${renderPageHero({
          eyebrow: "Doctor Module",
          title: "Clinical workspace",
          subtitle: "View patient details, diagnose patients, prescribe treatment, manage records, approve appointments, and update available time.",
          actions: `
            <a class="btn btn-primary" href="#${routePaths.bookAppointment}">
              <i class="bi bi-calendar-plus me-2"></i>Schedule appointment
            </a>
            <a class="btn btn-outline-secondary" href="#${routePaths.addMedicalRecord}">
              <i class="bi bi-journal-plus me-2"></i>Add record
            </a>
          `
        })}

        <section class="metric-grid mb-4">
          ${renderMetricCard({ label: "Patients", value: patients.length, note: "Patients available to review", icon: "bi-people-fill" })}
          ${renderMetricCard({ label: "My appointments", value: appointments.length, note: "Assigned to your profile", icon: "bi-calendar-check" })}
          ${renderMetricCard({ label: "Pending", value: pendingAppointments.length, note: "Awaiting approval", icon: "bi-hourglass-split" })}
          ${renderMetricCard({ label: "Today", value: todaysAppointments.length, note: "Visits scheduled today", icon: "bi-sunrise" })}
          ${renderMetricCard({ label: "My records", value: ownRecords.length, note: "Diagnosed by you", icon: "bi-journal-medical" })}
        </section>

        <div class="doctor-workspace-grid">
          ${renderSectionCard({
            title: "Patients",
            subtitle: "Open patient details or begin a diagnosis and treatment record.",
            content: `
              <div id="doctorPatientAlert" class="mb-3"></div>
              <div id="doctorPatientTable">
                ${renderDataTable({
                  headers: ["Patient", "Phone", "Gender", "Blood", "Actions"],
                  rows: renderPatientRows(patients),
                  emptyMessage: "No patients are available yet."
                })}
              </div>
            `
          })}

          ${renderSectionCard({
            title: "Availability",
            subtitle: "Set the next available date and time shown to scheduling workflows.",
            content: `
              <div id="availabilityAlert" class="mb-3"></div>
              <form id="availabilityForm" class="mb-4">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label fw-semibold" for="availableDate">Date</label>
                    <input class="form-control" id="availableDate" name="availableDate" type="date" value="${escapeHtml(availability.availableDate || "")}">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold" for="startTime">Start</label>
                    <input class="form-control" id="startTime" name="startTime" type="time" value="${escapeHtml(availability.startTime || "")}">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold" for="endTime">End</label>
                    <input class="form-control" id="endTime" name="endTime" type="time" value="${escapeHtml(availability.endTime || "")}">
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold" for="availabilityNotes">Notes</label>
                    <textarea class="form-control" id="availabilityNotes" name="notes" rows="2">${escapeHtml(availability.notes || "")}</textarea>
                  </div>
                </div>
                <button class="btn btn-primary mt-3" id="availabilitySubmit" type="submit">
                  <i class="bi bi-save me-2"></i>Update availability
                </button>
              </form>
              <div id="availabilitySummary">${renderAvailabilitySummary(availability)}</div>
            `
          })}
        </div>

        <section class="chart-grid mt-4">
          ${renderSectionCard({
            title: "Appointments",
            subtitle: "Approve, decline, view, or postpone appointments assigned to you.",
            content: `
              <div id="doctorAppointmentAlert" class="mb-3"></div>
              <div id="doctorAppointmentTable">
                ${renderDataTable({
                  headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
                  rows: renderAppointmentRows(appointments),
                  emptyMessage: "No appointments are assigned to you yet.",
                  action: `<a class="btn btn-primary" href="#${routePaths.bookAppointment}">Schedule appointment</a>`
                })}
              </div>
            `
          })}

          ${renderSectionCard({
            title: "Medical records",
            subtitle: "View all patient records. Edit controls appear only for records diagnosed by you.",
            content: `
              <div id="doctorRecordAlert" class="mb-3"></div>
              <div id="doctorRecordTable">
                ${renderDataTable({
                  headers: ["Patient", "Doctor", "Diagnosis", "Treatment", "Date", "Actions"],
                  rows: renderRecordRows(records, context.currentUser),
                  emptyMessage: "No medical records exist yet."
                })}
              </div>
            `
          })}
        </section>

        ${renderModal({
          id: "doctorPatientModal",
          title: "Patient details",
          body: `<div id="doctorPatientDetails"></div>`,
          footer: `
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="patientDiagnoseButton">
              <i class="bi bi-journal-plus me-2"></i>Diagnose patient
            </button>
          `
        })}

        ${renderModal({
          id: "doctorRecordModal",
          title: "Diagnose patient",
          body: `
            <div id="doctorRecordModalAlert" class="mb-3"></div>
            <form id="doctorRecordForm" novalidate>
              <input type="hidden" id="recordId" name="recordId">
              <input type="hidden" id="recordDoctorId" name="doctorId" value="${escapeHtml(context.currentUser.id)}">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-semibold" for="recordPatientId">Patient</label>
                  <select class="form-select" id="recordPatientId" name="patientId">
                    <option value="">Select patient</option>
                    ${buildPatientOptions(patients)}
                  </select>
                  <div class="invalid-feedback" data-error-for="patientId"></div>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold" for="recordDiagnosis">Diagnosis</label>
                  <textarea class="form-control" id="recordDiagnosis" name="diagnosis" rows="4"></textarea>
                  <div class="invalid-feedback" data-error-for="diagnosis"></div>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold" for="recordTreatment">Treatment / Prescription</label>
                  <textarea class="form-control" id="recordTreatment" name="treatment" rows="4"></textarea>
                  <div class="invalid-feedback" data-error-for="treatment"></div>
                </div>
              </div>
            </form>
          `,
          footer: `
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" form="doctorRecordForm" class="btn btn-primary" id="recordSubmitButton">Save record</button>
          `
        })}

        ${renderModal({
          id: "doctorAppointmentModal",
          title: "Postpone appointment",
          body: `
            <div id="doctorAppointmentModalAlert" class="mb-3"></div>
            <form id="doctorAppointmentForm" novalidate>
              <input type="hidden" id="appointmentId" name="appointmentId">
              <input type="hidden" id="appointmentPatientId" name="patientId">
              <input type="hidden" id="appointmentDoctorId" name="doctorId" value="${escapeHtml(context.currentUser.id)}">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label fw-semibold" for="appointmentDate">Date</label>
                  <input class="form-control" id="appointmentDate" name="appointmentDate" type="date">
                  <div class="invalid-feedback" data-error-for="appointmentDate"></div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold" for="appointmentTime">Time</label>
                  <input class="form-control" id="appointmentTime" name="appointmentTime" type="time">
                  <div class="invalid-feedback" data-error-for="appointmentTime"></div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold" for="appointmentStatus">Status</label>
                  <select class="form-select" id="appointmentStatus" name="status">
                    ${renderStatusOptions()}
                  </select>
                </div>
              </div>
            </form>
          `,
          footer: `
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" form="doctorAppointmentForm" class="btn btn-primary" id="appointmentSubmitButton">Save appointment</button>
          `
        })}

        ${renderModal({
          id: "doctorAppointmentDetailsModal",
          title: "Appointment details",
          body: `<div id="doctorAppointmentDetailsContainer"></div>`,
          footer: `
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
          `
        })}
      `
    };
  },

  mount(root, context, page) {
    let patients = page.data.patients;
    let appointments = page.data.appointments;
    let records = page.data.records;
    let selectedPatientId = "";

    const patientTable = qs("#doctorPatientTable", root);
    const appointmentTable = qs("#doctorAppointmentTable", root);
    const recordTable = qs("#doctorRecordTable", root);
    const patientAlert = qs("#doctorPatientAlert", root);
    const appointmentAlert = qs("#doctorAppointmentAlert", root);
    const recordAlert = qs("#doctorRecordAlert", root);
    const availabilityAlert = qs("#availabilityAlert", root);
    const availabilitySummary = qs("#availabilitySummary", root);
    const availabilityForm = qs("#availabilityForm", root);
    const availabilitySubmit = qs("#availabilitySubmit", root);

    const patientModalElement = qs("#doctorPatientModal", root);
    const patientDetails = qs("#doctorPatientDetails", root);
    const patientDiagnoseButton = qs("#patientDiagnoseButton", root);
    const patientModal = new window.bootstrap.Modal(patientModalElement);

    const recordModalElement = qs("#doctorRecordModal", root);
    const recordModalTitle = qs(".modal-title", recordModalElement);
    const recordForm = qs("#doctorRecordForm", root);
    const recordSubmitButton = qs("#recordSubmitButton", root);
    const recordModalAlert = qs("#doctorRecordModalAlert", root);
    const recordModal = new window.bootstrap.Modal(recordModalElement);

    const appointmentModalElement = qs("#doctorAppointmentModal", root);
    const appointmentForm = qs("#doctorAppointmentForm", root);
    const appointmentSubmitButton = qs("#appointmentSubmitButton", root);
    const appointmentModalAlert = qs("#doctorAppointmentModalAlert", root);
    const appointmentModal = new window.bootstrap.Modal(appointmentModalElement);

    const appointmentDetailsModalElement = qs("#doctorAppointmentDetailsModal", root);
    const appointmentDetailsContainer = qs("#doctorAppointmentDetailsContainer", root);
    const appointmentDetailsModal = new window.bootstrap.Modal(appointmentDetailsModalElement);

    const refreshAppointments = async () => {
      appointments = await appointmentService.list({ doctorId: context.currentUser.id });
      appointmentTable.innerHTML = renderDataTable({
        headers: ["Patient", "Doctor", "Date", "Time", "Status", "Actions"],
        rows: renderAppointmentRows(appointments),
        emptyMessage: "No appointments are assigned to you yet.",
        action: `<a class="btn btn-primary" href="#${routePaths.bookAppointment}">Schedule appointment</a>`
      });
      return appointments;
    };

    const refreshRecords = async () => {
      records = await medicalRecordService.list();
      recordTable.innerHTML = renderDataTable({
        headers: ["Patient", "Doctor", "Diagnosis", "Treatment", "Date", "Actions"],
        rows: renderRecordRows(records, context.currentUser),
        emptyMessage: "No medical records exist yet."
      });
      return records;
    };

    const openRecordModal = (mode, data = {}) => {
      recordForm.reset();
      clearFormErrors(recordForm);
      renderInlineAlert(recordModalAlert, "");
      recordModalTitle.textContent = mode === "edit" ? "Edit medical record" : "Diagnose patient";
      delete recordSubmitButton.dataset.originalText;
      recordSubmitButton.innerHTML = mode === "edit" ? "Save changes" : "Save record";
      qs("#recordId", recordForm).value = data.recordId ?? "";
      qs("#recordDoctorId", recordForm).value = context.currentUser.id;
      qs("#recordPatientId", recordForm).value = data.patientId ?? "";
      qs("#recordDiagnosis", recordForm).value = data.diagnosis ?? "";
      qs("#recordTreatment", recordForm).value = data.treatment ?? "";
      recordModal.show();
    };

    patientTable.addEventListener("click", async (event) => {
      const viewButton = event.target.closest("[data-view-patient]");
      const diagnoseButton = event.target.closest("[data-diagnose-patient]");

      if (diagnoseButton) {
        openRecordModal("create", { patientId: diagnoseButton.dataset.diagnosePatient });
        return;
      }

      if (!viewButton) {
        return;
      }

      renderInlineAlert(patientAlert, "");
      selectedPatientId = viewButton.dataset.viewPatient;
      patientDetails.innerHTML = `<div class="loading-shell"><div class="spinner-border text-info" role="status"></div></div>`;
      patientModal.show();

      try {
        const patient = await patientService.getById(selectedPatientId);
        patientDetails.innerHTML = `
          ${renderKeyValueList([
            { label: "Patient", value: patient.fullName },
            { label: "Phone", value: patient.phone },
            { label: "Email", value: patient.email },
            { label: "Gender", value: patient.gender },
            { label: "Blood group", value: patient.bloodGroup || patient.bloodType },
            { label: "Address", value: patient.address },
            { label: "Medical condition", value: patient.medicalCondition }
          ])}
          <div class="mt-4">
            <h3 class="h6 fw-bold mb-3">Recent records</h3>
            ${renderDataTable({
              headers: ["Doctor", "Diagnosis", "Treatment", "Date"],
              rows: (patient.medicalRecords ?? []).slice(0, 4).map((record) => `
                <tr>
                  <td>${escapeHtml(record.doctorName ?? record.doctorId ?? "-")}</td>
                  <td>${escapeHtml(record.diagnosis ?? "-")}</td>
                  <td>${escapeHtml(record.treatment ?? "-")}</td>
                  <td>${escapeHtml(formatDate(record.recordDate ?? record.createdAt))}</td>
                </tr>
              `),
              emptyMessage: "No records exist for this patient yet."
            })}
          </div>
        `;
      } catch (error) {
        patientDetails.innerHTML = `<div class="alert alert-danger mb-0" role="alert">${escapeHtml(error.message)}</div>`;
      }
    });

    patientDiagnoseButton.addEventListener("click", () => {
      patientModal.hide();
      openRecordModal("create", { patientId: selectedPatientId });
    });

    recordTable.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-edit-record]");
      if (!button) {
        return;
      }

      renderInlineAlert(recordAlert, "");
      const latestRecords = await refreshRecords();
      const record = latestRecords.find((item) => String(item.recordId) === String(button.dataset.editRecord));
      if (!record) {
        renderInlineAlert(recordAlert, "Medical record not found.");
        return;
      }

      openRecordModal("edit", record);
    });

    recordForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(recordForm);
      renderInlineAlert(recordModalAlert, "");

      const payload = formToObject(recordForm);
      const errors = validateMedicalRecord(payload);

      if (Object.keys(errors).length > 0) {
        applyFormErrors(recordForm, errors);
        return;
      }

      setBusyState(recordSubmitButton, true);

      try {
        if (payload.recordId) {
          await medicalRecordService.update(payload.recordId, payload, context.currentUser);
        } else {
          await medicalRecordService.create(payload);
        }

        recordModal.hide();
        await refreshRecords();
        renderInlineAlert(recordAlert, payload.recordId ? "Medical record updated." : "Medical record saved.", "success");
      } catch (error) {
        renderInlineAlert(recordModalAlert, error.message);
      } finally {
        setBusyState(recordSubmitButton, false);
      }
    });

    appointmentTable.addEventListener("click", async (event) => {
      const viewButton = event.target.closest("[data-view-appointment]");
      const statusButton = event.target.closest("[data-appointment-status]");
      const postponeButton = event.target.closest("[data-postpone-appointment]");

      if (viewButton) {
        const appointment = appointments.find((item) => String(item.appointmentId) === String(viewButton.dataset.viewAppointment));
        if (!appointment) {
          renderInlineAlert(appointmentAlert, "Appointment not found.");
          return;
        }

        appointmentDetailsContainer.innerHTML = renderAppointmentDetails(appointment);
        appointmentDetailsModal.show();
        return;
      }

      if (statusButton) {
        const nextStatus = statusButton.dataset.nextStatus;
        setBusyState(statusButton, true, nextStatus === "Approved" ? "Approving..." : "Declining...");
        renderInlineAlert(appointmentAlert, "");

        try {
          const appointment = appointments.find((item) => String(item.appointmentId) === String(statusButton.dataset.appointmentStatus));
          if (!appointment) {
            throw new Error("Appointment not found.");
          }

          await appointmentService.update(appointment.appointmentId, {
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            status: nextStatus,
            receptionistId: appointment.receptionistId,
            otherInfo: appointment.otherInfo
          });
          await refreshAppointments();
          renderInlineAlert(appointmentAlert, `Appointment ${nextStatus.toLowerCase()}.`, "success");
        } catch (error) {
          renderInlineAlert(appointmentAlert, error.message);
        } finally {
          setBusyState(statusButton, false);
        }
        return;
      }

      if (!postponeButton) {
        return;
      }

      const appointment = appointments.find((item) => String(item.appointmentId) === String(postponeButton.dataset.postponeAppointment));
      if (!appointment) {
        renderInlineAlert(appointmentAlert, "Appointment not found.");
        return;
      }

      appointmentForm.reset();
      clearFormErrors(appointmentForm);
      renderInlineAlert(appointmentModalAlert, "");
      qs("#appointmentId", appointmentForm).value = appointment.appointmentId;
      qs("#appointmentPatientId", appointmentForm).value = appointment.patientId;
      qs("#appointmentDoctorId", appointmentForm).value = appointment.doctorId;
      qs("#appointmentDate", appointmentForm).value = appointment.appointmentDate;
      qs("#appointmentTime", appointmentForm).value = appointment.appointmentTime;
      qs("#appointmentStatus", appointmentForm).value = appointment.status;
      appointmentModal.show();
    });

    appointmentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(appointmentForm);
      renderInlineAlert(appointmentModalAlert, "");

      const payload = formToObject(appointmentForm);
      const errors = validateAppointment(payload);

      if (Object.keys(errors).length > 0) {
        applyFormErrors(appointmentForm, errors);
        return;
      }

      setBusyState(appointmentSubmitButton, true);

      try {
        await appointmentService.update(payload.appointmentId, payload);
        appointmentModal.hide();
        await refreshAppointments();
        renderInlineAlert(appointmentAlert, "Appointment updated.", "success");
      } catch (error) {
        renderInlineAlert(appointmentModalAlert, error.message);
      } finally {
        setBusyState(appointmentSubmitButton, false);
      }
    });

    availabilityForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      renderInlineAlert(availabilityAlert, "");

      const availability = formToObject(availabilityForm);
      if (!availability.availableDate || !availability.startTime || !availability.endTime) {
        renderInlineAlert(availabilityAlert, "Enter available date, start time, and end time.");
        return;
      }

      if (availability.startTime >= availability.endTime) {
        renderInlineAlert(availabilityAlert, "End time must be after start time.");
        return;
      }

      setBusyState(availabilitySubmit, true);

      try {
        await userService.updateDoctorAvailability(context.currentUser.id, availability);
        availabilitySummary.innerHTML = renderAvailabilitySummary(availability);
        renderInlineAlert(availabilityAlert, "Availability updated.", "success");
      } catch (error) {
        renderInlineAlert(availabilityAlert, error.message);
      } finally {
        setBusyState(availabilitySubmit, false);
      }
    });
  }
};
