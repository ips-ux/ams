// =============================================================================
// Aspire AMS — SocialAccountsPage
// Social media account tracker across platforms.
// =============================================================================

import { useState } from 'react'
import { useSocialAccounts } from '@/hooks/useSocialAccounts'
import type { SocialAccountFormData } from '@/hooks/useSocialAccounts'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { SOCIAL_PLATFORMS } from '@/types/enums'
import type { SocialAccount } from '@/types/models'

const PLATFORM_LABELS: Record<string, string> = {
  soundcloud: 'SOUNDCLOUD',
  tiktok: 'TIKTOK',
  instagram: 'INSTAGRAM',
  snapchat: 'SNAPCHAT',
  youtube: 'YOUTUBE',
  facebook: 'FACEBOOK',
  spotify: 'SPOTIFY',
  'apple-music': 'APPLE MUSIC',
  twitter: 'TWITTER',
}

export function SocialAccountsPage() {
  const { accounts, isLoading, addAccount, updateAccount, deleteAccount } = useSocialAccounts()
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null)

  const usedPlatforms = [...new Set(accounts.map((a) => a.platform))]

  const filtered = accounts.filter(
    (a) => platformFilter === 'all' || a.platform === platformFilter,
  )

  const totalFollowers = accounts.reduce((sum, a) => sum + (a.followerCount ?? 0), 0)

  const openAdd = () => { setEditingAccount(null); setIsDrawerOpen(true) }
  const openEdit = (a: SocialAccount) => { setEditingAccount(a); setIsDrawerOpen(true) }
  const closeDrawer = () => { setIsDrawerOpen(false); setEditingAccount(null) }

  const handleSave = async (data: SocialAccountFormData) => {
    if (editingAccount) {
      await updateAccount(editingAccount.id, {
        platform: data.platform as SocialAccount['platform'],
        handle: data.handle,
        url: data.url,
        followerCount: data.followerCount,
        notes: data.notes,
      })
    } else {
      await addAccount(data)
    }
    closeDrawer()
  }

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>Social Accounts</h1>
        <Button variant="primary" onClick={openAdd}>+ Add Account</Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'ACCOUNTS', value: accounts.length },
          { label: 'TOTAL FOLLOWERS', value: totalFollowers.toLocaleString() },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Platform filter tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
        <button
          onClick={() => setPlatformFilter('all')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '7px 14px',
            fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', textTransform: 'uppercase',
            color: platformFilter === 'all' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: platformFilter === 'all' ? '2px solid var(--color-primary)' : '2px solid transparent',
            marginBottom: -1,
          }}
        >ALL</button>
        {usedPlatforms.map((plat) => (
          <button
            key={plat}
            onClick={() => setPlatformFilter(plat)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '7px 14px',
              fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', textTransform: 'uppercase',
              color: platformFilter === plat ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: platformFilter === plat ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >{PLATFORM_LABELS[plat] ?? plat}</button>
        ))}
      </div>

      {/* Account list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📱</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No social accounts yet</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>Track your social media presence here.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {filtered.map((account, i) => (
            <AccountRow
              key={account.id}
              account={account}
              isLast={i === filtered.length - 1}
              onEdit={openEdit}
              onDelete={deleteAccount}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <>
          <div onClick={closeDrawer} style={{
            position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-bg) 50%, transparent)', zIndex: 40,
          }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: 'var(--color-surface)',
            borderLeft: '2px solid var(--color-border-strong)', zIndex: 50, display: 'flex', flexDirection: 'column',
          }}>
            <AccountForm
              account={editingAccount}
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

interface AccountRowProps {
  account: SocialAccount
  isLast: boolean
  onEdit: (a: SocialAccount) => void
  onDelete: (id: string) => void
}

function AccountRow({ account, isLast, onEdit, onDelete }: AccountRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
        background: hovered ? 'color-mix(in srgb, var(--color-primary) 3%, transparent)' : 'transparent',
      }}
    >
      <span style={{
        fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 'var(--radius-sm)',
        color: 'var(--color-primary)', border: '1px solid var(--color-primary)',
        textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
      }}>{PLATFORM_LABELS[account.platform] ?? account.platform}</span>
      <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        @{account.handle}
      </span>
      <span style={{
        fontSize: 12, fontFamily: 'var(--font-mono)', flexShrink: 0,
        color: account.followerCount !== null ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
      }}>
        {account.followerCount !== null ? account.followerCount.toLocaleString() : '—'}
      </span>
      <a href={account.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{
        fontSize: 11, color: 'var(--color-primary)', textDecoration: 'none',
        border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)',
        padding: '2px 8px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em', flexShrink: 0,
      }}>OPEN ↗</a>
      <button onClick={() => onEdit(account)} style={{
        background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '4px 6px',
        color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)',
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M10 2l2 2-7 7H3v-2L10 2z" />
        </svg>
      </button>
      <button onClick={() => onDelete(account.id)} style={{
        background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '4px 6px',
        color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)',
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M2 4h10M5 4V2h4v2M5.5 6.5v4M8.5 6.5v4M3 4l.8 8h6.4L11 4" />
        </svg>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------

interface AccountFormProps {
  account: SocialAccount | null
  onClose: () => void
  onSave: (data: SocialAccountFormData) => Promise<void>
}

function AccountForm({ account, onClose, onSave }: AccountFormProps) {
  const [formData, setFormData] = useState<SocialAccountFormData>({
    platform: account?.platform ?? 'instagram',
    handle: account?.handle ?? '',
    url: account?.url ?? '',
    followerCount: account?.followerCount ?? null,
    notes: account?.notes ?? '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  const validate = () => {
    const e: Partial<Record<string, string>> = {}
    if (!formData.handle.trim()) e.handle = 'Handle is required'
    if (!formData.url.trim()) e.url = 'URL is required'
    else {
      try { new URL(formData.url) } catch { e.url = 'Invalid URL' }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try { await onSave(formData) } finally { setIsSubmitting(false) }
  }

  const inputStyle = {
    background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', padding: '8px 12px',
    width: '100%', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em',
    color: 'var(--color-text-secondary)' as string, display: 'block' as const, marginBottom: 4,
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {account ? 'Edit Account' : 'Add Account'}
        </h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-text-muted)', lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>
      <form onSubmit={handleSubmit} style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        <div>
          <label style={labelStyle}>Platform *</label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData((f) => ({ ...f, platform: e.target.value }))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p} value={p}>{PLATFORM_LABELS[p] ?? p}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Handle *</label>
          <input
            value={formData.handle}
            onChange={(e) => setFormData((f) => ({ ...f, handle: e.target.value }))}
            style={inputStyle}
            placeholder="username (without @)"
            autoFocus
          />
          {errors.handle && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{errors.handle}</span>}
        </div>
        <div>
          <label style={labelStyle}>URL *</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData((f) => ({ ...f, url: e.target.value }))}
            style={inputStyle}
            placeholder="https://..."
          />
          {errors.url && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{errors.url}</span>}
        </div>
        <div>
          <label style={labelStyle}>Follower Count</label>
          <input
            type="number"
            min="0"
            value={formData.followerCount ?? ''}
            onChange={(e) => setFormData((f) => ({
              ...f,
              followerCount: e.target.value === '' ? null : parseInt(e.target.value, 10),
            }))}
            style={inputStyle}
            placeholder="Optional"
          />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
            rows={3}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {account ? 'Save Changes' : 'Add Account'}
          </Button>
        </div>
      </form>
    </>
  )
}
