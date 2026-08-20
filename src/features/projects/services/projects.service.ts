import { getSupabaseClient } from '@/lib/supabase/client'
import { requireWorkspaceId } from '@/features/workspace/services/workspace-helpers'
import type { Priority, ProjectStatus } from '@/types/enums'

export type ProjectListItem = {
  id: string
  name: string
  description: string
  status: ProjectStatus
  progress: number
  deadline: string
  technologies: string[]
  priority: Priority
  createdAt: string
}

export async function listProjects(
  includeArchivedOrWorkspaceId?: boolean | string,
  includeArchivedParam = false,
): Promise<ProjectListItem[]> {
  let targetWorkspaceId: string
  let showArchived = includeArchivedParam

  if (typeof includeArchivedOrWorkspaceId === 'boolean') {
    showArchived = includeArchivedOrWorkspaceId
    targetWorkspaceId = requireWorkspaceId()
  } else {
    targetWorkspaceId = requireWorkspaceId(includeArchivedOrWorkspaceId)
  }

  const supabase = getSupabaseClient()

  // Fetch from work_contexts with joined engineering_projects
  let query = supabase
    .from('work_contexts')
    .select(`
      id, 
      name, 
      description, 
      status, 
      progress, 
      created_at, 
      engineering_projects (
        repository_url, 
        tech_stack
      )
    `)
    .eq('workspace_id', targetWorkspaceId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (!showArchived) query = query.neq('status', 'archived')
  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((row: any) => {
    const engProj = Array.isArray(row.engineering_projects) 
      ? row.engineering_projects[0] 
      : row.engineering_projects

    return {
      id: row.id,
      name: row.name,
      description: row.description ?? 'No description',
      status: row.status as ProjectStatus,
      progress: row.progress,
      deadline: 'No deadline',
      technologies: engProj?.tech_stack ?? [],
      priority: 'medium',
      createdAt: row.created_at,
    }
  })
}

export async function createProject(input: {
  ownerId: string
  workspaceId?: string
  name: string
  description?: string
}): Promise<ProjectListItem> {
  const targetWorkspaceId = requireWorkspaceId(input.workspaceId)
  const supabase = getSupabaseClient()

  // 1. Insert into Core work_contexts
  const { data: wc, error: wcError } = await supabase
    .from('work_contexts')
    .insert({
      owner_id: input.ownerId,
      workspace_id: targetWorkspaceId,
      name: input.name,
      description: input.description ?? null,
      status: 'active',
      progress: 0,
    })
    .select()
    .single()

  if (wcError) throw wcError

  // 2. Fetch workspace to check sector type
  const { data: ws } = await supabase
    .from('workspaces')
    .select('sector_type')
    .eq('id', targetWorkspaceId)
    .single()

  // 3. If sector is engineering, insert engineering_projects 1:1 row
  if (ws?.sector_type === 'engineering') {
    const { error: engError } = await supabase
      .from('engineering_projects')
      .insert({
        work_context_id: wc.id,
        workspace_id: targetWorkspaceId,
        tech_stack: [],
      })
    if (engError) {
      console.error('Failed to create engineering project sector mapping:', engError)
    }
  }

  // 4. Activity Log
  await supabase.from('activity_log').insert({
    workspace_id: targetWorkspaceId,
    project_id: wc.id,
    user_id: input.ownerId,
    action: `Created project "${wc.name}"`,
    entity_type: 'project',
    entity_id: wc.id,
  })

  return {
    id: wc.id,
    name: wc.name,
    description: wc.description ?? 'No description',
    status: wc.status as ProjectStatus,
    progress: wc.progress,
    deadline: 'No deadline',
    technologies: [],
    priority: 'medium',
    createdAt: wc.created_at,
  }
}

export async function archiveProject(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('work_contexts')
    .update({ status: 'archived', archived_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function restoreProject(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('work_contexts')
    .update({ status: 'active', archived_at: null })
    .eq('id', id)
  if (error) throw error
}

export async function duplicateProject(
  ownerId: string,
  source: ProjectListItem,
  workspaceId?: string,
): Promise<ProjectListItem> {
  return createProject({
    ownerId,
    workspaceId,
    name: `${source.name} Copy`,
    description: source.description,
  })
}

