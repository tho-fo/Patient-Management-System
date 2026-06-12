import { httpClient } from "../../../core/api/httpClient.js";

export const settingsService = {
  getProfile(params) {
    return httpClient.get("/settings/profile", params);
  },

  updateProfile(payload) {
    return httpClient.put("/settings/profile", payload);
  },

  changePassword(payload) {
    return httpClient.put("/settings/password", payload);
  }
};
