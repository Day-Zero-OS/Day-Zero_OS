import { getSupabaseClient } from '@/lib/supabase/client'
import { requireWorkspaceId } from '@/features/workspace/services/workspace-helpers'

export async function exportWorkspaceData(workspaceId?: string): Promise<Record<string, unknown>> {
  const targetWorkspaceId = requireWorkspaceId(workspaceId)
  const supabase = getSupabaseClient()
  const [workContexts, knowledge, assets, tasks, debriefs] = await Promise.all([
    supabase.from('work_contexts').select('*').eq('workspace_id', targetWorkspaceId).is('deleted_at', null),
    supabase.from('knowledge_entries').select('*').eq('workspace_id', targetWorkspaceId),
    supabase.from('assets').select('*').eq('workspace_id', targetWorkspaceId),
    supabase.from('tasks').select('*').eq('workspace_id', targetWorkspaceId).is('deleted_at', null),
    supabase.from('weekly_debriefs').select('*').eq('workspace_id', targetWorkspaceId),
  ])
  for (const response of [workContexts, knowledge, assets, tasks, debriefs])
    if (response.error) throw response.error
  return {
    exportedAt: new Date().toISOString(),
    workspaceId: targetWorkspaceId,
    projects: workContexts.data,
    knowledge: knowledge.data,
    assets: assets.data,
    tasks: tasks.data,
    weeklyDebriefs: debriefs.data,
  }
}

export async function storageUsage(workspaceId?: string): Promise<{ assets: number; documents: number }> {
  const targetWorkspaceId = requireWorkspaceId(workspaceId)
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('assets')
    .select('metadata')
    .eq('workspace_id', targetWorkspaceId)
  if (error) throw error
  return {
    assets: data?.length ?? 0,
    documents: data?.filter((item) => String(item.metadata?.type ?? '').includes('document')).length ?? 0,
  }
}

export async function importKnowledgeEntries(
  entries: Array<{ title?: unknown; body?: unknown; category?: unknown; tags?: unknown }>,
  ownerId: string,
  workspaceId?: string,
): Promise<number> {
  const targetWorkspaceId = requireWorkspaceId(workspaceId)
  const valid = entries
    .filter((entry) => typeof entry.title === 'string' && entry.title.trim())
    .map((entry) => ({
      owner_id: ownerId,
      workspace_id: targetWorkspaceId,
      title: String(entry.title).trim(),
      body: typeof entry.body === 'string' ? entry.body : null,
      category: ['research', 'lesson', 'framework', 'reference', 'personal-note'].includes(
        String(entry.category),
      )
        ? entry.category
        : 'research',
      tags: Array.isArray(entry.tags) ? entry.tags.map(String) : [],
    }))

  if (valid.length === 0) return 0
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('knowledge_entries').insert(valid)
  if (error) throw error
  return valid.length
}
