import { routePaths } from "../../../core/constants/routes.js";
import { roles } from "../../../core/constants/roles.js";
import { userService } from "../services/userService.js";
import { renderDataTable, renderPageHero, renderSectionCard } from "../../../shared/components/ui.js";
import { qs, formToObject } from "../../../utils/dom.js";

function buildRows(staff) {
  return staff.map((member) => `
    <tr>
      <td><strong>${member.fullName}</strong></td>
      <td class="text-capitalize">${member.role}</td>
      <td>${member.specialization || member.phone || "-"}</td>
      <td>${member.email}</td>
      <td class="text-end">
        <a class="btn btn-sm btn-outline-primary me-2" href="#/staff/${member.staffKey}/edit">Edit</a>
        <button class="btn btn-sm btn-outline-danger" type="button" data-delete-staff="${member.staffKey}">Delete</button>
      </td>
    </tr>
  `);
}

export const staffListPage = {
  title: "Staff",
  subtitle: "Staff list and user administration for doctors, receptionists, and admins.",
  allowedRoles: [roles.ADMIN],

  async render() {
    const staff = await userService.list();

    return {
      title: "Staff Management",
      subtitle: "Add, edit, filter, and remove staff accounts by role.",
      content: `
        ${renderPageHero({
          eyebrow: "User / Staff Module",
          title: "Staff accounts",
          subtitle: "Manage doctors, receptionists, and admin users from one documented staff module.",
          actions: `<a class="btn btn-primary" href="#${routePaths.addStaff}"><i class="bi bi-person-plus me-2"></i>Add staff</a>`
        })}

        ${renderSectionCard({
          title: "Staff list",
          subtitle: "Filter staff accounts by role or search by name and email.",
          content: `
            <form id="staffFilterForm" class="filter-bar mb-4">
              <div class="row g-3 align-items-end">
                <div class="col-lg-5">
                  <label class="form-label fw-semibold" for="search">Search</label>
                  <input class="form-control" id="search" name="search" type="text" placeholder="Name or email">
                </div>
                <div class="col-lg-4">
                  <label class="form-label fw-semibold" for="role">Role</label>
                  <select class="form-select" id="role" name="role">
                    <option value="">All roles</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>
                <div class="col-lg-3 d-flex gap-2">
                  <button class="btn btn-primary flex-fill" type="submit">Apply</button>
                  <button class="btn btn-outline-secondary" id="staffFilterReset" type="button">Reset</button>
                </div>
              </div>
            </form>
            <div id="staffTableRegion">
              ${renderDataTable({
                headers: ["Name", "Role", "Contact / Specialty", "Email", "Actions"],
                rows: buildRows(staff),
                emptyMessage: "No staff members matched the current filters."
              })}
            </div>
          `
        })}
      `
    };
  },

  mount(root) {
    const form = qs("#staffFilterForm", root);
    const resetButton = qs("#staffFilterReset", root);
    const tableRegion = qs("#staffTableRegion", root);

    const loadStaff = async (filters = {}) => {
      const staff = await userService.list(filters);
      tableRegion.innerHTML = renderDataTable({
        headers: ["Name", "Role", "Contact / Specialty", "Email", "Actions"],
        rows: buildRows(staff),
        emptyMessage: "No staff members matched the current filters."
      });
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await loadStaff(formToObject(form));
    });

    resetButton.addEventListener("click", async () => {
      form.reset();
      await loadStaff();
    });

    tableRegion.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-delete-staff]");
      if (!button) {
        return;
      }

      const confirmed = window.confirm("Delete this staff account?");
      if (!confirmed) {
        return;
      }

      try {
        await userService.remove(button.dataset.deleteStaff);
        await loadStaff(formToObject(form));
      } catch (error) {
        window.alert(error.message);
      }
    });
  }
};
