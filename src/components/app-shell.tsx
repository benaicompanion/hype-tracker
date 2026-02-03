import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { redirect } from 'next/navigation'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const adminEmail = process.env.ADMIN_EMAIL || ''
  const isAdmin = user.email === adminEmail

  return (
    <div className="min-h-screen">
      <Nav userEmail={user.email} isAdmin={isAdmin} />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
