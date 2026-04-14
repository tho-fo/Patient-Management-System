/**
 * Application Constants
 * Global constants used throughout the application
 */

const APP_CONSTANTS = {
    // Application Info
    APP_NAME: 'Patient Management System',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Hospital Management & Patient Care Platform',
    
    // User Roles
    ROLES: {
        ADMIN: 'admin',
        DOCTOR: 'doctor',
        RECEPTIONIST: 'receptionist',
        PATIENT: 'patient'
    },
    
    // User Role Descriptions
    ROLE_DESCRIPTIONS: {
        admin: 'System Administrator',
        doctor: 'Medical Doctor',
        receptionist: 'Hospital Receptionist',
        patient: 'Patient'
    },
    
    // Appointment Status
    APPOINTMENT_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
        RESCHEDULED: 'rescheduled',
        NO_SHOW: 'no_show'
    },
    
    // Appointment Status Colors
    APPOINTMENT_STATUS_CLASS: {
        pending: 'badge-warning',
        confirmed: 'badge-info',
        completed: 'badge-success',
        cancelled: 'badge-danger',
        rescheduled: 'badge-secondary',
        no_show: 'badge-dark'
    },
    
    // Patient Gender
    GENDER: {
        MALE: 'male',
        FEMALE: 'female',
        OTHER: 'other'
    },
    
    // Medical Record Types
    RECORD_TYPES: {
        DIAGNOSIS: 'diagnosis',
        PRESCRIPTION: 'prescription',
        LAB_REPORT: 'lab_report',
        X_RAY: 'x_ray',
        SCAN: 'scan',
        CONSULTATION_NOTES: 'consultation_notes'
    },
    
    // Validation Rules
    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^[0-9]{10,15}$/,
        PASSWORD_MIN_LENGTH: 6,
        USERNAME_MIN_LENGTH: 3,
        NAME_MIN_LENGTH: 2
    },
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        REFRESH_TOKEN: 'refreshToken',
        USER_DATA: 'userData',
        USER_PREFERENCES: 'userPreferences',
        SAVED_EMAIL: 'savedEmail',
        SIDEBAR_STATE: 'sidebarState'
    },
    
    // Pagination
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        PAGE_SIZES: [5, 10, 25, 50],
        MAX_RESULTS: 100
    },
    
    // Date Formats
    DATE_FORMATS: {
        DISPLAY: 'MM/DD/YYYY',
        DISPLAY_TIME: 'MM/DD/YYYY HH:mm',
        API: 'YYYY-MM-DD',
        API_DATETIME: 'YYYY-MM-DD HH:mm:ss'
    },
    
    // Messages
    MESSAGES: {
        LOADING: 'Loading...',
        NO_DATA: 'No data available',
        ERROR: 'An error occurred. Please try again.',
        SUCCESS: 'Operation completed successfully.',
        CONFIRMATION: 'Are you sure?',
        DELETED: 'Item deleted successfully.',
        CREATED: 'Item created successfully.',
        UPDATED: 'Item updated successfully.'
    },
    
    // Error Codes
    ERROR_CODES: {
        UNAUTHORIZED: 'UNAUTHORIZED',
        FORBIDDEN: 'FORBIDDEN',
        NOT_FOUND: 'NOT_FOUND',
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        SERVER_ERROR: 'SERVER_ERROR',
        NETWORK_ERROR: 'NETWORK_ERROR'
    },
    
    // Session Timeout (in minutes)
    SESSION_TIMEOUT: 30,
    
    // Features (toggle)
    FEATURES: {
        ENABLE_BILLING: false,
        ENABLE_LABORATORY: false,
        ENABLE_NOTIFICATIONS: true,
        ENABLE_REPORTS: true
    }
};

// Export constants
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APP_CONSTANTS };
}
