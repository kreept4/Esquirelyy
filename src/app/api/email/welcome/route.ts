import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, emailConfigured } from '@/lib/email/send'
import { welcomeEmail } from '@/lib/email/templates/welcome'

/**
 * Send the welcome message.
 *
 * Called by the signup page once the six-digit code has been verified, which is
 * the first moment the address is known to be real. Sending at signup instead
 * would mean mailing every address anyone types, including the typos and the
 * throwaways, and that is exactly how a sender reputation is destroyed.
 *
 * THE RECIPIENT COMES FROM THE SESSION, NEVER FROM THE REQUEST BODY.
 * An endpoint that mails whatever address it is handed is an open relay wearing
 * a Next.js costume: anyone could POST a stranger's address and have Esquirely
 * send them mail. The session cookie decides who gets this, and there is no
 * parameter that can change it.
 *
 * Failure is reported but never fatal. A welcome that did not send is a small
 * problem; an account that could not finish being created because a welcome did
 * not send is a much bigger one, so the caller treats every response as success
 * and only logs the detail.
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ ok: false, error: 'not signed in' }, { status: 401 })
  }

  if (!emailConfigured()) {
    /* 200, not 500. No key locally or on a preview build is the expected state,
       not a fault, and the signup flow should not surface an error for it. */
    return NextResponse.json({ ok: true, skipped: true, reason: 'email not configured' })
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://esquirely.com'

  const { subject, html, text } = welcomeEmail({
    name: (user.user_metadata?.full_name as string) || '',
    siteUrl,
  })

  const result = await sendEmail({
    to: user.email,
    toName: (user.user_metadata?.full_name as string) || undefined,
    subject,
    html,
    text,
  })

  if (!result.ok) {
    console.error('[email] welcome failed', result.error)
    return NextResponse.json({ ok: false, error: 'send failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, skipped: 'skipped' in result ? result.skipped : false })
}
