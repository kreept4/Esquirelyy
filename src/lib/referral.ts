/**
 * Ambassador invite links.
 *
 * An ambassador is given a link with their own code on it, esquirely.com.ng/?ref=CODE.
 * This module is the whole of the client side: capture the code when somebody
 * arrives on it, hold it, and hand it back at signup so the account records who
 * sent them.
 *
 * WHY THE CODE IS HELD RATHER THAN READ AT SIGNUP. Almost nobody arrives on an
 * invite link and signs up in the same breath. They land on the board, read a
 * few roles, close the tab, and come back two days later through Google with no
 * ref on the URL at all. Reading the parameter at the moment of signup would
 * credit an ambassador for roughly nobody they actually sent. Storing it at the
 * moment of arrival is what makes the count mean anything.
 *
 * FIRST TOUCH WINS, not last. Once a code is stored it is not overwritten by a
 * later one. The ambassador who introduced somebody to Esquirely did the work;
 * a second link seen a fortnight later did not do it again. This also removes
 * the incentive to spray links at people who are already members.
 *
 * localStorage, not a cookie. Nothing here is read on the server, so a cookie
 * would be sent up on every single request for no reason, and it would need a
 * consent line it does not currently need: this stores a campaign code, not a
 * person, and it never leaves the browser until the moment an account is made
 * and the owner of that account submits it themselves.
 */

const KEY = 'esq_ref'
const MAX_AGE_DAYS = 90

type Stored = { code: string; at: number }

/** Codes are ours to issue, so the shape is narrow on purpose: anything that is
 *  not a plain short code is ignored rather than stored and later written to a
 *  profile row. */
function clean(raw: string | null): string | null {
  if (!raw) return null
  const code = raw.trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9-]{1,31}$/.test(code)) return null
  return code
}

/**
 * Capture `?ref=` from the current URL, if there is one and none is held yet.
 *
 * Strips the parameter from the address bar afterwards, so a reader who copies
 * the URL out of the bar and sends it to a friend does not pass the first
 * ambassador's code along with it and quietly credit them for somebody they
 * never reached.
 */
export function captureReferral(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const code = clean(params.get('ref'))
  if (!code) return

  try {
    if (!readReferral()) {
      const value: Stored = { code, at: Date.now() }
      window.localStorage.setItem(KEY, JSON.stringify(value))
    }
  } catch {
    /* Private mode, or storage disabled. The visit still works; it is simply
       not attributed, which is the correct trade against breaking the page. */
  }

  params.delete('ref')
  const qs = params.toString()
  window.history.replaceState(
    null,
    '',
    window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash
  )
}

/** The held code, or null once it is older than MAX_AGE_DAYS. */
export function readReferral(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const { code, at } = JSON.parse(raw) as Stored
    if (!code || typeof at !== 'number') return null
    if (Date.now() - at > MAX_AGE_DAYS * 24 * 60 * 60 * 1000) {
      window.localStorage.removeItem(KEY)
      return null
    }
    return clean(code)
  } catch {
    return null
  }
}
