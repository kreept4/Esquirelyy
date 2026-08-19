import Link from 'next/link'
import LogoFrame from '@/components/ui/LogoFrame'
import { OPPORTUNITY_TYPE_LABELS, type ApplicationStep } from '@/lib/opportunities'

/**
 * An opportunity, with its application flow drawn as the ordered thing it is.
 *
 * ⚠ THE STEPS ARE THE POINT OF THIS COMPONENT. A job card can assume one
 * action — press Apply, which opens a URL or a mailbox — and every listing
 * component on this site was built on that assumption. LBVIP has three, they
 * are ordered, and two of them happen somewhere else entirely. Rendering that
 * as a paragraph of prose under a single Apply button is what produces an
 * applicant who records the video, posts it, and never tags the firm, which is
 * a disqualification rather than a formatting problem.
 *
 * So the steps are numbered, drawn as a list, and each one that leaves the
 * platform says so on its face.
 *
 * A SINGLE-STEP ARRAY IS A VALID INPUT and renders as one numbered step. That
 * is what the ship plan means by standard internships reusing this component:
 * there is no separate simple mode to keep in sync, and a listing that gains a
 * second step later needs no change here.
 *
 * ⚠ THE APPLY ROUTE IS ACCOUNT-ONLY, THE DETAIL IS NOT, which is the same split
 * the job detail page makes and for the same reason. Everything needed to
 * decide whether this is worth doing — the topic, the eligibility, the closing
 * date, all three steps — is readable by anyone, including a crawler. The
 * external form URL is not. Note that steps one and two require nothing from
 * us: a signed-out reader can record and post the video today and only needs an
 * account for the last step, which is the honest version of a gate.
 */

