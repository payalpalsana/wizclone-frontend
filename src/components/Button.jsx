import { IconLoader2 } from '@tabler/icons-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
  style = {},
}) {
  const base = `inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-120 cursor-pointer select-none border`
  const sizeMap = {
    sm: 'text-xs px-3',
    md: 'text-sm px-3',
    lg: 'text-sm px-4',
  }
  const heightMap = { sm: 28, md: 34, lg: 40 }

  const variantStyles = {
    primary: {
      backgroundColor: disabled || loading ? 'var(--accent)' : 'var(--accent)',
      color: '#fff',
      borderColor: 'transparent',
      opacity: disabled || loading ? 0.7 : 1,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'var(--border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: 'var(--danger)',
      color: '#fff',
      borderColor: 'transparent',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizeMap[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        height: heightMap[size],
        ...variantStyles[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading && variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--accent)'
        }
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
    >
      {loading && <IconLoader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}
