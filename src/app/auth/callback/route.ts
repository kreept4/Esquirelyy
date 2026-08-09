import { NextResponse } from 'next/server'
import { sendWelcomeOnce } from '@/lib/email/welcome-once'
import { cancelPendingDeletion } from '@/lib/account'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth return leg.
 *
 * `next` was once parsed and then never used, so anything that sent a visitor
 * here with a destination in hand silently lost it. It is honoured now.
 *
 * This route used to end by reading `profiles.onboarding_complete` to decide
 * between the board and the onboarding form. That read is gone along with the
 * form itself — see the note above the final redirect. Worth knowing if you are
 * reading scripts/2026-08-07-grant-profiles.sql and wondering what needed the
 * GRANT: it was this, and a returning Google user was being sent back through
 * onboarding on every sign-in because the read failed silently and a failed read
 * looked exactly like a new account. Nothing on this path reads the table now,
 * so that class of bug cannot recur here.
 */

/** Only same-origin relative paths. An unvalidated `next` is an open redirect:
 *  anyone could hand out a link to our own callback that lands on their site
 *  wearing our domain in the address bar on the way. */
function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  /* An OAuth provider that can't complete (not enabled, misconfigured
     redirect URI, consent denied) sends `error` / `error_description` back
     here instead of `code`. Silently falling through to "no code" bounced
     people to login with zero explanation, indistinguishable from every
     other kind of failure. Pass the real reason through so it's at least
     visible instead of guessed at. */
  const oauthError = searchParams.get('error_description') || searchParams.get('error')
  if (oauthError) {
    console.error('[auth] oauth provider error', oauthError)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(oauthError)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }

  const supabase = createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth] code exchange failed', exchangeError)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }

  /**
   * The welcome message, for anyone who arrived by OAuth.
   *
   * Currently that means someone connecting LinkedIn from the account page —
   * there is no OAuth sign-up button any more, so in practice the account
   * already exists and sendWelcomeOnce returns `sent: false` on the once-only
   * check almost every time this runs. It stays unconditional rather than
   * gated on "is this actually a new account" so a future OAuth sign-up path
   * does not have to remember to wire itself through here; it already would.
   *
   * Runs BEFORE the `next` short-circuit below regardless, so it is never
   * skipped by whatever `next` happens to be set to.
   *
   * Awaited, not fired and forgotten. This route returns a redirect and then
   * the function is done, so a promise left running has no guarantee of
   * finishing — on a serverless host the instance can be frozen the moment the
   * response is written. `sendWelcomeOnce` bounds itself with timeouts and
   * never throws, and it returns immediately for the overwhelming majority of
   * calls, which are returning users failing the once-only check. Only a
   * genuinely new account pays the cost, once.
   *
   * A password user does not double up: by the time they reach here — if they
   * ever do — the signup page has already sent theirs and the stamp is set.
   */
  /* Coming back IS the undo. Someone who scheduled a deletion and then signed in
     has answered the question, and making them find a settings page to confirm
     it would lose the people who did not know there was anything to undo. Never
     throws, and writes nothing for the overwhelming majority of sign-ins that
     have no deletion pending. */
  await cancelPendingDeletion(supabase, user.id)

  const welcome = await sendWelcomeOnce(user)
  if (!welcome.ok) {
    // Logged, never fatal. Someone who just proved their identity with an
    // OAuth provider must not be bounced back to a sign-in page because Brevo
    // was slow.
    console.error('[auth] welcome message not sent', user.id, welcome.reason)
  }

  /* `sent` is only true the one time sendWelcomeOnce actually mailed someone,
     which is exactly the "brand new account" signal the welcome-note dialog
     needs — unlike being signed in, which is true of every visit forever.
     Every OAuth sign-in comes through this route, so without this check a
     returning user would get the dialog again on every login. */
  const withWelcomeParam = (url: string) => {
    if (!(welcome.ok && welcome.sent)) return url
    const u = new URL(url)
    u.searchParams.set('welcome', '1')
    return u.toString()
  }

  // Wherever they were heading beats anything we would pick for them.
  if (next) return NextResponse.redirect(withWelcomeParam(`${origin}${next}`))

  /**
   * Straight to the board. There is no onboarding questionnaire any more.
   *
   * This used to read `profiles.onboarding_complete` and send anyone without it
   * to /auth/welcome, which forwarded to a three-step form. That form was the
   * first thing a new account saw, and it stood between someone who had just
   * proved their identity and the thing they actually came for. The questions it
   * asked — career stage, goal, city — are the same ones QuickQuestions asks on
   * the home page, where they are optional, answerable in passing, and asked of
   * someone who has already seen what the site is for.
   *
   * A new account sees the welcome note itself the moment it lands (see
   * `withWelcomeParam` above and NotificationBell's handling of `?welcome=1`),
   * and every account after that finds it, read or not, on the notification
   * bell. Neither is a gate: both let the visit continue underneath, unlike
   * the three-step form this replaced.
   *
   * The profile read is gone with it. It existed only to answer "has this person
   * onboarded", nothing here asks that now, and it was one query on every single
   * OAuth sign-in.
   */
  return NextResponse.redirect(withWelcomeParam(`${origin}/jobs`))
}
