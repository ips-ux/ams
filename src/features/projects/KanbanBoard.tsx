import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Spinner, Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { useProjects } from '@/hooks/useProjects'
import { PROJECT_STAGES } from '@/types/enums'
import type { Project } from '@/types/models'
import type { ProjectStage } from '@/types/enums'
import { KanbanColumn } from './components/KanbanColumn'
import { ProjectCard } from './components/ProjectCard'
import { NewProjectModal } from './components/NewProjectModal'

const STAGE_LABELS: Record<ProjectStage, string> = {
  spark: 'SPARK',
  expand: 'EXPAND',
  arrange: 'ARRANGE',
  elevate: 'ELEVATE',
  finalize: 'FINALIZE',
  mixing: 'MIXING',
  mastering: 'MASTERING',
  complete: 'COMPLETE',
}

export function KanbanBoard() {
  const {
    projects,
    isLoading,
    addProject,
    updateProjectStage,
    updateProject,
    deleteProject,
    projectsByStage,
  } = useProjects()

  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDragStart = (event: DragStartEvent) => {
    const found = projects.find((p) => p.id === event.active.id)
    setActiveProject(found ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // over.id might be a project id (sortable) or a stage id (droppable column)
      // Check if over.id is a stage
      const targetStage = PROJECT_STAGES.find((s) => s === over.id)

      if (targetStage) {
        // Dropped directly on a column
        const draggedProject = projects.find((p) => p.id === active.id)
        if (draggedProject && draggedProject.stage !== targetStage) {
          updateProjectStage(String(active.id), targetStage)
        }
      } else {
        // Dropped on another card — find its stage
        const overProject = projects.find((p) => p.id === over.id)
        const draggedProject = projects.find((p) => p.id === active.id)
        if (
          overProject &&
          draggedProject &&
          draggedProject.stage !== overProject.stage
        ) {
          updateProjectStage(String(active.id), overProject.stage)
        }
      }
    }

    // Also handle when over is a column that contains cards
    // The over could be from sortable context which passes stage via data
    const overData = event.over?.data?.current as { stage?: ProjectStage } | undefined
    if (overData?.stage) {
      const draggedProject = projects.find((p) => p.id === active.id)
      if (draggedProject && draggedProject.stage !== overData.stage) {
        updateProjectStage(String(active.id), overData.stage)
      }
    }

    setActiveProject(null)
  }

  const handleSubmitProject = async (data: {
    title: string
    genre?: string
    bpm?: number
    key?: string
    tags?: string[]
  }) => {
    await addProject(data)
  }

  if (isLoading) {
    return (
      <div
        style={{
          height: 'calc(100vh - 56px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden',
      }}
    >
      {/* Page header */}
      <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
        <PageHeader
          title="Projects"
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              + New Project
            </Button>
          }
        />
      </div>

      {/* Kanban board */}
      <div
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              height: '100%',
              minWidth: 'max-content',
            }}
          >
            {PROJECT_STAGES.map((stage, idx) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                label={STAGE_LABELS[stage]}
                stageNumber={idx + 1}
                projects={projectsByStage(stage)}
                onUpdate={updateProject}
                onDelete={deleteProject}
                onAddProject={stage === 'spark' ? () => setIsModalOpen(true) : undefined}
              />
            ))}
          </div>

          <DragOverlay>
            {activeProject ? (
              <div style={{ width: 260, opacity: 0.9 }}>
                <ProjectCard
                  project={activeProject}
                  onUpdate={updateProject}
                  onDelete={deleteProject}
                  isDragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProject}
      />
    </div>
  )
}
