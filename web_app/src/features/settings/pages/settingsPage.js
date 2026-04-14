import { routePaths } from "../../../core/constants/routes.js";
import { roles, roleLabels } from "../../../core/constants/roles.js";
import { settingsService } from "../services/settingsService.js";
import { store } from "../../../shared/state/store.js";
import { renderKeyValueList, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { validatePasswordChange } from "../../../utils/validators.js";

function getRoleSummary(role) {
  const map = {
    [roles.ADMIN]: [
      { label: "Access", value: "Manage users, reports, and overall operations" },
      { label: "Dashboard focus", value: "System overview and administration" },
      { label: "Reports", value: "Full analytics access" }
    ],
    [roles.DOCTOR]: [
      { label: "Access", value: "View appointments and add medical records" },
      { label: "Dashboard focus", value: "Patient care and clinical updates" },
      { label: "Reports", value: "No direct report administration" }
    ],
    [roles.RECEPTIONIST]: [
      { label: "Access", value: "Register patients and schedule appointments" },
      { label: "Dashboard focus", value: "Front desk operations" },
      { label: "Reports", value: "Operational workflow only" }
    ],
    [roles.PATIENT]: [
      { label: "Access", value: "View records and book appointments" },
      { label: "Dashboard focus", value: "Personal care information" },
      { label: "Reports", value: "No admin analytics access" }
    ]
  };

  return map[role];
}

function renderProfileFields(profile) {
  return `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label fw-semibold" for="profile_full_name">Full name</label>
        <input class="form-control" id="profile_full_name" name="full_name" type="text" value="${profile.full_name}">
      </div>
      <div class="col-md-6">
        <label class="form-label fw-semibold" for="profile_email">Email</label>
        <input class="form-control" id="profile_email" name="email" type="email" value="${profile.email}">
      </div>
      ${profile.role !== roles.ADMIN ? `
        <div class="col-md-6">
          <label class="form-label fw-semibold" for="profile_phone">Phone</label>
          <input class="form-control" id="profile_phone" name="phone" type="tel" value="${profile.phone ?? ""}">
        </div>
      ` : ""}
      ${profile.role === roles.DOCTOR ? `
        <div class="col-md-6">
          <label class="form-label fw-semibold" for="profile_specialization">Specialization</label>
          <input class="form-control" id="profile_specialization" name="specialization" type="text" value="${profile.specialization ?? ""}">
        </div>
      ` : ""}
      <div class="col-12">
        <label class="form-label fw-semibold" for="profile_role">Role</label>
        <input class="form-control" id="profile_role" type="text" value="${roleLabels[profile.role]}" disabled>
      </div>
    </div>
  `;
}

export const settingsPage = {
  title: "Settings",
  subtitle: "Basic user settings, profile details, and password update.",
  allowedRoles: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST, roles.PATIENT],

  async render(context) {
    const profile = await settingsService.getProfile({
      role: context.currentUser.role,
      id: context.currentUser.id
    });

    return {
      title: "Settings",
      subtitle: "User settings, profile management, password changes, and access summary.",
      content: `
        ${renderPageHero({
          eyebrow: "Profile & Settings",
          title: "Manage your account",
          subtitle: "Update user details, change your password, and review role-based access in the system."
        })}

        <div class="profile-grid">
          ${renderSectionCard({
            title: "User information",
            subtitle: "Basic system/user settings for your active account.",
            content: `
              <div id="profileAlert" class="mb-3"></div>
              <form id="profileForm">
                ${renderProfileFields(profile)}
                <div class="d-flex gap-2 mt-4">
                  <button class="btn btn-primary" id="profileSubmit" type="submit"><i class="bi bi-save me-2"></i>Save profile</button>
                </div>
              </form>
            `
          })}

          ${renderSectionCard({
            title: "Change password",
            subtitle: "Secure your account with an updated password.",
            content: `
              <div id="passwordAlert" class="mb-3"></div>
              <form id="passwordForm" novalidate>
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label fw-semibold" for="current_password">Current password</label>
                    <input class="form-control" id="current_password" name="current_password" type="password">
                    <div class="invalid-feedback" data-error-for="current_password"></div>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold" for="new_password">New password</label>
                    <input class="form-control" id="new_password" name="new_password" type="password">
                    <div class="invalid-feedback" data-error-for="new_password"></div>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold" for="confirm_password">Confirm password</label>
                    <input class="form-control" id="confirm_password" name="confirm_password" type="password">
                    <div class="invalid-feedback" data-error-for="confirm_password"></div>
                  </div>
                </div>
                <div class="d-flex gap-2 mt-4">
                  <button class="btn btn-primary" id="passwordSubmit" type="submit"><i class="bi bi-shield-lock me-2"></i>Update password</button>
                </div>
              </form>
            `
          })}

          ${renderSectionCard({
            title: "Role configuration",
            subtitle: "Current access summary derived from the documented system roles.",
            content: renderKeyValueList(getRoleSummary(profile.role))
          })}

          ${renderSectionCard({
            title: "System view",
            subtitle: "Current account context for this session.",
            content: renderKeyValueList([
              { label: "System", value: "Patient Management System" },
              { label: "Current role", value: roleLabels[profile.role] },
              { label: "Active user", value: profile.full_name }
            ])
          })}
        </div>
      `
    };
  },

  mount(root, context) {
    const profileForm = qs("#profileForm", root);
    const passwordForm = qs("#passwordForm", root);
    const profileAlert = qs("#profileAlert", root);
    const passwordAlert = qs("#passwordAlert", root);
    const profileButton = qs("#profileSubmit", root);
    const passwordButton = qs("#passwordSubmit", root);

    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      renderInlineAlert(profileAlert, "");

      const payload = {
        ...formToObject(profileForm),
        role: context.currentUser.role,
        id: context.currentUser.id
      };

      setBusyState(profileButton, true);

      try {
        const updatedProfile = await settingsService.updateProfile(payload);
        const session = store.getSession();
        store.setSession({
          ...session,
          user: { ...session.user, ...updatedProfile }
        });
        store.setFlash({
          type: "success",
          message: "Profile updated successfully."
        });
        context.navigate(`${routePaths.settings}?updated=${Date.now()}`);
      } catch (error) {
        renderInlineAlert(profileAlert, error.message);
      } finally {
        setBusyState(profileButton, false);
      }
    });

    passwordForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(passwordForm);
      renderInlineAlert(passwordAlert, "");

      const payload = {
        ...formToObject(passwordForm),
        role: context.currentUser.role,
        id: context.currentUser.id
      };

      const errors = validatePasswordChange(payload);
      if (Object.keys(errors).length > 0) {
        applyFormErrors(passwordForm, errors);
        return;
      }

      setBusyState(passwordButton, true);

      try {
        await settingsService.changePassword(payload);
        passwordForm.reset();
        renderInlineAlert(passwordAlert, "Password updated successfully.", "success");
      } catch (error) {
        renderInlineAlert(passwordAlert, error.message);
      } finally {
        setBusyState(passwordButton, false);
      }
    });
  }
};
