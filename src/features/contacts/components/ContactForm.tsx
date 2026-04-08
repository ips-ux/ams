import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema } from '@/lib/validators/schemas'
import type { ContactFormData } from '@/lib/validators/schemas'
import { CONTACT_ROLES } from '@/types/enums'
import { Button } from '@/components/ui/Button'
import type { Contact } from '@/types/models'

const ROLE_LABELS: Record<(typeof CONTACT_ROLES)[number], string> = {
  producer: 'Producer',
  dj: 'DJ',
  vocalist: 'Vocalist',
  artist: 'Artist',
  designer: 'Designer',
  'mastering-engineer': 'Mastering Engineer',
  engineer: 'Engineer',
  writer: 'Writer',
  'a&r': 'A&R',
  manager: 'Manager',
  agent: 'Agent',
  other: 'Other',
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  padding: '8px 12px',
  width: '100%',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: 'var(--color-primary)',
}

interface FocusableInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

function FocusableInput({ hasError, style, ...props }: FocusableInputProps) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      style={{
        ...(focused ? inputFocusStyle : inputStyle),
        ...(hasError ? { borderColor: 'var(--color-error)' } : {}),
        ...style,
      }}
      onFocus={(e) => {
        setFocused(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocused(false)
        props.onBlur?.(e)
      }}
    />
  )
}

interface FocusableTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

function FocusableTextarea({
  hasError,
  style,
  ...props
}: FocusableTextareaProps) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      {...props}
      style={{
        ...(focused ? inputFocusStyle : inputStyle),
        ...(hasError ? { borderColor: 'var(--color-error)' } : {}),
        resize: 'vertical',
        ...style,
      }}
      onFocus={(e) => {
        setFocused(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocused(false)
        props.onBlur?.(e)
      }}
    />
  )
}

interface FocusableSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

function FocusableSelect({
  hasError,
  style,
  ...props
}: FocusableSelectProps) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      {...props}
      style={{
        ...(focused ? inputFocusStyle : inputStyle),
        ...(hasError ? { borderColor: 'var(--color-error)' } : {}),
        cursor: 'pointer',
        ...style,
      }}
      onFocus={(e) => {
        setFocused(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocused(false)
        props.onBlur?.(e)
      }}
    />
  )
}

interface FieldWrapperProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

function FieldWrapper({ label, required, error, children }: FieldWrapperProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
        }}
      >
        {label}
        {required && (
          <span
            aria-hidden="true"
            style={{ color: 'var(--color-error)', marginLeft: 2 }}
          >
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <span
          role="alert"
          style={{
            fontSize: 12,
            color: 'var(--color-error)',
            marginTop: 2,
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}

interface ContactFormProps {
  contact?: Contact | null
  onClose: () => void
  onSave: (data: ContactFormData) => Promise<void>
}

export function ContactForm({ contact, onClose, onSave }: ContactFormProps) {
  const isEditing = contact != null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: isEditing
      ? {
          name: contact.name,
          role: contact.role,
          email: contact.email ?? '',
          phone: contact.phone ?? '',
          notes: contact.notes ?? '',
        }
      : {
          name: '',
          role: 'other',
          email: '',
          phone: '',
          notes: '',
        },
  })

  const onSubmit = async (data: ContactFormData) => {
    await onSave(data)
  }

  return (
    <div
      style={{
        maxWidth: 480,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Form header */}
      <div
        style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {isEditing ? 'Edit Contact' : 'Add Contact'}
        </h2>
      </div>

      {/* Scrollable form body */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        }}
        noValidate
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Name */}
          <FieldWrapper label="Name" required error={errors.name?.message}>
            <FocusableInput
              type="text"
              placeholder="Full name"
              hasError={!!errors.name}
              autoComplete="name"
              {...register('name')}
            />
          </FieldWrapper>

          {/* Role */}
          <FieldWrapper label="Role" required error={errors.role?.message}>
            <FocusableSelect hasError={!!errors.role} {...register('role')}>
              {CONTACT_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </FocusableSelect>
          </FieldWrapper>

          {/* Email */}
          <FieldWrapper label="Email" error={errors.email?.message}>
            <FocusableInput
              type="email"
              placeholder="email@example.com"
              hasError={!!errors.email}
              autoComplete="email"
              {...register('email')}
            />
          </FieldWrapper>

          {/* Phone */}
          <FieldWrapper label="Phone" error={errors.phone?.message}>
            <FocusableInput
              type="tel"
              placeholder="+1 (555) 000-0000"
              hasError={!!errors.phone}
              autoComplete="tel"
              {...register('phone')}
            />
          </FieldWrapper>

          {/* Notes */}
          <FieldWrapper label="Notes" error={errors.notes?.message}>
            <FocusableTextarea
              rows={4}
              placeholder="Any additional notes..."
              hasError={!!errors.notes}
              {...register('notes')}
            />
          </FieldWrapper>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Add Contact'}
          </Button>
        </div>
      </form>
    </div>
  )
}
