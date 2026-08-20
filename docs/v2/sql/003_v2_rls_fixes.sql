-- ========================================================================
-- Day Zero OS V2 - RLS Security & Bootstrapping Fixes
-- Location: docs/v2/sql/003_v2_rls_fixes.sql
-- Description: Add missing INSERT policies for public.profiles and
--              public.workspace_members to allow correct frontend bootstrap.
-- ========================================================================

BEGIN;

-- 1. Grant INSERT permissions on profiles for users creating their own profile
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- 2. Grant INSERT permissions on workspace_members for workspace owners adding themselves or others
DROP POLICY IF EXISTS "workspace_members_insert_owner" ON public.workspace_members;
CREATE POLICY "workspace_members_insert_owner" ON public.workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

COMMIT;
