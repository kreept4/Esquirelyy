import Link from 'next/link'
import LogoFrame from '@/components/ui/LogoFrame'
import { logoForEmployer } from '@/lib/firms-data'
import { OPPORTUNITY_TYPE_LABELS, daysUntil } from '@/lib/opportunities'

/**
 * What is closing soon, whatever table it came from.
 *
 * ⚠ THIS WAS "FEATURED OPPORTUNITIES" AND THAT WAS THE WRONG AXIS. It filtered
 * on `is_opportunity`, so it showed rows because of which table they lived in
 * rather than because of anything a reader cares about. Two problems followed
 * from that and both were reported:
 *
 * It read as redundant. A block headed "Opportunities" sitting on a board of
 * opportunities is answering a question nobody asked. The board already is the
 * opportunities page.
 *
 * And it was wrong by omission. Zyph Legal closes tomorrow and was not in it,
 * because it is a `jobs` row. LBVIP was, and closes in four days. The block was
 * quietly ranking the less urgent thing above the more urgent one on the
 * strength of a schema detail.
 *
 * Sorting and filtering on the deadline fixes both at once. The section now has
 * a reason to exist that the board underneath does not serve: the board is
 * everything, in the order it was added; this is the handful with a clock on
 * them, soonest first.
 */

/** How far ahead counts as soon. A fortnight is long enough to be worth acting
 *  on and short enough that the section stays a handful rather than a second
 *  board. ECOWAS at twelve days is the current edge case and belongs in. */
const WINDOW_DAYS = 14

/** Mirrors TYPE_LABELS in JobsClient. Kept here rather than imported because
 *  that file is the board and this is a card; the two happen to agree today and
 *  are not the same decision. */
const JOB_TYPE_LABELS: Record<string, string> = {
  job: 'Full-time',
  internship: 'Internship',
  clerkship: 'Clerkship',
  fellowship: 'Fellowship',
}

type Row = {
  id: string
  slug: string
  title: string
  employer: string
  deadline?: string | null
  is_rolling?: boolean
  logo_url?: string | null
  location?: string | null
  practice_areas?: string[] | null
  is_opportunity?: boolean
  opportunity_type?: string
  type?: string
  eligibility?: string | null
  application_steps?: Array<unknown> | null
}

/**
 * ⚠ EXPORTED, because the announcement email needs the same answer.
 *
 * An email that names two closing items and a page that shows three is the kind
 * of disagreement nobody notices until a member does. One rule, read by both.
 */
