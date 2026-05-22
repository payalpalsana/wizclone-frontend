export default function EmptyState({ illustration, heading, subtext, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {illustration && <div className="mb-5">{illustration}</div>}
      <h3
        className="text-base font-medium mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {heading}
      </h3>
      {subtext && (
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {subtext}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ListIllustration() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="40" height="6" rx="3" fill="var(--skeleton)" />
      <rect x="8" y="26" width="30" height="6" rx="3" fill="var(--skeleton)" />
      <rect x="8" y="38" width="35" height="6" rx="3" fill="var(--skeleton)" />
      <circle cx="44" cy="14" r="6" fill="var(--accent-light)" />
      <path d="M41.5 14L43.5 16L46.5 12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BuilderIllustration() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="18" width="36" height="22" rx="4" fill="var(--bg-secondary)" stroke="var(--border)" />
      <rect x="16" y="24" width="24" height="4" rx="2" fill="var(--skeleton)" />
      <rect x="16" y="32" width="16" height="4" rx="2" fill="var(--skeleton)" />
      <circle cx="42" cy="16" r="7" fill="var(--accent-light)" />
      <path d="M39 16L41 18L45 13" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
