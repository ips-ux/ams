// =============================================================================
// Aspire AMS — usePressKit hook
// Single-document Firestore listener for the user's press kit (doc ID: 'main').
// =============================================================================

import { useState, useEffect } from 'react'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { userCollection, onDocumentSnapshot } from '@/lib/firebase/helpers'
import { useAuthStore } from '@/hooks/useAuth'
import type { PressKit } from '@/types/models'

export interface PressKitFormData {
  bio: string
  epkUrl: string
  prLinksRaw: string       // comma-separated, split on save
  pressPhotoUrlsRaw: string // comma-separated, split on save
}

export function usePressKit() {
  const user = useAuthStore((s) => s.user)
  const [pressKit, setPressKit] = useState<PressKit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setPressKit(null)
      setIsLoading(false)
      return
    }
    const colRef = userCollection(user.uid, 'press-kit')
    const unsubscribe = onDocumentSnapshot<PressKit>(
      colRef,
      'main',
      (document) => {
        setPressKit(document)
        setIsLoading(false)
      },
    )
    return unsubscribe
  }, [user?.uid])

  const savePressKit = async (data: PressKitFormData): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'press-kit')
    const docRef = doc(colRef, 'main')
    const prLinks = data.prLinksRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const pressPhotoUrls = data.pressPhotoUrlsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    try {
      await setDoc(
        docRef,
        {
          bio: data.bio,
          epkUrl: data.epkUrl.trim() || null,
          prLinks,
          pressPhotoUrls,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save press kit'))
      throw err
    }
  }

  return { pressKit, isLoading, error, savePressKit }
}
