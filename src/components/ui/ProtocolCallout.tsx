import type { ReactNode } from 'react'

interface ProtocolCalloutProps {
  title?: string
  children: ReactNode
  variant?: 'protocol' | 'warning' | 'info'
}

export function ProtocolCallout({ title = 'ASPIRE PROTOCOL', children, variant = 'protocol' }: ProtocolCalloutProps) {
  const borderColor = variant === 'warning' ? 'var(--color-warning)'
    : variant === 'info' ? 'var(--color-primary)'
    : 'var(--color-protocol-border)'

  return (
    <div style={{
      border: `var(--border-width-strong) solid ${borderColor}`,
      borderRadius: 0,
      padding: '16px',
      position: 'relative',
      margin: '16px 0',
    }}>
      <span style={{
        position: 'absolute',
        top: '-10px',
        left: '12px',
        background: 'var(--color-bg)',
        padding: '0 6px',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: borderColor,
      }}>
        {title}
      </span>
      <div style={{ color: 'var(--color-text-primary)', fontSize: '14px', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  )
}
