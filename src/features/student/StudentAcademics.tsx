import { useState, useEffect } from 'react'
import type { Screen } from '@/types/navigation'
import type { Subject, StudentAssignment, StudentExam } from '@/types/student'
import { fetchSubjects, fetchAssignments, fetchExams } from '@/services/studentService'

interface Props {
  onNavigate: (screen: Screen) => void
  workspaceId?: string
  initialTab?: 'subjects' | 'assignments' | 'exams' | 'attendance'
}

export default function StudentAcademics({ onNavigate, workspaceId = 'ws-1', initialTab = 'subjects' }: Props) {
  const [tab, setTab] = useState<'subjects' | 'assignments' | 'exams' | 'attendance'>(initialTab)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<StudentAssignment[]>([])
  const [exams, setExams] = useState<StudentExam[]>([])

  useEffect(() => {
    fetchSubjects(workspaceId).then(setSubjects)
    fetchAssignments(workspaceId).then(setAssignments)
    fetchExams(workspaceId).then(setExams)
  }, [workspaceId])

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background text-foreground">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Academics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your enrolled subjects, assignments, exams, and class attendance
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setTab('subjects')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'subjects' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setTab('assignments')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'assignments' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setTab('exams')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'exams' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Exams
          </button>
          <button
            onClick={() => setTab('attendance')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'attendance' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Attendance
          </button>
        </div>
      </div>

      {/* Tab Content: Subjects */}
      {tab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Enrolled Subjects ({subjects.length})
            </h2>
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              + Add Subject
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div key={sub.work_context_id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                      {sub.code}
                    </span>
                    <h3 className="text-base font-bold text-card-foreground mt-1">{sub.name}</h3>
                    <p className="text-xs text-muted-foreground">{sub.instructor_name}</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{sub.credits} Credits</span>
                </div>
                <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="font-semibold text-blue-600">{sub.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${sub.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className="font-semibold text-emerald-600">
                      {sub.attendance !== null ? `${sub.attendance}%` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending Work</span>
                    <span className="font-medium text-card-foreground">{sub.assignments_count} Assignments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Assignments */}
      {tab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Assignments Tracker
            </h2>
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              + New Assignment
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-card-foreground">
                {assignments.map((asgn) => (
                  <tr key={asgn.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-semibold">{asgn.title}</td>
                    <td className="p-3 text-muted-foreground">{asgn.subject_name}</td>
                    <td className="p-3 font-medium text-red-500">{asgn.due_date}</td>
                    <td className="p-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-muted">
                        {asgn.priority}
                      </span>
                    </td>
                    <td className="p-3 font-medium capitalize">{asgn.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Exams */}
      {tab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Exams & Preparation
            </h2>
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              + Schedule Exam
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <div key={exam.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                      {exam.exam_type}
                    </span>
                    <h3 className="text-base font-bold text-card-foreground mt-1">{exam.subject_name} Exam</h3>
                    <p className="text-xs text-muted-foreground">{exam.topics}</p>
                  </div>
                  <span className="text-xs font-bold text-red-500">{exam.date}</span>
                </div>
                <div className="space-y-1 pt-2 border-t border-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Preparation</span>
                    <span className="font-semibold text-blue-600">{exam.preparation_progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${exam.preparation_progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Attendance */}
      {tab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Subject Attendance Ledger
            </h2>
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              + Record Attendance
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => (
              <div key={sub.work_context_id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-card-foreground">{sub.name}</h3>
                  <p className="text-xs text-muted-foreground">{sub.code}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-emerald-600">
                    {sub.attendance !== null ? `${sub.attendance}%` : '—'}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    {sub.attendance !== null ? 'Overall Attendance' : 'No classes recorded'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
