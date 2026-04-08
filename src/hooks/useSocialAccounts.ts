// =============================================================================
// Aspire AMS — useSocialAccounts hook
// Real-time Firestore subscription + CRUD for the SocialAccounts collection.
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
import type { SocialAccount } from '@/types/models'
import type { SocialPlatform } from '@/types/enums'

export interface SocialAccountFormData {
  platform: string
  handle: string
  url: string
  followerCount: number | null
  notes: string
}

export function useSocialAccounts() {
  const user = useAuthStore((s) => s.user)
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setAccounts([])
      setIsLoading(false)
      return
    }
    const colRef = userCollection(user.uid, 'social-accounts')
    const unsubscribe = onDocumentsSnapshot<SocialAccount>(
      colRef,
      (docs) => {
        setAccounts(docs)
        setIsLoading(false)
      },
      [orderBy('createdAt', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  const addAccount = async (data: SocialAccountFormData): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'social-accounts')
    try {
      await addDocument<SocialAccount>(colRef, {
        platform: data.platform as SocialPlatform,
        handle: data.handle,
        url: data.url,
        followerCount: data.followerCount,
        notes: data.notes,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add account'))
      throw err
    }
  }

  const updateAccount = async (id: string, data: Partial<SocialAccount>): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'social-accounts')
    try {
      await updateDocument(colRef, id, data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update account'))
      throw err
    }
  }

  const deleteAccount = async (id: string): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'social-accounts')
    try {
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete account'))
      throw err
    }
  }

  return { accounts, isLoading, error, addAccount, updateAccount, deleteAccount }
}
