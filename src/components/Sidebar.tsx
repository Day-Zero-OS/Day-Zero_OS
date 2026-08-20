import {
  Command,
  FolderOpen,
  Rss,
  BookOpen,
  Archive,
  CalendarCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  Bell,
} from 'lucide-react'
import logoImg from '@/logo.png'
import type { Screen } from '@/types/navigation'
import { useAuth } from '@/app/providers/AuthProvider'

import { WorkspaceSwitcher } from '@/features/workspace/components/WorkspaceSwitcher'

import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'

interface NavItem {
  id: Screen
  label: string
  icon: React.ReactNode
  group?: string
}

interface Props {
  current: Screen
  collapsed: boolean
  onNavigate: (s: Screen) => void
  onSearchOpen?: () => void
  onToggleCollapse: () => void
}

export default function Sidebar({ current, collapsed, onNavigate, onSearchOpen, onToggleCollapse }: Props) {
  const { user, profile, signOut } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const w = collapsed ? 56 : 220

  const dynamicNavItems: NavItem[] = [
    { id: 'mission-control' as Screen, label: 'Mission Control', icon: <Command size={15} /> },
    { id: 'projects' as Screen, label: currentWorkspace?.sectorType === 'teaching' ? 'Courses' : currentWorkspace?.sectorType === 'student' ? 'Subjects' : 'Projects', icon: <FolderOpen size={15} /> },
    ...(currentWorkspace?.sectorType === 'creator' || currentWorkspace?.sectorType === 'startup' || currentWorkspace?.sectorType === 'core'
      ? [{ id: 'content-engine' as Screen, label: 'Content Engine', icon: <Rss size={15} /> }]
      : []),
    { id: 'knowledge-base' as Screen, label: 'Knowledge Base', icon: <BookOpen size={15} /> },
    { id: 'asset-vault' as Screen, label: 'Asset Vault', icon: <Archive size={15} /> },
    { id: 'weekly-debrief' as Screen, label: 'Weekly Debrief', icon: <CalendarCheck size={15} /> },
    { id: 'notifications' as Screen, label: 'Notifications', icon: <Bell size={15} /> },
  ]


  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'BU'

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Builder'

  return (
    <aside
      style={{
        width: `${w}px`,
        minWidth: `${w}px`,
        height: '100vh',
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '18px 0' : '18px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <img
          src={logoImg}
          alt="Day Zero OS"
          style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            flexShrink: 0,
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />
        {!collapsed && (
          <div>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>Day Zero OS</span>
              <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-mono font-medium border border-border">v1.0.0</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.2 }}>
              Operating System
            </div>
          </div>
        )}
      </div>

      {/* Workspace Switcher */}
      {!collapsed && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
          <WorkspaceSwitcher />
        </div>
      )}

      {/* Search */}
      {!collapsed && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={onSearchOpen}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '7px 10px',
              color: 'var(--muted-foreground)',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.12s',
            }}
          >
            <Search size={13} />
            <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>
            <span
              style={{
                fontSize: '11px',
                background: 'var(--muted)',
                padding: '1px 5px',
                borderRadius: '4px',
                fontFamily: 'monospace',
              }}
            >
              ⌘K
            </span>
          </button>
        </div>
      )}

      {collapsed && (
        <div
          style={{
            padding: '10px 0',
            display: 'flex',
            justifyContent: 'center',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <button
            onClick={onSearchOpen}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted-foreground)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
            }}
          >
            <Search size={15} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        {dynamicNavItems.map((item) => {
          const active = current === item.id || (item.id === 'projects' && current === 'project-workspace')
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '8px 0' : '8px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'var(--secondary)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                cursor: 'pointer',
                marginBottom: '2px',
                transition: 'all 0.12s',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--muted)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => onNavigate('settings')}
          title={collapsed ? 'Settings' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: current === 'settings' ? 'var(--secondary)' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            color: current === 'settings' ? 'var(--foreground)' : 'var(--muted-foreground)',
            fontSize: '13px',
            cursor: 'pointer',
            marginBottom: '4px',
            transition: 'all 0.12s',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          <Settings size={15} />
          {!collapsed && <span>Settings</span>}
        </button>

        {/* User */}
        {!collapsed ? (
          <div
            onClick={() => {
              if (confirm('Are you sure you want to sign out?')) {
                signOut()
              }
            }}
            title="Click to sign out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Builder</div>
            </div>
            <LogOut size={13} style={{ color: 'var(--muted-foreground)' }} />
          </div>
        ) : (
          <div
            onClick={() => {
              if (confirm('Are you sure you want to sign out?')) {
                signOut()
              }
            }}
            title="Sign out"
            style={{
              padding: '8px 0',
              display: 'flex',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: '#fff',
              }}
            >
              {initials}
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        style={{
          position: 'absolute',
          bottom: '80px',
          right: collapsed ? '50%' : '-12px',
          transform: collapsed ? 'translateX(50%)' : 'none',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--muted-foreground)',
          transition: 'all 0.12s',
          zIndex: 10,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
