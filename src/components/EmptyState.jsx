export default function EmptyState({ illustration, heading, subtext, action }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: "clamp(16px, 4vh, 40px) 24px" }}
    >
      {illustration && (
        <div style={{ marginBottom: "clamp(12px, 2vh, 20px)", flexShrink: 0 }}>
          {illustration}
        </div>
      )}
      <h3
        className="text-base font-medium mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {heading}
      </h3>
      {subtext && (
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>
          {subtext}
        </p>
      )}
      {action && <div style={{ marginTop: "clamp(12px, 2vh, 20px)" }}>{action}</div>}
    </div>
  )
}

// Used when no templates exist yet
export function NoTemplatesIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="8" width="44" height="56" rx="6" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="20" y="20" width="28" height="4" rx="2" fill="var(--skeleton)" />
      <rect x="20" y="30" width="20" height="3" rx="1.5" fill="var(--skeleton)" />
      <rect x="20" y="37" width="24" height="3" rx="1.5" fill="var(--skeleton)" />
      <rect x="20" y="44" width="16" height="3" rx="1.5" fill="var(--skeleton)" />
      <circle cx="57" cy="57" r="14" fill="var(--accent-light)" />
      <path d="M51 57h12M57 51v12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Used when a search returns no results
export function NoSearchResultsIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="34" cy="34" r="20" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="34" cy="34" r="13" fill="var(--bg-primary)" stroke="var(--border)" strokeWidth="1.5" />
      <path d="M48 48l12 12" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
      <path d="M29 34h10M34 29v10" stroke="var(--skeleton)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M27 27l14 14M41 27L27 41" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

// Used for activity log empty state
export function NoActivityIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="18" width="60" height="44" rx="6" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="10" y="18" width="60" height="12" rx="6" fill="var(--bg-tertiary, var(--bg-secondary))" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="18" y="22" width="8" height="4" rx="2" fill="var(--skeleton)" />
      <rect x="30" y="22" width="12" height="4" rx="2" fill="var(--skeleton)" />
      <rect x="46" y="22" width="8" height="4" rx="2" fill="var(--skeleton)" />
      <rect x="18" y="38" width="44" height="3" rx="1.5" fill="var(--skeleton)" opacity="0.5" />
      <rect x="18" y="46" width="36" height="3" rx="1.5" fill="var(--skeleton)" opacity="0.4" />
      <rect x="18" y="54" width="28" height="3" rx="1.5" fill="var(--skeleton)" opacity="0.3" />
      <circle cx="58" cy="58" r="12" fill="var(--accent-light)" />
      <path d="M54 58h8M58 54v8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
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
