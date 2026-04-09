// =============================================================================
// Aspire AMS — useLibraryDocs
// Fetches the library manifest from Firestore with localStorage caching.
//
// Cache key : ams_lib_manifest
// TTL       : 1 hour (re-fetches once per session after that)
// Invalidation: time-based only; individual full docs use version-based cache
// =============================================================================

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { LibraryManifest, ManifestEntry } from '@/types/models'

const CACHE_KEY = 'ams_lib_manifest'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

interface CachedManifest {
  cachedAt: number
  data: LibraryManifest
}

export interface UseLibraryDocsResult {
  docs: ManifestEntry[]
  globalTips: string[]
  versions: Record<string, number>
  loading: boolean
  error: string | null
}

export function useLibraryDocs(): UseLibraryDocsResult {
  const [docs, setDocs] = useState<ManifestEntry[]>([])
  const [globalTips, setGlobalTips] = useState<string[]>([])
  const [versions, setVersions] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchManifest() {
      try {
        // Serve from cache if fresh
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { cachedAt, data }: CachedManifest = JSON.parse(cached)
          if (Date.now() - cachedAt < CACHE_TTL_MS) {
            setDocs(data.docs ?? [])
            setGlobalTips(data.globalTips ?? [])
            setVersions(data.versions ?? {})
            setLoading(false)
            return
          }
        }

        // Fetch from Firestore
        const manifestRef = doc(db, 'aspireMethods', '--manifest')
        const snapshot = await getDoc(manifestRef)

        if (!snapshot.exists()) {
          setError('Library manifest not found.')
          setLoading(false)
          return
        }

        const data = snapshot.data() as LibraryManifest
        setDocs(data.docs ?? [])
        setGlobalTips(data.globalTips ?? [])
        setVersions(data.versions ?? {})

        // Persist to cache
        const entry: CachedManifest = { cachedAt: Date.now(), data }
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load library')
      } finally {
        setLoading(false)
      }
    }

    void fetchManifest()
  }, [])

  return { docs, globalTips, versions, loading, error }
}
