import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Onboard from "./pages/Onboard";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import Templates from "./pages/Templates";
import TemplateBuilder from "./pages/TemplateBuilder";
import Help from "./pages/Help";
import UpgradeModal from "./components/UpgradeModal";
import { getSessionToken } from "./lib/monday";

export default function App() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    getSessionToken()
  }, [])

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
        <Route path="*" element={<Navigate to="/settings" replace />} />
      </Routes>
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
      />
    </>
  );
}
