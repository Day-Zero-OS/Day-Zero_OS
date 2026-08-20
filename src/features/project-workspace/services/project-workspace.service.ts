import { getSupabaseClient } from '@/lib/supabase/client'
import type { Priority, ProjectStatus } from '@/types/enums'

export type WorkspaceProject = {
  id: string
  workspaceId: string
  name: string
  description: string
  status: ProjectStatus
  priority: Priority
  progress: number
  deadline: string | null
  technologies: string[]
}

export type WorkspaceMilestone = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in-progress' | 'completed'
  priority: Priority
  progress: number
  dueDate: string | null
  estimatedHours: number | null
  completedDate: string | null
  notes: string | null
}

export type WorkspaceDecision = {
  id: string
  problem: string | null
  decision: string
  reason: string | null
  alternatives: string | null
  consequences: string | null
  impact: string | null
  references: string[]
  decidedAt: string
}

export type WorkspaceKnowledge = {
  id: string
  title: string
  body: string | null
  category: 'research' | 'lesson' | 'framework' | 'reference' | 'personal-note'
  tags: string[]
  starred: boolean
  createdAt: string
}

export type WorkspaceAsset = {
  id: string
  name: string
  assetType: 'image' | 'video' | 'pdf' | 'logo' | 'document' | 'link' | 'github' | 'figma' | 'reference'
  fileUrl: string | null
  storagePath: string | null
  tags: string[]
  description: string | null
  notes: string | null
  uploadedAt: string
}

export type WorkspaceContent = {
  id: string
  title: string
  status:
    | 'idea'
    | 'research'
    | 'outline'
    | 'script'
    | 'recording'
    | 'editing'
    | 'thumbnail'
    | 'seo'
    | 'published'
    | 'analytics'
  platform: string
  publishDate: string | null
  researchNotes: string | null
  outline: string | null
  script: string | null
  analytics: Record<string, unknown>
}

export type WorkspaceTask = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in-progress' | 'blocked' | 'done'
  priority: Priority
  estimateHours: number | null
  dueDate: string | null
  dependencies: string[]
  labels: string[]
  notes: string | null
}

export type WorkspaceBug = {
  id: string
  title: string
  description: string | null
  status: 'open' | 'triage' | 'fixing' | 'fixed' | 'closed'
  severity: Priority
  priority: Priority
  stepsToReproduce: string | null
  expectedBehavior: string | null
  actualBehavior: string | null
  resolution: string | null
}

export type WorkspaceDebt = {
  id: string
  title: string
  status: 'open' | 'planned' | 'resolved'
  impact: string | null
  proposedFix: string | null
}

export type WorkspaceRepository = {
  id: string
  name: string
  url: string
  branch: string | null
  notes: string | null
}

export type WorkspaceDevelopmentNote = {
  id: string
  title: string
  body: string | null
  tags: string[]
  autosavedAt: string | null
}

export type WorkspaceActivity = {
  id: string
  action: string
  entityType: string
  createdAt: string
}

export type WorkspaceSprint = {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'completed'
}

export type ProjectWorkspaceData = {
  project: WorkspaceProject
  milestones: WorkspaceMilestone[]
  decisions: WorkspaceDecision[]
  knowledge: WorkspaceKnowledge[]
  assets: WorkspaceAsset[]
  content: WorkspaceContent[]
  tasks: WorkspaceTask[]
  bugs: WorkspaceBug[]
  debt: WorkspaceDebt[]
  repositories: WorkspaceRepository[]
  developmentNotes: WorkspaceDevelopmentNote[]
  activity: WorkspaceActivity[]
  sprints: WorkspaceSprint[]
}

type ProjectUpdate = Partial<
  Pick<
    WorkspaceProject,
    'name' | 'description' | 'status' | 'priority' | 'progress' | 'deadline' | 'technologies'
  >
>

