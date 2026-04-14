export const roles = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
  PATIENT: "patient"
};

export const roleLabels = {
  [roles.ADMIN]: "Admin",
  [roles.DOCTOR]: "Doctor",
  [roles.RECEPTIONIST]: "Receptionist",
  [roles.PATIENT]: "Patient"
};

export function isRoleAllowed(currentRole, allowedRoles = []) {
  return allowedRoles.length === 0 || allowedRoles.includes(currentRole);
}
