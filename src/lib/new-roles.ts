/**
 * The current roles drop, named in one place.
 *
 * Four surfaces announce the same openings: the notification bell, the news
 * carousel, the modal behind the bell and the email. Each of them would
 * otherwise carry its own copy of the slugs, the count and the wording, and the
 * failure mode of that is not a crash. It is a carousel slide promising three
 * roles while the board filters to four, weeks after anybody remembers which
 * file is right.
 *
 * WHY SLUGS AND NOT A DATE WINDOW. "Everything added in the last seven days"
 * looks tidier and quietly changes meaning every day it is left alone: the
 * email says two roles, the reader opens it on Friday, and the link now shows
 * four or none. A named list says the same thing forever, which is what an
 * announcement has to do.
 *
 * ⚠ THE PROSE LIVES WITH THE SLUG IT DESCRIBES. This used to be three parallel
 * lists, `slugs` and `employers` here and a hand-written summary sentence in
 * NotificationBell, and they drifted exactly as you would expect: Ovie Obobolo
 * was on the board and in the ball pit from 10 August but was never added here,
 * so every surface counted three roles while four had gone up, and the bell's
 * summary described three seats that did not include theirs. One entry per role
 * now, with its own line, and `slugs`, `employers` and the count all derived. A
 * role cannot be added to the drop without its own sentence coming with it.
 *
 * Replacing the `roles` array is the whole of announcing the next drop. Bump
 * `id`, since that is what decides whether somebody has already dismissed it.
 */

/**
 * One entry per role.
 *
 * `line` is FACTS, IN THE ORDER SOMEBODY DECIDES BY: where, what level, what
 * work, how to apply, when it closes. An earlier version of these editorialised
 * instead, on the theory that a description should sell the role. It said a seat
 * meant "running matters rather than supporting them", which is a flourish, and
 * it took the space where the reader was looking for a location and a deadline.
 *
 * `short` is the same role in a clause, for the bell, where four full lines
 * would not fit. Both are written out rather than one being trimmed from the
 * other, because a truncated sentence loses the deadline first.
 *
 * The test for anything on this list: could a reader act on it without opening
 * the board.
 */
export const ROLE_ENTRIES = [
  {
    slug: 'babalakin-senior-associate-energy',
    employer: 'Babalakin & Co',
    title: 'Senior Associate, Energy & Extractive Industries',
    line: 'Lagos, senior level. Energy, oil and gas, and extractive industries work. Applications go through the firm’s recruitment portal, and there is no closing date on it yet.',
    short: 'a senior energy seat in Lagos',
  },
  {
    slug: 'zyph-legal-legal-associate',
    employer: 'Zyph Legal',
    title: 'Legal Associate',
    line: 'Fully remote, full time, open to lawyers newly called to the Bar. Technology, corporate and commercial work. Apply by email with a CV and a short cover note. Closes 20 August.',
    short: 'a fully remote associate open to lawyers newly called',
  },
  {
    slug: 'pentagon-partners-associate-grc',
    employer: 'Pentagon Partners',
    title: 'Associate, Governance, Risk & Compliance',
    line: 'Lagos and Owerri. Governance, risk and compliance work, open to anyone from one to ten years post call. Applications are reviewed as they arrive.',
    short: 'governance and compliance work open from one to ten years post call',
  },
  {
    slug: 'ovie-obobolo-associate',
    employer: 'Ovie Obobolo & Co',
    title: 'Associate',
    line: 'Yaba, Lagos. One to two years post call. Dispute resolution, arbitration and tax. Send a CV and an application letter to hello@ovieobobolo.com. Closes 16 August.',
    short: 'a Yaba dispute resolution seat at one to two years post call',
  },
] as const

export const NEW_ROLES = {
  /** Changing this makes the notification unread again for everybody, which is
   *  correct when the drop itself changes: Ovie Obobolo joined the drop on
   *  12 August, so somebody who read the old note has not seen this one. */
  id: 'roles-2026-08-10d',
  /** ISO. Sorts the notification and dates the carousel slide. All four roles
   *  went on the board on 10 August; only the announcement was short. */
  at: '2026-08-10T12:00:00.000Z',
  slugs: ROLE_ENTRIES.map(r => r.slug),
  employers: ROLE_ENTRIES.map(r => r.employer),
} as const

/* THE ANNOUNCEMENT EMAIL IS NOT RETROACTIVE, and that is fine. It went out
   naming two roles, and its button carries those two slugs in the URL it was
   sent with, so a recipient clicking it still sees exactly what they were
   promised. The site moves on to four; the email stays a record of what was
   true when it was sent. Editing this constant does not and cannot rewrite a
   message already in somebody's inbox. */

export const NEW_ROLES_COUNT = ROLE_ENTRIES.length

/** The board, filtered to exactly these listings. Read by JobsClient. */
export const NEW_ROLES_HREF = `/jobs?roles=${NEW_ROLES.slugs.join(',')}`

/**
 * The employers, as a sentence. "A, B, C and D".
 *
 * Written here rather than at each call site because two of them were building
 * it inline with slice(0, -1) and an index, which reads as an off-by-one waiting
 * to happen and produced "Zyph Legal and and Pentagon Partners" the first time
 * the list had one entry.
 */
export function employerSentence(): string {
  const names = [...NEW_ROLES.employers]
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/**
 * The roles as one clause list, for the bell.
 *
 * Oxford-comma-free and deliberately not ending in a full stop, so the caller
 * decides how the sentence finishes.
 */
export function roleSummary(): string {
  const parts = ROLE_ENTRIES.map(r => r.short)
  if (parts.length <= 1) return parts[0] ?? ''
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}
