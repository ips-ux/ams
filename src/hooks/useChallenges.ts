// =============================================================================
// Aspire AMS — useChallenges
// Real-time Firestore hook for the user's creative challenges collection.
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
import type { Challenge } from '@/types/models'
import type { ChallengeFormData } from '@/lib/validators/schemas'

export function useChallenges() {
  const user = useAuthStore((s) => s.user)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setChallenges([])
      setIsLoading(false)
      return
    }
    const colRef = userCollection(user.uid, 'challenges')
    const unsubscribe = onDocumentsSnapshot<Challenge>(
      colRef,
      (docs) => {
        setChallenges(docs)
        setIsLoading(false)
      },
      [orderBy('createdAt', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  const addChallenge = async (data: ChallengeFormData): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'challenges')
    try {
      await addDocument<Challenge>(colRef, {
        title: data.title,
        type: data.type,
        status: data.status ?? 'active',
        dueDate: null,
        notes: data.notes ?? '',
        completionNotes: data.completionNotes ?? '',
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add challenge'))
      throw err
    }
  }

  const updateChallenge = async (id: string, data: Partial<Challenge>): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'challenges')
    try {
      await updateDocument(colRef, id, data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update challenge'))
      throw err
    }
  }

  const deleteChallenge = async (id: string): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'challenges')
    try {
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete challenge'))
      throw err
    }
  }

  const completeChallenge = (id: string, completionNotes = '') =>
    updateChallenge(id, { status: 'completed', completionNotes })

  const archiveChallenge = (id: string) => updateChallenge(id, { status: 'archived' })

  return {
    challenges,
    isLoading,
    error,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    completeChallenge,
    archiveChallenge,
  }
}