export async function fetchProjectWorkspace(projectId: string): Promise<ProjectWorkspaceData> {
  const supabase = getSupabaseClient()

  // 1. Get Project / Work Context
  const { data: wc, error: wcError } = await supabase
    .from('work_contexts')
    .select('id, name, description, status, progress, created_at, workspace_id, engineering_projects(repository_url, tech_stack)')
    .eq('id', projectId)
    .is('deleted_at', null)
    .single()

  if (wcError) throw wcError

  const engProj = Array.isArray(wc.engineering_projects) ? wc.engineering_projects[0] : wc.engineering_projects

  // 2. Get Milestones (Core Tasks with type = milestone)
  const { data: milestonesData, error: milestonesError } = await supabase
    .from('tasks')
    .select('id, title, description, status, priority, due_date, metadata')
    .eq('work_context_id', projectId)
    .eq('metadata->>type', 'milestone')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (milestonesError) throw milestonesError

  // 3. Get Knowledge Entries
  const { data: knowledge, error: knowledgeError } = await supabase
    .from('knowledge_entries')
    .select('id, title, body, category, tags, starred, created_at')
    .eq('work_context_id', projectId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (knowledgeError) throw knowledgeError

  // 4. Get Assets
  const { data: assetsData, error: assetsError } = await supabase
    .from('assets')
    .select('id, file_name, asset_type, file_url, storage_path, tags, description, created_at')
    .eq('work_context_id', projectId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (assetsError) throw assetsError

  // 5. Get Tasks (Regular tasks, not milestones, bugs, or debt)
  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, description, status, priority, due_date')
    .eq('work_context_id', projectId)
    .or('metadata->>type.is.null,metadata->>type.neq.milestone,metadata->>type.neq.bug,metadata->>type.neq.debt')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (tasksError) throw tasksError

  // 6. Get Bugs (Joined project_bugs + tasks)
  const { data: bugsData, error: bugsError } = await supabase
    .from('project_bugs')
    .select('task_id, severity, steps_to_reproduce, tasks(*)')
    .eq('engineering_project_id', projectId)

  if (bugsError) throw bugsError

  // 7. Get Technical Debt
  const { data: debtData, error: debtError } = await supabase
    .from('technical_debt_items')
    .select('task_id, impact_score, refactor_target, tasks(*)')
    .eq('engineering_project_id', projectId)

  if (debtError) throw debtError

  // 7.1 Get Sprints
  const { data: sprintsData, error: sprintsError } = await supabase
    .from('sprints')
    .select('id, name, start_date, end_date, status')
    .eq('engineering_project_id', projectId)
    .order('created_at', { ascending: true })

  if (sprintsError) {
    console.error('Failed to load sprints:', sprintsError)
  }

  const sprints = (sprintsData ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    startDate: s.start_date,
    endDate: s.end_date,
    status: s.status as any,
  }))

  const project = {
    id: wc.id,
    workspaceId: wc.workspace_id,
    name: wc.name,
    description: wc.description ?? 'No description',
    status: wc.status as ProjectStatus,
    priority: 'medium' as Priority,
    progress: wc.progress,
    deadline: null,
    technologies: engProj?.tech_stack ?? [],
  }

  const milestones = (milestonesData ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    status: (m.status === 'done' ? 'completed' : m.status === 'in-progress' ? 'in-progress' : 'todo') as any,
    priority: m.priority as Priority,
    progress: m.status === 'done' ? 100 : 0,
    dueDate: m.due_date,
    estimatedHours: null,
    completedDate: null,
    notes: m.description,
  }))

  const tasks = (tasksData ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: (t.status === 'in-progress' ? 'in-progress' : t.status) as any,
    priority: t.priority as Priority,
    estimateHours: null,
    dueDate: t.due_date,
    dependencies: [],
    labels: [],
    notes: t.description,
  }))

  const bugs = (bugsData ?? []).map((b: any) => {
    const t = b.tasks
    return {
      id: b.task_id,
      title: t?.title ?? 'Bug',
      description: t?.description ?? '',
      status: (t?.status === 'done' ? 'closed' : 'open') as any,
      severity: b.severity as Priority,
      priority: (t?.priority ?? 'medium') as Priority,
      stepsToReproduce: b.steps_to_reproduce,
      expectedBehavior: null,
      actualBehavior: null,
      resolution: null,
    }
  })

  const debt = (debtData ?? []).map((d: any) => {
    const t = d.tasks
    return {
      id: d.task_id,
      title: t?.title ?? 'Technical Debt',
      status: (t?.status === 'done' ? 'resolved' : 'open') as any,
      impact: d.impact_score ? `Impact: ${d.impact_score}/100` : null,
      proposedFix: d.refactor_target,
    }
  })

  const repositories = engProj?.repository_url ? [{
    id: `repo-${projectId}`,
    name: 'Primary Repository',
    url: engProj.repository_url,
    branch: 'main',
    notes: 'Configured in Engineering OS',
  }] : []

  return {
    project,
    milestones,
    decisions: [],
    knowledge: (knowledge ?? []).map((k: any) => ({
      id: k.id,
      title: k.title,
      body: k.body,
      category: k.category,
      tags: k.tags,
      starred: k.starred,
      createdAt: k.created_at,
    })),
    assets: (assetsData ?? []).map((a: any) => ({
      id: a.id,
      name: a.file_name,
      assetType: a.asset_type,
      fileUrl: a.file_url,
      storagePath: a.storage_path,
      tags: a.tags,
      description: a.description,
      notes: null,
      uploadedAt: a.created_at,
    })),
    content: [],
    tasks,
    bugs,
    debt,
    repositories,
    developmentNotes: [],
    activity: [],
    sprints,
  }
}

