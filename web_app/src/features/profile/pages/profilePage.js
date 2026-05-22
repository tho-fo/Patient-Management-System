import { routePaths } from "../../../core/constants/routes.js";
import { roles, roleLabels } from "../../../core/constants/roles.js";
import { renderKeyValueList, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { store } from "../../../shared/state/store.js";
import { qs, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { escapeHtml, getInitials } from "../../../utils/formatters.js";
import { calculateAge, profileService } from "../services/profileService.js";

function patientItems(profile) {
  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : profile.age;

  return [
    { label: "Full Name", value: profile.fullName },
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone },
    { label: "Gender", value: profile.gender },
    { label: "Date of Birth", value: profile.dateOfBirth },
    { label: "Age", value: age },
    { label: "Address", value: profile.address }
  ];
}

function doctorItems(profile) {
  return [
    { label: "Full Name", value: profile.fullName },
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone },
    { label: "Specialization", value: profile.specialization },
    { label: "License Number", value: profile.licenseNumber },
    { label: "Years of Experience", value: profile.yearsOfExperience }
  ];
}

function staffItems(profile) {
  return [
    { label: "Full Name", value: profile.fullName },
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone || "-" },
    { label: "Role", value: roleLabels[profile.role] ?? profile.role }
  ];
}

function renderAvatar(profile) {
  return `
    <div class="profile-avatar" aria-hidden="true">
      ${escapeHtml(getInitials(profile.fullName))}
    </div>
  `;
}

function renderPrimaryCard(profile) {
  return `
    <section class="profile-identity-card">
      ${renderAvatar(profile)}
      <div class="min-w-0">
        <span class="role-chip ${escapeHtml(profile.role)} mb-3">${escapeHtml(roleLabels[profile.role] ?? profile.role)}</span>
        <h2 class="page-title profile-name">${escapeHtml(profile.fullName || "Profile")}</h2>
        <p class="page-subtitle mb-0">${escapeHtml(profile.email || "No email available")}</p>
      </div>
    </section>
  `;
}

function renderRoleActions(profile) {
  const actions = [
    {
      title: "Back to Dashboard",
      description: "Return to your role-based system overview.",
      href: routePaths.dashboard,
      icon: "bi-grid"
    }
  ];

  if (profile.role === roles.PATIENT) {
    actions.push({
      title: "Book Appointment",
      description: "Schedule a visit with an available doctor.",
      href: routePaths.bookAppointment,
      icon: "bi-calendar-plus"
    });
  }

  if (profile.role === roles.DOCTOR) {
    actions.push({
      title: "View Appointments",
      description: "Review upcoming patient appointments.",
      href: routePaths.appointments,
      icon: "bi-calendar-check"
    });
  }

  return actions.map((action) => `
    <a class="quick-action-card d-block" href="#${action.href}">
      <div class="d-flex align-items-start justify-content-between gap-3">
        <div>
          <h3>${escapeHtml(action.title)}</h3>
          <p class="mb-0">${escapeHtml(action.description)}</p>
        </div>
        <i class="bi ${escapeHtml(action.icon)} fs-4 text-soft"></i>
      </div>
    </a>
  `).join("");
}

export const profilePage = {
  title: "Profile",
  subtitle: "Role-based account details from Firebase and Firestore.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT],

  async render() {
    const profile = await profileService.getCurrentProfile();
    const details = profile.role === roles.PATIENT
      ? patientItems(profile)
      : profile.role === roles.DOCTOR
        ? doctorItems(profile)
        : staffItems(profile);

    return {
      title: "Profile",
      subtitle: "Account details, profile actions, and logout.",
      content: `
        ${renderPageHero({
          eyebrow: "Profile",
          title: "Your account",
          subtitle: "Review the Firestore profile connected to your Firebase Authentication account."
        })}

        <div id="profilePageAlert" class="mb-3"></div>

        <div class="profile-layout">
          <div class="profile-stack">
            ${renderPrimaryCard(profile)}
            ${renderSectionCard({
              title: "Profile details",
              subtitle: profile.role === roles.PATIENT
                ? "Patient demographic and contact information."
                : "Doctor professional and contact information.",
              content: renderKeyValueList(details)
            })}
          </div>

          <div class="profile-stack">
            ${renderSectionCard({
              title: "Account actions",
              subtitle: "Profile actions available for this account.",
              content: `
                <div class="d-grid gap-2">
                  <button class="btn btn-outline-primary" type="button" disabled>
                    <i class="bi bi-pencil-square me-2"></i>Edit Profile
                  </button>
                  <button class="btn btn-outline-secondary" type="button" disabled>
                    <i class="bi bi-shield-lock me-2"></i>Change Password
                  </button>
                  <a class="btn btn-primary" href="#${routePaths.dashboard}">
                    <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
                  </a>
                  <button class="btn btn-outline-danger" id="profileLogout" type="button">
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </div>
              `
            })}

            ${renderSectionCard({
              title: "Relevant actions",
              subtitle: "Quick access based on your role.",
              content: `<div class="profile-action-stack">${renderRoleActions(profile)}</div>`
            })}
          </div>
        </div>
      `
    };
  },

  mount(root, context) {
    const logoutButton = qs("#profileLogout", root);
    const alertContainer = qs("#profilePageAlert", root);

    logoutButton?.addEventListener("click", async () => {
      renderInlineAlert(alertContainer, "");
      setBusyState(logoutButton, true, "Logging out...");

      try {
        await profileService.logout();
        store.clearSession();
        store.setFlash({
          type: "success",
          message: "You have been logged out successfully."
        });
        context.navigate(routePaths.login);
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
        setBusyState(logoutButton, false);
      }
    });
  }
};
