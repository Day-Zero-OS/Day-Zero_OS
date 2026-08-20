import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Clock,
  Flame,
  CheckCircle2,
  Circle,
  AlertCircle,
  FileText,
  FolderOpen,
  CalendarCheck,
  TrendingUp,
} from 'lucide-react'
import type { Screen } from '@/types/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'
import {
  fetchDashboardData,
  type DashboardData,
} from '@/features/mission-control/services/mission-control.service'
import { Skeleton } from '@/components/ui/Skeleton'

function MissionControlSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-background p-4 sm:p-6 lg:p-9 animate-pulse">
      {/* Header Skeleton */}
      <div style={{ marginBottom: '32px' }}>
        <Skeleton height={14} width={150} />
        <div style={{ height: '8px' }} />
        <Skeleton height={28} width={280} />
        <div style={{ height: '8px' }} />
        <Skeleton height={16} width={360} />
      </div>

      {/* Today's Mission Skeleton */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '20px 24px',
          marginBottom: '24px',
          borderLeft: '3px solid var(--border)',
        }}
      >
        <Skeleton height={12} width={120} />
        <div style={{ height: '12px' }} />
        <Skeleton height={16} width="60%" />
        <div style={{ height: '8px' }} />
        <Skeleton height={14} width="40%" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px',
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <Skeleton height={12} width={80} />
              <div style={{ height: '16px' }} />
              <Skeleton height={18} width="90%" />
              <div style={{ height: '8px' }} />
              <Skeleton height={14} width="70%" />
            </div>
            <Skeleton height={12} width={100} />
          </div>
        ))}
      </div>
    </div>
  )
}


const statusDot = (color: string) => (
  <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
)

interface Props {
  onNavigate: (s: Screen) => void
}

