import { useState, useRef, useCallback, useEffect, type ReactNode, type CSSProperties } from 'react'
import { cn } from '../../lib/utils'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: string
  children: ReactNode
  position?: TooltipPosition
  delay?: number
  disabled?: boolean
  className?: string
}

// Arrow triangle dimensions
const ARROW_SIZE = 5 // px

interface PositionStyle {
  tooltip: CSSProperties
  arrow: CSSProperties
}

function getPositionStyles(position: TooltipPosition): PositionStyle {
  switch (position) {
    case 'top':
      return {
        tooltip: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: ARROW_SIZE + 4 },
        arrow: {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
          borderColor: 'var(--color-surface-elevated) transparent transparent transparent',
        },
      }
    case 'bottom':
      return {
        tooltip: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: ARROW_SIZE + 4 },
        arrow: {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
          borderColor: 'transparent transparent var(--color-surface-elevated) transparent',
        },
      }
    case 'left':
      return {
        tooltip: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: ARROW_SIZE + 4 },
        arrow: {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${ARROW_SIZE}px 0 ${ARROW_SIZE}px ${ARROW_SIZE}px`,
          borderColor: 'transparent transparent transparent var(--color-surface-elevated)',
        },
      }
    case 'right':
      return {
        tooltip: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: ARROW_SIZE + 4 },
        arrow: {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px 0`,
          borderColor: 'transparent var(--color-surface-elevated) transparent transparent',
        },
      }
  }
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 400,
  disabled = false,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timer on unmount to prevent setState on dead component
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const show = useCallback(() => {
    if (disabled) return
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }, [disabled, delay])

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setVisible(false)
  }, [])

  const { tooltip: tooltipStyle, arrow: arrowStyle } = getPositionStyles(position)

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && !disabled && (
        <div
          role="tooltip"
          className="absolute pointer-events-none"
          style={{
            ...tooltipStyle,
            zIndex: 'var(--z-dropdown)' as unknown as number,
            whiteSpace: 'nowrap',
          }}
        >
          <div
            className="relative text-xs px-2 py-1 text-[var(--color-text-primary)]"
            style={{
              background: 'var(--color-surface-elevated)',
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            {content}

            {/* Arrow */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                ...arrowStyle,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
