import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getContext, getSessionToken } from "../lib/monday";
import { authApi } from "../api/client";

const WorkspaceContext = createContext(null);

function decodeSessionToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {};
  }
}

export function WorkspaceProvider({ children }) {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [hasOAuth, setHasOAuth] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Called after OAuth completes on the Onboard page
  // so the app re-checks without a full page reload
  const refreshAuth = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const ctx = await getContext();
      const data = ctx?.data ?? {};

      let sessionToken = "";
      try {
        sessionToken = (await getSessionToken()) ?? "";
        const payload = decodeSessionToken(sessionToken);
        if (payload?.isViewOnly || payload?.dat?.isViewOnly || payload?.is_view_only || payload?.dat?.is_view_only) setIsViewOnly(true);
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
      setHasOAuth(oauthConnected);
      return oauthConnected;
    } catch (err) {
      if (!silent) setError(err.message ?? "Auth refresh failed");
      // Don't flip hasOAuth on transient errors - caller decides what to do
      return false;
    } finally {
      if (!silent) setLoading(false);
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

        let sessionToken = "";
        try {
          sessionToken = (await getSessionToken()) ?? "";
          const payload = decodeSessionToken(sessionToken);
          if (payload?.isViewOnly || payload?.dat?.isViewOnly || payload?.is_view_only || payload?.dat?.is_view_only) setIsViewOnly(true);
        } catch {
          // non-fatal
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
        setHasOAuth(oauthConnected);
      } catch (err) {
        if (!cancelled) {
          const isAuthError = err?.message?.includes("401") || err?.message?.includes("Cannot identify");
          if (isAuthError) {
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
        isViewOnly,
        loading,
        error,
        refreshAuth,
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
