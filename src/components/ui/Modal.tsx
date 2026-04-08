import { useEffect, useCallback, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
}

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: ModalSize
  showCloseButton?: boolean
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4L4 12M4 4l8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const ANIMATION_DURATION = 250

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true))
      })
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      setIsVisible(false)
      const timer = setTimeout(() => setIsMounted(false), ANIMATION_DURATION)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
      return () => clearTimeout(timer)
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (!isMounted) return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal-backdrop)' as unknown as number }}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm',
          'transition-all duration-[250ms]',
          isVisible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative w-full flex flex-col',
          'transition-all duration-[250ms]',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          sizeStyles[size],
        )}
        style={{
          background: 'var(--color-surface-elevated)',
          borderRadius: 'var(--radius-xl, var(--radius-lg))',
          boxShadow: 'var(--shadow-xl, var(--shadow-lg))',
          maxHeight: 'calc(100vh - 2rem)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2
            id="modal-title"
            className="text-base font-semibold text-[var(--color-text-primary)]"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              aria-label="Close modal"
              className={cn(
                'flex items-center justify-center',
                'text-[var(--color-text-muted)]',
                'hover:text-[var(--color-text-primary)]',
                'hover:bg-[var(--color-surface-sunken)]',
                'focus-visible:outline-none',
              )}
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition-fast)',
              }}
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
