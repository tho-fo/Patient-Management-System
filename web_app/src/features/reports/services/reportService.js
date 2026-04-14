import { httpClient } from "../../../core/api/httpClient.js";

export const reportService = {
  getAnalytics(filters = {}) {
    return httpClient.get("/reports/analytics", filters);
  }
};
