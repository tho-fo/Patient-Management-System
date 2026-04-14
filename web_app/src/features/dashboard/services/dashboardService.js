import { httpClient } from "../../../core/api/httpClient.js";

export const dashboardService = {
  getSummary() {
    return httpClient.get("/dashboard/summary");
  }
};
