import { useState, useEffect } from 'react'
import type { Screen } from '@/types/navigation'
import type { StudentGoal } from '@/types/student'
import { fetchGoals } from '@/services/studentService'

interface Props {
  onNavigate: (screen: Screen) => void
  workspaceId?: string
}

export default function StudentGoals({ onNavigate, workspaceId = 'ws-1' }: Props) {
  const [goals, setGoals] = useState<StudentGoal[]>([])

  useEffect(() => {
    fetchGoals(workspaceId).then(setGoals)
  }, [workspaceId])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Goals & Academic Progress</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track semester objectives, GPA targets, and milestone completion
          </p>
        </div>
        <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          + Add New Goal
        </button>
      </div>

      {/* GPA & Semester Target Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-center">
          <p className="text-xs font-medium text-muted-foreground">Cumulative GPA Target</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">3.85 / 4.0</p>
          <p className="text-[11px] text-emerald-600 mt-1">Current: 3.72 GPA</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-center">
          <p className="text-xs font-medium text-muted-foreground">Semester 5 Target</p>
          <p className="text-3xl font-extrabold text-card-foreground mt-1">90% Target</p>
          <p className="text-[11px] text-muted-foreground mt-1">Completion: 78%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-center">
          <p className="text-xs font-medium text-muted-foreground">Target Attendance</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">85% Minimum</p>
          <p className="text-[11px] text-emerald-600 mt-1">Current: 87%</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Active Objectives ({goals.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                    {goal.subject_name || 'General'}
                  </span>
                  <h3 className="text-base font-bold text-card-foreground mt-1">{goal.title}</h3>
                </div>
                <span className="text-xs text-muted-foreground">Due: {goal.deadline}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-blue-600">{goal.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
