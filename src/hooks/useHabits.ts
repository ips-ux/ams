// =============================================================================
// Aspire AMS — useHabits
// Manages habit configuration (single doc) + daily habit records (collection).
// Config:  users/{uid}/habitConfig/main  → { habitNames: string[] }
// Records: users/{uid}/habitDays         → HabitDay documents (keyed by date)
// =============================================================================

import { useState, useEffect } from 'react'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { orderBy, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import {
  userCollection,
  onDocumentSnapshot,
  onDocumentsSnapshot,
  updateDocument,
} from '@/lib/firebase/helpers'
import { useAuthStore } from '@/hooks/useAuth'
import type { HabitDay } from '@/types/models'

const DEFAULT_HABITS = [
  'Morning routine',
  'Practice / session',
  'Content creation',
  'Industry research',
  'Exercise',
]

export function useHabits() {
  const user = useAuthStore((s) => s.user)
  const [habitNames, setHabitNames] = useState<string[]>(DEFAULT_HABITS)
  const [habitDays, setHabitDays] = useState<HabitDay[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Listen to habit config
  useEffect(() => {
    if (!user) return
    const colRef = userCollection(user.uid, 'habitConfig')
    return onDocumentSnapshot<{ id: string; habitNames: string[] }>(
      colRef,
      'main',
      (document) => {
        if (document?.habitNames?.length) {
          setHabitNames(document.habitNames)
        }
      },
    )
  }, [user?.uid])

  // Listen to habit days for the last 60 days
  useEffect(() => {
    if (!user) {
      setHabitDays([])
      setIsLoading(false)
      return
    }
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const cutoff = sixtyDaysAgo.toISOString().split('T')[0]
    const colRef = userCollection(user.uid, 'habitDays')
    return onDocumentsSnapshot<HabitDay>(
      colRef,
      (docs) => {
        setHabitDays(docs)
        setIsLoading(false)
      },
      [where('date', '>=', cutoff), orderBy('date', 'desc')],
    )
  }, [user?.uid])

  const toggleHabit = async (date: string, habitName: string, currentValue: boolean) => {
    if (!user) return
    const colRef = userCollection(user.uid, 'habitDays')
    const existing = habitDays.find((d) => d.date === date)
    if (existing) {
      await updateDocument(colRef, existing.id, {
        [`habits.${habitName}`]: !currentValue,
      })
    } else {
      // Create new day record keyed by date string
      const habits: Record<string, boolean> = {}
      habitNames.forEach((h) => {
        habits[h] = false
      })
      habits[habitName] = true
      await setDoc(
        doc(db, 'users', user.uid, 'habitDays', date),
        { date, habits, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
      )
    }
  }

  const saveHabitNames = async (names: string[]) => {
    if (!user) return
    setHabitNames(names)
    await setDoc(
      doc(db, 'users', user.uid, 'habitConfig', 'main'),
      { habitNames: names, updatedAt: serverTimestamp() },
      { merge: true },
    )
  }

  return { habitNames, habitDays, isLoading, toggleHabit, saveHabitNames }
}
