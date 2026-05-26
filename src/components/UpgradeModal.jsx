import { motion, AnimatePresence } from 'framer-motion'
import { IconX, IconAlertTriangle } from '@tabler/icons-react'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    automations: 50,
    templates: 3,
    ai: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$12',
    period: '/mo',
    automations: 500,
    templates: 'Unlimited',
    ai: true,
    recommended: true,
  },
  {
    key: 'business',
    name: 'Business',
    price: '$29',
    period: '/mo',
    automations: 'Unlimited',
    templates: 'Unlimited',
    ai: true,
  },
]

export default function UpgradeModal({ isOpen, onClose, currentPlan = 'free', used = 47, limit = 50 }) {
  const pct = Math.min((used / limit) * 100, 100)
  const isNearLimit = pct >= 90

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 100,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 101,
              width: '90%',
              maxWidth: 480,
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              padding: 24,
            }}
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <IconX size={14} />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <div
                className="inline-flex items-center justify-center mb-3"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'var(--warning-light)',
                }}
              >
                <IconAlertTriangle size={22} style={{ color: 'var(--warning)' }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 16px' }}>
                You've reached your plan limit
              </h2>

              {/* Usage bar */}
              <div className="text-left">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {used} / {limit} automations used this month
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: isNearLimit ? 'var(--danger)' : 'var(--text-secondary)' }}
                  >
                    {Math.round(pct)}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'var(--border)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: isNearLimit ? 'var(--danger)' : 'var(--accent)',
                      borderRadius: 3,
                      transition: 'width 500ms',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Plan comparison */}
            <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {PLANS.map((plan) => {
                const isCurrent = plan.key === currentPlan
                return (
                  <div
                    key={plan.key}
                    style={{
                      border: isCurrent ? '2px solid var(--accent)' : '1px solid var(--border)',
                      borderRadius: 10,
                      padding: 12,
                      position: 'relative',
                      backgroundColor: 'var(--bg-primary)',
                    }}
                  >
                    {plan.recommended && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: 'var(--accent)',
                          color: 'var(--text-color)',
                          fontSize: 9,
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Recommended
                      </span>
                    )}
                    <div className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                      {plan.name}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium" style={{ fontSize: 18, color: 'var(--text-primary)' }}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{plan.period}</span>
                      )}
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      <li className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {typeof plan.automations === 'number' ? plan.automations : plan.automations} automations
                      </li>
                      <li className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {plan.templates} templates
                      </li>
                      <li className="text-xs" style={{ color: plan.ai ? 'var(--success)' : 'var(--text-muted)' }}>
                        {plan.ai ? '✓ AI features' : '✗ AI features'}
                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <button
              type="button"
              style={{
                width: '100%',
                height: 40,
                borderRadius: 8,
                backgroundColor: 'var(--accent)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: 12,
              }}
            >
              Upgrade to Pro
            </button>
            <p className="text-center text-xs mb-3" style={{ color: 'var(--text-muted)', margin: '0 0 12px' }}>
              Upgrades are handled securely through monday.com billing.
            </p>
            <div className="text-center">
              <button
                type="button"
                onClick={onClose}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textDecoration: 'underline',
                }}
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
