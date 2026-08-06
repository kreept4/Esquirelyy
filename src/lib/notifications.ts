import { ALL_SCHOLARSHIPS } from './scholarships-data'

/**
 * Notifications, derived rather than stored.
 *
 * There is no `notifications` table and deliberately so. All three things worth
 * telling someone about are already computable from data the site holds:
 *
 *   roles      new listings matching the filters they set in the quiz
 *   deadline   an open scholarship closing soon
 *   tracker    an application whose status they changed
 *
 * A table would mean a write path, a fan-out job on every new listing, and a
 * row per user per event, to say something a query answers in one pass. If a
 * notification ever needs to be pushed rather than pulled — email, or an event
 * with no underlying row — that is the point to add one, and `buildFeed` is the
 * only thing that has to change.
 *
 * "Read" is a single timestamp in localStorage. Per-device rather than
 * per-account is the right trade here: the alternative is a profile write on
 * every panel open, and the cost of getting it wrong is that a notification
 * reappears on a second device, which nobody has ever complained about.
 */

export const SEEN_KEY = 'esquirely:notifications-seen'
export const PREFS_KEY = 'esquirely:prefs'

export type NotificationKind = 'role' | 'deadline' | 'tracker'

export interface Notification {
  id: string
  kind: NotificationKind
  title: string
  detail: string
  href: string
  /** ISO. Sorts the feed and decides what counts as unread. */
  at: string
}

export type Prefs = { stage?: string; goal?: string; city?: string }

/** A scholarship deadline is free text ("Closes 27 August 2026 for entry in
 *  October 2027"), so the date has to be dug out of it. Returns null rather
 *  than guessing when there is no unambiguous day-month-year in the string. */
export function parseDeadline(text: string): Date | null {
  const m = text.match(
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
  )
  if (!m) return null
  const d = new Date(`${m[1]} ${m[2]} ${m[3]} 00:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function readPrefs(): Prefs {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function readSeen(): number {
  if (typeof window === 'undefined') return 0
  const raw = localStorage.getItem(SEEN_KEY)
  const n = raw ? Date.parse(raw) : NaN
  // A first-time visitor should not open the panel to fourteen weeks of
  // backlog, so an absent marker means "seen everything up to a week ago".
  return Number.isNaN(n) ? Date.now() - 7 * 24 * 60 * 60 * 1000 : n
}

export function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, new Date().toISOString())
  } catch {
    // Private browsing. The badge simply stays until the tab is closed.
  }
}

/** Scholarships closing inside this window are worth interrupting someone for. */
const DEADLINE_WINDOW_DAYS = 30

const STAGE_LEVEL: Record<string, string> = {
  law_student: 'student',
  nysc: 'junior',
  junior_associate: 'junior',
  senior_lawyer: 'senior',
}

/**
 * Build the feed.
 *
 * `jobs` and `applications` are passed in rather than fetched here so this stays
 * a pure function and the component owns the one Supabase round trip.
 */
export function buildFeed(
  jobs: any[],
  applications: any[],
  prefs: Prefs,
  now = new Date()
): Notification[] {
  const out: Notification[] = []
  const today = now.toISOString().slice(0, 10)

  // 1. Roles matching the filters they actually set. With no prefs the match is
  //    everything, which is the honest reading of "no filters".
  const wantLevel = prefs.stage ? STAGE_LEVEL[prefs.stage] : undefined
  const wantCity = prefs.city && prefs.city !== 'Anywhere' ? prefs.city.toLowerCase() : undefined

  for (const j of jobs) {
    if (!j.is_rolling && j.deadline && j.deadline < today) continue
    if (wantLevel && j.level && j.level !== wantLevel) continue
    if (wantCity && !String(j.location || '').toLowerCase().includes(wantCity)) continue
    out.push({
      id: `role-${j.id}`,
      kind: 'role',
      title: j.title,
      detail: [j.employer, j.location].filter(Boolean).join(' · '),
      href: `/jobs/${j.slug}`,
      at: j.created_at,
    })
  }

  // 2. Open scholarships closing inside the window.
  for (const s of ALL_SCHOLARSHIPS) {
    if (s.status !== 'open') continue
    const d = parseDeadline(s.deadline)
    if (!d) continue
    const days = Math.ceil((d.getTime() - now.getTime()) / 86_400_000)
    if (days < 0 || days > DEADLINE_WINDOW_DAYS) continue
    out.push({
      id: `deadline-${s.slug}`,
      kind: 'deadline',
      title: s.title,
      detail:
        days === 0 ? 'Closes today' : days === 1 ? 'Closes tomorrow' : `Closes in ${days} days`,
      href: '/scholarships',
      // Dated to the moment it entered the window, so it surfaces once and then
      // ages out of unread rather than re-alerting every time the panel opens.
      at: new Date(d.getTime() - DEADLINE_WINDOW_DAYS * 86_400_000).toISOString(),
    })
  }

  // 3. Tracker movements.
  for (const a of applications) {
    if (!a.status || !a.updated_at) continue
    out.push({
      id: `tracker-${a.id}-${a.status}`,
      kind: 'tracker',
      title: a.role || a.title || 'Application updated',
      detail: `${a.employer ? a.employer + ' · ' : ''}Moved to ${a.status}`,
      href: '/tracker',
      at: a.updated_at,
    })
  }

  return out
    .filter(n => n.at && !Number.isNaN(Date.parse(n.at)))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 20)
}

export function unreadCount(feed: Notification[], seen: number) {
  return feed.filter(n => Date.parse(n.at) > seen).length
}

/** "3h", "2d". Absolute dates in a notification list are noise; what a reader
 *  wants is whether this happened before or after they last looked. */
export function timeAgo(iso: string, now = Date.now()) {
  const diff = now - Date.parse(iso)
  if (!Number.isFinite(diff)) return ''
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d`
  return `${Math.round(days / 30)}mo`
}
