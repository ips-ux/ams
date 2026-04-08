// =============================================================================
// Aspire AMS — usePromoPlatforms hook
// Real-time Firestore subscription + CRUD for the PromoPlatforms collection.
// =============================================================================

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
import type { PromoPlatform } from '@/types/models'
import type { PromoPlatformFormData } from '@/lib/validators/schemas'

export function usePromoPlatforms() {
  const user = useAuthStore((s) => s.user)
  const [promoPlatforms, setPromoPlatforms] = useState<PromoPlatform[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setPromoPlatforms([])
      setIsLoading(false)
      return
    }

    const colRef = userCollection(user.uid, 'promo-platforms')
    const unsubscribe = onDocumentsSnapshot<PromoPlatform>(
      colRef,
      (docs) => {
        setPromoPlatforms(docs)
        setIsLoading(false)
      },
      [orderBy('createdAt', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  async function addPromoPlatform(data: PromoPlatformFormData): Promise<string | undefined> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'promo-platforms')
      return await addDocument<PromoPlatform>(colRef, {
        name: data.name,
        type: data.type,
        url: data.url,
        contactEmail: data.contactEmail ?? '',
        genres: data.genres ?? [],
        notes: data.notes ?? '',
        customGroup: data.customGroup ?? null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add promo platform')
    }
  }

  async function updatePromoPlatform(id: string, data: Partial<PromoPlatform>): Promise<void> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'promo-platforms')
      await updateDocument(colRef, id, data as Partial<Record<string, unknown>>)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update promo platform')
    }
  }

  async function deletePromoPlatform(id: string): Promise<void> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'promo-platforms')
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promo platform')
    }
  }

  return {
    promoPlatforms,
    isLoading,
    error,
    addPromoPlatform,
    updatePromoPlatform,
    deletePromoPlatform,
  }
}
