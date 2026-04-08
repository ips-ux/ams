// =============================================================================
// Aspire AMS — useReleases hook
// Real-time Firestore subscription + CRUD for the Releases collection.
// =============================================================================

import { useState, useEffect } from 'react'
import { Timestamp, orderBy } from 'firebase/firestore'
import {
  userCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  onDocumentsSnapshot,
} from '@/lib/firebase/helpers'
import { useAuthStore } from '@/hooks/useAuth'
import type { Release } from '@/types/models'
import type { ReleaseFormData } from '@/lib/validators/schemas'

export function useReleases() {
  const user = useAuthStore((s) => s.user)
  const [releases, setReleases] = useState<Release[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setReleases([])
      setIsLoading(false)
      return
    }

    const colRef = userCollection(user.uid, 'releases')
    const unsubscribe = onDocumentsSnapshot<Release>(
      colRef,
      (docs) => {
        setReleases(docs)
        setIsLoading(false)
      },
      [orderBy('releaseDate', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  async function addRelease(data: ReleaseFormData): Promise<string | undefined> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'releases')
      return await addDocument<Release>(colRef, {
        title: data.title,
        projectRef: data.projectRef ?? '',
        releaseDate: Timestamp.fromDate(new Date(data.releaseDate)),
        distributionPlatform: data.distributionPlatform ?? '',
        isrc: data.isrc ?? '',
        platforms: {},
        promoChecklist: [],
        submissionLog: [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add release')
    }
  }

  async function updateRelease(id: string, data: Partial<Release>): Promise<void> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'releases')
      await updateDocument(colRef, id, data as Partial<Record<string, unknown>>)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update release')
    }
  }

  async function deleteRelease(id: string): Promise<void> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'releases')
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete release')
    }
  }

  async function toggleChecklistItem(
    releaseId: string,
    release: Release,
    itemIndex: number,
  ): Promise<void> {
    const updatedChecklist = release.promoChecklist.map((item, i) =>
      i === itemIndex ? { ...item, completed: !item.completed } : item,
    )
    await updateRelease(releaseId, { promoChecklist: updatedChecklist })
  }

  return {
    releases,
    isLoading,
    error,
    addRelease,
    updateRelease,
    deleteRelease,
    toggleChecklistItem,
  }
}