export async function createTask(
  projectId: string,
  input: {
    title: string
    description?: string | null
    priority?: Priority
    estimate_hours?: number | null
    due_date?: string | null
    dependencies?: string[]
    labels?: string[]
    notes?: string | null
  },
) {
  const supabase = getSupabaseClient()
  const { data: wc } = await supabase.from('work_contexts').select('workspace_id, owner_id').eq('id', projectId).single()
  if (!wc) throw new Error('Work context not found')

  const { error } = await supabase.from('tasks').insert({
    work_context_id: projectId,
    workspace_id: wc.workspace_id,
    title: input.title,
    description: input.description ?? input.notes ?? null,
    priority: input.priority ?? 'medium',
    due_date: input.due_date ?? null,
    created_by: wc.owner_id,
    status: 'todo',
  })
  if (error) throw error
}

export async function updateTask(
  id: string,
  updates: Partial<{
    title: string
    description: string | null
    status: WorkspaceTask['status']
    priority: Priority
    estimate_hours: number | null
    due_date: string | null
    dependencies: string[]
    labels: string[]
    notes: string | null
    completed_at: string | null
  }>,
) {
  const supabase = getSupabaseClient()
  const payload: any = {}
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.description !== undefined || updates.notes !== undefined) {
    payload.description = updates.description ?? updates.notes ?? null
  }
  if (updates.status !== undefined) {
    payload.status = updates.status === 'in-progress' ? 'in-progress' : updates.status
  }
  if (updates.priority !== undefined) payload.priority = updates.priority
  if (updates.due_date !== undefined) payload.due_date = updates.due_date

  const { error } = await supabase.from('tasks').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function createBug(
  projectId: string,
  input: {
    title: string
    description?: string | null
    severity?: Priority
    priority?: Priority
    steps_to_reproduce?: string | null
    expected_behavior?: string | null
    actual_behavior?: string | null
  },
) {
  const supabase = getSupabaseClient()
  const { data: wc } = await supabase.from('work_contexts').select('workspace_id, owner_id').eq('id', projectId).single()
  if (!wc) throw new Error('Work context not found')

  // 1. Insert Core Task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      work_context_id: projectId,
      workspace_id: wc.workspace_id,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? 'medium',
      created_by: wc.owner_id,
      status: 'todo',
      metadata: { type: 'bug' },
    })
    .select()
    .single()

  if (taskError) throw taskError

  // 2. Insert Sector Bug details
  const { error: bugError } = await supabase
    .from('project_bugs')
    .insert({
      task_id: task.id,
      workspace_id: wc.workspace_id,
      engineering_project_id: projectId,
      severity: input.severity ?? 'minor',
      steps_to_reproduce: input.steps_to_reproduce ?? null,
    })

  if (bugError) throw bugError
}

