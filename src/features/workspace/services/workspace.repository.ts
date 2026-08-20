import type { Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceRole } from './workspace.service'

export interface UserProfile {
  id: string
  fullName: string | null
  username: string | null
  avatarUrl: string | null
  email: string | null
  displayName: string | null
  github: string | null
  linkedin: string | null
  website: string | null
  location: string | null
}

export interface WorkspaceRepository {
  getWorkspace(id: string): Promise<Workspace | null>
  listUserWorkspaces(userId: string): Promise<Workspace[]>
  getRawWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]>
  getRawWorkspaceInvitations(workspaceId: string): Promise<WorkspaceInvitation[]>
  insertWorkspaceMember(member: {
    workspaceId: string
    userId: string
    role: WorkspaceRole
    status: 'pending' | 'active' | 'suspended' | 'removed'
  }): Promise<void>
  updateWorkspaceMember(
    workspaceId: string,
    userId: string,
    updates: {
      role?: WorkspaceRole
      status?: 'pending' | 'active' | 'suspended' | 'removed'
      teamTitle?: string | null
      department?: string | null
      teamBio?: string | null
      availability?: 'available' | 'busy' | 'offline'
    }
  ): Promise<void>
  insertWorkspaceInvitation(invitation: {
    workspaceId: string
    email: string
    role: WorkspaceRole
    invitedBy: string
    tokenHash: string
    secretHash: string
    status: string
    expiresAt: string
  }): Promise<void>
  updateWorkspaceInvitationStatus(invitationId: string, status: string): Promise<void>
  updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<void>
  createWorkspace(ownerId: string, name: string, slug: string, sectorType?: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'): Promise<Workspace>
  joinWorkspaceByCode(code: string, userId: string): Promise<string>
  getUserProfile(userId: string): Promise<UserProfile | null>
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void>
}
