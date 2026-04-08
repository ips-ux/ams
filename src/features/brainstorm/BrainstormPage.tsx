// =============================================================================
// Aspire AMS — BrainstormPage
// Content idea tracker with status filtering and scored ideas.
// =============================================================================

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContentIdeas } from '@/hooks/useContentIdeas'
import { contentIdeaSchema } from '@/lib/validators/schemas'
import type { ContentIdeaFormData } from '@/lib/validators/schemas'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { SOCIAL_PLATFORMS, CONTENT_STATUSES } from '@/types/enums'
import type { ContentStatus, SocialPlatform } from '@/types/enums'
import type { ContentIdea } from '@/types/models'

const PLATFORM_LABELS: Record<string, string> = {
  soundcloud: 'SC',
  tiktok: 'TT',
  instagram: 'IG',
  snapchat: 'SNAP',
  youtube: 'YT',
  facebook: 'FB',
  spotify: 'SPT',
  'apple-music': 'AM',
  twitter: 'TW',
}

const STATUS_COLORS: Record<ContentStatus, string> = {
  'idea': 'var(--color-primary)',
  'planned': 'var(--color-stage-expand)',
  'in-progress': 'var(--color-stage-spark)',
  'published': 'var(--color-stage-complete)',
  'archived': 'var(--color-text-muted)',
}

function scoreColor(score: number): string {
  if (score <= 2) return 'var(--color-danger)'
  if (score === 3) return 'var(--color-primary)'
  return 'var(--color-stage-complete)'
}

