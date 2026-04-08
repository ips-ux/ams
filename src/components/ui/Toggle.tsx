import { forwardRef, useId, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type ToggleSize = 'sm' | 'md'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string | ReactNode
  disabled?: boolean
  size?: ToggleSize
  className?: string
  id?: string
}

const trackDimensions: Record<ToggleSize, { width: number; height: number; thumb: number; translate: number }> = {
  sm: { width: 32, height: 18, thumb: 12, translate: 14 },
  md: { width: 44, height: 24, thumb: 16, translate: 20 },
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { checked, onChange, label, disabled = false, size = 'md', className, id },
  ref,
) {
  const generatedId = useId()
  const toggleId = id ?? generatedId
  const dims = trackDimensions[size]

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <button
        ref={ref}
        id={toggleId}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative shrink-0 focus-visible:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          !disabled && 'cursor-pointer',
        )}
        style={{
          width: dims.width,
          height: dims.height,
          borderRadius: 'var(--radius-full)',
          background: checked ? 'var(--color-primary)' : 'var(--color-border-strong)',
          transition: 'background var(--transition-fast)',
          padding: 0,
          border: 'none',
        }}
      >
        {/* Thumb */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: checked ? dims.translate : 3,
            transform: 'translateY(-50%)',
            width: dims.thumb,
            height: dims.thumb,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-toggle-thumb)',
            boxShadow: 'var(--shadow-sm)',
            transition: `left var(--transition-fast)`,
          }}
        />
      </button>

      {label && (
        <label
          htmlFor={toggleId}
          className={cn(
            'text-sm text-[var(--color-text-secondary)]',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer select-none',
          )}
        >
          {label}
        </label>
      )}
    </div>
  )
})
