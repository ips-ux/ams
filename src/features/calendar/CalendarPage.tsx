// =============================================================================
// Aspire AMS — CalendarPage
// Read-only aggregate calendar from releases + todos with due dates.
// =============================================================================

import { useState } from 'react'
import { useReleases } from '@/hooks/useReleases'
import { useTodos } from '@/hooks/useTodos'
import { Spinner } from '@/components/ui/Spinner'

interface CalendarEvent {
  id: string
  label: string
  kind: 'release' | 'todo'
}

function buildCalendarGrid(year: number, month: number): (Date | null)[][] {
  // Returns weeks (rows) of days; null = empty cell before/after month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Monday = 0, Sunday = 6 (ISO week)
  const startDow = (firstDay.getDay() + 6) % 7 // getDay(): Sun=0; shift to Mon=0
  const totalDays = lastDay.getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export function CalendarPage() {
  const { releases, isLoading: relLoading } = useReleases()
  const { todos, isLoading: todoLoading } = useTodos()

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const prevMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const weeks = buildCalendarGrid(year, month)

  // Build event map: dateKey -> CalendarEvent[]
  const eventMap = new Map<string, CalendarEvent[]>()

  const addEvent = (date: Date, event: CalendarEvent) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    if (!eventMap.has(key)) eventMap.set(key, [])
    eventMap.get(key)!.push(event)
  }

  const getEvents = (date: Date): CalendarEvent[] => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    return eventMap.get(key) ?? []
  }

  releases.forEach((r) => {
    const d = r.releaseDate?.toDate()
    if (d) addEvent(d, { id: r.id, label: r.title, kind: 'release' })
  })

  todos.forEach((t) => {
    const d = t.dueDate?.toDate()
    if (d) addEvent(d, { id: t.id, label: t.text, kind: 'todo' })
  })

  const isLoading = relLoading || todoLoading

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>Calendar</h1>
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button
          onClick={prevMonth}
          style={{
            background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer',
            padding: '5px 10px', fontSize: 11, fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)',
          }}
        >{'< PREV'}</button>
        <span style={{
          fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700,
          color: 'var(--color-text-primary)', letterSpacing: '0.07em', minWidth: 140, textAlign: 'center',
        }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer',
            padding: '5px 10px', fontSize: 11, fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)',
          }}
        >{'NEXT >'}</button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 0, background: 'var(--color-stage-complete)', display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Release</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 0, background: 'var(--color-primary)', display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Todo</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--color-border)' }}>
          {DAY_LABELS.map((d) => (
            <div key={d} style={{
              padding: '6px 8px', fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700,
              color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em',
              textAlign: 'center', background: 'var(--color-surface-elevated)',
            }}>{d}</div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div
            key={wi}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: wi === weeks.length - 1 ? 'none' : '1px solid var(--color-border)',
            }}
          >
            {week.map((day, di) => {
              const isToday = day !== null && isSameDay(day, today)
              const events = day !== null ? getEvents(day) : []
              const visibleEvents = events.slice(0, 2)
              const extraCount = events.length - 2

              return (
                <div
                  key={di}
                  style={{
                    minHeight: 80, padding: '6px 7px',
                    borderRight: di === 6 ? 'none' : '1px solid var(--color-border)',
                    background: day === null ? 'color-mix(in srgb, var(--color-border) 15%, transparent)' : 'transparent',
                    verticalAlign: 'top',
                  }}
                >
                  {day !== null && (
                    <>
                      {/* Date number */}
                      <div style={{
                        fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: isToday ? 800 : 400,
                        color: isToday ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        marginBottom: 4,
                      }}>{day.getDate()}</div>

                      {/* Events */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {visibleEvents.map((ev) => (
                          <div key={ev.id} style={{
                            fontSize: 9, fontFamily: 'var(--font-mono)', padding: '1px 4px',
                            borderRadius: 'var(--radius-sm)',
                            background: ev.kind === 'release'
                              ? 'color-mix(in srgb, var(--color-stage-complete) 20%, transparent)'
                              : 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                            color: ev.kind === 'release' ? 'var(--color-stage-complete)' : 'var(--color-primary)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            border: `1px solid ${ev.kind === 'release' ? 'var(--color-stage-complete)' : 'var(--color-primary)'}`,
                          }}>
                            {ev.label}
                          </div>
                        ))}
                        {extraCount > 0 && (
                          <div style={{
                            fontSize: 9, fontFamily: 'var(--font-mono)',
                            color: 'var(--color-text-muted)',
                          }}>+{extraCount} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
