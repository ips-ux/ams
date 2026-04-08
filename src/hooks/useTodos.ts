import { useState, useEffect } from 'react'
import { orderBy } from 'firebase/firestore'
import {
  userCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  onDocumentsSnapshot,
} from '@/lib/firebase/helpers'
import { useAuthStore } from '@/hooks/useAuth'
import type { Todo } from '@/types/models'
import type { TodoFormData } from '@/lib/validators/schemas'

export function useTodos() {
  const user = useAuthStore((s) => s.user)
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setTodos([])
      setIsLoading(false)
      return
    }
    const colRef = userCollection(user.uid, 'todos')
    const unsubscribe = onDocumentsSnapshot<Todo>(
      colRef,
      (docs) => {
        setTodos(docs)
        setIsLoading(false)
      },
      [orderBy('createdAt', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  const addTodo = async (data: TodoFormData): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'todos')
    try {
      await addDocument<Todo>(colRef, {
        text: data.text,
        completed: false,
        category: data.category ?? 'general',
        priority: data.priority ?? 'medium',
        dueDate: null,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add todo'))
      throw err
    }
  }

  const updateTodo = async (id: string, data: Partial<Todo>): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'todos')
    try {
      await updateDocument(colRef, id, data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update todo'))
      throw err
    }
  }

  const deleteTodo = async (id: string): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'todos')
    try {
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete todo'))
      throw err
    }
  }

  const toggleTodo = (id: string, current: boolean) => updateTodo(id, { completed: !current })

  return { todos, isLoading, error, addTodo, updateTodo, deleteTodo, toggleTodo }
}
