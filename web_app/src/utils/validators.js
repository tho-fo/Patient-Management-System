export function validateLogin(payload) {
  const errors = {};

  if (!payload.email?.trim()) {
    errors.email = "Email is required.";
  }

  if (!payload.password?.trim()) {
    errors.password = "Password is required.";
  }

  return errors;
}

function requireFields(payload, fields) {
  return fields.reduce((errors, field) => {
    if (!payload[field]?.trim()) {
      errors[field] = "This field is required.";
    }

    return errors;
  }, {});
}

export function validateRegistrationStep(payload, requiredFields = []) {
  const errors = requireFields(payload, requiredFields);

  if (requiredFields.includes("email") && payload.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (requiredFields.includes("password") && payload.password?.trim() && payload.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (
    (requiredFields.includes("yearsOfExperience") || requiredFields.includes("yearsOfExperience")) &&
    (payload.yearsOfExperience ?? payload.yearsOfExperience)?.trim() &&
    Number(payload.yearsOfExperience ?? payload.yearsOfExperience) < 0
  ) {
    errors.yearsOfExperience = "Years of experience cannot be negative.";
  }

  if (
    requiredFields.includes("confirmPassword") &&
    payload.password?.trim() &&
    payload.confirmPassword?.trim() &&
    payload.password !== payload.confirmPassword
  ) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function validatePatient(payload) {
  const errors = {};

  if (!payload.firstName?.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!payload.lastName?.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!payload.gender) {
    errors.gender = "Select a gender.";
  }

  if (!payload.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  }

  if (payload.age && Number(payload.age) < 0) {
    errors.age = "Age cannot be negative.";
  }

  if (!payload.phone?.trim()) {
    errors.phone = "Phone number is required.";
  }

  if (payload.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

export function validateAppointment(payload) {
  const errors = {};

  if (!payload.patientId) {
    errors.patientId = "Select a patient.";
  }

  if (!payload.doctorId) {
    errors.doctorId = "Select a doctor.";
  }

  if (!payload.appointmentDate) {
    errors.appointmentDate = "Select an appointment date.";
  }

  if (!payload.appointmentTime) {
    errors.appointmentTime = "Select an appointment time.";
  }

  return errors;
}

export function validateMedicalRecord(payload) {
  const errors = {};

  if (!payload.patientId) {
    errors.patientId = "Select a patient.";
  }

  if (!payload.doctorId) {
    errors.doctorId = "Select a doctor.";
  }

  if (!payload.diagnosis?.trim()) {
    errors.diagnosis = "Diagnosis is required.";
  }

  if (!payload.treatment?.trim()) {
    errors.treatment = "Treatment is required.";
  }

  return errors;
}

export function validateStaff(payload, isEdit = false) {
  const errors = {};

  if (!payload.fullName?.trim()) {
    errors.fullName = "Staff name is required.";
  }

  if (!payload.role) {
    errors.role = "Select a staff role.";
  }

  if (!payload.email?.trim()) {
    errors.email = "Email is required.";
  }

  if (!payload.phone?.trim() && payload.role !== "admin") {
    errors.phone = "Phone number is required.";
  }

  if (!isEdit && !payload.password?.trim()) {
    errors.password = "Password is required for new staff accounts.";
  }

  if (payload.role === "doctor" && !payload.specialization?.trim()) {
    errors.specialization = "Doctor specialization is required.";
  }

  return errors;
}

export function validatePasswordChange(payload) {
  const errors = {};

  if (!payload.currentPassword?.trim()) {
    errors.currentPassword = "Current password is required.";
  }

  if (!payload.newPassword?.trim()) {
    errors.newPassword = "New password is required.";
  }

  if (!payload.confirmPassword?.trim()) {
    errors.confirmPassword = "Confirm the new password.";
  }

  if (
    payload.newPassword?.trim() &&
    payload.confirmPassword?.trim() &&
    payload.newPassword !== payload.confirmPassword
  ) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}
