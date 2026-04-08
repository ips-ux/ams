// =============================================================================
// Aspire AMS — PlaylistsPage
// Playlist tracker across streaming platforms.
// =============================================================================

import { useState } from 'react'
import { usePlaylists } from '@/hooks/usePlaylists'
import type { PlaylistFormData } from '@/hooks/usePlaylists'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { SOCIAL_PLATFORMS } from '@/types/enums'
import type { Playlist } from '@/types/models'

const PLATFORM_LABELS: Record<string, string> = {
  spotify: 'SPOTIFY',
  soundcloud: 'SOUNDCLOUD',
  'apple-music': 'APPLE MUSIC',
  youtube: 'YOUTUBE',
  tiktok: 'TIKTOK',
  instagram: 'INSTAGRAM',
  facebook: 'FACEBOOK',
  snapchat: 'SNAPCHAT',
  twitter: 'TWITTER',
}

export function PlaylistsPage() {
  const { playlists, isLoading, addPlaylist, deletePlaylist } = usePlaylists()
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const usedPlatforms = [...new Set(playlists.map((p) => p.platform))]

  const filtered = playlists.filter(
    (p) => platformFilter === 'all' || p.platform === platformFilter,
  )

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>Playlists</h1>
          <span style={{
            fontSize: 11, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', padding: '2px 8px', color: 'var(--color-text-secondary)',
          }}>{playlists.length} total</span>
        </div>
        <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>+ Add Playlist</Button>
      </div>

      {/* Platform filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setPlatformFilter('all')}
          style={{
            background: platformFilter === 'all' ? 'var(--color-surface-elevated)' : 'none',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            padding: '4px 12px', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em',
            color: 'var(--color-text-secondary)', textTransform: 'uppercase',
          }}
        >ALL</button>
        {usedPlatforms.map((plat) => (
          <button
            key={plat}
            onClick={() => setPlatformFilter(plat)}
            style={{
              background: platformFilter === plat ? 'var(--color-surface-elevated)' : 'none',
              border: `1px solid ${platformFilter === plat ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: '4px 12px',
              fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em',
              color: platformFilter === plat ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              textTransform: 'uppercase',
            }}
          >{PLATFORM_LABELS[plat] ?? plat}</button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎧</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No playlists yet</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>Track playlists your music has been added to.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {filtered.map((pl, i) => (
            <PlaylistRow
              key={pl.id}
              playlist={pl}
              isLast={i === filtered.length - 1}
              onDelete={deletePlaylist}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <>
          <div onClick={() => setIsDrawerOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-bg) 50%, transparent)', zIndex: 40,
          }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: 'var(--color-surface)',
            borderLeft: '2px solid var(--color-border-strong)', zIndex: 50, display: 'flex', flexDirection: 'column',
          }}>
            <PlaylistForm
              onClose={() => setIsDrawerOpen(false)}
              onSave={async (data) => { await addPlaylist(data); setIsDrawerOpen(false) }}
            />
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

interface PlaylistRowProps {
  playlist: Playlist
  isLast: boolean
  onDelete: (id: string) => void
}

function PlaylistRow({ playlist, isLast, onDelete }: PlaylistRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
        background: hovered ? 'color-mix(in srgb, var(--color-primary) 3%, transparent)' : 'transparent',
      }}
    >
      <span style={{
        fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 'var(--radius-sm)',
        color: 'var(--color-primary)', border: '1px solid var(--color-primary)',
        textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
      }}>{PLATFORM_LABELS[playlist.platform] ?? playlist.platform}</span>
      <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {playlist.name}
      </span>
      {playlist.trackNames.length > 0 && (
        <span style={{
          fontSize: 10, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)', padding: '1px 6px', color: 'var(--color-text-secondary)', flexShrink: 0,
        }}>{playlist.trackNames.length} tracks</span>
      )}
      <a href={playlist.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{
        fontSize: 11, color: 'var(--color-primary)', textDecoration: 'none',
        border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)',
        padding: '2px 8px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em', flexShrink: 0,
      }}>OPEN ↗</a>
      <button onClick={() => onDelete(playlist.id)} style={{
        background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '4px 6px',
        color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)',
      }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M2 4h10M5 4V2h4v2M5.5 6.5v4M8.5 6.5v4M3 4l.8 8h6.4L11 4" />
        </svg>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------

interface PlaylistFormProps {
  onClose: () => void
  onSave: (data: PlaylistFormData) => Promise<void>
}

function PlaylistForm({ onClose, onSave }: PlaylistFormProps) {
  const [formData, setFormData] = useState<PlaylistFormData>({ name: '', platform: 'spotify', url: '', trackNamesRaw: '', notes: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof PlaylistFormData, string>>>({})

  const validate = () => {
    const e: Partial<Record<keyof PlaylistFormData, string>> = {}
    if (!formData.name.trim()) e.name = 'Name is required'
    if (!formData.url.trim()) e.url = 'URL is required'
    else {
      try { new URL(formData.url) } catch { e.url = 'Invalid URL' }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try { await onSave(formData) } finally { setIsSubmitting(false) }
  }

  const inputStyle = {
    background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', padding: '8px 12px',
    width: '100%', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em',
    color: 'var(--color-text-secondary)' as string, display: 'block' as const, marginBottom: 4,
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Add Playlist</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-text-muted)', lineHeight: 1 }}>×</button>
      </div>
      <form onSubmit={handleSubmit} style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        <div>
          <label style={labelStyle}>Name *</label>
          <input value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Playlist name" autoFocus />
          {errors.name && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{errors.name}</span>}
        </div>
        <div>
          <label style={labelStyle}>Platform *</label>
          <select value={formData.platform} onChange={(e) => setFormData((f) => ({ ...f, platform: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
            {SOCIAL_PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p] ?? p}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>URL *</label>
          <input type="url" value={formData.url} onChange={(e) => setFormData((f) => ({ ...f, url: e.target.value }))} style={inputStyle} placeholder="https://..." />
          {errors.url && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{errors.url}</span>}
        </div>
        <div>
          <label style={labelStyle}>Track Names</label>
          <input value={formData.trackNamesRaw ?? ''} onChange={(e) => setFormData((f) => ({ ...f, trackNamesRaw: e.target.value }))} style={inputStyle} placeholder="Comma-separated track names" />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea value={formData.notes ?? ''} onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} rows={3} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>Add Playlist</Button>
        </div>
      </form>
    </>
  )
}
