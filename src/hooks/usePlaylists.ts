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
import type { Playlist } from '@/types/models'
import type { SocialPlatform } from '@/types/enums'

export interface PlaylistFormData {
  name: string
  platform: string
  url: string
  trackNamesRaw?: string
  notes?: string
}

export function usePlaylists() {
  const user = useAuthStore((s) => s.user)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setPlaylists([])
      setIsLoading(false)
      return
    }
    const colRef = userCollection(user.uid, 'playlists')
    const unsubscribe = onDocumentsSnapshot<Playlist>(
      colRef,
      (docs) => {
        setPlaylists(docs)
        setIsLoading(false)
      },
      [orderBy('createdAt', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  const addPlaylist = async (data: PlaylistFormData): Promise<void> => {
    if (!user) return
    const trackNames = data.trackNamesRaw
      ? data.trackNamesRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : []
    const colRef = userCollection(user.uid, 'playlists')
    try {
      await addDocument<Playlist>(colRef, {
        name: data.name,
        platform: data.platform as SocialPlatform,
        url: data.url,
        trackNames,
        notes: data.notes ?? '',
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add playlist'))
      throw err
    }
  }

  const updatePlaylist = async (id: string, data: Partial<Playlist>): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'playlists')
    try {
      await updateDocument(colRef, id, data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update playlist'))
      throw err
    }
  }

  const deletePlaylist = async (id: string): Promise<void> => {
    if (!user) return
    const colRef = userCollection(user.uid, 'playlists')
    try {
      await deleteDocument(colRef, id)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete playlist'))
      throw err
    }
  }

  return { playlists, isLoading, error, addPlaylist, updatePlaylist, deletePlaylist }
}
