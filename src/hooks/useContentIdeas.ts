// =============================================================================
// Aspire AMS — useContentIdeas hook
// Real-time Firestore subscription + CRUD for the ContentIdeas collection.
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
import type { ContentIdea } from '@/types/models'
import type { ContentIdeaFormData } from '@/lib/validators/schemas'

export function useContentIdeas() {
  const user = useAuthStore((s) => s.user)
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setIdeas([])
      setIsLoading(false)
      return
    }
    const colRef = userCollection(user.uid, 'content-ideas')
    const unsubscribe = onDocumentsSnapshot<ContentIdea>(
      colRef,
      (docs) => {
        setIdeas(docs)
        setIsLoading(false)
      },
      [orderBy('createdAt', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  const addIdea = async (data: ContentIdeaFormData): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'content-ideas')
    try {
      await addDocument<ContentIdea>(colRef, {
        title: data.title,
        type: data.type,
        platforms: data.platforms,
        status: data.status,
        caption: data.caption ?? '',
        valueScore: data.valueScore,
        effortScore: data.effortScore,
        alignmentScore: data.alignmentScore,
        dueDate: null,
        strengths: [],
        interests: [],
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add idea'))
      throw err
    }
  }

  const updateIdea = async (id: string, data: Partial<ContentIdea>): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'content-ideas')
    try {
      await updateDocument(colRef, id, data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update idea'))
      throw err
    }
  }

  const deleteIdea = async (id: string): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'content-ideas')
    try {
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete idea'))
      throw err
    }
  }

  return { ideas, isLoading, error, addIdea, updateIdea, deleteIdea }
}
