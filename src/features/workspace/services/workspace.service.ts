import { isDemoModeEnabled } from '@/lib/supabase/mockClient'
import { getUrlParam } from '@/lib/platform/url'
import { SupabaseWorkspaceRepository } from './supabase-workspace.repository'
import { MockWorkspaceRepository } from './mock-workspace.repository'
import type { WorkspaceRepository } from './workspace.repository'
import { renderInvitationEmail } from '@/lib/email/templates/invitation-template'
import { emailQueueService } from '@/lib/email/email-queue.service'

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'
export type WorkspaceMemberStatus = 'pending' | 'active' | 'suspended' | 'removed'
export type WorkspaceInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked'

export type Workspace = {
  id: string
  ownerId: string
  name: string
  slug: string
  isPersonal: boolean
  logoUrl: string | null
  storagePath: string | null
  joinCode: string
  defaultJoinRole: 'editor' | 'viewer'
  metadata: Record<string, unknown>
  sectorType: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'
  createdAt: string
  updatedAt: string
}


export type WorkspaceMember = {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceRole
  status: WorkspaceMemberStatus
  joinedAt: string
  teamTitle?: string | null
  department?: string | null
  teamBio?: string | null
  availability?: 'available' | 'busy' | 'offline'
  profile?: {
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
}

export type WorkspaceInvitation = {
  id: string
  workspaceId: string
  email: string
  role: WorkspaceRole
  invitedBy: string
  status: WorkspaceInvitationStatus
  expiresAt: string
  createdAt: string
}

export type WorkspaceStats = {
  total: number
  owners: number
  admins: number
  editors: number
  viewers: number
  pending: number
}

export type WorkspaceCapabilities = {
  canInvite: boolean
  canManageMembers: boolean
  canTransferOwnership: boolean
  canManageRoles: boolean
  canDeleteWorkspace: boolean
  canRegenerateJoinCode: boolean
  canEditWorkspace: boolean
  canViewInvitations: boolean
}

export type WorkspaceTeamData = {
  members: WorkspaceMember[]
  invitations: WorkspaceInvitation[]
  stats: WorkspaceStats
  capabilities: WorkspaceCapabilities
}

const LOCAL_STORAGE_ACTIVE_WS_KEY = 'day_zero_os_active_workspace_id'

export function getCachedActiveWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LOCAL_STORAGE_ACTIVE_WS_KEY)
}

export function setCachedActiveWorkspaceId(workspaceId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_STORAGE_ACTIVE_WS_KEY, workspaceId)
}

function getRepository(): WorkspaceRepository {
  return isDemoModeEnabled() ? new MockWorkspaceRepository() : new SupabaseWorkspaceRepository()
}

export function computeCapabilities(role: WorkspaceRole | null, isPersonal: boolean): WorkspaceCapabilities {
  const isOwner = role === 'owner'
  const isAdmin = role === 'admin'
  const isOwnerOrAdmin = isOwner || isAdmin

  return {
    canInvite: isOwnerOrAdmin && !isPersonal,
    canManageMembers: isOwnerOrAdmin,
    canTransferOwnership: isOwner,
    canManageRoles: isOwnerOrAdmin,
    canDeleteWorkspace: isOwner && !isPersonal,
    canRegenerateJoinCode: isOwnerOrAdmin && !isPersonal,
    canEditWorkspace: isOwnerOrAdmin,
    canViewInvitations: isOwnerOrAdmin,
  }
}