export default function MissionControl({ onNavigate }: Props) {
  const { profile, user } = useAuth()
  const { workspaceId } = useWorkspace()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    async function loadData() {
      if (!workspaceId) return
      try {
        const dashboard = await fetchDashboardData(workspaceId)
        if (active) {
          setData(dashboard)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [workspaceId])

  if (loading) {
    return <MissionControlSkeleton />
  }

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Alex'
  const activeCount = data?.activeProjectsCount ?? 0
  const deadlinesCount = data?.deadlinesCount ?? 0

  return (
    <div className="h-full overflow-y-auto bg-background p-4 sm:p-6 lg:p-9">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: '13px',
            margin: '0 0 4px',
            fontFamily: 'monospace',
          }}
        >
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h1 style={{ fontSize: '26px', fontWeight: 600, margin: 0, letterSpacing: '-0.03em' }}>
          Good morning, {name}.
        </h1>
        <p style={{ color: 'var(--secondary-foreground)', fontSize: '14px', margin: '6px 0 0' }}>
          You have {activeCount} active project{activeCount !== 1 ? 's' : ''} and {deadlinesCount} urgent
          deadline{deadlinesCount !== 1 ? 's' : ''} this week.
        </p>
      </div>

      {/* Today's Mission */}
      {data?.todayMission && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '20px 24px',
            marginBottom: '24px',
            borderLeft: '3px solid var(--status-blue)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Flame size={14} color="var(--status-orange)" />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Today&apos;s Mission
            </span>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            {data.todayMission.title}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: 0 }}>
            {data.todayMission.focus} · {data.todayMission.deadline}
          </p>
        </div>
      )}

      {/* Grid: top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Current Project */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted-foreground)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            Current Project
          </div>
          {activeCount > 0 ? (
            <>
              <div
                style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', letterSpacing: '-0.02em' }}
              >
                Active workspace
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                {statusDot('var(--status-blue)')}
                <span style={{ fontSize: '12px', color: 'var(--secondary-foreground)' }}>
                  {activeCount} active projects
                </span>
              </div>
              <button
                onClick={() => onNavigate('projects')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                Go to Projects <ArrowRight size={12} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>No active projects</div>
              <button
                onClick={() => onNavigate('projects')}
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Create a project
              </button>
            </div>
          )}
        </div>

        {/* Current Sprint */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted-foreground)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            Current Sprint
          </div>
          {data?.currentSprint ? (
            <>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  letterSpacing: '-0.02em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.currentSprint.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--secondary-foreground)', marginBottom: '12px' }}>
                {data.currentSprint.status}
              </div>
              <div
                style={{ background: 'var(--secondary)', borderRadius: '3px', height: '4px', width: '100%' }}
              >
                <div
                  style={{
                    background: 'var(--status-green)',
                    height: '4px',
                    borderRadius: '3px',
                    width: `${data.currentSprint.progress}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                {data.currentSprint.progress}% complete
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>No active sprints</div>
              <button
                onClick={() => onNavigate('projects')}
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Create a Milestone
              </button>
            </div>
          )}
        </div>

        {/* Weekly Progress */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted-foreground)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            Weekly Progress
          </div>
          {data?.weeklyProgress ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  label: 'Milestones Done',
                  val: data.weeklyProgress.tasksDone,
                  max: data.weeklyProgress.tasksMax,
                  color: 'var(--status-green)',
                },
                {
                  label: 'Notes Written',
                  val: data.weeklyProgress.notesDone,
                  max: data.weeklyProgress.notesMax,
                  color: 'var(--status-purple)',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--secondary-foreground)' }}>
                      {item.label}
                    </span>
                    <span
                      style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}
                    >
                      {item.val}/{item.max}
                    </span>
                  </div>
                  <div style={{ background: 'var(--secondary)', borderRadius: '3px', height: '3px' }}>
                    <div
                      style={{
                        background: item.color,
                        height: '3px',
                        borderRadius: '3px',
                        width: `${Math.min((item.val / item.max) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>No metrics logged yet</div>
          )}
        </div>
      </div>

      {/* Grid: bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Upcoming Deadlines */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted-foreground)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '16px',
            }}
          >
            Upcoming Deadlines
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.upcomingDeadlines && data.upcomingDeadlines.length > 0 ? (
              data.upcomingDeadlines.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertCircle
                    size={13}
                    color={d.urgent ? 'var(--status-red)' : 'var(--muted-foreground)'}
                    style={{ marginTop: '2px', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {d.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{d.project}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: d.urgent ? 'rgba(239,68,68,0.12)' : 'var(--secondary)',
                      color: d.urgent ? 'var(--status-red)' : 'var(--muted-foreground)',
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                    }}
                  >
                    {d.date}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', padding: '8px 0' }}>
                No upcoming deadlines this week.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted-foreground)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '16px',
            }}
          >
            Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'New Project', icon: <FolderOpen size={14} />, action: () => onNavigate('projects') },
              { label: 'New Note', icon: <FileText size={14} />, action: () => onNavigate('knowledge-base') },
              {
                label: 'Log Content',
                icon: <TrendingUp size={14} />,
                action: () => onNavigate('content-engine'),
              },
              {
                label: 'Weekly Review',
                icon: <CalendarCheck size={14} />,
                action: () => onNavigate('weekly-debrief'),
              },
            ].map((qa) => (
              <button
                key={qa.label}
                onClick={qa.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  color: 'var(--secondary-foreground)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--muted)'
                  e.currentTarget.style.color = 'var(--foreground)'
                  e.currentTarget.style.borderColor = 'var(--ring)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--secondary)'
                  e.currentTarget.style.color = 'var(--secondary-foreground)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                {qa.icon}
                {qa.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity + Recent Files row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div
          className="lg:col-span-2"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted-foreground)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '16px',
            }}
          >
            Recent Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 0',
                    borderBottom: i < data.recentActivities.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ marginTop: '1px', flexShrink: 0 }}>
                    {a.iconType === 'check' ? (
                      <CheckCircle2 size={13} color="var(--status-green)" />
                    ) : (
                      <Circle size={13} color="var(--muted-foreground)" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {a.text}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{a.project}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted-foreground)',
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                    }}
                  >
                    {a.time}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', padding: '12px 0' }}>
                No recent activity logged.
              </div>
            )}
          </div>
        </div>

        {/* Recent Knowledge */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                color: 'var(--muted-foreground)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Recent Knowledge
            </span>
            <button
              onClick={() => onNavigate('knowledge-base')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted-foreground)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                padding: 0,
              }}
            >
              All <ArrowRight size={11} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {data?.recentKnowledge && data.recentKnowledge.length > 0 ? (
              data.recentKnowledge.map((n, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onClick={() => onNavigate('knowledge-base')}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')
                  }
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <Clock size={11} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '12px',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {n.title}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      background: 'var(--secondary)',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {n.tag}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', padding: '12px 0' }}>
                No recent knowledge entries.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
