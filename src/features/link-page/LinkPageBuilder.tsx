// =============================================================================
// Aspire AMS — LinkPageBuilder
// 2-column link-in-bio builder: link manager (left) + live phone preview (right).
// Drag-to-reorder via @dnd-kit. Stored as singleton doc in Firestore.
// =============================================================================

import { useState, useId } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLinkPage } from '@/hooks/useLinkPage'
import { linkItemSchema } from '@/lib/validators/schemas'
import type { LinkItemFormData } from '@/lib/validators/schemas'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/hooks/useAuth'
import type { LinkItem } from '@/types/models'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function LinkPageBuilder() {
  const { linkPage, isLoading, isSaving, saveLinks } = useLinkPage()
  const user = useAuthStore((s) => s.user)
  const dndId = useId()

  const [localLinks, setLocalLinks] = useState<LinkItem[] | null>(null)
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Use localLinks as working copy; fall back to Firestore data
  const links: LinkItem[] = localLinks ?? linkPage?.links ?? []

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = links.findIndex((l) => l.id === active.id)
    const newIndex = links.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({
      ...l,
      order: i,
    }))
    setLocalLinks(reordered)
  }

  const handleAddLink = async (data: LinkItemFormData) => {
    const newLink: LinkItem = {
      id: generateId(),
      title: data.title,
      url: data.url,
      emoji: data.emoji ?? '🔗',
      enabled: data.enabled ?? true,
      order: links.length,
    }
    const updated = [...links, newLink]
    setLocalLinks(updated)
    await saveLinks(updated)
    setIsAddingLink(false)
  }

  const handleEditLink = async (id: string, data: LinkItemFormData) => {
    const updated = links.map((l) =>
      l.id === id
        ? { ...l, title: data.title, url: data.url, emoji: data.emoji ?? l.emoji, enabled: data.enabled ?? l.enabled }
        : l,
    )
    setLocalLinks(updated)
    await saveLinks(updated)
    setEditingId(null)
  }

  const handleDeleteLink = async (id: string) => {
    const updated = links.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i }))
    setLocalLinks(updated)
    await saveLinks(updated)
  }

  const handleToggleEnabled = async (id: string) => {
    const updated = links.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    setLocalLinks(updated)
    await saveLinks(updated)
  }

  const handleSaveOrder = async () => {
    await saveLinks(links)
  }

  const handleCopyUrl = () => {
    const publicUrl = `${window.location.origin}/p/${user?.uid}`
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spinner />
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>Link Page</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Build your link-in-bio page for fans and industry contacts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCopyUrl}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', fontSize: 12, fontFamily: 'var(--font-mono)',
              background: copied ? 'var(--color-stage-complete)' : 'var(--color-surface-elevated)',
              color: copied ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          {localLinks && (
            <Button variant="primary" onClick={handleSaveOrder} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Order'}
            </Button>
          )}
        </div>
      </div>

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left: Link manager */}
        <div>
          {/* Link list */}
          {links.length === 0 && !isAddingLink ? (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-secondary)',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔗</div>
              <p style={{ margin: 0, fontWeight: 600 }}>No links yet</p>
              <p style={{ margin: '6px 0 16px', fontSize: 13 }}>Add your first link below.</p>
              <Button variant="primary" onClick={() => setIsAddingLink(true)}>+ Add Link</Button>
            </div>
          ) : (
            <DndContext
              id={dndId}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div style={{
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                }}>
                  {links.map((link, i) =>
                    editingId === link.id ? (
                      <LinkForm
                        key={link.id}
                        defaultValues={{ title: link.title, url: link.url, emoji: link.emoji, enabled: link.enabled }}
                        onSave={(data) => handleEditLink(link.id, data)}
                        onCancel={() => setEditingId(null)}
                        isLast={i === links.length - 1}
                        isSaving={isSaving}
                      />
                    ) : (
                      <SortableLinkRow
                        key={link.id}
                        link={link}
                        isLast={i === links.length - 1}
                        onEdit={() => setEditingId(link.id)}
                        onDelete={() => handleDeleteLink(link.id)}
                        onToggleEnabled={() => handleToggleEnabled(link.id)}
                      />
                    ),
                  )}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Add link form or button */}
          {isAddingLink ? (
            <div style={{
              marginTop: 12, border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', overflow: 'hidden',
            }}>
              <LinkForm
                onSave={handleAddLink}
                onCancel={() => setIsAddingLink(false)}
                isLast
                isSaving={isSaving}
              />
            </div>
          ) : links.length > 0 ? (
            <Button
              variant="ghost"
              onClick={() => setIsAddingLink(true)}
              style={{ marginTop: 10 }}
            >
              + Add Link
            </Button>
          ) : null}
        </div>

        {/* Right: Phone preview */}
        <PhonePreview links={links} pageTitle={linkPage?.pageTitle} bio={linkPage?.bio} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sortable row
// ---------------------------------------------------------------------------

