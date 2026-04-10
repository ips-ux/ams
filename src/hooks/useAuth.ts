import { create } from 'zustand'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/config/firebase'
import type { UserRole } from '@/types/enums'

export interface AuthUser {
  uid: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  role: UserRole
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    await firebaseSignOut(auth)
    set({ user: null, isAuthenticated: false })
  },
}))

export const useAuth = () => useAuthStore()
