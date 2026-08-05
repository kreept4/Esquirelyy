import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { logoForEmployer, ballBgForEmployer } from '@/lib/firms-data'

export const revalidate = 0

/**
 * A single role.
 *
 * Rebuilt to match the board. Same ink header over white body, same rule about
 * tiny uppercase words: the old page opened with a run of them (LAW FIRM /
 * TIER 1 / FULL-TIME / VERIFIED / CLOSING SOON) and then used 0.65rem uppercase
 * for every section heading, so "About the Organisation" was smaller than the
 * text beneath it. Headings are Schibsted at a readable size now, and the
 * status words are gone.
 *
 * The apply panel is the carton card: #FFF8E5 with a 1.5px ink border and the
 * hard offset shadow, the same object the home page uses for its feature
 * blocks. This is the one place on an inner page that earns it, because it is
 * the single thing the page is asking you to do.
 *
 * Fonts follow the two-family rule: Hanken carries the role title and nothing
 * else; Schibsted carries every heading, label and paragraph.
 */

const TYPE_LABELS: Record<string, string> = {
  job: 'Full-time',
  internship: 'Internship',
  clerkship: 'Clerkship',
  fellowship: 'Fellowship',
}
/** No PQE ranges here. They were our banding rather than the employer's, and a
 *  candidate who reads "3 to 6 years" as a rule self-selects out of a job the
 *  firm might well have wanted them for. Where a posting states a real minimum
 *  it appears under Eligibility, in the employer's own terms. */
const LEVEL_LABELS: Record<string, string> = {
  student: 'Law student',
  nysc: 'Entry-level',
  junior: 'Entry-level',
  mid: 'Mid-level',
  senior: 'Senior',
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'the', 'plc', 'inc', 'inc.'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

/** `requirements` is a TEXT column, but earlier code treated it as an array and
 *  called .map on it. Accept either, so a newline-separated string renders as a
 *  list instead of throwing or rendering as one run-on paragraph. */
function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|(?:^|\s)[•\-•]\s+/)
      .map(s => s.trim())
      .filter(Boolean)
  }
  return []
}

function longDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

