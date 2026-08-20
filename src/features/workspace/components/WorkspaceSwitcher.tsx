import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { useAuth } from '@/app/providers/AuthProvider'
import {
  ChevronsUpDown,
  Check,
  Plus,
  Building2,
  User as UserIcon,
  ShieldCheck,
  X,
  Loader2,
  Link as LinkIcon,
  ChevronDown
} from 'lucide-react'
import logoImg from '@/logo.png'

interface SwitcherProps {
  variant?: 'sidebar' | 'header'
}

export function WorkspaceSwitcher({ variant = 'sidebar' }: SwitcherProps) {
  const { user } = useAuth()
  const {
    workspaces,
    currentWorkspace,
    userRole,
    switchWorkspace,
    createWorkspace,
    joinWorkspaceByCode,
  } = useWorkspace()

  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [selectedSectorType, setSelectedSectorType] = useState<'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'>('core')
  const [joinCode, setJoinCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  const menuRef = useRef<HTMLDivElement>(null)

  // Track responsive screen size
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w < 640) {
        setScreenSize('mobile')
      } else if (w < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    if (screenSize !== 'desktop' || variant !== 'sidebar') return
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [screenSize, variant])

  const handleSelectWorkspace = async (workspaceId: string) => {
    setIsOpen(false)
    if (workspaceId !== currentWorkspace?.id) {
      await switchWorkspace(workspaceId)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await createWorkspace(newWorkspaceName.trim(), selectedSectorType)
      setNewWorkspaceName('')
      setSelectedSectorType('core')
      setShowCreateModal(false)
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create workspace')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await joinWorkspaceByCode(joinCode.trim())
      setJoinCode('')
      setShowJoinModal(false)
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to join workspace. Check the code and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentWorkspace) return null

  // ─── 1. RENDER DESKTOP SIDEBAR VIEW ───
  if (variant === 'sidebar') {
    return (
      <div className="relative w-full" ref={menuRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-md shrink-0 select-none">
              {currentWorkspace.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {currentWorkspace.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium border shrink-0 ${
                    currentWorkspace.isPersonal
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}
                >
                  {currentWorkspace.isPersonal ? 'Personal' : 'Team'}
                </span>
              </div>
              {userRole && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 select-none">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="capitalize">{userRole}</span>
                </div>
              )}
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Workspaces List */}
            <div className="max-h-60 overflow-y-auto py-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                Workspaces ({workspaces.length})
              </div>
              {workspaces.map((ws) => {
                const isActive = ws.id === currentWorkspace.id
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(ws.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {ws.isPersonal ? (
                        <UserIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      )}
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="p-1 space-y-0.5">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create Workspace</span>
              </button>

              <button
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <LinkIcon className="w-4 h-4 text-emerald-400" />
                <span>Join Workspace</span>
              </button>
            </div>
          </div>
        )}

        {/* Portaled Dialogs */}
        {showCreateModal && createPortal(
          <CreateWorkspaceDialog
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSubmit}
            value={newWorkspaceName}
            onChange={setNewWorkspaceName}
            sectorType={selectedSectorType}
            onChangeSectorType={setSelectedSectorType}
            isSubmitting={isSubmitting}
            errorMsg={errorMsg}
          />,
          document.body
        )}

        {showJoinModal && createPortal(
          <JoinWorkspaceDialog
            isOpen={showJoinModal}
            onClose={() => setShowJoinModal(false)}
            onSubmit={handleJoinSubmit}
            value={joinCode}
            onChange={setJoinCode}
            isSubmitting={isSubmitting}
            errorMsg={errorMsg}
          />,
          document.body
        )}
      </div>
    )
  }

  // ─── 2. RENDER RESPONSIVE MOBILE/TABLET HEADER TRIGGER VIEW ───
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-left hover:opacity-80 active:scale-95 transition-all outline-none cursor-pointer"
      >
        <img
          src={logoImg}
          alt="Day Zero OS"
          className="w-6.5 h-6.5 object-contain rounded-md shrink-0"
        />
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-sm font-semibold tracking-tight text-foreground truncate max-w-[130px]">
            {currentWorkspace.name}
          </span>
          <ChevronDown size={14} className="text-muted-foreground shrink-0" />
        </div>
      </button>

      {/* RENDER TABLET CENTRED OVERLAY MODAL */}
      {isOpen && screenSize === 'tablet' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
          <div className="bg-[#111827] border border-white/[.08] rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Switch Workspace</h3>
            <p className="text-xs text-[#707B95] mb-4">Select a workspace from your active list below.</p>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-3 scrollbar-thin">
              {workspaces.map((ws) => {
                const isActive = ws.id === currentWorkspace.id
                const isOwner = ws.ownerId === user?.id
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(ws.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-900/40 border-white/[.06] text-slate-300 hover:bg-white/[.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {ws.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-semibold block text-white">{ws.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-[#707B95] uppercase font-bold tracking-wider">
                            {ws.isPersonal ? 'Personal' : 'Team'}
                          </span>
                          {isOwner && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 rounded font-bold">
                              Owner
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[.06] bg-white/[.01] px-1">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[.03] border border-white/[.08] text-white text-xs font-semibold hover:bg-white/[.06] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create New</span>
              </button>
              <button
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6C5CFF] hover:bg-[#7E70FF] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <LinkIcon className="w-4 h-4 text-indigo-200" />
                <span>Join Team</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* RENDER MOBILE SLIDE-UP BOTTOM SHEET */}
      {isOpen && screenSize === 'mobile' && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
          <div className="w-full bg-[#111827] border-t border-white/[.08] rounded-t-3xl shadow-2xl relative z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 ease-out" onClick={(e) => e.stopPropagation()}>
            
            {/* Drag Handle */}
            <div className="w-full flex justify-center py-3 shrink-0">
              <div className="w-12 h-1 rounded-full bg-white/[.15]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-white/[.06] shrink-0">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Switch Workspace</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/[.05] text-[#707B95] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Workspaces */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 my-2 scrollbar-thin">
              {workspaces.map((ws) => {
                const isActive = ws.id === currentWorkspace.id
                const isOwner = ws.ownerId === user?.id
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(ws.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-900/40 border-white/[.06] text-slate-300 hover:bg-white/[.04]'
                    }`}
                    style={{ minHeight: '52px' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {ws.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-semibold block text-white">{ws.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-[#707B95] uppercase font-bold tracking-wider">
                            {ws.isPersonal ? 'Personal' : 'Team'}
                          </span>
                          {isOwner && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 rounded font-bold">
                              Owner
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Bottom Sheet Actions */}
            <div className="p-4 bg-slate-950/40 border-t border-white/[.06] grid grid-cols-2 gap-3 shrink-0 pb-8">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[.03] border border-white/[.08] text-white text-xs font-semibold hover:bg-white/[.06] transition-colors cursor-pointer"
                style={{ minHeight: '48px' }}
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6C5CFF] text-white text-xs font-semibold hover:bg-[#7E70FF] transition-colors cursor-pointer"
                style={{ minHeight: '48px' }}
              >
                <LinkIcon className="w-4 h-4 text-indigo-200" />
                <span>Join Workspace</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dialog overlays rendered on top of bottom sheet / modal */}
      {showCreateModal && createPortal(
        <CreateWorkspaceDialog
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
          value={newWorkspaceName}
          onChange={setNewWorkspaceName}
          sectorType={selectedSectorType}
          onChangeSectorType={setSelectedSectorType}
          isSubmitting={isSubmitting}
          errorMsg={errorMsg}
        />,
        document.body
      )}

      {showJoinModal && createPortal(
        <JoinWorkspaceDialog
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSubmit={handleJoinSubmit}
          value={joinCode}
          onChange={setJoinCode}
          isSubmitting={isSubmitting}
          errorMsg={errorMsg}
        />,
        document.body
      )}
    </>
  )
}

// ─── Modal dialogs ───

export function CreateWorkspaceDialog({
  isOpen,
  onClose,
  onSubmit,
  value,
  onChange,
  sectorType,
  onChangeSectorType,
  isSubmitting,
  errorMsg,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  value: string
  onChange: (val: string) => void
  sectorType: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer'
  onChangeSectorType: (val: 'core' | 'engineering' | 'teaching' | 'student' | 'startup' | 'creator' | 'freelancer') => void
  isSubmitting: boolean
  errorMsg: string
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#111827] border border-white/[.08] rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-sm font-bold text-white mb-1">Create Team Workspace</h3>
        <p className="text-xs text-[#707B95] mb-5">
          Workspaces let your team collaborate across projects, assets, notes, and tasks.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">
              Workspace Name
            </label>
            <input
              type="text"
              required
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. Acme Engineering"
              className="w-full px-3.5 py-3 rounded-xl bg-[#0D1427] border border-white/[.08] text-white placeholder-[#707B95] text-xs focus:outline-none focus:border-[#6C5CFF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">
              Workspace Sector Type
            </label>
            <div className="relative">
              <select
                value={sectorType}
                onChange={(e) => onChangeSectorType(e.target.value as any)}
                className="w-full px-3.5 py-3 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-xs focus:outline-none focus:border-[#6C5CFF] transition-colors cursor-pointer appearance-none pr-10"
              >
                <option value="core">Core Digital Workspace</option>
                <option value="engineering">Engineering OS (Projects, Sprints, Bugs)</option>
                <option value="teaching">Teaching OS (Courses, Grades, Attendance)</option>
                <option value="student">Student OS (Subjects, GPA, Study Sessions)</option>
                <option value="startup">Startup OS (Build, Pitch, Run)</option>
                <option value="creator">Creator OS (Publishing, Workflows)</option>
                <option value="freelancer">Freelancer OS (Clients, Tasks)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#707B95]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-[#EF5350] bg-[#EF5350]/10 border border-[#EF5350]/20 p-2.5 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-[#A9B1C7] hover:text-white hover:bg-white/[.06] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C5CFF] hover:bg-[#7E70FF] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function JoinWorkspaceDialog({
  isOpen,
  onClose,
  onSubmit,
  value,
  onChange,
  isSubmitting,
  errorMsg,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  value: string
  onChange: (val: string) => void
  isSubmitting: boolean
  errorMsg: string
}) {
  if (!isOpen) return null

  const rawCode = value.replace(/[-\s]/g, '').toUpperCase()
  const isValid = rawCode.length === 8

  const handleCodeChange = (input: string) => {
    const clean = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)
    onChange(clean)
  }

  const displayValue = rawCode.length > 4
    ? `${rawCode.slice(0, 4)}-${rawCode.slice(4)}`
    : rawCode

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#111827] border border-white/[.08] rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-sm font-bold text-white mb-1">Join Workspace</h3>
        <p className="text-xs text-[#707B95] mb-5">
          Enter the 8-character team join code shared by your team owner.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">
              Workspace Code
            </label>
            <input
              type="text"
              required
              maxLength={9}
              value={displayValue}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="AB12-CD34"
              className="w-full px-4 py-3 rounded-xl bg-[#0D1427] border border-white/[.08] text-white placeholder-[#707B95] text-sm focus:outline-none focus:border-[#6C5CFF] tracking-[0.25em] text-center uppercase font-mono font-bold transition-colors"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <p className="text-[11px] text-[#707B95] mt-1.5 text-center">
              {rawCode.length}/8 characters {isValid && <span className="text-[#16C784]">✓ Ready</span>}
            </p>
          </div>

          {errorMsg && (
            <div className="text-xs text-[#EF5350] bg-[#EF5350]/10 border border-[#EF5350]/20 p-2.5 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-[#A9B1C7] hover:text-white hover:bg-white/[.06] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C5CFF] hover:bg-[#7E70FF] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
