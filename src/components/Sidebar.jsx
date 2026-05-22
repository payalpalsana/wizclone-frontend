import { NavLink } from 'react-router-dom'
import {
  IconSettings,
  IconList,
  IconWand,
  IconHelpCircle,
  IconPointFilled,
  IconLayoutList,
} from '@tabler/icons-react'
import { useWindowWidth } from '../hooks/useWindowWidth'

const NAV_ITEMS = [
  { to: '/settings', icon: IconSettings, label: 'Settings' },
  { to: '/templates', icon: IconLayoutList, label: 'Templates' },
  { to: '/activity', icon: IconList, label: 'Activity Log' },
  { to: '/builder', icon: IconWand, label: 'Template Builder' },
  { to: '/help', icon: IconHelpCircle, label: 'Help' },
]

export default function Sidebar({ isActive = true, plan = 'Free' }) {
  const width = useWindowWidth()
  const collapsed = width > 0 && width < 600
  const hidden = width > 0 && width < 400

  if (hidden) return null

  return (
    <aside
      className="flex flex-col flex-shrink-0 h-full"
      style={{
        width: collapsed ? 52 : 200,
        borderRight: '1px solid var(--border)',
        backgroundColor: 'var(--bg-primary)',
        transition: 'width 200ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center py-4"
        style={{
          borderBottom: '1px solid var(--border)',
          padding: collapsed ? '14px 12px' : '14px 16px',
          gap: collapsed ? 0 : 8,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <WizLogo />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="block font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              WizClone
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: isActive ? 'var(--success)' : 'var(--text-muted)' }}>
              <IconPointFilled size={8} />
              {isActive ? 'Active' : 'Paused'}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            style={({ isActive: active }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 10,
              padding: collapsed ? '10px 0' : '9px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              backgroundColor: active ? 'var(--accent-light)' : 'transparent',
              fontWeight: active ? 500 : 400,
              fontSize: 14,
              textDecoration: 'none',
              transition: 'color 120ms, background-color 120ms',
            })}
          >
            <Icon size={17} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Plan badge */}
      {!collapsed && (
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-medium px-2 py-1 rounded"
              style={{
                backgroundColor: plan === 'Free' ? 'var(--bg-secondary)' : 'var(--accent-light)',
                color: plan === 'Free' ? 'var(--text-secondary)' : 'var(--accent)',
              }}
            >
              {plan}
            </span>
            {plan === 'Free' && (
              <a href="#" className="text-xs font-medium" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Upgrade
              </a>
            )}
          </div>
        </div>
      )}

      {/* Collapsed — dot indicator only */}
      {collapsed && (
        <div className="flex justify-center py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <span
            title={`Plan: ${plan}`}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: plan === 'Free' ? 'var(--text-muted)' : 'var(--accent)',
            }}
          />
        </div>
      )}
    </aside>
  )
}

function WizLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="28" height="28" rx="7" fill="#6C47FF" />
      <path d="M7 9L11 19L14 13L17 19L21 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
