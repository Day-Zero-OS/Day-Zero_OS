import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { WorkspaceLayout } from '@/app/layouts/WorkspaceLayout'
import { screenPaths, type Screen } from '@/types/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import { LoadingState } from '@/components/feedback/LoadingState'

const Login = lazy(() => import('@/components/Login'))
const ResetPassword = lazy(() => import('@/components/ResetPassword'))
const AuthCallback = lazy(() => import('@/components/AuthCallback'))
const PrivacyPolicy = lazy(() => import('@/components/legal/PrivacyPolicy'))
const TermsOfService = lazy(() => import('@/components/legal/TermsOfService'))
const About = lazy(() => import('@/components/legal/About'))
const Support = lazy(() => import('@/components/legal/Support'))

const DownloadHome = lazy(() => import('@/components/download/DownloadHome'))
const DownloadWindows = lazy(() => import('@/components/download/DownloadWindows'))
const DownloadAndroid = lazy(() => import('@/components/download/DownloadAndroid'))
const DownloadMac = lazy(() => import('@/components/download/DownloadMac'))
const DownloadIos = lazy(() => import('@/components/download/DownloadIos'))

const MissionControl = lazy(() => import('@/components/MissionControl'))
const Projects = lazy(() => import('@/components/Projects'))
const ProjectWorkspace = lazy(() => import('@/components/ProjectWorkspace'))
const ContentEngine = lazy(() => import('@/components/ContentEngine'))
const KnowledgeBase = lazy(() => import('@/components/KnowledgeBase'))
const AssetVault = lazy(() => import('@/components/AssetVault'))
const WeeklyDebrief = lazy(() => import('@/components/WeeklyDebrief'))
const Notifications = lazy(() => import('@/components/Notifications'))
const Settings = lazy(() => import('@/components/Settings'))

// Student OS V2 Sector Views
const StudentMissionControl = lazy(() => import('@/features/student/StudentMissionControl'))
const StudentAcademics = lazy(() => import('@/features/student/StudentAcademics'))
const StudentPlanner = lazy(() => import('@/features/student/StudentPlanner'))
const StudentResources = lazy(() => import('@/features/student/StudentResources'))
const StudentGoals = lazy(() => import('@/features/student/StudentGoals'))
const StudentGroupWork = lazy(() => import('@/features/student/StudentGroupWork'))
const StudentGroupDetail = lazy(() => import('@/features/student/StudentGroupDetail'))
const StudentSettings = lazy(() => import('@/features/student/StudentSettings'))

function RouteLoader() {
  return (
    <div
      style={{
        height: '100%',
        minHeight: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LoadingState />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoadingState />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoadingState />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={screenPaths['student-mission']} replace />
  }

  return <Login />
}

function useRouteNavigation() {
  const navigate = useNavigate()

  return (screen: Screen) => {
    navigate(screenPaths[screen])
  }
}

function MissionControlRoute() {
  return <MissionControl onNavigate={useRouteNavigation()} />
}

function ProjectsRoute() {
  const navigate = useNavigate()

  return (
    <Projects
      onNavigate={useRouteNavigation()}
      onOpenProject={(projectId) => navigate(`/projects/${projectId}`)}
    />
  )
}

function ProjectWorkspaceRoute() {
  return <ProjectWorkspace onNavigate={useRouteNavigation()} />
}

export function AppRoutes() {
  const navigate = useRouteNavigation()

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/download" element={<DownloadHome />} />
          <Route path="/download/windows" element={<DownloadWindows />} />
          <Route path="/download/android" element={<DownloadAndroid />} />
          <Route path="/download/macos" element={<DownloadMac />} />
          <Route path="/download/ios" element={<DownloadIos />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <WorkspaceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={screenPaths['student-mission']} replace />} />
          <Route path="/mission-control" element={<MissionControlRoute />} />
          <Route path="/projects" element={<ProjectsRoute />} />
          <Route path="/projects/:projectId" element={<ProjectWorkspaceRoute />} />
          <Route path="/content" element={<ContentEngine />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/assets" element={<AssetVault />} />
          <Route path="/weekly-debrief" element={<WeeklyDebrief />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />

          {/* Student OS V2 Routes */}
          <Route path="/student/mission" element={<StudentMissionControl onNavigate={navigate} />} />
          <Route path="/student/academics" element={<StudentAcademics onNavigate={navigate} initialTab="subjects" />} />
          <Route path="/student/academics/subjects" element={<StudentAcademics onNavigate={navigate} initialTab="subjects" />} />
          <Route path="/student/academics/assignments" element={<StudentAcademics onNavigate={navigate} initialTab="assignments" />} />
          <Route path="/student/academics/exams" element={<StudentAcademics onNavigate={navigate} initialTab="exams" />} />
          <Route path="/student/academics/attendance" element={<StudentAcademics onNavigate={navigate} initialTab="attendance" />} />
          <Route path="/student/planner" element={<StudentPlanner onNavigate={navigate} initialTab="study-plan" />} />
          <Route path="/student/planner/study-plan" element={<StudentPlanner onNavigate={navigate} initialTab="study-plan" />} />
          <Route path="/student/planner/calendar" element={<StudentPlanner onNavigate={navigate} initialTab="calendar" />} />
          <Route path="/student/resources" element={<StudentResources onNavigate={navigate} initialTab="notes" />} />
          <Route path="/student/resources/notes" element={<StudentResources onNavigate={navigate} initialTab="notes" />} />
          <Route path="/student/resources/files" element={<StudentResources onNavigate={navigate} initialTab="files" />} />
          <Route path="/student/goals" element={<StudentGoals onNavigate={navigate} />} />
          <Route path="/student/group-work" element={<StudentGroupWork onNavigate={navigate} />} />
          <Route path="/student/group-work/:groupId" element={<StudentGroupDetail onNavigate={navigate} />} />
          <Route path="/student/notifications" element={<Notifications />} />
          <Route path="/student/settings" element={<StudentSettings />} />
        </Route>

        <Route path="*" element={<Navigate to={screenPaths['student-mission']} replace />} />
      </Routes>
    </Suspense>
  )
}
