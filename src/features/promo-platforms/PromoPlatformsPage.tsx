// =============================================================================
// Aspire AMS — PromoPlatformsPage
// List view for promo platforms with filtering, sorting, drawer form, and stats.
// Self-contained: drawer form is inline (no separate component file).
// =============================================================================

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Spinner, Button, Input, Textarea, Select } from '@/components/ui'
import { usePromoPlatforms } from '@/hooks/usePromoPlatforms'
import { promoPlatformSchema } from '@/lib/validators/schemas'
import { PROMO_TYPES } from '@/types/enums'
import type { PromoPlatform } from '@/types/models'
import type { PromoType } from '@/types/enums'
import type { PromoPlatformFormData } from '@/lib/validators/schemas'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = 'name' | 'type' | 'newest'
type TypeFilter = PromoType | 'all'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url
  return url.slice(0, maxLen) + '…'
}

function formatTypeLabel(type: PromoType): string {
  const map: Record<PromoType, string> = {
    'spotify-playlist': 'Spotify Playlist',
    'youtube-channel': 'YouTube',
    blog: 'Blog',
    radio: 'Radio',
    'dj-pool': 'DJ Pool',
    podcast: 'Podcast',
    other: 'Other',
  }
  return map[type] ?? type
}

function genresToString(genres: string[]): string {
  return genres.join(', ')
}

function stringToGenres(raw: string): string[] {
  return raw
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean)
}

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
// TypeBadge — monospace chip, uppercase
// ---------------------------------------------------------------------------

function TypeBadge({ type }: { type: PromoType }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '2px 6px',
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-text-secondary)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {type}
    </span>
  )
}

// ---------------------------------------------------------------------------
// GenreChip
// ---------------------------------------------------------------------------

function GenreChip({ genre }: { genre: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 6px',
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-text-secondary)',
        whiteSpace: 'nowrap',
      }}
    >
      {genre}
    </span>
  )
}

// ---------------------------------------------------------------------------
// PlatformRow
// ---------------------------------------------------------------------------

