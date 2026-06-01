import axios from "axios";
import { getSessionToken } from "../lib/monday";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  try {
    const tokenRes = await getSessionToken();
    if (tokenRes?.data) {
      config.headers["Authorization"] = `Bearer ${tokenRes.data}`;
    }
  } catch (_) {
    // proceed without token in dev
  }
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message || err.message || "Request failed";
    return Promise.reject(new Error(message));
  },
);

export const settingsApi = {
  get: (workspaceId) => client.get(`/settings/${workspaceId}`),
  save: (workspaceId, data) => client.post(`/settings/${workspaceId}`, data),
};

export const activityApi = {
  list: (params) => client.get("/activity", { params }),
};

export const templateApi = {
  generate: (prompt) => client.post("/templates/generate", { prompt }),
  create: (data) => client.post("/templates", data),
};

export const plansApi = {
  current: () => client.get("/plans/current"),
};

export default client;
