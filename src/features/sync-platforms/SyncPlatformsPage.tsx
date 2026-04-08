// =============================================================================
// Aspire AMS — SyncPlatformsPage
// List view for sync licensing platforms with drawer form and stats.
// Self-contained: drawer form is inline (no separate component file).
// =============================================================================

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Spinner, Button, Input, Textarea } from '@/components/ui'
import { useSyncPlatforms } from '@/hooks/useSyncPlatforms'
import { syncPlatformSchema } from '@/lib/validators/schemas'
import type { SyncPlatform } from '@/types/models'
import type { SyncPlatformFormData } from '@/lib/validators/schemas'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url
  return url.slice(0, maxLen) + '…'
}

function truncateText(text: string, maxLen = 80): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '…'
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
// PlatformRow
// ---------------------------------------------------------------------------

function PlatformRow({
  platform,
  onEdit,
  onDelete,
}: {
  platform: SyncPlatform
  onEdit: (p: SyncPlatform) => void
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

        {/* Contact info */}
        {platform.contactInfo && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginBottom: 2,
            }}
          >
            {platform.contactInfo}
          </div>
        )}

        {/* Notes preview */}
        {platform.notes && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-muted)',
              marginTop: 2,
            }}
          >
            {truncateText(platform.notes)}
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
// DrawerForm — inline
// ---------------------------------------------------------------------------

interface DrawerFormProps {
  platform: SyncPlatform | null
  onClose: () => void
  onSave: (data: SyncPlatformFormData) => Promise<void>
}

function DrawerForm({ platform, onClose, onSave }: DrawerFormProps) {
  const isEdit = platform != null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SyncPlatformFormData>({
    resolver: zodResolver(syncPlatformSchema),
    defaultValues: {
      name: '',
      url: '',
      contactInfo: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (platform) {
      reset({
        name: platform.name,
        url: platform.url,
        contactInfo: platform.contactInfo ?? '',
        notes: platform.notes ?? '',
      })
    } else {
      reset({
        name: '',
        url: '',
        contactInfo: '',
        notes: '',
      })
    }
  }, [platform, reset])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const onSubmit = async (data: SyncPlatformFormData) => {
    await onSave(data)
  }

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
        aria-label={isEdit ? 'Edit Sync Platform' : 'Add Sync Platform'}
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
            {isEdit ? 'Edit Sync Platform' : 'Add Sync Platform'}
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
            placeholder="e.g. Musicbed"
            error={errors.name?.message}
            fullWidth
            autoFocus={!isEdit}
            {...register('name')}
          />

          {/* URL */}
          <Input
            label="URL *"
            type="url"
            placeholder="https://www.musicbed.com"
            error={errors.url?.message}
            fullWidth
            {...register('url')}
          />

          {/* Contact Info */}
          <Input
            label="Contact Info"
            placeholder="submissions@platform.com or contact name"
            error={errors.contactInfo?.message}
            fullWidth
            {...register('contactInfo')}
          />

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Licensing terms, submission process, rates..."
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
// SyncPlatformsPage
// ---------------------------------------------------------------------------

export function SyncPlatformsPage() {
  const {
    syncPlatforms,
    isLoading,
    error,
    addSyncPlatform,
    updateSyncPlatform,
    deleteSyncPlatform,
  } = useSyncPlatforms()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<SyncPlatform | null>(null)

  // Handlers
  const handleOpenAdd = () => {
    setEditingPlatform(null)
    setDrawerOpen(true)
  }

  const handleOpenEdit = (platform: SyncPlatform) => {
    setEditingPlatform(platform)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setEditingPlatform(null)
  }

  const handleSave = async (data: SyncPlatformFormData) => {
    if (editingPlatform) {
      await updateSyncPlatform(editingPlatform.id, {
        name: data.name,
        url: data.url,
        contactInfo: data.contactInfo ?? '',
        notes: data.notes ?? '',
      })
    } else {
      await addSyncPlatform(data)
    }
    handleCloseDrawer()
  }

  const handleDelete = async (id: string) => {
    await deleteSyncPlatform(id)
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
            Sync Platforms
          </h1>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            + Add Platform
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          padding: '0 20px 16px',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          flexShrink: 0,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <StatChip label="Total" count={syncPlatforms.length} />
      </div>

      {/* Platform list */}
      <div style={{ flex: 1 }}>
        {syncPlatforms.length === 0 ? (
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
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
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
              No sync platforms yet
            </p>
            <p
              style={{
                fontSize: 14,
                color: 'var(--color-text-muted)',
                margin: 0,
                maxWidth: 280,
              }}
            >
              Track sync licensing platforms like Musicbed, Artlist, and Epidemic Sound.
            </p>
            <Button variant="primary" size="md" onClick={handleOpenAdd}>
              + Add Platform
            </Button>
          </div>
        ) : (
          <div>
            {syncPlatforms.map((platform) => (
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
