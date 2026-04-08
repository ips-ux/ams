// =============================================================================
// Aspire AMS — FeedbackPage
// Peer feedback requests. View incoming/outgoing + send new requests.
// =============================================================================

import { useState, useEffect } from 'react'
import { where } from 'firebase/firestore'
import {
  feedbackCollection,
  communityCollection,
  onDocumentsSnapshot,
  addDocument,
  updateDocument,
} from '@/lib/firebase/helpers'
import { useAuthStore } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { ProtocolCallout } from '@/components/ui/ProtocolCallout'
import { Spinner } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import type { BaseDocument } from '@/types/models'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FeedbackRequest extends BaseDocument {
  fromUserId: string
  toUserId: string
  fromArtistName: string
  toArtistName: string
  trackTitle: string
  message: string
  status: 'pending' | 'in-progress' | 'completed'
}

interface CommunityMember {
  id: string
  userId: string
  artistName: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<FeedbackRequest['status'], string> = {
  pending:     'var(--color-text-secondary)',
  'in-progress': 'var(--color-primary)',
  completed:   'var(--color-success)',
}

function StatusBadge({ status }: { status: FeedbackRequest['status'] }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      border: `1px solid ${STATUS_COLOR[status]}`,
      borderRadius: 'var(--radius-sm)', padding: '2px 6px',
      color: STATUS_COLOR[status],
    }}>
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// FeedbackPage
// ---------------------------------------------------------------------------

export function FeedbackPage() {
  const user = useAuthStore((s) => s.user)
  const { projects } = useProjects()

  const [requests, setRequests] = useState<FeedbackRequest[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState<'sent' | 'received'>('received')

  // Form state
  const [toUserId, setToUserId] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setIsLoading(false); return }
    const unsub = onDocumentsSnapshot<FeedbackRequest>(
      feedbackCollection,
      (docs) => {
        const relevant = docs.filter(
          (d) => d.fromUserId === user.uid || d.toUserId === user.uid,
        )
        setRequests(relevant)
        setIsLoading(false)
      },
      [where('fromUserId', '==', user.uid)],
    )
    return unsub
  }, [user])

  useEffect(() => {
    const unsub = onDocumentsSnapshot<CommunityMember>(
      communityCollection,
      (docs) => setMembers(docs),
    )
    return unsub
  }, [])

  const otherMembers = members.filter((m) => m.userId !== user?.uid)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !toUserId || !trackTitle.trim()) return
    setSendError(null)
    setIsSending(true)

    const recipient = otherMembers.find((m) => m.userId === toUserId)
    const myName = user.displayName ?? user.email

    try {
      await addDocument<FeedbackRequest>(feedbackCollection, {
        fromUserId: user.uid,
        toUserId,
        fromArtistName: myName ?? 'Unknown',
        toArtistName: recipient?.artistName ?? 'Unknown',
        trackTitle: trackTitle.trim(),
        message: message.trim(),
        status: 'pending',
      })
      setShowForm(false)
      setToUserId('')
      setTrackTitle('')
      setMessage('')
    } catch {
      setSendError('Failed to send request. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const markComplete = async (id: string) => {
    await updateDocument(feedbackCollection, id, { status: 'completed' })
  }

  const markInProgress = async (id: string) => {
    await updateDocument(feedbackCollection, id, { status: 'in-progress' })
  }

  if (isLoading) {
    return (
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  const sent     = requests.filter((r) => r.fromUserId === user?.uid)
  const received = requests.filter((r) => r.toUserId   === user?.uid)
  const displayed = tab === 'sent' ? sent : received

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', padding: '8px 12px',
    width: '100%', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  return (
    <div style={{ padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            Peer Feedback
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Submit mixes for peer review from Aspire Academy artists.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Request Feedback'}
        </Button>
      </div>

      {/* Send form */}
      {showForm && (
        <div style={{
          border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-sm)',
          padding: 20, marginBottom: 20, background: 'var(--color-surface)',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            New Feedback Request
          </h3>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                  Send To *
                </label>
                <select
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                  required
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select an artist…</option>
                  {otherMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.artistName}</option>
                  ))}
                </select>
                {otherMembers.length === 0 && (
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    No other members in the directory yet.
                  </span>
                )}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                  Track / Project *
                </label>
                {projects.length > 0 ? (
                  <select
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Select a project…</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.title}>{p.title}</option>
                    ))}
                    <option value="__custom__">Type custom name…</option>
                  </select>
                ) : (
                  <input
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="Track or mix title"
                    required
                    style={inputStyle}
                  />
                )}
              </div>
            </div>

            {trackTitle === '__custom__' && (
              <input
                value={''}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Enter track title"
                required
                style={inputStyle}
                autoFocus
              />
            )}

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What specific areas would you like feedback on?"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              />
            </div>

            {sendError && <span style={{ fontSize: 12, color: 'var(--color-danger)' }}>{sendError}</span>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSending || !toUserId || !trackTitle}>
                {isSending ? 'Sending…' : 'Send Request'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <ProtocolCallout variant="info">
        Peer feedback helps you develop your ear and improve your mixes. Be specific in your requests.
      </ProtocolCallout>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', margin: '16px 0' }}>
        {(['received', 'sent'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '7px 16px',
              fontSize: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em',
              color: tab === t ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t} ({t === 'sent' ? sent.length : received.length})
          </button>
        ))}
      </div>

      {/* Request list */}
      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-secondary)', fontSize: 14 }}>
          No {tab} feedback requests yet.
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                {['Track', tab === 'sent' ? 'To' : 'From', 'Message', 'Status', ''].map((col) => (
                  <th key={col} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((req, i) => (
                <tr key={req.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <td style={{ padding: '10px 14px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {req.trackTitle}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                    {tab === 'sent' ? req.toArtistName : req.fromArtistName}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--color-text-muted)', fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {req.message || '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status={req.status} />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {tab === 'received' && req.status !== 'completed' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {req.status === 'pending' && (
                          <button
                            onClick={() => markInProgress(req.id)}
                            style={{
                              background: 'none', border: '1px solid var(--color-border)',
                              cursor: 'pointer', padding: '3px 8px', fontSize: 10,
                              fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            Start
                          </button>
                        )}
                        <button
                          onClick={() => markComplete(req.id)}
                          style={{
                            background: 'none', border: '1px solid var(--color-success)',
                            cursor: 'pointer', padding: '3px 8px', fontSize: 10,
                            fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-success)',
                          }}
                        >
                          ✓ Done
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
