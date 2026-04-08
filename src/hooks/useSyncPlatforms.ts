// =============================================================================
// Aspire AMS — useSyncPlatforms hook
// Real-time Firestore subscription + CRUD for the SyncPlatforms collection.
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
import type { SyncPlatform } from '@/types/models'
import type { SyncPlatformFormData } from '@/lib/validators/schemas'

export function useSyncPlatforms() {
  const user = useAuthStore((s) => s.user)
  const [syncPlatforms, setSyncPlatforms] = useState<SyncPlatform[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setSyncPlatforms([])
      setIsLoading(false)
      return
    }

    const colRef = userCollection(user.uid, 'sync-platforms')
    const unsubscribe = onDocumentsSnapshot<SyncPlatform>(
      colRef,
      (docs) => {
        setSyncPlatforms(docs)
        setIsLoading(false)
      },
      [orderBy('createdAt', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  async function addSyncPlatform(data: SyncPlatformFormData): Promise<string | undefined> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'sync-platforms')
      return await addDocument<SyncPlatform>(colRef, {
        name: data.name,
        url: data.url,
        contactInfo: data.contactInfo ?? '',
        notes: data.notes ?? '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add sync platform')
    }
  }

  async function updateSyncPlatform(id: string, data: Partial<SyncPlatform>): Promise<void> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'sync-platforms')
      await updateDocument(colRef, id, data as Partial<Record<string, unknown>>)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sync platform')
    }
  }

  async function deleteSyncPlatform(id: string): Promise<void> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'sync-platforms')
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sync platform')
    }
  }

  return {
    syncPlatforms,
    isLoading,
    error,
    addSyncPlatform,
    updateSyncPlatform,
    deleteSyncPlatform,
  }
}
