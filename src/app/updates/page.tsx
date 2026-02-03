import { AppShell } from '@/components/app-shell'
import { PostsFeed } from '@/components/posts-feed'

export const dynamic = 'force-dynamic'

export default function UpdatesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Updates</h1>
          <p className="text-muted-foreground">Latest news and announcements</p>
        </div>
        <PostsFeed />
      </div>
    </AppShell>
  )
}
