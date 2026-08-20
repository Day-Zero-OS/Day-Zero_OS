import { getStoredData, saveStoredData, generateMockJoinCode } from '@/lib/supabase/mockClient'
import type { WorkspaceRepository, UserProfile } from './workspace.repository'
import type { Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceRole } from './workspace.service'

export class MockWorkspaceRepository implements WorkspaceRepository {
  async getWorkspace(id: string): Promise<Workspace | null> {
    const db = getStoredData()
    const workspaces = db['workspaces'] || []
    const ws = workspaces.find((w: any) => w.id === id)
    if (!ws || ws.deleted_at) return null

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

  async listUserWorkspaces(userId: string): Promise<Workspace[]> {
    const db = getStoredData()
    const members = db['workspace_members'] || []
    const workspaces = db['workspaces'] || []

    const userMembers = members.filter((m: any) => m.user_id === userId && m.status === 'active')
    const list: Workspace[] = []

    for (const m of userMembers) {
      const ws = workspaces.find((w: any) => w.id === m.workspace_id)
      if (ws && !ws.deleted_at) {
        list.push({
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
        })
      }
    }
    return list
  }

  async getRawWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const db = getStoredData()
    const members = db['workspace_members'] || []
    const profiles = db['profiles'] || []

    const wsMembers = members.filter((m: any) => m.workspace_id === workspaceId && m.status !== 'removed')

    return wsMembers.map((item: any) => {
      const prof = profiles.find((p: any) => p.id === item.user_id)
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
    const db = getStoredData()
    const invitations = db['workspace_invitations'] || []
    const wsInvs = invitations.filter((i: any) => i.workspace_id === workspaceId && i.status === 'pending')

    return wsInvs.map((item: any) => ({
      id: item.id,
      workspaceId: item.workspace_id,
      email: item.email,
      role: item.role as WorkspaceRole,
      invitedBy: item.invited_by,
      status: item.status as any,
      expiresAt: item.expires_at,
      createdAt: item.created_at || new Date().toISOString(),
    }))
  }

  async insertWorkspaceMember(member: {
    workspaceId: string
    userId: string
    role: WorkspaceRole
    status: 'pending' | 'active' | 'suspended' | 'removed'
  }): Promise<void> {
    const db = getStoredData()
    const members = db['workspace_members'] || []
    members.push({
      id: `wm-${crypto.randomUUID()}`,
      workspace_id: member.workspaceId,
      user_id: member.userId,
      role: member.role,
      status: member.status,
      joined_at: new Date().toISOString(),
    })
    db['workspace_members'] = members
    saveStoredData(db)
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
    const db = getStoredData()
    const members = db['workspace_members'] || []
    const idx = members.findIndex((m: any) => m.workspace_id === workspaceId && m.user_id === userId)
    if (idx !== -1) {
      const existing = members[idx]
      members[idx] = {
        ...existing,
        role: updates.role !== undefined ? updates.role : existing.role,
        status: updates.status !== undefined ? updates.status : existing.status,
        team_title: updates.teamTitle !== undefined ? updates.teamTitle : existing.team_title,
        department: updates.department !== undefined ? updates.department : existing.department,
        team_bio: updates.teamBio !== undefined ? updates.teamBio : existing.team_bio,
        availability: updates.availability !== undefined ? updates.availability : existing.availability,
      }
      db['workspace_members'] = members
      saveStoredData(db)
    }
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
    const db = getStoredData()
    const invitations = db['workspace_invitations'] || []
    invitations.push({
      id: `inv-${crypto.randomUUID()}`,
      workspace_id: invitation.workspaceId,
      email: invitation.email,
      role: invitation.role,
      invited_by: invitation.invitedBy,
      token_hash: invitation.tokenHash,
      secret_hash: invitation.secretHash,
      status: invitation.status,
      expires_at: invitation.expiresAt,
      created_at: new Date().toISOString(),
    })
    db['workspace_invitations'] = invitations
    saveStoredData(db)
  }

  async updateWorkspaceInvitationStatus(invitationId: string, status: string): Promise<void> {
    const db = getStoredData()
    const invitations = db['workspace_invitations'] || []
    const inv = invitations.find((i: any) => i.id === invitationId)
    if (inv) {
      inv.status = status
      saveStoredData(db)
    }
  }

  async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<void> {
    const db = getStoredData()
    const workspaces = db['workspaces'] || []
    const ws = workspaces.find((w: any) => w.id === workspaceId)
    if (ws) {
      if (updates.name !== undefined) ws.name = updates.name
      if (updates.logoUrl !== undefined) ws.logo_url = updates.logoUrl
      if (updates.defaultJoinRole !== undefined) ws.default_join_role = updates.defaultJoinRole
      if (updates.joinCode !== undefined) ws.join_code = updates.joinCode
      if (updates.metadata !== undefined) ws.metadata = updates.metadata
      saveStoredData(db)
    }
  }

  async createWorkspace(ownerId: string, name: string, slug: string, sectorType?: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'): Promise<Workspace> {
    const db = getStoredData()
    const wsId = crypto.randomUUID()
    const joinCode = generateMockJoinCode()

    const newWs = {
      id: wsId,
      owner_id: ownerId,
      name,
      slug,
      is_personal: false,
      join_code: joinCode,
      default_join_role: 'editor',
      metadata: {},
      sector_type: sectorType ?? 'core',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    db['workspaces'] = db['workspaces'] || []
    db['workspaces'].push(newWs)
    saveStoredData(db)

    return {
      id: newWs.id,
      ownerId: newWs.owner_id,
      name: newWs.name,
      slug: newWs.slug,
      isPersonal: false,
      logoUrl: null,
      storagePath: null,
      joinCode,
      defaultJoinRole: 'editor',
      metadata: {},
      sectorType: newWs.sector_type ?? 'core',
      createdAt: newWs.created_at,
      updatedAt: newWs.updated_at,
    }
  }

  async joinWorkspaceByCode(code: string, userId: string): Promise<string> {
    const db = getStoredData()
    const workspaces = db['workspaces'] || []
    const targetWs = workspaces.find((w: any) => w.join_code?.toUpperCase() === code)
    if (!targetWs) {
      throw new Error('Invalid join code or workspace has been deleted.')
    }

    const members = db['workspace_members'] || []
    const existing = members.find((m: any) => m.workspace_id === targetWs.id && m.user_id === userId)
    if (existing) {
      if (existing.status === 'active') {
        throw new Error('You are already an active member of this workspace.')
      } else if (existing.status === 'suspended') {
        throw new Error('Your access to this workspace is suspended.')
      } else {
        existing.status = 'active'
        existing.role = targetWs.default_join_role || 'editor'
        saveStoredData(db)
        return targetWs.id
      }
    }

    const defaultRole = targetWs.default_join_role || 'editor'
    members.push({
      id: `wm-${crypto.randomUUID()}`,
      workspace_id: targetWs.id,
      user_id: userId,
      role: defaultRole,
      status: 'active',
      joined_at: new Date().toISOString(),
    })
    saveStoredData(db)
    return targetWs.id
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const db = getStoredData()
    const profiles = db['profiles'] || []
    const prof = profiles.find((p: any) => p.id === userId)
    if (!prof) return null

    return {
      id: prof.id,
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
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const db = getStoredData()
    const profiles = db['profiles'] || []
    const idx = profiles.findIndex((p: any) => p.id === userId)
    if (idx !== -1) {
      const existing = profiles[idx]
      profiles[idx] = {
        ...existing,
        full_name: updates.fullName !== undefined ? updates.fullName : existing.full_name,
        avatar_url: updates.avatarUrl !== undefined ? updates.avatarUrl : existing.avatar_url,
        display_name: updates.displayName !== undefined ? updates.displayName : existing.display_name,
        github: updates.github !== undefined ? updates.github : existing.github,
        linkedin: updates.linkedin !== undefined ? updates.linkedin : existing.linkedin,
        website: updates.website !== undefined ? updates.website : existing.website,
        location: updates.location !== undefined ? updates.location : existing.location,
      }
      db['profiles'] = profiles
      saveStoredData(db)
    }
  }
}