// Unified Service Layer Methods
export async function getWorkspaceTeamData(workspaceId: string, currentUserId: string): Promise<WorkspaceTeamData> {
  const repository = getRepository()

  // 1. Fetch workspace and raw records
  const ws = await repository.getWorkspace(workspaceId)
  if (!ws) throw new Error('Workspace not found.')

  let rawMembers = await repository.getRawWorkspaceMembers(workspaceId)
  const invitations = await repository.getRawWorkspaceInvitations(workspaceId)

  // 2. Self-Healing Owner Repair Mechanism
  const ownerId = ws.ownerId
  const ownerMember = rawMembers.find((m) => m.userId === ownerId && m.status === 'active')

  if (!ownerMember) {
    console.warn(`Self-Healing: Owner ${ownerId} is missing in workspace_members for workspace ${workspaceId}. Attempting repair.`)
    try {
      // Force insert active owner membership
      await repository.insertWorkspaceMember({
        workspaceId,
        userId: ownerId,
        role: 'owner',
        status: 'active',
      })
      // Reload raw members
      rawMembers = await repository.getRawWorkspaceMembers(workspaceId)
    } catch (err) {
      console.error('Self-Healing Repair: Failed to write owner member record. Synthesizing record to prevent layouts crash.', err)
      const ownerProfile = await repository.getUserProfile(ownerId)
      const synthesizedOwner: WorkspaceMember = {
        id: `synth-${ownerId}`,
        workspaceId,
        userId: ownerId,
        role: 'owner',
        status: 'active',
        joinedAt: ws.createdAt,
        teamTitle: 'Founder',
        department: 'Leadership',
        teamBio: 'Creator and Owner of the Workspace',
        availability: 'available',
        profile: ownerProfile
          ? {
              fullName: ownerProfile.fullName,
              username: ownerProfile.username,
              avatarUrl: ownerProfile.avatarUrl,
              email: ownerProfile.email,
              displayName: ownerProfile.displayName,
              github: ownerProfile.github,
              linkedin: ownerProfile.linkedin,
              website: ownerProfile.website,
              location: ownerProfile.location,
            }
          : {
              fullName: 'Workspace Owner',
              username: 'owner',
              avatarUrl: null,
              email: null,
              displayName: 'Workspace Owner',
              github: null,
              linkedin: null,
              website: null,
              location: null,
            },
      }
      rawMembers.unshift(synthesizedOwner)
    }
  } else if (ownerMember.role !== 'owner') {
    console.warn(`Self-Healing: Owner ${ownerId} is present but has incorrect role ${ownerMember.role}. Repairing to 'owner'.`)
    try {
      await repository.updateWorkspaceMember(workspaceId, ownerId, { role: 'owner' })
      rawMembers = await repository.getRawWorkspaceMembers(workspaceId)
    } catch (err) {
      console.error('Self-Healing Repair: Failed to correct owner role.', err)
      // Force change in memory
      ownerMember.role = 'owner'
    }
  }

  // 3. Compute dynamic statistics
  const activeMembers = rawMembers.filter((m) => m.status === 'active')
  const stats: WorkspaceStats = {
    total: activeMembers.length,
    owners: activeMembers.filter((m) => m.role === 'owner').length,
    admins: activeMembers.filter((m) => m.role === 'admin').length,
    editors: activeMembers.filter((m) => m.role === 'editor').length,
    viewers: activeMembers.filter((m) => m.role === 'viewer').length,
    pending: rawMembers.filter((m) => m.status === 'pending').length + invitations.length,
  }

  // 4. Compute capabilities
  const currentUserMember = rawMembers.find((m) => m.userId === currentUserId)
  const userRole = ws.ownerId === currentUserId ? 'owner' : (currentUserMember ? currentUserMember.role : null)
  const capabilities = computeCapabilities(userRole, ws.isPersonal)

  return {
    members: rawMembers,
    invitations,
    stats,
    capabilities,
  }
}

export async function listUserWorkspaces(userId: string): Promise<Workspace[]> {
  const repository = getRepository()
  return repository.listUserWorkspaces(userId)
}

export async function resolveCurrentWorkspaceId(userId: string): Promise<string> {
  const userWorkspaces = await listUserWorkspaces(userId)
  if (userWorkspaces.length === 0) {
    throw new Error('No active workspace found for user.')
  }

  // 1. Priority: URL parameter
  if (typeof window !== 'undefined') {
    const urlWsId = getUrlParam('ws')
    if (urlWsId && userWorkspaces.some((w) => w.id === urlWsId)) {
      setCachedActiveWorkspaceId(urlWsId)
      return urlWsId
    }
  }

  // 2. Priority: localStorage cache
  const cachedId = getCachedActiveWorkspaceId()
  if (cachedId && userWorkspaces.some((w) => w.id === cachedId)) {
    return cachedId
  }

  // 3. Priority: Fallback to Personal Workspace or first workspace
  const personalWs = userWorkspaces.find((w) => w.isPersonal) ?? userWorkspaces[0]
  setCachedActiveWorkspaceId(personalWs.id)
  return personalWs.id
}

export async function setCurrentWorkspace(userId: string, workspaceId: string): Promise<void> {
  setCachedActiveWorkspaceId(workspaceId)
  if (isDemoModeEnabled()) return

  const repository = getRepository()
  const userSettings = await repository.getUserProfile(userId)
  if (userSettings) {
    const supabase = (repository as any).getSupabaseClient ? (repository as any).getSupabaseClient() : null
    if (supabase) {
      await supabase
        .from('user_settings')
        .update({ current_workspace_id: workspaceId })
        .eq('user_id', userId)
    }
  }
}

