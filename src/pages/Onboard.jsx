import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IconLock, IconLoader2 } from '@tabler/icons-react'
import { useWindowWidth } from '../hooks/useWindowWidth'

function WizLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#6C47FF" />
      <path
        d="M10 13L16 27L20 19L24 27L30 13"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Onboard() {
  const [status, setStatus] = useState('idle')
  const navigate = useNavigate()
  const width = useWindowWidth()
  const isMobile = width > 0 && width < 480

  const handleConnect = async () => {
    setStatus('loading')
    try {
      // In production: trigger monday.com OAuth flow
      await new Promise((r) => setTimeout(r, 1500))
      navigate('/settings')
    } catch {
      setStatus('error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)', padding: isMobile ? '24px 20px' : '40px 24px' }}
    >
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <WizLogo />
          </div>

          <h1
            className="mb-3"
            style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 12px' }}
          >
            Connect your monday.com account
          </h1>

          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 340,
              margin: '0 0 32px',
            }}
          >
            WizClone automatically copies subitems from your templates when a new item is created.
            Connect once and it runs silently in the background.
          </p>

          <button
            onClick={handleConnect}
            disabled={status === 'loading'}
            style={{
              width: '100%',
              height: 40,
              borderRadius: 8,
              backgroundColor: status === 'loading' ? 'var(--accent)' : 'var(--accent)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              opacity: status === 'loading' ? 0.8 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 12,
              fontFamily: 'inherit',
              transition: 'background-color 120ms, opacity 120ms',
            }}
            onMouseEnter={(e) => { if (status !== 'loading') e.currentTarget.style.backgroundColor = 'var(--accent-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)' }}
          >
            {status === 'loading' && <IconLoader2 size={16} className="animate-spin" />}
            {status === 'loading' ? 'Connecting...' : 'Connect with monday.com'}
          </button>

          {status === 'error' && (
            <p
              className="text-sm mb-3"
              style={{ color: 'var(--danger)' }}
            >
              Connection failed. Please try again.
            </p>
          )}

          <div className="flex items-center gap-1.5">
            <IconLock size={12} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Your data stays within your monday.com workspace.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
