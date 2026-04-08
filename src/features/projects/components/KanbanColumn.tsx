import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableProjectCard } from './SortableProjectCard'
import type { Project } from '@/types/models'
import type { ProjectStage } from '@/types/enums'

interface KanbanColumnProps {
  stage: ProjectStage
  label: string
  stageNumber: number
  projects: Project[]
  onUpdate: (id: string, data: Partial<Project>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAddProject?: () => void
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M7 2v10M2 7h10" />
    </svg>
  )
}

// Stage number badge colors — text is always contrasting
const stageBgColor: Record<ProjectStage, string> = {
  spark: 'var(--color-stage-spark)',
  expand: 'var(--color-stage-expand)',
  arrange: 'var(--color-stage-arrange)',
  elevate: 'var(--color-stage-elevate)',
  finalize: 'var(--color-stage-finalize)',
  mixing: 'var(--color-stage-mixing)',
  mastering: 'var(--color-stage-mastering)',
  complete: 'var(--color-stage-complete)',
}

export function KanbanColumn({
  stage,
  label,
  stageNumber,
  projects,
  onUpdate,
  onDelete,
  onAddProject,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Column header */}
      <div
        style={{
          height: 40,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 8,
          paddingRight: 8,
          borderBottom: '1px solid var(--color-border)',
          gap: 8,
        }}
      >
        {/* Left: number badge + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span
            style={{
              width: 20,
              height: 20,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: stageBgColor[stage],
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: 11,
              color: '#000',
              lineHeight: 1,
            }}
          >
            {stageNumber}
          </span>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        </div>

        {/* Right: count + optional add button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 11,
              color: 'var(--color-text-muted)',
              fontWeight: 600,
              minWidth: 16,
              textAlign: 'right',
            }}
          >
            {projects.length}
          </span>
          {onAddProject && (
            <button
              onClick={onAddProject}
              aria-label="Add project"
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                padding: 0,
              }}
            >
              <PlusIcon />
            </button>
          )}
        </div>
      </div>

      {/* Column body — droppable area */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          background: isOver
            ? 'color-mix(in srgb, var(--color-primary) 4%, transparent)'
            : 'transparent',
          transition: 'background 150ms ease',
        }}
      >
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {projects.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: 'var(--color-text-muted)',
                opacity: 0.5,
                userSelect: 'none',
                minHeight: 60,
              }}
            >
              Drop here
            </div>
          ) : (
            projects.map((project, idx) => (
              <div
                key={project.id}
                style={{
                  borderBottom:
                    idx < projects.length - 1
                      ? '1px solid var(--color-border-subtle)'
                      : 'none',
                  paddingBottom: idx < projects.length - 1 ? 8 : 0,
                  marginBottom: idx < projects.length - 1 ? 8 : 0,
                }}
              >
                <SortableProjectCard
                  project={project}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              </div>
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
