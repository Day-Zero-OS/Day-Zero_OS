export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          timezone: string
          workspace_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          timezone?: string
          workspace_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          timezone?: string
          workspace_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string | null
          is_personal: boolean
          logo_url: string | null
          storage_path: string | null
          metadata: Json
          sector_type: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug?: string | null
          is_personal?: boolean
          logo_url?: string | null
          storage_path?: string | null
          metadata?: Json
          sector_type?: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string | null
          is_personal?: boolean
          logo_url?: string | null
          storage_path?: string | null
          metadata?: Json
          sector_type?: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          current_workspace_id: string | null
          theme: 'dark' | 'light' | 'system'
          accent_color: string
          sidebar_layout: string
          default_project_view: string
          notifications: Json
          ai_enabled: boolean
          preferences: Json
          language: string
          updated_at: string
        }
        Insert: {
          user_id: string
          current_workspace_id?: string | null
          theme?: 'dark' | 'light' | 'system'
          accent_color?: string
          sidebar_layout?: string
          default_project_view?: string
          notifications?: Json
          ai_enabled?: boolean
          preferences?: Json
          language?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          current_workspace_id?: string | null
          theme?: 'dark' | 'light' | 'system'
          accent_color?: string
          sidebar_layout?: string
          default_project_view?: string
          notifications?: Json
          ai_enabled?: boolean
          preferences?: Json
          language?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          status: 'pending' | 'active' | 'suspended' | 'removed'
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          status?: 'pending' | 'active' | 'suspended' | 'removed'
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          status?: 'pending' | 'active' | 'suspended' | 'removed'
          joined_at?: string
        }
      }
      workspace_invitations: {
        Row: {
          id: string
          workspace_id: string
          email: string
          role: 'admin' | 'editor' | 'viewer'
          invited_by: string
          token_hash: string
          status: 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked'
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          email: string
          role?: 'admin' | 'editor' | 'viewer'
          invited_by: string
          token_hash: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked'
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          role?: 'admin' | 'editor' | 'viewer'
          invited_by?: string
          token_hash?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked'
          expires_at?: string
          created_at?: string
        }
      }
      work_contexts: {
        Row: {
          id: string
          workspace_id: string
          owner_id: string
          name: string
          description: string | null
          status: 'active' | 'archived' | 'completed'
          progress: number
          archived_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          owner_id: string
          name: string
          description?: string | null
          status?: 'active' | 'archived' | 'completed'
          progress?: number
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          owner_id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'archived' | 'completed'
          progress?: number
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          work_context_id: string | null
          workspace_id: string
          title: string
          description: string | null
          status: 'todo' | 'in-progress' | 'blocked' | 'done'
          priority: 'critical' | 'high' | 'medium' | 'low'
          due_date: string | null
          assigned_to: string | null
          created_by: string
          metadata: Json
          archived_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          work_context_id?: string | null
          workspace_id: string
          title: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'blocked' | 'done'
          priority?: 'critical' | 'high' | 'medium' | 'low'
          due_date?: string | null
          assigned_to?: string | null
          created_by: string
          metadata?: Json
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          work_context_id?: string | null
          workspace_id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'blocked' | 'done'
          priority?: 'critical' | 'high' | 'medium' | 'low'
          due_date?: string | null
          assigned_to?: string | null
          created_by?: string
          metadata?: Json
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          workspace_id: string
          work_context_id: string | null
          owner_id: string
          title: string
          description: string | null
          target_date: string | null
          progress: number
          archived_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          work_context_id?: string | null
          owner_id: string
          title: string
          description?: string | null
          target_date?: string | null
          progress?: number
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          work_context_id?: string | null
          owner_id?: string
          title?: string
          description?: string | null
          target_date?: string | null
          progress?: number
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          workspace_id: string
          work_context_id: string | null
          owner_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          location: string | null
          metadata: Json
          archived_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          work_context_id?: string | null
          owner_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          location?: string | null
          metadata?: Json
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          work_context_id?: string | null
          owner_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          location?: string | null
          metadata?: Json
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      knowledge_entries: {
        Row: {
          id: string
          workspace_id: string
          work_context_id: string | null
          owner_id: string
          category: 'research' | 'lesson' | 'framework' | 'reference' | 'personal-note'
          title: string
          body: string | null
          tags: string[]
          source: string | null
          starred: boolean
          archived_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          work_context_id?: string | null
          owner_id: string
          category?: 'research' | 'lesson' | 'framework' | 'reference' | 'personal-note'
          title: string
          body?: string | null
          tags?: string[]
          source?: string | null
          starred?: boolean
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          work_context_id?: string | null
          owner_id?: string
          category?: 'research' | 'lesson' | 'framework' | 'reference' | 'personal-note'
          title?: string
          body?: string | null
          tags?: string[]
          source?: string | null
          starred?: boolean
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          workspace_id: string
          work_context_id: string | null
          owner_id: string
          asset_type: 'image' | 'video' | 'pdf' | 'logo' | 'document' | 'link' | 'github' | 'figma' | 'reference'
          file_name: string
          file_url: string
          storage_path: string | null
          tags: string[]
          description: string | null
          metadata: Json
          archived_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          work_context_id?: string | null
          owner_id: string
          asset_type?: 'image' | 'video' | 'pdf' | 'logo' | 'document' | 'link' | 'github' | 'figma' | 'reference'
          file_name: string
          file_url: string
          storage_path?: string | null
          tags?: string[]
          description?: string | null
          metadata?: Json
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          work_context_id?: string | null
          owner_id?: string
          asset_type?: 'image' | 'video' | 'pdf' | 'logo' | 'document' | 'link' | 'github' | 'figma' | 'reference'
          file_name?: string
          file_url?: string
          storage_path?: string | null
          tags?: string[]
          description?: string | null
          metadata?: Json
          archived_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      engineering_projects: {
        Row: {
          work_context_id: string
          workspace_id: string
          repository_url: string | null
          ci_cd_pipeline: string | null
          tech_stack: string[]
          branch_rules: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          work_context_id: string
          workspace_id: string
          repository_url?: string | null
          ci_cd_pipeline?: string | null
          tech_stack?: string[]
          branch_rules?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          work_context_id?: string
          workspace_id?: string
          repository_url?: string | null
          ci_cd_pipeline?: string | null
          tech_stack?: string[]
          branch_rules?: Json
          created_at?: string
          updated_at?: string
        }
      }
      sprints: {
        Row: {
          id: string
          engineering_project_id: string
          workspace_id: string
          name: string
          start_date: string
          end_date: string
          status: 'planning' | 'active' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          engineering_project_id: string
          workspace_id: string
          name: string
          start_date: string
          end_date: string
          status?: 'planning' | 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          engineering_project_id?: string
          workspace_id?: string
          name?: string
          start_date?: string
          end_date?: string
          status?: 'planning' | 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      project_bugs: {
        Row: {
          task_id: string
          workspace_id: string
          engineering_project_id: string
          severity: 'blocker' | 'major' | 'minor' | 'trivial'
          steps_to_reproduce: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          task_id: string
          workspace_id: string
          engineering_project_id: string
          severity: 'blocker' | 'major' | 'minor' | 'trivial'
          steps_to_reproduce?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          task_id?: string
          workspace_id?: string
          engineering_project_id?: string
          severity?: 'blocker' | 'major' | 'minor' | 'trivial'
          steps_to_reproduce?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      technical_debt_items: {
        Row: {
          task_id: string
          workspace_id: string
          engineering_project_id: string
          impact_score: number
          refactor_target: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          task_id: string
          workspace_id: string
          engineering_project_id: string
          impact_score: number
          refactor_target?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          task_id?: string
          workspace_id?: string
          engineering_project_id?: string
          impact_score?: number
          refactor_target?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          work_context_id: string
          workspace_id: string
          course_code: string
          department: string
          credits: number
          semester: string
          syllabus_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          work_context_id: string
          workspace_id: string
          course_code: string
          department: string
          credits: number
          semester: string
          syllabus_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          work_context_id?: string
          workspace_id?: string
          course_code?: string
          department?: string
          credits?: number
          semester?: string
          syllabus_link?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          workspace_id: string
          full_name: string
          email: string
          student_identifier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          full_name: string
          email: string
          student_identifier: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          full_name?: string
          email?: string
          student_identifier?: string
          created_at?: string
          updated_at?: string
        }
      }
      course_enrollments: {
        Row: {
          course_id: string
          student_id: string
          workspace_id: string
          enrolled_at: string
        }
        Insert: {
          course_id: string
          student_id: string
          workspace_id: string
          enrolled_at?: string
        }
        Update: {
          course_id?: string
          student_id?: string
          workspace_id?: string
          enrolled_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          workspace_id: string
          student_id: string
          task_id: string
          score: number
          feedback: string | null
          graded_by: string | null
          graded_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          student_id: string
          task_id: string
          score: number
          feedback?: string | null
          graded_by?: string | null
          graded_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          student_id?: string
          task_id?: string
          score?: number
          feedback?: string | null
          graded_by?: string | null
          graded_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          workspace_id: string
          student_id: string
          event_id: string
          status: 'present' | 'absent' | 'excused' | 'late'
          marked_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          student_id: string
          event_id: string
          status?: 'present' | 'absent' | 'excused' | 'late'
          marked_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          student_id?: string
          event_id?: string
          status?: 'present' | 'absent' | 'excused' | 'late'
          marked_at?: string
        }
      }
      subjects: {
        Row: {
          work_context_id: string
          workspace_id: string
          term: string
          gpa_weight: number
          color_code: string
          professor_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          work_context_id: string
          workspace_id: string
          term: string
          gpa_weight?: number
          color_code?: string
          professor_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          work_context_id?: string
          workspace_id?: string
          term?: string
          gpa_weight?: number
          color_code?: string
          professor_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          workspace_id: string
          subject_id: string
          start_time: string
          end_time: string
          duration_seconds: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          subject_id: string
          start_time: string
          end_time: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          subject_id?: string
          start_time?: string
          end_time?: string
          notes?: string | null
          created_at?: string
        }
      }
      academic_records: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          cumulative_gpa: number | null
          credits_earned: number
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          cumulative_gpa?: number | null
          credits_earned?: number
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          cumulative_gpa?: number | null
          credits_earned?: number
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      is_workspace_member: {
        Args: {
          target_workspace_id: string
          target_user_id?: string
        }
        Returns: boolean
      }
      get_workspace_role: {
        Args: {
          target_workspace_id: string
          target_user_id?: string
        }
        Returns: string | null
      }
      can_manage_workspace: {
        Args: {
          target_workspace_id: string
          target_user_id?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      sector_type: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'
      task_status: 'todo' | 'in-progress' | 'blocked' | 'done'
      task_priority: 'critical' | 'high' | 'medium' | 'low'
      knowledge_category: 'research' | 'lesson' | 'framework' | 'reference' | 'personal-note'
      asset_type: 'image' | 'video' | 'pdf' | 'logo' | 'document' | 'link' | 'github' | 'figma' | 'reference'
    }
    CompositeTypes: Record<string, never>
  }
}
