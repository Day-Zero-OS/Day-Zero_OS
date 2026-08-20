-- Day Zero OS V2 - Student OS Sector Extension Migration
-- Approved Tables: subjects, study_sessions, academic_records

-- 1. Subjects Table (1:1 Extension of Core work_contexts)
CREATE TABLE IF NOT EXISTS public.subjects (
  work_context_id UUID PRIMARY KEY REFERENCES public.work_contexts(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  instructor_name TEXT,
  credits NUMERIC(3,1) DEFAULT 3.0,
  syllabus_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Study Sessions Table (Transaction log for study timers & sessions)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  work_context_id UUID NOT NULL REFERENCES public.work_contexts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT,
  duration_minutes INT NOT NULL DEFAULT 60,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Academic Records Table (Authenticated Student GPA & Transcript Tracking)
CREATE TABLE IF NOT EXISTS public.academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cumulative_gpa NUMERIC(4,3) CHECK (cumulative_gpa BETWEEN 0.000 AND 4.000) DEFAULT 0.000,
  target_gpa NUMERIC(4,3) CHECK (target_gpa BETWEEN 0.000 AND 4.000) DEFAULT 4.000,
  current_semester INT DEFAULT 1,
  total_credits INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT academic_records_workspace_user_unique UNIQUE (workspace_id, user_id)
);

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_academic_records_updated_at
  BEFORE UPDATE ON public.academic_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row-Level Security (RLS)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Workspace members can view subjects" ON public.subjects;
CREATE POLICY "Workspace members can view subjects"
  ON public.subjects FOR SELECT
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can manage subjects" ON public.subjects;
CREATE POLICY "Workspace members can manage subjects"
  ON public.subjects FOR ALL
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can view study_sessions" ON public.study_sessions;
CREATE POLICY "Workspace members can view study_sessions"
  ON public.study_sessions FOR SELECT
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can manage study_sessions" ON public.study_sessions;
CREATE POLICY "Workspace members can manage study_sessions"
  ON public.study_sessions FOR ALL
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Users can view their academic_records" ON public.academic_records;
CREATE POLICY "Users can view their academic_records"
  ON public.academic_records FOR SELECT
  USING (auth.uid() = user_id AND public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Users can manage their academic_records" ON public.academic_records;
CREATE POLICY "Users can manage their academic_records"
  ON public.academic_records FOR ALL
  USING (auth.uid() = user_id AND public.is_workspace_member(workspace_id));
