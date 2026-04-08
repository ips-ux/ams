import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
type BadgeSize = 'sm' | 'md'

const variantStyles: Record<
  BadgeVariant,
  { color: string; background: string }
> = {
  default: {
    color: 'var(--color-text-secondary)',
    background: 'color-mix(in srgb, var(--color-text-secondary) 12%, transparent)',
  },
  primary: {
    color: 'var(--color-primary)',
    background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
  },
  success: {
    color: 'var(--color-success)',
    background: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
  },
  warning: {
    color: 'var(--color-warning)',
    background: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
  },
  error: {
    color: 'var(--color-error)',
    background: 'color-mix(in srgb, var(--color-error) 12%, transparent)',
  },
  info: {
    color: 'var(--color-info)',
    background: 'color-mix(in srgb, var(--color-info) 12%, transparent)',
  },
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
  className?: string
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        className,
      )}
      style={{
        color: styles.color,
        background: styles.background,
      }}
    >
      {children}
    </span>
  )
}
