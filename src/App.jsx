import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Onboard from './screens/Onboard'
import Settings from './screens/Settings'
import ActivityLog from './screens/ActivityLog'
import Templates from './screens/Templates'
import TemplateBuilder from './screens/TemplateBuilder'
import Help from './screens/Help'
import UpgradeModal from './components/UpgradeModal'

export default function App() {
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  return (
    <>
      <Routes>
        <Route path="/onboard" element={<Onboard />} />
        <Route element={<AppLayout isActive={true} plan="Free" />}>
          <Route path="/settings" element={<Settings onUpgrade={() => setUpgradeOpen(true)} />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/builder" element={<TemplateBuilder />} />
          <Route path="/help" element={<Help />} />
        </Route>
        <Route path="*" element={<Navigate to="/settings" replace />} />
      </Routes>
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  )
}