export async function updateBug(
  id: string,
  updates: Partial<{
    title: string
    description: string | null
    status: WorkspaceBug['status']
    severity: Priority
    priority: Priority
    steps_to_reproduce: string | null
    expected_behavior: string | null
    actual_behavior: string | null
    resolution: string | null
  }>,
) {
  const supabase = getSupabaseClient()

  // 1. Update Core Task attributes
  const taskPayload: any = {}
  if (updates.title !== undefined) taskPayload.title = updates.title
  if (updates.description !== undefined) taskPayload.description = updates.description
  if (updates.status !== undefined) {
    taskPayload.status = updates.status === 'closed' ? 'done' : 'todo'
  }
  if (updates.priority !== undefined) taskPayload.priority = updates.priority

  if (Object.keys(taskPayload).length > 0) {
    const { error: taskError } = await supabase.from('tasks').update(taskPayload).eq('id', id)
    if (taskError) throw taskError
  }

  // 2. Update Sector Bug attributes
  const bugPayload: any = {}
  if (updates.severity !== undefined) bugPayload.severity = updates.severity
  if (updates.steps_to_reproduce !== undefined) bugPayload.steps_to_reproduce = updates.steps_to_reproduce

  if (Object.keys(bugPayload).length > 0) {
    const { error: bugError } = await supabase.from('project_bugs').update(bugPayload).eq('task_id', id)
    if (bugError) throw bugError
  }
}

export async function deleteBug(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function createDebt(projectId: string, title: string) {
  const supabase = getSupabaseClient()
  const { data: wc } = await supabase.from('work_contexts').select('workspace_id, owner_id').eq('id', projectId).single()
  if (!wc) throw new Error('Work context not found')

  // 1. Insert Core Task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      work_context_id: projectId,
      workspace_id: wc.workspace_id,
      title,
      priority: 'medium',
      created_by: wc.owner_id,
      status: 'todo',
      metadata: { type: 'debt' },
    })
    .select()
    .single()

  if (taskError) throw taskError

  // 2. Insert Technical Debt details
  const { error: debtError } = await supabase
    .from('technical_debt_items')
    .insert({
      task_id: task.id,
      workspace_id: wc.workspace_id,
      engineering_project_id: projectId,
      impact_score: 50,
    })

  if (debtError) throw debtError
}

export async function updateDebt(
  id: string,
  updates: Partial<{
    title: string
    status: WorkspaceDebt['status']
    impact: string | null
    proposed_fix: string | null
  }>,
) {
  const supabase = getSupabaseClient()

  // 1. Update Core Task attributes
  const taskPayload: any = {}
  if (updates.title !== undefined) taskPayload.title = updates.title
  if (updates.status !== undefined) {
    taskPayload.status = updates.status === 'resolved' ? 'done' : 'todo'
  }

  if (Object.keys(taskPayload).length > 0) {
    const { error: taskError } = await supabase.from('tasks').update(taskPayload).eq('id', id)
    if (taskError) throw taskError
  }

  // 2. Update Technical Debt attributes
  const debtPayload: any = {}
  if (updates.proposed_fix !== undefined) debtPayload.refactor_target = updates.proposed_fix
  if (updates.impact !== undefined && updates.impact !== null) {
    const score = parseInt(updates.impact.replace(/[^0-9]/g, ''))
    if (Number.isFinite(score)) {
      debtPayload.impact_score = Math.max(1, Math.min(100, score))
    }
  }

  if (Object.keys(debtPayload).length > 0) {
    const { error: debtError } = await supabase.from('technical_debt_items').update(debtPayload).eq('task_id', id)
    if (debtError) throw debtError
  }
}

