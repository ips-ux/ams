import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { useSidebar } from '@/hooks/useSidebar'
import { useAuth } from '@/hooks/useAuth'
import { useWindowSize } from '@/hooks/useWindowSize'
import { ThemeSwitcher } from './ThemeSwitcher'
import { NAV_SECTIONS, DASHBOARD_ROUTE, COMMUNITY_ITEMS, SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/config/routes'

function getPageTitle(pathname: string): string {
  if (pathname === '/') return DASHBOARD_ROUTE.label

  for (const section of NAV_SECTIONS) {
    for (const route of section.routes) {
      // Match exact or prefix for nested routes like /library/:slug
      if (pathname === route.path || pathname.startsWith(route.path + '/')) {
        return route.label
      }
    }
  }

  for (const item of COMMUNITY_ITEMS) {
    if (pathname === item.path || pathname.startsWith(item.path + '/')) {
      return item.label
    }
  }

  // Fallback: capitalize the last path segment
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0) {
    const last = segments[segments.length - 1]
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
  }

  return 'Aspire AMS'
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 5H17M3 10H17M3 15H17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ flexShrink: 0, color: 'var(--color-text-muted)' }}
    >
      <path
        d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10ZM13 13l-2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TopBar() {
  const location = useLocation()
  const { isCollapsed, setMobileOpen } = useSidebar()
  const { user, signOut } = useAuth()
  // useTheme kept for potential future use — currently ThemeSwitcher handles it directly
  useTheme()
  const { width } = useWindowSize()
  const isMobile = width < 768
  const pageTitle = getPageTitle(location.pathname)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const initials =
    user?.displayName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?'

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: isMobile ? 0 : (isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH),
        height: '56px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '16px',
        zIndex: 100,
        transition: `left var(--transition-base)`,
      }}
      className="topbar"
    >
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="topbar-hamburger"
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          flexShrink: 0,
        }}
      >
        <HamburgerIcon />
      </button>

      {/* Page title */}
      <span
        style={{
          fontWeight: 600,
          fontSize: '16px',
          color: 'var(--color-text-primary)',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {pageTitle}
      </span>

      {/* Search — center */}
      <div
        style={{
          flex: 1,
          maxWidth: '480px',
          margin: '0 auto',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <SearchIcon />
        </div>
        <input
          type="search"
          placeholder="Search..."
          style={{
            width: '100%',
            paddingLeft: '34px',
            paddingRight: '12px',
            paddingTop: '7px',
            paddingBottom: '7px',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        />
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
        <ThemeSwitcher />

        {/* User avatar + logout dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            title={user?.displayName ?? user?.email ?? 'User'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              border: menuOpen
                ? '2px solid var(--color-primary)'
                : '2px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-button-text)',
              flexShrink: 0,
              overflow: 'hidden',
              padding: 0,
            }}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName ?? 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              initials
            )}
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '200px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                zIndex: 200,
                overflow: 'hidden',
              }}
            >
              {/* User info */}
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {user?.displayName ?? '—'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {user?.email}
                </div>
              </div>

              {/* Log out */}
              <button
                onClick={() => { void signOut() }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-surface-elevated)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5M9 10l3-3-3-3M12 7H5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
