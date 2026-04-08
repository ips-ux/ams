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
import type { Project } from '@/types/models'
import type { MusicalKey, ProjectStage } from '@/types/enums'

export function useProjects() {
  const user = useAuthStore((s) => s.user)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setProjects([])
      setIsLoading(false)
      return
    }

    const colRef = userCollection(user.uid, 'projects')
    const unsubscribe = onDocumentsSnapshot<Project>(
      colRef,
      (docs) => {
        setProjects(docs)
        setIsLoading(false)
      },
      [orderBy('createdAt', 'desc')],
    )
    return unsubscribe
  }, [user?.uid])

  const addProject = async (data: {
    title: string
    genre?: string
    bpm?: number
    key?: string
    tags?: string[]
  }) => {
    if (!user) return
    const colRef = userCollection(user.uid, 'projects')
    return addDocument<Project>(colRef, {
      ...data,
      stage: 'spark',
      submissionStatus: 'draft',
      collaborators: [],
      tags: data.tags ?? [],
      mixVersions: [],
      credits: [],
      streamingLinks: {},
      notes: '',
      artworkUrl: null,
      releaseDate: null,
      bpm: data.bpm ?? null,
      key: (data.key as MusicalKey | null) ?? null,
      genre: data.genre ?? '',
    })
  }

  const updateProjectStage = async (projectId: string, stage: ProjectStage) => {
    if (!user) return
    const colRef = userCollection(user.uid, 'projects')
    return updateDocument(colRef, projectId, { stage })
  }

  const updateProject = async (projectId: string, data: Partial<Project>) => {
    if (!user) return
    const colRef = userCollection(user.uid, 'projects')
    return updateDocument(colRef, projectId, data)
  }

  const deleteProject = async (projectId: string) => {
    if (!user) return
    const colRef = userCollection(user.uid, 'projects')
    return deleteDocument(colRef, projectId)
  }

  const projectsByStage = (stage: ProjectStage) =>
    projects.filter((p) => p.stage === stage)

  return {
    projects,
    isLoading,
    error,
    addProject,
    updateProjectStage,
    updateProject,
    deleteProject,
    projectsByStage,
  }
}
