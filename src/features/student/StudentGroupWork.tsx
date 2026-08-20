import { useState, useEffect } from 'react'
import type { Screen } from '@/types/navigation'
import type { GroupProject } from '@/types/student'
import { fetchGroupProjects } from '@/services/studentService'

interface Props {
  onNavigate: (screen: Screen) => void
  workspaceId?: string
}

export default function StudentGroupWork({ onNavigate, workspaceId = 'ws-1' }: Props) {
  const [groups, setGroups] = useState<GroupProject[]>([])

  useEffect(() => {
    fetchGroupProjects(workspaceId).then(setGroups)
  }, [workspaceId])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Group Work & Student Teams</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Collaborative academic projects, group assignments, and team task tracking
          </p>
        </div>
        <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          + Create Group Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((grp) => (
          <div
            key={grp.id}
            onClick={() => onNavigate('student-group-detail')}
            className="cursor-pointer rounded-xl border border-border bg-card p-5 hover:border-blue-500/50 transition-colors shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                  {grp.type}
                </span>
                <h2 className="text-base font-bold text-card-foreground mt-1">{grp.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{grp.members_count} Members • Due {grp.due_date}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                {grp.status}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Team Progress</span>
                <span className="font-semibold text-blue-600">{grp.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${grp.progress}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
              <div className="flex -space-x-2 overflow-hidden">
                {grp.member_avatars.map((av, idx) => (
                  <div key={idx} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-card">
                    {av}
                  </div>
                ))}
              </div>
              <span className="text-blue-600 font-semibold hover:underline">Open Group Workspace →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
