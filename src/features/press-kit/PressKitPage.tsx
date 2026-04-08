// =============================================================================
// Aspire AMS — PressKitPage
// Single-document editor for the artist's electronic press kit.
// =============================================================================

import { useState, useEffect } from 'react'
import { usePressKit } from '@/hooks/usePressKit'
import type { PressKitFormData } from '@/hooks/usePressKit'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'

export function PressKitPage() {
  const { pressKit, isLoading, savePressKit } = usePressKit()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<PressKitFormData>({
    bio: '',
    epkUrl: '',
    prLinksRaw: '',
    pressPhotoUrlsRaw: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync form data when pressKit loads or changes
  useEffect(() => {
    if (pressKit) {
      setFormData({
        bio: pressKit.bio ?? '',
        epkUrl: pressKit.epkUrl ?? '',
        prLinksRaw: (pressKit.prLinks ?? []).join(', '),
        pressPhotoUrlsRaw: (pressKit.pressPhotoUrls ?? []).join(', '),
      })
    }
  }, [pressKit])

  const handleEdit = () => setIsEditing(true)

  const handleCancel = () => {
    if (pressKit) {
      setFormData({
        bio: pressKit.bio ?? '',
        epkUrl: pressKit.epkUrl ?? '',
        prLinksRaw: (pressKit.prLinks ?? []).join(', '),
        pressPhotoUrlsRaw: (pressKit.pressPhotoUrls ?? []).join(', '),
      })
    }
    setIsEditing(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await savePressKit(formData)
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle = {
    background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', padding: '8px 12px',
    width: '100%', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    fontSize: 11, fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em',
    color: 'var(--color-text-secondary)' as string, display: 'block' as const, marginBottom: 4,
  }
  const sectionLabelStyle = {
    fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700 as const, textTransform: 'uppercase' as const,
    letterSpacing: '0.07em', color: 'var(--color-text-secondary)', marginBottom: 8,
  }

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>Press Kit</h1>
        {!isEditing ? (
          <Button variant="primary" onClick={handleEdit}>Edit</Button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={handleCancel} type="button">Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* No data CTA */}
      {!pressKit && !isEditing && (
        <div style={{
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
          padding: '48px 32px', textAlign: 'center', color: 'var(--color-text-secondary)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>Set up your Press Kit</p>
          <p style={{ margin: '8px 0 20px', fontSize: 13 }}>Add your bio, EPK link, press photos and PR links.</p>
          <Button variant="primary" onClick={handleEdit}>Get Started</Button>
        </div>
      )}

      {/* Edit mode */}
      {isEditing && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 140 }}
              rows={6}
              placeholder="Artist bio..."
              autoFocus
            />
          </div>
          <div>
            <label style={labelStyle}>EPK URL</label>
            <input
              type="url"
              value={formData.epkUrl}
              onChange={(e) => setFormData((f) => ({ ...f, epkUrl: e.target.value }))}
              style={inputStyle}
              placeholder="https://..."
            />
          </div>
          <div>
            <label style={labelStyle}>Press Photo URLs</label>
            <textarea
              value={formData.pressPhotoUrlsRaw}
              onChange={(e) => setFormData((f) => ({ ...f, pressPhotoUrlsRaw: e.target.value }))}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              rows={3}
              placeholder="https://photo1.com, https://photo2.com"
            />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>Comma-separated URLs</span>
          </div>
          <div>
            <label style={labelStyle}>PR Links</label>
            <textarea
              value={formData.prLinksRaw}
              onChange={(e) => setFormData((f) => ({ ...f, prLinksRaw: e.target.value }))}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              rows={3}
              placeholder="https://article1.com, https://article2.com"
            />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>Comma-separated URLs</span>
          </div>
        </form>
      )}

      {/* View mode */}
      {pressKit && !isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Bio */}
          <div>
            <p style={sectionLabelStyle}>Bio</p>
            <div style={{
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
              padding: '14px 16px', fontSize: 14, lineHeight: 1.7,
              color: pressKit.bio ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              whiteSpace: 'pre-wrap',
            }}>
              {pressKit.bio || 'No bio set.'}
            </div>
          </div>

          {/* EPK URL */}
          <div>
            <p style={sectionLabelStyle}>EPK URL</p>
            {pressKit.epkUrl ? (
              <a
                href={pressKit.epkUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', fontSize: 11, color: 'var(--color-primary)', textDecoration: 'none',
                  border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)',
                  padding: '4px 12px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
                }}
              >OPEN EPK ↗</a>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Not set</span>
            )}
          </div>

          {/* Press Photos */}
          <div>
            <p style={sectionLabelStyle}>Press Photos</p>
            {pressKit.pressPhotoUrls && pressKit.pressPhotoUrls.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pressKit.pressPhotoUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none',
                      fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', display: 'block',
                    }}
                  >{url}</a>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No press photos yet.</span>
            )}
          </div>

          {/* PR Links */}
          <div>
            <p style={sectionLabelStyle}>PR Links</p>
            {pressKit.prLinks && pressKit.prLinks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pressKit.prLinks.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none',
                      fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', display: 'block',
                    }}
                  >{url}</a>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No PR links yet.</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
