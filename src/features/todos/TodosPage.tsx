// =============================================================================
// Aspire AMS — TodosPage
// Task manager with category/priority filtering and inline add form.
// =============================================================================

import { useState } from 'react'
import { useTodos } from '@/hooks/useTodos'
import { Spinner } from '@/components/ui/Spinner'
import { TODO_CATEGORIES, TODO_PRIORITIES } from '@/types/enums'
import type { TodoCategory, TodoPriority } from '@/types/enums'
import type { Todo } from '@/types/models'

const PRIORITY_COLORS: Record<TodoPriority, string> = {
  urgent: 'var(--color-danger)',
  high: 'var(--color-stage-expand)',
  medium: 'var(--color-primary)',
  low: 'var(--color-text-secondary)',
}

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  urgent: 'URGENT',
  high: 'HIGH',
  medium: 'MED',
  low: 'LOW',
}

export function TodosPage() {
  const { todos, isLoading, addTodo, deleteTodo, toggleTodo } = useTodos()

  // Add form state
  const [text, setText] = useState('')
  const [newCategory, setNewCategory] = useState<TodoCategory>('general')
  const [newPriority, setNewPriority] = useState<TodoPriority>('medium')
  const [isAdding, setIsAdding] = useState(false)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<TodoCategory | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | 'all'>('all')
  const [showCompleted, setShowCompleted] = useState(false)

  const handleAdd = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setIsAdding(true)
    try {
      await addTodo({ text: trimmed, completed: false, category: newCategory, priority: newPriority })
      setText('')
    } finally {
      setIsAdding(false)
    }
  }

  const filtered = todos.filter((t) => {
    if (!showCompleted && t.completed) return false
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  const pendingCount = todos.filter((t) => !t.completed).length
  const completedCount = todos.filter((t) => t.completed).length

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spinner />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Todos
          </h1>
          <span style={{
            fontSize: 11, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', padding: '2px 8px', color: 'var(--color-text-secondary)',
          }}>
            {pendingCount} pending
          </span>
          {completedCount > 0 && (
            <span style={{
              fontSize: 11, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', padding: '2px 8px', color: 'var(--color-text-secondary)',
            }}>
              {completedCount} done
            </span>
          )}
        </div>
        <button
          onClick={() => setShowCompleted((v) => !v)}
          style={{
            background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer',
            padding: '4px 10px', fontSize: 11, fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)',
            letterSpacing: '0.05em',
          }}
        >
          {showCompleted ? 'HIDE DONE' : 'SHOW DONE'}
        </button>
      </div>

      {/* Inline add form */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20, padding: 12,
        border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
        background: 'var(--color-surface)',
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task..."
          style={{
            flex: 1, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', padding: '6px 10px',
            fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as TodoCategory)}
          style={{
            background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', padding: '6px 8px',
            fontSize: 11, fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {TODO_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as TodoPriority)}
          style={{
            background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', padding: '6px 8px',
            fontSize: 11, fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {TODO_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          onClick={handleAdd}
          disabled={!text.trim() || isAdding}
          style={{
            background: text.trim() ? 'var(--color-primary)' : 'transparent',
            border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)',
            color: text.trim() ? '#fff' : 'var(--color-primary)', padding: '6px 14px',
            fontSize: 12, fontWeight: 700, cursor: text.trim() ? 'pointer' : 'default',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', transition: 'all 0.15s',
          }}
        >
          ADD
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)', marginBottom: 8 }}>
        {(['all', ...TODO_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat as TodoCategory | 'all')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 14px',
              fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: categoryFilter === cat ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: categoryFilter === cat ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {cat === 'all' ? 'ALL' : cat}
          </button>
        ))}
      </div>

      {/* Priority filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', ...TODO_PRIORITIES] as const).map((pri) => (
          <button
            key={pri}
            onClick={() => setPriorityFilter(pri as TodoPriority | 'all')}
            style={{
              background: priorityFilter === pri ? 'var(--color-surface-elevated)' : 'none',
              border: `1px solid ${pri === 'all' ? 'var(--color-border)' : (PRIORITY_COLORS[pri as TodoPriority] ?? 'var(--color-border)')}`,
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: '3px 10px',
              fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em',
              color: pri === 'all' ? 'var(--color-text-secondary)' : (PRIORITY_COLORS[pri as TodoPriority] ?? 'var(--color-text-secondary)'),
            }}
          >
            {pri === 'all' ? 'ALL PRIORITY' : PRIORITY_LABELS[pri as TodoPriority]}
          </button>
        ))}
      </div>

      {/* Todo list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No todos here</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>
            {todos.length === 0 ? 'Add a task above to get started.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {filtered.map((todo, i) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              isLast={i === filtered.length - 1}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

interface TodoRowProps {
  todo: Todo
  isLast: boolean
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string) => void
}

function TodoRow({ todo, isLast, onToggle, onDelete }: TodoRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
        background: hovered ? 'color-mix(in srgb, var(--color-primary) 3%, transparent)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id, todo.completed)}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
        style={{
          width: 16, height: 16, border: `1px solid ${todo.completed ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)', cursor: 'pointer', flexShrink: 0,
          background: todo.completed ? 'var(--color-primary)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0,
        }}
      >
        {todo.completed && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span style={{
        flex: 1, fontSize: 13, color: todo.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
        textDecoration: todo.completed ? 'line-through' : 'none',
      }}>
        {todo.text}
      </span>

      {/* Category chip */}
      <span style={{
        fontSize: 10, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)', padding: '1px 6px', color: 'var(--color-text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
      }}>
        {todo.category}
      </span>

      {/* Priority badge */}
      <span style={{
        fontSize: 10, fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-sm)',
        padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
        color: PRIORITY_COLORS[todo.priority],
        border: `1px solid ${PRIORITY_COLORS[todo.priority]}`,
      }}>
        {PRIORITY_LABELS[todo.priority]}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        aria-label="Delete"
        style={{
          background: 'none', border: '1px solid transparent', cursor: 'pointer',
          padding: '3px 6px', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.15s',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M2 4h10M5 4V2h4v2M5.5 6.5v4M8.5 6.5v4M3 4l.8 8h6.4L11 4" />
        </svg>
      </button>
    </div>
  )
}
