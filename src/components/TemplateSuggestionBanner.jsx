import { motion, AnimatePresence } from 'framer-motion'
import { IconSparkles } from '@tabler/icons-react'
import Button from './Button'

export default function TemplateSuggestionBanner({ itemType, onDismiss, onSaveTemplate, compact = false }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden mb-4"
      >
        <div
          style={{
            backgroundColor: 'var(--accent-light)',
            border: '1px solid rgba(108,71,255,0.2)',
            borderRadius: 10,
            padding: compact ? '12px' : '14px 16px',
            display: 'flex',
            flexDirection: compact ? 'column' : 'row',
            alignItems: compact ? 'flex-start' : 'flex-start',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
            <IconSparkles size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
            <div className="min-w-0">
              <p className="text-sm" style={{ color: 'var(--text-primary)', margin: '0 0 3px' }}>
                We noticed you keep adding the same subitems to <strong>{itemType}</strong> tasks.
                {!compact && ' Want to save this as a template?'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)', margin: 0 }}>
                {compact ? 'Save as template?' : "This suggestion won't appear again for 30 days if dismissed."}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, alignSelf: compact ? 'stretch' : 'center' }}>
            <Button size="sm" variant="primary" onClick={onSaveTemplate} style={compact ? { flex: 1 } : {}}>
              Save as template
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
