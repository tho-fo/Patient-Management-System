import { httpClient } from "../../../core/api/httpClient.js";

export const appointmentService = {
  list(filters = {}) {
    return httpClient.get("/appointments", filters);
  },

  create(payload) {
    return httpClient.post("/appointments", payload);
  },

  update(id, payload) {
    return httpClient.put(`/appointments/${id}`, payload);
  }
};
