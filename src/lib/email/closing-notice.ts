/**
 * The one listing closing soonest, carried at the top of the roles broadcast.
 *
 * ============================================================
 * WHY THIS SITS ABOVE THE NEW ROLES
 * ============================================================
 *
 * The email is an announcement of what has just gone up, and the reader's own
 * priority is not the same thing. A role added today with no closing date can be
 * applied for next week. A role that shuts in three days cannot. Putting the new
 * ones first is ordering the message by what we did rather than by what costs
 * the reader something to miss, and every send this template does goes out to
 * ninety people at once, so the ordering decision is made ninety times over.
 *
 * So the closing card goes above the role cards, and it is the only block in
 * this email allowed to do that.
 *
 * ============================================================
 * WHY THE COUNT IS DERIVED AND THE BLOCK EXPIRES ITSELF
 * ============================================================
 *
 * ⚠ NEVER WRITE "CLOSES IN 3 DAYS" INTO COPY. It is true for one day. This
 * carries a `deadline` and computes the words at render time through
 * closesInWords(), which is the same function the board and the bell use, so an
 * email sent tomorrow says "Closes in 2 days" without anybody editing anything
 * and all three surfaces agree.
 *
 * The count is done in LAGOS TIME, via daysUntilDay in lib/day.ts. A deadline is
 * a calendar day where the reader lives; counting it in UTC would tell somebody
 * in Lagos that a role closing tomorrow closes today, on the evening it matters
 * most.
 *
 * And it renders nothing once the deadline has passed, for the reason the
 * scholarship block in templates/new-roles.ts already gives at length: this
 * template is reused for every drop, and a hardcoded date becomes a message
 * announcing something that shut weeks ago.
 *
 * ⚠ NOT DERIVED FROM THE JOBS TABLE, AND THAT IS A LIMITATION, NOT A CHOICE.
 * The right version of this reads the board and picks whatever closes soonest,
 * the way closingScholarships() does for funding. The template function is
 * synchronous and is bundled by scripts/send-new-roles.mjs with esbuild for a
 * plain node process, so it has no database handle at render time. Naming the
 * listing here is the honest interim: it is one line to change, it cannot go
 * stale silently because of the guard below, and the alternative was to make the
 * whole template async for one card. If a second listing ever needs this
 * treatment, that is the moment to do the derivation properly.
 */

import { daysUntilDay, closesInWords } from '@/lib/day'

export type ClosingNotice = {
  employer: string
  title: string
  /** ISO date. Drives both the words and the expiry. */
  deadline: string
  /** One or two sentences. What a reader needs to decide, not a description. */
  body: string
  /** Slug on the board, so the button lands on Esquirely rather than the form. */
  slug: string
}

const NOTICE: ClosingNotice | null = {
  employer: 'Heirs Holdings',
  title: '2026 Graduate Trainee Programme',
  deadline: '2026-09-04',
  body:
    'Six months split between Heirs Academy training and live work across the group. Open to any degree at a 2:2, so an LL.B counts. You need NYSC finished with your discharge or exemption certificate in hand, no more than two years since, and to be 27 or under.',
  slug: 'heirs-holdings-graduate-trainee-programme-2026',
}

/**
 * The notice with its day count, or null when there is none or it has closed.
 *
 * `now` is injectable so a send script or a test can pin the date rather than
 * depending on the day the process happens to run.
 */
export function activeClosingNotice(
  now: Date = new Date()
): (ClosingNotice & { days: number; label: string }) | null {
  if (!NOTICE) return null
  const days = daysUntilDay(NOTICE.deadline, now)
  if (days === null || days < 0) return null
  return { ...NOTICE, days, label: closesInWords(days) }
}
