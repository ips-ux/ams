// =============================================================================
// Aspire AMS — LabelCard
// Full-width row card for a label in list view.
// =============================================================================

import { useState } from 'react'
import type { Label } from '@/types/models'

interface LabelCardProps {
  label: Label
  onEdit: (label: Label) => void
  onDelete: (id: string) => void
}

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------

function EditIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 2l2 2-7 7H3v-2L10 2z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 4h10M5 4V2h4v2M5.5 6.5v4M8.5 6.5v4M3 4l.8 8h6.4L11 4" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 2H2v8h8V7M7 2h3v3M10 2L5.5 6.5" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// LabelCard
// ---------------------------------------------------------------------------

export function LabelCard({ label, onEdit, onDelete }: LabelCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(label.id)
    } else {
      setConfirmDelete(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setConfirmDelete(false)
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        borderBottom: '1px solid var(--color-border)',
        background: isHovered
          ? 'color-mix(in srgb, var(--color-primary) 4%, transparent)'
          : 'transparent',
        transition: 'background var(--transition-fast)',
        minHeight: 64,
      }}
    >
      {/* Main content area */}
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          minWidth: 0,
        }}
      >
        {/* Row 1: name + urls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
            }}
          >
            {label.name}
          </span>
          {label.demoSubmissionUrl && (
            <a
              href={label.demoSubmissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 11,
                color: 'var(--color-primary)',
                textDecoration: 'none',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '1px 6px',
                lineHeight: 1.6,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.02em',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              DEMO <ExternalLinkIcon />
            </a>
          )}
          {label.discographyUrl && (
            <a
              href={label.discographyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 11,
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1px 6px',
                lineHeight: 1.6,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.02em',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              DISCOG <ExternalLinkIcon />
            </a>
          )}
        </div>

        {/* Row 2: email */}
        {label.email && (
          <span
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.4,
            }}
          >
            {label.email}
          </span>
        )}

        {/* Row 3: genres as chips */}
        {label.genres.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
            {label.genres.map((genre) => (
              <span
                key={genre}
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1px 6px',
                  lineHeight: 1.6,
                  whiteSpace: 'nowrap',
                }}
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Notable artists — secondary info line */}
        {label.notableArtists.length > 0 && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--color-text-muted)',
              lineHeight: 1.4,
              marginTop: 2,
            }}
          >
            {label.notableArtists.slice(0, 4).join(', ')}
            {label.notableArtists.length > 4 && ` +${label.notableArtists.length - 4} more`}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 12px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => onEdit(label)}
          title="Edit label"
          aria-label={`Edit ${label.name}`}
          style={{
            background: 'none',
            border: '1px solid transparent',
            cursor: 'pointer',
            padding: '6px 8px',
            color: 'var(--color-text-muted)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--transition-fast), border-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.color = 'var(--color-text-primary)'
            el.style.borderColor = 'var(--color-border)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.color = 'var(--color-text-muted)'
            el.style.borderColor = 'transparent'
          }}
        >
          <EditIcon />
        </button>

        <button
          onClick={handleDeleteClick}
          title={confirmDelete ? 'Click again to confirm delete' : 'Delete label'}
          aria-label={confirmDelete ? 'Confirm delete' : `Delete ${label.name}`}
          style={{
            background: 'none',
            border: '1px solid transparent',
            cursor: 'pointer',
            padding: '6px 8px',
            color: confirmDelete ? 'var(--color-error)' : 'var(--color-text-muted)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--transition-fast), border-color var(--transition-fast)',
            borderColor: confirmDelete ? 'var(--color-error)' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!confirmDelete) {
              const el = e.currentTarget
              el.style.color = 'var(--color-error)'
              el.style.borderColor = 'var(--color-error)'
            }
          }}
          onMouseLeave={(e) => {
            if (!confirmDelete) {
              const el = e.currentTarget
              el.style.color = 'var(--color-text-muted)'
              el.style.borderColor = 'transparent'
            }
          }}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}
