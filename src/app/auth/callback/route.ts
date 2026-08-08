import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth return leg.
 *
 * Two things were wrong here.
 *
 * The profile read discarded its error, so a returning Google user who had
 * completed onboarding was sent through it again on every single sign-in. The
 * cause was a missing GRANT on `profiles` (see
 * scripts/2026-08-07-grant-profiles.sql), but the reason nobody noticed is that
 * a failed read and a genuinely new user were indistinguishable: both produced
 * a null profile and both fell through to /auth/welcome. Those are now told
 * apart, and only one of them is normal.
 *
 * And `next` was parsed and then never used, so anything that sent a visitor
 * here with a destination in hand silently lost it.
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

  // Wherever they were heading beats anything we would pick for them.
  if (next) return NextResponse.redirect(`${origin}${next}`)

  /* maybeSingle, not single: a first-time user having no row is the expected
   * case, and single() turns that into an error, which is what made a real
   * failure impossible to see among the noise. */
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    /* A read that fails is not a user who has not onboarded. We cannot tell
     * where they should go, so we send them to the board rather than making a
     * returning user redo onboarding on every sign-in, which is what the old
     * fall-through did. */
    console.error('[auth] could not read profile, skipping onboarding check', error)
    return NextResponse.redirect(`${origin}/jobs`)
  }

  if ((profile as { onboarding_complete?: boolean } | null)?.onboarding_complete) {
    return NextResponse.redirect(`${origin}/jobs`)
  }
  return NextResponse.redirect(`${origin}/auth/welcome`)
}
