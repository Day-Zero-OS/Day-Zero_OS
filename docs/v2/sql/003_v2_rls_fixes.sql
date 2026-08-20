-- ========================================================================
-- Day Zero OS V2 - Database Alterations & RLS Fixes
-- Location: docs/v2/sql/003_v2_rls_fixes.sql
-- Description: Alter profiles table in place to add missing columns,
--              create signup trigger, and apply missing INSERT RLS policies.
-- ========================================================================

BEGIN;

-- 1. Add missing columns to profiles table in place
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. Grant INSERT permissions on profiles for users creating their own profile
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- 3. Grant INSERT permissions on workspace_members for workspace owners adding themselves
DROP POLICY IF EXISTS "workspace_members_insert_owner" ON public.workspace_members;
CREATE POLICY "workspace_members_insert_owner" ON public.workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

-- 4. Create the handle_new_user function and trigger for auth signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  -- Create personal workspace
  new_workspace_id := gen_random_uuid();
  INSERT INTO public.workspaces (id, owner_id, name, is_personal)
  VALUES (
    new_workspace_id,
    NEW.id,
    'Personal Workspace',
    true
  );

  -- Create workspace membership
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (
    new_workspace_id,
    NEW.id,
    'owner',
    'active'
  );

  -- Create user settings
  INSERT INTO public.user_settings (user_id, current_workspace_id)
  VALUES (
    NEW.id,
    new_workspace_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

