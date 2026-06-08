import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IconLock, IconLoader2 } from "@tabler/icons-react";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { WizLogo } from "../utils/icon";
import { useWorkspace } from "../context/WorkspaceContext";
import monday from "../lib/monday";

function buildOAuthUrl() {
  // VITE_API_BASE_URL may or may not end in /api — use VITE_BACKEND_URL for the
  // raw origin so the callback path is always exactly /api/auth/callback.
  const backendOrigin =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "");
  const redirectUri = `${backendOrigin}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_CLIENT_ID,
    redirect_uri: redirectUri,
    scope:
      "me:read boards:read boards:write workspaces:read users:read account:read webhooks:write webhooks:read",
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

    let attempts = 0;
    const MAX = 24;
    const DELAY = 2500;

    const timer = setInterval(async () => {
      attempts++;
      try {
        const connected = await refreshAuth();
        if (connected) {
          setStatus("success");
          clearInterval(timer);
          navigate("/settings", { replace: true });
        }
      } catch {
        // keep polling
      }
      if (attempts >= MAX) {
        clearInterval(timer);
        setStatus("error");
      }
    }, DELAY);

    return () => clearInterval(timer);
  }, [status, refreshAuth, navigate]);

  const handleConnect = async () => {
    setStatus("loading");

    const oauthUrl = buildOAuthUrl();
    console.log("[Onboard] AUTH URL:", oauthUrl);

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
              color: "#fff",
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
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 12,
              }}
            >
              A monday.com authorization window has opened. Approve it to
              continue.
            </p>
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
