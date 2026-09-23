import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import JsonLd, { breadcrumb } from '@/components/seo/JsonLd'
import {
  scholarshipBySlug,
  scholarshipSlugs,
  allScholarships,
  daysUntilDeadline,
} from '@/lib/scholarships-data'

/**
 * One scholarship.
 *
 * Built on the job detail page's shape, which is what was asked for: a header
 * carrying the title and the facts that decide whether to read on, the prose
 * and the criteria in the main column, and the single thing the page wants you
 * to do in a card beside them.
 *
 * ⚠ IT REUSES THE job-* CLASSES RATHER THAN CLONING THEM UNDER sch-detail-*.
 * The requirement is that this looks like a job listing, so the alternative is
 * a couple of hundred lines of CSS whose only job is to render the identical
 * box under a different name, plus two copies of a responsive layout that then
 * have to be kept in step by hand. The names read as generic detail-page
 * furniture here, not as a claim that a scholarship is a job.
 *
 * ⚠ NO APPLY GATE, UNLIKE THE JOB PAGE, AND THAT IS NOT AN OVERSIGHT. A job
 * nulls applyHref for signed-out readers because some listings are public and
 * the apply route is the thing being protected. /scholarships is not in
 * PUBLIC_PATHS at all, so nobody reaches this page without a session and there
 * is no signed-out case to gate. A gate here would be a toll booth on a door
 * that is already locked.
 *
 * ⚠ AND NO SCHEMA BEYOND THE BREADCRUMB, for the same reason. A crawler is
 * bounced to the login page before it reads a line of this, so a rich schema
 * describing an award nobody can crawl is furniture. The breadcrumb stays
 * because the in-page trail is built from it.
 */

export const revalidate = 3600

export function generateStaticParams() {
  return scholarshipSlugs().map(slug => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const s = scholarshipBySlug(slug)
  if (!s) return {}
  return {
    title: `${s.title} | Scholarships`,
    description: s.description.slice(0, 200),
    alternates: { canonical: `/scholarships/${slug}` },
  }
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  upcoming: 'Upcoming',
  closed: 'Closed',
}
const STATUS_CLASS: Record<string, string> = {
  open: 'is-open',
  upcoming: 'is-upcoming',
  closed: 'is-closed',
}

export default async function ScholarshipPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const s = scholarshipBySlug(slug)
  if (!s) notFound()

  const days = daysUntilDeadline(s)
  /* Only while it is genuinely open. A countdown on a closed award is noise,
     and on an upcoming one it counts down to a date the reader cannot act on,
     which is the mistake closingScholarships exists to avoid. */
  const showCountdown = s.status === 'open' && days !== null && days >= 0

  /* Other open awards, so a closed page is a route onward rather than a wall.
     The same slot the job page gives to more roles. */
  const alsoOpen = allScholarships()
    .filter(o => o.slug !== s.slug && o.status === 'open')
    .slice(0, 4)

  return (
    <>
      <JsonLd data={[breadcrumb([
        { name: 'Home', path: '/' },
        { name: 'Scholarships', path: '/scholarships' },
        { name: s.title, path: `/scholarships/${s.slug}` },
      ])]} />

      <main className="jobs-page">
        <header className="jobs-header job-detail-header">
          <div className="shell">
            <Link href="/scholarships" className="grotesk-regular job-back">
              <ArrowLeft size={14} /> All scholarships
            </Link>

            <div className="job-detail-id">
              <div>
                {/* Status leads, exactly as it does on the board. A closed
                    scholarship is worthless and that should be visible before
                    the name is read, which is the one place this header
                    deliberately departs from the job one. */}
                <span className={`sch-status sch-status-detail ${STATUS_CLASS[s.status] ?? ''}`}>
                  <span className={`sch-mark sch-mark-${s.status}`} aria-hidden />
                  {STATUS_LABEL[s.status] ?? s.status}
                </span>
                <h1 className="display-black job-detail-title">{s.title}</h1>
                <p className="grotesk-regular job-detail-employer">{s.provider}</p>
              </div>
            </div>

            <dl className="job-facts">
              <div>
                <dt className="grotesk-regular">Region</dt>
                <dd className="grotesk-bold">{s.region}</dd>
              </div>
              <div>
                <dt className="grotesk-regular">Level</dt>
                <dd className="grotesk-bold">{s.level}</dd>
              </div>
              <div>
                <dt className="grotesk-regular">Funding</dt>
                <dd className="grotesk-bold">{s.funding}</dd>
              </div>
              <div>
                <dt className="grotesk-regular">Deadline</dt>
                <dd className="grotesk-bold">
                  {s.deadline}
                  {showCountdown && (
                    <span className="job-days-left" data-urgent={days <= 7}>
                      {days === 0 ? 'Closes today' : days === 1 ? '1 day left' : `${days} days left`}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="shell job-detail-body">
          <div className="job-detail-main">
            <section>
              <h2 className="grotesk-bold job-section-heading">What it covers</h2>
              <p className="grotesk-regular job-prose">{s.description}</p>
            </section>

            {s.eligibility.length > 0 && (
              <section>
                <h2 className="grotesk-bold job-section-heading">Who can apply</h2>
                <ul className="job-reqs">
                  {s.eligibility.map((e, i) => (
                    <li key={i} className="grotesk-regular">{e}</li>
                  ))}
                </ul>
                {/* ⚠ SAID ON EVERY ONE OF THESE PAGES. The criteria are
                    summarised from the provider's own rules and those change
                    every cycle. The provider is the authority on who is
                    eligible; this page is how somebody finds out the award
                    exists at all. */}
                <p className="grotesk-regular job-note">
                  These are the provider&rsquo;s own rules, shortened. They change from one year to
                  the next, so read{' '}
                  <a href={s.link} target="_blank" rel="noopener noreferrer" className="job-note-link">
                    their page
                  </a>{' '}
                  before you apply.
                </p>
              </section>
            )}

            {alsoOpen.length > 0 && (
              <section>
                <h2 className="grotesk-bold job-section-heading">Other scholarships open now</h2>
                <ul className="sch-also">
                  {alsoOpen.map(o => (
                    <li key={o.slug}>
                      <Link href={`/scholarships/${o.slug}`} className="sch-also-link">
                        <span className="grotesk-bold">{o.title}</span>
                        <span className="grotesk-regular sch-also-meta">{o.provider}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="job-apply-wrap">
            <div className="apply-card">
              <p className="grotesk-bold apply-card-title">Applying</p>

              {s.status === 'closed' ? (
                /* No link on a closed award. Sending somebody to a provider's
                   page for a cycle that has shut wastes their time and reads as
                   a listing nobody checked, which is the thing this site claims
                   not to be. Most of these run yearly, so the useful answer is
                   when to come back. */
                <p className="grotesk-regular apply-card-note">
                  This round has closed. Most of these run every year, so it is worth checking back
                  with the provider before the next one opens.
                </p>
              ) : (
                <>
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grotesk-bold apply-card-cta"
                  >
                    {s.status === 'upcoming' ? 'See the details' : 'Apply now'}{' '}
                    <ExternalLink size={14} />
                  </a>
                  <p className="grotesk-regular apply-card-note">
                    {s.status === 'upcoming'
                      ? 'This one has not opened yet. The provider posts the dates on their own page.'
                      : 'You apply on the provider’s own site. Nothing about the application happens here.'}
                  </p>
                </>
              )}

              <p className="grotesk-regular apply-card-note">{s.deadline}</p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
