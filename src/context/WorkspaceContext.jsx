import { createContext, useContext, useEffect, useState } from "react";
import { getContext, getSessionToken } from "../lib/monday";
import { verifyApi } from "../api/client";

const WorkspaceContext = createContext(null);

const INIT_DONE_KEY = "wc_auth_init_done";
const INIT_RESULT_KEY = "wc_auth_init_result";

export function WorkspaceProvider({ children }) {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [hasOAuth, setHasOAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const ctx = await getContext();
        if (cancelled) return;

        const data = ctx?.data ?? {};
        setWorkspaceId(data.workspaceId);

        const alreadyDone = sessionStorage.getItem(INIT_DONE_KEY) === "1";
        if (alreadyDone) {
          const cached = sessionStorage.getItem(INIT_RESULT_KEY);
          setHasOAuth(cached === "true");
          return;
        }

        let sessionToken = "";
        try {
          const token = await getSessionToken();
          sessionToken = token ?? "";
        } catch (err) {
          console.warn("[WorkspaceProvider] Could not get session token:", err);
        }

        if (cancelled) return;

        const result = await verifyApi.init({
          sessionToken,
          accountId: data.account?.id,
          userId: data.user?.id,
          workspaceId: data.workspaceId,
        });

        if (cancelled) return;

        const oauthConnected = result?.has_oauth ?? result?.hasOAuth ?? false;

        sessionStorage.setItem(INIT_DONE_KEY, "1");
        sessionStorage.setItem(INIT_RESULT_KEY, String(oauthConnected));

        setHasOAuth(oauthConnected);
        console.log(
          "[WorkspaceProvider] /auth/verify → has_oauth:",
          oauthConnected,
        );
      } catch (err) {
        if (!cancelled) {
          console.error("[WorkspaceProvider] bootstrap error:", err);
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
    <WorkspaceContext.Provider value={{ workspaceId, hasOAuth, loading }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
