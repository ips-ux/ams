import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isCollapsed: boolean
  openSections: string[]
  isMobileOpen: boolean
  toggleCollapsed: () => void
  toggleSection: (section: string) => void
  setMobileOpen: (open: boolean) => void
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      openSections: ['creative', 'management'],
      isMobileOpen: false,
      toggleCollapsed: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      toggleSection: (section) =>
        set((s) => ({
          openSections: s.openSections.includes(section)
            ? s.openSections.filter((x) => x !== section)
            : [...s.openSections, section],
        })),
      setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
    }),
    { name: 'aspire-sidebar' }
  )
)
