import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase/client'
import { setDemoModeEnabled, isDemoModeEnabled } from '@/lib/supabase/mockClient'
import { env } from '@/lib/config/env'
import { useTheme } from '@/app/providers/ThemeProvider'
import { AlertCircle, Terminal, HelpCircle, ArrowRight } from 'lucide-react'

export type Profile = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  timezone: string
  workspace_name: string
}

export type UserSettings = {
  theme: string
  accent_color: string
  sidebar_layout: string
  default_project_view: string
  notifications: { email: boolean; push: boolean }
  ai_enabled: boolean
  ai_provider: string | null
  language: string
}

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  session: Session | null
  profile: Profile | null
  userSettings: UserSettings | null
  refreshSession: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = configured ? getSupabaseClient() : null
  const themeContext = useTheme()

  useEffect(() => {
    if (userSettings?.theme) {
      themeContext.setTheme(userSettings.theme as any)
    }
  }, [userSettings?.theme, themeContext])

  const fetchProfileAndSettings = useCallback(
    async (userId: string) => {
      if (!supabase) return

      try {
        // Fetch profile
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        let currentProfile = prof
        if (!currentProfile && (profErr?.code === 'PGRST116' || !profErr)) {
          const { data: userAuth } = await supabase.auth.getUser()
          const authUser = userAuth?.user
          
          const fullName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'New User'
          const username = authUser?.user_metadata?.username || authUser?.email?.split('@')[0] || `user_${userId.slice(0, 8)}`
          
          const { data: newProf, error: createProfErr } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              full_name: fullName,
              username: username,
              email: authUser?.email || null,
            })
            .select()
            .single()

          if (createProfErr) {
            console.error('Failed to auto-create profile:', createProfErr)
          } else {
            currentProfile = newProf
          }
        }

        if (currentProfile) {
          setProfile(currentProfile as Profile)
        } else if (profErr && profErr.code !== 'PGRST116') {
          console.error('Error fetching profile:', profErr)
        }

        // Fetch settings
        const { data: setts, error: settsErr } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single()

        let currentSettings = setts
        if (!currentSettings && (settsErr?.code === 'PGRST116' || !settsErr)) {
          const { data: newSettings, error: createSettingsErr } = await supabase
            .from('user_settings')
            .upsert({
              user_id: userId,
            })
            .select()
            .single()

          if (createSettingsErr) {
            console.error('Failed to auto-create settings:', createSettingsErr)
          } else {
            currentSettings = newSettings
          }
        }

        if (currentSettings) {
          setUserSettings(currentSettings as UserSettings)
        } else if (settsErr && settsErr.code !== 'PGRST116') {
          console.error('Error fetching settings:', settsErr)
        }
      } catch (e) {
        console.error('Exception in fetchProfileAndSettings:', e)
      }
    },
    [supabase],
  )

  const refreshSession = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        await fetchProfileAndSettings(data.session.user.id)
      } else {
        setProfile(null)
        setUserSettings(null)
      }
    } catch (e: any) {
      console.error('Failed to get session:', e)
      if (
        e &&
        (String(e.message || e).includes('Failed to fetch') ||
          String(e.message || e).includes('fetch') ||
          String(e.message || e).includes('NetworkError'))
      ) {
        console.warn('Network error. Enabling demo mode fallback.')
        setDemoModeEnabled(true)
        window.location.reload()
      }
    } finally {
      setIsLoading(false)
    }
  }, [fetchProfileAndSettings, supabase])

  useEffect(() => {
    async function checkDatabaseOnline() {
      if (!isDemoModeEnabled() || !env.supabaseUrl) return
      try {
        const res = await fetch(env.supabaseUrl)
        if (res.status >= 200 && res.status < 500) {
          console.log('Supabase database is back online. Disabling Demo Mode.')
          setDemoModeEnabled(false)
          window.location.reload()
        }
      } catch {
        // Database is still unreachable, keep Demo Mode
      }
    }
    checkDatabaseOnline()
  }, [])

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    try {
      refreshSession()

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          await fetchProfileAndSettings(currentSession.user.id)
        } else {
          setProfile(null)
          setUserSettings(null)
        }
        setIsLoading(false)
      })

      return () => {
        subscription?.unsubscribe()
      }
    } catch (e: any) {
      console.error('Error in AuthProvider useEffect:', e)
      if (
        e &&
        (String(e.message || e).includes('Failed to fetch') ||
          String(e.message || e).includes('fetch') ||
          String(e.message || e).includes('NetworkError'))
      ) {
        setDemoModeEnabled(true)
        window.location.reload()
      } else {
        setIsLoading(false)
      }
    }
  }, [fetchProfileAndSettings, refreshSession, supabase])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !supabase) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates })
        .select()
        .single()

      if (error) throw error
      if (data) setProfile(data as Profile)
    } catch (e) {
      console.error('Failed to update profile:', e)
      throw e
    }
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !supabase) return
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...updates })
        .select()
        .single()

      if (error) throw error
      if (data) setUserSettings(data as UserSettings)
    } catch (e) {
      console.error('Failed to update settings:', e)
      throw e
    }
  }

  const signOut = async () => {
    if (!supabase) return

    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setProfile(null)
      setUserSettings(null)
    } catch (e) {
      console.error('Signout failed:', e)
    } finally {
      setIsLoading(false)
    }
  }

  if (!configured) {
    return <ConfigGuidanceScreen />
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        session,
        profile,
        userSettings,
        refreshSession,
        updateProfile,
        updateSettings,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}

function ConfigGuidanceScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090b',
        color: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Geist', 'Inter', sans-serif",
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(#27272a 1px, transparent 1px),
            linear-gradient(90deg, #27272a 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.2,
        }}
      />

      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          background: '#111113',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <AlertCircle size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
              Supabase Configuration Required
            </h1>
            <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>
              Day Zero OS requires database connection settings to start
            </p>
          </div>
        </div>

        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#a1a1aa', marginBottom: '28px' }}>
          Welcome to <strong style={{ color: '#fff' }}>Day Zero OS</strong>. This project relies entirely on
          Supabase for data persistence and authentication. Please configure the environment variables in a{' '}
          <code
            style={{
              fontFamily: 'monospace',
              color: '#3b82f6',
              background: 'rgba(59, 130, 246, 0.05)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            .env
          </code>{' '}
          file at the root of the project directory:
        </div>

        {/* Console Box */}
        <div
          style={{
            background: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '6px',
            padding: '16px 20px',
            fontFamily: "'Geist Mono', monospace",
            fontSize: '13px',
            color: '#a1a1aa',
            marginBottom: '28px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#71717a',
              marginBottom: '10px',
              fontSize: '11px',
            }}
          >
            <Terminal size={12} />
            <span>.env</span>
          </div>
          <div style={{ color: '#22c55e' }}>VITE_APP_ENV=development</div>
          <div style={{ color: '#22c55e' }}>VITE_APP_URL=http://localhost:8443</div>
          <div style={{ color: '#fff', marginTop: '6px' }}>
            VITE_SUPABASE_URL=<span style={{ color: '#71717a' }}>[your-supabase-project-url]</span>
          </div>
          <div style={{ color: '#fff' }}>
            VITE_SUPABASE_ANON_KEY=<span style={{ color: '#71717a' }}>[your-supabase-anon-key]</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#71717a' }}>
            <HelpCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              If you don't have a Supabase project yet, create one for free at{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#3b82f6', textDecoration: 'none' }}
              >
                supabase.com
              </a>{' '}
              and run the SQL setup from <code style={{ fontFamily: 'monospace' }}>/supabase/migrations</code>
              .
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#71717a' }}>
            <ArrowRight size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#22c55e' }} />
            <span>
              Once you add the variables to your <code style={{ fontFamily: 'monospace' }}>.env</code> file,
              restart the development server or refresh the browser.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
