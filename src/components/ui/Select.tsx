import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'children'> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, fullWidth = false, className, id, ...props },
  ref,
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-[var(--color-text-secondary)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={cn(
            'w-full px-3 py-2 pr-10 text-sm appearance-none',
            'bg-[var(--color-input-bg)]',
            'text-[var(--color-text-primary)]',
            'border',
            error
              ? 'border-[var(--color-error)]'
              : 'border-[var(--color-input-border)] focus:border-[var(--color-input-focus)]',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          )}
          style={{
            borderRadius: 'var(--radius-md)',
            transition: 'var(--transition-fast)',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </div>
      {error && (
        <p id={`${selectId}-error`} className="text-xs text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
