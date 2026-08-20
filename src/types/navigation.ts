export type Screen =
  | 'mission-control'
  | 'projects'
  | 'project-workspace'
  | 'content-engine'
  | 'knowledge-base'
  | 'asset-vault'
  | 'weekly-debrief'
  | 'notifications'
  | 'settings'
  | 'student-mission'
  | 'student-academics'
  | 'student-subjects'
  | 'student-assignments'
  | 'student-exams'
  | 'student-attendance'
  | 'student-planner'
  | 'student-study-plan'
  | 'student-calendar'
  | 'student-resources'
  | 'student-notes'
  | 'student-files'
  | 'student-goals'
  | 'student-group-work'
  | 'student-group-detail'
  | 'student-notifications'
  | 'student-settings'

export const screenPaths: Record<Screen, string> = {
  'mission-control': '/mission-control',
  projects: '/projects',
  'project-workspace': '/projects/demo-project',
  'content-engine': '/content',
  'knowledge-base': '/knowledge',
  'asset-vault': '/assets',
  'weekly-debrief': '/weekly-debrief',
  notifications: '/notifications',
  settings: '/settings',
  'student-mission': '/student/mission',
  'student-academics': '/student/academics',
  'student-subjects': '/student/academics/subjects',
  'student-assignments': '/student/academics/assignments',
  'student-exams': '/student/academics/exams',
  'student-attendance': '/student/academics/attendance',
  'student-planner': '/student/planner',
  'student-study-plan': '/student/planner/study-plan',
  'student-calendar': '/student/planner/calendar',
  'student-resources': '/student/resources',
  'student-notes': '/student/resources/notes',
  'student-files': '/student/resources/files',
  'student-goals': '/student/goals',
  'student-group-work': '/student/group-work',
  'student-group-detail': '/student/group-work/group-1',
  'student-notifications': '/student/notifications',
  'student-settings': '/student/settings',
}

export function getScreenFromPath(pathname: string): Screen {
  if (pathname.startsWith('/student/academics/subjects')) return 'student-subjects'
  if (pathname.startsWith('/student/academics/assignments')) return 'student-assignments'
  if (pathname.startsWith('/student/academics/exams')) return 'student-exams'
  if (pathname.startsWith('/student/academics/attendance')) return 'student-attendance'
  if (pathname.startsWith('/student/academics')) return 'student-academics'
  if (pathname.startsWith('/student/planner/study-plan')) return 'student-study-plan'
  if (pathname.startsWith('/student/planner/calendar')) return 'student-calendar'
  if (pathname.startsWith('/student/planner')) return 'student-planner'
  if (pathname.startsWith('/student/resources/notes')) return 'student-notes'
  if (pathname.startsWith('/student/resources/files')) return 'student-files'
  if (pathname.startsWith('/student/resources')) return 'student-resources'
  if (pathname.startsWith('/student/goals')) return 'student-goals'
  if (pathname.startsWith('/student/group-work/')) return 'student-group-detail'
  if (pathname.startsWith('/student/group-work')) return 'student-group-work'
  if (pathname.startsWith('/student/notifications')) return 'student-notifications'
  if (pathname.startsWith('/student/settings')) return 'student-settings'
  if (pathname.startsWith('/student')) return 'student-mission'

  if (pathname.startsWith('/projects/')) return 'project-workspace'
  if (pathname.startsWith('/projects')) return 'projects'
  if (pathname.startsWith('/content')) return 'content-engine'
  if (pathname.startsWith('/knowledge')) return 'knowledge-base'
  if (pathname.startsWith('/assets')) return 'asset-vault'
  if (pathname.startsWith('/weekly-debrief')) return 'weekly-debrief'
  if (pathname.startsWith('/notifications')) return 'notifications'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'mission-control'
}
