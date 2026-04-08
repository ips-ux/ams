// =============================================================================
// Aspire AMS — DirectoryPage
// Real-time community member directory with search and genre filtering.
// =============================================================================

import { useState, useEffect } from 'react'
import {
  communityCollection,
  onDocumentsSnapshot,
} from '@/lib/firebase/helpers'
import type { BaseDocument } from '@/types/models'
import { Spinner } from '@/components/ui'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommunityProfile extends BaseDocument {
  userId: string
  artistName: string
  avatarUrl: string | null
  genres: string[]
  socials: Record<string, string>
  bio: string
  lookingFor: string[]
}

// ---------------------------------------------------------------------------
// AvatarCircle — initials fallback
// ---------------------------------------------------------------------------

function AvatarCircle({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 700,
        color: 'var(--color-bg)',
        flexShrink: 0,
      }}
    >
      {initials || '?'}
    </div>
  )
}

// ---------------------------------------------------------------------------
// GenreChip
// ---------------------------------------------------------------------------

function GenreChip({
  genre,
  active,
  onClick,
}: {
  genre: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--color-primary)' : 'none',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--color-bg)' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background var(--transition-fast), color var(--transition-fast)',
      }}
    >
      {genre}
    </button>
  )
}

// ---------------------------------------------------------------------------
// MemberCard
// ---------------------------------------------------------------------------

function MemberCard({ profile }: { profile: CommunityProfile }) {
  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: 16,
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AvatarCircle name={profile.artistName} avatarUrl={profile.avatarUrl} />
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
          }}
        >
          {profile.artistName}
        </div>
      </div>

      {/* Genres */}
      {profile.genres.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {profile.genres.map((g) => (
            <span
              key={g}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1px 5px',
                color: 'var(--color-text-secondary)',
              }}
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {profile.bio}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DirectoryPage
// ---------------------------------------------------------------------------

export function DirectoryPage() {
  const [profiles, setProfiles] = useState<CommunityProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onDocumentsSnapshot<CommunityProfile>(
      communityCollection,
      (docs) => {
        setProfiles(docs)
        setIsLoading(false)
      },
    )
    return unsub
  }, [])

  // Collect all unique genres dynamically
  const allGenres = Array.from(
    new Set(profiles.flatMap((p) => p.genres)),
  ).sort((a, b) => a.localeCompare(b))

  // Filter
  const filtered = profiles.filter((p) => {
    const query = search.toLowerCase()
    const matchesSearch =
      !search ||
      p.artistName.toLowerCase().includes(query) ||
      p.genres.some((g) => g.toLowerCase().includes(query))
    const matchesGenre = !genreFilter || p.genres.includes(genreFilter)
    return matchesSearch && matchesGenre
  })

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

  return (
    <div style={{ padding: '24px 20px' }}>
      {/* Header */}
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
          Directory
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-text-muted)',
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          Aspire Academy Members
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or genre..."
        style={{
          width: '100%',
          maxWidth: 360,
          padding: '8px 12px',
          fontSize: 14,
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          marginBottom: 16,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Genre filter chips */}
      {allGenres.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 24,
          }}
        >
          <GenreChip
            genre="All"
            active={genreFilter === null}
            onClick={() => setGenreFilter(null)}
          />
          {allGenres.map((g) => (
            <GenreChip
              key={g}
              genre={g}
              active={genreFilter === g}
              onClick={() => setGenreFilter(g)}
            />
          ))}
        </div>
      )}

      {/* Member grid or empty state */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-secondary)',
            fontSize: 14,
          }}
        >
          {profiles.length === 0
            ? 'No members yet. The directory is populated when members set up their community profile.'
            : 'No members match your search.'}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((profile) => (
            <MemberCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  )
}
