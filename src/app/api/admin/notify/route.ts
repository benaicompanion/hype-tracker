import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Verify admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== (process.env.ADMIN_EMAIL || '').trim()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postTitle } = await request.json()

    // Get all user emails via security definer function
    const { data: emailRows, error: emailError } = await supabase
      .rpc('get_all_user_emails')

    if (emailError || !emailRows) {
      console.error('Failed to fetch user emails:', emailError)
      return NextResponse.json({ error: 'Failed to fetch user list' }, { status: 500 })
    }

    const emails = emailRows.map((r: { email: string }) => r.email).filter(Boolean)

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email notifications')
      return NextResponse.json({ 
        sent: 0, 
        skipped: emails.length,
        message: 'Email notifications disabled (no RESEND_API_KEY)' 
      })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hype-tracker-mauve.vercel.app'
    const fromAddress = process.env.EMAIL_FROM || 'HYPE Tracker <onboarding@resend.dev>'
    
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 32px; height: 32px; border-radius: 50%; background: #10b981;"></div>
          <h1 style="margin: 8px 0 0; font-size: 20px; color: #111;">HYPE Tracker</h1>
        </div>
        <div style="background: #f8fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; color: #666; font-size: 13px;">New Fund Update</p>
          <h2 style="margin: 0; font-size: 18px; color: #111;">${postTitle}</h2>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          A new update has been posted to the HYPE Tracker. Log in to view the full details and check your portfolio.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${siteUrl}/updates" style="display: inline-block; background: #10b981; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">
            View Update
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          HYPE Tracker · Fund Portfolio Dashboard
        </p>
      </div>
    `

    // Use batch send for reliability (single API call)
    const batchEmails = emails.map((email: string) => ({
      from: fromAddress,
      to: email,
      subject: `New Update: ${postTitle}`,
      html: htmlBody,
    }))

    try {
      const { data, error: batchError } = await resend.batch.send(batchEmails)
      if (batchError) {
        console.error('Batch send error:', batchError)
        return NextResponse.json({ sent: 0, failed: emails.length, total: emails.length, error: batchError.message })
      }
      return NextResponse.json({ sent: data?.data?.length ?? emails.length, failed: 0, total: emails.length })
    } catch (e) {
      console.error('Batch send exception:', e)
      return NextResponse.json({ sent: 0, failed: emails.length, total: emails.length, error: 'Batch send failed' })
    }
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
