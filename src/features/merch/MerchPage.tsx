// =============================================================================
// Aspire AMS — MerchPage
// Merchandise inventory tracker with stock alerts and inline CRUD.
// =============================================================================

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMerch } from '@/hooks/useMerch'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { merchSchema } from '@/lib/validators/schemas'
import { MERCH_STATUSES } from '@/types/enums'
import type { MerchStatus } from '@/types/enums'
import type { MerchProduct } from '@/types/models'
import type { MerchFormData } from '@/lib/validators/schemas'

const STATUS_COLORS: Record<MerchStatus, string> = {
  'in-stock': 'var(--color-stage-complete)',
  'low-stock': 'var(--color-stage-expand)',
  'out-of-stock': 'var(--color-danger)',
  'incoming': 'var(--color-primary)',
  'discontinued': 'var(--color-text-muted)',
}

export function MerchPage() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useMerch()
  const [statusFilter, setStatusFilter] = useState<MerchStatus | 'all'>('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MerchProduct | null>(null)

  const filtered = products.filter(
    (p) => statusFilter === 'all' || p.status === statusFilter,
  )

  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const lowStock = products.filter((p) => p.status === 'low-stock').length
  const outOfStock = products.filter((p) => p.status === 'out-of-stock').length

  const openAdd = () => { setEditingProduct(null); setIsDrawerOpen(true) }
  const openEdit = (p: MerchProduct) => { setEditingProduct(p); setIsDrawerOpen(true) }
  const closeDrawer = () => { setIsDrawerOpen(false); setEditingProduct(null) }

  const handleSave = async (data: MerchFormData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data)
    } else {
      await addProduct(data)
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
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>Merch</h1>
        <Button variant="primary" onClick={openAdd}>+ Add Product</Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'TOTAL', value: products.length },
          { label: 'INV VALUE', value: `$${totalValue.toFixed(2)}` },
          { label: 'LOW STOCK', value: lowStock },
          { label: 'OUT OF STOCK', value: outOfStock },
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

      {/* Status tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
        {(['all', ...MERCH_STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s as MerchStatus | 'all')} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '7px 14px',
            fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', textTransform: 'uppercase',
            color: statusFilter === s ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: statusFilter === s ? '2px solid var(--color-primary)' : '2px solid transparent',
            marginBottom: -1,
          }}>{s === 'all' ? 'ALL' : s}</button>
        ))}
      </div>

      {/* Product list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👕</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No products yet</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>Track your merch inventory here.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {filtered.map((p, i) => (
            <ProductRow
              key={p.id}
              product={p}
              isLast={i === filtered.length - 1}
              onEdit={openEdit}
              onDelete={deleteProduct}
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
            <MerchForm
              product={editingProduct}
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

interface ProductRowProps {
  product: MerchProduct
  isLast: boolean
  onEdit: (p: MerchProduct) => void
  onDelete: (id: string) => void
}

function ProductRow({ product, isLast, onEdit, onDelete }: ProductRowProps) {
  const [hovered, setHovered] = useState(false)
  const isLow = product.quantity <= product.stockAlert

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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>{product.name}</div>
        {product.supplier && (
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{product.supplier}</div>
        )}
      </div>
      <span style={{
        fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 'var(--radius-sm)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        color: STATUS_COLORS[product.status], border: `1px solid ${STATUS_COLORS[product.status]}`,
        flexShrink: 0,
      }}>{product.status}</span>
      <span style={{
        fontSize: 12, fontFamily: 'var(--font-mono)',
        color: isLow ? 'var(--color-danger)' : 'var(--color-text-primary)',
        fontWeight: isLow ? 700 : 400, flexShrink: 0,
      }}>×{product.quantity}</span>
      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', flexShrink: 0 }}>
        ${product.cost.toFixed(2)} / ${product.price.toFixed(2)}
      </span>
      <button onClick={() => onEdit(product)} style={{
        background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '4px 6px',
        color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)',
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M10 2l2 2-7 7H3v-2L10 2z" />
        </svg>
      </button>
      <button onClick={() => onDelete(product.id)} style={{
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

interface MerchFormProps {
  product: MerchProduct | null
  onClose: () => void
  onSave: (data: MerchFormData) => Promise<void>
}

function MerchForm({ product, onClose, onSave }: MerchFormProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(merchSchema),
    defaultValues: product
      ? { name: product.name, cost: product.cost, price: product.price, quantity: product.quantity, supplier: product.supplier, status: product.status, stockAlert: product.stockAlert }
      : { status: 'in-stock', stockAlert: 5, cost: 0, price: 0, quantity: 0 },
  })

  const inputStyle = {
    background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', padding: '8px 12px',
    width: '100%', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {product ? 'Edit Product' : 'Add Product'}
        </h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-text-muted)', lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>
      <form onSubmit={handleSubmit(onSave)} style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Name *</label>
          <input {...register('name')} style={inputStyle} placeholder="e.g. Classic Tee" autoFocus />
          {errors.name && <span style={{ fontSize: 11, color: 'var(--color-danger)' }}>{String(errors.name.message ?? '')}</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Cost *</label>
            <Input {...register('cost', { valueAsNumber: true })} type="number" step="0.01" min="0" error={errors.cost?.message as string | undefined} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Price *</label>
            <Input {...register('price', { valueAsNumber: true })} type="number" step="0.01" min="0" error={errors.price?.message as string | undefined} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Quantity *</label>
            <Input {...register('quantity', { valueAsNumber: true })} type="number" min="0" error={errors.quantity?.message as string | undefined} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Stock Alert</label>
            <Input {...register('stockAlert', { valueAsNumber: true })} type="number" min="0" error={errors.stockAlert?.message as string | undefined} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Status *</label>
          <select {...register('status')} style={{ ...inputStyle, cursor: 'pointer' }}>
            {MERCH_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Supplier</label>
          <input {...register('supplier')} style={inputStyle} placeholder="Supplier name" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {product ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </>
  )
}
