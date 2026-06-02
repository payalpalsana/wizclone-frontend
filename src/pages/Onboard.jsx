import { useState } from "react";
import { motion } from "framer-motion";
import { IconLock, IconLoader2 } from "@tabler/icons-react";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { WizLogo } from "../utils/icon";
import { authApi } from "../api/client";

export default function Onboard() {
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const width = useWindowWidth();
  const isMobile = width > 0 && width < 480;

  const handleConnect = () => {
    authApi
      .connect()
      .then((res) => {
        console.log("res: ", res);
        if (res?.authorization_url) {
          window.location.href = res.authorization_url;
        } else {
          throw new Error("Invalid response from server");
        }
      })
      .catch((err) => {
        console.error("Connection error:", err);
        setStatus("error");
      });
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
            disabled={status === "loading"}
            style={{
              width: "100%",
              height: 40,
              borderRadius: 8,
              backgroundColor: "var(--accent)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: status === "loading" ? "not-allowed" : "pointer",
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
              if (status !== "loading")
                e.currentTarget.style.backgroundColor = "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
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

          {status === "error" && (
            <p className="text-sm mb-3" style={{ color: "var(--danger)" }}>
              Connection failed. Please try again.
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
