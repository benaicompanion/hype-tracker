import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { redirect } from 'next/navigation'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && !url.includes('your-project')
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  let userEmail: string | null = null
  let isAdmin = false

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/')
    }

    userEmail = user.email ?? null
    const adminEmail = process.env.ADMIN_EMAIL || ''
    isAdmin = user.email === adminEmail
  }

  return (
    <div className="min-h-screen">
      <Nav userEmail={userEmail} isAdmin={isAdmin} />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
