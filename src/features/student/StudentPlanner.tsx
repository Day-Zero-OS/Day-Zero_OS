import { useState, useEffect } from 'react'
import type { Screen } from '@/types/navigation'
import type { StudySession } from '@/types/student'
import { fetchStudySessions } from '@/services/studentService'

interface Props {
  onNavigate: (screen: Screen) => void
  workspaceId?: string
  initialTab?: 'study-plan' | 'calendar'
}

export default function StudentPlanner({ onNavigate, workspaceId = 'ws-1', initialTab = 'study-plan' }: Props) {
  const [tab, setTab] = useState<'study-plan' | 'calendar'>(initialTab)
  const [sessions, setSessions] = useState<StudySession[]>([])

  useEffect(() => {
    fetchStudySessions(workspaceId).then(setSessions)
  }, [workspaceId])

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background text-foreground">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Academic Planner</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize daily study blocks and view unified academic schedules
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setTab('study-plan')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'study-plan' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Study Plan
          </button>
          <button
            onClick={() => setTab('calendar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {tab === 'study-plan' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Daily Study Sessions
            </h2>
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              + New Study Session
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((sess) => (
              <div key={sess.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-card-foreground">{sess.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{sess.topic}</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded">
                    {sess.duration_minutes} min
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <span>Status: <strong className="capitalize text-card-foreground">{sess.status}</strong></span>
                  <button className="text-blue-600 hover:underline font-medium">Start Timer →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-card-foreground">August 2026 Academic Calendar</h2>
            <span className="text-xs text-muted-foreground">Month View</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground font-semibold">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                className={`p-3 rounded-lg border text-center transition-colors min-h-[60px] flex flex-col justify-between ${
                  day === 16 || day === 21
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 font-bold text-blue-600'
                    : 'border-border/60 bg-muted/20 text-card-foreground'
                }`}
              >
                <span>{day}</span>
                {day === 16 && <span className="text-[9px] truncate text-blue-600">Maths Exam</span>}
                {day === 21 && <span className="text-[9px] truncate text-red-500">Physics Due</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
