-- ========================================================================
-- Day Zero OS V2 - Base Schema Initialization
-- Location: docs/v2/sql/000_v2_base_schema.sql
-- Status: Proposal for Review (DO NOT EXECUTE)
--
-- DESCRIPTION:
-- This script initializes the baseline security and multi-tenant schema required
-- to boot a V2 workspace on a fresh V2 Supabase project.
--
-- V1 BASELINE FOUNDATION REUSE STATUS:
-- - public.profiles: Intentionally compatible with V1 profiles table schema to preserve
--   basic user parameters.
-- - public.workspaces: Extends V1 workspaces table by introducing core tenant properties
--   (is_personal, logo_url, deleted_at) that are conceptually compatible with V1 schema layout.
-- - public.user_settings: Intentionally compatible with V1 settings parameters to keep user
--   device configurations and theme states.
-- - public.workspace_members: Intentionally compatible junction table structure with role-checking
--   triggers aligned with the V1 multi-tenant architecture.
-- - public.workspace_invitations: Reuses the secure one-time invite table structure from V1.
-- - RLS Helper Functions: Reuses is_workspace_member() and can_manage_workspace() models.
-- ========================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------
-- 1. General Helper Trigger Functions
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------
-- 2. Profiles Table (References existing auth.users in Supabase managed schema)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  email TEXT,
  display_name TEXT,
  github TEXT,
  linkedin TEXT,
  website TEXT,
  location TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  workspace_name TEXT NOT NULL DEFAULT 'My Workspace',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------
-- 3. Workspaces Table
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  is_personal BOOLEAN NOT NULL DEFAULT false,
  logo_url TEXT,
  storage_path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workspaces_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT workspaces_id_unique UNIQUE (id)
);

-- ------------------------------------------------------------------------
-- 4. User Settings Table
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('dark', 'light', 'system')),
  accent_color TEXT NOT NULL DEFAULT '#3b82f6',
  sidebar_layout TEXT NOT NULL DEFAULT 'standard',
  default_project_view TEXT NOT NULL DEFAULT 'board',
  notifications JSONB NOT NULL DEFAULT '{"email": true, "push": false}'::jsonb,
  ai_enabled BOOLEAN NOT NULL DEFAULT false,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  language TEXT NOT NULL DEFAULT 'en',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------
-- 5. Workspace Members Table
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workspace_members_unique_user UNIQUE (workspace_id, user_id),
  CONSTRAINT workspace_members_ws_user_key UNIQUE (workspace_id, user_id)
);

-- ------------------------------------------------------------------------
-- 6. Workspace Invitations Table
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------
-- 7. Row-Level Security (RLS) Helper Functions
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = target_workspace_id
      AND wm.user_id = target_user_id
      AND wm.status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE;

CREATE OR REPLACE FUNCTION public.get_workspace_role(target_workspace_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
  SELECT wm.role FROM public.workspace_members wm
  WHERE wm.workspace_id = target_workspace_id
    AND wm.user_id = target_user_id
    AND wm.status = 'active';
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE;

CREATE OR REPLACE FUNCTION public.can_manage_workspace(target_workspace_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = target_workspace_id
      AND wm.user_id = target_user_id
      AND wm.status = 'active'
      AND wm.role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE;

-- ------------------------------------------------------------------------
-- 8. Member Edit Security Trigger Function
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_member_update_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.workspaces w WHERE w.id = OLD.workspace_id AND w.owner_id = auth.uid()
  ) OR public.can_manage_workspace(OLD.workspace_id) THEN
    RETURN NEW;
  END IF;

  IF OLD.user_id = auth.uid() THEN
    IF NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Access Denied: You cannot modify your own role or status.';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Access Denied: Insufficient permissions.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_member_update_permissions ON public.workspace_members;
CREATE TRIGGER tr_check_member_update_permissions
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW EXECUTE FUNCTION public.check_member_update_permissions();

-- ------------------------------------------------------------------------
-- 9. Enable Row-Level Security
-- ------------------------------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------
-- 10. Base RLS Policies (Safe drop-recreate)
-- ------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_workspace_members" ON public.profiles;
CREATE POLICY "profiles_select_workspace_members" ON public.profiles
  FOR SELECT USING (
    public.profiles.id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.workspace_members m1
      JOIN public.workspace_members m2 ON m1.workspace_id = m2.workspace_id
      WHERE m1.user_id = auth.uid() AND m2.user_id = public.profiles.id
    )
  );

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "workspaces_member_select" ON public.workspaces;
CREATE POLICY "workspaces_member_select" ON public.workspaces
  FOR SELECT USING (public.is_workspace_member(id));

DROP POLICY IF EXISTS "workspaces_owner_manage" ON public.workspaces;
CREATE POLICY "workspaces_owner_manage" ON public.workspaces
  FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "workspace_members_admin_all" ON public.workspace_members;
CREATE POLICY "workspace_members_admin_all" ON public.workspace_members
  FOR ALL USING (public.can_manage_workspace(workspace_id));

DROP POLICY IF EXISTS "workspace_invitations_member_access" ON public.workspace_invitations;
CREATE POLICY "workspace_invitations_member_access" ON public.workspace_invitations
  FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "workspace_invitations_admin_manage" ON public.workspace_invitations;
CREATE POLICY "workspace_invitations_admin_manage" ON public.workspace_invitations
  FOR ALL USING (public.can_manage_workspace(workspace_id));

DROP POLICY IF EXISTS "user_settings_self_access" ON public.user_settings;
CREATE POLICY "user_settings_self_access" ON public.user_settings
  FOR ALL USING (user_id = auth.uid());

-- ------------------------------------------------------------------------
-- 11. Automatic Profile and Workspace Creation Trigger on Signup
-- ------------------------------------------------------------------------
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
