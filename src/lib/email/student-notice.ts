/**
 * One thing worth telling students, carried in the roles broadcast.
 *
 * ============================================================
 * WHY THIS IS A MODULE WITH AN EXPIRY AND NOT THREE LINES OF HTML
 * ============================================================
 *
 * The roles email template is reused for every drop. Its own note on the
 * scholarship block says exactly what goes wrong when something time-limited is
 * typed into it: "a hardcoded scholarship becomes a message announcing a closing
 * date that passed weeks ago". That objection applies with full force here.
 * Greenberg Traurig's deadline is 30 November 2026, and this template will still
 * be sending drops in December.
 *
 * The scholarship block answers it by DERIVING from scholarships-data.ts. This
 * one cannot: Greenberg Traurig is not a scholarship and, deliberately, is not a
 * board listing either, so there is no array to read. So it answers the same
 * objection the other way, with a hard `until` date and a render guard. After
 * that date `activeStudentNotice()` returns null and the block disappears from
 * every subsequent send on its own.
 *
 * ⚠ THE GUARD IS THE POINT. Do not "simplify" this by inlining the copy into
 * new-roles.ts. Without the date check the failure is silent and it is the worst
 * kind: an email that goes to the whole list telling students to apply for
 * something that shut.
 *
 * ⚠ ONE NOTICE, OR NONE. Set to null when there is nothing worth a block. An
 * empty section headed "For students" is worse than no section, same argument
 * the scholarship block makes.
 *
 * WHY GREENBERG TRAURIG IS HERE RATHER THAN ON THE BOARD.
 * It is a London training contract gated on ABB at A-level and run through the
 * SQE, so most of this list cannot apply on entry requirements alone. Putting it
 * in the jobs table would have it counted and filtered alongside seats that are
 * genuinely open to the reader. It is information rather than an application,
 * and this block is where information for a subset of the list belongs.
 *
 * ⚠ THE ENTRY BAR IS IN THE COPY, NOT BEHIND THE LINK. Leading with the salary
 * and letting a reader find the A-level requirement after they have started the
 * form wastes their evening and costs us their trust. Stating it means the
 * readers it does not fit skip it in three seconds.
 */

/** ISO date, inclusive. The notice renders while today is on or before this. */
export type StudentNotice = {
  /** Small uppercase label above the title, like the scholarship block's. */
  kicker: string
  title: string
  body: string
  href: string
  cta: string
  /** ISO. After this date the notice stops rendering. */
  until: string
}

const NOTICE: StudentNotice | null = {
  kicker: 'For students',
  title: 'Greenberg Traurig is taking 2029 trainees',
  body:
    'Their London office has opened applications for training contracts that start in 2029, which is why this is worth reading if you are still at university. Two years, four six-month rotations, starting on 55,000 pounds. You need ABB at A-level and to be on track for a 2:1, and non-law graduates do the PGDL before the SQE. It closes on 30 November 2026.',
  href: 'https://www.gtlaw.com/en/general/careers/law-students/europe-law-students/london-trainee-recruiting',
  cta: 'Check the entry requirements',
  until: '2026-11-30',
}

/**
 * The notice, or null when there is none or it has expired.
 *
 * `now` is injectable so the send scripts and any test can pin a date rather
 * than depending on the day the suite happens to run.
 */
export function activeStudentNotice(now: Date = new Date()): StudentNotice | null {
  if (!NOTICE) return null
  /* Compared as ISO date strings rather than as Date objects on purpose. The
     deadline is a calendar day in the reader's world, not an instant, and
     parsing '2026-11-30' to a Date makes it midnight UTC, which is already the
     previous evening in Lagos. lib/day.ts makes the same argument for the
     board's deadlines. */
  const today = now.toISOString().slice(0, 10)
  return today <= NOTICE.until ? NOTICE : null
}
