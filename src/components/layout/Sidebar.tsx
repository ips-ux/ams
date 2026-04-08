import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSidebar } from '@/hooks/useSidebar'
import {
  NAV_SECTIONS,
  DASHBOARD_ROUTE,
  COMMUNITY_ITEMS,
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
} from '@/config/routes'

function ChevronDown({ rotated }: { rotated: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{
        transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform var(--transition-base)',
        flexShrink: 0,
      }}
    >
      <path
        d="M2.5 5L7 9.5L11.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CollapseArrow({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d={collapsed ? 'M6 3L11 8L6 13' : 'M10 3L5 8L10 13'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const navLinkBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--color-sidebar-text)',
  transition: 'background var(--transition-fast), color var(--transition-fast)',
  position: 'relative',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
}

const thinDividerStyle: React.CSSProperties = {
  height: '1px',
  background: 'var(--color-sidebar-border)',
  margin: '4px 12px',
}

export function Sidebar() {
  const { isCollapsed, openSections, isMobileOpen, toggleCollapsed, toggleSection, setMobileOpen } =
    useSidebar()

  const [shouldRenderMobile, setShouldRenderMobile] = useState(false)

  useEffect(() => {
    if (isMobileOpen) {
      setShouldRenderMobile(true)
    } else {
      const timer = setTimeout(() => setShouldRenderMobile(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isMobileOpen])

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
    background: 'var(--color-sidebar-bg)',
    borderRight: '2px solid var(--color-border-strong)',
    zIndex: 'var(--z-sticky)' as unknown as number,
    transition: `width var(--transition-base)`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const mobileSidebarStyle: React.CSSProperties = {
    ...sidebarStyle,
    width: SIDEBAR_EXPANDED_WIDTH,
    transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: `transform var(--transition-base)`,
    zIndex: 1000,
  }

  const renderDashboardLink = (forceExpanded = false) => {
    const expanded = forceExpanded || !isCollapsed
    return (
      <NavLink
        to="/"
        end
        title={DASHBOARD_ROUTE.label}
        style={({ isActive }) => ({
          ...navLinkBase,
          justifyContent: expanded ? 'flex-start' : 'center',
          padding: expanded ? '8px 12px' : '8px',
          background: isActive ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
          color: isActive ? 'var(--color-sidebar-text-active)' : 'var(--color-sidebar-text)',
          opacity: isActive ? 1 : undefined,
        })}
        className="sidebar-navlink"
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: 'var(--color-primary)',
                  borderRadius: '0 2px 2px 0',
                }}
              />
            )}
            <FontAwesomeIcon
              icon={DASHBOARD_ROUTE.icon}
              style={{ width: '16px', height: '16px', flexShrink: 0 }}
            />
            {expanded && (
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {DASHBOARD_ROUTE.label}
              </span>
            )}
          </>
        )}
      </NavLink>
    )
  }

  const renderNavSections = (forceExpanded = false) => {
    const expanded = forceExpanded || !isCollapsed
    return NAV_SECTIONS.map((section) => {
      const isOpen = openSections.includes(section.id)
      return (
        <div key={section.id}>
          {expanded ? (
            <button
              onClick={() => toggleSection(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '6px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: '8px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FontAwesomeIcon
                  icon={section.icon}
                  style={{ width: '12px', height: '12px' }}
                />
                {section.label}
              </span>
              <ChevronDown rotated={isOpen} />
            </button>
          ) : (
            <div style={thinDividerStyle} />
          )}

          {(isOpen || !expanded) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '2px 8px' }}>
              {section.routes.map((route) => (
                <div key={route.path}>
                  {route.divider && expanded && <div style={thinDividerStyle} />}
                  {route.divider && !expanded && null}
                  <NavLink
                    to={route.path}
                    end={route.path === '/community'}
                    title={route.label}
                    style={({ isActive }) => ({
                      ...navLinkBase,
                      justifyContent: expanded ? 'flex-start' : 'center',
                      padding: expanded ? '8px 12px' : '8px',
                      background: isActive && !route.disabled
                        ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                        : 'transparent',
                      borderLeft: isActive && !route.disabled
                        ? '2px solid var(--color-primary)'
                        : '2px solid transparent',
                      color: route.disabled
                        ? 'var(--color-text-muted)'
                        : isActive
                        ? 'var(--color-sidebar-text-active)'
                        : 'var(--color-sidebar-text)',
                      opacity: route.disabled ? 0.5 : 1,
                      pointerEvents: route.disabled ? 'none' : 'auto',
                      cursor: route.disabled ? 'default' : 'pointer',
                    })}
                    className="sidebar-navlink"
                    tabIndex={route.disabled ? -1 : 0}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !route.disabled && (
                          <span
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '2px',
                              background: 'var(--color-primary)',
                              borderRadius: '0 2px 2px 0',
                            }}
                          />
                        )}
                        <FontAwesomeIcon
                          icon={route.icon}
                          style={{ width: '16px', height: '16px', flexShrink: 0 }}
                        />
                        {expanded && (
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {route.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    })
  }

  // Community bottom bar — 4 icon-only buttons spanning full width
  const renderCommunityBar = () => (
    <div
      style={{
        borderTop: '1px solid var(--color-sidebar-border)',
        padding: '6px 4px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexShrink: 0,
        gap: '2px',
      }}
    >
      {COMMUNITY_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/community'}
          title={item.label}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            color: isActive ? 'var(--color-primary)' : 'var(--color-sidebar-text)',
            background: isActive
              ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
              : 'transparent',
            transition: 'background var(--transition-fast), color var(--transition-fast)',
            position: 'relative',
          })}
          className="sidebar-navlink"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    background: 'var(--color-primary)',
                    borderRadius: '0 0 2px 2px',
                  }}
                />
              )}
              <FontAwesomeIcon
                icon={item.icon}
                style={{ width: '16px', height: '16px' }}
              />
            </>
          )}
        </NavLink>
      ))}
    </div>
  )

  const sidebarContent = (forceExpanded = false) => (
    <>
      {/* Logo area */}
      <div
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          padding: forceExpanded || !isCollapsed ? '0 16px' : '0',
          justifyContent: forceExpanded || !isCollapsed ? 'flex-start' : 'center',
          borderBottom: '1px solid var(--color-sidebar-border)',
          flexShrink: 0,
        }}
      >
        {forceExpanded || !isCollapsed ? (
          <span
            style={{
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.12em',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
            }}
          >
            ASPIRE AMS
          </span>
        ) : (
          <span
            style={{
              fontWeight: 800,
              fontSize: '18px',
              color: 'var(--color-primary)',
            }}
          >
            A
          </span>
        )}
      </div>

      {/* Dashboard link */}
      <div style={{ padding: '8px 8px 4px' }}>{renderDashboardLink(forceExpanded)}</div>

      {/* Nav sections — scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '8px',
        }}
      >
        {renderNavSections(forceExpanded)}
      </div>

      {/* Community bottom bar */}
      {renderCommunityBar()}

      {/* Collapse toggle */}
      <div
        style={{
          borderTop: '1px solid var(--color-sidebar-border)',
          padding: '8px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={toggleCollapsed}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            borderRadius: 'var(--radius-md)',
            transition: 'background var(--transition-fast), color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-sidebar-hover)'
            e.currentTarget.style.color = 'var(--color-text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          <CollapseArrow collapsed={isCollapsed} />
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div style={sidebarStyle} className="sidebar-desktop">
        {sidebarContent()}
      </div>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
      )}

      {/* Mobile drawer — only mounted while open or animating closed */}
      {shouldRenderMobile && (
        <div style={mobileSidebarStyle} className="sidebar-mobile" aria-hidden={!isMobileOpen}>
          {sidebarContent(true)}
        </div>
      )}
    </>
  )
}
