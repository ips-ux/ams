import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types/models'

interface SortableProjectCardProps {
  project: Project
  onUpdate: (id: string, data: Partial<Project>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SortableProjectCard({
  project,
  onUpdate,
  onDelete,
}: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    data: { stage: project.stage },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none' as const,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProjectCard
        project={project}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  )
}
