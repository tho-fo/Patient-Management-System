import { httpClient } from "../../../core/api/httpClient.js";

export const patientService = {
  list(filters = {}) {
    return httpClient.get("/patients", filters);
  },

  getById(id) {
    return httpClient.get(`/patients/${id}`);
  },

  create(payload) {
    return httpClient.post("/patients", payload);
  },

  update(id, payload) {
    return httpClient.put(`/patients/${id}`, payload);
  },

  remove(id) {
    return httpClient.delete(`/patients/${id}`);
  }
};
