import { useState, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface DropdownItem {
  label: string
  onClick: () => void
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
  separator?: boolean
}

type DropdownAlign = 'left' | 'right'

export interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: DropdownAlign
  className?: string
}

export function Dropdown({
  trigger,
  items,
  align = 'left',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggle = () => setIsOpen((prev) => !prev)
  const close = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger wrapper */}
      <div onClick={toggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute z-[var(--z-dropdown)] top-full mt-1 py-1 min-w-[180px]',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          style={{
            background: 'var(--color-surface-elevated)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <hr
                  key={index}
                  className="my-1"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                />
              )
            }

            return (
              <button
                key={index}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick()
                    close()
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  item.danger
                    ? 'text-[var(--color-error)] hover:bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)]'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)]',
                )}
                style={{ transition: 'var(--transition-fast)' }}
              >
                {item.icon && (
                  <span className="shrink-0 text-[var(--color-text-muted)] w-4 h-4 flex items-center justify-center">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
