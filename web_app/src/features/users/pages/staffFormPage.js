import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { userService } from "../services/userService.js";
import { renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { qs, formToObject, clearFormErrors, applyFormErrors, renderInlineAlert, setBusyState } from "../../../utils/dom.js";
import { validateStaff } from "../../../utils/validators.js";
import { store } from "../../../shared/state/store.js";

function specializationClass(role) {
  return role === roles.DOCTOR ? "" : "d-none";
}

export const staffFormPage = {
  title: "Staff Form",
  subtitle: "Create or update staff accounts and role assignments.",
  allowedRoles: [roles.ADMIN],

  async render(context) {
    const isEdit = Boolean(context.params.staffKey);
    const staff = isEdit ? await userService.getByKey(context.params.staffKey) : null;

    return {
      title: isEdit ? "Edit Staff" : "Add Staff",
      subtitle: "Manage role assignment, contact details, and login credentials.",
      content: `
        ${renderPageHero({
          eyebrow: "Staff Account",
          title: isEdit ? "Edit staff account" : "Create staff account",
          subtitle: "Doctor, receptionist, and admin accounts follow the user/staff module documentation.",
          actions: `<a class="btn btn-outline-secondary" href="#${routePaths.staff}">Back to staff</a>`
        })}

        ${renderSectionCard({
          title: isEdit ? "Update staff details" : "Staff details",
          subtitle: "Role, name, contact information, and credentials are managed here.",
          content: `
            <div id="staffFormAlert" class="mb-3"></div>
            <form id="staffForm" novalidate>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="full_name">Full name</label>
                  <input class="form-control" id="full_name" name="full_name" type="text" value="${staff?.full_name ?? ""}">
                  <div class="invalid-feedback" data-error-for="full_name"></div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="role">Role</label>
                  <select class="form-select" id="role" name="role">
                    <option value="">Select role</option>
                    <option value="admin" ${staff?.role === "admin" ? "selected" : ""}>Admin</option>
                    <option value="doctor" ${staff?.role === "doctor" ? "selected" : ""}>Doctor</option>
                    <option value="receptionist" ${staff?.role === "receptionist" ? "selected" : ""}>Receptionist</option>
                  </select>
                  <div class="invalid-feedback" data-error-for="role"></div>
                </div>
                <div class="col-md-6 ${specializationClass(staff?.role)}" id="specializationGroup">
                  <label class="form-label fw-semibold" for="specialization">Specialization</label>
                  <input class="form-control" id="specialization" name="specialization" type="text" value="${staff?.specialization ?? ""}">
                  <div class="invalid-feedback" data-error-for="specialization"></div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="phone">Phone</label>
                  <input class="form-control" id="phone" name="phone" type="tel" value="${staff?.phone ?? ""}">
                  <div class="invalid-feedback" data-error-for="phone"></div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="email">Email</label>
                  <input class="form-control" id="email" name="email" type="email" value="${staff?.email ?? ""}">
                  <div class="invalid-feedback" data-error-for="email"></div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="password">${isEdit ? "New password (optional)" : "Password"}</label>
                  <input class="form-control" id="password" name="password" type="password">
                  <div class="invalid-feedback" data-error-for="password"></div>
                </div>
              </div>
              <div class="d-flex gap-2 mt-4">
                <button class="btn btn-primary" id="staffSubmit" type="submit"><i class="bi bi-save me-2"></i>${isEdit ? "Save changes" : "Create staff"}</button>
                <a class="btn btn-outline-secondary" href="#${routePaths.staff}">Cancel</a>
              </div>
            </form>
          `
        })}
      `
    };
  },

  mount(root, context) {
    const isEdit = Boolean(context.params.staffKey);
    const form = qs("#staffForm", root);
    const submitButton = qs("#staffSubmit", root);
    const alertContainer = qs("#staffFormAlert", root);
    const roleField = qs("#role", root);
    const specializationGroup = qs("#specializationGroup", root);

    const syncRoleFields = () => {
      specializationGroup.classList.toggle("d-none", roleField.value !== roles.DOCTOR);
    };

    roleField.addEventListener("change", syncRoleFields);
    syncRoleFields();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(form);
      renderInlineAlert(alertContainer, "");

      const payload = formToObject(form);
      const errors = validateStaff(payload, isEdit);

      if (Object.keys(errors).length > 0) {
        applyFormErrors(form, errors);
        return;
      }

      setBusyState(submitButton, true);

      try {
        if (isEdit) {
          await userService.update(context.params.staffKey, payload);
          store.setFlash({
            type: "success",
            message: "Staff account updated successfully."
          });
        } else {
          await userService.create(payload);
          store.setFlash({
            type: "success",
            message: "Staff account created successfully."
          });
        }

        context.navigate(routePaths.staff);
      } catch (error) {
        renderInlineAlert(alertContainer, error.message);
      } finally {
        setBusyState(submitButton, false);
      }
    });
  }
};
