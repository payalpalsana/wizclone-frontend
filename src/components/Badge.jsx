export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
    success: { bg: 'var(--success-light)', color: 'var(--success)' },
    warning: { bg: 'var(--warning-light)', color: 'var(--warning)' },
    danger: { bg: 'var(--danger-light)', color: 'var(--danger)' },
    accent: { bg: 'var(--accent-light)', color: 'var(--accent)' },
    blue: { bg: '#e8f0fe', color: '#1a56db' },
  }
  const { bg, color } = variants[variant] || variants.default

  return (
    <span
      className={`inline-flex items-center text-xs font-medium rounded px-2 py-1 ${className}`}
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  )
}
