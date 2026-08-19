import { ALL_SCHOLARSHIPS } from './scholarships-data'
import { NEW_ROLES, roleCountLabel } from './new-roles'
import { TEAM_CALL } from './team-call'

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
/** Fallback only. The welcome note is normally dated to the signed-in user's
 *  account creation date (`user.created_at`), passed into `buildFeed` by the
 *  caller, so a returning user on a new device or browser doesn't look like a
 *  first-time visitor. This key only matters if that value is ever
 *  unavailable, in which case the note is dated to whenever this browser
 *  first ran this code. */
export const WELCOME_KEY = 'esquirely:welcomed-at'
export const PREFS_KEY = 'esquirely:prefs'

/**
 * 'drop' is an announcement about a batch of new listings, and it is a
 * different thing from 'role'.
 *
 * A 'role' is one opening matched against the filters somebody set, and it
 * links straight to that listing. A 'drop' is us saying "these went up
 * together", it is the same for everyone, and tapping it opens a note with the
 * board behind a button rather than navigating away on the first touch. The
 * distinction matters because the two are counted, sorted and dismissed
 * differently, and folding them together would mean an announcement quietly
 * disappearing under the roles it was announcing.
 */
export type NotificationKind = 'role' | 'deadline' | 'tracker' | 'welcome' | 'drop' | 'team'

export interface Notification {
  id: string
  kind: NotificationKind
  title: string
  detail: string
  /** Absent on the welcome note, which opens a panel rather than navigating. */
  href?: string
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

/** Reads the welcome timestamp, writing it on first call. */
export function readWelcomedAt(): string {
  if (typeof window === 'undefined') return new Date().toISOString()
  try {
    const existing = localStorage.getItem(WELCOME_KEY)
    if (existing) return existing
    const now = new Date().toISOString()
    localStorage.setItem(WELCOME_KEY, now)
    return now
  } catch {
    return new Date().toISOString()
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

/**
 * TWO KINDS OF READ, AND WHY THE WELCOME NEEDS THE SECOND ONE
 *
 * The timestamp above answers "have you looked at the list", which is the right
 * question for a new role or a moved deadline: seeing the headline in the panel
 * IS reading it, and there is nothing further to open.
 *
 * The welcome note is not like that. Its whole content is behind a second
 * click, so clearing it when the panel opens marks as read the one
 * notification the reader definitely has not read. It is tracked by id instead
 * and only goes quiet once the note itself has been opened.
 *
 * `ACK_KINDS` is the set that works this way. Nothing below branches on
 * 'welcome' by name, so anything added to the set gets the same treatment
 * everywhere at once.
 */
export const READ_KEY = 'esquirely:notifications-read'

/* 'drop' joins 'welcome' for exactly the reason above: its content is behind a
   second click, so clearing it when the panel opens would mark as read the one
   notification the reader has demonstrably not read yet. */
export const ACK_KINDS: ReadonlySet<NotificationKind> = new Set<NotificationKind>(['welcome', 'drop', 'team'])

export function readReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = JSON.parse(localStorage.getItem(READ_KEY) || '[]')
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

/** Records one notification as opened. Returns the new set so a caller can put
 *  it straight into state without re-reading storage. */
export function markRead(id: string): Set<string> {
  const next = readReadIds()
  next.add(id)
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...next]))
  } catch {
    // Private browsing. The note reopens unread next time, which is harmless.
  }
  return next
}

/** The other direction, for an ack-kind notification someone wants back on
 *  their unread list on purpose (the welcome note's "Mark as unread"). Only
 *  meaningful for kinds in ACK_KINDS — nothing else reads readIds. */
export function markUnread(id: string): Set<string> {
  const next = readReadIds()
  next.delete(id)
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...next]))
  } catch {
    // Private browsing. Already unread every time, which is harmless.
  }
  return next
}

