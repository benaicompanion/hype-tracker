import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'

export const dynamic = 'force-dynamic'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && !url.includes('your-project')
}

export default async function Home() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-emerald-500/40 flex items-center justify-center">
                <div className="h-5 w-5 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">HYPE Tracker</h1>
          <p className="text-muted-foreground">
            Track your Hyperliquid HYPE balance across all sources
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
