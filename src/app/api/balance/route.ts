import { getFullBalance } from '@/lib/hyperliquid'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const balance = await getFullBalance()
    return NextResponse.json(balance)
  } catch (error) {
    console.error('Balance API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance data' },
      { status: 500 }
    )
  }
}
