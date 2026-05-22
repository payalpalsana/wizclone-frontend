import { NavLink, Outlet } from 'react-router-dom'
import {
  IconSettings,
  IconList,
  IconWand,
  IconLayoutList,
  IconHelpCircle,
} from '@tabler/icons-react'
import Sidebar from './Sidebar'
import { useWindowWidth } from '../hooks/useWindowWidth'

const BOTTOM_NAV = [
  { to: '/settings', icon: IconSettings, label: 'Settings' },
  { to: '/templates', icon: IconLayoutList, label: 'Templates' },
  { to: '/activity', icon: IconList, label: 'Log' },
  { to: '/builder', icon: IconWand, label: 'Builder' },
  { to: '/help', icon: IconHelpCircle, label: 'Help' },
]

export default function AppLayout({ isActive, plan }) {
  const width = useWindowWidth()
  const mobileNav = width > 0 && width < 400

  return (
    <div
      className="flex h-full"
      style={{
        backgroundColor: 'var(--bg-primary)',
        flexDirection: 'row',
        paddingBottom: mobileNav ? 56 : 0,
      }}
    >
      <Sidebar isActive={isActive} plan={plan} />

      <main
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-primary)', minWidth: 0 }}
      >
        <Outlet />
      </main>

      {/* Mobile bottom navigation — only < 400px */}
      {mobileNav && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            backgroundColor: 'var(--bg-primary)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'stretch',
            zIndex: 50,
          }}
        >
          {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive: active }) => ({
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: 10,
                fontWeight: active ? 500 : 400,
                transition: 'color 120ms',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
