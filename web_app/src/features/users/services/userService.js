import { httpClient } from "../../../core/api/httpClient.js";

export const userService = {
  list(filters = {}) {
    return httpClient.get("/staff", filters);
  },

  getByKey(staffKey) {
    return httpClient.get(`/staff/${staffKey}`);
  },

  create(payload) {
    return httpClient.post("/staff", payload);
  },

  update(staffKey, payload) {
    return httpClient.put(`/staff/${staffKey}`, payload);
  },

  remove(staffKey) {
    return httpClient.delete(`/staff/${staffKey}`);
  }
};
