import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  FileText,
  BookOpen,
  MoreHorizontal,
  Trash2,
  Upload,
  Pencil,
} from 'lucide-react'
import type { Screen } from '@/types/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'
import { Skeleton } from '@/components/ui/Skeleton'
import { useFormDialog } from '@/components/ui/FormDialog'

function ProjectWorkspaceSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-background p-4 sm:p-6 lg:p-9 animate-pulse">
      {/* Top Header Placeholder */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Skeleton height={14} width={80} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Skeleton height={26} width={280} />
            <div style={{ height: '8px' }} />
            <Skeleton height={14} width={400} />
          </div>
          <Skeleton height={32} width={100} />
        </div>
      </div>

      {/* Progress Bar Placeholder */}
      <div style={{ background: 'var(--secondary)', borderRadius: '4px', height: '4px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--border)', height: '4px', borderRadius: '4px', width: '30%' }} />
      </div>

      {/* Tabs Bar Placeholder */}
      <div className="flex gap-4 border-b border-border pb-2 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} height={16} width={80} />
        ))}
      </div>

      {/* Two column grid content layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            <Skeleton height={18} width={120} />
            <div style={{ height: '16px' }} />
            <Skeleton height={14} width="100%" />
            <div style={{ height: '8px' }} />
            <Skeleton height={14} width="90%" />
            <div style={{ height: '8px' }} />
            <Skeleton height={14} width="80%" />
          </div>
          
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Skeleton height={18} width={100} />
              <Skeleton height={14} width={40} />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Skeleton height={16} width={16} />
                <Skeleton height={14} width="70%" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            <Skeleton height={18} width={120} />
            <div style={{ height: '16px' }} />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Skeleton height={12} width={60} />
                <Skeleton height={12} width={80} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import {
  createDecision,
  createBug,
  createContent,
  createDebt,
  createDevelopmentNote,
  createKnowledgeEntry,
  createMilestone,
  createProjectAssetLink,
  createRepository,
  createTask,
  createSprint,
  updateSprint,
  deleteSprint,
  deleteBug,
  deleteContent,
  deleteDebt,
  deleteDecision,
  deleteProject,
  deleteDevelopmentNote,
  deleteKnowledgeEntry,
  deleteMilestone,
  deleteProjectAsset,
  deleteRepository,
  deleteTask,
  fetchProjectWorkspace,
  updateBug,
  updateContent,
  updateDebt,
  updateDecision,
  updateDevelopmentNote,
  updateKnowledgeEntry,
  updateMilestone,
  updateProject,
  updateRepository,
  updateTask,
  uploadProjectAsset,
  type ProjectWorkspaceData,
  type WorkspaceAsset,
  type WorkspaceKnowledge,
  type WorkspaceMilestone,
  type WorkspaceSprint,
} from '@/features/project-workspace/services/project-workspace.service'
import type { Priority, ProjectStatus } from '@/types/enums'

type Tab = 'overview' | 'planning' | 'development' | 'knowledge' | 'assets' | 'activity'
type WorkspaceTab = Tab | 'content' | 'architecture' | 'settings'

interface Props {
  onNavigate: (s: Screen) => void
}

const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'planning', label: 'Planning' },
  { id: 'development', label: 'Development' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'assets', label: 'Assets' },
  { id: 'content', label: 'Content' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'activity', label: 'Activity' },
  { id: 'settings', label: 'Settings' },
]

const statusColor: Record<ProjectStatus, string> = {
  active: 'var(--status-blue)',
  'in-progress': 'var(--status-orange)',
  completed: 'var(--status-green)',
  overdue: 'var(--status-red)',
  archived: 'var(--muted-foreground)',
}

const contentStageColor: Record<ProjectWorkspaceData['content'][number]['status'], string> = {
  idea: 'var(--muted-foreground)',
  research: 'var(--status-blue)',
  outline: 'var(--status-purple)',
  script: 'var(--status-purple)',
  recording: 'var(--status-orange)',
  editing: 'var(--status-blue)',
  thumbnail: 'var(--status-orange)',
  seo: 'var(--status-purple)',
  published: 'var(--status-green)',
  analytics: 'var(--status-blue)',
}

export default function ProjectWorkspace({ onNavigate }: Props) {
  const { projectId } = useParams()
  const { user } = useAuth()
  const { currentWorkspace, switchWorkspace } = useWorkspace()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview')
  const [data, setData] = useState<ProjectWorkspaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { openForm, FormDialog } = useFormDialog()

  const dynamicTabs = tabs.filter((tab) => {
    if (currentWorkspace?.sectorType === 'engineering') {
      return tab.id !== 'content' && tab.id !== 'architecture'
    }
    return true
  })

  const loadWorkspace = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      setData(await fetchProjectWorkspace(projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project workspace.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  async function mutate(action: () => Promise<void>) {
    if (!projectId) return
    setSaving(true)
    setError(null)
    try {
      await action()
      setData(await fetchProjectWorkspace(projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadWorkspace()
  }, [loadWorkspace])

  useEffect(() => {
    if (data?.project?.workspaceId && currentWorkspace?.id !== data.project.workspaceId) {
      switchWorkspace(data.project.workspaceId)
    }
  }, [data?.project?.workspaceId, currentWorkspace?.id, switchWorkspace])

  const handleEditProject = async () => {
    if (!projectId || !data) return
    const values = await openForm({
      title: 'Edit Project',
      fields: [
        { name: 'name', label: 'Project name', value: data.project.name, required: true },
        { name: 'description', label: 'Description', type: 'textarea', value: data.project.description },
        { name: 'progress', label: 'Progress', type: 'number', value: String(data.project.progress) },
        { name: 'technologies', label: 'Technologies', value: data.project.technologies.join(', ') },
      ],
    })
    if (!values?.name.trim()) return
    const progressValue = Number(values.progress || data.project.progress)
    await mutate(() =>
      updateProject(projectId, {
        name: values.name.trim(),
        description: values.description,
        progress: Number.isFinite(progressValue)
          ? Math.max(0, Math.min(100, progressValue))
          : data.project.progress,
        technologies: values.technologies
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    )
  }

  const handleUpdateProjectState = async () => {
    if (!projectId || !data) return
    const values = await openForm({
      title: 'Update Execution State',
      fields: [
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          value: data.project.status,
          options: ['active', 'in-progress', 'completed', 'overdue', 'archived'],
        },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          value: data.project.priority,
          options: ['critical', 'high', 'medium', 'low'],
        },
        { name: 'deadline', label: 'Deadline', type: 'date', value: data.project.deadline ?? '' },
      ],
    })
    if (!values) return
    const status = values.status as ProjectStatus
    const priority = values.priority as Priority
    const deadline = values.deadline || null
    await mutate(() => updateProject(projectId, { status, priority, deadline }))
  }

  const handleAddDecision = async () => {
    if (!projectId || !user) return
    const values = await openForm({
      title: 'New Architecture Decision',
      fields: [
        { name: 'decision', label: 'Decision Summary', required: true },
        { name: 'problem', label: 'Problem / Context', type: 'textarea' },
        { name: 'reason', label: 'Rationale', type: 'textarea' },
        { name: 'alternatives', label: 'Alternatives Considered', type: 'textarea' },
        { name: 'impact', label: 'Impact', type: 'textarea' },
      ],
    })
    if (!values?.decision.trim()) return
    await mutate(() =>
      createDecision({
        projectId,
        userId: user.id,
        decision: values.decision.trim(),
        reason: values.reason ?? '',
        alternatives: values.alternatives ?? '',
        impact: values.impact ?? '',
      }),
    )
    if (values.problem?.trim()) {
      const refreshed = await fetchProjectWorkspace(projectId)
      const latest = refreshed.decisions[0]
      if (latest) await updateDecision(latest.id, { problem: values.problem.trim() })
    }
  }

  const handleEditDecision = async (item: ProjectWorkspaceData['decisions'][number]) => {
    const values = await openForm({
      title: 'Edit Architecture Decision',
      fields: [
        { name: 'decision', label: 'Decision Summary', value: item.decision, required: true },
        { name: 'problem', label: 'Problem / Context', type: 'textarea', value: item.problem ?? '' },
        { name: 'reason', label: 'Rationale', type: 'textarea', value: item.reason ?? '' },
        {
          name: 'alternatives',
          label: 'Alternatives Considered',
          type: 'textarea',
          value: item.alternatives ?? '',
        },
        { name: 'consequences', label: 'Consequences', type: 'textarea', value: item.consequences ?? '' },
        { name: 'impact', label: 'Impact', type: 'textarea', value: item.impact ?? '' },
        { name: 'references', label: 'References (comma separated)', value: item.references.join(', ') },
      ],
    })
    if (!values?.decision.trim()) return
    const references = values.references
      ? values.references
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : []
    await mutate(() =>
      updateDecision(item.id, {
        problem: values.problem || null,
        decision: values.decision.trim(),
        reason: values.reason || null,
        alternatives_considered: values.alternatives || null,
        consequences: values.consequences || null,
        impact: values.impact || null,
        reference_links: references,
      }),
    )
  }

  const handleAddMilestone = async () => {
    if (!projectId) return
    const values = await openForm({
      title: 'New Milestone',
      fields: [
        { name: 'title', label: 'Milestone Title', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'due_date', label: 'Due Date', type: 'date' },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          value: 'medium',
          options: ['critical', 'high', 'medium', 'low'],
        },
        { name: 'estimated_hours', label: 'Estimated Hours', type: 'number' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ],
    })
    if (!values?.title.trim()) return
    await mutate(() =>
      createMilestone(projectId, {
        title: values.title.trim(),
        description: values.description || null,
        due_date: values.due_date || null,
        priority: values.priority as Priority,
        estimated_hours: values.estimated_hours ? Number(values.estimated_hours) || null : null,
        notes: values.notes || null,
      }),
    )
  }

  const handleEditMilestone = async (milestone: WorkspaceMilestone) => {
    const values = await openForm({
      title: 'Edit Milestone',
      fields: [
        { name: 'title', label: 'Milestone Title', value: milestone.title, required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          value: milestone.status,
          options: ['todo', 'in-progress', 'completed'],
        },
        { name: 'description', label: 'Description', type: 'textarea', value: milestone.description ?? '' },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          value: milestone.priority,
          options: ['critical', 'high', 'medium', 'low'],
        },
        { name: 'progress', label: 'Progress (0-100)', type: 'number', value: String(milestone.progress) },
        { name: 'due_date', label: 'Due Date', type: 'date', value: milestone.dueDate ?? '' },
        {
          name: 'estimated_hours',
          label: 'Estimated Hours',
          type: 'number',
          value: String(milestone.estimatedHours ?? ''),
        },
        { name: 'notes', label: 'Notes', type: 'textarea', value: milestone.notes ?? '' },
      ],
    })
    if (!values?.title.trim()) return
    const progress = Number(values.progress)
    await mutate(() =>
      updateMilestone(milestone.id, {
        title: values.title.trim(),
        description: values.description || null,
        status: values.status as WorkspaceMilestone['status'],
        priority: values.priority as Priority,
        progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : milestone.progress,
        due_date: values.due_date || null,
        estimated_hours: values.estimated_hours ? Number(values.estimated_hours) || null : null,
        notes: values.notes || null,
        completed_date: values.status === 'completed' ? new Date().toISOString().slice(0, 10) : null,
      }),
    )
  }

  const handleDeleteMilestone = async (milestone: WorkspaceMilestone) => {
    const confirm = await openForm({
      title: 'Delete Milestone',
      description: `Are you sure you want to delete milestone "${milestone.title}"?`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!confirm) return
    await mutate(() => deleteMilestone(milestone.id))
  }

  const handleAddSprint = async () => {
    if (!projectId) return
    const values = await openForm({
      title: 'New Sprint',
      fields: [
        { name: 'name', label: 'Sprint Name', required: true },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'End Date', type: 'date', required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          value: 'planning',
          options: ['planning', 'active', 'completed'],
        },
      ],
    })
    if (!values?.name.trim() || !values.startDate || !values.endDate) return
    await mutate(() =>
      createSprint(projectId, {
        name: values.name.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status as any,
      }),
    )
  }

  const handleEditSprint = async (sprint: WorkspaceSprint) => {
    const values = await openForm({
      title: 'Edit Sprint',
      fields: [
        { name: 'name', label: 'Sprint Name', value: sprint.name, required: true },
        { name: 'startDate', label: 'Start Date', type: 'date', value: sprint.startDate, required: true },
        { name: 'endDate', label: 'End Date', type: 'date', value: sprint.endDate, required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          value: sprint.status,
          options: ['planning', 'active', 'completed'],
        },
      ],
    })
    if (!values?.name.trim() || !values.startDate || !values.endDate) return
    await mutate(() =>
      updateSprint(sprint.id, {
        name: values.name.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status as any,
      }),
    )
  }

  const handleDeleteSprint = async (sprint: WorkspaceSprint) => {
    const confirm = await openForm({
      title: 'Delete Sprint',
      description: `Are you sure you want to delete sprint "${sprint.name}"?`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!confirm) return
    await mutate(() => deleteSprint(sprint.id))
  }


  const handleAddKnowledge = async () => {
    if (!projectId || !user) return
    const values = await openForm({
      title: 'New Knowledge Note',
      fields: [
        { name: 'title', label: 'Title', required: true },
        { name: 'body', label: 'Content (Markdown)', type: 'textarea' },
      ],
    })
    if (!values?.title.trim()) return
    await mutate(() =>
      createKnowledgeEntry({
        projectId,
        ownerId: user.id,
        title: values.title.trim(),
        body: values.body || '',
      }),
    )
  }

  const handleEditKnowledge = async (entry: WorkspaceKnowledge) => {
    const values = await openForm({
      title: 'Edit Knowledge Note',
      fields: [
        { name: 'title', label: 'Title', value: entry.title, required: true },
        { name: 'body', label: 'Content (Markdown)', type: 'textarea', value: entry.body ?? '' },
      ],
    })
    if (!values?.title.trim()) return
    await mutate(() =>
      updateKnowledgeEntry(entry.id, { title: values.title.trim(), body: values.body || '' }),
    )
  }

  const handleDeleteKnowledge = async (entry: WorkspaceKnowledge) => {
    const confirm = await openForm({
      title: 'Delete Knowledge Entry',
      description: `Are you sure you want to delete "${entry.title}"?`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!confirm) return
    await mutate(() => deleteKnowledgeEntry(entry.id))
  }

  const handleAddAssetLink = async () => {
    if (!projectId || !user) return
    const values = await openForm({
      title: 'New Asset Link',
      fields: [
        { name: 'name', label: 'Name', required: true },
        { name: 'url', label: 'URL', required: true },
      ],
    })
    if (!values?.name.trim() || !values?.url.trim()) return
    await mutate(() =>
      createProjectAssetLink({
        projectId,
        ownerId: user.id,
        name: values.name.trim(),
        url: values.url.trim(),
      }),
    )
  }

  const handleAddTask = async () => {
    if (!projectId) return
    const values = await openForm({
      title: 'New Task',
      fields: [
        { name: 'title', label: 'Title', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          value: 'medium',
          options: ['critical', 'high', 'medium', 'low'],
        },
        { name: 'estimate_hours', label: 'Estimated Hours', type: 'number' },
        { name: 'due_date', label: 'Due Date', type: 'date' },
        { name: 'dependencies', label: 'Dependencies (comma separated)' },
        { name: 'labels', label: 'Labels (comma separated)' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ],
    })
    if (!values?.title.trim()) return
    const dependencies = values.dependencies
      ? values.dependencies
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : []
    const labels = values.labels
      ? values.labels
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : []
    await mutate(() =>
      createTask(projectId, {
        title: values.title.trim(),
        description: values.description || null,
        priority: values.priority as Priority,
        estimate_hours: values.estimate_hours ? Number(values.estimate_hours) || null : null,
        due_date: values.due_date || null,
        dependencies,
        labels,
        notes: values.notes || null,
      }),
    )
  }

  const handleEditTask = async (item: ProjectWorkspaceData['tasks'][number]) => {
    const values = await openForm({
      title: 'Edit Task',
      fields: [
        { name: 'title', label: 'Title', value: item.title, required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          value: item.status,
          options: ['todo', 'in-progress', 'blocked', 'done'],
        },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          value: item.priority,
          options: ['critical', 'high', 'medium', 'low'],
        },
        { name: 'description', label: 'Description', type: 'textarea', value: item.description ?? '' },
        {
          name: 'estimateHours',
          label: 'Estimate Hours',
          type: 'number',
          value: String(item.estimateHours ?? ''),
        },
        { name: 'dueDate', label: 'Due Date', type: 'date', value: item.dueDate ?? '' },
        {
          name: 'dependencies',
          label: 'Dependencies (comma separated)',
          value: item.dependencies.join(', '),
        },
        { name: 'labels', label: 'Labels (comma separated)', value: item.labels.join(', ') },
        { name: 'notes', label: 'Notes', type: 'textarea', value: item.notes ?? '' },
      ],
    })
    if (!values?.title.trim()) return
    const dependencies = values.dependencies
      ? values.dependencies
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : []
    const labels = values.labels
      ? values.labels
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : []
    await mutate(() =>
      updateTask(item.id, {
        title: values.title.trim(),
        description: values.description || null,
        status: values.status as any,
        priority: values.priority as Priority,
        estimate_hours: values.estimateHours ? Number(values.estimateHours) || null : null,
        due_date: values.dueDate || null,
        dependencies,
        labels,
        notes: values.notes || null,
        completed_at: values.status === 'done' ? new Date().toISOString() : null,
      }),
    )
  }

  const handleAddBug = async () => {
    if (!projectId) return
    const values = await openForm({
      title: 'Report Bug',
      fields: [
        { name: 'title', label: 'Bug Title', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        {
          name: 'severity',
          label: 'Severity',
          type: 'select',
          value: 'medium',
          options: ['critical', 'high', 'medium', 'low'],
        },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          value: 'medium',
          options: ['critical', 'high', 'medium', 'low'],
        },
        { name: 'steps_to_reproduce', label: 'Reproduction Steps', type: 'textarea' },
        { name: 'expected_behavior', label: 'Expected Behavior', type: 'textarea' },
        { name: 'actual_behavior', label: 'Actual Behavior', type: 'textarea' },
      ],
    })
    if (!values?.title.trim()) return
    await mutate(() =>
      createBug(projectId, {
        title: values.title.trim(),
        description: values.description || null,
        severity: values.severity as Priority,
        priority: values.priority as Priority,
        steps_to_reproduce: values.steps_to_reproduce || null,
        expected_behavior: values.expected_behavior || null,
        actual_behavior: values.actual_behavior || null,
      }),
    )
  }

  const handleEditBug = async (item: ProjectWorkspaceData['bugs'][number]) => {
    const values = await openForm({
      title: 'Edit Bug',
      fields: [
        { name: 'title', label: 'Bug Title', value: item.title, required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          value: item.status,
          options: ['open', 'triage', 'fixing', 'fixed', 'closed'],
        },
        {
          name: 'severity',
          label: 'Severity',
          type: 'select',
          value: item.severity,
          options: ['critical', 'high', 'medium', 'low'],
        },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          value: item.priority,
          options: ['critical', 'high', 'medium', 'low'],
        },
        { name: 'description', label: 'Description', type: 'textarea', value: item.description ?? '' },
        {
          name: 'stepsToReproduce',
          label: 'Reproduction Steps',
          type: 'textarea',
          value: item.stepsToReproduce ?? '',
        },
        {
          name: 'expectedBehavior',
          label: 'Expected Behavior',
          type: 'textarea',
          value: item.expectedBehavior ?? '',
        },
        {
          name: 'actualBehavior',
          label: 'Actual Behavior',
          type: 'textarea',
          value: item.actualBehavior ?? '',
        },
        { name: 'resolution', label: 'Resolution', type: 'textarea', value: item.resolution ?? '' },
      ],
    })
    if (!values?.title.trim()) return
    await mutate(() =>
      updateBug(item.id, {
        title: values.title.trim(),
        description: values.description || null,
        status: values.status as any,
        severity: values.severity as Priority,
        priority: values.priority as Priority,
        steps_to_reproduce: values.stepsToReproduce || null,
        expected_behavior: values.expectedBehavior || null,
        actual_behavior: values.actualBehavior || null,
        resolution: values.resolution || null,
      }),
    )
  }

  const handleAddDebt = async () => {
    if (!projectId) return
    const values = await openForm({
      title: 'New Technical Debt',
      fields: [
        { name: 'title', label: 'Debt Title', required: true },
        { name: 'impact', label: 'Impact / Details', type: 'textarea' },
      ],
    })
    if (!values?.title.trim()) return
    await mutate(async () => {
      await createDebt(projectId, values.title.trim())
      if (values.impact?.trim()) {
        const refreshed = await fetchProjectWorkspace(projectId)
        const latest = refreshed.debt[0]
        if (latest) await updateDebt(latest.id, { impact: values.impact.trim() })
      }
    })
  }

  const handleEditDebt = async (item: ProjectWorkspaceData['debt'][number]) => {
    const values = await openForm({
      title: 'Edit Technical Debt',
      fields: [
        { name: 'title', label: 'Debt Title', value: item.title, required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          value: item.status,
          options: ['open', 'planned', 'resolved'],
        },
        { name: 'impact', label: 'Impact / Details', type: 'textarea', value: item.impact ?? '' },
        { name: 'proposedFix', label: 'Proposed Fix', type: 'textarea', value: item.proposedFix ?? '' },
      ],
    })
    if (!values?.title.trim()) return
    await mutate(() =>
      updateDebt(item.id, {
        title: values.title.trim(),
        status: values.status as any,
        impact: values.impact || null,
        proposed_fix: values.proposedFix || null,
      }),
    )
  }

  const handleAddRepository = async () => {
    if (!projectId) return
    const values = await openForm({
      title: 'Link Repository',
      fields: [
        { name: 'name', label: 'Repository Name', required: true },
        { name: 'url', label: 'Repository URL', required: true },
        { name: 'branch', label: 'Default Branch', value: 'main' },
      ],
    })
    if (!values?.name.trim() || !values?.url.trim()) return
    await mutate(async () => {
      await createRepository(projectId, values.name.trim(), values.url.trim())
      if (values.branch?.trim() && values.branch !== 'main') {
        const refreshed = await fetchProjectWorkspace(projectId)
        const latest = refreshed.repositories[0]
        if (latest) await updateRepository(latest.id, { branch: values.branch.trim() })
      }
    })
  }

  const handleEditRepository = async (item: ProjectWorkspaceData['repositories'][number]) => {
    const values = await openForm({
      title: 'Edit Repository',
      fields: [
        { name: 'name', label: 'Repository Name', value: item.name, required: true },
        { name: 'url', label: 'Repository URL', value: item.url, required: true },
        { name: 'branch', label: 'Branch', value: item.branch ?? '' },
      ],
    })
    if (!values?.name.trim() || !values?.url.trim()) return
    await mutate(() =>
      updateRepository(item.id, {
        name: values.name.trim(),
        url: values.url.trim(),
        branch: values.branch || null,
      }),
    )
  }

  const handleAddDevelopmentNote = async () => {
    if (!projectId) return
    const values = await openForm({
      title: 'New Development Note',
      fields: [
        { name: 'title', label: 'Title', required: true },
        { name: 'body', label: 'Note Content (Markdown)', type: 'textarea' },
        { name: 'tags', label: 'Tags (comma separated)' },
      ],
    })
    if (!values?.title.trim()) return
    const tags = values.tags
      ? values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []
    await mutate(() => createDevelopmentNote(projectId, values.title.trim(), values.body || '', tags))
  }

  const handleEditDevelopmentNote = async (item: ProjectWorkspaceData['developmentNotes'][number]) => {
    const values = await openForm({
      title: 'Edit Development Note',
      fields: [
        { name: 'title', label: 'Title', value: item.title, required: true },
        { name: 'body', label: 'Note Content (Markdown)', type: 'textarea', value: item.body ?? '' },
        { name: 'tags', label: 'Tags (comma separated)', value: item.tags.join(', ') },
      ],
    })
    if (!values?.title.trim()) return
    const tags = values.tags
      ? values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []
    await mutate(() =>
      updateDevelopmentNote(item.id, {
        title: values.title.trim(),
        body: values.body || '',
        tags,
        autosaved_at: new Date().toISOString(),
      }),
    )
  }

  const handleUploadAsset = async (file: File | undefined) => {
    if (!projectId || !user || !file) return
    await mutate(() => uploadProjectAsset({ projectId, ownerId: user.id, file }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAddContent = async () => {
    if (!projectId) return
    const values = await openForm({
      title: 'New Content Engine Item',
      fields: [
        { name: 'title', label: 'Content Title', required: true },
        { name: 'platform', label: 'Platform', value: 'YouTube', required: true },
      ],
    })
    if (!values?.title.trim()) return
    await mutate(() => createContent(projectId, values.title.trim(), values.platform.trim() || 'YouTube'))
  }

  const handleEditContent = async (item: ProjectWorkspaceData['content'][number]) => {
    const values = await openForm({
      title: 'Edit Content Item',
      fields: [
        { name: 'title', label: 'Content Title', value: item.title, required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          value: item.status,
          options: [
            'idea',
            'research',
            'outline',
            'script',
            'recording',
            'editing',
            'thumbnail',
            'seo',
            'published',
            'analytics',
          ],
        },
        { name: 'platform', label: 'Platform', value: item.platform, required: true },
        { name: 'researchNotes', label: 'Research Notes', type: 'textarea', value: item.researchNotes ?? '' },
        { name: 'outline', label: 'Outline', type: 'textarea', value: item.outline ?? '' },
        { name: 'script', label: 'Script', type: 'textarea', value: item.script ?? '' },
        { name: 'publishDate', label: 'Publish Date', type: 'date', value: item.publishDate ?? '' },
        {
          name: 'views',
          label: 'Manual Views Count',
          type: 'number',
          value: String(item.analytics.views ?? ''),
        },
      ],
    })
    if (!values?.title.trim()) return
    await mutate(() =>
      updateContent(item.id, {
        title: values.title.trim(),
        status: values.status as any,
        platform: values.platform,
        research_notes: values.researchNotes || null,
        outline: values.outline || null,
        script: values.script || null,
        publish_date: values.publishDate || null,
        analytics: values.views ? { ...item.analytics, views: Number(values.views) || 0 } : item.analytics,
      }),
    )
  }

  const handleDeleteProject = async () => {
    if (!projectId || !data) return
    const confirm = await openForm({
      title: 'Delete Project',
      description: `Are you sure you want to delete project "${data.project.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!confirm) return
    await mutate(() => deleteProject(projectId))
    onNavigate('projects')
  }

  const handleDeleteAsset = async (asset: WorkspaceAsset) => {
    const confirm = await openForm({
      title: 'Delete Asset',
      description: `Are you sure you want to delete asset "${asset.name}"?`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!confirm) return
    await mutate(() => deleteProjectAsset(asset))
  }

  if (loading) {
    return <ProjectWorkspaceSkeleton />
  }

  if (error || !data) {
    return (
      <div style={{ height: '100%', padding: '32px' }}>
        <BackButton onClick={() => onNavigate('projects')} />
        <div style={{ marginTop: '32px', color: 'var(--muted-foreground)' }}>
          {error ?? 'Project not found.'}
        </div>
      </div>
    )
  }

  const { project, milestones, decisions, activity, knowledge, assets, content } = data
  const completedMilestones = milestones.filter((item) => item.status === 'completed').length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="px-4 sm:px-8 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <BackButton onClick={() => onNavigate('projects')} />
          <span className="hidden sm:inline" style={{ color: 'var(--border)' }}>
            /
          </span>
          <span className="text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-none">
            {project.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {error && <span style={{ color: 'var(--status-red)', fontSize: '12px' }}>{error}</span>}
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(59,130,246,0.12)',
              color: statusColor[project.status],
              fontWeight: 500,
            }}
          >
            {project.status}
          </span>
          <ActionButton
            onClick={handleAddDecision}
            disabled={saving}
            icon={<Plus size={12} />}
            label="Add Decision"
          />
        </div>
      </div>

      <div className="px-4 sm:px-8 pt-6 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8 mb-5">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 sm:mb-2">{project.name}</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 14px' }}>
              {project.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {project.technologies.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:flex sm:gap-6 flex-shrink-0">
            {[
              { label: 'Progress', value: `${project.progress}%`, sub: 'overall' },
              { label: 'Deadline', value: project.deadline ?? '-', sub: 'target' },
              { label: 'Milestones', value: `${completedMilestones}/${milestones.length}`, sub: 'done' },
              { label: 'Decisions', value: String(decisions.length), sub: 'recorded' },
            ].map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
        <div
          style={{ background: 'var(--secondary)', borderRadius: '4px', height: '4px', marginBottom: '20px' }}
        >
          <div
            style={{
              background: statusColor[project.status],
              height: '4px',
              borderRadius: '4px',
              width: `${project.progress}%`,
            }}
          />
        </div>
        <div className="flex gap-0 border-b border-border overflow-x-auto whitespace-nowrap scrollbar-none w-full">
          {dynamicTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--foreground)' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 500 : 400,
                cursor: 'pointer',
                marginBottom: '-1px',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow flex-shrink overflow-y-auto px-4 sm:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel
              title="Project Details"
              action={
                <ActionButton
                  onClick={handleEditProject}
                  disabled={saving}
                  icon={<Pencil size={12} />}
                  label="Edit"
                />
              }
            >
              <DetailRows
                rows={[
                  ['Status', project.status],
                  ['Priority', project.priority],
                  ['Deadline', project.deadline ?? '-'],
                  ['Progress', `${project.progress}%`],
                ]}
              />
            </Panel>
            <Panel
              title="Milestones"
              action={
                <ActionButton
                  onClick={handleAddMilestone}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="Add"
                />
              }
            >
              <MilestoneList
                milestones={milestones.slice(0, 5)}
                onEdit={handleEditMilestone}
                onDelete={handleDeleteMilestone}
              />
            </Panel>
            <Panel
              title="Decisions"
              action={
                <ActionButton
                  onClick={handleAddDecision}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="Add"
                />
              }
            >
              <DecisionList
                decisions={decisions.slice(0, 5)}
                onEdit={handleEditDecision}
                onDelete={(item) => mutate(() => deleteDecision(item.id))}
              />
            </Panel>
            <Panel title="Recent Activity">
              <ActivityList activity={activity.slice(0, 6)} />
            </Panel>
          </div>
        )}

        {activeTab === 'planning' && (
          currentWorkspace?.sectorType === 'engineering' ? (
            <Panel
              title="Sprints"
              action={
                <ActionButton
                  onClick={handleAddSprint}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="New Sprint"
                />
              }
            >
              <SprintList
                sprints={data?.sprints || []}
                onEdit={handleEditSprint}
                onDelete={handleDeleteSprint}
              />
            </Panel>
          ) : (
            <Panel
              title="Planning"
              action={
                <ActionButton
                  onClick={handleAddMilestone}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="New Milestone"
                />
              }
            >
              <MilestoneList
                milestones={milestones}
                onEdit={handleEditMilestone}
                onDelete={handleDeleteMilestone}
              />
            </Panel>
          )
        )}

        {activeTab === 'development' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel
              title="Execution State"
              action={
                <ActionButton
                  onClick={handleUpdateProjectState}
                  disabled={saving}
                  icon={<Pencil size={12} />}
                  label="Update"
                />
              }
            >
              <DetailRows
                rows={[
                  ['Status', project.status],
                  ['Priority', project.priority],
                  ['Progress', `${project.progress}%`],
                  ['Tech Stack', project.technologies.join(', ') || '-'],
                ]}
              />
            </Panel>
            <Panel
              title="Tasks"
              action={
                <ActionButton
                  onClick={handleAddTask}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="Add"
                />
              }
            >
              <SimpleEditableList
                items={data.tasks}
                empty="No development tasks yet."
                getMeta={(item) => `${item.status} · ${item.priority}`}
                onEdit={handleEditTask}
                onDelete={(item) => mutate(() => deleteTask(item.id))}
              />
            </Panel>
            <Panel
              title="Bugs"
              action={
                <ActionButton
                  onClick={handleAddBug}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="Add"
                />
              }
            >
              <SimpleEditableList
                items={data.bugs}
                empty="No bugs tracked."
                getMeta={(item) => `${item.status} · ${item.severity}`}
                onEdit={handleEditBug}
                onDelete={(item) => mutate(() => deleteBug(item.id))}
              />
            </Panel>
            <Panel
              title="Technical Debt"
              action={
                <ActionButton
                  onClick={handleAddDebt}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="Add"
                />
              }
            >
              <SimpleEditableList
                items={data.debt}
                empty="No technical debt tracked."
                getMeta={(item) => item.status}
                onEdit={handleEditDebt}
                onDelete={(item) => mutate(() => deleteDebt(item.id))}
              />
            </Panel>
            <Panel
              title="Repositories"
              action={
                <ActionButton
                  onClick={handleAddRepository}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="Add"
                />
              }
            >
              <SimpleEditableList
                items={data.repositories}
                empty="No repositories linked."
                getTitle={(item) => item.name}
                getMeta={(item) => (item.branch ? `${item.url} · ${item.branch}` : item.url)}
                onEdit={handleEditRepository}
                onDelete={(item) => mutate(() => deleteRepository(item.id))}
              />
            </Panel>
            <Panel
              title="Development Notes"
              action={
                <ActionButton
                  onClick={handleAddDevelopmentNote}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="Add"
                />
              }
            >
              <SimpleEditableList
                items={data.developmentNotes}
                empty="No development notes yet."
                getMeta={(item) => item.body ?? ''}
                onEdit={handleEditDevelopmentNote}
                onDelete={(item) => mutate(() => deleteDevelopmentNote(item.id))}
              />
            </Panel>
            <Panel
              title="Content Pipeline"
              action={
                <ActionButton
                  onClick={handleAddContent}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="Add"
                />
              }
            >
              <ContentList
                content={content}
                onEdit={handleEditContent}
                onDelete={(item) => mutate(() => deleteContent(item.id))}
              />
            </Panel>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <Panel
            title="Knowledge"
            action={
              <ActionButton
                onClick={handleAddKnowledge}
                disabled={saving}
                icon={<Plus size={12} />}
                label="New Entry"
              />
            }
          >
            <KnowledgeList
              entries={knowledge}
              onEdit={handleEditKnowledge}
              onDelete={handleDeleteKnowledge}
            />
          </Panel>
        )}

        {activeTab === 'assets' && (
          <Panel
            title="Assets"
            action={
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(event) => handleUploadAsset(event.target.files?.[0])}
                />
                <ActionButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  icon={<Upload size={12} />}
                  label="Upload"
                />
                <ActionButton
                  onClick={handleAddAssetLink}
                  disabled={saving}
                  icon={<Plus size={12} />}
                  label="Add Link"
                />
              </div>
            }
          >
            <AssetList assets={assets} onDelete={handleDeleteAsset} />
          </Panel>
        )}

        {activeTab === 'content' && (
          <Panel
            title="Content"
            action={
              <ActionButton
                onClick={handleAddContent}
                disabled={saving}
                icon={<Plus size={12} />}
                label="New Content"
              />
            }
          >
            <ContentList
              content={content}
              onEdit={handleEditContent}
              onDelete={(item) => mutate(() => deleteContent(item.id))}
              detailed
            />
          </Panel>
        )}

        {activeTab === 'architecture' && (
          <Panel
            title="Architecture Decisions"
            action={
              <ActionButton
                onClick={handleAddDecision}
                disabled={saving}
                icon={<Plus size={12} />}
                label="Add Decision"
              />
            }
          >
            <DecisionList
              decisions={decisions}
              onEdit={handleEditDecision}
              onDelete={(item) => mutate(() => deleteDecision(item.id))}
            />
          </Panel>
        )}

        {activeTab === 'activity' && (
          <Panel
            title="Activity Timeline"
            action={
              <ActionButton
                onClick={loadWorkspace}
                disabled={saving}
                icon={<Clock size={12} />}
                label="Refresh"
              />
            }
          >
            <ActivityList activity={activity} detailed />
          </Panel>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel
              title="Project Settings"
              action={
                <ActionButton
                  onClick={handleEditProject}
                  disabled={saving}
                  icon={<Pencil size={12} />}
                  label="Edit"
                />
              }
            >
              <DetailRows
                rows={[
                  ['Name', project.name],
                  ['Description', project.description],
                  ['Status', project.status],
                  ['Priority', project.priority],
                  ['Deadline', project.deadline ?? '-'],
                ]}
              />
            </Panel>
            <Panel
              title="Danger Zone"
              action={
                <ActionButton
                  onClick={handleDeleteProject}
                  disabled={saving}
                  icon={<Trash2 size={12} />}
                  label="Delete"
                />
              }
            >
              <EmptyLine text="Soft delete moves this project out of active views while preserving related records." />
            </Panel>
          </div>
        )}
      </div>
      {FormDialog}
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--muted-foreground)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        padding: 0,
      }}
    >
      <ArrowLeft size={14} /> Projects
    </button>
  )
}

function ActionButton({
  onClick,
  disabled,
  icon,
  label,
}: {
  onClick: () => void
  disabled?: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--secondary)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '6px 12px',
        color: 'var(--secondary-foreground)',
        fontSize: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {icon} {label}
    </button>
  )
}

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
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
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.03em', fontFamily: 'monospace' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{label}</div>
      <div style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>{sub}</div>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: '11px',
        padding: '3px 8px',
        background: 'var(--secondary)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        color: 'var(--secondary-foreground)',
      }}
    >
      {children}
    </span>
  )
}

function DetailRows({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {rows.map(([label, value]) => (
        <div
          key={label}
          style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '13px' }}
        >
          <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  )
}

function MilestoneList({
  milestones,
  onEdit,
  onDelete,
}: {
  milestones: ProjectWorkspaceData['milestones']
  onEdit: (milestone: WorkspaceMilestone) => void
  onDelete: (milestone: WorkspaceMilestone) => void
}) {
  if (milestones.length === 0) return <EmptyLine text="No milestones yet." />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {milestones.map((item) => {
        const color =
          item.status === 'completed'
            ? 'var(--status-green)'
            : item.status === 'in-progress'
              ? 'var(--status-blue)'
              : 'var(--border)'
        return (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {item.status === 'completed' ? (
              <CheckCircle2 size={14} color={color} />
            ) : item.status === 'in-progress' ? (
              <Clock size={14} color={color} />
            ) : (
              <Circle size={14} color="var(--muted-foreground)" />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px' }}>{item.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                {item.description ||
                  item.notes ||
                  `${item.priority} · ${item.progress}% · ${item.estimatedHours ?? 0}h`}
              </div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
              {item.dueDate ?? '-'}
            </span>
            <IconButton onClick={() => onEdit(item)} icon={<Pencil size={13} />} />
            <IconButton onClick={() => onDelete(item)} icon={<Trash2 size={13} />} />
          </div>
        )
      })}
    </div>
  )
}

function SprintList({
  sprints,
  onEdit,
  onDelete,
}: {
  sprints: ProjectWorkspaceData['sprints']
  onEdit: (sprint: WorkspaceSprint) => void
  onDelete: (sprint: WorkspaceSprint) => void
}) {
  if (!sprints || sprints.length === 0) return <EmptyLine text="No sprints planned yet." />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {sprints.map((item) => {
        const color =
          item.status === 'completed'
            ? 'var(--status-green)'
            : item.status === 'active'
              ? 'var(--status-blue)'
              : 'var(--border)'
        return (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {item.status === 'completed' ? (
              <CheckCircle2 size={14} color={color} />
            ) : item.status === 'active' ? (
              <Clock size={14} color={color} />
            ) : (
              <Circle size={14} color="var(--muted-foreground)" />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                {item.startDate} to {item.endDate} · <span style={{ textTransform: 'capitalize' }}>{item.status}</span>
              </div>
            </div>
            <IconButton onClick={() => onEdit(item)} icon={<Pencil size={13} />} />
            <IconButton onClick={() => onDelete(item)} icon={<Trash2 size={13} />} />
          </div>
        )
      })}
    </div>
  )
}

function DecisionList({
  decisions,
  onEdit,
  onDelete,
}: {
  decisions: ProjectWorkspaceData['decisions']
  onEdit: (item: ProjectWorkspaceData['decisions'][number]) => void
  onDelete: (item: ProjectWorkspaceData['decisions'][number]) => void
}) {
  if (decisions.length === 0) return <EmptyLine text="No decisions recorded yet." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {decisions.map((item) => (
        <div
          key={item.id}
          style={{
            borderBottom: '1px solid var(--border)',
            paddingBottom: '10px',
            display: 'flex',
            gap: '10px',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.decision}</div>
            {item.problem && (
              <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '3px' }}>
                Problem: {item.problem}
              </div>
            )}
            {item.reason && (
              <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '3px' }}>
                {item.reason}
              </div>
            )}
            {item.alternatives && (
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                Alternatives: {item.alternatives}
              </div>
            )}
            {item.consequences && (
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                Consequences: {item.consequences}
              </div>
            )}
            {item.impact && (
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                Impact: {item.impact}
              </div>
            )}
            {item.references.length > 0 && (
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                References: {item.references.join(', ')}
              </div>
            )}
          </div>
          <IconButton onClick={() => onEdit(item)} icon={<Pencil size={13} />} />
          <IconButton onClick={() => onDelete(item)} icon={<Trash2 size={13} />} />
        </div>
      ))}
    </div>
  )
}

function ContentList({
  content,
  onEdit,
  onDelete,
  detailed = false,
}: {
  content: ProjectWorkspaceData['content']
  onEdit: (item: ProjectWorkspaceData['content'][number]) => void
  onDelete: (item: ProjectWorkspaceData['content'][number]) => void
  detailed?: boolean
}) {
  if (content.length === 0) return <EmptyLine text="No content items linked to this project." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {content.map((item) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={13} color={contentStageColor[item.status]} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px' }}>{item.title}</div>
            {detailed && (
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                {item.researchNotes || item.outline || item.script || 'No production notes yet.'}
              </div>
            )}
          </div>
          <Tag>{item.status}</Tag>
          <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{item.platform}</span>
          <IconButton onClick={() => onEdit(item)} icon={<Pencil size={13} />} />
          <IconButton onClick={() => onDelete(item)} icon={<Trash2 size={13} />} />
        </div>
      ))}
    </div>
  )
}

function SimpleEditableList<T extends { id: string; title?: string }>({
  items,
  empty,
  getTitle,
  getMeta,
  onEdit,
  onDelete,
}: {
  items: T[]
  empty: string
  getTitle?: (item: T) => string
  getMeta: (item: T) => string
  onEdit: (item: T) => void
  onDelete: (item: T) => void
}) {
  if (items.length === 0) return <EmptyLine text={empty} />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((item) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Circle size={13} color="var(--muted-foreground)" />
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
              {getTitle ? getTitle(item) : item.title}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted-foreground)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {getMeta(item)}
            </div>
          </div>
          <IconButton onClick={() => onEdit(item)} icon={<Pencil size={13} />} />
          <IconButton onClick={() => onDelete(item)} icon={<Trash2 size={13} />} />
        </div>
      ))}
    </div>
  )
}

function KnowledgeList({
  entries,
  onEdit,
  onDelete,
}: {
  entries: WorkspaceKnowledge[]
  onEdit: (entry: WorkspaceKnowledge) => void
  onDelete: (entry: WorkspaceKnowledge) => void
}) {
  if (entries.length === 0)
    return <EmptyLine text="No project knowledge yet." icon={<BookOpen size={13} />} />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {entries.map((entry) => (
        <div
          key={entry.id}
          style={{
            borderBottom: '1px solid var(--border)',
            paddingBottom: '12px',
            display: 'flex',
            gap: '12px',
          }}
        >
          <BookOpen size={14} color="var(--status-blue)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{entry.title}</div>
            {entry.body && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--muted-foreground)',
                  marginTop: '4px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {entry.body}
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <Tag>{entry.category}</Tag>
              {entry.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
          <IconButton onClick={() => onEdit(entry)} icon={<Pencil size={13} />} />
          <IconButton onClick={() => onDelete(entry)} icon={<Trash2 size={13} />} />
        </div>
      ))}
    </div>
  )
}

function AssetList({
  assets,
  onDelete,
}: {
  assets: WorkspaceAsset[]
  onDelete: (asset: WorkspaceAsset) => void
}) {
  if (assets.length === 0) return <EmptyLine text="No project assets yet." icon={<FileText size={13} />} />
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}
    >
      {assets.map((asset) => (
        <div
          key={asset.id}
          style={{
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px',
            background: 'var(--secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FileText size={14} color="var(--muted-foreground)" />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {asset.name}
            </span>
            <IconButton onClick={() => onDelete(asset)} icon={<Trash2 size={13} />} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{asset.assetType}</div>
          {asset.fileUrl && (
            <a
              href={asset.fileUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--status-blue)', fontSize: '12px', textDecoration: 'none' }}
            >
              Open asset
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

function ActivityList({
  activity,
  detailed = false,
}: {
  activity: ProjectWorkspaceData['activity']
  detailed?: boolean
}) {
  if (activity.length === 0) return <EmptyLine text="No activity logged yet." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {activity.map((item) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Circle size={13} color="var(--muted-foreground)" style={{ marginTop: '1px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px' }}>{item.action}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
              {item.entityType}
              {detailed ? ` · ${new Date(item.createdAt).toLocaleString()}` : ''}
            </div>
          </div>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted-foreground)',
              cursor: 'pointer',
            }}
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}

function IconButton({ onClick, icon }: { onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--muted-foreground)',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
      }}
    >
      {icon}
    </button>
  )
}

function EmptyLine({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: 'var(--muted-foreground)',
      }}
    >
      {icon}
      {text}
    </div>
  )
}
