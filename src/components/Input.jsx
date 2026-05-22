export default function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
  style = {},
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      style={{
        height: 36,
        fontSize: 14,
        borderRadius: 8,
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '0 12px',
        outline: 'none',
        width: '100%',
        transition: 'border-color 120ms, box-shadow 120ms',
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--accent)'
        e.target.style.boxShadow = '0 0 0 3px rgba(108, 71, 255, 0.12)'
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--border)'
        e.target.style.boxShadow = 'none'
      }}
      {...props}
    />
  )
}

export function Textarea({
  value,
  onChange,
  placeholder,
  disabled = false,
  minHeight = 120,
  className = '',
  style = {},
  ...props
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      style={{
        minHeight,
        fontSize: 14,
        borderRadius: 8,
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '10px 12px',
        outline: 'none',
        width: '100%',
        resize: 'vertical',
        lineHeight: 1.6,
        fontFamily: 'inherit',
        transition: 'border-color 120ms, box-shadow 120ms',
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--accent)'
        e.target.style.boxShadow = '0 0 0 3px rgba(108, 71, 255, 0.12)'
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--border)'
        e.target.style.boxShadow = 'none'
      }}
      {...props}
    />
  )
}
