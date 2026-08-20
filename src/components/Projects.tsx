import { useEffect, useState } from 'react'
import {
  Plus,
  LayoutGrid,
  List,
  GitBranch,
  ExternalLink,
  Search,
  Archive,
  RotateCcw,
  Copy,
} from 'lucide-react'
import type { Screen } from '@/types/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  archiveProject,
  createProject,
  duplicateProject,
  listProjects,
  restoreProject,
  type ProjectListItem,
} from '@/features/projects/services/projects.service'
import { useFormDialog } from '@/components/ui/FormDialog'

function ProjectsSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-9 animate-pulse">
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <Skeleton height={20} width={120} />
          <div style={{ height: '6px' }} />
          <Skeleton height={14} width={180} />
        </div>
        <Skeleton height={36} width={110} />
      </div>

      {/* Filters Skeleton */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <Skeleton height={32} width={260} />
        <Skeleton height={32} width={180} />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '24px',
              height: '220px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton height={18} width="60%" />
                <Skeleton height={12} width={50} />
              </div>
              <div style={{ height: '12px' }} />
              <Skeleton height={14} width="90%" />
              <div style={{ height: '6px' }} />
              <Skeleton height={14} width="80%" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Skeleton height={12} width={60} />
                <Skeleton height={12} width={30} />
              </div>
              <Skeleton height={8} width="100%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


type ViewMode = 'table' | 'board' | 'timeline'
type Status = ProjectListItem['status']

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'var(--status-blue)', bg: 'rgba(59,130,246,0.12)' },
  'in-progress': { label: 'In Progress', color: 'var(--status-orange)', bg: 'rgba(249,115,22,0.12)' },
  completed: { label: 'Completed', color: 'var(--status-green)', bg: 'rgba(34,197,94,0.12)' },
  overdue: { label: 'Overdue', color: 'var(--status-red)', bg: 'rgba(239,68,68,0.12)' },
  archived: { label: 'Archived', color: 'var(--muted-foreground)', bg: 'var(--secondary)' },
}

const priorityConfig = {
  critical: { label: 'Critical', color: 'var(--status-red)' },
  high: { label: 'High', color: 'var(--status-orange)' },
  medium: { label: 'Medium', color: 'var(--muted-foreground)' },
  low: { label: 'Low', color: 'var(--muted-foreground)' },
}

interface Props {
  onNavigate: (s: Screen) => void
  onOpenProject?: (projectId: string) => void
}

