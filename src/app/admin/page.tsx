import { AppShell } from '@/components/app-shell'
import { AdminPanel } from '@/components/admin-panel'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && !url.includes('your-project')
}

export default async function AdminPage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== (process.env.ADMIN_EMAIL || '').trim()) {
      redirect('/dashboard')
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Create and manage updates</p>
        </div>
        <AdminPanel />
      </div>
    </AppShell>
  )
}
// force rebuild 1770136200
