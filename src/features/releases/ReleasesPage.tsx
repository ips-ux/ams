// =============================================================================
// Aspire AMS — ReleasesPage
// List view for releases with timeline filtering, sorting, drawer form, and stats.
// =============================================================================

import { useState } from 'react'
import { Spinner, Button, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { useReleases } from '@/hooks/useReleases'
import { Timestamp } from 'firebase/firestore'
import type { Release } from '@/types/models'
import type { ReleaseFormData } from '@/lib/validators/schemas'
import { ReleaseCard } from './components/ReleaseCard'
import { ReleaseForm } from './components/ReleaseForm'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TimelineTab = 'all' | 'upcoming' | 'released' | 'this-month'
type SortKey = 'nearest' | 'furthest' | 'title'

// ---------------------------------------------------------------------------
// StatChip
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
// ReleasesIcon for empty state
// ---------------------------------------------------------------------------

function ReleasesIcon() {
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
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// ReleasesPage
// ---------------------------------------------------------------------------

export function ReleasesPage() {
  const { releases, isLoading, error, addRelease, updateRelease, deleteRelease } =
    useReleases()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRelease, setEditingRelease] = useState<Release | null>(null)
  const [activeTab, setActiveTab] = useState<TimelineTab>('all')
  const [sort, setSort] = useState<SortKey>('nearest')

  const now = Date.now()
  const thisMonth = new Date()

  // Stats
  const released = releases.filter((r) => r.releaseDate.toMillis() < now)
  const upcoming = releases.filter((r) => r.releaseDate.toMillis() >= now)
  const thisMonthReleases = releases.filter((r) => {
    const d = r.releaseDate.toDate()
    return (
      d.getMonth() === thisMonth.getMonth() &&
      d.getFullYear() === thisMonth.getFullYear()
    )
  })

  // Filter by tab
  const tabFiltered = releases.filter((r) => {
    if (activeTab === 'all') return true
    if (activeTab === 'upcoming') return r.releaseDate.toMillis() >= now
    if (activeTab === 'released') return r.releaseDate.toMillis() < now
    if (activeTab === 'this-month') {
      const d = r.releaseDate.toDate()
      return (
        d.getMonth() === thisMonth.getMonth() &&
        d.getFullYear() === thisMonth.getFullYear()
      )
    }
    return true
  })

  // Sort
  const sorted = [...tabFiltered].sort((a, b) => {
    if (sort === 'nearest') return a.releaseDate.toMillis() - b.releaseDate.toMillis()
    if (sort === 'furthest') return b.releaseDate.toMillis() - a.releaseDate.toMillis()
    if (sort === 'title') return a.title.localeCompare(b.title)
    return 0
  })

  // Handlers
  const handleOpenAdd = () => {
    setEditingRelease(null)
    setDrawerOpen(true)
  }

  const handleOpenEdit = (release: Release) => {
    setEditingRelease(release)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setEditingRelease(null)
  }

  const handleSave = async (data: ReleaseFormData) => {
    if (editingRelease) {
      await updateRelease(editingRelease.id, {
        title: data.title,
        projectRef: data.projectRef ?? '',
        releaseDate: Timestamp.fromDate(new Date(data.releaseDate)),
        distributionPlatform: data.distributionPlatform ?? '',
        isrc: data.isrc ?? '',
      })
    } else {
      await addRelease(data)
    }
    handleCloseDrawer()
  }

  const handleDelete = async (id: string) => {
    await deleteRelease(id)
  }

  // ---------------------------------------------------------------------------
  // Loading / error states
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

  if (error) {
    return (
      <div style={{ padding: '24px 20px' }}>
        <p
          style={{
            color: 'var(--color-error)',
            fontSize: 14,
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
          }}
        >
          {error}
        </p>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
      {/* Page header */}
      <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
        <PageHeader
          title="Releases"
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              + Add Release
            </Button>
          }
        />
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
        <StatChip label="Total" count={releases.length} />
        <StatChip label="Released" count={released.length} />
        <StatChip label="Upcoming" count={upcoming.length} />
        <StatChip label="This Month" count={thisMonthReleases.length} />
      </div>

      {/* Timeline tabs */}
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
          <FilterTab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
            All
          </FilterTab>
          <FilterTab
            active={activeTab === 'upcoming'}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </FilterTab>
          <FilterTab
            active={activeTab === 'released'}
            onClick={() => setActiveTab('released')}
          >
            Released
          </FilterTab>
          <FilterTab
            active={activeTab === 'this-month'}
            onClick={() => setActiveTab('this-month')}
          >
            This Month
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
        <SortButton active={sort === 'nearest'} onClick={() => setSort('nearest')}>
          Nearest
        </SortButton>
        <SortButton active={sort === 'furthest'} onClick={() => setSort('furthest')}>
          Furthest
        </SortButton>
        <SortButton active={sort === 'title'} onClick={() => setSort('title')}>
          Title
        </SortButton>
      </div>

      {/* Releases list */}
      <div style={{ flex: 1 }}>
        {sorted.length === 0 ? (
          <EmptyState
            icon={<ReleasesIcon />}
            title={
              releases.length === 0
                ? 'No releases tracked yet'
                : 'No releases in this view'
            }
            description={
              releases.length === 0
                ? 'Track your releases with promo checklists and label submission logs.'
                : 'Try selecting a different timeline tab.'
            }
            action={
              releases.length === 0
                ? { label: '+ Add Release', onClick: handleOpenAdd }
                : undefined
            }
          />
        ) : (
          <div>
            {sorted.map((release) => (
              <ReleaseCard
                key={release.id}
                release={release}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <ReleaseForm
          release={editingRelease}
          onClose={handleCloseDrawer}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
