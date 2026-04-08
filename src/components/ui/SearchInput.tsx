import { cn } from '../../lib/utils'

export interface SearchInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  autoFocus,
}: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      {/* Search icon */}
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
      >
        <SearchIcon />
      </span>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full pl-9 pr-9 py-2 text-sm',
          'bg-[var(--color-input-bg,var(--color-surface))]',
          'text-[var(--color-text-primary)]',
          'placeholder:text-[var(--color-text-muted)]',
          'border border-[var(--color-input-border,var(--color-border))]',
          'focus:border-[var(--color-input-focus,var(--color-primary))]',
          'focus:outline-none',
          // Hide native clear button added by browsers for type="search"
          '[&::-webkit-search-cancel-button]:hidden',
        )}
        style={{
          borderRadius: 'var(--radius-md)',
          transition: 'var(--transition-fast)',
        }}
      />

      {/* Clear button */}
      {value.length > 0 && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className={cn(
            'absolute right-2.5 top-1/2 -translate-y-1/2',
            'flex items-center justify-center',
            'text-[var(--color-text-muted)]',
            'hover:text-[var(--color-text-primary)]',
            'rounded-full focus-visible:outline-none',
          )}
          style={{
            width: 20,
            height: 20,
            transition: 'var(--transition-fast)',
          }}
        >
          <ClearIcon />
        </button>
      )}
    </div>
  )
}