export default function Projects({ onNavigate, onOpenProject }: Props) {
  const { user } = useAuth()
  const { workspaceId } = useWorkspace()
  const [view, setView] = useState<ViewMode>('table')
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { openForm, FormDialog } = useFormDialog()

  useEffect(() => {
    let active = true

    async function loadProjects() {
      if (!workspaceId) return
      setLoading(true)
      setError(null)

      try {
        const result = await listProjects(workspaceId, showArchived)
        if (active) setProjects(result)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load projects.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProjects()

    return () => {
      active = false
    }
  }, [showArchived, workspaceId])

  const filtered = (
    filter === 'all' ? projects : projects.filter((project) => project.status === filter)
  ).filter((project) => {
    const q = query.toLowerCase()
    return (
      !q ||
      project.name.toLowerCase().includes(q) ||
      project.description.toLowerCase().includes(q) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(q))
    )
  })
  const activeCount = projects.filter(
    (project) => project.status === 'active' || project.status === 'in-progress',
  ).length

  const openProject = (projectId: string) => {
    if (onOpenProject) {
      onOpenProject(projectId)
    } else {
      onNavigate('project-workspace')
    }
  }

  const handleCreateProject = async () => {
    if (!user) return

    const values = await openForm({
      title: 'New Project',
      fields: [
        { name: 'name', label: 'Project Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
      ],
    })
    if (!values?.name.trim()) return

    setCreating(true)
    setError(null)

    try {
      const created = await createProject({
        ownerId: user.id,
        workspaceId: workspaceId || undefined,
        name: values.name.trim(),
        description: values.description?.trim(),
      })
      setProjects((current) => [created, ...current])
      openProject(created.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project.')
    } finally {
      setCreating(false)
    }
  }

  const refresh = async () => setProjects(await listProjects(workspaceId || undefined, showArchived))

  const handleArchive = async (project: ProjectListItem) => {
    const confirm = await openForm({
      title: 'Archive Project',
      description: `Are you sure you want to archive project "${project.name}"?`,
      confirmLabel: 'Archive',
      destructive: true,
    })
    if (!confirm) return
    await archiveProject(project.id)
    await refresh()
  }

  const handleRestore = async (project: ProjectListItem) => {
    await restoreProject(project.id)
    await refresh()
  }

  const handleDuplicate = async (project: ProjectListItem) => {
    if (!user) return
    const created = await duplicateProject(user.id, project)
    setProjects((current) => [created, ...current])
  }

  if (loading) {
    return <ProjectsSkeleton />
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-9">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Projects
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>
            {projects.length} projects - {activeCount} active
          </p>
        </div>
        <button
          onClick={handleCreateProject}
          disabled={creating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--foreground)',
            color: 'var(--background)',
            border: 'none',
            borderRadius: '6px',
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: creating ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Plus size={14} /> {creating ? 'Creating' : 'New Project'}
        </button>
      </div>

      {error && (
        <div
          style={{
            border: '1px solid rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.08)',
            color: 'var(--status-red)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '13px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 w-full">
        <div className="relative w-full sm:w-[260px] flex-shrink-0">
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted-foreground)',
            }}
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
            style={{
              width: '100%',
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '7px 12px 7px 30px',
              color: 'var(--foreground)',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none w-full sm:w-auto">
          <div className="flex gap-1 bg-secondary rounded-lg p-[3px] flex-shrink-0">
            {(['all', 'active', 'in-progress', 'completed', 'overdue', 'archived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '5px',
                  border: 'none',
                  background: filter === status ? 'var(--card)' : 'transparent',
                  color: filter === status ? 'var(--foreground)' : 'var(--muted-foreground)',
                  fontSize: '12px',
                  fontWeight: filter === status ? 500 : 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.12s',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}
              >
                {status === 'all'
                  ? 'All'
                  : status === 'in-progress'
                    ? 'In Progress'
                    : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:block flex-grow" />

        <div className="flex items-center gap-2 mt-1 sm:mt-0 justify-between sm:justify-end w-full sm:w-auto">
          <button
            onClick={() => setShowArchived((value) => !value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showArchived ? 'var(--card)' : 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px 10px',
              color: 'var(--secondary-foreground)',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Archive size={12} /> Archived
          </button>

          <div
            style={{
              display: 'flex',
              gap: '4px',
              background: 'var(--secondary)',
              borderRadius: '7px',
              padding: '3px',
            }}
          >
            {[
              ['table', <List size={13} />],
              ['board', <LayoutGrid size={13} />],
              ['timeline', <GitBranch size={13} />],
            ].map(([mode, icon]) => (
              <button
                key={mode as string}
                onClick={() => setView(mode as ViewMode)}
                title={(mode as string).charAt(0).toUpperCase() + (mode as string).slice(1)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: view === mode ? 'var(--card)' : 'transparent',
                  color: view === mode ? 'var(--foreground)' : 'var(--muted-foreground)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'table' && (
        <div className="w-full overflow-x-auto border border-border rounded-lg bg-card scrollbar-thin">
          <div style={{ minWidth: '768px', overflow: 'hidden' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 100px 80px 120px 80px 40px',
                padding: '10px 20px',
                borderBottom: '1px solid var(--border)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <div>Project</div>
              <div>Status</div>
              <div>Progress</div>
              <div>Priority</div>
              <div>Deadline</div>
              <div>Activity</div>
              <div />
            </div>

            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '48px',
                  textAlign: 'center',
                  color: 'var(--muted-foreground)',
                  fontSize: '14px',
                }}
              >
                No projects found.
              </div>
            ) : (
              filtered.map((project, index) => {
                const status = statusConfig[project.status]
                return (
                  <div
                    key={project.id}
                    onClick={() => openProject(project.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 100px 80px 120px 80px 40px',
                      padding: '14px 20px',
                      borderBottom: index < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(event) => (event.currentTarget.style.background = 'var(--secondary)')}
                    onMouseLeave={(event) => (event.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>
                        {project.name}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--muted-foreground)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.description}
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: status.bg,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <ProgressCell value={project.progress} color={status.color} />
                    <div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: priorityConfig[project.priority].color,
                          fontWeight: 500,
                        }}
                      >
                        {priorityConfig[project.priority].label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--secondary-foreground)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {project.deadline}
                    </div>
                    <div
                      style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}
                    >
                      -
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--muted-foreground)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDuplicate(project)
                        }}
                        title="Duplicate"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--muted-foreground)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          if (project.status === 'archived') {
                            handleRestore(project)
                          } else {
                            handleArchive(project)
                          }
                        }}
                        title={project.status === 'archived' ? 'Restore' : 'Archive'}
                      >
                        {project.status === 'archived' ? <RotateCcw size={14} /> : <Archive size={14} />}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {view === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['active', 'in-progress', 'completed', 'overdue'] as Status[]).map((statusKey) => {
            const status = statusConfig[statusKey]
            const items = projects.filter((project) => project.status === statusKey)
            return (
              <div key={statusKey}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--secondary-foreground)' }}>
                    {status.label}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginLeft: 'auto' }}>
                    {items.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.length === 0 && (
                    <div
                      style={{
                        border: '1px dashed var(--border)',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center',
                        color: 'var(--muted-foreground)',
                        fontSize: '13px',
                      }}
                    >
                      No projects
                    </div>
                  )}
                  {items.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => openProject(project.id)}
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'border-color 0.12s',
                      }}
                      onMouseEnter={(event) => (event.currentTarget.style.borderColor = 'var(--ring)')}
                      onMouseLeave={(event) => (event.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                        {project.name}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--muted-foreground)',
                          marginBottom: '12px',
                          lineHeight: 1.5,
                        }}
                      >
                        {project.description}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              background: 'var(--secondary)',
                              borderRadius: '3px',
                              color: 'var(--muted-foreground)',
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div style={{ background: 'var(--secondary)', borderRadius: '3px', height: '3px' }}>
                        <div
                          style={{
                            background: status.color,
                            height: '3px',
                            borderRadius: '3px',
                            width: `${project.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'timeline' && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '24px',
          }}
        >
          <div style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
            Project timeline
          </div>
          {projects.length === 0 ? (
            <div style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>No projects to show.</div>
          ) : (
            projects.map((project, index) => {
              const status = statusConfig[project.status]
              const offset = Math.min(index * 8, 45)
              return (
                <div
                  key={project.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}
                >
                  <div className="w-20 sm:w-36 text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-shrink-0">
                    {project.name}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: 'var(--secondary)',
                      borderRadius: '4px',
                      height: '28px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: `${offset}%`,
                        width: `${Math.min(project.progress, 100 - offset)}%`,
                        height: '100%',
                        background: status.color,
                        borderRadius: '4px',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: `${offset + 4}%`,
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#fff',
                        mixBlendMode: 'screen',
                      }}
                    >
                      {project.deadline}
                    </div>
                  </div>
                  <div
                    style={{
                      width: '36px',
                      fontSize: '11px',
                      color: 'var(--muted-foreground)',
                      textAlign: 'right',
                      fontFamily: 'monospace',
                    }}
                  >
                    {project.progress}%
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Technologies:</span>
        {Array.from(new Set(projects.flatMap((project) => project.technologies)))
          .slice(0, 8)
          .map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: 'var(--secondary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--secondary-foreground)',
              }}
            >
              {tech}
            </span>
          ))}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <ExternalLink size={10} /> View all
        </button>
      </div>
      {FormDialog}
    </div>
  )
}

function ProgressCell({ value, color }: { value: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, background: 'var(--secondary)', borderRadius: '3px', height: '3px' }}>
          <div style={{ background: color, height: '3px', borderRadius: '3px', width: `${value}%` }} />
        </div>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--muted-foreground)',
            fontFamily: 'monospace',
            minWidth: '28px',
          }}
        >
          {value}%
        </span>
      </div>
    </div>
  )
}
