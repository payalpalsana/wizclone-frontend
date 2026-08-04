import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IconLock, IconLoader2 } from "@tabler/icons-react";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { WizLogo } from "../utils/icon";
import { useWorkspace } from "../context/WorkspaceContext";
import monday from "../lib/monday";

function buildOAuthUrl() {
  // VITE_API_BASE_URL may or may not end in /api - use VITE_BACKEND_URL for the
  // raw origin so the callback path is always exactly /api/auth/callback.
  const backendOrigin =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "");
  const redirectUri = `${backendOrigin}/api/auth/callback`;

  // The frontend success page - backend should redirect here after token exchange.
  // We encode it in the `state` param so the backend knows where to send the user.
  // Your backend's /api/auth/callback handler should:
  //   1. Exchange the code for a token
  //   2. Store the token in the database
  //   3. Redirect to: JSON.parse(decodeURIComponent(state)).successUrl
  const frontendOrigin =
    import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  const state = encodeURIComponent(
    JSON.stringify({ successUrl: `${frontendOrigin}/auth-success` })
  );

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "me:read boards:read boards:write workspaces:read account:read webhooks:write",
    state,
  });

  return `https://auth.monday.com/oauth2/authorize?${params.toString()}`;
}

export default function Onboard() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const { refreshAuth } = useWorkspace();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width > 0 && width < 480;

  useEffect(() => {
    if (status !== "loading") return;

    let pollTimer = null;
    let attempts = 0;
    const MAX = 120; // 5-minute polling fallback
    const DELAY = 2500;
    let isChecking = false; // guard against concurrent calls

    const handleAuthComplete = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        const connected = await refreshAuth(true);
        if (connected) {
          setStatus("success");
          navigate("/settings", { replace: true });
        }
      } catch {
        // ignore
      } finally {
        isChecking = false;
      }
    };

    // SIGNAL 1: BroadcastChannel - fires instantly when /auth-success page loads.
    // Requires backend to redirect to `<frontend>/auth-success` after token exchange.
    let channel = null;
    try {
      channel = new BroadcastChannel("wc_oauth");
      channel.onmessage = (event) => {
        if (event.data?.type === "oauth_complete") {
          handleAuthComplete();
        }
      };
    } catch {
      // BroadcastChannel not supported - rely on other signals
    }

    // SIGNAL 2: monday.com context listener - fires when the monday.com SDK
    // sends a fresh context to the iframe. This happens when the user returns
    // to the monday.com tab after completing OAuth in a separate tab.
    // This is the official monday.com SDK mechanism for cross-tab signalling.
    let contextUnsub = null;
    try {
      contextUnsub = monday.listen("context", () => {
        handleAuthComplete();
      });
    } catch {
      // SDK not ready - ignore
    }

    // SIGNAL 3: Polling fallback - slow backup for edge cases
    pollTimer = setInterval(async () => {
      attempts++;
      await handleAuthComplete();
      if (attempts >= MAX) {
        clearInterval(pollTimer);
        setStatus("error");
      }
    }, DELAY);

    return () => {
      channel?.close();
      if (typeof contextUnsub === "function") contextUnsub();
      clearInterval(pollTimer);
    };
  }, [status, refreshAuth, navigate]);


  const forceCheck = () => {
    if (status === "loading") {
      refreshAuth(true).then(connected => {
        if (connected) {
          setStatus("success");
          navigate("/settings", { replace: true });
        }
      });
    }
  };

  const handleConnect = async () => {
    setStatus("loading");

    const oauthUrl = buildOAuthUrl();

    try {
      await monday.execute("openLinkInTab", { url: oauthUrl });
    } catch {
      window.location.href = oauthUrl;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundColor: "var(--bg-primary)",
        padding: isMobile ? "24px 20px" : "40px 24px",
      }}
    >
      <div style={{ maxWidth: 420, width: "100%" }}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <WizLogo />
          </div>

          <h1
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: "0 0 12px",
            }}
          >
            Connect your monday.com account
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: 340,
              margin: "0 0 32px",
            }}
          >
            WizClone automatically copies subitems from your templates when a
            new item is created. Connect once and it runs silently in the
            background.
          </p>

          <button
            onClick={handleConnect}
            disabled={status === "loading" || status === "success"}
            style={{
              width: "100%",
              height: 40,
              borderRadius: 8,
              backgroundColor:
                status === "success"
                  ? "var(--success, #22c55e)"
                  : "var(--accent)",
              color: status === "success" ? "#fff" : "var(--text-color)",
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor:
                status === "loading" || status === "success"
                  ? "not-allowed"
                  : "pointer",
              opacity: status === "loading" ? 0.8 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 12,
              fontFamily: "inherit",
              transition: "background-color 120ms, opacity 120ms",
            }}
            onMouseEnter={(e) => {
              if (status === "idle")
                e.currentTarget.style.backgroundColor = "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (status === "idle")
                e.currentTarget.style.backgroundColor = "var(--accent)";
            }}
          >
            {status === "loading" && (
              <IconLoader2 size={16} className="animate-spin" />
            )}
            {status === "loading"
              ? "Redirecting..."
              : "Connect with monday.com"}
          </button>

          {/* Loading hint */}
          {status === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                A monday.com authorization window has opened. Approve it to continue.
              </p>
              <button
                onClick={forceCheck}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                I have approved it
              </button>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <p
              style={{
                fontSize: 13,
                color: "var(--danger)",
                marginBottom: 12,
              }}
            >
              Authorization timed out or failed.{" "}
              <button
                onClick={() => setStatus("idle")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent)",
                  cursor: "pointer",
                  fontSize: 13,
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                Try again
              </button>
            </p>
          )}

          <div className="flex items-center gap-1.5">
            <IconLock size={12} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Your data stays within your monday.com workspace.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
