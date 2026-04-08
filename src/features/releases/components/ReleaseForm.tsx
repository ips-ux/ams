// =============================================================================
// Aspire AMS — ReleaseForm
// Drawer form for creating and editing a Release document.
// Uses react-hook-form + zodResolver against the canonical releaseSchema.
// =============================================================================

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, Button } from '@/components/ui'
import { releaseSchema } from '@/lib/validators/schemas'
import type { Release } from '@/types/models'
import type { ReleaseFormData } from '@/lib/validators/schemas'

interface ReleaseFormProps {
  release?: Release | null
  onClose: () => void
  onSave: (data: ReleaseFormData) => Promise<void>
}

export function ReleaseForm({ release, onClose, onSave }: ReleaseFormProps) {
  const isEdit = release != null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReleaseFormData>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      title: '',
      projectRef: '',
      releaseDate: '',
      distributionPlatform: '',
      isrc: '',
    },
  })

  // Populate form when editing an existing release
  useEffect(() => {
    if (release) {
      reset({
        title: release.title,
        projectRef: release.projectRef ?? '',
        releaseDate: release.releaseDate.toDate().toISOString().split('T')[0],
        distributionPlatform: release.distributionPlatform ?? '',
        isrc: release.isrc ?? '',
      })
    } else {
      reset({
        title: '',
        projectRef: '',
        releaseDate: '',
        distributionPlatform: '',
        isrc: '',
      })
    }
  }, [release, reset])

  const onSubmit = async (data: ReleaseFormData) => {
    await onSave(data)
  }

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'color-mix(in srgb, var(--color-bg) 40%, transparent)',
          zIndex: 40,
        }}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit Release' : 'Add Release'}
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
            {isEdit ? 'Edit Release' : 'Add Release'}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              lineHeight: 1,
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
          {/* Title */}
          <Input
            label="Release Title *"
            placeholder="e.g. Midnight Echoes"
            error={errors.title?.message}
            fullWidth
            autoFocus={!isEdit}
            {...register('title')}
          />

          {/* Release Date */}
          <Input
            label="Release Date *"
            type="date"
            error={errors.releaseDate?.message}
            fullWidth
            {...register('releaseDate')}
          />

          {/* Project Ref */}
          <Input
            label="Project ID"
            placeholder="Project ID"
            error={errors.projectRef?.message}
            fullWidth
            {...register('projectRef')}
          />

          {/* Distribution Platform */}
          <Input
            label="Distribution Platform"
            placeholder="DistroKid, TuneCore, CD Baby..."
            error={errors.distributionPlatform?.message}
            fullWidth
            {...register('distributionPlatform')}
          />

          {/* ISRC */}
          <Input
            label="ISRC"
            placeholder="e.g. USRC12345678"
            error={errors.isrc?.message}
            fullWidth
            {...register('isrc')}
          />

          {/* Footer actions */}
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
              {isEdit ? 'Save Changes' : 'Add Release'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
