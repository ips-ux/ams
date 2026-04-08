// =============================================================================
// Aspire AMS — useLinkPage
// Singleton-doc read/write hook for the user's link-in-bio page profile.
// Stored at: users/{userId}/linkPage/profile
// =============================================================================

import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/hooks/useAuth'
import type { LinkItem, LinkPageProfile } from '@/types/models'

const SINGLETON_DOC_ID = 'profile'

function linkPageDocRef(userId: string) {
  return doc(db, 'users', userId, 'linkPage', SINGLETON_DOC_ID)
}

export function useLinkPage() {
  const user = useAuthStore((s) => s.user)
  const [linkPage, setLinkPage] = useState<LinkPageProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    if (!user) {
      setLinkPage(null)
      setIsLoading(false)
      return
    }
    try {
      const ref = linkPageDocRef(user.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setLinkPage({ id: snap.id, ...snap.data() } as LinkPageProfile)
      } else {
        setLinkPage(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load link page'))
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    load()
  }, [load])

  const saveLinks = async (links: LinkItem[]): Promise<void> => {
    if (!user) return
    setIsSaving(true)
    try {
      const ref = linkPageDocRef(user.uid)
      await setDoc(
        ref,
        { links, updatedAt: serverTimestamp() },
        { merge: true },
      )
      setLinkPage((prev) =>
        prev
          ? { ...prev, links }
          : {
              id: SINGLETON_DOC_ID,
              links,
              pageTitle: '',
              bio: '',
              avatarUrl: null,
              createdAt: null as never,
              updatedAt: null as never,
            },
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save links'))
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  const updateSettings = async (
    settings: Partial<Pick<LinkPageProfile, 'pageTitle' | 'bio' | 'avatarUrl'>>,
  ): Promise<void> => {
    if (!user) return
    setIsSaving(true)
    try {
      const ref = linkPageDocRef(user.uid)
      await setDoc(ref, { ...settings, updatedAt: serverTimestamp() }, { merge: true })
      setLinkPage((prev) => (prev ? { ...prev, ...settings } : null))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'))
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  return { linkPage, isLoading, isSaving, error, saveLinks, updateSettings }
}
