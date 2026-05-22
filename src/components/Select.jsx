import { IconChevronDown } from '@tabler/icons-react'

export default function Select({ value, onChange, options = [], placeholder = 'Select...', disabled = false, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          height: 36,
          fontSize: 14,
          borderRadius: 8,
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-primary)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          padding: '0 36px 0 12px',
          outline: 'none',
          width: '100%',
          appearance: 'none',
          cursor: 'pointer',
          transition: 'border-color 120ms, box-shadow 120ms',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent)'
          e.target.style.boxShadow = '0 0 0 3px rgba(108, 71, 255, 0.12)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <IconChevronDown
        size={14}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
