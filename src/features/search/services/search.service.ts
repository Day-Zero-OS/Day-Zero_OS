import { getSupabaseClient } from '@/lib/supabase/client'
import { requireWorkspaceId } from '@/features/workspace/services/workspace-helpers'

export type SearchResult = {
  id: string
  type:
    | 'project'
    | 'knowledge'
    | 'content'
    | 'asset'
    | 'architecture'
    | 'activity'
    | 'weekly'
    | 'setting'
    | 'command'
  title: string
  subtitle?: string
  path: string
}

export async function searchWorkspace(query: string, workspaceId?: string): Promise<SearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const targetWorkspaceId = requireWorkspaceId(workspaceId)
  const supabase = getSupabaseClient()
  const pattern = `%${trimmed}%`

  const [projects, knowledge, assets, tasks, weekly] = await Promise.all([
    supabase
      .from('work_contexts')
      .select('id, name, description')
      .eq('workspace_id', targetWorkspaceId)
      .ilike('name', pattern)
      .is('deleted_at', null)
      .limit(5),
    supabase
      .from('knowledge_entries')
      .select('id, title, category')
      .eq('workspace_id', targetWorkspaceId)
      .ilike('title', pattern)
      .limit(5),
    supabase
      .from('assets')
      .select('id, file_name, asset_type')
      .eq('workspace_id', targetWorkspaceId)
      .ilike('file_name', pattern)
      .limit(5),
    supabase
      .from('tasks')
      .select('id, title, priority, work_context_id')
      .eq('workspace_id', targetWorkspaceId)
      .ilike('title', pattern)
      .is('deleted_at', null)
      .limit(5),
    supabase
      .from('weekly_debriefs')
      .select('id, week_start, wins, lessons')
      .eq('workspace_id', targetWorkspaceId)
      .limit(5),
  ])

  for (const response of [projects, knowledge, assets, tasks, weekly]) {
    if (response.error) throw response.error
  }

  return [
    ...(projects.data ?? []).map((item) => ({
      id: item.id,
      type: 'project' as const,
      title: item.name,
      subtitle: item.description ?? undefined,
      path: `/projects/${item.id}`,
    })),
    ...(knowledge.data ?? []).map((item) => ({
      id: item.id,
      type: 'knowledge' as const,
      title: item.title,
      subtitle: item.category,
      path: '/knowledge',
    })),
    ...(assets.data ?? []).map((item) => ({
      id: item.id,
      type: 'asset' as const,
      title: item.file_name,
      subtitle: item.asset_type,
      path: '/assets',
    })),
    ...(tasks.data ?? []).map((item) => ({
      id: item.id,
      type: 'content' as const,
      title: item.title,
      subtitle: `Priority: ${item.priority}`,
      path: item.work_context_id ? `/projects/${item.work_context_id}` : '/mission-control',
    })),
    ...(weekly.data ?? [])
      .filter((item) =>
        `${item.week_start} ${(item.wins ?? []).join(' ')} ${(item.lessons ?? []).join(' ')}`
          .toLowerCase()
          .includes(trimmed.toLowerCase()),
      )
      .map((item) => ({
        id: item.id,
        type: 'weekly' as const,
        title: `Weekly Review ${item.week_start}`,
        subtitle: [...(item.wins ?? []), ...(item.lessons ?? [])].slice(0, 2).join(' · '),
        path: '/weekly-debrief',
      })),
  ]
}
