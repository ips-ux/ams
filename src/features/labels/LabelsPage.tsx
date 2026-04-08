// =============================================================================
// Aspire AMS — LabelsPage
// List view for record labels with filtering, sorting, drawer form, and stats.
// =============================================================================

import { useState } from 'react'
import { Spinner, Button, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLabels } from '@/hooks/useLabels'
import type { Label } from '@/types/models'
import type { LabelFormData } from '@/lib/validators/schemas'
import { LabelCard } from './components/LabelCard'
import { LabelForm } from './components/LabelForm'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = 'name' | 'newest' | 'oldest'
type GenreFilter = 'all' | string

// ---------------------------------------------------------------------------
// StatChip — a small count summary pill
// ---------------------------------------------------------------------------

function StatChip({
  label,
  count,
}: {
  label: string
  count: number
}) {
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
// SortButton — active/inactive toggle
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
// LabelsIcon for empty state
// ---------------------------------------------------------------------------

function LabelsIcon() {
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
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// LabelsPage
// ---------------------------------------------------------------------------

export function LabelsPage() {
  const { labels, isLoading, error, addLabel, updateLabel, deleteLabel } = useLabels()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all')
  const [sort, setSort] = useState<SortKey>('name')

  // Collect all unique genres across labels
  const allGenres = Array.from(
    new Set(labels.flatMap((l) => l.genres)),
  ).sort((a, b) => a.localeCompare(b))

  // Filtering + sorting
  const filtered = labels
    .filter((l) => {
      if (genreFilter === 'all') return true
      return l.genres.includes(genreFilter)
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'newest') {
        const aMs = a.createdAt?.toMillis?.() ?? 0
        const bMs = b.createdAt?.toMillis?.() ?? 0
        return bMs - aMs
      }
      if (sort === 'oldest') {
        const aMs = a.createdAt?.toMillis?.() ?? 0
        const bMs = b.createdAt?.toMillis?.() ?? 0
        return aMs - bMs
      }
      return 0
    })

  // Stats
  const totalCount = labels.length
  const withDemoUrl = labels.filter((l) => Boolean(l.demoSubmissionUrl)).length
  const withEmail = labels.filter((l) => Boolean(l.email)).length
  const withDiscog = labels.filter((l) => Boolean(l.discographyUrl)).length

  // Handlers
  const handleOpenAdd = () => {
    setEditingLabel(null)
    setDrawerOpen(true)
  }

  const handleOpenEdit = (label: Label) => {
    setEditingLabel(label)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setEditingLabel(null)
  }

  const handleSave = async (data: LabelFormData) => {
    if (editingLabel) {
      await updateLabel(editingLabel.id, {
        name: data.name,
        genres: data.genres,
        email: data.email ?? '',
        demoSubmissionUrl: data.demoSubmissionUrl ?? '',
        discographyUrl: data.discographyUrl ?? '',
        notes: data.notes ?? '',
      })
    } else {
      await addLabel(data)
    }
    handleCloseDrawer()
  }

  const handleDelete = async (id: string) => {
    await deleteLabel(id)
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
          title="Labels"
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              + Add Label
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
        <StatChip label="Total" count={totalCount} />
        <StatChip label="Demo URL" count={withDemoUrl} />
        <StatChip label="Email" count={withEmail} />
        <StatChip label="Discography" count={withDiscog} />
      </div>

      {/* Genre filter tabs */}
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
            active={genreFilter === 'all'}
            onClick={() => setGenreFilter('all')}
          >
            All
          </FilterTab>
          {allGenres.map((genre) => (
            <FilterTab
              key={genre}
              active={genreFilter === genre}
              onClick={() => setGenreFilter(genre)}
            >
              {genre}
            </FilterTab>
          ))}
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
        <SortButton active={sort === 'name'} onClick={() => setSort('name')}>
          Name
        </SortButton>
        <SortButton active={sort === 'newest'} onClick={() => setSort('newest')}>
          Newest
        </SortButton>
        <SortButton active={sort === 'oldest'} onClick={() => setSort('oldest')}>
          Oldest
        </SortButton>
      </div>

      {/* Label list */}
      <div style={{ flex: 1 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<LabelsIcon />}
            title={
              labels.length === 0
                ? 'No labels yet'
                : `No labels match "${genreFilter}"`
            }
            description={
              labels.length === 0
                ? 'Start building your label database to track demo submissions and contacts.'
                : 'Try selecting a different genre filter.'
            }
            action={
              labels.length === 0
                ? { label: '+ Add Label', onClick: handleOpenAdd }
                : undefined
            }
          />
        ) : (
          <div>
            {filtered.map((label) => (
              <LabelCard
                key={label.id}
                label={label}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <LabelForm
          label={editingLabel}
          onClose={handleCloseDrawer}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
