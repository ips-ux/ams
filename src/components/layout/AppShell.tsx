import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useSidebar } from '@/hooks/useSidebar'
import { useWindowSize } from '@/hooks/useWindowSize'

export function AppShell() {
  const { isCollapsed } = useSidebar()
  const { width } = useWindowSize()
  const isMobile = width < 768

  const marginLeft = isMobile ? 0 : isCollapsed ? 64 : 260

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: `${marginLeft}px`,
          transition: `margin-left var(--transition-base)`,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <TopBar />
        <main
          style={{
            flex: 1,
            marginTop: '56px',
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
