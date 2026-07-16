import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconHelpCircle, IconExternalLink, IconMail,
  IconMessageCircle, IconBook, IconChevronDown,
} from '@tabler/icons-react'
import { useWindowWidth } from '../hooks/useWindowWidth'

const FAQ = [
  {
    q: 'How does WizClone match items to templates?',
    a: 'WizClone uses AI to compare the name of a newly created item against all items in your template board. The AI confidence level determines if a match is made based on your sensitivity setting.',
  },
  {
    q: 'What happens if no template matches?',
    a: 'If no template meets the confidence threshold, the item is created without subitems and logged as "No match" in your Activity Log.',
  },
  {
    q: 'Does WizClone work on all boards?',
    a: 'WizClone works across your entire workspace. Simply open the app, go to Settings, and add the boards where you want automatic subitem copying to happen. You can enable or disable automation per board at any time.',
  },
  {
    q: 'How do I pause automation?',
    a: 'Go to Settings and toggle off "Enable WizClone automation for this workspace". WizClone will stop processing new items until you re-enable it.',
  },
  {
    q: 'How do I add more template boards?',
    a: 'Go to Settings → Template Board section and select additional boards from the dropdown. Each board can be individually enabled or disabled.',
  },
  {
    q: 'What is AI Matching Sensitivity?',
    a: 'Sensitivity controls how closely an item name must match a template. "Strict" requires near-exact matches (>90%), "Balanced" is recommended for most teams (>75%), and "Loose" matches more loosely (>55%).',
  },
]

const CONTACT_OPTIONS = [
  {
    icon: IconMail,
    label: 'Email Support',
    description: 'drtanvi@tuesdaywizards.com',
    href: 'mailto:drtanvi@tuesdaywizards.com',
    action: 'Send email',
    external: false,
  },
  {
    icon: IconBook,
    label: 'monday.com Help Center',
    description: 'Browse official documentation',
    href: 'https://support.monday.com',
    action: 'Visit',
    external: true,
  }
]

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      style={{
        borderRadius: 10,
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconHelpCircle size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
            {item.q}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <IconChevronDown size={15} style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 16px 14px 41px',
              borderTop: '1px solid var(--border)',
              paddingTop: 12,
            }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
                {item.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Help() {
  const width = useWindowWidth()
  const isMobile = width > 0 && width < 600

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? '20px 16px 48px' : '28px 24px 56px',
      }}
    >
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 580, marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Help &amp; Support
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
          Everything you need to get the most out of WizClone.
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* FAQ Accordion */}
        <section>
          <p style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--text-muted)', margin: '0 0 12px',
          }}>
            Frequently Asked Questions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FAQ.map((item, i) => (
              <FAQItem key={i} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <p style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--text-muted)', margin: '0 0 12px',
          }}>
            Contact &amp; Support
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CONTACT_OPTIONS.map((opt, i) => {
              const Icon = opt.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 + i * 0.05, duration: 0.2 }}
                  style={{
                    borderRadius: 10,
                    padding: '13px 16px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      backgroundColor: 'var(--accent-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={17} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {opt.label}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {opt.description}
                      </p>
                    </div>
                  </div>
                  <a
                    href={opt.href}
                    target={opt.external ? '_blank' : undefined}
                    rel={opt.external ? 'noopener noreferrer' : undefined}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 12, fontWeight: 500,
                      color: 'var(--accent)', textDecoration: 'none', flexShrink: 0,
                      padding: '6px 12px', borderRadius: 6,
                      border: '1px solid var(--accent)',
                      backgroundColor: 'transparent',
                      transition: 'all 120ms',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'var(--accent)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--accent)'
                    }}
                  >
                    {opt.action}
                    {opt.external && <IconExternalLink size={11} />}
                  </a>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Footer note */}
        <div
          style={{
            borderRadius: 10,
            padding: '14px 16px',
            backgroundColor: 'var(--accent-light)',
            border: '1px solid var(--accent-light)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--accent)', margin: '0 0 2px', fontWeight: 500 }}>
            Tuesday Wizards Support
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Reach us at{' '}
            <a href="mailto:drtanvi@tuesdaywizards.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              drtanvi@tuesdaywizards.com
            </a>
            {' '}- we typically respond within 1 business day.
          </p>
        </div>

      </div>
    </motion.div>
  )
}
