import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { Contact } from '@/types/models'

// Pencil icon
function IconPencil({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.929-.929l.93-3.251c.081-.286.235-.547.445-.756l8.61-8.61Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Trash icon
function IconTrash({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75ZM5 3V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75V3h2.5a.75.75 0 0 1 0 1.5H14v8.75A2.75 2.75 0 0 1 11.25 16h-6.5A2.75 2.75 0 0 1 2 13.25V4.5H.5a.75.75 0 0 1 0-1.5H5Zm2 3.25a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0V7a.75.75 0 0 1 .75-.75Zm3 0a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0V7a.75.75 0 0 1 .75-.75Z"
        fill="currentColor"
      />
    </svg>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

interface ContactCardProps {
  contact: Contact
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn('flex items-center gap-3 cursor-default')}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border)',
        background: isHovered
          ? 'color-mix(in srgb, var(--color-primary) 4%, transparent)'
          : 'transparent',
        transition: 'background var(--transition-fast)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          minWidth: 40,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.03em',
          userSelect: 'none',
        }}
      >
        {getInitials(contact.name)}
      </div>

      {/* Name + role + notes snippet */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span
          className="font-semibold truncate"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: 14,
            lineHeight: '1.4',
          }}
        >
          {contact.name}
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role badge */}
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1px 5px',
              color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {contact.role}
          </span>

          {contact.notes && (
            <span
              className="truncate"
              style={{
                fontSize: 12,
                color: 'var(--color-text-muted)',
              }}
            >
              {contact.notes.length > 60
                ? contact.notes.slice(0, 60) + '…'
                : contact.notes}
            </span>
          )}
        </div>
      </div>

      {/* Contact details */}
      <div
        className="flex flex-col items-end gap-0.5 shrink-0"
        style={{ minWidth: 0, maxWidth: 200 }}
      >
        {contact.email && (
          <span
            className="truncate"
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              maxWidth: 200,
            }}
          >
            {contact.email}
          </span>
        )}
        {contact.phone && (
          <span
            style={{
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            {contact.phone}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Edit ${contact.name}`}
          onClick={() => onEdit(contact)}
          leftIcon={<IconPencil size={14} />}
        />
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Delete ${contact.name}`}
          onClick={() => onDelete(contact.id)}
          leftIcon={<IconTrash size={14} />}
        />
      </div>
    </div>
  )
}
