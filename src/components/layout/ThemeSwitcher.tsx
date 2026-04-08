import { useRef, useState, useEffect } from 'react'
import { useTheme, THEMES } from '@/hooks/useTheme'
import type { ThemeKey } from '@/types/theme'
import { THEME_METADATA } from '@/types/theme'

interface ThemePreview {
  primary: string
  surface: string
  accent: string
}

const THEME_PREVIEWS: Record<ThemeKey, ThemePreview> = {
  dark: { primary: '#6366f1', surface: '#1a1a1a', accent: '#f59e0b' },
  light: { primary: '#6366f1', surface: '#ffffff', accent: '#f59e0b' },
  live: { primary: '#ff764d', surface: '#1e1e1e', accent: '#ffaa80' },
  loops: { primary: '#4a6984', surface: '#2d2d3a', accent: '#6ba3c9' },
  logical: { primary: '#4a90d9', surface: '#2b2b2b', accent: '#6eb5ff' },
  tools: { primary: '#5a7a9a', surface: '#3b4858', accent: '#7a9ab5' },
  cubes: { primary: '#7b68ee', surface: '#1e1a2e', accent: '#a088ff' },
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const currentPreview = THEME_PREVIEWS[theme]
  const themeKeys = Object.keys(THEMES) as ThemeKey[]

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        title="Switch theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          color: 'var(--color-text-primary)',
          fontSize: '13px',
          fontWeight: 500,
          transition: 'background var(--transition-fast)',
        }}
      >
        <div style={{ display: 'flex', gap: '3px' }}>
          {[currentPreview.primary, currentPreview.surface, currentPreview.accent].map(
            (color, i) => (
              <span
                key={i}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: color,
                  border: '1px solid var(--color-border)',
                  display: 'inline-block',
                }}
              />
            )
          )}
        </div>
        <span style={{ textTransform: 'capitalize' }}>{THEME_METADATA[theme].label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px',
            minWidth: '200px',
            zIndex: 1000,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {themeKeys.map((key) => {
            const preview = THEME_PREVIEWS[key]
            const isActive = theme === key
            return (
              <button
                key={key}
                onClick={() => {
                  setTheme(key)
                  setIsOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  background: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--color-sidebar-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                  {[preview.primary, preview.surface, preview.accent].map((color, i) => (
                    <span
                      key={i}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: color,
                        border: '1px solid var(--color-border)',
                        display: 'inline-block',
                      }}
                    />
                  ))}
                </div>
                <span style={{ flex: 1 }}>{THEME_METADATA[key].label}</span>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2.5 7L5.5 10L11.5 4"
                      stroke="var(--color-primary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
