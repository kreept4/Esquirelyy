import type { User } from '@supabase/supabase-js'
import { sendEmail, emailConfigured } from './send'
import { welcomeEmail } from './templates/welcome'

/**
 * Send the welcome message to a user, at most once, ever.
 *
 * WHY THIS IS A MODULE AND NOT A ROUTE
 *
 * Two ways to reach a first welcome, and they arrive by different paths:
 *
 *   password      the signup page POSTs /api/email/welcome once the six-digit
 *                 code is verified — the first moment the address is proved real
 *   confirmation  /auth/callback exchanges a code too — the same route Google
 *                 used to land on and LinkedIn Connect briefly did, both gone
 *                 as of the privacy notice's audit comment. What reaches it now
 *                 is a magic-link signup confirmation, if the account holder
 *                 clicks the link in the confirmation email rather than typing
 *                 the code, so the address was proved by clicking rather than
 *                 by a code this app verified.
 *
 * This function checks both regardless of which one is live today, because
 * that is cheap and correct, and because a future OAuth sign-up path — if one
 * ever ships again — should not have to remember to route itself through
 * here. It already would.
 *
 * /auth/callback had no welcome at all when this shipped, back when Google was
 * the reason anyone landed there. The fix could not be "call the API route
 * from the callback": that would mean a server route making an HTTP request
 * to itself, carrying the session cookie forward by hand, on a redirect a
 * person is waiting on. Both callers run the same function in-process
 * instead, so the once-only rule cannot be enforced in one path and forgotten
 * in the other.
 *
 * SERVER ONLY. It reads SUPABASE_SERVICE_ROLE_KEY.
 *
 * ONE WELCOME PER ACCOUNT
 *
 * Being signed in is not evidence of being new — that is true of every
 * returning user on every page. Two independent conditions have to hold, both
 * checked here where a browser cannot reach them:
 *
 *   1. the account was created inside FRESH_WINDOW_MS, so a months-old account
 *      can never qualify whatever the caller does; and
 *   2. `app_metadata.welcome_sent_at` is unset. This is the authoritative one:
 *      app_metadata is writable only with the service role, so unlike
 *      user_metadata a client cannot clear it to earn a second welcome.
 *
 * The stamp is written BEFORE the send. If the two disagree, stamping first
 * loses one greeting when Brevo errors; sending first mails the same person
 * repeatedly when the stamp write errors. One costs a greeting, the other costs
 * a sender reputation. A lost one logs as 'welcome stamped but send failed'.
 *
 * Never throws. Every caller is on a path where the account already exists and
 * is fine; a greeting that did not send must not take down a signup or a
 * redirect.
 */

/** An account older than this is not a new account, whatever the caller says.
 *  A day rather than a minute, so a code verified the morning after signup
 *  still gets its greeting. */
const FRESH_WINDOW_MS = 24 * 60 * 60 * 1000

export type WelcomeOutcome =
  | { ok: true; sent: true }
  | { ok: true; sent: false; reason: string }
  | { ok: false; reason: string }

/**
 * Stamp the account as welcomed, using the service role.
 *
 * fetch against the GoTrue admin endpoint rather than a second Supabase client:
 * this is one PUT, and the alternative is instantiating an admin client on a
 * path that otherwise runs entirely as the signed-in user.
 */
async function stampWelcomed(userId: string, existing: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false

  try {
    const res = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      // Spread what is already there: this endpoint REPLACES app_metadata
      // rather than merging, so sending only our key would drop everything
      // else in it — including the provider list Supabase keeps there, which
      // for a linked account is how it knows which providers it holds.
      body: JSON.stringify({
        app_metadata: { ...existing, welcome_sent_at: new Date().toISOString() },
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.error('[email] could not stamp welcome', res.status, (await res.text()).slice(0, 200))
      return false
    }
    return true
  } catch (err) {
    console.error('[email] could not stamp welcome', err)
    return false
  }
}

/**
 * Absolute base for every link in the message.
 *
 * The fallback is now the live domain. It used to be the Vercel URL, on the
 * reasoning that the apex was registered but not yet pointed here and answered
 * every path with 200 text/html. That reading was wrong in an important way:
 * esquirely.com is a THIRD PARTY's parked domain, which is why it answered
 * everything, and it was never ours to cut over to. esquirely.com.ng is, and it
 * serves this app on both apex and www.
 *
 * Still set NEXT_PUBLIC_SITE_URL in the Vercel project. Preview deployments
 * should link to themselves, not to production, and the env var is the only
 * thing that makes that true.
 */
function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://esquirely.com.ng'
}

export async function sendWelcomeOnce(user: User): Promise<WelcomeOutcome> {
  try {
    if (!user?.email) return { ok: false, reason: 'no email on user' }

    const appMeta = (user.app_metadata || {}) as Record<string, unknown>
    if (appMeta.welcome_sent_at) return { ok: true, sent: false, reason: 'already welcomed' }

    const createdAt = user.created_at ? Date.parse(user.created_at) : NaN
    if (!Number.isFinite(createdAt) || Date.now() - createdAt > FRESH_WINDOW_MS) {
      return { ok: true, sent: false, reason: 'not a new account' }
    }

    /* No key locally or on a preview build is the expected state, not a fault.
       Reported as a skip so nothing downstream surfaces an error for it. */
    if (!emailConfigured()) return { ok: true, sent: false, reason: 'email not configured' }

    /* An OAuth provider puts the display name in `name` and/or `full_name`;
       the password signup writes `full_name` from the form. Both are checked
       so anyone who arrives either way is greeted by name rather than falling
       through to the generic opening. */
    const name =
      (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || ''

    const { subject, html, text } = welcomeEmail({ name, siteUrl: siteUrl() })

    // Claim the send before making it. See the header for why.
    if (!(await stampWelcomed(user.id, appMeta))) {
      return { ok: false, reason: 'could not record send' }
    }

    const result = await sendEmail({
      to: user.email,
      toName: name || undefined,
      subject,
      html,
      text,
    })

    if (!result.ok) {
      // Stamped but not sent, and deliberately NOT unstamped: a retry loop that
      // keeps clearing the flag is how one failure becomes fifty deliveries.
      // Grep this line to find anyone owed a greeting.
      console.error('[email] welcome stamped but send failed', user.id, result.error)
      return { ok: false, reason: 'send failed' }
    }

    return { ok: true, sent: true }
  } catch (err) {
    console.error('[email] welcome threw', err)
    return { ok: false, reason: 'unexpected error' }
  }
}
