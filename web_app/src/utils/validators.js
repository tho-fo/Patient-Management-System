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
    requiredFields.includes("years_of_experience") &&
    payload.years_of_experience?.trim() &&
    Number(payload.years_of_experience) < 0
  ) {
    errors.years_of_experience = "Years of experience cannot be negative.";
  }

  if (
    requiredFields.includes("confirm_password") &&
    payload.password?.trim() &&
    payload.confirm_password?.trim() &&
    payload.password !== payload.confirm_password
  ) {
    errors.confirm_password = "Passwords do not match.";
  }

  return errors;
}

export function validatePatient(payload) {
  const errors = {};

  if (!payload.full_name?.trim()) {
    errors.full_name = "Patient name is required.";
  }

  if (!payload.age || Number(payload.age) <= 0) {
    errors.age = "Age must be a positive number.";
  }

  if (!payload.gender) {
    errors.gender = "Select a gender.";
  }

  if (!payload.phone?.trim()) {
    errors.phone = "Phone number is required.";
  }

  if (!payload.address?.trim()) {
    errors.address = "Address is required.";
  }

  return errors;
}

export function validateAppointment(payload) {
  const errors = {};

  if (!payload.patient_id) {
    errors.patient_id = "Select a patient.";
  }

  if (!payload.doctor_id) {
    errors.doctor_id = "Select a doctor.";
  }

  if (!payload.appointment_date) {
    errors.appointment_date = "Select an appointment date.";
  }

  if (!payload.appointment_time) {
    errors.appointment_time = "Select an appointment time.";
  }

  return errors;
}

export function validateMedicalRecord(payload) {
  const errors = {};

  if (!payload.patient_id) {
    errors.patient_id = "Select a patient.";
  }

  if (!payload.doctor_id) {
    errors.doctor_id = "Select a doctor.";
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

  if (!payload.full_name?.trim()) {
    errors.full_name = "Staff name is required.";
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

  if (!payload.current_password?.trim()) {
    errors.current_password = "Current password is required.";
  }

  if (!payload.new_password?.trim()) {
    errors.new_password = "New password is required.";
  }

  if (!payload.confirm_password?.trim()) {
    errors.confirm_password = "Confirm the new password.";
  }

  if (
    payload.new_password?.trim() &&
    payload.confirm_password?.trim() &&
    payload.new_password !== payload.confirm_password
  ) {
    errors.confirm_password = "Passwords do not match.";
  }

  return errors;
}
