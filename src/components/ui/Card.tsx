import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
  },
  elevated: {
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-md)',
  },
  outlined: {
    background: 'transparent',
    border: '1px solid var(--color-border-strong)',
  },
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
} as const

type CardVariant = 'default' | 'elevated' | 'outlined'
type CardPadding = keyof typeof paddingClasses

export interface CardProps {
  variant?: CardVariant
  padding?: CardPadding
  children?: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className,
  onClick,
}: CardProps) {
  const isClickable = !!onClick

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'flex flex-col',
        paddingClasses[padding],
        isClickable && [
          'cursor-pointer',
          'hover:shadow-[var(--shadow-md)]',
          'focus-visible:outline-none',
        ],
        className,
      )}
      style={{
        ...variantStyles[variant],
        borderRadius: 'var(--radius-lg)',
        transition: 'var(--transition-base)',
        ...(isClickable
          ? {
              // hover handled via Tailwind but we set base here
            }
          : {}),
      }}
      onMouseEnter={
        isClickable
          ? (e) => {
              ;(e.currentTarget as HTMLDivElement).style.background =
                'var(--color-surface-elevated)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'
            }
          : undefined
      }
      onMouseLeave={
        isClickable
          ? (e) => {
              ;(e.currentTarget as HTMLDivElement).style.background =
                variantStyles[variant].background as string
              ;(e.currentTarget as HTMLDivElement).style.boxShadow =
                variantStyles[variant].boxShadow as string ?? ''
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
