import { cn } from '../../lib/utils'

export interface TabItem {
  key: string
  label: string
  count?: number
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn('flex items-end gap-0', className)}
      role="tablist"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              'relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium',
              'focus-visible:outline-none',
              'whitespace-nowrap',
              isActive
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
            style={{ transition: 'var(--transition-fast)' }}
          >
            {tab.label}

            {tab.count !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium min-w-[20px]',
                  isActive
                    ? 'bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-primary)]'
                    : 'bg-[color-mix(in_srgb,var(--color-text-muted)_12%,transparent)] text-[var(--color-text-muted)]',
                )}
              >
                {tab.count}
              </span>
            )}

            {/* Active underline */}
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{
                background: isActive ? 'var(--color-primary)' : 'transparent',
                transition: 'var(--transition-base)',
                borderRadius: '2px 2px 0 0',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
