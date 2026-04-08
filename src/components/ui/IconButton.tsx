import { type ReactNode, type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/utils'

type IconButtonVariant = 'primary' | 'ghost' | 'danger' | 'outline'
type IconButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<IconButtonVariant, string> = {
  primary: [
    'bg-[var(--color-button-bg)]',
    'text-[var(--color-button-text)]',
    'hover:bg-[var(--color-button-hover)]',
    'active:bg-[var(--color-primary-active)]',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'text-[var(--color-text-secondary)]',
    'hover:bg-[var(--color-surface-elevated)]',
    'active:bg-[var(--color-surface-sunken)]',
  ].join(' '),
  danger: [
    'bg-transparent',
    'text-[var(--color-error)]',
    'hover:bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)]',
    'active:opacity-80',
  ].join(' '),
  outline: [
    'bg-transparent',
    'text-[var(--color-text-primary)]',
    'border border-[var(--color-border)]',
    'hover:bg-[var(--color-surface-elevated)]',
    'active:bg-[var(--color-surface-sunken)]',
  ].join(' '),
}

const sizeDimensions: Record<IconButtonSize, number> = {
  sm: 28,
  md: 36,
  lg: 44,
}

export interface IconButtonProps extends ComponentPropsWithoutRef<'button'> {
  icon: ReactNode
  variant?: IconButtonVariant
  size?: IconButtonSize
  tooltip?: string
  ariaLabel: string
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  tooltip,
  ariaLabel,
  className,
  disabled,
  ...props
}: IconButtonProps) {
  const dim = sizeDimensions[size]

  return (
    <button
      title={tooltip}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center shrink-0',
        'focus-visible:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      )}
      style={{
        width: dim,
        height: dim,
        borderRadius: 'var(--radius-full)',
        transition: 'var(--transition-fast)',
      }}
      {...props}
    >
      {icon}
    </button>
  )
}
