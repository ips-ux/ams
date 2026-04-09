// =============================================================================
// Aspire AMS — LibraryPage
// Grid browser for all Aspire Academy methodology documents.
// Read-only — no CRUD operations.
// Content loaded from Firestore manifest via useLibraryDocs.
// =============================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibraryDocs } from '@/hooks/useLibraryDocs'
import type { ManifestEntry } from '@/types/models'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CategoryFilter = 'all' | 'production' | 'business' | 'workflow'

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
// CategoryChip
// ---------------------------------------------------------------------------

function CategoryChip({ category }: { category: ManifestEntry['category'] }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '2px 6px',
        color: 'var(--color-text-secondary)',
      }}
    >
      {category}
    </span>
  )
}

// ---------------------------------------------------------------------------
// DocCard
// ---------------------------------------------------------------------------

function DocCard({ doc }: { doc: ManifestEntry }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={`/library/${doc.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: '1px solid var(--color-border)',
          background: hovered
            ? 'color-mix(in srgb, var(--color-primary) 4%, var(--color-surface))'
            : 'var(--color-surface)',
          borderRadius: 'var(--radius-sm)',
          padding: 20,
          cursor: 'pointer',
          transition: 'background var(--transition-fast)',
        }}
      >
        {/* Top row: icon + category chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 24, lineHeight: 1 }}>{doc.icon}</span>
          <CategoryChip category={doc.category} />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginTop: 10,
            lineHeight: 1.3,
          }}
        >
          {doc.title}
        </div>

        {/* Preview */}
        <div
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          {doc.preview}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-primary)',
          }}
        >
          Read Guide →
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// SkeletonCard — shown while manifest loads
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-sm)',
        padding: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ width: 32, height: 32, background: 'var(--color-border)', borderRadius: 4 }} />
        <div style={{ width: 64, height: 18, background: 'var(--color-border)', borderRadius: 4 }} />
      </div>
      <div style={{ marginTop: 10, height: 18, width: '75%', background: 'var(--color-border)', borderRadius: 4 }} />
      <div style={{ marginTop: 8, height: 14, background: 'var(--color-border)', borderRadius: 4 }} />
      <div style={{ marginTop: 4, height: 14, width: '85%', background: 'var(--color-border)', borderRadius: 4 }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// LibraryPage
// ---------------------------------------------------------------------------

export function LibraryPage() {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const { docs, loading, error } = useLibraryDocs()

  const filtered =
    category === 'all'
      ? docs
      : docs.filter((d) => d.category === category)

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Aspire Library
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-text-muted)',
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          Proprietary Aspire Academy methodology — read-only
        </p>
      </div>

      {/* Category filter tabs */}
      <div
        style={{
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 24,
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'inline-flex', gap: 0 }}>
          <FilterTab active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </FilterTab>
          <FilterTab active={category === 'production'} onClick={() => setCategory('production')}>
            Production
          </FilterTab>
          <FilterTab active={category === 'business'} onClick={() => setCategory('business')}>
            Business
          </FilterTab>
          <FilterTab active={category === 'workflow'} onClick={() => setCategory('workflow')}>
            Workflow
          </FilterTab>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
          {error}
        </p>
      )}

      {/* Card grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map((doc) => <DocCard key={doc.slug} doc={doc} />)
        }
      </div>
    </div>
  )
}
