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
  GraduationCap,
  Calendar,
  Target,
  Users,
  Layers,
} from 'lucide-react'
import logoImg from '@/logo.png'
import type { Screen } from '@/types/navigation'
import { useAuth } from '@/app/providers/AuthProvider'

import { WorkspaceSwitcher } from '@/features/workspace/components/WorkspaceSwitcher'

interface NavItem {
  id: Screen
  label: string
  icon: React.ReactNode
  subItems?: { id: Screen; label: string }[]
}

const defaultNavItems: NavItem[] = [
  { id: 'mission-control', label: 'Mission Control', icon: <Command size={15} /> },
  { id: 'projects', label: 'Projects', icon: <FolderOpen size={15} /> },
  { id: 'content-engine', label: 'Content Engine', icon: <Rss size={15} /> },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: <BookOpen size={15} /> },
  { id: 'asset-vault', label: 'Asset Vault', icon: <Archive size={15} /> },
  { id: 'weekly-debrief', label: 'Weekly Debrief', icon: <CalendarCheck size={15} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
]

const studentNavItems: NavItem[] = [
  { id: 'student-mission', label: 'Mission Control', icon: <Command size={15} /> },
  {
    id: 'student-academics',
    label: 'Academics',
    icon: <GraduationCap size={15} />,
    subItems: [
      { id: 'student-subjects', label: 'Subjects' },
      { id: 'student-assignments', label: 'Assignments' },
      { id: 'student-exams', label: 'Exams' },
      { id: 'student-attendance', label: 'Attendance' },
    ],
  },
  {
    id: 'student-planner',
    label: 'Planner',
    icon: <Calendar size={15} />,
    subItems: [
      { id: 'student-study-plan', label: 'Study Plan' },
      { id: 'student-calendar', label: 'Calendar' },
    ],
  },
  {
    id: 'student-resources',
    label: 'Resources',
    icon: <Layers size={15} />,
    subItems: [
      { id: 'student-notes', label: 'Notes' },
      { id: 'student-files', label: 'Files' },
    ],
  },
  { id: 'student-goals', label: 'Goals & Progress', icon: <Target size={15} /> },
  { id: 'student-group-work', label: 'Group Work', icon: <Users size={15} /> },
  { id: 'student-notifications', label: 'Notifications', icon: <Bell size={15} /> },
]

interface Props {
  current: Screen
  collapsed: boolean
  onNavigate: (s: Screen) => void
  onSearchOpen?: () => void
  onToggleCollapse: () => void
}

export default function Sidebar({ current, collapsed, onNavigate, onSearchOpen, onToggleCollapse }: Props) {
  const { user, profile, signOut } = useAuth()
  const w = collapsed ? 56 : 220

  const isStudentMode = current.startsWith('student-')
  const activeItems = isStudentMode ? studentNavItems : defaultNavItems

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
              <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 rounded font-mono font-medium border border-purple-200 dark:border-purple-800">
                Student OS
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.2 }}>
              Student Workspace
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
        {activeItems.map((item) => {
          const active = current === item.id || item.subItems?.some((sub) => sub.id === current)
          return (
            <div key={item.id} className="mb-1">
              <button
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
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>

              {/* Sub items for Grouped Navigation */}
              {!collapsed && item.subItems && (
                <div className="ml-6 mt-1 space-y-0.5 border-l border-border/60 pl-2">
                  {item.subItems.map((sub) => {
                    const subActive = current === sub.id
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate(sub.id)}
                        className={`w-full text-left px-2 py-1 text-xs rounded transition-colors block ${
                          subActive
                            ? 'font-bold text-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        }`}
                      >
                        {sub.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => onNavigate(isStudentMode ? 'student-settings' : 'settings')}
          title={collapsed ? 'Settings' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: current === 'settings' || current === 'student-settings' ? 'var(--secondary)' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            color: current === 'settings' || current === 'student-settings' ? 'var(--foreground)' : 'var(--muted-foreground)',
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
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Student</div>
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
