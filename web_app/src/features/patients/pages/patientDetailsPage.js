import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { patientService } from "../services/patientService.js";
import {
  renderDataTable,
  renderKeyValueList,
  renderModal,
  renderPageHero,
  renderRecentAppointmentTimeline,
  renderSectionCard,
  renderTimeline
} from "../../../shared/components/ui.js";
import { escapeHtml, formatDate, getInitials } from "../../../utils/formatters.js";
import { qs, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { store } from "../../../shared/state/store.js";

function canManagePatients(role) {
  return role === roles.ADMIN || role === roles.DOCTOR || role === roles.RECEPTIONIST;
}

function buildMedicalRecordRows(records) {
  return records.slice(0, 5).map((record) => `
    <tr>
      <td>${escapeHtml(record.doctorName ?? record.doctorId ?? "-")}</td>
      <td>${escapeHtml(record.diagnosis ?? "-")}</td>
      <td>${escapeHtml(record.treatment ?? "-")}</td>
      <td>${formatDate(record.recordDate)}</td>
    </tr>
  `);
}

export const patientDetailsPage = {
  title: "Patient Details",
  subtitle: "Patient demographics, contact details, and medical information.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],

  async render(context) {
    const patient = await patientService.getById(context.params.id);
    const editable = canManagePatients(context.currentUser.role);

    return {
      title: patient.fullName,
      subtitle: "Patient profile and record overview.",
      patient,
      content: `
        ${renderPageHero({
          eyebrow: "Patient Profile",
          title: patient.fullName,
          subtitle: "Review personal, contact, medical, appointment, and record information.",
          actions: `
            <a class="btn btn-outline-secondary" href="#${routePaths.patients}">Back</a>
            ${editable ? `<a class="btn btn-primary" href="#/patients/${patient.patientId}/edit"><i class="bi bi-pencil me-2"></i>Edit</a>` : ""}
          `
        })}

        <div id="patientDetailAlert" class="mb-3"></div>
        <div class="profile-layout">
          <div class="profile-stack">
            <section class="profile-identity-card">
              <span class="profile-avatar">${escapeHtml(getInitials(patient.fullName))}</span>
              <div class="profile-name">
                <h2 class="h4 fw-bold mb-1">${escapeHtml(patient.fullName)}</h2>
                <p class="text-soft mb-2">Patient #${escapeHtml(patient.patientId)}</p>
                <div class="d-flex flex-wrap gap-2">
                  <span class="status-pill pending">${escapeHtml(patient.gender)}</span>
                  <span class="status-pill completed">${escapeHtml(patient.bloodGroup || "Blood N/A")}</span>
                  <span class="status-pill cancelled">${escapeHtml(patient.age)} years</span>
                </div>
              </div>
            </section>

            <div class="profile-grid">
              ${renderSectionCard({
                title: "Personal information",
                content: renderKeyValueList([
                  { label: "First name", value: patient.firstName },
                  { label: "Last name", value: patient.lastName },
                  { label: "Gender", value: patient.gender },
                  { label: "Date of birth", value: formatDate(patient.dateOfBirth) },
                  { label: "Age", value: `${patient.age} years` }
                ])
              })}

              ${renderSectionCard({
                title: "Contact information",
                content: renderKeyValueList([
                  { label: "Phone", value: patient.phone },
                  { label: "Email", value: patient.email || "-" },
                  { label: "Address", value: patient.address || "-" },
                  { label: "Emergency contact", value: patient.emergencyContact || "-" }
                ])
              })}
            </div>

            ${renderSectionCard({
              title: "Medical information",
              content: renderKeyValueList([
                { label: "Blood group", value: patient.bloodGroup || "-" },
                { label: "Medical condition", value: patient.medicalCondition || "-" },
                { label: "Registered", value: formatDate(patient.createdAt) }
              ])
            })}

            ${renderSectionCard({
              title: "Recent appointments",
              subtitle: "Latest visits linked to this patient.",
              content: patient.appointments.length
                ? renderTimeline(patient.appointments.slice(0, 5), renderRecentAppointmentTimeline)
                : renderDataTable({
                    headers: ["Doctor", "Date", "Time", "Status"],
                    rows: [],
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
            title: "Actions",
            subtitle: "Use patient context for the next hospital workflow step.",
            content: `
              <div class="profile-action-stack">
                <a class="btn btn-primary" href="#${routePaths.bookAppointment}?patientId=${patient.patientId}"><i class="bi bi-calendar-plus me-2"></i>Book appointment</a>
                <a class="btn btn-outline-secondary" href="#${routePaths.medicalHistory}?patientId=${patient.patientId}">View history</a>
                ${editable ? `<button class="btn btn-outline-danger" id="patientDeleteButton" type="button"><i class="bi bi-trash me-2"></i>Delete patient</button>` : ""}
              </div>
            `
          })}
        </div>

        ${renderModal({
          id: "deletePatientModal",
          title: "Delete patient",
          body: `<p class="mb-0">Are you sure you want to delete this patient?</p><p class="text-soft mb-0 mt-2">${escapeHtml(patient.fullName)}</p>`,
          footer: `
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDeletePatient">Delete patient</button>
          `
        })}
      `
    };
  },

  mount(root, context, page) {
    if (!canManagePatients(context.currentUser.role)) {
      return;
    }

    const deleteButton = qs("#patientDeleteButton", root);
    const confirmDeleteButton = qs("#confirmDeletePatient", root);
    const alertContainer = qs("#patientDetailAlert", root);
    const deleteModalElement = qs("#deletePatientModal", root);
    const deleteModal = window.bootstrap ? new window.bootstrap.Modal(deleteModalElement) : null;

    deleteButton?.addEventListener("click", () => {
      deleteModal?.show();
    });

    confirmDeleteButton?.addEventListener("click", async () => {
      setBusyState(confirmDeleteButton, true);
      renderInlineAlert(alertContainer, "");

      try {
        await patientService.remove(page.patient.patientId);
        store.setFlash({
          type: "success",
          message: "Patient record deleted successfully."
        });
        deleteModal?.hide();
        context.navigate(routePaths.patients);
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
      } finally {
        setBusyState(confirmDeleteButton, false);
      }
    });
  }
};
