import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { TEAM, AMBASSADORS, type Person } from './people'

export const metadata = {
  title: 'About us',
  description:
    'Who builds Esquirely: two co-founders, a creative designer, and the honorary ambassadors who shaped it.',
}

/**
 * About us.
 *
 * Amber masthead, cream body, like every other inner page. An earlier version
 * ran amber the whole way down; at that length it stopped being a colour and
 * became a wall.
 *
 * Deliberately no biographies. Every name here belongs to a real person, and
 * writing a paragraph of career summary for each of them from nothing would be
 * inventing facts about identifiable people on a page that presents itself as a
 * record of who built this. Names, roles, and a link they control.
 */

const INK = '#241F16'

/** Shared marker, defined once and referenced by every connector. */
function ArrowDefs({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 16 16" refX="11" refY="8" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M2 1.5 L13 8 L2 14.5" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </marker>
    </defs>
  )
}

/**
 * The link between two people in the team row.
 *
 * A straight run of dots: a round-capped stroke on a ZERO-length dash with a
 * wide gap, so it draws as dots rather than as a dashed line. Zero rather than
 * the 0.1 this used to carry — see the note on Connector in
 * src/components/features/EverythingYouNeed.tsx for why the difference is
 * visible on a phone and not on a desktop. Arrowheads at both ends, because the
 * relationship is not directional — nobody leads to anybody, they run alongside
 * each other.
 *
 * Two orientations, swapped by the breakpoint rather than one hidden. A
 * left-to-right sweep between columns that have stacked points at nothing.
 */
function PeerLink() {
  return (
    <div className="about-link" aria-hidden>
      <svg viewBox="0 0 180 40" fill="none" className="about-link-h" style={{ overflow: 'visible' }}>
        <path d="M14 20 H166" stroke={INK} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="0 9" shapeRendering="geometricPrecision" markerStart="url(#aboutHeadH)" markerEnd="url(#aboutHeadH)" />
      </svg>
      <svg viewBox="0 0 40 130" fill="none" className="about-link-v" style={{ overflow: 'visible' }}>
        <path d="M20 12 V118" stroke={INK} strokeWidth="4.4" strokeLinecap="round" strokeDasharray="0 9" shapeRendering="geometricPrecision" markerStart="url(#aboutHeadV)" markerEnd="url(#aboutHeadV)" />
      </svg>
    </div>
  )
}

const LinkedInMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="about-li-mark">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
  </svg>
)

/**
 * One person.
 *
 * The whole card is the link when a profile exists, and the LinkedIn mark sits
 * beneath the role as the visible affordance. With no profile the card renders
 * as a plain block rather than as a dead link, so a missing URL degrades to
 * something correct instead of to a control that does nothing.
 */
function PersonCard({ person, className = '' }: { person: Person; className?: string }) {
  const body = (
    <>
      <span className="display-black about-card-name">{person.name}</span>
      <span className="grotesk-regular about-card-role">{person.role}</span>
      {person.linkedin && (
        <span className="about-li">
          <LinkedInMark />
          <span className="grotesk-regular about-li-label">LinkedIn</span>
        </span>
      )}
    </>
  )

  if (!person.linkedin) {
    return <div className={`about-card ${className}`}>{body}</div>
  }

  return (
    <a
      href={person.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className={`about-card about-card-link ${className}`}
    >
      {body}
    </a>
  )
}

export default function AboutPage() {
  return (
    <>
      <main className="page-main doc-page">
        <header className="doc-masthead">
          <div className="shell doc-masthead-inner">
            <h1 className="display-black doc-title">About us.</h1>
            <p className="grotesk-regular doc-lede">
              Esquirely is where Nigerian lawyers and law students find what is genuinely open to
              them. Associate and trainee roles at the firms in our directory, graduate programmes
              across West Africa, legal internships at institutions like the World Bank and the
              ECOWAS Commission, and postgraduate scholarships in the UK, the Netherlands and
              Canada. Nigerian by audience, not by border.
            </p>
            <p className="grotesk-regular doc-lede">
              The hard part was never finding opportunities. It is working out which ones are real.
              Most scholarships advertised as open to Africans fund subjects no lawyer can study.
              Most boards still list roles that closed weeks ago. So we check every entry against
              the organisation&rsquo;s own page, record the deadline they actually publish, and say
              plainly when something is unpaid, restricted by nationality, or needs a letter from
              your faculty before you are eligible. When a thing does not survive that check, it
              does not go up.
            </p>
            <p className="grotesk-bold doc-signoff">Stick with us, we are just getting started.</p>

            <p className="grotesk-bold about-est">EST. 2026</p>
          </div>
        </header>

        <div className="shell about-body">
          <section className="about-section">
            <p className="grotesk-bold about-section-title">The team</p>

            <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
              <ArrowDefs id="aboutHeadH" />
              <ArrowDefs id="aboutHeadV" />
            </svg>

            {/* One row, each pair joined by the same dotted link. */}
            <div className="about-team">
              {TEAM.map((p, i) => (
                <div key={p.name} className="about-team-cell">
                  {i > 0 && <PeerLink />}
                  <PersonCard person={p} />
                </div>
              ))}
            </div>

            <p className="grotesk-regular about-note">We are still expanding.</p>
          </section>

          <section className="about-section">
            <p className="grotesk-bold about-section-title">Honorary ambassadors</p>
            <p className="grotesk-regular about-section-note">
              The people who told us what was wrong with this while it was still worth changing.
            </p>

            <div className="about-grid">
              {AMBASSADORS.map(p => (
                <PersonCard key={p.name} person={p} className="about-card-amb" />
              ))}
            </div>
          </section>

          <section className="about-section">
            <p className="grotesk-bold about-section-title">Join them</p>
            <p className="grotesk-regular about-outro">
              Campus ambassador applications are open, and the terms are published rather than
              negotiated. If something here is wrong, thin or useless for your faculty, that is the
              thing we most want to hear.
            </p>
            <div className="about-actions">
              <Link href="/ambassador" className="grotesk-bold about-cta">
                Be an ambassador
              </Link>
              <Link href="/contact" className="grotesk-regular about-alt">
                Or just tell us what is missing
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
