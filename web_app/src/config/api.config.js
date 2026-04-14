/**
 * API Configuration
 * Centralized API endpoint management
 */

const API_CONFIG = {
    // Base URL for all API calls
    BASE_URL: process.env.API_URL || 'http://localhost:8000/api',
    
    // Timeout for API requests (in milliseconds)
    TIMEOUT: 30000,
    
    // API Version
    VERSION: 'v1',
    
    // Endpoints mapping
    ENDPOINTS: {
        // Authentication
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REGISTER: '/auth/register',
            REFRESH_TOKEN: '/auth/refresh-token',
            CHANGE_PASSWORD: '/auth/change-password'
        },
        
        // Patients
        PATIENTS: {
            LIST: '/patients',
            CREATE: '/patients',
            GET: '/patients/:id',
            UPDATE: '/patients/:id',
            DELETE: '/patients/:id',
            SEARCH: '/patients/search',
            GET_BY_ID: '/patients/:id/details'
        },
        
        // Appointments
        APPOINTMENTS: {
            LIST: '/appointments',
            CREATE: '/appointments',
            GET: '/appointments/:id',
            UPDATE: '/appointments/:id',
            CANCEL: '/appointments/:id/cancel',
            RESCHEDULE: '/appointments/:id/reschedule'
        },
        
        // Medical Records
        MEDICAL_RECORDS: {
            LIST: '/medical-records',
            CREATE: '/medical-records',
            GET: '/medical-records/:id',
            UPDATE: '/medical-records/:id',
            GET_BY_PATIENT: '/medical-records/patient/:patientId'
        },
        
        // Users/Staff
        USERS: {
            LIST: '/users',
            CREATE: '/users',
            GET: '/users/:id',
            UPDATE: '/users/:id',
            DELETE: '/users/:id',
            GET_CURRENT: '/users/me'
        },
        
        // Dashboard
        DASHBOARD: {
            SUMMARY: '/dashboard/summary',
            TODAY_APPOINTMENTS: '/dashboard/today-appointments',
            RECENT_PATIENTS: '/dashboard/recent-patients',
            QUICK_STATS: '/dashboard/quick-stats'
        },
        
        // Reports
        REPORTS: {
            PATIENT_STATISTICS: '/reports/patient-statistics',
            APPOINTMENT_STATISTICS: '/reports/appointment-statistics',
            DOCTOR_PERFORMANCE: '/reports/doctor-performance',
            REVENUE_REPORT: '/reports/revenue'
        }
    },
    
    // HTTP Methods
    METHODS: {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        PATCH: 'PATCH',
        DELETE: 'DELETE'
    },
    
    // Response Status Codes
    STATUS: {
        SUCCESS: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        SERVER_ERROR: 500
    }
};

// Helper function to build full endpoint URL
function buildEndpointUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, buildEndpointUrl };
}
