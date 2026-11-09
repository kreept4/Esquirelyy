/**
 * What Vercel Web Analytics is allowed to count, and what it is never sent.
 *
 * ============================================================
 * WHY THE FOUNDERS' OWN VISITS ARE DROPPED
 * ============================================================
 *
 * The question this exists to answer is "how many people came to Esquirely",
 * and the person asking it is on the site more than anybody: adding listings,
 * checking the board after a deploy, opening the email's links to see they
 * work. Counted, those visits are the biggest single source of traffic on a
 * quiet day, and the number stops meaning what it is read as.
 *
 * Two ways a device is excluded, and the flag either sets is the same one:
 *
 *   signed in    The owner's account id is listed below. Signing in on a
 *                device marks it, and the mark outlives signing out, so the
 *                device stays excluded when it is browsing logged out too.
 *   the link     Any device, signed in or not, is excluded by opening
 *                esquirely.com.ng/?va=off once, and counted again with
 *                ?va=on. That is for a second phone, a co-founder, or a
 *                browser that will never sign in.
 *
 * An account id rather than an email: the id is what the browser already holds
 * after sign-in, and it reads as nothing to anybody who finds it in the bundle.
 *
 * ⚠ THE FIRST PAGE VIEW ON A BRAND-NEW DEVICE CAN STILL COUNT if it is
 * signed in as the owner, because the session is read after the page has
 * started loading and the analytics script may report before it resolves.
 * One view, once per device, and the link above avoids even that.
 *
 * ============================================================
 * WHY THE URL IS CLEANED BEFORE IT IS SENT
 * ============================================================
 *
 * Analytics receives the full address of every page viewed. Sign-in and
 * password links land with one-time codes in the query (`code`, `token_hash`),
 * and Supabase can return tokens in the fragment. None of that is traffic data
 * and none of it belongs on a third party's server, so it is removed here,
 * along with the opt-out switch itself. Everything else stays, the email's
 * utm_ tags above all: they are how a visit from the roles email is told apart
 * from one from LinkedIn.
 */

/** The account whose visits never count: Boluwatife's. */
export const EXCLUDED_ACCOUNT_IDS: ReadonlySet<string> = new Set([
  'fa6b7d16-5ddd-4d47-9f7d-5df575dfed1a',
])

/** The key Vercel's own docs use for opting a browser out. */
export const OPT_OUT_KEY = 'va-disable'

/** Query parameters that carry credentials or one-time codes. */
const REDACT = ['code', 'token', 'token_hash', 'access_token', 'refresh_token', 'va']

export function setOptedOut(on: boolean) {
  try {
    if (on) localStorage.setItem(OPT_OUT_KEY, '1')
    else localStorage.removeItem(OPT_OUT_KEY)
  } catch {
    /* Storage blocked (a private window, a locked-down browser). The visit is
       counted, which is the safe way for this to fail. */
  }
}

export function isOptedOut(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_KEY) !== null
  } catch {
    return false
  }
}

/**
 * Reads ?va=off / ?va=on from the address being reported. Done here, at send
 * time, rather than in an effect, so the page view the link itself produces is
 * already governed by it.
 */
export function applyOptOutSwitch(url: URL) {
  const v = url.searchParams.get('va')
  if (v === 'off') setOptedOut(true)
  else if (v === 'on') setOptedOut(false)
}

/** The address with credentials, the fragment and the switch removed. */
export function cleanUrl(url: URL): string {
  for (const k of REDACT) url.searchParams.delete(k)
  url.hash = ''
  return url.toString()
}
