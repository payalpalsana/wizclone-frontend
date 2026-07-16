import axios from "axios";
import { getSessionToken } from "../lib/monday";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});

// monday.com session tokens are JWTs valid for 24 hours and are re-generated
// only on a full app reload (hard refresh clears JS module state anyway).
// We cache for the tab lifetime - no TTL needed. This prevents stalling every
// API call on the SDK iframe handshake, which on hard refresh can take 2-5s.
let _cachedToken = null;
let _tokenPromise = null;

function getTokenWithTimeout(ms = 5000) {
  return Promise.race([
    getSessionToken(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("sessionToken timeout")), ms)
    ),
  ]);
}

async function getCachedToken() {
  if (_cachedToken) return _cachedToken;
  // Deduplicate concurrent requests (multiple API calls fired on mount)
  if (!_tokenPromise) {
    _tokenPromise = getTokenWithTimeout()
      .then((t) => { _cachedToken = t; return t; })
      .catch(() => null)
      .finally(() => { _tokenPromise = null; });
  }
  return _tokenPromise;
}

export function clearTokenCache() {
  _cachedToken = null;
}

client.interceptors.request.use(async (config) => {
  try {
    const token = await getCachedToken();
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
  } catch {
    // non-fatal - request proceeds without auth header
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
  get:         (workspaceId)           => client.post(`/settings/load`, { workspaceId }),
  save:        (workspaceId, data)     => client.post(`/settings/save`, { workspaceId, ...data }),
  deleteBoard: (workspaceId, boardId)  => client.delete(`/settings/${workspaceId}/boards/${boardId}`),
};

export const activityApi = {
  list: (workspaceId, params) => client.get(`/activity-log/${workspaceId}`, { params }),
};

export const templateApi = {
  list:     (workspaceId, params)            => client.get(`/templates/${workspaceId}`, { params }),
  create:   (workspaceId, data)             => client.post(`/templates/${workspaceId}`, data),
  update:   (workspaceId, templateId, data) => client.put(`/templates/${workspaceId}/${templateId}`, data),
  remove:   (workspaceId, templateId)       => client.delete(`/templates/${workspaceId}/${templateId}`),
  generate: (workspaceId, prompt)           => client.post(`/generate_template/${workspaceId}`, { prompt }),
};

export const plansApi = {
  current: () => client.get("/plans/current"),
};

export default client;