/**
 * DISMISSAL, WHICH IS A THIRD THING AGAIN, AND THE ONLY ONE THAT HAD TO BE
 * BUILT RATHER THAN DERIVED.
 *
 * "Seen" means the panel was open. "Read" means an ack-kind note was opened.
 * Neither removes a row, because until now nothing could: every notification in
 * this feed is computed from a job row, a scholarship deadline or a tracker
 * entry that still exists, so a row deleted from React state is back the moment
 * `buildFeed` runs again — which is on the next mount, i.e. the next page
 * navigation. A delete button that undoes itself when you click a link is worse
 * than no delete button.
 *
 * So dismissal is the one piece of notification state that has to be WRITTEN
 * rather than inferred, and it is written as a set of ids that `buildFeed`
 * filters out at the end.
 *
 * ⚠ THIS SET IS NOT ALLOWED TO GROW WITHOUT LIMIT. Tracker notifications are
 * keyed `tracker-${id}-${status}`, so a single application moving through five
 * stages mints five distinct ids, and a member who dismisses each one would
 * accumulate ids forever in a store with a hard 5MB ceiling shared with
 * everything else this app keeps on-device. DISMISS_CAP is the bound: the set is
 * trimmed to the most recently dismissed ids, oldest first, which is why this is
 * stored as an ORDERED ARRAY and not as a set. Losing the oldest entry means a
 * notification somebody dismissed months ago could reappear; that is the correct
 * thing to lose, and it is a great deal better than a quota exception on an
 * unrelated write.
 *
 * PER-DEVICE, like every other marker here, for the reason the file header
 * gives: the alternative is a profile write on every dismissal.
 */
export const DISMISSED_KEY = 'esquirely:notifications-dismissed'

/** How many dismissed ids are kept. See the warning above. */
const DISMISS_CAP = 300

/** Oldest first, so the trim in `dismiss` drops the stalest. */
function readDismissedList(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function readDismissedIds(): Set<string> {
  return new Set(readDismissedList())
}

function writeDismissed(list: string[]): Set<string> {
  const capped = list.slice(-DISMISS_CAP)
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(capped))
  } catch {
    // Private browsing, or the quota is full. The row reappears on the next
    // load, which is visibly wrong but not broken, and is the mildest available
    // failure: the alternative is throwing inside a click handler.
  }
  return new Set(capped)
}

/** Dismiss one notification. Returns the new set for the caller's state. */
export function dismiss(id: string): Set<string> {
  const list = readDismissedList()
  // Re-adding an id that is already held would let a repeatedly-dismissed row
  // push everything else out of a capped list on its own.
  if (list.includes(id)) return new Set(list)
  return writeDismissed([...list, id])
}

/**
 * Dismiss every notification currently in the feed.
 *
 * TAKES THE FEED RATHER THAN CLEARING A FLAG, and that is the whole design. A
 * "cleared at" timestamp would be smaller, and it would also silently swallow
 * anything created before it that arrives later — a job row backdated by an
 * import, say. Naming the ids means clearing the panel clears exactly what was
 * on screen when the button was pressed, and a notification that appears a
 * second later is not retroactively deleted by a click that could not have been
 * about it.
 */
export function dismissAll(feed: Notification[]): Set<string> {
  const list = readDismissedList()
  const held = new Set(list)
  return writeDismissed([...list, ...feed.map(n => n.id).filter(id => !held.has(id))])
}

/** Put everything back. Undoes both individual deletes and a clear-all. */
export function restoreDismissed(): Set<string> {
  try {
    localStorage.removeItem(DISMISSED_KEY)
  } catch {
    // Nothing was stored to begin with.
  }
  return new Set()
}

/** The single definition of unread, used by both the badge and the row styling
 *  so the two can never disagree about what is still waiting. */
