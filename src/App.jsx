import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Onboard from "./pages/Onboard";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import Templates from "./pages/Templates";
import TemplateBuilder from "./pages/TemplateBuilder";
import Help from "./pages/Help";
import UpgradeModal from "./components/UpgradeModal";
import { useWorkspace } from "./context/WorkspaceContext";
import { IconLoader2 } from "@tabler/icons-react";

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

export default function App() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { loading, hasOAuth } = useWorkspace();

  if (loading) return <AppLoader />;

  return (
    <>
      <Routes>
        <Route path="/onboard" element={<Onboard />} />
        <Route element={<AppLayout isActive={true} plan="Free" />}>
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