// `params` is a Promise in Next 16 — see the note on the firm detail page.
export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { data: job } = await supabase.from('jobs').select('*').eq('slug', slug).single()
  if (!job) return notFound()

  const applyHref =
    job.apply_url || (job.apply_email ? `mailto:${job.apply_email}?subject=Application: ${job.title}` : null)
  const logo = logoForEmployer(job.employer)
  const brand = ballBgForEmployer(job.employer)
  const requirements = toList(job.requirements)

  const closes = job.is_rolling ? 'Rolling applications' : job.deadline ? longDate(job.deadline) : 'Open'

  return (
    <div>
      <main className="jobs-page">
        <header className="jobs-header job-detail-header">
          <div className="shell">
            <Link href="/jobs" className="grotesk-regular job-back">
              <ArrowLeft size={14} /> All jobs
            </Link>

            <div className="job-detail-id">
              <span className="job-mark job-detail-mark" style={brand ? { background: brand, borderRadius: '10px' } : undefined}>
                {logo ? <img src={logo} alt="" /> : <span className="grotesk-bold">{initials(job.employer)}</span>}
              </span>
              <div>
                <h1 className="display-black job-detail-title">{job.title}</h1>
                <p className="grotesk-regular job-detail-employer">{job.employer}</p>
              </div>
            </div>

            <dl className="job-facts">
              <div>
                <dt className="grotesk-regular">Location</dt>
                <dd className="grotesk-bold">{job.location}</dd>
              </div>
              <div>
                <dt className="grotesk-regular">Type</dt>
                <dd className="grotesk-bold">{TYPE_LABELS[job.type] || job.type}</dd>
              </div>
              <div>
                <dt className="grotesk-regular">Level</dt>
                <dd className="grotesk-bold">{LEVEL_LABELS[job.level] || job.level}</dd>
              </div>
              <div>
                <dt className="grotesk-regular">Closes</dt>
                <dd className="grotesk-bold">{closes}</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="shell job-detail-body">
          <div className="job-detail-main">
            {/* The firm blurb that used to open this page is gone on purpose.
                Someone here has already decided which employer they are looking
                at; what they need is the role. Firm background lives in the
                directory, one click away via the employer link in the header,
                and keeping it in one place stops the two descriptions drifting
                apart. */}
            {/* A short, attributed extract rather than the employer's full copy.
                Nigeria has fair dealing, not fair use: a closed list of purposes
                that does not include republishing a posting so people can read
                it here instead of at the source. Facts are free to state, a
                brief quotation with attribution is defensible, reproducing the
                whole thing is not. */}
            {/* Our copy leads; the employer's words follow as a short quotation.
                role_desc is written by us, `about` holds the capped excerpt. */}
            {job.role_desc && (
              <section>
                <h2 className="grotesk-bold job-section-heading">The role</h2>
                <p className="grotesk-regular job-prose">{job.role_desc}</p>
              </section>
            )}

            {job.about && (
              <section>
                <h2 className="grotesk-bold job-section-heading">In their words</h2>
                <blockquote className="job-extract">
                  <p className="grotesk-regular job-prose">{job.about}</p>
                  <cite className="grotesk-regular job-extract-cite">
                    {job.employer}
                    {job.apply_url && (
                      <>
                        {' · '}
                        <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                          read the full posting
                        </a>
                      </>
                    )}
                  </cite>
                </blockquote>
              </section>
            )}

            {requirements.length > 0 && (
              <section>
                <h2 className="grotesk-bold job-section-heading">Eligibility</h2>
                <ul className="job-reqs">
                  {requirements.map((req, i) => (
                    <li key={i} className="grotesk-regular">
                      {req}
                    </li>
                  ))}
                </ul>
                {/* "the full posting" was plain text asking people to go and
                    check something we gave them no way to reach. */}
                <p className="grotesk-regular job-note">
                  Summarised from the employer&rsquo;s criteria. Check{' '}
                  {applyHref ? (
                    <a href={applyHref} target="_blank" rel="noopener noreferrer" className="job-note-link">
                      the full posting
                    </a>
                  ) : (
                    'the full posting'
                  )}{' '}
                  before applying.
                </p>
              </section>
            )}

            {!job.role_desc && !requirements.length && (
              <section>
                <p className="grotesk-regular job-prose">
                  Full details for this role are on the employer&rsquo;s own posting.
                </p>
              </section>
            )}

            {job.practice_areas?.length > 0 && (
              <section>
                <h2 className="grotesk-bold job-section-heading">Practice areas</h2>
                <div className="job-areas">
                  {job.practice_areas.map((area: string) => (
                    <span key={area} className="tag-chip">
                      {area}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="job-apply-wrap">
            {/* The carton card. One per page, on the only thing the page is
                actually asking you to do. */}
            <div className="apply-card">
              <p className="grotesk-bold apply-card-title">Apply for this role</p>

              {applyHref ? (
                <a href={applyHref} target="_blank" rel="noopener noreferrer" className="grotesk-bold apply-card-cta">
                  {job.apply_url ? 'Apply now' : 'Apply by email'} <ExternalLink size={14} />
                </a>
              ) : (
                <p className="grotesk-regular apply-card-note">
                  No application link was published for this role.
                </p>
              )}

              <p className="grotesk-regular apply-card-note">
                {job.apply_email && (
                  <>
                    Send your CV to{' '}
                    <a href={`mailto:${job.apply_email}`} className="apply-card-mail">
                      {job.apply_email}
                    </a>
                    .{' '}
                  </>
                )}
                {job.is_rolling
                  ? 'Applications are reviewed as they arrive.'
                  : job.deadline
                    ? `Closes ${longDate(job.deadline)}.`
                    : ''}
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
