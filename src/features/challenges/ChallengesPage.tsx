// =============================================================================
// Aspire AMS — ChallengesPage
// Creative challenge tracker with status filtering and a side-drawer form.
// =============================================================================

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useChallenges } from '@/hooks/useChallenges'
import { challengeSchema } from '@/lib/validators/schemas'
import type { ChallengeFormData } from '@/lib/validators/schemas'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { CHALLENGE_TYPES, CHALLENGE_STATUSES } from '@/types/enums'
import type { ChallengeStatus } from '@/types/enums'
import type { Challenge } from '@/types/models'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  'time-limit':  'Time Limit',
  constraint:    'Constraint',
  collab:        'Collab',
  listening:     'Listening',
  'genre-surf':  'Genre Surf',
}

const TYPE_COLORS: Record<string, string> = {
  'time-limit':  'var(--color-stage-spark)',
  constraint:    'var(--color-stage-expand)',
  collab:        'var(--color-stage-arrange)',
  listening:     'var(--color-stage-elevate)',
  'genre-surf':  'var(--color-stage-finalize)',
}

const STATUS_COLORS: Record<ChallengeStatus, string> = {
  active:    'var(--color-primary)',
  completed: 'var(--color-stage-complete)',
  archived:  'var(--color-text-muted)',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ChallengesPage() {
  const { challenges, isLoading, addChallenge, updateChallenge, deleteChallenge, completeChallenge } =
    useChallenges()

  const [statusFilter, setStatusFilter] = useState<ChallengeStatus | 'all'>('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)

  const filtered = challenges.filter(
    (c) => statusFilter === 'all' || c.status === statusFilter,
  )

  const openAdd = () => { setEditingChallenge(null); setIsDrawerOpen(true) }
  const openEdit = (c: Challenge) => { setEditingChallenge(c); setIsDrawerOpen(true) }
  const closeDrawer = () => { setIsDrawerOpen(false); setEditingChallenge(null) }

  const handleSave = async (data: ChallengeFormData) => {
    if (editingChallenge) {
      await updateChallenge(editingChallenge.id, {
        title: data.title,
        type: data.type,
        status: data.status,
        notes: data.notes ?? '',
        completionNotes: data.completionNotes ?? '',
      })
    } else {
      await addChallenge(data)
    }
    closeDrawer()
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spinner />
      </div>
    )
  }

  // Counts per status for tab badges
  const counts = CHALLENGE_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = challenges.filter((c) => c.status === s).length
    return acc
  }, {})

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Challenges
          </h1>
          <span style={{
            fontSize: 11, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', padding: '2px 8px', color: 'var(--color-text-secondary)',
          }}>
            {challenges.length}
          </span>
        </div>
        <Button variant="primary" onClick={openAdd}>+ Add Challenge</Button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
        {(['all', ...CHALLENGE_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s as ChallengeStatus | 'all')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '7px 14px',
              fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', textTransform: 'uppercase',
              color: statusFilter === s ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: statusFilter === s ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {s === 'all' ? 'ALL' : s}
            {s !== 'all' && counts[s] > 0 && (
              <span style={{
                fontSize: 9, background: 'var(--color-surface-elevated)', padding: '1px 4px',
                borderRadius: 99, border: '1px solid var(--color-border)',
              }}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Challenge list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No challenges here</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>
            {statusFilter === 'all'
              ? 'Start a creative challenge to push your craft.'
              : `No ${statusFilter} challenges.`}
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {filtered.map((challenge, i) => (
            <ChallengeRow
              key={challenge.id}
              challenge={challenge}
              isLast={i === filtered.length - 1}
              onEdit={openEdit}
              onDelete={deleteChallenge}
              onComplete={completeChallenge}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <>
          <div
            onClick={closeDrawer}
            style={{
              position: 'fixed', inset: 0,
              background: 'color-mix(in srgb, var(--color-bg) 50%, transparent)',
              zIndex: 40,
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 440,
            background: 'var(--color-surface)',
            borderLeft: '2px solid var(--color-border-strong)',
            zIndex: 50, display: 'flex', flexDirection: 'column',
          }}>
            <ChallengeForm
              challenge={editingChallenge}
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
// Row
// ---------------------------------------------------------------------------

interface ChallengeRowProps {
  challenge: Challenge
  isLast: boolean
  onEdit: (c: Challenge) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
}

function ChallengeRow({ challenge, isLast, onEdit, onDelete, onComplete }: ChallengeRowProps) {
  const [hovered, setHovered] = useState(false)

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
      {/* Status dot */}
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: STATUS_COLORS[challenge.status],
      }} />

      {/* Title */}
      <span style={{
        flex: 1, fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        textDecoration: challenge.status === 'completed' ? 'line-through' : 'none',
        opacity: challenge.status === 'archived' ? 0.5 : 1,
      }}>
        {challenge.title}
      </span>

      {/* Type badge */}
      <span style={{
        fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 6px',
        borderRadius: 'var(--radius-sm)', flexShrink: 0, textTransform: 'uppercase',
        color: TYPE_COLORS[challenge.type] ?? 'var(--color-primary)',
        border: `1px solid ${TYPE_COLORS[challenge.type] ?? 'var(--color-primary)'}`,
      }}>
        {TYPE_LABELS[challenge.type] ?? challenge.type}
      </span>

      {/* Status badge */}
      <span style={{
        fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 6px',
        borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', flexShrink: 0,
        color: STATUS_COLORS[challenge.status],
        border: `1px solid ${STATUS_COLORS[challenge.status]}`,
      }}>
        {challenge.status}
      </span>

      {/* Quick complete — only in active */}
      {challenge.status === 'active' && (
        <button
          onClick={() => onComplete(challenge.id)}
          title="Mark complete"
          style={{
            background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer',
            padding: '3px 7px', color: 'var(--color-stage-complete)',
            borderRadius: 'var(--radius-sm)', fontSize: 11,
          }}
        >
          ✓
        </button>
      )}

      {/* Edit */}
      <button
        onClick={() => onEdit(challenge)}
        style={{
          background: 'none', border: '1px solid transparent', cursor: 'pointer',
          padding: '4px 6px', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M10 2l2 2-7 7H3v-2L10 2z" />
        </svg>
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(challenge.id)}
        style={{
          background: 'none', border: '1px solid transparent', cursor: 'pointer',
          padding: '4px 6px', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M2 4h10M5 4V2h4v2M5.5 6.5v4M8.5 6.5v4M3 4l.8 8h6.4L11 4" />
        </svg>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Form (side drawer)
// ---------------------------------------------------------------------------

interface ChallengeFormProps {
  challenge: Challenge | null
  onClose: () => void
  onSave: (data: ChallengeFormData) => Promise<void>
}

function ChallengeForm({ challenge, onClose, onSave }: ChallengeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: challenge
      ? {
          title: challenge.title,
          type: challenge.type,
          status: challenge.status,
          notes: challenge.notes,
          completionNotes: challenge.completionNotes,
        }
      : {
          title: '',
          type: 'time-limit',
          status: 'active',
          notes: '',
          completionNotes: '',
        },
  })

  const inputStyle = {
    background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', padding: '8px 12px',
    width: '100%', fontSize: 13, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    fontSize: 11, fontWeight: 600 as const, textTransform: 'uppercase' as const,
    letterSpacing: '0.05em', color: 'var(--color-text-secondary)' as string,
    display: 'block' as const, marginBottom: 4,
  }

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--color-border)',
      }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {challenge ? 'Edit Challenge' : 'Add Challenge'}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--color-text-muted)', lineHeight: 1, padding: '0 4px',
          }}
        >
          ×
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSave)}
        style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}
      >
        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input {...register('title')} style={inputStyle} placeholder="Challenge title" autoFocus />
          {errors.title && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{errors.title.message}</span>}
        </div>

        {/* Type */}
        <div>
          <label style={labelStyle}>Type *</label>
          <select {...register('type')} style={{ ...inputStyle, cursor: 'pointer' }}>
            {CHALLENGE_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
            ))}
          </select>
          {errors.type && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{errors.type.message}</span>}
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Status</label>
          <select {...register('status')} style={{ ...inputStyle, cursor: 'pointer' }}>
            {CHALLENGE_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            {...register('notes')}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
            rows={3}
            placeholder="Describe the challenge parameters..."
          />
        </div>

        {/* Completion Notes — only shown when editing */}
        {challenge && (
          <div>
            <label style={labelStyle}>Completion Notes</label>
            <textarea
              {...register('completionNotes')}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              rows={3}
              placeholder="What did you learn or create?"
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {challenge ? 'Save Changes' : 'Add Challenge'}
          </Button>
        </div>
      </form>
    </>
  )
}