interface SortableLinkRowProps {
  link: LinkItem
  isLast: boolean
  onEdit: () => void
  onDelete: () => void
  onToggleEnabled: () => void
}

function SortableLinkRow({ link, isLast, onEdit, onDelete, onToggleEnabled }: SortableLinkRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })
  const [hovered, setHovered] = useState(false)

  const style: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
    background: isDragging
      ? 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))'
      : hovered
      ? 'color-mix(in srgb, var(--color-primary) 3%, transparent)'
      : 'transparent',
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: link.enabled ? 1 : 0.45,
    cursor: 'default',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle */}
      <span
        {...attributes}
        {...listeners}
        style={{ color: 'var(--color-text-muted)', cursor: 'grab', fontSize: 14, flexShrink: 0 }}
        title="Drag to reorder"
      >
        ⠿
      </span>

      {/* Emoji */}
      <span style={{ fontSize: 18, flexShrink: 0 }}>{link.emoji}</span>

      {/* Title + URL */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {link.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {link.url}
        </div>
      </div>

      {/* Toggle enabled */}
      <button
        onClick={onToggleEnabled}
        title={link.enabled ? 'Hide link' : 'Show link'}
        style={{
          background: link.enabled ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)', borderRadius: 99,
          cursor: 'pointer', padding: '2px 8px', fontSize: 10,
          color: link.enabled ? 'var(--color-bg)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {link.enabled ? 'ON' : 'OFF'}
      </button>

      {/* Edit */}
      <button
        onClick={onEdit}
        style={{ background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '4px 6px', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M10 2l2 2-7 7H3v-2L10 2z" />
        </svg>
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{ background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '4px 6px', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M2 4h10M5 4V2h4v2M5.5 6.5v4M8.5 6.5v4M3 4l.8 8h6.4L11 4" />
        </svg>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Link form (shared for add and edit)
// ---------------------------------------------------------------------------

interface LinkFormProps {
  defaultValues?: Partial<LinkItemFormData>
  onSave: (data: LinkItemFormData) => Promise<void>
  onCancel: () => void
  isLast: boolean
  isSaving: boolean
}

function LinkForm({ defaultValues, onSave, onCancel, isSaving }: LinkFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LinkItemFormData>({
    resolver: zodResolver(linkItemSchema),
    defaultValues: { title: '', url: '', emoji: '🔗', enabled: true, ...defaultValues },
  })

  const inputStyle = {
    background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', padding: '7px 10px',
    fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const,
  }

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--color-surface-elevated)' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8 }}>
        <div>
          <input {...register('emoji')} style={{ ...inputStyle, textAlign: 'center', fontSize: 18 }} placeholder="🔗" maxLength={2} />
        </div>
        <div>
          <input {...register('title')} style={inputStyle} placeholder="Link title" autoFocus />
          {errors.title && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{errors.title.message}</span>}
        </div>
      </div>
      <div>
        <input {...register('url')} style={inputStyle} placeholder="https://..." />
        {errors.url && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{errors.url.message}</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
        <Button variant="ghost" type="button" onClick={onCancel} style={{ fontSize: 12 }}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={isSubmitting || isSaving} style={{ fontSize: 12 }}>
          {isSubmitting || isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Phone preview
// ---------------------------------------------------------------------------

interface PhonePreviewProps {
  links: LinkItem[]
  pageTitle?: string
  bio?: string
}

function PhonePreview({ links, pageTitle, bio }: PhonePreviewProps) {
  const enabledLinks = links.filter((l) => l.enabled)

  return (
    <div style={{
      position: 'sticky', top: 80,
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
    }}>
      {/* Mini label */}
      <div style={{
        padding: '8px 14px', fontSize: 10, fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        Live Preview
      </div>

      {/* Phone frame */}
      <div style={{
        margin: '16px auto', width: 220,
        background: 'var(--color-bg)',
        border: '3px solid var(--color-border-strong)',
        borderRadius: 28, overflow: 'hidden',
        boxShadow: '0 8px 32px color-mix(in srgb, var(--color-bg) 60%, transparent)',
        minHeight: 380,
      }}>
        {/* Notch */}
        <div style={{ height: 24, background: 'var(--color-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 60, height: 8, background: 'var(--color-bg)', borderRadius: 4 }} />
        </div>

        {/* Page content */}
        <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minHeight: 340 }}>
          {/* Avatar placeholder */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: 'var(--color-bg)', fontWeight: 800,
          }}>
            A
          </div>

          {/* Page title */}
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', textAlign: 'center' }}>
            {pageTitle || 'Your Name'}
          </div>

          {/* Bio */}
          {bio && (
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.4 }}>
              {bio}
            </div>
          )}

          {/* Links */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {enabledLinks.length === 0 ? (
              <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--color-text-muted)', padding: '12px 0' }}>
                No links yet
              </div>
            ) : (
              enabledLinks.map((link) => (
                <div
                  key={link.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)',
                  }}
                >
                  <span>{link.emoji}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {link.title}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
