import { useState } from 'react'
import type { Screen } from '@/types/navigation'

interface Props {
  onNavigate: (screen: Screen) => void
}

export default function StudentGroupDetail({ onNavigate }: Props) {
  const [tab, setTab] = useState<'overview' | 'tasks' | 'members' | 'files'>('overview')

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <button
            onClick={() => onNavigate('student-group-work')}
            className="text-xs text-blue-600 font-semibold mb-1 hover:underline inline-flex items-center gap-1"
          >
            ← Back to Group Projects
          </button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Database Management System</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Group Project • 4 Members • 65% Complete • Due Aug 25, 2026
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border shrink-0">
          <button
            onClick={() => setTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'overview' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('tasks')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'tasks' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setTab('members')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'members' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setTab('files')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'files' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Files
          </button>
        </div>
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-card-foreground">
                Project Overview
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Implementation of a full relational database model for student records management including SQL normalization, ER diagrams, triggers, and query optimizations.
              </p>
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Overall Completion</span>
                  <span className="font-semibold text-blue-600">65%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-card-foreground">
                Assigned Team Tasks
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded bg-muted/30">
                  <span>Nikshith (Frontend UI)</span>
                  <span className="font-semibold text-blue-600">In Progress</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-muted/30">
                  <span>Rahul (Database Schema & Triggers)</span>
                  <span className="font-semibold text-amber-500">To Do</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-muted/30">
                  <span>Anvesh (Documentation & Report)</span>
                  <span className="font-semibold text-emerald-600">Completed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-card-foreground">
                Team Roster
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">N</div>
                    <span className="font-bold">Nikshith</span>
                  </div>
                  <span className="text-muted-foreground">Frontend Lead</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">R</div>
                    <span className="font-bold">Rahul</span>
                  </div>
                  <span className="text-muted-foreground">Backend & SQL</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">A</div>
                    <span className="font-bold">Anvesh</span>
                  </div>
                  <span className="text-muted-foreground">Docs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-card-foreground">Team Task Board</h2>
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              + Assign Task
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-muted/30 rounded-lg space-y-2">
              <h3 className="font-bold text-muted-foreground uppercase text-[10px]">TO DO</h3>
              <div className="p-2.5 bg-card border border-border rounded shadow-sm">
                <p className="font-semibold">Database Triggers Setup</p>
                <p className="text-[10px] text-muted-foreground mt-1">Assigned to Rahul</p>
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg space-y-2">
              <h3 className="font-bold text-blue-600 uppercase text-[10px]">IN PROGRESS</h3>
              <div className="p-2.5 bg-card border border-border rounded shadow-sm">
                <p className="font-semibold">Frontend Dashboard Components</p>
                <p className="text-[10px] text-muted-foreground mt-1">Assigned to Nikshith</p>
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg space-y-2">
              <h3 className="font-bold text-emerald-600 uppercase text-[10px]">COMPLETED</h3>
              <div className="p-2.5 bg-card border border-border rounded shadow-sm">
                <p className="font-semibold">Project Proposal Document</p>
                <p className="text-[10px] text-muted-foreground mt-1">Assigned to Anvesh</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
