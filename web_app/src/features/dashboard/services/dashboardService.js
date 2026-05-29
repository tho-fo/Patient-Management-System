import { httpClient } from "../../../core/api/httpClient.js";

export const dashboardService = {
  getSummary() {
    return httpClient.get("/dashboard/summary");
  },

  getAppointmentTrends() {
    return httpClient.get("/dashboard/appointment-trends");
  },

  getStaffDistribution() {
    return httpClient.get("/dashboard/staff-distribution");
  },

  getPatientGrowth() {
    return httpClient.get("/dashboard/patient-growth");
  },

  getAuditLogs(limit = 10) {
    return httpClient.get(`/dashboard/audit-logs?limit=${limit}`);
  },

  getTodayAppointments() {
    return httpClient.get("/dashboard/today-appointments");
  },

  getPendingAppointments() {
    return httpClient.get("/dashboard/pending-appointments");
  }
};
