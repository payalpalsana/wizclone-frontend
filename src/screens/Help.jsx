import { motion } from 'framer-motion'
import { IconHelpCircle, IconExternalLink } from '@tabler/icons-react'

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
    a: 'WizClone is installed per board. You need to configure it separately for each board where you want automatic subitem copying.',
  },
  {
    q: 'How do I pause automation?',
    a: 'Go to Settings and toggle off "Enable automatic subitem copy on this board". WizClone will stop processing new items until you re-enable it.',
  },
]

export default function Help() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ padding: '20px 24px' }}
    >
      <div className="mb-6">
        <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Help
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
          Frequently asked questions about WizClone.
        </p>
      </div>

      <div className="flex flex-col gap-4" style={{ maxWidth: 640 }}>
        {FAQ.map((item, i) => (
          <div
            key={i}
            className="rounded-[10px] p-4"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
          >
            <div className="flex items-start gap-3">
              <IconHelpCircle size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {item.q}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        ))}

        <a
          href="https://support.monday.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium mt-2"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
        >
          Visit monday.com Support <IconExternalLink size={13} />
        </a>
      </div>
    </motion.div>
  )
}
