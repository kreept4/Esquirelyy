import Link from 'next/link'
import LogoFrame from '@/components/ui/LogoFrame'
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

type Row = {
  id: string
  slug: string
  title: string
  employer: string
  deadline?: string | null
  is_rolling?: boolean
  logo_url?: string | null
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
            /* An opportunity prints its precise kind; a job prints nothing here,
               because the board row beneath already says Full-time and repeating
               it in a card this small is noise. */
            const kind = r.is_opportunity
              ? OPPORTUNITY_TYPE_LABELS[r.opportunity_type || ''] || 'Opportunity'
              : null
            return (
              <li key={r.id}>
                <Link href={`/jobs/${r.slug}`} className="feat-opp-link">
                  <div className="feat-opp-top">
                    {r.logo_url && <LogoFrame src={r.logo_url} alt="" />}
                    <div className="feat-opp-heads">
                      <p className="grotesk-regular feat-opp-org">{r.employer}</p>
                      <p className="grotesk-bold feat-opp-name">{r.title}</p>
                    </div>
                  </div>

                  {r.eligibility && (
                    <p className="grotesk-regular feat-opp-elig">{r.eligibility}</p>
                  )}

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
