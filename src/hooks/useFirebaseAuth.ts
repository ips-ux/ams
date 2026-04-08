import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { useAuthStore } from '@/hooks/useAuth'

/**
 * Bootstraps Firebase auth state into the Zustand auth store.
 * Call this once at the top of the app (in App.tsx).
 * Returns nothing — side-effect only.
 */
export function useFirebaseAuth() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Attempt to fetch the user's profile from Firestore for role + displayName
        try {
          const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid, 'profile', 'data'))
          const profile = profileSnap.exists() ? profileSnap.data() : null

          useAuthStore.getState().setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: profile?.displayName ?? firebaseUser.displayName,
            avatarUrl: profile?.avatarUrl ?? firebaseUser.photoURL ?? null,
            role: profile?.role ?? 'artist',
          })
        } catch {
          // Profile not yet created (new user) — set with Firebase defaults
          useAuthStore.getState().setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName,
            avatarUrl: firebaseUser.photoURL ?? null,
            role: 'artist',
          })
        }
      } else {
        useAuthStore.getState().setUser(null)
      }
    })

    return unsubscribe
  }, [])
}
