import { Dropdown } from '@/components/ui'
import type { Project } from '@/types/models'
import { WaveformPreview } from './WaveformPreview'

interface ProjectCardProps {
  project: Project
  onUpdate: (id: string, data: Partial<Project>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isDragging?: boolean
}

function StageProgress({ stage }: { stage: 'mixing' | 'mastering' }) {
  const fill = stage === 'mixing' ? 60 : 85
  const color =
    stage === 'mixing'
      ? 'var(--color-stage-mixing)'
      : 'var(--color-stage-mastering)'

  return (
    <div
      style={{
        height: 3,
        background: 'var(--color-surface-elevated)',
        borderRadius: 0,
        overflow: 'hidden',
        marginTop: 8,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${fill}%`,
          background: color,
          borderRadius: 0,
        }}
      />
    </div>
  )
}

function CompleteCheck() {
  return (
    <div
      style={{
        marginTop: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: 'var(--color-stage-complete)',
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 6l3 3 5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      COMPLETE
    </div>
  )
}

function MenuIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="2" cy="7" r="1.5" />
      <circle cx="7" cy="7" r="1.5" />
      <circle cx="12" cy="7" r="1.5" />
    </svg>
  )
}

export function ProjectCard({
  project,
  onUpdate: _onUpdate,
  onDelete,
  isDragging,
}: ProjectCardProps) {
  const isComplete = project.stage === 'complete'

  const latestMix =
    project.mixVersions.length > 0
      ? project.mixVersions.reduce((a, b) => (a.version > b.version ? a : b))
      : null

  const borderVar = `var(--card-border-${project.stage})`

  const menuItems = [
    {
      label: 'Edit',
      onClick: () => {
        // Edit handler — will be wired up in a later phase
      },
    },
    {
      label: 'Delete',
      danger: true,
      onClick: () => onDelete(project.id),
    },
  ]

  return (
    <div
      style={{
        background: isComplete
          ? 'var(--card-bg-complete)'
          : 'var(--color-surface)',
        border: borderVar,
        borderRadius: 'var(--radius-sm)',
        padding: 12,
        width: '100%',
        boxSizing: 'border-box',
        opacity: isDragging ? 0.7 : 1,
        boxShadow: isDragging ? 'var(--shadow-xl)' : 'none',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
            wordBreak: 'break-word',
            flex: 1,
          }}
        >
          {project.title}
        </span>
        <Dropdown
          trigger={
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                color: 'var(--color-text-muted)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
              aria-label="Project options"
            >
              <MenuIcon />
            </button>
          }
          items={menuItems}
          align="right"
        />
      </div>

      {/* Metadata chips */}
      {(project.bpm != null || project.key || project.genre) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            marginBottom: latestMix?.url ? 8 : 0,
          }}
        >
          {project.bpm != null && (
            <Chip>{project.bpm} BPM</Chip>
          )}
          {project.key && <Chip>{project.key}</Chip>}
          {project.genre && <Chip>{project.genre}</Chip>}
        </div>
      )}

      {/* Waveform */}
      {latestMix?.url && (
        <div style={{ marginTop: 8 }}>
          <WaveformPreview url={latestMix.url} height={24} />
        </div>
      )}

      {/* Stage-specific bottom treatment */}
      {(project.stage === 'mixing' || project.stage === 'mastering') && (
        <StageProgress stage={project.stage} />
      )}
      {project.stage === 'complete' && <CompleteCheck />}
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '2px 6px',
        fontSize: 11,
        color: 'var(--color-text-muted)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
