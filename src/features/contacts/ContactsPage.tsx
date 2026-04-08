import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useContacts } from '@/hooks/useContacts'
import { ContactCard } from './components/ContactCard'
import { ContactForm } from './components/ContactForm'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { CONTACT_ROLES } from '@/types/enums'
import type { Contact } from '@/types/models'
import type { ContactRole } from '@/types/enums'
import type { ContactFormData } from '@/lib/validators/schemas'

type RoleFilter = ContactRole | 'all'

const ROLE_LABELS: Record<ContactRole, string> = {
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

function SearchIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.965 10.257a6.5 6.5 0 1 0-.708.708l3.889 3.889a.5.5 0 1 0 .708-.708l-3.889-3.89ZM1.5 6.5a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ContactsPage() {
  const { contacts, isLoading, addContact, updateContact, deleteContact } =
    useContacts()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchesRole = roleFilter === 'all' || c.role === roleFilter
    return matchesSearch && matchesRole
  })

  const openAddForm = () => {
    setEditingContact(null)
    setIsFormOpen(true)
  }

  const openEditForm = (contact: Contact) => {
    setEditingContact(contact)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingContact(null)
  }

  const handleSave = async (data: ContactFormData) => {
    if (editingContact) {
      await updateContact(editingContact.id, {
        name: data.name,
        role: data.role,
        email: data.email ?? '',
        phone: data.phone ?? '',
        notes: data.notes ?? '',
      })
    } else {
      await addContact(data)
    }
    closeForm()
  }

  const handleDelete = async (id: string) => {
    await deleteContact(id)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Page header */}
      <div
        style={{
          padding: '24px 24px 0',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
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
            Contacts
          </h1>
          <Button variant="primary" size="md" onClick={openAddForm}>
            + Add Contact
          </Button>
        </div>

        {/* Search bar */}
        <div
          style={{
            position: 'relative',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SearchIcon />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, email..."
            style={{
              width: '100%',
              paddingLeft: 36,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          />
        </div>

        {/* Role filter chips */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            paddingBottom: 16,
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <RoleChip
            label="All"
            active={roleFilter === 'all'}
            onClick={() => setRoleFilter('all')}
          />
          {CONTACT_ROLES.map((role) => (
            <RoleChip
              key={role}
              label={ROLE_LABELS[role]}
              active={roleFilter === role}
              onClick={() => setRoleFilter(role)}
            />
          ))}
        </div>
      </div>

      {/* Contact list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 0 80px',
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 80,
            }}
          >
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            hasSearch={!!search || roleFilter !== 'all'}
            onAdd={openAddForm}
          />
        ) : (
          <div>
            {filtered.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer overlay */}
      {isFormOpen && (
        <div
          aria-hidden="true"
          onClick={closeForm}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 49,
          }}
        />
      )}

      {/* Side drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editingContact ? 'Edit Contact' : 'Add Contact'}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 480,
          height: '100%',
          background: 'var(--color-surface)',
          borderLeft: '2px solid var(--color-border-strong, var(--color-border))',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: isFormOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.2s ease',
          overflow: 'hidden',
        }}
      >
        <ContactForm
          contact={editingContact}
          onClose={closeForm}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

interface RoleChipProps {
  label: string
  active: boolean
  onClick: () => void
}

function RoleChip({ label, active, onClick }: RoleChipProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn('cursor-pointer')}
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        border: active
          ? '1px solid var(--color-primary)'
          : '1px solid var(--color-border)',
        background: active
          ? 'var(--color-primary)'
          : hovered
            ? 'var(--color-surface-elevated)'
            : 'transparent',
        color: active
          ? '#ffffff'
          : hovered
            ? 'var(--color-text-primary)'
            : 'var(--color-text-secondary)',
        transition:
          'background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast)',
        outline: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

interface EmptyStateProps {
  hasSearch: boolean
  onAdd: () => void
}

function EmptyState({ hasSearch, onAdd }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        gap: 12,
        textAlign: 'center',
        padding: '80px 24px',
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
          style={{ color: 'var(--color-text-muted)' }}
        >
          <path
            d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
            fill="currentColor"
          />
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
        {hasSearch ? 'No contacts found' : 'No contacts yet'}
      </p>
      <p
        style={{
          fontSize: 14,
          color: 'var(--color-text-muted)',
          margin: 0,
          maxWidth: 280,
        }}
      >
        {hasSearch
          ? 'Try adjusting your search or filter.'
          : 'Add producers, managers, agents, and everyone else in your network.'}
      </p>
      {!hasSearch && (
        <Button variant="primary" size="md" onClick={onAdd}>
          Add your first contact
        </Button>
      )}
    </div>
  )
}
