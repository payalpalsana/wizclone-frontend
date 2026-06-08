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
// Session cache keys
// ─────────────────────────────────────────────────────────────
const CACHE_DONE_KEY = "wc_auth_init_done";
const CACHE_RESULT_KEY = "wc_auth_init_result";

export function clearAuthCache() {
  sessionStorage.removeItem(CACHE_DONE_KEY);
  sessionStorage.removeItem(CACHE_RESULT_KEY);
}

function getCachedAuth() {
  if (sessionStorage.getItem(CACHE_DONE_KEY) !== "1") return null;
  return sessionStorage.getItem(CACHE_RESULT_KEY) === "true";
}

function setCachedAuth(value) {
  sessionStorage.setItem(CACHE_DONE_KEY, "1");
  sessionStorage.setItem(CACHE_RESULT_KEY, String(value));
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
        accountId: data.account?.id,
        userId: data.user?.id,
        workspaceId: data.workspaceId,
      });

      const oauthConnected = result?.has_oauth ?? result?.hasOAuth ?? false;
      setCachedAuth(oauthConnected);
      setHasOAuth(oauthConnected);
      return oauthConnected;
    } catch (err) {
      console.error("[WorkspaceProvider] refreshAuth error:", err);
      setError(err.message ?? "Auth refresh failed");
      setHasOAuth(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bootstrap on mount
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        // 1. Get monday context
        const ctx = await getContext();
        if (cancelled) return;

        const data = ctx?.data ?? {};
        setWorkspaceId(data.workspaceId ?? null);
        setAccountId(data.account?.id ?? null);
        setUserId(data.user?.id ?? null);

        // 2. Use session cache if available
        const cached = getCachedAuth();
        if (cached !== null) {
          setHasOAuth(cached);
          return;
        }

        // 3. Get session token (non-fatal if missing)
        let sessionToken = "";
        try {
          sessionToken = (await getSessionToken()) ?? "";
          console.log("[WorkspaceProvider] session token:", sessionToken);
        } catch (err) {
          console.warn("[WorkspaceProvider] Could not get session token:", err);
        }

        if (cancelled) return;

        // 4. Verify with backend
        const result = await authApi.verify({
          sessionToken,
          accountId: data.account?.id,
          userId: data.user?.id,
          workspaceId: data.workspaceId,
        });

        if (cancelled) return;

        const oauthConnected = result?.has_oauth ?? result?.hasOAuth ?? false;
        setCachedAuth(oauthConnected);
        setHasOAuth(oauthConnected);

        console.log("[WorkspaceProvider] has_oauth:", oauthConnected);
      } catch (err) {
        if (!cancelled) {
          console.error("[WorkspaceProvider] bootstrap error:", err);
          setError(err.message ?? "Bootstrap failed");
          setHasOAuth(false);
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
