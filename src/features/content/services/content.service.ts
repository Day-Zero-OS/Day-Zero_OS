export type ContentItem = {
  id: string
  title: string
  platform: string
  status:
    | 'idea' | 'outline' | 'script' | 'recording' | 'editing' | 'thumbnail' | 'seo' | 'published' | 'analytics'
  publishDate: string | null
  analytics: Record<string, unknown>
  projectName: string
}

export async function listContentItems(_workspaceId?: string): Promise<ContentItem[]> {
  return []
}

export async function createContentItem(_title: string, _platform: string, _workspaceId?: string): Promise<void> {
  // Graceful no-op in V2 core since content_items is deprecated
}