export async function createWorkspace(
  userId: string,
  name: string,
  sectorType?: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'
): Promise<Workspace> {
  const repository = getRepository()
  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace'
  const slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`

  const ws = await repository.createWorkspace(userId, name, slug, sectorType)

  // Explicitly add Owner as active member
  await repository.insertWorkspaceMember({
    workspaceId: ws.id,
    userId,
    role: 'owner',
    status: 'active',
  })

  await setCurrentWorkspace(userId, ws.id)
  return ws
}

export async function inviteWorkspaceMember(
  workspaceId: string,
  invitedByUserId: string,
  email: string,
  role: 'admin' | 'editor' | 'viewer' = 'editor',
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) throw new Error('Email address is required.')

  const repository = getRepository()

  // Verify that target email is not already an active member of this workspace
  const wsMembers = await repository.getRawWorkspaceMembers(workspaceId)
  const isAlreadyMember = wsMembers.some((m) => m.profile?.email?.toLowerCase() === cleanEmail && m.status === 'active')
  if (isAlreadyMember) {
    throw new Error('This user is already an active member of this workspace.')
  }

  // Fetch workspace details
  const ws = await repository.getWorkspace(workspaceId)
  if (!ws) throw new Error('Workspace not found.')

  const inviterProfile = await repository.getUserProfile(invitedByUserId)
  const inviterName = inviterProfile?.displayName || inviterProfile?.fullName || 'A team member'

  // Generate random token hash for DB audit compatibility
  const token = crypto.randomUUID()
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  // Insert audit record in workspace_invitations
  await repository.insertWorkspaceInvitation({
    workspaceId,
    email: cleanEmail,
    role,
    invitedBy: invitedByUserId,
    tokenHash,
    secretHash: tokenHash,
    status: 'pending',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  // Send Invitation Email containing the join code
  const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')
  const emailPayload = renderInvitationEmail({
    workspaceName: ws.name,
    workspaceLogo: ws.logoUrl,
    inviterName,
    role,
    joinCode: ws.joinCode,
    appUrl,
  })

  await emailQueueService.enqueue({
    to: cleanEmail,
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text,
    replyTo: 'dayzeromedia.co@gmail.com',
  })
}

export async function revokeWorkspaceInvitation(_workspaceId: string, invitationId: string): Promise<void> {
  const repository = getRepository()
  await repository.updateWorkspaceInvitationStatus(invitationId, 'revoked')
}

export async function transferWorkspaceOwnership(
  workspaceId: string,
  currentOwnerId: string,
  newOwnerId: string,
): Promise<void> {
  const repository = getRepository()

  // Target owner must be an active member of this workspace
  const members = await repository.getRawWorkspaceMembers(workspaceId)
  const targetMember = members.find((m) => m.userId === newOwnerId && m.status === 'active')
  if (!targetMember) {
    throw new Error('Target owner must be an active member of this workspace.')
  }

  // Update roles
  await repository.updateWorkspaceMember(workspaceId, newOwnerId, { role: 'owner' })
  await repository.updateWorkspaceMember(workspaceId, currentOwnerId, { role: 'admin' })

  // Update workspaces owner id
  await repository.updateWorkspace(workspaceId, { ownerId: newOwnerId })
}

export async function removeWorkspaceMember(workspaceId: string, memberUserId: string, actorUserId: string): Promise<void> {
  const repository = getRepository()

  // Prevent self-removal if actor is owner
  const ws = await repository.getWorkspace(workspaceId)
  if (ws?.ownerId === memberUserId) {
    throw new Error('The workspace owner cannot remove themselves from the workspace.')
  }

  // Enforce capability check (only owner/admin can remove)
  const teamData = await getWorkspaceTeamData(workspaceId, actorUserId)
  if (!teamData.capabilities.canManageMembers) {
    throw new Error('You do not have permission to remove members from this workspace.')
  }

  await repository.updateWorkspaceMember(workspaceId, memberUserId, { status: 'removed' })
}

export async function updateWorkspaceMemberRole(
  workspaceId: string,
  memberUserId: string,
  newRole: 'admin' | 'editor' | 'viewer',
  actorUserId: string,
): Promise<void> {
  const repository = getRepository()

  // Prevent role modification on the owner
  const ws = await repository.getWorkspace(workspaceId)
  if (ws?.ownerId === memberUserId) {
    throw new Error('You cannot change the role of the workspace owner.')
  }

  // Enforce capability check (only owner/admin can edit roles)
  const teamData = await getWorkspaceTeamData(workspaceId, actorUserId)
  if (!teamData.capabilities.canManageRoles) {
    throw new Error('You do not have permission to manage member roles in this workspace.')
  }

  await repository.updateWorkspaceMember(workspaceId, memberUserId, { role: newRole })
}

export async function deleteWorkspace(workspaceId: string, actorUserId: string): Promise<void> {
  const repository = getRepository()
  const ws = await repository.getWorkspace(workspaceId)
  if (!ws) throw new Error('Workspace not found.')

  if (ws.ownerId !== actorUserId) {
    throw new Error('Only the workspace owner can delete the workspace.')
  }

  if (ws.isPersonal) {
    throw new Error('Personal workspaces cannot be deleted.')
  }

  await repository.updateWorkspace(workspaceId, { metadata: { ...ws.metadata, deleted_at: new Date().toISOString() } })
}

export async function leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
  const repository = getRepository()

  // Owner cannot leave their own workspace
  const ws = await repository.getWorkspace(workspaceId)
  if (ws?.ownerId === userId) {
    throw new Error('The workspace owner cannot leave their own workspace. Transfer ownership first.')
  }

  await repository.updateWorkspaceMember(workspaceId, userId, { status: 'removed' })
}

export async function updateWorkspaceDetails(
  workspaceId: string,
  updates: { name?: string; logoUrl?: string | null; description?: string },
): Promise<void> {
  const repository = getRepository()
  const ws = await repository.getWorkspace(workspaceId)
  if (!ws) throw new Error('Workspace not found.')

  const metaDesc = updates.description !== undefined ? updates.description : (ws.metadata.description as string || '')
  await repository.updateWorkspace(workspaceId, {
    name: updates.name,
    logoUrl: updates.logoUrl,
    metadata: { ...ws.metadata, description: metaDesc },
  })
}

export async function joinWorkspaceByCode(code: string, userId: string): Promise<string> {
  const repository = getRepository()
  return repository.joinWorkspaceByCode(code, userId)
}

export async function regenerateJoinCode(workspaceId: string): Promise<string> {
  const repository = getRepository()
  const newCode = Array.from({ length: 8 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36))).join('')
  await repository.updateWorkspace(workspaceId, { joinCode: newCode })
  return newCode
}

export async function updateDefaultJoinRole(workspaceId: string, role: 'editor' | 'viewer'): Promise<void> {
  const repository = getRepository()
  await repository.updateWorkspace(workspaceId, { defaultJoinRole: role })
}

// Profile editing
export async function updateWorkspaceMemberProfileFields(
  workspaceId: string,
  userId: string,
  editorUserId: string,
  updates: {
    teamTitle?: string | null
    department?: string | null
    teamBio?: string | null
    availability?: 'available' | 'busy' | 'offline'
  },
): Promise<void> {
  if (editorUserId !== userId) {
    throw new Error('You can only update your own workspace profile details.')
  }
  const repository = getRepository()
  await repository.updateWorkspaceMember(workspaceId, userId, updates)
}

export async function updateGlobalUserProfile(
  userId: string,
  editorUserId: string,
  updates: {
    displayName?: string | null
    avatarUrl?: string | null
    fullName?: string | null
    github?: string | null
    linkedin?: string | null
    website?: string | null
    location?: string | null
  },
): Promise<void> {
  if (editorUserId !== userId) {
    throw new Error('You can only update your own global profile information.')
  }
  const repository = getRepository()
  await repository.updateUserProfile(userId, updates)
}

// For backwards compatibility:
export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const repository = getRepository()
  return repository.getRawWorkspaceMembers(workspaceId)
}

export async function updateMemberProfile(
  userId: string,
  updates: { teamTitle?: string; aboutBio?: string; fullName?: string; avatarUrl?: string },
): Promise<void> {
  // Map old updateMemberProfile to both global and member fields
  const repository = getRepository()
  if (updates.fullName !== undefined || updates.avatarUrl !== undefined) {
    await repository.updateUserProfile(userId, {
      fullName: updates.fullName,
      displayName: updates.fullName,
      avatarUrl: updates.avatarUrl,
    })
  }

  // Find target workspace (where user has a membership to update workspace bio/title)
  const workspaces = await repository.listUserWorkspaces(userId)
  for (const ws of workspaces) {
    await repository.updateWorkspaceMember(ws.id, userId, {
      teamTitle: updates.teamTitle,
      teamBio: updates.aboutBio,
    })
  }
}
export * from './workspace-invitation.service'
