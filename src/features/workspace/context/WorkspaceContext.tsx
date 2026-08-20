import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase/client'
import { isDemoModeEnabled } from '@/lib/supabase/mockClient'
import {
  listUserWorkspaces,
  resolveCurrentWorkspaceId,
  setCurrentWorkspace,
  createWorkspace as createWorkspaceService,
  inviteWorkspaceMember,
  revokeWorkspaceInvitation,
  transferWorkspaceOwnership,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
  setCachedActiveWorkspaceId,
  deleteWorkspace as deleteWorkspaceService,
  leaveWorkspace as leaveWorkspaceService,
  updateWorkspaceDetails as updateWorkspaceDetailsService,
  joinWorkspaceByCode as joinWorkspaceByCodeService,
  regenerateJoinCode as regenerateJoinCodeService,
  updateDefaultJoinRole as updateDefaultJoinRoleService,
  getWorkspaceTeamData,
  updateWorkspaceMemberProfileFields,
  updateGlobalUserProfile,
  type Workspace,
  type WorkspaceMember,
  type WorkspaceInvitation,
  type WorkspaceRole,
  type WorkspaceStats,
  type WorkspaceCapabilities,
} from '../services/workspace.service'

type WorkspaceCacheItem = {
  members: WorkspaceMember[]
  invitations: WorkspaceInvitation[]
  stats: WorkspaceStats
  capabilities: WorkspaceCapabilities
  lastUpdated: number
}

