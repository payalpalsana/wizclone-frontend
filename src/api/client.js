import axios from "axios";
import { getSessionToken } from "../lib/monday";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  try {
    const token = await getSessionToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("[API Client] Could not get session token:", err);
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

export const authApi = {
  verify: (payload) => client.post("/auth/verify", payload),
};

export const settingsApi = {
  get: (workspaceId) => client.post(`/settings/load`, { workspaceId }),
  save: (workspaceId, data) => client.post(`/settings/save`, { workspaceId, ...data }),
};

export const activityApi = {
  list: (workspaceId, params) => client.get(`/activity-log/${workspaceId}`, { params }),
};

export const templateApi = {
  list:   (workspaceId)                    => client.get(`/templates/${workspaceId}`),
  create: (workspaceId, data)              => client.post(`/templates/${workspaceId}`, data),
  update: (workspaceId, templateId, data)  => client.put(`/templates/${workspaceId}/${templateId}`, data),
  remove: (workspaceId, templateId)        => client.delete(`/templates/${workspaceId}/${templateId}`),
};

export const plansApi = {
  current: () => client.get("/plans/current"),
};

export default client;