export function closingSoon<T extends Row>(rows: T[]): T[] {
  return rows
    .filter(r => {
      if (r.is_rolling || !r.deadline) return false
      const d = daysUntil(r.deadline)
      return d !== null && d >= 0 && d <= WINDOW_DAYS
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
}

/**
 * The middle line of a job card, standing in for an opportunity's eligibility.
 *
 * Practice areas first, because that is what a reader is choosing on, then
 * where it is. Capped at two areas: three is a list rather than a label, and
 * the card is 19rem wide.
 */
function summarise(r: Row): string {
  const areas = (r.practice_areas || []).slice(0, 2).join(' and ')
  const where = r.location || ''
  if (areas && where) return `${areas}. ${where}.`
  if (areas) return `${areas}.`
  return where ? `${where}.` : ''
}

/** Initials, for an employer with no mark anywhere. Same filtering as the
 *  board's, so the two produce the same letters for the same name. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'the', 'plc', 'inc', 'inc.'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

/**
 * The employer's mark on a card.
 *
 * ⚠ logoForEmployer FIRST, THEN logo_url, AND MISSING THE FIRST HALF IS WHY TWO
 * CARDS HAD NO LOGO. This read `r.logo_url` alone. That column is null on
 * almost every job, because a job's mark is not stored on the row: it is
 * resolved from the employer name against the directory and EMPLOYER_LOGOS,
 * which is what gives every mark on the site a common cap height. So Zyph Legal
 * and ECOWAS rendered blank while LBVIP rendered fine, purely because LBVIP is
 * the one row that carries an explicit path.
 *
 * Both halves are needed and neither is redundant. LBVIP cannot resolve by name
 * at all: its organisation string carries the trading name, "Lekan Bamidele &
 * Co (The Bohemian Firm)", and logoForEmployer matches on exact normalised
 * equality, so the parenthetical defeats it. That is exactly why the seed sets
 * logo_url by hand. The curated mark wins where there is one; the stored path
 * catches the case where there is not.
 *
 * This is the same precedence EmployerMark uses on the board, for the same
 * reasons, written out here rather than imported because that one is sized for
 * a dense table row and this is a card.
 */
function CardMark({ employer, logoUrl }: { employer: string; logoUrl?: string | null }) {
  const url = logoForEmployer(employer) || logoUrl || null
  if (!url) {
    /* Initials rather than nothing. A card with an empty slot where every
       sibling has a mark reads as a failed image, which is worse than a mark we
       never had. */
    return (
      <span className="feat-opp-mark feat-opp-mark-fallback">
        <span className="grotesk-bold">{initials(employer)}</span>
      </span>
    )
  }
  /* No brand-colour tile here, unlike the board row. LogoFrame has no such
     prop: on the board the coloured ground is a wrapper EmployerMark draws for
     marks whose artwork sits on a solid brand field, and none of the employers
     that reach this section have one. If a bank ever closes a role, this is the
     line to revisit. */
  return <LogoFrame src={url} alt="" />
}

export default function ClosingSoon({ rows }: { rows: Row[] }) {
  const items = closingSoon(rows)
  /* Renders nothing when nothing is closing, rather than an empty state. An
     empty block is a promise the page did not keep, and the board underneath is
     already the complete answer. */
  if (!items.length) return null

  return (
    <section id="closing-soon" className="feat-opps" aria-labelledby="closing-soon-h">
      <div className="shell">
        <div className="feat-opps-head">
          <h2 id="closing-soon-h" className="grotesk-bold feat-opps-title">
            Closing soon
            <span className="feat-opps-count">
              {items.length === 1 ? 'next 14 days' : `${items.length} in the next 14 days`}
            </span>
          </h2>
        </div>

        <ul className="feat-opps-list">
          {items.map(r => {
            const days = daysUntil(r.deadline)
            const steps = r.application_steps?.length ?? 0
/* ⚠ A JOB PRINTS ITS KIND TOO, and the first version deliberately did not.
               The reasoning then was that the board row underneath already says
               Full-time, so repeating it here is noise. That was wrong on two
               counts. The card is a standalone object that somebody may act on
               without ever scrolling to the row, so "what is this" should not
               depend on reading something else. And an empty chip row on one
               card beside a filled one is exactly the unevenness this section
               was reported for. */
            const kind = r.is_opportunity
              ? OPPORTUNITY_TYPE_LABELS[r.opportunity_type || ''] || 'Opportunity'
              : JOB_TYPE_LABELS[r.type || ''] || null
            return (
              <li key={r.id}>
                <Link href={`/jobs/${r.slug}`} className="feat-opp-link">
                  <div className="feat-opp-top">
                    <CardMark employer={r.employer} logoUrl={r.logo_url} />
                    <div className="feat-opp-heads">
                      <p className="grotesk-regular feat-opp-org">{r.employer}</p>
                      <p className="grotesk-bold feat-opp-name">{r.title}</p>
                    </div>
                  </div>

                  {/* ⚠ EVERY CARD GETS A LINE HERE, and that is what lets the
                      cards be the same height without one of them looking
                      hollow. An opportunity has an eligibility sentence; a job
                      had nothing at all, so its card was a title, a gap and a
                      deadline. Two fixes were tried before this one: stretching
                      the cards made the job a tall empty box, and letting them
                      size to content made the row ragged. Both were treating a
                      content problem as a layout problem.
                      A job's practice areas and location are what somebody
                      deciding whether to open it actually wants, and they are
                      already on the row. */}
                  <p className="grotesk-regular feat-opp-elig">
                    {r.eligibility || summarise(r)}
                  </p>

                  <div className="feat-opp-foot">
                    {kind && <span className="feat-opp-kind">{kind}</span>}
                    {steps > 1 && (
                      <span className="grotesk-regular feat-opp-steps">{steps} steps to apply</span>
                    )}
                    {days !== null && (
                      <span className="feat-opp-days" data-urgent={days <= 7}>
                        {days <= 7 && (
                          <img src="/icons/stopwatch.svg" alt="" className="urgency-mark" width={16} height={16} />
                        )}
                        {days === 0 ? 'Closes today' : days === 1 ? 'Closes tomorrow' : `${days} days left`}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
