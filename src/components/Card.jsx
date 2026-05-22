export default function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children }) {
  return (
    <span
      className="block text-xs font-medium mb-3"
      style={{
        color: 'var(--text-muted)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  )
}
