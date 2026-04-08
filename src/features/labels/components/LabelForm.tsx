// =============================================================================
// Aspire AMS — LabelForm
// Drawer form for creating and editing a Label document.
// Uses react-hook-form + zodResolver against the canonical labelSchema.
// =============================================================================

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, Textarea, Button } from '@/components/ui'
import { labelSchema } from '@/lib/validators/schemas'
import type { Label } from '@/types/models'
import type { LabelFormData } from '@/lib/validators/schemas'

interface LabelFormProps {
  label?: Label | null
  onClose: () => void
  onSave: (data: LabelFormData) => Promise<void>
}

// Convert a genres array to the comma-separated string used in the form
function genresToString(genres: string[]): string {
  return genres.join(', ')
}

// Convert the form's genres string to the array stored in Firestore
function stringToGenres(raw: string): string[] {
  return raw
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean)
}

export function LabelForm({ label, onClose, onSave }: LabelFormProps) {
  const isEdit = label != null

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
    defaultValues: {
      name: '',
      genres: [],
      email: '',
      demoSubmissionUrl: '',
      discographyUrl: '',
      notes: '',
    },
  })

  // Populate form when editing an existing label
  useEffect(() => {
    if (label) {
      reset({
        name: label.name,
        genres: label.genres,
        email: label.email ?? '',
        demoSubmissionUrl: label.demoSubmissionUrl ?? '',
        discographyUrl: label.discographyUrl ?? '',
        notes: label.notes ?? '',
      })
    } else {
      reset({
        name: '',
        genres: [],
        email: '',
        demoSubmissionUrl: '',
        discographyUrl: '',
        notes: '',
      })
    }
  }, [label, reset])

  const onSubmit = async (data: LabelFormData) => {
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
        aria-label={isEdit ? 'Edit Label' : 'Add Label'}
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
            {isEdit ? 'Edit Label' : 'Add Label'}
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
          {/* Name */}
          <Input
            label="Label Name *"
            placeholder="e.g. Drumcode"
            error={errors.name?.message}
            fullWidth
            autoFocus={!isEdit}
            {...register('name')}
          />

          {/* Genres — stored as array, edited as comma-separated string */}
          <Controller
            name="genres"
            control={control}
            render={({ field }) => (
              <Input
                label="Genres"
                placeholder="Techno, Tech House, Minimal..."
                value={genresToString(field.value)}
                onChange={(e) => field.onChange(stringToGenres(e.target.value))}
                onBlur={field.onBlur}
                error={errors.genres?.message}
                helperText="Comma-separated"
                fullWidth
              />
            )}
          />

          {/* Email */}
          <Input
            label="Contact Email"
            type="email"
            placeholder="demos@label.com"
            error={errors.email?.message}
            fullWidth
            {...register('email')}
          />

          {/* Demo submission URL */}
          <Input
            label="Demo Submission URL"
            type="url"
            placeholder="https://label.com/demos"
            error={errors.demoSubmissionUrl?.message}
            fullWidth
            {...register('demoSubmissionUrl')}
          />

          {/* Discography URL */}
          <Input
            label="Discography URL"
            type="url"
            placeholder="https://www.beatport.com/label/..."
            error={errors.discographyUrl?.message}
            fullWidth
            {...register('discographyUrl')}
          />

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Submission guidelines, contact notes, deadlines..."
            rows={4}
            error={errors.notes?.message}
            fullWidth
            {...register('notes')}
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
              {isEdit ? 'Save Changes' : 'Add Label'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
