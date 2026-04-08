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
import type { Contact } from '@/types/models'
import type { ContactFormData } from '@/lib/validators/schemas'

export function useContacts() {
  const user = useAuthStore((s) => s.user)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setContacts([])
      setIsLoading(false)
      return
    }

    const colRef = userCollection(user.uid, 'contacts')
    const unsubscribe = onDocumentsSnapshot<Contact>(
      colRef,
      (docs) => {
        setContacts(docs)
        setIsLoading(false)
      },
      [orderBy('createdAt', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  const addContact = async (data: ContactFormData): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'contacts')
    try {
      await addDocument<Contact>(colRef, {
        name: data.name,
        role: data.role,
        email: data.email ?? '',
        phone: data.phone ?? '',
        notes: data.notes ?? '',
        socials: {},
        labelRefs: [],
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add contact'))
      throw err
    }
  }

  const updateContact = async (
    id: string,
    data: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'contacts')
    try {
      await updateDocument(colRef, id, data)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to update contact'),
      )
      throw err
    }
  }

  const deleteContact = async (id: string): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'contacts')
    try {
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to delete contact'),
      )
      throw err
    }
  }

  return {
    contacts,
    isLoading,
    error,
    addContact,
    updateContact,
    deleteContact,
  }
}
