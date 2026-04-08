import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeKey } from '@/types/theme'

export const THEMES = {
  dark: 'Dark',
  light: 'Light',
  live: 'Live',
  loops: 'Loops',
  logical: 'Logical',
  tools: 'Tools',
  cubes: 'Cubes',
} as const


interface ThemeState {
  theme: ThemeKey
  setTheme: (theme: ThemeKey) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
      },
    }),
    {
      name: 'aspire-ams-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme)
        }
      },
    }
  )
)

export const useTheme = () => {
  const { theme, setTheme } = useThemeStore()
  return { theme, setTheme, themes: THEMES }
}
