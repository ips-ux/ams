// =============================================================================
// Aspire AMS — useBrandProfile
// Single-document hook for the artist's Brand Strategy profile.
// Stored at: users/{uid}/brandProfile/main
// =============================================================================

import { useState, useEffect } from 'react'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { onDocumentSnapshot, userCollection } from '@/lib/firebase/helpers'
import { useAuthStore } from '@/hooks/useAuth'
import type { BrandProfile } from '@/types/models'

export function useBrandProfile() {
  const user = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setIsLoading(false)
      return
    }
    const colRef = userCollection(user.uid, 'brandProfile')
    const unsubscribe = onDocumentSnapshot<BrandProfile>(colRef, 'main', (document) => {
      setProfile(document)
      setIsLoading(false)
    })
    return unsubscribe
  }, [user?.uid])

  const saveSection = async (section: string, data: Record<string, unknown>) => {
    if (!user) return
    await setDoc(
      doc(db, 'users', user.uid, 'brandProfile', 'main'),
      { [section]: data, updatedAt: serverTimestamp() },
      { merge: true },
    )
  }

  const saveTopLevel = async (data: Record<string, unknown>) => {
    if (!user) return
    await setDoc(
      doc(db, 'users', user.uid, 'brandProfile', 'main'),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true },
    )
  }

  return { profile, isLoading, saveSection, saveTopLevel }
}
