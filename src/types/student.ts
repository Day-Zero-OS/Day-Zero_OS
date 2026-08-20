export interface Subject {
  work_context_id: string
  workspace_id: string
  name: string
  description?: string
  code: string
  instructor_name?: string
  credits: number
  syllabus_url?: string
  progress: number
  attendance: number
  assignments_count: number
  exams_count: number
  archived_at?: string | null
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface StudySession {
  id: string
  workspace_id: string
  work_context_id: string
  title: string
  topic?: string
  duration_minutes: number
  start_time?: string
  end_time?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
}

export interface AcademicRecord {
  id: string
  workspace_id: string
  user_id: string
  cumulative_gpa: number
  target_gpa: number
  current_semester: number
  total_credits: number
  created_at: string
  updated_at: string
}

export interface StudentAssignment {
  id: string
  workspace_id: string
  work_context_id?: string
  subject_name?: string
  title: string
  description?: string
  due_date: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'submitted' | 'completed'
  progress: number
  created_at: string
}

export interface StudentExam {
  id: string
  workspace_id: string
  work_context_id?: string
  subject_name?: string
  title: string
  date: string
  days_left: number
  preparation_progress: number
  topics: string
  exam_type: string
  status: 'upcoming' | 'completed'
  score?: number
  grade?: string
}

export interface AttendanceRecord {
  event_id: string
  work_context_id: string
  subject_name: string
  date: string
  status: 'present' | 'absent' | 'excused'
}

export interface StudentGoal {
  id: string
  workspace_id: string
  work_context_id?: string
  title: string
  progress: number
  deadline: string
  subject_name?: string
}

export interface GroupProject {
  id: string
  workspace_id: string
  name: string
  type: string
  members_count: number
  progress: number
  status: string
  due_date: string
  member_avatars: string[]
}