export function BrainstormPage() {
  const { ideas, isLoading, addIdea, updateIdea, deleteIdea } = useContentIdeas()
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null)

  const filtered = ideas.filter(
    (i) => statusFilter === 'all' || i.status === statusFilter,
  )

  const openAdd = () => { setEditingIdea(null); setIsDrawerOpen(true) }
  const openEdit = (idea: ContentIdea) => { setEditingIdea(idea); setIsDrawerOpen(true) }
  const closeDrawer = () => { setIsDrawerOpen(false); setEditingIdea(null) }

  const handleSave = async (data: ContentIdeaFormData) => {
    if (editingIdea) {
      await updateIdea(editingIdea.id, {
        title: data.title,
        type: data.type,
        platforms: data.platforms,
        status: data.status,
        caption: data.caption ?? '',
        valueScore: data.valueScore,
        effortScore: data.effortScore,
        alignmentScore: data.alignmentScore,
      })
    } else {
      await addIdea(data)
    }
    closeDrawer()
  }

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>Brainstorm</h1>
          <span style={{
            fontSize: 11, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', padding: '2px 8px', color: 'var(--color-text-secondary)',
          }}>{ideas.length}</span>
        </div>
        <Button variant="primary" onClick={openAdd}>+ Add Idea</Button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
        {(['all', ...CONTENT_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s as ContentStatus | 'all')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '7px 14px',
              fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', textTransform: 'uppercase',
              color: statusFilter === s ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: statusFilter === s ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >{s === 'all' ? 'ALL' : s}</button>
        ))}
      </div>

      {/* Idea list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💡</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No ideas yet</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>Track content ideas and score them here.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {filtered.map((idea, i) => (
            <IdeaRow
              key={idea.id}
              idea={idea}
              isLast={i === filtered.length - 1}
              onEdit={openEdit}
              onDelete={deleteIdea}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <>
          <div onClick={closeDrawer} style={{
            position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-bg) 50%, transparent)', zIndex: 40,
          }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: 'var(--color-surface)',
            borderLeft: '2px solid var(--color-border-strong)', zIndex: 50, display: 'flex', flexDirection: 'column',
          }}>
            <IdeaForm
              idea={editingIdea}
              onClose={closeDrawer}
              onSave={handleSave}
            />
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

interface IdeaRowProps {
  idea: ContentIdea
  isLast: boolean
  onEdit: (idea: ContentIdea) => void
  onDelete: (id: string) => void
}

function IdeaRow({ idea, isLast, onEdit, onDelete }: IdeaRowProps) {
  const [hovered, setHovered] = useState(false)
  const visiblePlatforms = idea.platforms.slice(0, 3)
  const extraCount = idea.platforms.length - 3

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
        background: hovered ? 'color-mix(in srgb, var(--color-primary) 3%, transparent)' : 'transparent',
      }}
    >
      {/* Status badge */}
      <span style={{
        fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: 'var(--radius-sm)',
        color: STATUS_COLORS[idea.status], border: `1px solid ${STATUS_COLORS[idea.status]}`,
        textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
      }}>{idea.status}</span>

      {/* Title */}
      <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {idea.title}
      </span>

      {/* Type chip */}
      {idea.type && (
        <span style={{
          fontSize: 9, fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
          textTransform: 'uppercase', flexShrink: 0,
        }}>{idea.type}</span>
      )}

      {/* Platform badges */}
      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
        {visiblePlatforms.map((p) => (
          <span key={p} style={{
            fontSize: 9, fontFamily: 'var(--font-mono)', padding: '1px 4px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
          }}>{PLATFORM_LABELS[p] ?? p}</span>
        ))}
        {extraCount > 0 && (
          <span style={{
            fontSize: 9, fontFamily: 'var(--font-mono)', padding: '1px 4px',
            color: 'var(--color-text-muted)',
          }}>+{extraCount}</span>
        )}
      </div>

      {/* Scores */}
      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', flexShrink: 0, display: 'flex', gap: 4 }}>
        <span style={{ color: scoreColor(idea.valueScore) }}>V:{idea.valueScore}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>·</span>
        <span style={{ color: scoreColor(idea.effortScore) }}>E:{idea.effortScore}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>·</span>
        <span style={{ color: scoreColor(idea.alignmentScore) }}>A:{idea.alignmentScore}</span>
      </span>

      {/* Actions */}
      <button onClick={() => onEdit(idea)} style={{
        background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '4px 6px',
        color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)',
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M10 2l2 2-7 7H3v-2L10 2z" />
        </svg>
      </button>
      <button onClick={() => onDelete(idea.id)} style={{
        background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '4px 6px',
        color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)',
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M2 4h10M5 4V2h4v2M5.5 6.5v4M8.5 6.5v4M3 4l.8 8h6.4L11 4" />
        </svg>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------

interface IdeaFormProps {
  idea: ContentIdea | null
  onClose: () => void
  onSave: (data: ContentIdeaFormData) => Promise<void>
}

function IdeaForm({ idea, onClose, onSave }: IdeaFormProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<ContentIdeaFormData>({
    resolver: zodResolver(contentIdeaSchema),
    defaultValues: idea
      ? {
          title: idea.title,
          type: idea.type,
          platforms: idea.platforms,
          status: idea.status,
          caption: idea.caption,
          valueScore: idea.valueScore,
          effortScore: idea.effortScore,
          alignmentScore: idea.alignmentScore,
        }
      : {
          title: '',
          type: '',
          platforms: [],
          status: 'idea',
          caption: '',
          valueScore: 3,
          effortScore: 3,
          alignmentScore: 3,
        },
  })

  const selectedPlatforms = watch('platforms') as SocialPlatform[]
  const valueScore = watch('valueScore')
  const effortScore = watch('effortScore')
  const alignmentScore = watch('alignmentScore')

  const togglePlatform = (platform: SocialPlatform) => {
    const current = selectedPlatforms ?? []
    if (current.includes(platform)) {
      setValue('platforms', current.filter((p) => p !== platform), { shouldValidate: true })
    } else {
      setValue('platforms', [...current, platform], { shouldValidate: true })
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

  const ScoreSelector = ({ field, label }: { field: 'valueScore' | 'effortScore' | 'alignmentScore'; label: string }) => {
    const currentVal = field === 'valueScore' ? valueScore : field === 'effortScore' ? effortScore : alignmentScore
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setValue(field, n, { shouldValidate: true })}
              style={{
                flex: 1, padding: '6px 0', fontSize: 13, fontFamily: 'var(--font-mono)',
                fontWeight: currentVal === n ? 700 : 400,
                background: currentVal === n ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                color: currentVal === n ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                border: `1px solid ${currentVal === n ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              }}
            >{n}</button>
          ))}
        </div>
        {errors[field] && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{String(errors[field]?.message ?? '')}</span>}
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {idea ? 'Edit Idea' : 'Add Idea'}
        </h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-text-muted)', lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>
      <form onSubmit={handleSubmit(onSave)} style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input {...register('title')} style={inputStyle} placeholder="Idea title" autoFocus />
          {errors.title && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{errors.title.message}</span>}
        </div>

        <div>
          <label style={labelStyle}>Content Type *</label>
          <input {...register('type')} style={inputStyle} placeholder="e.g. Reel, Story, YouTube Short" />
          {errors.type && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{errors.type.message}</span>}
        </div>

        <div>
          <label style={labelStyle}>Platforms *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SOCIAL_PLATFORMS.map((p) => {
              const selected = selectedPlatforms?.includes(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  style={{
                    padding: '4px 10px', fontSize: 10, fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                    background: selected ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                    color: selected ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                    border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                  }}
                >{p}</button>
              )
            })}
          </div>
          {errors.platforms && <span style={{ fontSize: 11, color: 'var(--color-danger)', display: 'block', marginTop: 4 }}>{errors.platforms.message}</span>}
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <select {...field} style={{ ...inputStyle, cursor: 'pointer' }}>
                {CONTENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          />
        </div>

        <div>
          <label style={labelStyle}>Caption</label>
          <textarea
            {...register('caption')}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
            rows={3}
            placeholder="Post caption or concept..."
          />
        </div>

        <ScoreSelector field="valueScore" label="Value Score (1–5)" />
        <ScoreSelector field="effortScore" label="Effort Score (1–5)" />
        <ScoreSelector field="alignmentScore" label="Alignment Score (1–5)" />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {idea ? 'Save Changes' : 'Add Idea'}
          </Button>
        </div>
      </form>
    </>
  )
}
