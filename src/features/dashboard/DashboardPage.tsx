import { Link } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { PROJECT_STAGES } from '@/types/enums'
import type { ProjectStage } from '@/types/enums'
import { ProtocolCallout } from '@/components/ui/ProtocolCallout'

const TIPS = [
  { label: 'PRODUCTION', text: 'Focus on the arrangement — most mix problems are arrangement problems.' },
  { label: 'BRANDING', text: 'Your sound IS your brand. Consistency builds recognition faster than promotion.' },
  { label: 'WORKFLOW', text: 'Finish tracks, even imperfect ones. A completed song teaches more than 10 unfinished ones.' },
  { label: 'PROMOTION', text: 'Release consistently. The algorithm rewards artists who show up regularly.' },
  { label: 'MINDSET', text: 'Compare your work to your past self, not other artists. Progress is personal.' },
]

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-sm)',
  padding: '20px',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--color-text-secondary)',
  marginBottom: '12px',
  display: 'block',
}

const statLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-secondary)',
  marginTop: '4px',
}

function stageDotStyle(stage: ProjectStage): React.CSSProperties {
  return {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: `var(--color-stage-${stage})`,
    flexShrink: 0,
    display: 'inline-block',
  }
}

export function DashboardPage() {
  const { projects } = useProjects()

  const stageCounts = PROJECT_STAGES.map((stage) => ({
    stage,
    count: projects.filter((p) => p.stage === stage).length,
  }))

  const total = projects.length || 1
  const completeCount = projects.filter((p) => p.stage === 'complete').length
  const inProgressCount = projects.filter(
    (p) => p.stage !== 'complete' && p.stage !== 'spark',
  ).length
  const releasedCount = projects.filter((p) => p.submissionStatus === 'released').length

  const recentProjects = [...projects]
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, 5)

  const maxStageCount = Math.max(...stageCounts.map((s) => s.count), 1)
  const completionPct = Math.round((completeCount / total) * 100)

  const svgR = 40
  const svgCircumference = 2 * Math.PI * svgR
  const svgDash = (completionPct / 100) * svgCircumference

  const tip = TIPS[new Date().getDate() % 5]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '16px',
        padding: '24px',
      }}
    >
      {/* Card 1 — Pipeline Overview (12 cols) */}
      <div style={{ ...cardStyle, gridColumn: 'span 12' }}>
        <span style={labelStyle}>Project Pipeline</span>
        {/* Horizontal segmented bar */}
        <div style={{ display: 'flex', height: '8px', width: '100%', gap: '2px', marginBottom: '12px' }}>
          {stageCounts.map(({ stage, count }) => (
            <div
              key={stage}
              style={{
                flex: count || 0.1,
                background: `var(--color-stage-${stage})`,
                height: '8px',
                minWidth: count > 0 ? '4px' : 0,
                opacity: count > 0 ? 1 : 0.2,
              }}
            />
          ))}
        </div>
        {/* Stage labels */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {stageCounts.map(({ stage, count }) => (
            <span
              key={stage}
              style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={stageDotStyle(stage)} />
              {stage} ({count})
            </span>
          ))}
        </div>
      </div>

      {/* Card 2 — Quick Stats (4 cols) */}
      <div style={{ ...cardStyle, gridColumn: 'span 4' }}>
        <span style={labelStyle}>Quick Stats</span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {projects.length}
            </div>
            <div style={statLabelStyle}>Total Projects</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {inProgressCount}
            </div>
            <div style={statLabelStyle}>In Progress</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {completeCount}
            </div>
            <div style={statLabelStyle}>Complete</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {releasedCount}
            </div>
            <div style={statLabelStyle}>Released</div>
          </div>
        </div>
      </div>

      {/* Card 3 — Recent Projects (8 cols) */}
      <div style={{ ...cardStyle, gridColumn: 'span 8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ ...labelStyle, marginBottom: 0 }}>Recent Projects</span>
          <Link
            to="/projects"
            style={{
              fontSize: '12px',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          >
            View all →
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
            No projects yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to="/projects"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid transparent',
                  transition: 'border-color var(--transition-fast), background var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = 'var(--color-border)'
                  el.style.background = 'var(--color-surface-elevated)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = 'transparent'
                  el.style.background = 'transparent'
                }}
              >
                <span style={stageDotStyle(project.stage)} />
                <span
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {project.title}
                </span>
                {project.genre && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      padding: '1px 6px',
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {project.genre}
                  </span>
                )}
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: `var(--color-stage-${project.stage})`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {project.stage}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Card 4 — Stage Breakdown (6 cols) */}
      <div style={{ ...cardStyle, gridColumn: 'span 6' }}>
        <span style={labelStyle}>By Stage</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stageCounts.map(({ stage, count }) => (
            <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                  width: '72px',
                  flexShrink: 0,
                  textTransform: 'capitalize',
                }}
              >
                {stage}
              </span>
              <div
                style={{
                  flex: 1,
                  height: '6px',
                  background: 'var(--color-border)',
                }}
              >
                <div
                  style={{
                    height: '6px',
                    width: `${(count / maxStageCount) * 100}%`,
                    background: `var(--color-stage-${stage})`,
                    transition: 'width var(--transition-fast)',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-primary)',
                  width: '20px',
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 5 — Completion Rate (6 cols) */}
      <div style={{ ...cardStyle, gridColumn: 'span 6' }}>
        <span style={labelStyle}>Completion Rate</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div>
            <div
              style={{
                fontSize: '40px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                lineHeight: 1,
              }}
            >
              {completionPct}%
            </div>
            <div style={{ ...statLabelStyle, marginTop: '8px' }}>of projects complete</div>
          </div>
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            style={{ flexShrink: 0 }}
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={svgR}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="8"
            />
            {/* Progress arc */}
            <circle
              cx="50"
              cy="50"
              r={svgR}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="8"
              strokeDasharray={`${svgDash} ${svgCircumference}`}
              strokeLinecap="butt"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
      </div>

      {/* Card 6 — Aspire Tip (12 cols) */}
      <div style={{ gridColumn: 'span 12' }}>
        <ProtocolCallout title={tip.label} variant="info">
          {tip.text}
        </ProtocolCallout>
      </div>
    </div>
  )
}
