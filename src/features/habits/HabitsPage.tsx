// =============================================================================
// Aspire AMS — HabitsPage
// Weekly habit tracker with navigation, streak badge, and configure panel.
// =============================================================================

import { useState, useMemo } from 'react'
import { useHabits } from '@/hooks/useHabits'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'

// =============================================================================
// Date helpers
// =============================================================================

/** Returns the Monday of the week containing `date`. */
function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Returns the 7 days of the week starting from monday (Mon–Sun). */
function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const startMonth = MONTH_ABBR[monday.getMonth()]
  const endMonth = MONTH_ABBR[sunday.getMonth()]
  const startDay = monday.getDate()
  const endDay = sunday.getDate()
  const year = sunday.getFullYear()
  if (startMonth === endMonth) {
    return `Week of ${startMonth} ${startDay}–${endDay}, ${year}`
  }
  return `Week of ${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`
}

// =============================================================================
// Streak computation
// Counts consecutive days from today backwards where at least one habit is done.
// =============================================================================

function computeStreak(habitDays: { date: string; habits: Record<string, boolean> }[]): number {
  const today = toDateStr(new Date())
  const completedDates = new Set(
    habitDays
      .filter((d) => Object.values(d.habits).some(Boolean))
      .map((d) => d.date),
  )

  let streak = 0
  const cursor = new Date()
  // Start from today; if today not done, streak might still be ongoing from yesterday
  while (true) {
    const dateStr = toDateStr(cursor)
    if (!completedDates.has(dateStr)) {
      // If it's today and not done yet, skip to yesterday to check ongoing streak
      if (dateStr === today) {
        cursor.setDate(cursor.getDate() - 1)
        continue
      }
      break
    }
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// =============================================================================
// CheckIcon SVG
// =============================================================================

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3 3L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// =============================================================================
// HabitsPage
// =============================================================================

export function HabitsPage() {
  const { habitNames, habitDays, isLoading, toggleHabit, saveHabitNames } = useHabits()

  const today = useMemo(() => new Date(), [])
  const todayStr = toDateStr(today)
  const currentMondayRef = useMemo(() => getMondayOf(today), [today])

  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(today))
  const [showConfigure, setShowConfigure] = useState(false)
  const [newHabitInput, setNewHabitInput] = useState('')
  const [pendingHabits, setPendingHabits] = useState<string[]>([])

  // Track if configure panel was opened — sync pendingHabits from habitNames
  const openConfigure = () => {
    setPendingHabits([...habitNames])
    setShowConfigure(true)
  }

  const closeConfigure = () => {
    setShowConfigure(false)
    setNewHabitInput('')
  }

  const addNewHabit = () => {
    const trimmed = newHabitInput.trim()
    if (!trimmed || pendingHabits.includes(trimmed)) return
    const updated = [...pendingHabits, trimmed]
    setPendingHabits(updated)
    setNewHabitInput('')
    void saveHabitNames(updated)
  }

  const removeHabit = (name: string) => {
    const updated = pendingHabits.filter((h) => h !== name)
    setPendingHabits(updated)
    void saveHabitNames(updated)
  }

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])

  const isCurrentWeek = toDateStr(weekStart) === toDateStr(currentMondayRef)

  const prevWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }

  const nextWeek = () => {
    if (isCurrentWeek) return
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }

  // Completion data helpers
  const getCompletion = (date: string, habitName: string): boolean => {
    return habitDays.find((d) => d.date === date)?.habits[habitName] ?? false
  }

  // Weekly summary
  const weeklyStats = useMemo(() => {
    const totalCells = habitNames.length * 7
    if (totalCells === 0) return 0
    let completed = 0
    weekDays.forEach((day) => {
      const dateStr = toDateStr(day)
      habitNames.forEach((habit) => {
        if (getCompletion(dateStr, habit)) completed++
      })
    })
    return totalCells > 0 ? Math.round((completed / totalCells) * 100) : 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitNames, habitDays, weekDays])

  const streak = useMemo(() => computeStreak(habitDays), [habitDays])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spinner />
      </div>
    )
  }

  const cellSize = 28

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Habits
          </h1>
          {streak > 0 && (
            <span style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.07em',
              border: '1px solid var(--color-stage-expand)',
              color: 'var(--color-stage-expand)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 8px',
            }}>
              {streak}d STREAK
            </span>
          )}
        </div>
        <button
          onClick={showConfigure ? closeConfigure : openConfigure}
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            padding: '4px 12px',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.07em',
            color: 'var(--color-text-secondary)',
          }}
        >
          {showConfigure ? 'DONE' : 'CONFIGURE'}
        </button>
      </div>

      {/* Configure panel */}
      {showConfigure && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 16,
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            Configure Habits
          </div>
          {/* Existing habit chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {pendingHabits.map((name) => (
              <span key={name} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                fontSize: 12,
                color: 'var(--color-text-primary)',
              }}>
                {name}
                <button
                  onClick={() => removeHabit(name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: 'var(--color-text-muted)',
                    fontSize: 14,
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={`Remove ${name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {/* Add new habit */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={newHabitInput}
              onChange={(e) => setNewHabitInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNewHabit()}
              placeholder="New habit name..."
              style={{
                flex: 1,
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
                padding: '6px 10px',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <Button variant="primary" size="sm" onClick={addNewHabit} disabled={!newHabitInput.trim()}>
              ADD
            </Button>
          </div>
        </div>
      )}

      {/* Week navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: '8px 0',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button
          onClick={prevWeek}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.07em',
            color: 'var(--color-text-secondary)',
            padding: '4px 8px',
          }}
        >
          &lt; PREV WEEK
        </button>
        <span style={{
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          letterSpacing: '0.05em',
        }}>
          {formatWeekRange(weekStart).toUpperCase()}
        </span>
        <button
          onClick={nextWeek}
          disabled={isCurrentWeek}
          style={{
            background: 'none',
            border: 'none',
            cursor: isCurrentWeek ? 'default' : 'pointer',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.07em',
            color: isCurrentWeek ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
            opacity: isCurrentWeek ? 0.4 : 1,
            padding: '4px 8px',
          }}
        >
          NEXT WEEK &gt;
        </button>
      </div>

      {/* Habit grid */}
      {habitNames.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>No habits configured</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>Click CONFIGURE above to add habits to track.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 500 }}>
            <thead>
              <tr>
                {/* Habit name column header */}
                <th style={{
                  width: 200,
                  textAlign: 'left',
                  padding: '0 12px 10px 0',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--color-text-muted)',
                  fontWeight: 400,
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  HABIT
                </th>
                {weekDays.map((day, i) => {
                  const dateStr = toDateStr(day)
                  const isToday = dateStr === todayStr
                  return (
                    <th key={dateStr} style={{
                      width: cellSize + 12,
                      textAlign: 'center',
                      padding: `0 6px 10px`,
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: isToday ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: isToday ? 700 : 400,
                      borderBottom: '1px solid var(--color-border)',
                    }}>
                      <div>{DAY_LABELS[i]}</div>
                      <div style={{ fontSize: 11, marginTop: 2, color: isToday ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                        {day.getDate()}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {habitNames.map((habit, habitIdx) => (
                <tr key={habit} style={{ borderBottom: habitIdx === habitNames.length - 1 ? 'none' : '1px solid var(--color-border)' }}>
                  <td style={{
                    padding: '8px 12px 8px 0',
                    fontSize: 13,
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 200,
                  }}>
                    {habit}
                  </td>
                  {weekDays.map((day) => {
                    const dateStr = toDateStr(day)
                    const isFuture = dateStr > todayStr
                    const completed = getCompletion(dateStr, habit)

                    return (
                      <td key={dateStr} style={{ padding: '8px 6px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            if (!isFuture) {
                              void toggleHabit(dateStr, habit, completed)
                            }
                          }}
                          disabled={isFuture}
                          aria-label={`${habit} on ${dateStr}: ${completed ? 'done' : 'not done'}`}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            border: completed
                              ? 'none'
                              : '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            background: completed ? 'var(--color-primary)' : 'transparent',
                            cursor: isFuture ? 'default' : 'pointer',
                            opacity: isFuture ? 0.3 : 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            transition: 'background 0.12s, border-color 0.12s',
                          }}
                        >
                          {completed && <CheckIcon />}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Weekly summary */}
      {habitNames.length > 0 && (
        <div style={{
          marginTop: 24,
          padding: '12px 16px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <span style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'var(--color-text-secondary)',
          }}>
            WEEKLY SUMMARY
          </span>
          <span style={{
            fontSize: 18,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: weeklyStats >= 70
              ? 'var(--color-stage-complete)'
              : weeklyStats >= 40
                ? 'var(--color-stage-expand)'
                : 'var(--color-text-primary)',
          }}>
            {weeklyStats}%
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            completion for this week
          </span>
        </div>
      )}
    </div>
  )
}
