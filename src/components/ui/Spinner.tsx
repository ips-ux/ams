import { cn } from '../../lib/utils'

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
} as const

interface SpinnerProps {
  size?: keyof typeof sizeClasses
  color?: string
  className?: string
}

export function Spinner({
  size = 'md',
  color = 'var(--color-primary)',
  className,
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-solid border-current border-r-transparent',
        sizeClasses[size],
        className,
      )}
      style={{ color }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
