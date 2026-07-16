import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Onboard from "./pages/Onboard";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import Templates from "./pages/Templates";
import TemplateBuilder from "./pages/TemplateBuilder";
import Help from "./pages/Help";
import AuthSuccess from "./pages/AuthSuccess";
import UpgradeModal from "./components/UpgradeModal";
import { useWorkspace } from "./context/WorkspaceContext";
import { IconLoader2, IconAlertTriangle, IconLock } from "@tabler/icons-react";

function AppLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <IconLoader2
        size={22}
        className="animate-spin"
        style={{ color: "var(--text-muted)" }}
      />
    </div>
  );
}

function AppError({ title, message, hideRefresh }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 16,
        padding: 24,
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <IconAlertTriangle size={32} style={{ color: "#e8a020" }} />
      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        {title || "Connection Failed"}
      </p>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          textAlign: "center",
          maxWidth: 360,
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {message || "Could not connect to WizClone. Please refresh the page."}
      </p>
      {!hideRefresh && (
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 4,
            height: 36,
            paddingInline: 20,
            borderRadius: 8,
            border: "1px solid var(--border)",
            backgroundColor: "transparent",
            color: "var(--text-primary)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Refresh
        </button>
      )}
    </div>
  );
}

function ViewerBlocker() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: 380,
          animation: "fadeIn 0.4s ease-out",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "rgba(107, 114, 128, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            border: "1px solid rgba(107, 114, 128, 0.1)",
          }}
        >
          <IconLock size={32} style={{ color: "var(--text-secondary)" }} />
        </div>
        
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: "0 0 12px 0",
            letterSpacing: "-0.01em",
          }}
        >
          View-Only Access
        </h1>
        
        <p
          style={{
            fontSize: 15,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          As a viewer, you are unable to use WizClone
        </p>
      </div>
    </div>
  );
}

function RequireOAuth({ children }) {
  const { hasOAuth } = useWorkspace();
  if (hasOAuth === false) return <Navigate to="/onboard" replace />;
  return children;
}

export default function App() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { loading, hasOAuth, error, isViewOnly } = useWorkspace();

  if (loading) return <AppLoader />;

  if (isViewOnly) return <ViewerBlocker />;

  if (error && hasOAuth === null) return <AppError message={error} />;

  return (
    <>
      <Routes>
        <Route path="/onboard" element={<Onboard />} />
        <Route path="/auth-success" element={<AuthSuccess />} />

        <Route
          element={
            <RequireOAuth>
              <AppLayout isActive={true} plan="Free" />
            </RequireOAuth>
          }
        >
          <Route
            path="/settings"
            element={<Settings onUpgrade={() => setUpgradeOpen(true)} />}
          />
          <Route path="/templates" element={<Templates />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/builder" element={<TemplateBuilder />} />
          <Route path="/help" element={<Help />} />
        </Route>

        <Route
          path="*"
          element={
            <Navigate to={hasOAuth ? "/settings" : "/onboard"} replace />
          }
        />
      </Routes>

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
      />
    </>
  );
}
