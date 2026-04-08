import { useState } from 'react'
import { Modal, Input, Select, Button } from '@/components/ui'
import { MUSICAL_KEYS } from '@/types/enums'
import { projectSchema } from '@/lib/validators/schemas'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    genre?: string
    bpm?: number
    key?: string
    tags?: string[]
  }) => Promise<void>
}

const keyOptions = [
  { value: '', label: 'No key' },
  ...MUSICAL_KEYS.map((k) => ({ value: k, label: k })),
]

interface FormErrors {
  title?: string
  bpm?: string
  genre?: string
  key?: string
  tags?: string
}

export function NewProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: NewProjectModalProps) {
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [bpmRaw, setBpmRaw] = useState('')
  const [key, setKey] = useState('')
  const [tagsRaw, setTagsRaw] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = () => {
    setTitle('')
    setGenre('')
    setBpmRaw('')
    setKey('')
    setTagsRaw('')
    setErrors({})
    setIsSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const bpmNum = bpmRaw.trim() ? Number(bpmRaw) : undefined
    const tags = tagsRaw.trim()
      ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    // Validate with zod — partial schema for new project form
    const parseResult = projectSchema.partial({ stage: true, submissionStatus: true }).safeParse({
      title: title.trim(),
      genre: genre.trim() || undefined,
      bpm: bpmNum,
      key: key || undefined,
      tags,
      stage: 'spark',
      submissionStatus: 'draft',
    })

    if (!parseResult.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of parseResult.error.issues) {
        const field = issue.path[0] as keyof FormErrors
        if (field) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    // Extra BPM range check
    if (bpmNum !== undefined && (bpmNum < 60 || bpmNum > 240)) {
      setErrors({ bpm: 'BPM must be between 60 and 240' })
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      await onSubmit({
        title: title.trim(),
        genre: genre.trim() || undefined,
        bpm: bpmNum,
        key: key || undefined,
        tags,
      })
      reset()
      onClose()
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Project" size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Track title..."
          error={errors.title}
          fullWidth
          autoFocus
        />

        <Input
          label="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Tech House, Bass House..."
          error={errors.genre}
          fullWidth
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="BPM"
            type="number"
            min={60}
            max={240}
            value={bpmRaw}
            onChange={(e) => setBpmRaw(e.target.value)}
            placeholder="128"
            error={errors.bpm}
            fullWidth
          />

          <Select
            label="Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            options={keyOptions}
            error={errors.key}
            fullWidth
          />
        </div>

        <Input
          label="Tags"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="progressive, dark, main-room"
          error={errors.tags}
          fullWidth
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            paddingTop: 4,
          }}
        >
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
