import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getContext, getSessionToken } from "../lib/monday";
import { authApi } from "../api/client";

// ─────────────────────────────────────────────────────────────
// Auth cache — localStorage so it persists across tabs and
// browser restarts. Cache is only trusted for 30 minutes to
// avoid serving stale state after a revoke/uninstall.
// ─────────────────────────────────────────────────────────────
const CACHE_KEY   = "wc_auth_v2";
const CACHE_TTL   = 30 * 60 * 1000; // 30 minutes

export function clearAuthCache() {
  localStorage.removeItem(CACHE_KEY);
}

function getCachedAuth() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
    return value; // boolean
  } catch {
    return null;
  }
}

function setCachedAuth(value) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ value, ts: Date.now() }));
  } catch { /* storage quota — ignore */ }
}

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [hasOAuth, setHasOAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Called after OAuth completes on the Onboard page
  // so the app re-checks without a full page reload
  const refreshAuth = useCallback(async () => {
    clearAuthCache();
    setLoading(true);
    setError(null);

    try {
      const ctx = await getContext();
      const data = ctx?.data ?? {};

      let sessionToken = "";
      try {
        sessionToken = (await getSessionToken()) ?? "";
        console.log("[WorkspaceProvider] session token:", sessionToken);
      } catch {
        // non-fatal
      }

      const result = await authApi.verify({
        sessionToken,
        accountId:   data.account?.id,
        userId:      data.user?.id,
        workspaceId: data.workspaceId,
      });

      const oauthConnected = result?.has_oauth ?? false;
      setCachedAuth(oauthConnected);
      setHasOAuth(oauthConnected);
      return oauthConnected;
    } catch (err) {
      console.error("[WorkspaceProvider] refreshAuth error:", err);
      setError(err.message ?? "Auth refresh failed");
      // Don't flip hasOAuth on transient errors — caller decides what to do
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const ctx = await getContext();
        if (cancelled) return;

        const data = ctx?.data ?? {};
        setWorkspaceId(data.workspaceId ?? null);
        setAccountId(data.account?.id ?? null);
        setUserId(data.user?.id ?? null);

        const cached = getCachedAuth();
        if (cached !== null) {
          setHasOAuth(cached);
          return;
        }

        let sessionToken = "";
        try {
          sessionToken = (await getSessionToken()) ?? "";
          console.log("[WorkspaceProvider] session token:", sessionToken);
        } catch (err) {
          console.warn("[WorkspaceProvider] Could not get session token:", err);
        }

        if (cancelled) return;

        const result = await authApi.verify({
          sessionToken,
          accountId:   data.account?.id,
          userId:      data.user?.id,
          workspaceId: data.workspaceId,
        });

        if (cancelled) return;

        const oauthConnected = result?.has_oauth ?? false;
        setCachedAuth(oauthConnected);
        setHasOAuth(oauthConnected);

        console.log("[WorkspaceProvider] has_oauth:", oauthConnected);
      } catch (err) {
        if (!cancelled) {
          console.error("[WorkspaceProvider] bootstrap error:", err);
          const isAuthError = err?.message?.includes("401") || err?.message?.includes("Cannot identify");
          if (isAuthError) {
            clearAuthCache();
            setHasOAuth(false);
          } else {
            const isTimeout = err?.message?.toLowerCase().includes("timeout");
            const isNetworkDown = err?.message?.includes("Network Error") || err?.message?.includes("ERR_NAME_NOT_RESOLVED");
            let friendlyMessage;
            if (isTimeout) {
              friendlyMessage = "The server is not responding (timeout). Please check if the backend server is running and try again.";
            } else if (isNetworkDown) {
              friendlyMessage = "Cannot reach the server. The backend may be offline or the tunnel URL may have changed.";
            } else {
              friendlyMessage = `Server error: ${err.message ?? "Unknown error"}. Please refresh or contact support.`;
            }
            setError(friendlyMessage);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaceId,
        accountId,
        userId,
        hasOAuth,
        loading,
        error,
        refreshAuth,
        clearAuthCache,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
