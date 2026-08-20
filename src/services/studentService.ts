import { getSupabaseClient } from '@/lib/supabase/client'
import type {
  Subject,
  StudySession,
  AcademicRecord,
  StudentAssignment,
  StudentExam,
  AttendanceRecord,
  StudentGoal,
  GroupProject,
} from '@/types/student'

// ─── Default Initial Mock State for Offline/Demo UI ──────────────────────────
const INITIAL_SUBJECTS: Subject[] = [
  { work_context_id: 'ctx-1', workspace_id: 'ws-1', name: 'Mathematics', code: 'MTH301', instructor_name: 'Dr. Alan Smith', credits: 4, progress: 72, attendance: 92, assignments_count: 2, exams_count: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { work_context_id: 'ctx-2', workspace_id: 'ws-1', name: 'Physics', code: 'PHY202', instructor_name: 'Prof. Marie Curie', credits: 3.5, progress: 65, attendance: 84, assignments_count: 1, exams_count: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { work_context_id: 'ctx-3', workspace_id: 'ws-1', name: 'Chemistry', code: 'CHM201', instructor_name: 'Dr. Walter White', credits: 3, progress: 78, attendance: 90, assignments_count: 0, exams_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { work_context_id: 'ctx-4', workspace_id: 'ws-1', name: 'Data Structures', code: 'CS301', instructor_name: 'Prof. Donald Knuth', credits: 4, progress: 84, attendance: 82, assignments_count: 3, exams_count: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { work_context_id: 'ctx-5', workspace_id: 'ws-1', name: 'English', code: 'ENG101', instructor_name: 'Dr. Jane Austen', credits: 2, progress: 88, attendance: 96, assignments_count: 1, exams_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { work_context_id: 'ctx-6', workspace_id: 'ws-1', name: 'Economics', code: 'ECO201', instructor_name: 'Prof. Adam Smith', credits: 3, progress: 60, attendance: 78, assignments_count: 2, exams_count: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const INITIAL_ASSIGNMENTS: StudentAssignment[] = [
  { id: 'asgn-1', workspace_id: 'ws-1', work_context_id: 'ctx-2', subject_name: 'Physics', title: 'Physics Lab Report', due_date: 'Aug 17', priority: 'high', status: 'todo', progress: 30, created_at: new Date().toISOString() },
  { id: 'asgn-2', workspace_id: 'ws-1', work_context_id: 'ctx-1', subject_name: 'Mathematics', title: 'Mathematics Assignment', due_date: 'Aug 19', priority: 'medium', status: 'in_progress', progress: 55, created_at: new Date().toISOString() },
  { id: 'asgn-3', workspace_id: 'ws-1', work_context_id: 'ctx-4', subject_name: 'Data Structures', title: 'Data Structures Project', due_date: 'Aug 22', priority: 'high', status: 'in_progress', progress: 40, created_at: new Date().toISOString() },
  { id: 'asgn-4', workspace_id: 'ws-1', work_context_id: 'ctx-2', subject_name: 'Physics', title: 'Essay on Thermodynamics', due_date: 'Aug 25', priority: 'medium', status: 'todo', progress: 0, created_at: new Date().toISOString() },
  { id: 'asgn-5', workspace_id: 'ws-1', work_context_id: 'ctx-1', subject_name: 'Mathematics', title: 'Linear Algebra Problem Set', due_date: 'Aug 28', priority: 'low', status: 'todo', progress: 0, created_at: new Date().toISOString() },
  { id: 'asgn-6', workspace_id: 'ws-1', work_context_id: 'ctx-3', subject_name: 'Chemistry', title: 'Chemistry Lab Analysis', due_date: 'Aug 12', priority: 'high', status: 'submitted', progress: 100, created_at: new Date().toISOString() },
  { id: 'asgn-7', workspace_id: 'ws-1', work_context_id: 'ctx-4', subject_name: 'Data Structures', title: 'DSA Binary Trees', due_date: 'Aug 10', priority: 'high', status: 'completed', progress: 100, created_at: new Date().toISOString() },
]

const INITIAL_EXAMS: StudentExam[] = [
  { id: 'exam-1', workspace_id: 'ws-1', work_context_id: 'ctx-1', subject_name: 'Mathematics', title: 'Mid-Semester Exam', date: 'Aug 21', days_left: 5, preparation_progress: 80, topics: 'Differential Equations, Linear Algebra', exam_type: 'Mid-Semester', status: 'upcoming' },
  { id: 'exam-2', workspace_id: 'ws-1', work_context_id: 'ctx-2', subject_name: 'Physics', title: 'Unit Test', date: 'Aug 29', days_left: 13, preparation_progress: 45, topics: 'Thermodynamics, Wave Mechanics', exam_type: 'Unit Test', status: 'upcoming' },
  { id: 'exam-3', workspace_id: 'ws-1', work_context_id: 'ctx-4', subject_name: 'Data Structures', title: 'Mid-Semester Exam', date: 'Sep 5', days_left: 20, preparation_progress: 60, topics: 'Trees, Graphs, Dynamic Programming', exam_type: 'Mid-Semester', status: 'upcoming' },
  { id: 'exam-4', workspace_id: 'ws-1', work_context_id: 'ctx-3', subject_name: 'Chemistry', title: 'Organic Chemistry Test', date: 'Aug 5', days_left: 0, preparation_progress: 100, topics: 'Organic Chemistry', exam_type: 'Unit Test', status: 'completed', score: 78, grade: 'B+' },
  { id: 'exam-5', workspace_id: 'ws-1', work_context_id: 'ctx-5', subject_name: 'English', title: 'Literature Mid-Term', date: 'Jul 28', days_left: 0, preparation_progress: 100, topics: 'Victorian Literature', exam_type: 'Mid-Semester', status: 'completed', score: 91, grade: 'A' },
]

const INITIAL_SESSIONS: StudySession[] = [
  { id: 'sess-1', workspace_id: 'ws-1', work_context_id: 'ctx-4', title: 'Trees & Graphs Study', topic: 'Binary Search Trees', duration_minutes: 60, start_time: '2026-08-20T17:00:00Z', status: 'scheduled', created_at: new Date().toISOString() },
  { id: 'sess-2', workspace_id: 'ws-1', work_context_id: 'ctx-1', title: 'Differential Equations', topic: 'Second order ODEs', duration_minutes: 45, start_time: '2026-08-20T18:30:00Z', status: 'scheduled', created_at: new Date().toISOString() },
  { id: 'sess-3', workspace_id: 'ws-1', work_context_id: 'ctx-2', title: 'Physics Lab Preparation', topic: 'Timing error calculations', duration_minutes: 30, start_time: '2026-08-20T19:30:00Z', status: 'scheduled', created_at: new Date().toISOString() },
]

const INITIAL_GOALS: StudentGoal[] = [
  { id: 'goal-1', workspace_id: 'ws-1', work_context_id: 'ctx-1', subject_name: 'Mathematics', title: 'Score 90% in Mathematics', progress: 80, deadline: 'Dec 2026' },
  { id: 'goal-2', workspace_id: 'ws-1', subject_name: 'All Subjects', title: 'Maintain 85% Attendance', progress: 87, deadline: 'Dec 2026' },
  { id: 'goal-3', workspace_id: 'ws-1', work_context_id: 'ctx-4', subject_name: 'Data Structures', title: 'Complete Final Year Project', progress: 60, deadline: 'Nov 2026' },
]

const INITIAL_GROUPS: GroupProject[] = [
  { id: 'grp-1', workspace_id: 'ws-1', name: 'Database Management System', type: 'Group Project', members_count: 4, progress: 65, status: 'Active', due_date: 'Aug 25, 2026', member_avatars: ['N', 'R', 'A'] },
  { id: 'grp-2', workspace_id: 'ws-1', name: 'OS Lab Project', type: 'Lab Project', members_count: 3, progress: 40, status: 'Active', due_date: 'Sep 10, 2026', member_avatars: ['N', 'P'] },
]

// ─── Student Service Functions ────────────────────────────────────────────────

export async function fetchSubjects(workspaceId: string): Promise<Subject[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('subjects')
      .select('*, work_contexts(name, description, archived_at, deleted_at)')
      .eq('workspace_id', workspaceId)

    if (error || !data || data.length === 0) {
      return INITIAL_SUBJECTS
    }

    return data.map((item: any) => ({
      work_context_id: item.work_context_id,
      workspace_id: item.workspace_id,
      name: item.work_contexts?.name || 'Subject',
      description: item.work_contexts?.description || '',
      code: item.code,
      instructor_name: item.instructor_name,
      credits: Number(item.credits || 3),
      syllabus_url: item.syllabus_url,
      progress: 75,
      attendance: 90,
      assignments_count: 2,
      exams_count: 1,
      archived_at: item.work_contexts?.archived_at,
      deleted_at: item.work_contexts?.deleted_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))
  } catch {
    return INITIAL_SUBJECTS
  }
}

export async function fetchAssignments(workspaceId: string): Promise<StudentAssignment[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('task_type', 'assignment')

    if (error || !data || data.length === 0) {
      return INITIAL_ASSIGNMENTS
    }

    return data.map((item: any) => ({
      id: item.id,
      workspace_id: item.workspace_id,
      work_context_id: item.work_context_id,
      title: item.title,
      description: item.description,
      due_date: item.due_date || 'Upcoming',
      priority: item.priority || 'medium',
      status: item.status || 'todo',
      progress: item.progress || 0,
      created_at: item.created_at,
    }))
  } catch {
    return INITIAL_ASSIGNMENTS
  }
}

export async function fetchExams(workspaceId: string): Promise<StudentExam[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('event_type', 'exam')

    if (error || !data || data.length === 0) {
      return INITIAL_EXAMS
    }

    return data.map((item: any) => ({
      id: item.id,
      workspace_id: item.workspace_id,
      work_context_id: item.work_context_id,
      title: item.title,
      date: item.start_time || 'Upcoming',
      days_left: 5,
      preparation_progress: item.metadata?.prep_progress || 50,
      topics: item.description || '',
      exam_type: item.metadata?.exam_type || 'Exam',
      status: item.status === 'completed' ? 'completed' : 'upcoming',
      score: item.metadata?.score,
      grade: item.metadata?.grade,
    }))
  } catch {
    return INITIAL_EXAMS
  }
}

export async function fetchStudySessions(workspaceId: string): Promise<StudySession[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('workspace_id', workspaceId)

    if (error || !data || data.length === 0) {
      return INITIAL_SESSIONS
    }

    return data as StudySession[]
  } catch {
    return INITIAL_SESSIONS
  }
}

export async function fetchGoals(workspaceId: string): Promise<StudentGoal[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('workspace_id', workspaceId)

    if (error || !data || data.length === 0) {
      return INITIAL_GOALS
    }

    return data.map((item: any) => ({
      id: item.id,
      workspace_id: item.workspace_id,
      work_context_id: item.work_context_id,
      title: item.title,
      progress: item.progress || 0,
      deadline: item.target_date || 'Dec 2026',
    }))
  } catch {
    return INITIAL_GOALS
  }
}

export async function fetchGroupProjects(workspaceId: string): Promise<GroupProject[]> {
  return INITIAL_GROUPS
}
