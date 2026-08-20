import { getSupabaseClient } from '@/lib/supabase/client'
import type { WorkspaceRepository, UserProfile } from './workspace.repository'
import type { Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceRole } from './workspace.service'

export class SupabaseWorkspaceRepository implements WorkspaceRepository {
  async getWorkspace(id: string): Promise<Workspace | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      slug: data.slug,
      isPersonal: Boolean(data.is_personal),
      logoUrl: data.logo_url ?? null,
      storagePath: data.storage_path ?? null,
      joinCode: data.join_code ?? '',
      defaultJoinRole: (data.default_join_role as 'editor' | 'viewer') ?? 'editor',
      metadata: data.metadata ?? {},
      sectorType: data.sector_type ?? 'core',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async listUserWorkspaces(userId: string): Promise<Workspace[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('workspace_members')
      .select('workspace:workspaces(*)')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) throw error

    return (data ?? [])
      .map((item: any) => item.workspace)
      .filter((ws: any) => ws && !ws.deleted_at)
      .map((ws: any) => ({
        id: ws.id,
        ownerId: ws.owner_id,
        name: ws.name,
        slug: ws.slug,
        isPersonal: Boolean(ws.is_personal),
        logoUrl: ws.logo_url ?? null,
        storagePath: ws.storage_path ?? null,
        joinCode: ws.join_code ?? '',
        defaultJoinRole: (ws.default_join_role as 'editor' | 'viewer') ?? 'editor',
        metadata: ws.metadata ?? {},
        sectorType: ws.sector_type ?? 'core',
        createdAt: ws.created_at,
        updatedAt: ws.updated_at,
      }))
  }

  async getRawWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const supabase = getSupabaseClient()
    const { data: membersData, error: membersError } = await supabase
      .from('workspace_members')
      .select('id, workspace_id, user_id, role, status, joined_at, team_title, department, team_bio, availability')
      .eq('workspace_id', workspaceId)
      .neq('status', 'removed')

    if (membersError) throw membersError
    if (!membersData || membersData.length === 0) return []

    const userIds = membersData.map((m: any) => m.user_id)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, email, display_name, github, linkedin, website, location')
      .in('id', userIds)

    if (profilesError) throw profilesError

    const profileMap = new Map<string, any>()
    if (profilesData) {
      for (const p of profilesData) {
        profileMap.set(p.id, p)
      }
    }

    return membersData.map((item: any) => {
      const prof = profileMap.get(item.user_id)
      return {
        id: item.id,
        workspaceId: item.workspace_id,
        userId: item.user_id,
        role: item.role as WorkspaceRole,
        status: item.status as any,
        joinedAt: item.joined_at,
        teamTitle: item.team_title ?? null,
        department: item.department ?? null,
        teamBio: item.team_bio ?? null,
        availability: (item.availability as any) ?? 'available',
        profile: prof
          ? {
              fullName: prof.full_name ?? null,
              username: prof.username ?? null,
              avatarUrl: prof.avatar_url ?? null,
              email: prof.email ?? null,
              displayName: prof.display_name ?? null,
              github: prof.github ?? null,
              linkedin: prof.linkedin ?? null,
              website: prof.website ?? null,
              location: prof.location ?? null,
            }
          : undefined,
      }
    })
  }

  async getRawWorkspaceInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select('id, workspace_id, email, role, invited_by, status, expires_at, created_at')
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')

    if (error) throw error

    return (data ?? []).map((item: any) => ({
      id: item.id,
      workspaceId: item.workspace_id,
      email: item.email,
      role: item.role as WorkspaceRole,
      invitedBy: item.invited_by,
      status: item.status as any,
      expiresAt: item.expires_at,
      createdAt: item.created_at,
    }))
  }

  async insertWorkspaceMember(member: {
    workspaceId: string
    userId: string
    role: WorkspaceRole
    status: 'pending' | 'active' | 'suspended' | 'removed'
  }): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('workspace_members').insert({
      workspace_id: member.workspaceId,
      user_id: member.userId,
      role: member.role,
      status: member.status,
    })
    if (error) throw error
  }

  async updateWorkspaceMember(
    workspaceId: string,
    userId: string,
    updates: {
      role?: WorkspaceRole
      status?: 'pending' | 'active' | 'suspended' | 'removed'
      teamTitle?: string | null
      department?: string | null
      teamBio?: string | null
      availability?: 'available' | 'busy' | 'offline'
    },
  ): Promise<void> {
    const supabase = getSupabaseClient()
    const payload: any = {}
    if (updates.role !== undefined) payload.role = updates.role
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.teamTitle !== undefined) payload.team_title = updates.teamTitle
    if (updates.department !== undefined) payload.department = updates.department
    if (updates.teamBio !== undefined) payload.team_bio = updates.teamBio
    if (updates.availability !== undefined) payload.availability = updates.availability

    const { error } = await supabase
      .from('workspace_members')
      .update(payload)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)

    if (error) throw error
  }

  async insertWorkspaceInvitation(invitation: {
    workspaceId: string
    email: string
    role: WorkspaceRole
    invitedBy: string
    tokenHash: string
    secretHash: string
    status: string
    expiresAt: string
  }): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('workspace_invitations').insert({
      workspace_id: invitation.workspaceId,
      email: invitation.email,
      role: invitation.role,
      invited_by: invitation.invitedBy,
      token_hash: invitation.tokenHash,
      secret_hash: invitation.secretHash,
      status: invitation.status,
      expires_at: invitation.expiresAt,
    })
    if (error) throw error
  }

  async updateWorkspaceInvitationStatus(invitationId: string, status: string): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('workspace_invitations')
      .update({ status })
      .eq('id', invitationId)

    if (error) throw error
  }

  async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<void> {
    const supabase = getSupabaseClient()
    const payload: any = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl
    if (updates.defaultJoinRole !== undefined) payload.default_join_role = updates.defaultJoinRole
    if (updates.joinCode !== undefined) payload.join_code = updates.joinCode
    if (updates.metadata !== undefined) payload.metadata = updates.metadata

    const { error } = await supabase
      .from('workspaces')
      .update(payload)
      .eq('id', workspaceId)

    if (error) throw error
  }

  async createWorkspace(ownerId: string, name: string, slug: string, sectorType?: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'): Promise<Workspace> {
    const supabase = getSupabaseClient()
    const { data: ws, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        owner_id: ownerId,
        name,
        slug,
        is_personal: false,
        sector_type: sectorType ?? 'core',
      })
      .select()
      .single()

    if (wsError) throw wsError

    return {
      id: ws.id,
      ownerId: ws.owner_id,
      name: ws.name,
      slug: ws.slug,
      isPersonal: Boolean(ws.is_personal),
      logoUrl: ws.logo_url ?? null,
      storagePath: ws.storage_path ?? null,
      joinCode: ws.join_code ?? '',
      defaultJoinRole: (ws.default_join_role as 'editor' | 'viewer') ?? 'editor',
      metadata: ws.metadata ?? {},
      sectorType: ws.sector_type ?? 'core',
      createdAt: ws.created_at,
      updatedAt: ws.updated_at,
    }
  }

  async joinWorkspaceByCode(code: string, userId: string): Promise<string> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.rpc('join_workspace_by_code', {
      p_join_code: code,
      p_user_id: userId,
    })

    if (error) throw error
    if (!data || !data.success) {
      throw new Error(data?.error || 'Failed to join workspace.')
    }

    return data.workspace_id
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, email, display_name, github, linkedin, website, location')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return {
      id: data.id,
      fullName: data.full_name,
      username: data.username,
      avatarUrl: data.avatar_url,
      email: data.email,
      displayName: data.display_name,
      github: data.github,
      linkedin: data.linkedin,
      website: data.website,
      location: data.location,
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const supabase = getSupabaseClient()
    const payload: any = {}
    if (updates.fullName !== undefined) payload.full_name = updates.fullName
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl
    if (updates.displayName !== undefined) payload.display_name = updates.displayName
    if (updates.github !== undefined) payload.github = updates.github
    if (updates.linkedin !== undefined) payload.linkedin = updates.linkedin
    if (updates.website !== undefined) payload.website = updates.website
    if (updates.location !== undefined) payload.location = updates.location

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)

    if (error) throw error
  }
}
