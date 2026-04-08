// =============================================================================
// Aspire AMS — TrackCard
// Read-only visual card for a released track in the Discography grid.
// Editing happens via Projects/Kanban, not here.
// =============================================================================

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/models'

// ---------------------------------------------------------------------------
// Streaming platform abbreviation map
// ---------------------------------------------------------------------------

const PLATFORM_ABBREV: Record<string, string> = {
  spotify: 'SPT',
  soundcloud: 'SC',
  'apple-music': 'APL',
  beatport: 'BP',
  bandcamp: 'BC',
  youtube: 'YT',
  tidal: 'TDL',
  deezer: 'DZR',
  amazon: 'AMZ',
  audiomack: 'AM',
}

function getPlatformAbbrev(key: string): string {
  return PLATFORM_ABBREV[key.toLowerCase()] ?? key.slice(0, 3).toUpperCase()
}

// ---------------------------------------------------------------------------
// ArtworkPlaceholder — geometric Bauhaus stand-in when no artwork is set
// ---------------------------------------------------------------------------

function ArtworkPlaceholder() {
  return (
    <div
      style={{
        width: '100%',
        height: 160,
        background: 'var(--color-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Music note SVG — geometric, no decorative curves */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MetaChip — small monospace pill for genre / key
// ---------------------------------------------------------------------------

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '2px 6px',
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// StreamingChip — linked anchor chip per streaming platform
// ---------------------------------------------------------------------------

function StreamingChip({ platform, url }: { platform: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '2px 6px',
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.4,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'color var(--transition-fast), border-color var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-primary)'
        e.currentTarget.style.borderColor = 'var(--color-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-text-secondary)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      {getPlatformAbbrev(platform)}
    </a>
  )
}

// ---------------------------------------------------------------------------
// TrackCard
// ---------------------------------------------------------------------------

interface TrackCardProps {
  project: Project
}

export function TrackCard({ project }: TrackCardProps) {
  const [infoHovered, setInfoHovered] = useState(false)

  const streamingEntries = Object.entries(project.streamingLinks)

  const formattedDate = project.releaseDate
    ? project.releaseDate
        .toDate()
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
    : null

  return (
    <div
      className={cn('track-card')}
      style={{
        width: '100%',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Artwork area */}
      {project.artworkUrl ? (
        <div style={{ height: 160, flexShrink: 0, overflow: 'hidden' }}>
          <img
            src={project.artworkUrl}
            alt={project.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      ) : (
        <ArtworkPlaceholder />
      )}

      {/* Info area */}
      <div
        onMouseEnter={() => setInfoHovered(true)}
        onMouseLeave={() => setInfoHovered(false)}
        style={{
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flex: 1,
          background: infoHovered
            ? 'color-mix(in srgb, var(--color-primary) 3%, var(--color-surface))'
            : 'var(--color-surface)',
          transition: 'background var(--transition-fast)',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
          title={project.title}
        >
          {project.title}
        </div>

        {/* Genre + Key chips */}
        {(project.genre || project.key) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {project.genre && <MetaChip>{project.genre}</MetaChip>}
            {project.key && <MetaChip>{project.key}</MetaChip>}
          </div>
        )}

        {/* Release date */}
        {formattedDate && (
          <div
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.04em',
            }}
          >
            {formattedDate}
          </div>
        )}

        {/* Streaming links */}
        {streamingEntries.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
            {streamingEntries.map(([platform, url]) => (
              <StreamingChip key={platform} platform={platform} url={url} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
