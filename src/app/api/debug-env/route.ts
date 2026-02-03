import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const adminEmail = process.env.ADMIN_EMAIL || '(not set)'
  
  return NextResponse.json({
    adminEmail: adminEmail,
    adminEmailLength: adminEmail.length,
    adminEmailChars: [...adminEmail].map(c => c.charCodeAt(0)),
    userEmail: user?.email || '(not authenticated)',
    match: user?.email === adminEmail,
  })
}
