import { cn } from '../../lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizeDimensions: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 52,
  xl: 72,
}

const fontSizeClasses: Record<AvatarSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
}

// Preset palette using design tokens — we fall back to CSS custom props.
// We pick from 8 stable hue-slots derived from a simple name hash.
const INITIALS_COLORS: Array<{ bg: string; color: string }> = [
  { bg: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' },
  { bg: 'color-mix(in srgb, var(--color-secondary) 20%, transparent)', color: 'var(--color-secondary)' },
  { bg: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', color: 'var(--color-accent)' },
  { bg: 'color-mix(in srgb, var(--color-success) 20%, transparent)', color: 'var(--color-success)' },
  { bg: 'color-mix(in srgb, var(--color-warning) 20%, transparent)', color: 'var(--color-warning)' },
  { bg: 'color-mix(in srgb, var(--color-info) 20%, transparent)', color: 'var(--color-info)' },
  { bg: 'color-mix(in srgb, var(--color-error) 20%, transparent)', color: 'var(--color-error)' },
  { bg: 'color-mix(in srgb, var(--color-text-muted) 20%, transparent)', color: 'var(--color-text-secondary)' },
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return hash
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

export interface AvatarProps {
  src?: string | null
  name: string
  size?: AvatarSize
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const dim = sizeDimensions[size]
  const initials = getInitials(name)
  const colorEntry = INITIALS_COLORS[hashName(name) % INITIALS_COLORS.length]

  const baseStyle: React.CSSProperties = {
    width: dim,
    height: dim,
    minWidth: dim,
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('object-cover shrink-0', className)}
        style={baseStyle}
      />
    )
  }

  return (
    <div
      aria-label={name}
      className={cn(
        'inline-flex items-center justify-center shrink-0 font-semibold select-none',
        fontSizeClasses[size],
        className,
      )}
      style={{
        ...baseStyle,
        background: colorEntry.bg,
        color: colorEntry.color,
      }}
    >
      {initials}
    </div>
  )
}
