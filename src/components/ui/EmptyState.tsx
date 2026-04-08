import { type ReactNode } from 'react'
import { Button } from './Button'

export interface EmptyStateAction {
  label: string
  onClick: () => void
}

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 px-6 py-16 text-center ${className ?? ''}`}
    >
      {icon && (
        <div
          className="flex items-center justify-center w-16 h-16 rounded-full text-[var(--color-text-muted)]"
          style={{ background: 'color-mix(in srgb, var(--color-text-muted) 10%, transparent)' }}
        >
          {icon}
        </div>
      )}

      <div className="flex flex-col items-center gap-1.5 max-w-sm">
        <p className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</p>
        {description && (
          <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>

      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