function PlatformRow({
  platform,
  onEdit,
  onDelete,
}: {
  platform: PromoPlatform
  onEdit: (p: PromoPlatform) => void
  onDelete: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 20px',
        borderBottom: '1px solid var(--color-border)',
        background: hovered ? 'var(--color-surface-elevated)' : 'transparent',
        transition: 'background var(--transition-fast)',
      }}
    >
      {/* Type badge */}
      <div style={{ paddingTop: 2 }}>
        <TypeBadge type={platform.type} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 2,
          }}
        >
          {platform.name}
        </div>

        {/* URL */}
        <div style={{ marginBottom: 2 }}>
          <a
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none'
            }}
          >
            {truncateUrl(platform.url)}
          </a>
        </div>

        {/* Contact email */}
        {platform.contactEmail && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginBottom: 4,
            }}
          >
            {platform.contactEmail}
          </div>
        )}

        {/* Genres */}
        {platform.genres.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
            {platform.genres.map((g) => (
              <GenreChip key={g} genre={g} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          opacity: hovered ? 1 : 0,
          transition: 'opacity var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        {/* Edit button */}
        <button
          onClick={() => onEdit(platform)}
          aria-label="Edit platform"
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            padding: '4px 8px',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        {/* Delete button */}
        <button
          onClick={() => onDelete(platform.id)}
          aria-label="Delete platform"
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            padding: '4px 8px',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DrawerForm — inline, no separate file
// ---------------------------------------------------------------------------

interface DrawerFormProps {
  platform: PromoPlatform | null
  onClose: () => void
  onSave: (data: PromoPlatformFormData, genresRaw: string) => Promise<void>
}

function DrawerForm({ platform, onClose, onSave }: DrawerFormProps) {
  const isEdit = platform != null
  const [genresRaw, setGenresRaw] = useState('')

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromoPlatformFormData>({
    resolver: zodResolver(promoPlatformSchema),
    defaultValues: {
      name: '',
      type: 'spotify-playlist',
      url: '',
      contactEmail: '',
      genres: [],
      notes: '',
      customGroup: null,
    },
  })

  useEffect(() => {
    if (platform) {
      reset({
        name: platform.name,
        type: platform.type,
        url: platform.url,
        contactEmail: platform.contactEmail ?? '',
        genres: platform.genres,
        notes: platform.notes ?? '',
        customGroup: platform.customGroup ?? null,
      })
      setGenresRaw(genresToString(platform.genres))
    } else {
      reset({
        name: '',
        type: 'spotify-playlist',
        url: '',
        contactEmail: '',
        genres: [],
        notes: '',
        customGroup: null,
      })
      setGenresRaw('')
    }
  }, [platform, reset])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const onSubmit = async (data: PromoPlatformFormData) => {
    await onSave(data, genresRaw)
  }

  const typeOptions = PROMO_TYPES.map((t) => ({
    value: t,
    label: formatTypeLabel(t),
  }))

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'color-mix(in srgb, var(--color-bg) 40%, transparent)',
          zIndex: 40,
        }}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit Promo Platform' : 'Add Promo Platform'}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          maxWidth: '100vw',
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {isEdit ? 'Edit Promo Platform' : 'Add Promo Platform'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: '1px solid transparent',
              cursor: 'pointer',
              padding: '6px 8px',
              color: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 18,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Form body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            flex: 1,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
          noValidate
        >
          {/* Name */}
          <Input
            label="Platform Name *"
            placeholder="e.g. House Music Weekly"
            error={errors.name?.message}
            fullWidth
            autoFocus={!isEdit}
            {...register('name')}
          />

          {/* Type */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Type *"
                options={typeOptions}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                error={errors.type?.message}
                fullWidth
              />
            )}
          />

          {/* URL */}
          <Input
            label="URL *"
            type="url"
            placeholder="https://open.spotify.com/playlist/..."
            error={errors.url?.message}
            fullWidth
            {...register('url')}
          />

          {/* Contact Email */}
          <Input
            label="Contact Email"
            type="email"
            placeholder="curator@example.com"
            error={errors.contactEmail?.message}
            fullWidth
            {...register('contactEmail')}
          />

          {/* Genres — separate state, merged on submit */}
          <Input
            label="Genres"
            placeholder="Tech House, Minimal, Techno..."
            value={genresRaw}
            onChange={(e) => setGenresRaw(e.target.value)}
            helperText="Comma-separated"
            fullWidth
          />

          {/* Custom Group */}
          <Input
            label="Custom Group"
            placeholder="e.g. Tier 1, Priority..."
            error={errors.customGroup?.message}
            fullWidth
            {...register('customGroup')}
          />

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Submission guidelines, response times, notes..."
            rows={4}
            error={errors.notes?.message}
            fullWidth
            {...register('notes')}
          />

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              paddingTop: 8,
              marginTop: 'auto',
            }}
          >
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              {isEdit ? 'Save Changes' : 'Add Platform'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// PromoPlatformsPage
// ---------------------------------------------------------------------------

export function PromoPlatformsPage() {
  const {
    promoPlatforms,
    isLoading,
    error,
    addPromoPlatform,
    updatePromoPlatform,
    deletePromoPlatform,
  } = usePromoPlatforms()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<PromoPlatform | null>(null)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [sort, setSort] = useState<SortKey>('name')

  // Filtering + sorting
  const filtered = promoPlatforms
    .filter((p) => {
      if (typeFilter === 'all') return true
      return p.type === typeFilter
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'type') return a.type.localeCompare(b.type)
      if (sort === 'newest') {
        const aMs = a.createdAt?.toMillis?.() ?? 0
        const bMs = b.createdAt?.toMillis?.() ?? 0
        return bMs - aMs
      }
      return 0
    })

  // Stats
  const totalCount = promoPlatforms.length
  const spotifyCount = promoPlatforms.filter((p) => p.type === 'spotify-playlist').length
  const blogCount = promoPlatforms.filter((p) => p.type === 'blog').length
  const radioCount = promoPlatforms.filter((p) => p.type === 'radio').length

  // Handlers
  const handleOpenAdd = () => {
    setEditingPlatform(null)
    setDrawerOpen(true)
  }

  const handleOpenEdit = (platform: PromoPlatform) => {
    setEditingPlatform(platform)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setEditingPlatform(null)
  }

  const handleSave = async (data: PromoPlatformFormData, genresRaw: string) => {
    const genres = stringToGenres(genresRaw)
    const payload: PromoPlatformFormData = { ...data, genres }

    if (editingPlatform) {
      await updatePromoPlatform(editingPlatform.id, {
        name: payload.name,
        type: payload.type,
        url: payload.url,
        contactEmail: payload.contactEmail ?? '',
        genres,
        notes: payload.notes ?? '',
        customGroup: payload.customGroup ?? null,
      })
    } else {
      await addPromoPlatform(payload)
    }
    handleCloseDrawer()
  }

  const handleDelete = async (id: string) => {
    await deletePromoPlatform(id)
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Promo Platforms
          </h1>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            + Add Platform
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          padding: '0 20px',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <StatChip label="Total" count={totalCount} />
        <StatChip label="Spotify Playlists" count={spotifyCount} />
        <StatChip label="Blogs" count={blogCount} />
        <StatChip label="Radio" count={radioCount} />
      </div>

      {/* Type filter tabs */}
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
          <FilterTab active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
            All
          </FilterTab>
          <FilterTab
            active={typeFilter === 'spotify-playlist'}
            onClick={() => setTypeFilter('spotify-playlist')}
          >
            Spotify Playlist
          </FilterTab>
          <FilterTab
            active={typeFilter === 'youtube-channel'}
            onClick={() => setTypeFilter('youtube-channel')}
          >
            YouTube
          </FilterTab>
          <FilterTab active={typeFilter === 'blog'} onClick={() => setTypeFilter('blog')}>
            Blog
          </FilterTab>
          <FilterTab active={typeFilter === 'radio'} onClick={() => setTypeFilter('radio')}>
            Radio
          </FilterTab>
          <FilterTab active={typeFilter === 'dj-pool'} onClick={() => setTypeFilter('dj-pool')}>
            DJ Pool
          </FilterTab>
          <FilterTab active={typeFilter === 'podcast'} onClick={() => setTypeFilter('podcast')}>
            Podcast
          </FilterTab>
          <FilterTab active={typeFilter === 'other'} onClick={() => setTypeFilter('other')}>
            Other
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
        <SortButton active={sort === 'name'} onClick={() => setSort('name')}>
          Name
        </SortButton>
        <SortButton active={sort === 'type'} onClick={() => setSort('type')}>
          Type
        </SortButton>
        <SortButton active={sort === 'newest'} onClick={() => setSort('newest')}>
          Newest
        </SortButton>
      </div>

      {/* Platform list */}
      <div style={{ flex: 1 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 24px',
              gap: 12,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
              aria-hidden="true"
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--color-text-muted)' }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {promoPlatforms.length === 0
                ? 'No promo platforms yet'
                : `No platforms match "${typeFilter}"`}
            </p>
            <p
              style={{
                fontSize: 14,
                color: 'var(--color-text-muted)',
                margin: 0,
                maxWidth: 280,
              }}
            >
              {promoPlatforms.length === 0
                ? 'Add Spotify playlists, blogs, radio stations and more to track your promo network.'
                : 'Try selecting a different type filter.'}
            </p>
            {promoPlatforms.length === 0 && (
              <Button variant="primary" size="md" onClick={handleOpenAdd}>
                + Add Platform
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filtered.map((platform) => (
              <PlatformRow
                key={platform.id}
                platform={platform}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <DrawerForm
          platform={editingPlatform}
          onClose={handleCloseDrawer}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
