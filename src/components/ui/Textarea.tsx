import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/utils'

interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, helperText, fullWidth = false, rows = 4, className, id, ...props },
  ref,
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-[var(--color-text-secondary)]"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
        }
        className={cn(
          'w-full px-3 py-2 text-sm resize-y',
          'bg-[var(--color-input-bg)]',
          'text-[var(--color-text-primary)]',
          'placeholder:text-[var(--color-text-muted)]',
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
      />
      {error && (
        <p id={`${textareaId}-error`} className="text-xs text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${textareaId}-helper`} className="text-xs text-[var(--color-text-muted)]">
          {helperText}
        </p>
      )}
    </div>
  )
})
