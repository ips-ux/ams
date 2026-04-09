// =============================================================================
// Aspire AMS — useLibraryDoc
// Fetches a single methodology document from Firestore on demand.
//
// Cache key : ams_doc_{slug}
// Invalidation: version-aware — re-fetches when manifest.versions[slug] changes
// =============================================================================

import { useState, useEffect, useRef } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { MethodologyDoc } from '@/types/models'
import { useLibraryDocs } from './useLibraryDocs'

const docCacheKey = (slug: string) => `ams_doc_${slug}`

interface CachedDoc {
  version: number
  data: MethodologyDoc
}

export interface UseLibraryDocResult {
  doc: MethodologyDoc | null
  loading: boolean
  error: string | null
}

export function useLibraryDoc(slug: string | undefined): UseLibraryDocResult {
  const { versions, loading: manifestLoading } = useLibraryDocs()
  const [methodDoc, setMethodDoc] = useState<MethodologyDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Track the last slug+version we fetched to avoid redundant requests
  const fetchedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!slug || manifestLoading) return

    const currentVersion = versions[slug] ?? null
    const fetchKey = `${slug}@${currentVersion ?? 'unknown'}`

    if (fetchedRef.current === fetchKey) return
    fetchedRef.current = fetchKey

    async function fetchDoc() {
      try {
        // Check cache — valid if version matches (or manifest has no version yet)
        const cached = localStorage.getItem(docCacheKey(slug!))
        if (cached) {
          const { version, data }: CachedDoc = JSON.parse(cached)
          if (currentVersion === null || version === currentVersion) {
            setMethodDoc(data)
            setLoading(false)
            return
          }
        }

        // Cache miss or version mismatch — fetch from Firestore
        const docRef = doc(db, 'aspireMethods', slug!)
        const snapshot = await getDoc(docRef)

        if (!snapshot.exists()) {
          setError('Guide not found.')
          setLoading(false)
          return
        }

        const data = { id: snapshot.id, ...snapshot.data() } as MethodologyDoc
        setMethodDoc(data)

        // Persist to cache with resolved version
        const entry: CachedDoc = { version: currentVersion ?? 1, data }
        localStorage.setItem(docCacheKey(slug!), JSON.stringify(entry))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load guide')
      } finally {
        setLoading(false)
      }
    }

    void fetchDoc()
  }, [slug, versions, manifestLoading])

  return { doc: methodDoc, loading: loading || manifestLoading, error }
}
