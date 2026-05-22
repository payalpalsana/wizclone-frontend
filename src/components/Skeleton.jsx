export function SkeletonLine({ width = '100%', height = 14, className = '' }) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      style={{ width, height, borderRadius: 4 }}
    />
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`rounded-[10px] p-4 ${className}`}
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
    >
      <SkeletonLine width="40%" height={12} className="mb-3" />
      <SkeletonLine width="80%" height={14} className="mb-2" />
      <SkeletonLine width="60%" height={14} />
    </div>
  )
}

export function SkeletonTableRow() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <SkeletonLine width="20%" height={14} />
      <SkeletonLine width="20%" height={14} />
      <SkeletonLine width={40} height={22} />
      <SkeletonLine width={60} height={22} />
      <SkeletonLine width="15%" height={13} />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  )
}
