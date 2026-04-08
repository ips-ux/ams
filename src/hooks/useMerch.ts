import { useState, useEffect } from 'react'
import { orderBy } from 'firebase/firestore'
import {
  userCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  onDocumentsSnapshot,
} from '@/lib/firebase/helpers'
import { useAuthStore } from '@/hooks/useAuth'
import type { MerchProduct } from '@/types/models'
import type { MerchFormData } from '@/lib/validators/schemas'

export function useMerch() {
  const user = useAuthStore((s) => s.user)
  const [products, setProducts] = useState<MerchProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setProducts([])
      setIsLoading(false)
      return
    }
    const colRef = userCollection(user.uid, 'merch')
    const unsubscribe = onDocumentsSnapshot<MerchProduct>(
      colRef,
      (docs) => {
        setProducts(docs)
        setIsLoading(false)
      },
      [orderBy('createdAt', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  const addProduct = async (data: MerchFormData): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'merch')
    try {
      await addDocument<MerchProduct>(colRef, {
        name: data.name,
        cost: data.cost,
        price: data.price,
        quantity: data.quantity,
        supplier: data.supplier ?? '',
        status: data.status,
        stockAlert: data.stockAlert ?? 5,
        imageUrl: null,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add product'))
      throw err
    }
  }

  const updateProduct = async (id: string, data: Partial<MerchProduct>): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'merch')
    try {
      await updateDocument(colRef, id, data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update product'))
      throw err
    }
  }

  const deleteProduct = async (id: string): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'merch')
    try {
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete product'))
      throw err
    }
  }

  return { products, isLoading, error, addProduct, updateProduct, deleteProduct }
}
