import { appConfig } from "../../config/appConfig.js";
import { mockApi } from "./mockApi.js";

function buildUrl(path, params) {
  const search = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

async function performRequest(method, path, { data, params } = {}) {
  const url = buildUrl(path, params);

  if (appConfig.useMockApi) {
    try {
      return await mockApi.request(method, url, data);
    } catch (error) {
      throw new Error(error.message || "Request failed.");
    }
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: data ? JSON.stringify(data) : undefined
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

export const httpClient = {
  get(path, params) {
    return performRequest("GET", path, { params });
  },

  post(path, data) {
    return performRequest("POST", path, { data });
  },

  put(path, data) {
    return performRequest("PUT", path, { data });
  },

  delete(path) {
    return performRequest("DELETE", path);
  }
};
