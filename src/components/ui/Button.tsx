import { useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Spinner } from './Spinner'

// Bauhaus button: form follows function.
// Borders carry meaning, fills only on interaction.

const variantBase = {
  primary: {
    '--btn-border': 'var(--color-primary)',
    '--btn-color': 'var(--color-primary)',
    '--btn-bg': 'transparent',
    '--btn-hover-bg': 'var(--color-primary)',
    '--btn-hover-color': '#ffffff',
    '--btn-hover-border': 'var(--color-primary)',
  },
  outline: {
    '--btn-border': 'var(--color-border)',
    '--btn-color': 'var(--color-text-primary)',
    '--btn-bg': 'transparent',
    '--btn-hover-bg': 'var(--color-surface-elevated)',
    '--btn-hover-color': 'var(--color-text-primary)',
    '--btn-hover-border': 'var(--color-border)',
  },
  ghost: {
    '--btn-border': 'transparent',
    '--btn-color': 'var(--color-text-muted)',
    '--btn-bg': 'transparent',
    '--btn-hover-bg': 'var(--color-surface-elevated)',
    '--btn-hover-color': 'var(--color-text-primary)',
    '--btn-hover-border': 'transparent',
  },
  danger: {
    '--btn-border': 'var(--color-error)',
    '--btn-color': 'var(--color-error)',
    '--btn-bg': 'transparent',
    '--btn-hover-bg': 'var(--color-error)',
    '--btn-hover-color': 'var(--color-text-inverse)',
    '--btn-hover-border': 'var(--color-error)',
  },
  secondary: {
    '--btn-border': 'var(--color-border)',
    '--btn-color': 'var(--color-text-secondary)',
    '--btn-bg': 'transparent',
    '--btn-hover-bg': 'var(--color-surface-elevated)',
    '--btn-hover-color': 'var(--color-text-primary)',
    '--btn-hover-border': 'var(--color-border)',
  },
} as const

type Variant = keyof typeof variantBase

const sizeClasses = {
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-3.5 py-1.5 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2.5',
} as const

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: Variant
  size?: keyof typeof sizeClasses
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading
  const [isFocusVisible, setIsFocusVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const vars = variantBase[variant]

  const computedStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-md)',
    border: `var(--border-width) solid ${isHovered ? vars['--btn-hover-border'] : vars['--btn-border']}`,
    background: isHovered ? vars['--btn-hover-bg'] : vars['--btn-bg'],
    color: isHovered ? vars['--btn-hover-color'] : vars['--btn-color'],
    transition: `background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast)`,
    boxShadow: isFocusVisible ? 'var(--focus-ring)' : 'none',
    outline: isActive ? '2px solid var(--color-primary)' : 'none',
    outlineOffset: isActive ? '-2px' : undefined,
  }

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'focus-visible:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      style={computedStyle}
      onMouseEnter={(e) => {
        setIsHovered(true)
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setIsHovered(false)
        setIsActive(false)
        props.onMouseLeave?.(e)
      }}
      onMouseDown={(e) => {
        setIsFocusVisible(false)
        setIsActive(true)
        props.onMouseDown?.(e)
      }}
      onMouseUp={(e) => {
        setIsActive(false)
        props.onMouseUp?.(e)
      }}
      onFocus={(e) => {
        setIsFocusVisible(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setIsFocusVisible(false)
        props.onBlur?.(e)
      }}
      {...props}
    >
      {loading ? (
        <Spinner
          size={size === 'lg' ? 'md' : 'sm'}
          color="currentColor"
        />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}
