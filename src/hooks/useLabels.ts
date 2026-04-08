// =============================================================================
// Aspire AMS — useLabels hook
// Real-time Firestore subscription + CRUD for the Labels collection.
// =============================================================================

import { useState, useEffect } from 'react'
import {
  userCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  onDocumentsSnapshot,
} from '@/lib/firebase/helpers'
import { useAuthStore } from '@/hooks/useAuth'
import type { Label } from '@/types/models'
import type { LabelFormData } from '@/lib/validators/schemas'

export function useLabels() {
  const user = useAuthStore((s) => s.user)
  const [labels, setLabels] = useState<Label[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLabels([])
      setIsLoading(false)
      return
    }

    const colRef = userCollection(user.uid, 'labels')
    const unsubscribe = onDocumentsSnapshot<Label>(colRef, (docs) => {
      setLabels(docs)
      setIsLoading(false)
    })
    return unsubscribe
  }, [user?.uid])

  async function addLabel(data: LabelFormData): Promise<string | undefined> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'labels')
      return await addDocument<Label>(colRef, {
        name: data.name,
        genres: data.genres,
        email: data.email ?? '',
        demoSubmissionUrl: data.demoSubmissionUrl ?? '',
        discographyUrl: data.discographyUrl ?? '',
        notes: data.notes ?? '',
        notableArtists: [],
        events: [],
        contactRefs: [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add label')
    }
  }

  async function updateLabel(id: string, data: Partial<Label>): Promise<void> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'labels')
      await updateDocument(colRef, id, data as Partial<Record<string, unknown>>)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update label')
    }
  }

  async function deleteLabel(id: string): Promise<void> {
    if (!user) return
    try {
      const colRef = userCollection(user.uid, 'labels')
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete label')
    }
  }

  return { labels, isLoading, error, addLabel, updateLabel, deleteLabel }
}