function StepList({ steps }: { steps: ApplicationStep[] }) {
  return (
    <ol className="opp-steps">
      {steps.map(s => (
        <li key={s.step} className="opp-step">
          <span className="opp-step-num grotesk-bold" aria-hidden>{s.step}</span>
          <div className="opp-step-body">
            <p className="grotesk-bold opp-step-title">
              {s.title}
              {/* Said on the step itself rather than once at the bottom of the
                  page. A reader working through a list does not go back up to
                  check a caveat, and "this happens somewhere else" changes what
                  they should expect the moment they reach it — including that
                  anything typed there is handled under someone else's policy. */}
              {s.off_platform && (
                <span className="opp-step-off" title="This step happens outside Esquirely">
                  off Esquirely
                </span>
              )}
            </p>
            <p className="grotesk-regular opp-step-detail">{s.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function OpportunityCard({
  opportunity,
  applyHref,
  applyGateHref,
}: {
  opportunity: {
    title: string
    organization: string
    opportunity_type?: string
    type?: string
    location?: string | null
    deadline?: string | null
    description?: string | null
    role_desc?: string | null
    eligibility?: string | null
    application_steps?: ApplicationStep[] | null
    /* String or {handle, url}. See the note on Opportunity in lib/opportunities.ts
       for why LinkedIn forces the second shape to exist. */
    firm_handles?: Record<string, string | { handle: string; url?: string }> | null
    logo_url?: string | null
  }
  /** Null when the reader has no account. Never rendered-and-hidden: a URL in
   *  the markup behind CSS is not a gate. */
  applyHref: string | null
  applyGateHref: string
}) {
  const o = opportunity
  const kind = o.opportunity_type || o.type || ''
  const steps = o.application_steps || []
  const handles = Object.entries(o.firm_handles || {}).filter(([, v]) => !!v)

  /* Written out in full. "23 Aug" is fine in a dense board row where the column
     header says Deadline; on the page somebody is reading to decide whether
     they have time, the year and the weekday are worth the characters. */
  const deadline = o.deadline
    ? new Date(o.deadline).toLocaleDateString('en-NG', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const daysLeft = o.deadline
    ? Math.ceil((new Date(o.deadline).getTime() - Date.now()) / 86_400_000)
    : null

  return (
    <article className="opp-card">
      <header className="opp-head">
        {/* LogoFrame rather than a bare img: it is what gives every mark on the
            site a common cap height and ground, which is why a row of them
            reads as a row. See the note in scripts/normalise-logos.mjs. */}
        {o.logo_url && <LogoFrame src={o.logo_url} alt="" />}
        <div className="opp-head-text">
          <p className="grotesk-regular opp-org">{o.organization}</p>
          <h1 className="opp-title">{o.title}</h1>
          <p className="grotesk-regular opp-meta">
            <span className="opp-kind">{OPPORTUNITY_TYPE_LABELS[kind] || kind}</span>
            {o.location && <span>{o.location}</span>}
          </p>
        </div>
      </header>

      {/* ⚠ THE DEADLINE IS ABOVE THE FOLD AND OUTSIDE THE PROSE, which the ship
          plan asks for in as many words: visible without opening the card. A
          closing date buried in a paragraph is the single most common way a
          careers page wastes somebody's week. The countdown sits beside it
          because a date and a number of days remaining are different facts, and the
          second is the one that makes a reader act today. */}
      {deadline && (
        <div className="opp-deadline" data-urgent={daysLeft !== null && daysLeft <= 7}>
          <span className="grotesk-regular opp-deadline-label">Applications close</span>
          <span className="grotesk-bold opp-deadline-date">{deadline}</span>
          {daysLeft !== null && daysLeft >= 0 && (
            <span className="grotesk-regular opp-deadline-left">
              {/* Drawn by scripts/make-stopwatch-svg.py. Only inside a week, so
                  the mark keeps its meaning: on every deadline it would just be
                  furniture. */}
              {daysLeft <= 7 && (
                <img src="/icons/stopwatch.svg" alt="" className="urgency-mark" width={14} height={14} />
              )}
              {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
            </span>
          )}
        </div>
      )}

      {o.eligibility && (
        <section className="opp-block">
          <h2 className="grotesk-bold opp-h2">Who can apply</h2>
          {/* Quoted as the firm wrote it. This one names three groups and the
              third, new wigs, is the one a summary drops. */}
          <p className="grotesk-regular opp-body">{o.eligibility}</p>
        </section>
      )}

      {(o.description || o.role_desc) && (
        <section className="opp-block">
          <h2 className="grotesk-bold opp-h2">About this opportunity</h2>
          <p className="grotesk-regular opp-body">{o.description || o.role_desc}</p>
        </section>
      )}

      {steps.length > 0 && (
        <section className="opp-block">
          <h2 className="grotesk-bold opp-h2">
            How to apply{steps.length > 1 && <span className="opp-h2-count">{steps.length} steps</span>}
          </h2>
          <StepList steps={steps} />
        </section>
      )}

      {handles.length > 0 && (
        <section className="opp-block">
          <h2 className="grotesk-bold opp-h2">Verify with the firm</h2>
          {/* ⚠ THE HANDLES ARE HERE TO BE CHECKED AGAINST, NOT AS DECORATION.
              Step two asks the applicant to tag the firm publicly, so tagging
              the wrong account is a wasted entry rather than a cosmetic error —
              and this firm's X handle is not the same word as its Instagram
              one, which is exactly the trap. */}
          <p className="grotesk-regular opp-body opp-handles-note">
            Check this against the firm&rsquo;s own posts before you submit anything. The handles
            are not identical across platforms.
          </p>
          <ul className="opp-handles">
            {handles.map(([platform, value]) => {
              /* Two accepted shapes. A bare string is the original one and is
                 still read, so an older row does not render blank; the object
                 carries a checked URL alongside the handle. See the note in the
                 seed script for why the URL cannot simply be built from the
                 handle: this firm's LinkedIn vanity is not its @name, and the
                 templated guess answers 404. */
              const handle = typeof value === 'string' ? value : value.handle
              const url = typeof value === 'string' ? null : value.url
              const label = (
                <>
                  <span className="grotesk-regular opp-handle-platform">{platform}</span>
                  <span className="grotesk-bold opp-handle-name">
                    {handle.startsWith('@') || handle.includes(' ') ? handle : `@${handle}`}
                  </span>
                </>
              )
              return (
                <li key={platform}>
                  {url ? (
                    /* noreferrer as well as noopener: these go to the firm's own
                       accounts, and there is no reason to hand a third party the
                       referring URL of a page somebody is reading privately. */
                    <a className="opp-handle opp-handle-link" href={url} target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  ) : (
                    <span className="opp-handle">{label}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <footer className="opp-apply">
        {applyHref ? (
          <>
            <a
              className="grotesk-bold apply-card-cta opp-apply-btn"
              href={applyHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open the application form
            </a>
            <p className="grotesk-regular opp-apply-note">
              This opens the firm&rsquo;s form on Google Forms. Anything you enter there is handled
              under Google&rsquo;s and the firm&rsquo;s own policies rather than ours.
            </p>
          </>
        ) : (
          <>
            <Link className="grotesk-bold apply-card-cta opp-apply-btn" href={applyGateHref}>
              Sign in to open the form
            </Link>
            {/* Honest about what the account is and is not needed for. The
                alternative — a bare "sign in to apply" — reads as though the
                whole opportunity is behind the wall when two thirds of it is
                not. */}
            <p className="grotesk-regular opp-apply-note">
              You do not need an account for the first two steps. Record and post your video
              now if the deadline is close, and sign in when you are ready to submit the form.
            </p>
          </>
        )}
      </footer>
    </article>
  )
}
