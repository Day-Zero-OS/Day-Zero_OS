import { useState, useEffect } from 'react'
import type { Screen } from '@/types/navigation'
import type { Subject, StudentAssignment, StudentExam, StudySession, StudentGoal, GroupProject } from '@/types/student'
import {
  fetchSubjects,
  fetchAssignments,
  fetchExams,
  fetchStudySessions,
  fetchGoals,
  fetchGroupProjects,
} from '@/services/studentService'

interface Props {
  onNavigate: (screen: Screen) => void
  workspaceId?: string
}

export default function StudentMissionControl({ onNavigate, workspaceId = 'ws-1' }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<StudentAssignment[]>([])
  const [exams, setExams] = useState<StudentExam[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [goals, setGoals] = useState<StudentGoal[]>([])
  const [groups, setGroups] = useState<GroupProject[]>([])

  useEffect(() => {
    fetchSubjects(workspaceId).then(setSubjects)
    fetchAssignments(workspaceId).then(setAssignments)
    fetchExams(workspaceId).then(setExams)
    fetchStudySessions(workspaceId).then(setSessions)
    fetchGoals(workspaceId).then(setGoals)
    fetchGroupProjects(workspaceId).then(setGroups)
  }, [workspaceId])

  const pendingAssignments = assignments.filter((a) => a.status === 'todo' || a.status === 'in_progress')
  const upcomingExams = exams.filter((e) => e.status === 'upcoming')

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background text-foreground">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Sunday, August 16, 2026
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
          Good morning, Nikshith Goud.
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          You have {pendingAssignments.length} assignments, {upcomingExams.length} upcoming exams, and 1 group task this week.
        </p>
      </div>

      {/* Today's Mission Banner */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm border-l-4 border-l-blue-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Today's Mission
            </span>
            <h2 className="text-lg font-semibold text-card-foreground mt-0.5">
              Complete today's academic priorities
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {sessions.length} study sessions • {pendingAssignments.length} assignments • 1 upcoming deadline
            </p>
          </div>
          <button
            onClick={() => onNavigate('student-study-plan')}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors shrink-0"
          >
            Start Today's Plan →
          </button>
        </div>
      </div>

      {/* Academic Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('student-assignments')}
          className="cursor-pointer rounded-xl border border-border bg-card p-4 hover:border-blue-500/50 transition-colors shadow-sm"
        >
          <p className="text-xs font-medium text-muted-foreground">Assignments</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{pendingAssignments.length} Pending</p>
          <p className="text-[11px] text-red-500 mt-1">1 due tomorrow</p>
        </div>

        <div
          onClick={() => onNavigate('student-exams')}
          className="cursor-pointer rounded-xl border border-border bg-card p-4 hover:border-blue-500/50 transition-colors shadow-sm"
        >
          <p className="text-xs font-medium text-muted-foreground">Exams</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{upcomingExams.length} Upcoming</p>
          <p className="text-[11px] text-blue-600 mt-1">5 days to next exam</p>
        </div>

        <div
          onClick={() => onNavigate('student-attendance')}
          className="cursor-pointer rounded-xl border border-border bg-card p-4 hover:border-blue-500/50 transition-colors shadow-sm"
        >
          <p className="text-xs font-medium text-muted-foreground">Attendance</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">87%</p>
          <p className="text-[11px] text-emerald-600 mt-1">Overall attendance</p>
        </div>

        <div
          onClick={() => onNavigate('student-goals')}
          className="cursor-pointer rounded-xl border border-border bg-card p-4 hover:border-blue-500/50 transition-colors shadow-sm"
        >
          <p className="text-xs font-medium text-muted-foreground">Weekly Progress</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">72%</p>
          <p className="text-[11px] text-muted-foreground mt-1">4 / 6 activities done</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Deadlines */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-card-foreground">
                Upcoming Deadlines
              </h3>
              <button
                onClick={() => onNavigate('student-assignments')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {assignments.slice(0, 3).map((asgn) => (
                <div key={asgn.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50">
                  <div>
                    <p className="text-xs font-semibold text-card-foreground">{asgn.title}</p>
                    <p className="text-[11px] text-muted-foreground">Assignment • {asgn.subject_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-red-500">{asgn.due_date}</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{asgn.priority} Priority</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Work Section */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-card-foreground">
                Group Work
              </h3>
              <button
                onClick={() => onNavigate('student-group-work')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.map((grp) => (
                <div
                  key={grp.id}
                  onClick={() => onNavigate('student-group-detail')}
                  className="cursor-pointer p-4 rounded-xl border border-border bg-muted/20 hover:border-blue-500/40 transition-colors"
                >
                  <p className="text-xs font-bold text-card-foreground">{grp.name}</p>
                  <p className="text-[11px] text-muted-foreground">{grp.type} • {grp.members_count} Members</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-blue-600">{grp.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${grp.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Calendar & Today's Study Plan */}
        <div className="space-y-6">
          {/* Calendar Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-card-foreground">
                Calendar
              </h3>
              <button
                onClick={() => onNavigate('student-calendar')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View Calendar →
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">Aug 16 – Aug 22</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2 rounded bg-muted/40">
                <span className="font-semibold text-blue-600">Sun 16</span>
                <span className="text-card-foreground">Maths — Diff. Equations</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-muted/40">
                <span className="font-semibold text-red-500">Mon 17</span>
                <span className="text-card-foreground">Physics Lab Report</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-muted/40">
                <span className="font-semibold text-blue-600">Tue 18</span>
                <span className="text-card-foreground">Data Structures Study</span>
              </div>
            </div>
          </div>

          {/* Today's Study Plan Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-card-foreground">
                Today's Study Plan
              </h3>
              <button
                onClick={() => onNavigate('student-study-plan')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View Plan →
              </button>
            </div>
            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                  <input type="checkbox" className="mt-1 rounded border-border text-blue-600 focus:ring-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-card-foreground">{sess.title}</p>
                    <p className="text-[11px] text-muted-foreground">{sess.topic}</p>
                  </div>
                  <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                    {sess.duration_minutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('student-assignments')}
            className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg text-foreground border border-border transition-colors"
          >
            + Assignment
          </button>
          <button
            onClick={() => onNavigate('student-study-plan')}
            className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg text-foreground border border-border transition-colors"
          >
            + Study Session
          </button>
          <button
            onClick={() => onNavigate('student-exams')}
            className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg text-foreground border border-border transition-colors"
          >
            + Exam
          </button>
          <button
            onClick={() => onNavigate('student-notes')}
            className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg text-foreground border border-border transition-colors"
          >
            + Note
          </button>
          <button
            onClick={() => onNavigate('student-files')}
            className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg text-foreground border border-border transition-colors"
          >
            Upload File
          </button>
          <button
            onClick={() => onNavigate('student-attendance')}
            className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg text-foreground border border-border transition-colors"
          >
            Record Attendance
          </button>
        </div>
      </div>
    </div>
  )
}
