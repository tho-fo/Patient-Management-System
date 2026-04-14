import { httpClient } from "../../../core/api/httpClient.js";

export const medicalRecordService = {
  list(filters = {}) {
    return httpClient.get("/medical-records", filters);
  },

  create(payload) {
    return httpClient.post("/medical-records", payload);
  },

  update(id, payload) {
    return httpClient.put(`/medical-records/${id}`, payload);
  }
};
