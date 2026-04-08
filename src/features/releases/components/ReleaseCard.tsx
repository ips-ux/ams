// =============================================================================
// Aspire AMS — ReleaseCard
// Full-width row card for a release in list view.
// Left strip color encodes urgency; includes checklist progress bar.
// =============================================================================

import { useState } from 'react'
import type { Release } from '@/types/models'
import { cn } from '@/lib/utils'

interface ReleaseCardProps {
  release: Release
  onEdit: (release: Release) => void
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

function getStripColor(daysUntil: number): string {
  if (daysUntil < 0) return 'var(--color-stage-complete)'
  if (daysUntil <= 7) return 'var(--color-danger)'
  if (daysUntil <= 30) return 'var(--color-stage-expand)'
  return 'var(--color-primary)'
}

// ---------------------------------------------------------------------------
// ReleaseCard
// ---------------------------------------------------------------------------

export function ReleaseCard({ release, onEdit, onDelete }: ReleaseCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const releaseDateMs = release.releaseDate.toMillis()
  const now = Date.now()
  const daysUntil = Math.ceil((releaseDateMs - now) / (1000 * 60 * 60 * 24))
  const stripColor = getStripColor(daysUntil)

  const totalItems = release.promoChecklist.length
  const completedItems = release.promoChecklist.filter((i) => i.completed).length
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const platformCount = Object.keys(release.platforms).length

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(release.id)
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
      className={cn()}
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
        minHeight: 72,
      }}
    >
      {/* Left urgency strip */}
      <div
        aria-hidden="true"
        style={{
          width: 4,
          flexShrink: 0,
          background: stripColor,
        }}
      />

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
        {/* Row 1: title + release date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {release.title}
          </span>
          <span
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              flexShrink: 0,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {formatDate(release.releaseDate.toDate())}
          </span>
        </div>

        {/* Row 2: distribution platform chip + ISRC */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {release.distributionPlatform && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1px 6px',
                lineHeight: 1.6,
                whiteSpace: 'nowrap',
              }}
            >
              {release.distributionPlatform}
            </span>
          )}
          {release.isrc && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
              }}
            >
              {release.isrc}
            </span>
          )}
        </div>

        {/* Row 3: checklist progress bar */}
        {totalItems > 0 && (
          <div
            style={{
              width: '100%',
              height: 4,
              background: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              marginTop: 2,
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'var(--color-primary)',
                transition: 'width var(--transition-fast)',
              }}
            />
          </div>
        )}

        {/* Row 4: task count + platform count chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {totalItems > 0 && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {completedItems}/{totalItems} tasks
            </span>
          )}
          {platformCount > 0 && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1px 6px',
                lineHeight: 1.6,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {platformCount} platform{platformCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
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
          onClick={() => onEdit(release)}
          title="Edit release"
          aria-label={`Edit ${release.title}`}
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
          title={confirmDelete ? 'Click again to confirm delete' : 'Delete release'}
          aria-label={confirmDelete ? 'Confirm delete' : `Delete ${release.title}`}
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
