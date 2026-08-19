import Link from 'next/link'
import LogoFrame from '@/components/ui/LogoFrame'
import { OPPORTUNITY_TYPE_LABELS } from '@/lib/opportunities'

/**
 * The featured opportunities block on the jobs board.
 *
 * ⚠ THIS IS A SHOP WINDOW, NOT THE STOCK. Every row here is also in the board
 * below, because lib/opportunities.ts adapts opportunities into board rows so
 * the search box and type filter can find them. This block exists on top of
 * that, for the reader who arrives without a query and would otherwise scroll
 * past a programme closing this week because it sorted underneath older jobs.
 *
 * The duplication is the point and should not be "fixed" by removing the rows
 * from the board: filtering to Internship and not finding the internship you
 * just saw featured is a worse bug than seeing it twice.
 *
 * IT RENDERS NOTHING WHEN THERE IS NOTHING, rather than an empty state. An
 * empty featured block is a promise the page did not keep; the board underneath
 * is already the complete answer.
 *
 * `id="opportunities"` is the anchor the Opportunities menu entry points at.
 * See the note in Navbar.tsx for why that is an anchor rather than a route.
 */
export default function FeaturedOpportunities({
  opportunities,
}: {
  opportunities: Array<{
    id: string
    slug: string
    title: string
    employer: string
    opportunity_type?: string
    location?: string | null
    deadline?: string | null
    eligibility?: string | null
    logo_url?: string | null
    application_steps?: Array<unknown> | null
  }>
}) {
  if (!opportunities.length) return null

  return (
    <section id="opportunities" className="feat-opps" aria-labelledby="feat-opps-h">
      <div className="shell">
        {/* ⚠ AN EYEBROW, NOT A SECOND PAGE HEADING. This was an h2 at
            clamp(1.4rem, 3vw, 1.9rem) over a two line paragraph, which gave a
            block holding one card more visual weight than the board it sits on
            and read as a competing masthead directly under the real one. The
            heading stays for the anchor and for screen readers; it is simply no
            longer shouting. The count carries the information the paragraph was
            carrying, in four words instead of thirty. */}
        <div className="feat-opps-head">
          <h2 id="feat-opps-h" className="grotesk-bold feat-opps-title">
            Opportunities
            <span className="feat-opps-count">
              {opportunities.length === 1 ? '1 open' : `${opportunities.length} open`}
            </span>
          </h2>
        </div>

        <ul className="feat-opps-list">
          {opportunities.map(o => {
            const days = o.deadline
              ? Math.ceil((new Date(o.deadline).getTime() - Date.now()) / 86_400_000)
              : null
            const steps = o.application_steps?.length ?? 0
            return (
              <li key={o.id} className="feat-opp">
                <Link href={`/jobs/${o.slug}`} className="feat-opp-link">
                  <div className="feat-opp-top">
                    {o.logo_url && <LogoFrame src={o.logo_url} alt="" />}
                    <div className="feat-opp-heads">
                      <p className="grotesk-regular feat-opp-org">{o.employer}</p>
                      <p className="grotesk-bold feat-opp-name">{o.title}</p>
                    </div>
                  </div>

                  {o.eligibility && (
                    <p className="grotesk-regular feat-opp-elig">{o.eligibility}</p>
                  )}

                  <div className="feat-opp-foot">
                    <span className="feat-opp-kind">
                      {OPPORTUNITY_TYPE_LABELS[o.opportunity_type || ''] || 'Opportunity'}
                    </span>
                    {steps > 1 && (
                      <span className="grotesk-regular feat-opp-steps">{steps} steps to apply</span>
                    )}
                    {/* ⚠ THE COUNTDOWN, NOT JUST THE DATE. The ship plan asks
                        for the deadline to be visible without opening the card,
                        and "23 August" only answers that for a reader who is
                        already counting. Days remaining is the number that
                        makes somebody act today, and it cannot go stale because
                        it is derived rather than written. */}
                    {days !== null && days >= 0 && (
                      <span className="feat-opp-days" data-urgent={days <= 7}>
                        {/* The stopwatch replaces a solid red lozenge. A filled
                            block was the loudest object on a page made of cream,
                            ink, amber and mint, and read as an alert bolted on
                            rather than as part of the design. The mark says
                            "time" at a glance and lets the type stay quiet.
                            Drawn by scripts/make-stopwatch-svg.py. */}
                        {days <= 7 && (
                          <img src="/icons/stopwatch.svg" alt="" className="urgency-mark" width={14} height={14} />
                        )}
                        {days === 0 ? 'Closes today' : days === 1 ? '1 day left' : `${days} days left`}
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
