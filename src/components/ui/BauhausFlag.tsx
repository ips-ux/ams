import { useState } from 'react'

export interface BauhausFlagProps {
  hint: {
    title: string
    content: string
    source: string
  } | null
  onDismiss: () => void
}

export function BauhausFlag({ hint, onDismiss }: BauhausFlagProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!hint) return null

  const panelWidth = 320

  const flagStyle: React.CSSProperties = {
    position: 'fixed',
    right: isOpen ? panelWidth : 0,
    top: '50vh',
    transform: 'translateY(-50%)',
    width: '28px',
    height: '90px',
    background: 'var(--color-bauhaus-flag)',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 'var(--z-sticky)' as unknown as number,
    transition: `right var(--transition-base)`,
    userSelect: 'none',
  }

  const flagTextStyle: React.CSSProperties = {
    writingMode: 'vertical-rl',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxHeight: '80px',
  }

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    right: 0,
    top: '56px',
    height: 'calc(100vh - 56px)',
    width: `${panelWidth}px`,
    background: 'var(--color-surface-elevated)',
    borderLeft: '2px solid var(--color-bauhaus-flag)',
    zIndex: 'var(--z-sticky)' as unknown as number,
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: `transform var(--transition-base)`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const panelHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
  }

  const sourceStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--color-bauhaus-flag)',
  }

  const closeBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    fontSize: '18px',
    lineHeight: 1,
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const panelBodyStyle: React.CSSProperties = {
    padding: '16px',
    flex: 1,
    overflowY: 'auto',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: '10px',
    lineHeight: 1.3,
  }

  const contentStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.65,
  }

  const dismissBtnStyle: React.CSSProperties = {
    margin: '16px',
    padding: '8px 12px',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    transition: 'background var(--transition-fast), color var(--transition-fast)',
    flexShrink: 0,
  }

  const handleDismiss = () => {
    setIsOpen(false)
    onDismiss()
  }

  return (
    <>
      {/* Flag tab */}
      <div style={flagStyle} onClick={() => setIsOpen((prev) => !prev)} role="button" aria-label="Open hint panel">
        <span style={flagTextStyle}>{hint.source}</span>
      </div>

      {/* Slide-out panel */}
      <div style={panelStyle} aria-hidden={!isOpen}>
        <div style={panelHeaderStyle}>
          <span style={sourceStyle}>{hint.source}</span>
          <button
            style={closeBtnStyle}
            onClick={() => setIsOpen(false)}
            aria-label="Close hint panel"
          >
            ×
          </button>
        </div>
        <div style={panelBodyStyle}>
          <div style={titleStyle}>{hint.title}</div>
          <div style={contentStyle}>{hint.content}</div>
        </div>
        <button
          style={dismissBtnStyle}
          onClick={handleDismiss}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-surface)'
            e.currentTarget.style.color = 'var(--color-text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          Dismiss hint
        </button>
      </div>
    </>
  )
}
