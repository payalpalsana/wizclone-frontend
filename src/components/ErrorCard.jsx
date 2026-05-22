import { IconAlertCircle } from '@tabler/icons-react'
import Button from './Button'

export default function ErrorCard({ message = 'Something went wrong', onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-8 text-center rounded-[10px]"
      style={{ border: '1px solid var(--danger-light)', backgroundColor: 'var(--danger-light)' }}
    >
      <IconAlertCircle size={32} style={{ color: 'var(--danger)', marginBottom: 12 }} />
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
        Something went wrong
      </p>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
