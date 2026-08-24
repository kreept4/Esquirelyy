/**
 * Calendar-day arithmetic, in the timezone the readers actually live in.
 *
 * ============================================================
 * ⚠ WHY THIS EXISTS: EVERY COUNTDOWN ON THE SITE WAS AN HOUR FROM BEING WRONG
 * ============================================================
 *
 * Every "N days left" on this site was computed as
 *
 *     Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000)
 *
 * which is a difference between two INSTANTS, measured in UTC. A deadline
 * column holds a plain date, '2026-09-04', which JavaScript reads as midnight
 * UTC. The reader is in Lagos, which is UTC+1 all year round.
 *
 * So between 23:00 and 00:00 UTC every night, Nigeria has already ticked over
 * to the next day and the server has not. Every countdown on the site reads one
 * day too high for that hour. Reported on 25 August 2026: Heirs Holdings showed
 * "11 days left" when a reader in Lagos, on their 25th, counted ten, and the
 * Rhodes deadline showed three days when it had two.
 *
 * It is a one-hour-a-day fault, which is exactly why it survived. It is also
 * the hour when somebody checking a deadline late at night is most likely to be
 * looking, and a countdown that is wrong by a day on a scholarship closing in
 * two is not a rounding error.
 *
 * ============================================================
 * THE FIX IS TO STOP SUBTRACTING INSTANTS AND SUBTRACT DATES
 * ============================================================
 *
 * "How many days until the 4th" is a question about calendars, not about
 * elapsed time. Nobody means "how many 24-hour periods fit between now and
 * midnight UTC on the 4th". They mean "what is today's date where I am, and how
 * many days from that to the 4th".
 *
 * So today's date is resolved IN LAGOS, both dates are turned into day numbers,
 * and the answer is one integer minus another. No hours, no rounding, no ceil
 * deciding the answer, and no dependence on what time of day the page is
 * rendered. A deadline of today is 0 at one minute past midnight and still 0 at
 * half eleven at night.
 *
 * ⚠ Intl, NOT A HARDCODED +1. Nigeria does not observe daylight saving, so
 * `new Date(Date.now() + 3600_000)` would be right today and is a trap: it
 * encodes an offset rather than a place, and the next person to add a second
 * market has to find every copy of it. Asking Intl for the calendar date in a
 * named zone is the thing that is actually meant.
 *
 * 'en-CA' because that locale formats as YYYY-MM-DD, which is the shape the
 * deadline columns already hold, so both sides of the subtraction are parsed
 * the same way.
 *
 * ============================================================
 * WHERE THIS RUNS
 * ============================================================
 *
 * Both sides. The board and the listing page render on the server, where the
 * clock is UTC; the notification bell computes in the browser, where the clock
 * is whatever the reader's device says. Neither is Lagos in any reliable way —
 * a member on a phone set to London gets London — and the two would disagree
 * about the same deadline. Pinning to one named zone makes every surface agree,
 * and makes them agree with the employer, whose closing date is a Nigerian
 * date.
 */

/** The audience. One place, so a second market is one edit rather than a hunt. */
export const SITE_TIMEZONE = 'Africa/Lagos'

const YMD = /^\d{4}-\d{2}-\d{2}/

const lagosFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SITE_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Today's calendar date where the readers are, as YYYY-MM-DD. */
export function today(now: Date = new Date()): string {
  return lagosFormatter.format(now)
}

/**
 * A date string as a whole number of days since the epoch.
 *
 * Parsed as midnight UTC on both sides of every subtraction, so the offset
 * cancels and only the calendar difference is left. Returns null for anything
 * that is not a date, rather than NaN, so a caller cannot render "NaN days".
 */
function dayNumber(ymd: string): number | null {
  const m = YMD.exec(ymd)
  if (!m) return null
  const t = Date.parse(`${m[0]}T00:00:00Z`)
  return Number.isNaN(t) ? null : Math.round(t / 86_400_000)
}

/**
 * Whole calendar days from today until `deadline`, in the site's timezone.
 *
 * 0 means it closes today. Negative means it has passed. Null when there is no
 * deadline, or it is not a date this can read.
 */
export function daysUntilDay(deadline: string | null | undefined, now: Date = new Date()): number | null {
  if (!deadline) return null
  const target = dayNumber(String(deadline))
  const current = dayNumber(today(now))
  if (target === null || current === null) return null
  return target - current
}

/**
 * Whether a closing date is in the past.
 *
 * ⚠ THE DAY OF THE DEADLINE IS NOT PAST. A deadline of today is still open all
 * day, because employers mean end of day when they publish a date, and a
 * listing that vanished at one minute past midnight on its own closing date
 * would take the last day off every applicant. This replaces a `- 86_400_000`
 * grace bolted onto an instant comparison, which was reaching for the same idea
 * by a route that could not express it.
 */
export function hasPassed(deadline: string | null | undefined, now: Date = new Date()): boolean {
  const d = daysUntilDay(deadline, now)
  return d !== null && d < 0
}

/** "Closes today" / "Closes tomorrow" / "Closes in 3 days". */
export function closesInWords(days: number): string {
  return days === 0 ? 'Closes today' : days === 1 ? 'Closes tomorrow' : `Closes in ${days} days`
}

/** "Closes today" / "1 day left" / "3 days left", for a dense board row. */
export function daysLeftWords(days: number): string {
  return days === 0 ? 'Closes today' : days === 1 ? '1 day left' : `${days} days left`
}
