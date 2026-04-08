// =============================================================================
// Aspire AMS — DiscographyPage
// Curated view of the user's released catalog, derived from the projects
// collection. No separate Firestore collection — filter logic only.
// =============================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { useProjects } from '@/hooks/useProjects'
import type { Project } from '@/types/models'
import type { SubmissionStatus } from '@/types/enums'
import { TrackCard } from './components/TrackCard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = 'newest' | 'oldest' | 'title'
type StatusFilter = 'all' | Extract<SubmissionStatus, 'released' | 'scheduled' | 'accepted'>

// ---------------------------------------------------------------------------
// StatChip — small count summary pill
// ---------------------------------------------------------------------------

function StatChip({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 16px',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1,
        }}
      >
        {count}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FilterTab
// ---------------------------------------------------------------------------

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        borderBottom: active
          ? '2px solid var(--color-primary)'
          : '2px solid transparent',
        cursor: 'pointer',
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        borderRadius: 0,
        transition: 'color var(--transition-fast), border-color var(--transition-fast)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// SortButton
// ---------------------------------------------------------------------------

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 12px',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        borderBottom: active
          ? '2px solid var(--color-primary)'
          : '2px solid transparent',
        borderRadius: 0,
        transition: 'color var(--transition-fast), border-color var(--transition-fast)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// CountBadge — inline count pill next to the h1
// ---------------------------------------------------------------------------

function CountBadge({ count }: { count: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 24,
        height: 22,
        padding: '0 7px',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text-secondary)',
        background: 'var(--color-surface-elevated)',
        lineHeight: 1,
      }}
    >
      {count}
    </span>
  )
}

// ---------------------------------------------------------------------------
// VinylIcon — for empty state
// ---------------------------------------------------------------------------

function VinylIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="9" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// isReleasedProject — discography inclusion predicate
// ---------------------------------------------------------------------------

function isReleasedProject(p: Project): boolean {
  return (
    p.stage === 'complete' ||
    Object.keys(p.streamingLinks).length > 0 ||
    p.releaseDate !== null
  )
}

// ---------------------------------------------------------------------------
// DiscographyPage
// ---------------------------------------------------------------------------

export function DiscographyPage() {
  const { projects, isLoading } = useProjects()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortKey>('newest')

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const released = projects.filter(isReleasedProject)

  const thisYear = new Date().getFullYear()
  const releasedThisYear = released.filter(
    (p) => p.releaseDate?.toDate().getFullYear() === thisYear,
  ).length

  const onStreaming = released.filter(
    (p) => Object.keys(p.streamingLinks).length > 0,
  ).length

  const withArtwork = released.filter((p) => p.artworkUrl !== null).length

  // Status filter
  const filtered = released.filter((p) => {
    if (statusFilter === 'all') return true
    return p.submissionStatus === statusFilter
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'newest') {
      return b.createdAt.toMillis() - a.createdAt.toMillis()
    }
    if (sort === 'oldest') {
      return a.createdAt.toMillis() - b.createdAt.toMillis()
    }
    if (sort === 'title') {
      return a.title.localeCompare(b.title)
    }
    return 0
  })

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div
        style={{
          height: 'calc(100vh - 56px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner size="lg" />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 56px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px 0',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Discography
        </h1>
        <CountBadge count={released.length} />
      </div>

      {/* Stats row */}
      <div
        style={{
          padding: '16px 20px 0',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <StatChip label="Total Released" count={released.length} />
        <StatChip label="On Streaming" count={onStreaming} />
        <StatChip label="With Artwork" count={withArtwork} />
        <StatChip label="This Year" count={releasedThisYear} />
      </div>

      {/* Status filter tabs */}
      <div
        style={{
          marginTop: 16,
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0 20px',
            gap: 0,
            minWidth: '100%',
          }}
        >
          <FilterTab
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            All
          </FilterTab>
          <FilterTab
            active={statusFilter === 'released'}
            onClick={() => setStatusFilter('released')}
          >
            Released
          </FilterTab>
          <FilterTab
            active={statusFilter === 'scheduled'}
            onClick={() => setStatusFilter('scheduled')}
          >
            Scheduled
          </FilterTab>
          <FilterTab
            active={statusFilter === 'accepted'}
            onClick={() => setStatusFilter('accepted')}
          >
            Accepted
          </FilterTab>
        </div>
      </div>

      {/* Sort controls */}
      <div
        style={{
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            marginRight: 8,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Sort:
        </span>
        <SortButton active={sort === 'newest'} onClick={() => setSort('newest')}>
          Newest
        </SortButton>
        <SortButton active={sort === 'oldest'} onClick={() => setSort('oldest')}>
          Oldest
        </SortButton>
        <SortButton active={sort === 'title'} onClick={() => setSort('title')}>
          Title A–Z
        </SortButton>
      </div>

      {/* Grid / empty state */}
      <div style={{ flex: 1, padding: '16px 20px 24px' }}>
        {sorted.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 320,
              gap: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            <VinylIcon />
            <p
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >
              No releases yet
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                maxWidth: 280,
              }}
            >
              Complete projects in your pipeline and they'll appear here automatically.
            </p>
            <Link
              to="/projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginTop: 4,
                padding: '8px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                background: 'var(--color-surface-elevated)',
                transition: 'border-color var(--transition-fast), color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)'
                e.currentTarget.style.color = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-primary)'
              }}
            >
              Build in Projects →
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 16,
            }}
          >
            {sorted.map((project) => (
              <TrackCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