export async function deleteDebt(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function createRepository(projectId: string, _name: string, url: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('engineering_projects')
    .update({ repository_url: url })
    .eq('work_context_id', projectId)
  if (error) throw error
}

export async function updateRepository(
  id: string,
  updates: Partial<{ name: string; url: string; branch: string | null; notes: string | null }>,
) {
  const projectId = id.replace('repo-', '')
  const supabase = getSupabaseClient()
  if (updates.url !== undefined) {
    const { error } = await supabase
      .from('engineering_projects')
      .update({ repository_url: updates.url })
      .eq('work_context_id', projectId)
    if (error) throw error
  }
}

export async function deleteRepository(id: string) {
  const projectId = id.replace('repo-', '')
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('engineering_projects')
    .update({ repository_url: null })
    .eq('work_context_id', projectId)
  if (error) throw error
}

export async function createDevelopmentNote(
  _projectId: string,
  _title: string,
  _body: string,
  _tags: string[] = [],
) {
  // Not used in V2
}

export async function updateDevelopmentNote(
  _id: string,
  _updates: Partial<{ title: string; body: string | null; tags: string[]; autosaved_at: string }>,
) {
  // Not used in V2
}

export async function deleteDevelopmentNote(_id: string) {
  // Not used in V2
}

export async function updateProject(projectId: string, updates: ProjectUpdate) {
  const supabase = getSupabaseClient()
  const wcPayload: any = {}
  if (updates.name !== undefined) wcPayload.name = updates.name
  if (updates.description !== undefined) wcPayload.description = updates.description
  if (updates.status !== undefined) wcPayload.status = updates.status === 'completed' ? 'completed' : 'active'
  if (updates.progress !== undefined) wcPayload.progress = updates.progress

  if (Object.keys(wcPayload).length > 0) {
    const { error: wcError } = await supabase.from('work_contexts').update(wcPayload).eq('id', projectId)
    if (wcError) throw wcError
  }

  const engPayload: any = {}
  if (updates.technologies !== undefined) engPayload.tech_stack = updates.technologies

  if (Object.keys(engPayload).length > 0) {
    const { error: engError } = await supabase.from('engineering_projects').update(engPayload).eq('work_context_id', projectId)
    if (engError) throw engError
  }
}

export async function deleteProject(projectId: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('work_contexts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId)
  if (error) throw error
}

export async function createMilestone(
  projectId: string,
  input: {
    title: string
    description?: string | null
    due_date?: string | null
    priority?: Priority
    estimated_hours?: number | null
    notes?: string | null
  },
) {
  const supabase = getSupabaseClient()
  const { data: wc } = await supabase.from('work_contexts').select('workspace_id, owner_id').eq('id', projectId).single()
  if (!wc) throw new Error('Work context not found')

  const { error } = await supabase.from('tasks').insert({
    work_context_id: projectId,
    workspace_id: wc.workspace_id,
    title: input.title,
    description: input.description ?? input.notes ?? null,
    priority: input.priority ?? 'medium',
    due_date: input.due_date ?? null,
    created_by: wc.owner_id,
    status: 'todo',
    metadata: { type: 'milestone' },
  })
  if (error) throw error
}

export async function updateMilestone(
  id: string,
  updates: Partial<{
    title: string
    description: string | null
    status: WorkspaceMilestone['status']
    priority: Priority
    progress: number
    due_date: string | null
    estimated_hours: number | null
    notes: string | null
    completed_date: string | null
  }>,
) {
  const supabase = getSupabaseClient()
  const payload: any = {}
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.description !== undefined || updates.notes !== undefined) {
    payload.description = updates.description ?? updates.notes ?? null
  }
  if (updates.status !== undefined) {
    payload.status = updates.status === 'completed' ? 'done' : updates.status === 'in-progress' ? 'in-progress' : 'todo'
  }
  if (updates.priority !== undefined) payload.priority = updates.priority
  if (updates.due_date !== undefined) payload.due_date = updates.due_date

  const { error } = await supabase.from('tasks').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteMilestone(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function createDecision(_input: any) {
  // Not used in V2
}

export async function updateDecision(
  _id: string,
  _updates: Partial<{
    problem: string | null
    decision: string
    reason: string | null
    alternatives_considered: string | null
    consequences: string | null
    impact: string | null
    reference_links: string[]
  }>,
) {
  // Not used in V2
}

export async function deleteDecision(_id: string) {
  // Not used in V2
}

export async function createContent(_projectId: string, _title: string, _platform: string) {
  // Not used in V2
}

export async function updateContent(
  _id: string,
  _updates: Partial<{
    title: string
    platform: string
    status: WorkspaceContent['status']
    research_notes: string | null
    outline: string | null
    script: string | null
    publish_date: string | null
    analytics: Record<string, unknown>
  }>,
) {
  // Not used in V2
}

export async function deleteContent(_id: string) {
  // Not used in V2
}

export async function createKnowledgeEntry(input: {
  projectId: string
  ownerId: string
  title: string
  body?: string
  category?: WorkspaceKnowledge['category']
  tags?: string[]
}) {
  const supabase = getSupabaseClient()
  const { data: wc } = await supabase.from('work_contexts').select('workspace_id').eq('id', input.projectId).single()
  if (!wc) throw new Error('Work context not found')

  const { error } = await supabase.from('knowledge_entries').insert({
    work_context_id: input.projectId,
    workspace_id: wc.workspace_id,
    owner_id: input.ownerId,
    title: input.title,
    body: input.body ?? null,
    category: input.category ?? 'research',
    tags: input.tags ?? [],
  })
  if (error) throw error
}

export async function updateKnowledgeEntry(
  id: string,
  updates: Partial<{
    title: string
    body: string | null
    category: WorkspaceKnowledge['category']
    tags: string[]
    starred: boolean
  }>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('knowledge_entries').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteKnowledgeEntry(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('knowledge_entries').delete().eq('id', id)
  if (error) throw error
}

export async function createProjectAssetLink(input: {
  projectId: string
  ownerId: string
  name: string
  url: string
}) {
  const supabase = getSupabaseClient()
  const { data: wc } = await supabase.from('work_contexts').select('workspace_id').eq('id', input.projectId).single()
  if (!wc) throw new Error('Work context not found')

  const { error } = await supabase.from('assets').insert({
    work_context_id: input.projectId,
    workspace_id: wc.workspace_id,
    owner_id: input.ownerId,
    asset_type: 'link',
    file_name: input.name,
    file_url: input.url,
    tags: ['link'],
  })
  if (error) throw error
}

export async function uploadProjectAsset(input: { projectId: string; ownerId: string; file: File }) {
  const supabase = getSupabaseClient()
  const { data: wc } = await supabase.from('work_contexts').select('workspace_id').eq('id', input.projectId).single()
  if (!wc) throw new Error('Work context not found')

  const storagePath = `${input.ownerId}/${input.projectId}/${crypto.randomUUID()}-${input.file.name}`
  const { error: uploadError } = await supabase.storage
    .from('project-assets')
    .upload(storagePath, input.file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('project-assets').getPublicUrl(storagePath)
  const assetType = input.file.type.startsWith('image/')
    ? 'image'
    : input.file.type.startsWith('video/')
      ? 'video'
      : input.file.type === 'application/pdf'
        ? 'pdf'
        : 'document'

  const { error } = await supabase.from('assets').insert({
    work_context_id: input.projectId,
    workspace_id: wc.workspace_id,
    owner_id: input.ownerId,
    asset_type: assetType,
    file_name: input.file.name,
    file_url: data.publicUrl,
    storage_path: storagePath,
    metadata: { size: input.file.size, type: input.file.type },
  })
  if (error) throw error
}

export async function deleteProjectAsset(asset: WorkspaceAsset) {
  const supabase = getSupabaseClient()
  if (asset.storagePath) {
    await supabase.storage.from('project-assets').remove([asset.storagePath])
  }
  const { error } = await supabase.from('assets').delete().eq('id', asset.id)
  if (error) throw error
}

export async function createSprint(
  projectId: string,
  input: {
    name: string
    startDate: string
    endDate: string
    status?: 'planning' | 'active' | 'completed'
  }
) {
  const supabase = getSupabaseClient()
  const { data: wc } = await supabase.from('work_contexts').select('workspace_id').eq('id', projectId).single()
  if (!wc) throw new Error('Work context not found')

  const { error } = await supabase.from('sprints').insert({
    engineering_project_id: projectId,
    workspace_id: wc.workspace_id,
    name: input.name,
    start_date: input.startDate,
    end_date: input.endDate,
    status: input.status ?? 'planning',
  })
  if (error) throw error
}

export async function updateSprint(
  id: string,
  updates: Partial<{
    name: string
    startDate: string
    endDate: string
    status: 'planning' | 'active' | 'completed'
  }>
) {
  const supabase = getSupabaseClient()
  const payload: any = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.startDate !== undefined) payload.start_date = updates.startDate
  if (updates.endDate !== undefined) payload.end_date = updates.endDate
  if (updates.status !== undefined) payload.status = updates.status

  const { error } = await supabase.from('sprints').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteSprint(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('sprints').delete().eq('id', id)
  if (error) throw error
}

