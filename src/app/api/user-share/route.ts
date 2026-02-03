import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ sharePercentage: 0, initialInvestment: 0 })
    }

    const { data, error } = await supabase
      .from('user_shares')
      .select('share_percentage, initial_investment')
      .eq('email', user.email.toLowerCase())
      .single()

    if (error || !data) {
      return NextResponse.json({ sharePercentage: 0, initialInvestment: 0 })
    }

    return NextResponse.json({
      sharePercentage: Number(data.share_percentage),
      initialInvestment: Number(data.initial_investment),
    })
  } catch {
    return NextResponse.json({ sharePercentage: 0, initialInvestment: 0 })
  }
}