type WorkspaceContextValue = {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  workspaceId: string | null
  userRole: WorkspaceRole | null
  members: WorkspaceMember[]
  invitations: WorkspaceInvitation[]
  stats: WorkspaceStats | null
  capabilities: WorkspaceCapabilities | null
  isLoading: boolean
  error: Error | null
  switchWorkspace: (workspaceId: string) => Promise<void>
  createWorkspace: (name: string, sectorType?: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer') => Promise<Workspace>
  inviteMember: (email: string, role?: 'admin' | 'editor' | 'viewer') => Promise<void>
  revokeInvitation: (invitationId: string) => Promise<void>
  transferOwnership: (newOwnerId: string) => Promise<void>
  removeMember: (memberUserId: string) => Promise<void>
  updateMemberRole: (memberUserId: string, newRole: 'admin' | 'editor' | 'viewer') => Promise<void>
  deleteWorkspace: (workspaceId: string) => Promise<void>
  leaveWorkspace: (workspaceId: string) => Promise<void>
  updateWorkspaceDetails: (updates: { name?: string; logoUrl?: string | null; description?: string }) => Promise<void>
  joinWorkspaceByCode: (code: string) => Promise<void>
  regenerateJoinCode: () => Promise<string>
  updateDefaultJoinRole: (role: 'editor' | 'viewer') => Promise<void>
  refreshWorkspaces: () => Promise<void>
  updateWorkspaceProfile: (updates: { teamTitle?: string | null; department?: string | null; teamBio?: string | null; availability?: 'available' | 'busy' | 'offline' }) => Promise<void>
  updateGlobalProfile: (updates: { displayName?: string | null; avatarUrl?: string | null; fullName?: string | null; github?: string | null; linkedin?: string | null; website?: string | null; location?: string | null }) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([])
  const [stats, setStats] = useState<WorkspaceStats | null>(null)
  const [capabilities, setCapabilities] = useState<WorkspaceCapabilities | null>(null)
  const workspaceCacheRef = useRef<Record<string, WorkspaceCacheItem>>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshWorkspaceDataRef = useRef<any>(null)

  // Centralized Refresh Function
  const refreshWorkspaceData = useCallback(
    async (targetWsId?: string, forceFetch?: boolean) => {
      if (!isAuthenticated || !user) {
        setWorkspaces([])
        setCurrentWorkspaceState(null)
        setMembers([])
        setInvitations([])
        setStats(null)
        setCapabilities(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        let list = await listUserWorkspaces(user.id)

        // Fallback: Auto-create personal workspace if none exist
        if (list.length === 0) {
          const personalWs = await createWorkspaceService(user.id, 'Personal Workspace')
          list = [personalWs]
        }

        setWorkspaces(list)

        const activeWsId = targetWsId || (await resolveCurrentWorkspaceId(user.id))
        const activeWs = list.find((w) => w.id === activeWsId) ?? list[0]

        setCurrentWorkspaceState(activeWs)
        setCachedActiveWorkspaceId(activeWs.id)

        // Cache lookup per workspace ID
        const cached = workspaceCacheRef.current[activeWs.id]
        const cacheValid = cached && Date.now() - cached.lastUpdated < 10000 // 10s TTL

        if (cacheValid && !forceFetch) {
          setMembers(cached.members)
          setInvitations(cached.invitations)
          setStats(cached.stats)
          setCapabilities(cached.capabilities)
        } else {
          try {
            const teamData = await getWorkspaceTeamData(activeWs.id, user.id)
            setMembers(teamData.members)
            setInvitations(teamData.invitations)
            setStats(teamData.stats)
            setCapabilities(teamData.capabilities)

            workspaceCacheRef.current[activeWs.id] = {
              ...teamData,
              lastUpdated: Date.now(),
            }
          } catch (err) {
            console.error('Failed to load workspace team details:', err)
            // Kicked User Fallback: Switch them to their personal workspace
            const personalWs = list.find((w) => w.isPersonal) ?? list[0]
            if (personalWs && personalWs.id !== activeWs.id) {
              console.warn(`User kicked from workspace ${activeWs.id}. Redirecting to ${personalWs.id}.`)
              await setCurrentWorkspace(user.id, personalWs.id)
              setCachedActiveWorkspaceId(personalWs.id)
              setTimeout(() => {
                refreshWorkspaceDataRef.current?.(personalWs.id, true)
              }, 50)
            }
          }
        }
      } catch (err: any) {
        let formattedMessage = '';
        if (err && typeof err === 'object') {
          formattedMessage = [
            err.message,
            err.details,
            err.hint,
            err.code ? `Code: ${err.code}` : undefined
          ].filter(Boolean).join(' — ');
        } else {
          formattedMessage = String(err);
        }
        console.error('[WORKSPACE ERROR DETAILED]:', formattedMessage);
        setError(new Error(formattedMessage));
      } finally {
        setIsLoading(false);
      }
    },
    [user, isAuthenticated],
  )

  // Keep ref up to date
  useEffect(() => {
    refreshWorkspaceDataRef.current = refreshWorkspaceData
  }, [refreshWorkspaceData])

  // Load initially
  useEffect(() => {
    refreshWorkspaceData()
  }, [isAuthenticated, user, refreshWorkspaceData]) // Run only on auth change to prevent loop

  // Supabase Realtime Synchronization
  useEffect(() => {
    if (isDemoModeEnabled() || !user || !isAuthenticated) return

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('workspace_realtime_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspaces' }, () => {
        refreshWorkspaceData(undefined, true)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspace_members' }, () => {
        refreshWorkspaceData(undefined, true)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspace_invitations' }, () => {
        refreshWorkspaceData(undefined, true)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        refreshWorkspaceData(undefined, true)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, isAuthenticated, refreshWorkspaceData])

  const switchWorkspaceHandler = useCallback(
    async (targetWorkspaceId: string) => {
      if (!user) return
      setIsLoading(true)
      try {
        await setCurrentWorkspace(user.id, targetWorkspaceId)
        await refreshWorkspaceData(targetWorkspaceId, true)
      } catch (err: any) {
        console.error('Error switching workspace:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    },
    [user, refreshWorkspaceData],
  )

  const createWorkspaceHandler = useCallback(
    async (name: string, sectorType?: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'): Promise<Workspace> => {
      if (!user) throw new Error('User must be logged in to create a workspace.')
      setIsLoading(true)
      try {
        const newWs = await createWorkspaceService(user.id, name, sectorType)
        await refreshWorkspaceData(newWs.id, true)
        return newWs
      } finally {
        setIsLoading(false)
      }
    },
    [user, refreshWorkspaceData],
  )

  const inviteMemberHandler = useCallback(
    async (email: string, role: 'admin' | 'editor' | 'viewer' = 'editor') => {
      if (!user || !currentWorkspace) return
      await inviteWorkspaceMember(currentWorkspace.id, user.id, email, role)
      await refreshWorkspaceData(currentWorkspace.id, true)
    },
    [user, currentWorkspace, refreshWorkspaceData],
  )

  const revokeInvitationHandler = useCallback(
    async (invitationId: string) => {
      if (!currentWorkspace) return
      await revokeWorkspaceInvitation(currentWorkspace.id, invitationId)
      await refreshWorkspaceData(currentWorkspace.id, true)
    },
    [currentWorkspace, refreshWorkspaceData],
  )

  const transferOwnershipHandler = useCallback(
    async (newOwnerId: string) => {
      if (!user || !currentWorkspace) return
      await transferWorkspaceOwnership(currentWorkspace.id, user.id, newOwnerId)
      await refreshWorkspaceData(currentWorkspace.id, true)
    },
    [user, currentWorkspace, refreshWorkspaceData],
  )

  const removeMemberHandler = useCallback(
    async (memberUserId: string) => {
      if (!currentWorkspace || !user) return
      await removeWorkspaceMember(currentWorkspace.id, memberUserId, user.id)
      await refreshWorkspaceData(currentWorkspace.id, true)
    },
    [currentWorkspace, user, refreshWorkspaceData],
  )

  const updateMemberRoleHandler = useCallback(
    async (memberUserId: string, newRole: 'admin' | 'editor' | 'viewer') => {
      if (!currentWorkspace || !user) return
      await updateWorkspaceMemberRole(currentWorkspace.id, memberUserId, newRole, user.id)
      await refreshWorkspaceData(currentWorkspace.id, true)
    },
    [currentWorkspace, user, refreshWorkspaceData],
  )

  const deleteWorkspaceHandler = useCallback(
    async (workspaceId: string) => {
      if (!user) return
      await deleteWorkspaceService(workspaceId, user.id)
      await refreshWorkspaceData(undefined, true)
    },
    [user, refreshWorkspaceData],
  )

  const leaveWorkspaceHandler = useCallback(
    async (workspaceId: string) => {
      if (!user) return
      await leaveWorkspaceService(workspaceId, user.id)
      await refreshWorkspaceData(undefined, true)
    },
    [user, refreshWorkspaceData],
  )

  const updateWorkspaceDetailsHandler = useCallback(
    async (updates: { name?: string; logoUrl?: string | null; description?: string }) => {
      if (!currentWorkspace) return
      await updateWorkspaceDetailsService(currentWorkspace.id, updates)
      await refreshWorkspaceData(currentWorkspace.id, true)
    },
    [currentWorkspace, refreshWorkspaceData],
  )

  const joinWorkspaceByCodeHandler = useCallback(
    async (code: string) => {
      if (!user) throw new Error('User not authenticated')
      const targetWsId = await joinWorkspaceByCodeService(code, user.id)
      await switchWorkspaceHandler(targetWsId)
    },
    [user, switchWorkspaceHandler],
  )

  const regenerateJoinCodeHandler = useCallback(async () => {
    if (!currentWorkspace) throw new Error('No active workspace selected')
    const newCode = await regenerateJoinCodeService(currentWorkspace.id)
    await refreshWorkspaceData(currentWorkspace.id, true)
    return newCode
  }, [currentWorkspace, refreshWorkspaceData])

  const updateDefaultJoinRoleHandler = useCallback(
    async (role: 'editor' | 'viewer') => {
      if (!currentWorkspace) throw new Error('No active workspace selected')
      await updateDefaultJoinRoleService(currentWorkspace.id, role)
      await refreshWorkspaceData(currentWorkspace.id, true)
    },
    [currentWorkspace, refreshWorkspaceData],
  )

  const updateWorkspaceProfileHandler = useCallback(
    async (updates: { teamTitle?: string | null; department?: string | null; teamBio?: string | null; availability?: 'available' | 'busy' | 'offline' }) => {
      if (!currentWorkspace || !user) return
      await updateWorkspaceMemberProfileFields(currentWorkspace.id, user.id, user.id, updates)
      await refreshWorkspaceData(currentWorkspace.id, true)
    },
    [currentWorkspace, user, refreshWorkspaceData],
  )

  const updateGlobalProfileHandler = useCallback(
    async (updates: { displayName?: string | null; avatarUrl?: string | null; fullName?: string | null; github?: string | null; linkedin?: string | null; website?: string | null; location?: string | null }) => {
      if (!user || !currentWorkspace) return
      await updateGlobalUserProfile(user.id, user.id, updates)
      await refreshWorkspaceData(currentWorkspace.id, true)
    },
    [user, currentWorkspace, refreshWorkspaceData],
  )

  const userRole: WorkspaceRole | null =
    currentWorkspace?.ownerId === user?.id
      ? 'owner'
      : (members.find((m) => m.userId === user?.id)?.role ?? null)

  const value: WorkspaceContextValue = {
    workspaces,
    currentWorkspace,
    workspaceId: currentWorkspace?.id ?? null,
    userRole,
    members,
    invitations,
    stats,
    capabilities,
    isLoading,
    error,
    switchWorkspace: switchWorkspaceHandler,
    createWorkspace: createWorkspaceHandler,
    inviteMember: inviteMemberHandler,
    revokeInvitation: revokeInvitationHandler,
    transferOwnership: transferOwnershipHandler,
    removeMember: removeMemberHandler,
    updateMemberRole: updateMemberRoleHandler,
    deleteWorkspace: deleteWorkspaceHandler,
    leaveWorkspace: leaveWorkspaceHandler,
    updateWorkspaceDetails: updateWorkspaceDetailsHandler,
    joinWorkspaceByCode: joinWorkspaceByCodeHandler,
    regenerateJoinCode: regenerateJoinCodeHandler,
    updateDefaultJoinRole: updateDefaultJoinRoleHandler,
    refreshWorkspaces: async () => {
      await refreshWorkspaceData(undefined, true)
    },
    updateWorkspaceProfile: updateWorkspaceProfileHandler,
    updateGlobalProfile: updateGlobalProfileHandler,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
