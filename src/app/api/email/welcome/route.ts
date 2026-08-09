import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeOnce } from '@/lib/email/welcome-once'

/**
 * Send the welcome message — the password-signup entry point.
 *
 * Called by the signup page once the six-digit code has been verified, which is
 * the first moment the address is known to be real. Sending at signup instead
 * would mean mailing every address anyone types, including the typos and the
 * throwaways, and that is exactly how a sender reputation is destroyed.
 *
 * OAuth users (LinkedIn, connected from the account page) do not come through
 * here. They have no code to verify, so their welcome fires from
 * /auth/callback instead. Both call the same
 * `sendWelcomeOnce`, which owns the once-per-account rule — see
 * src/lib/email/welcome-once.ts. This file is now only the HTTP wrapper.
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

  const outcome = await sendWelcomeOnce(user)

  if (!outcome.ok) {
    return NextResponse.json({ ok: false, error: outcome.reason }, { status: 502 })
  }

  /* A skip is a 200. The caller fires this without awaiting a result, and a
     repeat call is a normal thing to happen — a refreshed tab, a retried
     request — not a fault worth reporting. */
  return NextResponse.json({
    ok: true,
    sent: outcome.sent,
    ...(outcome.sent ? {} : { reason: outcome.reason }),
  })
}
