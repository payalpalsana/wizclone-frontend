import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconSearch,
} from '@tabler/icons-react'
import Badge from '../components/Badge'
import EmptyState, { ListIllustration } from '../components/EmptyState'
import { useWindowWidth } from '../hooks/useWindowWidth'

const MOCK_LOGS = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  itemName: `Task ${i + 1}: ${['Social Media Campaign', 'Product Launch', 'Q3 Report', 'Design Review', 'Sprint Planning'][i % 5]}`,
  templateMatched: i % 7 === 0 ? null : ['Campaign Template', 'Launch Checklist', 'Report Template', 'Design Process', 'Sprint Template'][i % 5],
  confidence: i % 7 === 0 ? null : [94, 87, 72, 61, 98][i % 5],
  exactMatch: i % 5 === 4,
  status: i % 7 === 0 ? 'no_match' : i % 11 === 0 ? 'failed' : 'success',
  time: new Date(Date.now() - i * 3600000 * 2),
  boardName: 'Marketing Projects',
  subitems: ['Write copy', 'Design assets', 'Schedule posts', 'Review analytics'],
  duration: '1.8s',
  error: i % 11 === 0 ? 'Template board not found' : null,
}))

const PAGE_SIZE = 25

function relativeTime(date) {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`
}

function ConfidencePill({ confidence, exactMatch }) {
  if (exactMatch) return <Badge variant="blue">Exact match</Badge>
  if (!confidence) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const variant = confidence >= 75 ? 'success' : confidence >= 55 ? 'warning' : 'danger'
  return <Badge variant={variant}>{confidence}%</Badge>
}

function StatusBadge({ status }) {
  const map = { success: 'success', no_match: 'warning', failed: 'danger' }
  const labels = { success: 'Success', no_match: 'No match', failed: 'Failed' }
  return <Badge variant={map[status]}>{labels[status]}</Badge>
}

/* ── Expand detail panel (shared by table row and card) ── */
function LogDetail({ log }) {
  return (
    <div className="text-sm" style={{ padding: '12px 16px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: log.status === 'success' || log.error ? 12 : 0 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>Item</p>
          <p style={{ color: 'var(--text-primary)', margin: 0, wordBreak: 'break-word' }}>{log.itemName}</p>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>Board</p>
          <p style={{ color: 'var(--text-primary)', margin: 0 }}>{log.boardName}</p>
        </div>
        {log.templateMatched && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>Template</p>
            <p style={{ color: 'var(--text-primary)', margin: 0 }}>{log.templateMatched}</p>
          </div>
        )}
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>Duration</p>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Completed in {log.duration}</p>
        </div>
      </div>
      {log.status === 'success' && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Subitems copied</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {log.subitems.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                <IconCheck size={12} style={{ color: 'var(--success)', flexShrink: 0 }} />{s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {log.error && (
        <div style={{ marginTop: log.status === 'success' ? 12 : 0 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>Error</p>
          <p className="text-sm" style={{ color: 'var(--danger)', margin: 0 }}>{log.error}</p>
        </div>
      )}
    </div>
  )
}

/* ── Desktop table row ── */
function LogTableRow({ log }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: 'pointer', borderBottom: expanded ? 'none' : '1px solid var(--border)', transition: 'background-color 120ms' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <td style={{ padding: '11px 16px', maxWidth: 200 }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.itemName}</span>
        </td>
        <td style={{ padding: '11px 16px' }}>
          <span className="text-sm" style={{ color: log.templateMatched ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{log.templateMatched || '—'}</span>
        </td>
        <td style={{ padding: '11px 16px' }}><ConfidencePill confidence={log.confidence} exactMatch={log.exactMatch} /></td>
        <td style={{ padding: '11px 16px' }}><StatusBadge status={log.status} /></td>
        <td style={{ padding: '11px 16px' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }} title={log.time.toLocaleString()}>{relativeTime(log.time)}</span>
        </td>
        <td style={{ padding: '11px 12px', width: 24 }}>
          {expanded ? <IconChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <IconChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td colSpan={6} style={{ padding: 0 }}>
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
                <LogDetail log={log} />
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Mobile card row ── */
function LogCard({ log }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.itemName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <StatusBadge status={log.status} />
            <ConfidencePill confidence={log.confidence} exactMatch={log.exactMatch} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{relativeTime(log.time)}</span>
          </div>
        </div>
        {expanded ? <IconChevronUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} /> : <IconChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
            <LogDetail log={log} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ActivityLog() {
  const width = useWindowWidth()
  const isMobile = width > 0 && width < 640

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = MOCK_LOGS.filter((log) => {
    if (filter !== 'all' && log.status !== filter) return false
    if (search && !log.itemName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const total = filtered.length
  const pageStart = (page - 1) * PAGE_SIZE
  const pageEnd = Math.min(pageStart + PAGE_SIZE, total)
  const paginated = filtered.slice(pageStart, pageEnd)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'success', label: 'Success' },
    { key: 'no_match', label: 'No match' },
    { key: 'failed', label: 'Failed' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ padding: isMobile ? '16px' : '20px 24px' }}
    >
      <div className="mb-5">
        <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px' }}>Activity Log</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Every automation WizClone has run on this board.</p>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: 20, alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between' }}>
        {/* Filter tabs — scrollable on small screens */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setFilter(tab.key); setPage(1) }}
              style={{
                padding: isMobile ? '7px 12px' : '8px 16px', fontSize: 14, fontFamily: 'inherit',
                border: 'none', borderBottom: filter === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                backgroundColor: 'transparent', color: filter === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: filter === tab.key ? 500 : 400, transition: 'color 120ms',
                marginBottom: -1, whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: isMobile ? '100%' : 240 }}>
          <IconSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by item name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{
              height: 36, width: '100%', paddingLeft: 32, paddingRight: 12, fontSize: 14,
              border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,71,255,0.12)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
        </div>
      </div>

      {/* Content */}
      {paginated.length === 0 ? (
        <EmptyState
          illustration={<ListIllustration />}
          heading="No automations have run yet"
          subtext="Create a new item on your board to trigger WizClone for the first time."
        />
      ) : isMobile ? (
        /* Mobile: card list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {paginated.map((log) => <LogCard key={log.id} log={log} />)}
        </div>
      ) : (
        /* Desktop: table */
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                  {['Item name', 'Template matched', 'Confidence', 'Status', 'Time', ''].map((col) => (
                    <th key={col} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((log) => <LogTableRow key={log.id} log={log} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {pageStart + 1}–{pageEnd} of {total} events
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['Previous', page === 1, () => setPage((p) => p - 1)], ['Next', page >= totalPages, () => setPage((p) => p + 1)]].map(([label, disabled, action]) => (
              <button
                key={label}
                type="button"
                disabled={disabled}
                onClick={action}
                style={{
                  height: 32, paddingInline: 12, borderRadius: 6, border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)', color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