export function isUnread(n: Notification, seen: number, readIds: Set<string>) {
  if (ACK_KINDS.has(n.kind)) return !readIds.has(n.id)
  return Date.parse(n.at) > seen
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
  welcomedAt: string,
  now = new Date(),
  /* Dismissed ids, filtered out at the very end. Passed in rather than read from
     storage here so this stays a pure function and remains testable and
     server-safe — the same reason `jobs` and `applications` are arguments.
     Defaulted so every existing caller keeps working untouched. */
  dismissed: Set<string> = new Set(),
  /**
   * Published opportunities, adapted to board rows by lib/opportunities.ts.
   *
   * ⚠ A SEPARATE ARGUMENT RATHER THAN PART OF `jobs`, even though the board
   * merges the two. The board merges them because a reader searching for an
   * internship should find one whatever table it came from. The bell is the
   * opposite case: `jobs` here drives the role rows, which are filtered against
   * each reader's saved preferences, and an opportunity has no level and no
   * sector to filter on. Folded into `jobs` it would be silently dropped for
   * anybody who had set a preference, which is most people who have used the
   * quiz. Kept apart, it is announced to everyone.
   *
   * Defaulted to empty so every existing caller keeps working untouched.
   */
  opportunities: any[] = []
): Notification[] {
  const out: Notification[] = []

  // 0. The welcome. Always present, dated to the account's creation (see the
  //    caller), so it sits at the top on day one and is pushed down by real
  //    events after that rather than being pinned forever — and so a
  //    returning user never sees it as new again.
  out.push({
    id: 'welcome',
    kind: 'welcome',
    title: 'Welcome to Esquirely',
    detail: 'A note from Bolu & Ipinu',
    at: welcomedAt,
  })
  /* 0b. The current drop. Above the individual role rows on purpose: those are
         filtered to each reader's own preferences and may not include either of
         these, so the announcement has to stand on its own rather than depend
         on the roles beneath it having survived the filter. */
  out.push({
    id: NEW_ROLES.id,
    kind: 'drop',
    title: `${roleCountLabel()} on the board`,
    detail: NEW_ROLES.employersShort.join(' · '),
    at: NEW_ROLES.at,
  })

  /* 0c. The open call to join the team. Sits below the drop because a role at
         a firm is what somebody came here for, and this is us asking them for
         something. It stays in the feed rather than expiring on a date: it is
         open until it is not, and the id is what retires it. */
  out.push({
    id: TEAM_CALL.id,
    kind: 'team',
    title: 'We are opening up the team',
    detail: 'Volunteer positions, open now',
    at: TEAM_CALL.at,
  })

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

  /**
   * 2b. Opportunities closing inside the window.
   *
   * ⚠ kind 'deadline', NOT 'role', and the difference is what the reader is
   * being told. A role row says "here is something you might want"; this says
   * "this shuts on a date". LBVIP is three ordered steps, two of them off the
   * platform, and somebody who reads it the evening before cannot complete it.
   * The red dot that comes with 'deadline' is the honest signal, and it needs
   * no new rendering: the bell already knows this kind.
   *
   * NOT FILTERED BY PREFERENCES, unlike the role rows above. There is nothing
   * sensible to filter on. LBVIP has no level, because it is open to students,
   * graduates and new wigs at once, and any band we invented would hide it from
   * two of the three groups the firm named.
   *
   * Dated the same way a scholarship deadline is, to the moment it entered the
   * window, so it surfaces once and then ages out of unread rather than
   * re-alerting every time the panel is opened.
   */
  for (const o of opportunities) {
    if (!o?.deadline || !o?.slug) continue
    const d = new Date(o.deadline)
    if (Number.isNaN(d.getTime())) continue
    const days = Math.ceil((d.getTime() - now.getTime()) / 86_400_000)
    if (days < 0 || days > DEADLINE_WINDOW_DAYS) continue
    out.push({
      id: `opportunity-${o.slug}`,
      kind: 'deadline',
      title: o.title,
      detail:
        days === 0 ? 'Closes today' : days === 1 ? 'Closes tomorrow' : `Closes in ${days} days`,
      href: `/jobs/${o.slug}`,
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
    /* Dismissal is applied BEFORE the slice, not after. Filtering the final
       twenty would mean deleting a row shrank the list to nineteen instead of
       pulling the twenty-first up into it, so a member who cleared a few
       notifications would slowly end up with a shorter panel than everybody
       else and no way to tell why. */
    .filter(n => !dismissed.has(n.id))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 20)
}

export function unreadCount(feed: Notification[], seen: number, readIds: Set<string> = new Set()) {
  return feed.filter(n => isUnread(n, seen, readIds)).length
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
