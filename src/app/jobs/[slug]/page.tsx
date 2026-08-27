import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import TrackOnApply from '@/components/features/TrackOnApply'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { logoForEmployer, ballBgForEmployer, ALL_FIRMS } from '@/lib/firms-data'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { isOpenJob } from '@/lib/open-jobs'
import JsonLd, { breadcrumb, jobPostingSchema } from '@/components/seo/JsonLd'
import OpportunityCard from '@/components/features/OpportunityCard'
import {
  fetchOpportunities,
  opportunitySlug,
  hasClosed,
  daysUntil,
  closingLabel,
  type Opportunity,
} from '@/lib/opportunities'

export const revalidate = 0

/** Cookie-less, for the listing row itself. The `jobs` table is readable by
 *  anon, and keeping this separate from the session client means an open
 *  listing renders without waiting on an auth round trip. */
function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

/**
 * Per-role metadata, which this page never had.
 *
 * Every listing shared the site-wide title, so each one went out announcing
 * itself as "Esquirely | Nigeria's Legal Career Platform". That was survivable
 * while the whole board was gated and none of these pages could be indexed. Now
 * that some can be, a search result for a role has to name the role and the
 * employer, and a link pasted into a group chat has to preview as the job.
 *
 * A CLOSED LISTING IS NOINDEXED RATHER THAN LEFT TO THE REDIRECT. A signed-out
 * crawler is bounced to the login page before it reads a line of this, so in
 * practice the directive is never seen. It is here for the case that is easy to
 * forget: a slug added to lib/open-jobs.ts later makes this page crawlable, and
 * the rule that decides it should already be written down in the page rather
 * than discovered to be missing.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  /* Matches the page's own filter below. If the page 404s, its metadata must
     not describe a live role — a share card for a listing that no longer
     exists is worse than no card at all. */
  const { data: job } = await db()
    .from('jobs')
    .select('title, employer, location, role_desc, about')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  /* ⚠ AN OPPORTUNITY IS TRIED BEFORE GIVING UP, and this was missed the first
     time round with real consequences. The page body already fell through to
     fetchOpportunities() and rendered LBVIP correctly, but this function did
     not, so it returned "Role not found" and the listing went out titled that:
     in the browser tab, in the share card of every link pasted into a group
     chat, and in the search result. The page looked perfect and its name was
     wrong, which is exactly the kind of fault that survives a visual check.
     Caught on the preview deployment before the announcement went to eighty
     five people. The rule this leaves behind: a route with two data sources
     needs BOTH of them in generateMetadata, not just the one the body happens
     to try first. */
  if (!job) {
    const opportunity = (await fetchOpportunities()).find(o => opportunitySlug(o) === slug)
    if (!opportunity || hasClosed(opportunity.deadline)) return { title: 'Not found' }

    const closes = opportunity.deadline
      ? new Date(opportunity.deadline).toLocaleDateString('en-NG', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
      : null

    return {
      title: `${opportunity.title} at ${opportunity.organization}`,
      /* Eligibility leads, because it is the fact that decides whether the
         reader keeps reading, and the closing date follows it. Both are more
         use in a search result than the opening line of the description. */
      description: [
        opportunity.eligibility ? `Open to ${opportunity.eligibility.replace(/\.$/, '')}.` : '',
        opportunity.description || '',
        closes ? `Applications close ${closes}.` : '',
      ]
        .filter(Boolean)
        .join(' ')
        .slice(0, 300),
      alternates: { canonical: `/jobs/${slug}` },
      ...(isOpenJob(slug) ? {} : { robots: { index: false, follow: true } }),
    }
  }

  const where = job.location ? ` in ${job.location}` : ''
  const summary = (job.role_desc || job.about || '').trim()

  return {
    title: `${job.title} at ${job.employer}`,
    description: (summary || `${job.title}${where}. Applications through Esquirely.`).slice(0, 300),
    alternates: { canonical: `/jobs/${slug}` },
    ...(isOpenJob(slug) ? {} : { robots: { index: false, follow: true } }),
  }
}

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
/** ⚠ NOT "PQE". Post-qualification experience is an England and Wales term and
 *  it is not what Nigerian lawyers say: the year count here runs from being
 *  called to the Bar, so it is post-call experience. The two are not synonyms
 *  dressed differently, they name different events, and using the English one
 *  on a Nigerian legal careers site reads as copied from a London job board.
 *  No ranges here either. They were our banding rather than the employer's, and a
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

  /* The gate, which used to be a line in middleware.ts and cannot be any more.
   * /jobs is public at that layer now, so "this particular listing is not" is
   * decided here. See lib/open-jobs.ts for which are open and why the list only
   * ever grows.
   *
   * A REDIRECT, NOT A PARTIAL PAGE. The gated firm profile withholds two fields
   * and renders the rest, because a firm's tier and practice areas are worth
   * reading on their own. A listing is not like that: the deadline and the
   * application route ARE the page, and a version of this with those removed is
   * a teaser. So a closed listing does exactly what the middleware did before,
   * down to carrying the path back in `redirect` so the reader lands on the
   * role rather than on the board. */
  /* Read on every request now, not only on a gated listing. The apply route is
     account-only even on the seven public ones (see below), so the page needs
     to know who is asking whatever the slug is. */
  const { data: { user } } = await createSessionClient().auth.getUser()

  if (!isOpenJob(slug) && !user) redirect(`/auth/login?redirect=/jobs/${slug}`)

  /**
   * ⚠ A CLOSED LISTING 404s, AND THAT IS THE HOUSE POSITION RATHER THAN A
   * SHORTCUT. lib/open-jobs.ts settles this in as many words: "If a role
   * genuinely has to come down, delete the listing so the page 404s honestly —
   * a 404 is a clean signal and a gate is not." Delisting is the same event as
   * deleting from a reader's point of view; the difference is only that the row
   * survives so the decision can be undone and audited.
   *
   * The sitemap drops closed slugs for the same reason, so nothing keeps
   * advertising a URL that answers 404.
   */
  const { data: job } = await db().from('jobs').select('*').eq('slug', slug).eq('is_active', true).single()

  /* ⚠ AN OPPORTUNITY IS TRIED BEFORE 404ing, and it reuses this route rather
     than adding /opportunities/[slug]. Pre-flight rule five in the ship plan is
     explicit that opportunities fold into the existing jobs and internships
     surface instead of becoming a new one, and the board already lists them —
     see the note in jobs/page.tsx — so a card here linking to a route that did
     not exist would 404 every opportunity on the board.
     Only reached when the slug is not a job, so this costs the common path
     nothing: a job that exists never issues the second query. */
  if (!job) {
    const opportunity = (await fetchOpportunities()).find(o => opportunitySlug(o) === slug)
    if (!opportunity || hasClosed(opportunity.deadline)) return notFound()
    return (
      <OpportunityPage
        opportunity={opportunity}
        slug={slug}
        canApply={!!user}
      />
    )
  }

  /**
   * TWO DIFFERENT THINGS ARE GATED HERE, AND ONLY ONE OF THEM IS THE PAGE.
   *
   * Whether you may READ this listing is `isOpenJob`, decided above: the seven
   * newest are readable by anyone, including a crawler, and the rest redirect.
   *
   * Whether you may APPLY is this, and it is account-only on every listing. A
   * signed-out reader — and Googlebot — gets the role, the firm, the location,
   * the requirements and the closing date, which is everything needed to decide
   * whether the job is worth wanting. What they do not get is the way in: the
   * employer's URL, the application mailbox, and the tracker hook that comes
   * with pressing Apply.
   *
   * That split is the whole shape of the product. Indexing the description is
   * what brings somebody here; the application route is what the account is
   * for. Publishing both would make the account pointless, and publishing
   * neither would make the page invisible.
   *
   * ⚠ `applyHref` GOES NULL RATHER THAN BEING HIDDEN IN THE MARKUP. It is read
   * in three places — the Apply button, the "full posting" link inside the
   * requirements note, and the mailbox line under the button — and hiding it
   * with CSS or rendering it behind a wrapper would leave the employer's
   * address sitting in the HTML for anyone who pressed View Source, which is
   * not a gate. Nulling it at the source means there is nothing to find.
   */
  const canApply = !!user
  const applyHref = !canApply
    ? null
    : job.apply_url || (job.apply_email ? `mailto:${job.apply_email}?subject=Application: ${job.title}` : null)
  /** Where a signed-out reader is sent instead, landing back on this role. */
  const applyGateHref = `/auth/login?redirect=/jobs/${slug}`
  const logo = logoForEmployer(job.employer)
  const brand = ballBgForEmployer(job.employer)
  const requirements = toList(job.requirements)

  const closes = job.is_rolling ? 'Rolling applications' : job.deadline ? longDate(job.deadline) : 'Open'
  const daysLeft = daysUntil(job.deadline)

  /* The employer's own site, when they are in the directory, so the schema's
     hiringOrganization resolves to a real entity instead of a bare name.
     Matched on the normalised name the same way logoForEmployer does. */
  const employerSite =
    ALL_FIRMS.find(f => {
      const n = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '')
      return n(f.name) === n(job.employer) || n(f.shortName) === n(job.employer)
    })?.website ?? null

  return (
    <div>
      {/* JobPosting ONLY on a listing a stranger can read. See the warning on
          jobPostingSchema: marking up a page that redirects to the login screen
          is a structured data violation, and Google penalises it at the site
          level rather than the page level. The breadcrumb is safe either way and
          is emitted for both. */}
      <JsonLd
        data={[
          ...(isOpenJob(slug) ? [jobPostingSchema(job, employerSite)] : []),
          breadcrumb([
            { name: 'Esquirely', path: '/' },
            { name: 'Jobs', path: '/jobs' },
            { name: job.title, path: `/jobs/${slug}` },
          ]),
        ]}
      />
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
                <dd className="grotesk-bold">
                  {closes}
                  {/* ⚠ THE COUNTDOWN IS THE ONE COMPONENT CARRIED OVER FROM THE
                      OPPORTUNITY PAGE, and the numbering deliberately is not.
                      Numbered markers only earn their place when the content is
                      genuinely a sequence: LBVIP's three application steps are,
                      because step two cannot start before step one. A job's
                      requirements are criteria that all hold at once in no
                      order, so numbering them would be decoration wearing the
                      clothes of structure.
                      A date needs arithmetic the reader would otherwise do
                      themselves, which is exactly what a component should
                      absorb. Derived, so it cannot go stale. */}
                  {daysLeft !== null && daysLeft >= 0 && !job.is_rolling && (
                    <span className="job-days-left" data-urgent={daysLeft <= 7}>
                      {closingLabel(job.deadline)}
                    </span>
                  )}
                </dd>
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
                <RoleProse text={job.role_desc} canApply={canApply} />
              </section>
            )}

            {job.about && (
              <section>
                <h2 className="grotesk-bold job-section-heading">In their words</h2>
                <blockquote className="job-extract">
                  <p className="grotesk-regular job-prose">{job.about}</p>
                  {/* ⚠ READS `applyHref`, NOT `job.apply_url`. This citation
                      linked the raw column and was the one place the gate
                      leaked: the apply card and the requirements note both went
                      null for a signed-out reader while this quietly rendered
                      the employer's careers URL into the HTML anyway, so the
                      gate was one View Source away from nothing. Exactly the
                      failure the warning on `applyHref` describes — there is no
                      second copy of the route to forget now. */}
                  <cite className="grotesk-regular job-extract-cite">
                    {job.employer}
                    {applyHref && job.apply_url && (
                      <>
                        {' · '}
                        <a href={applyHref} target="_blank" rel="noopener noreferrer">
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
                  ) : canApply ? (
                    'the full posting'
                  ) : (
                    /* Signed out, so applyHref is null and the employer's link is
                       not in this page at all. Still tell them to read the
                       original — the advice is the same either way — and point at
                       the one place that can give it to them. */
                    <Link href={applyGateHref} className="job-note-link">
                      the full posting
                    </Link>
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

              {!canApply ? (
                /* The gate, stated plainly. It says what is behind it and what
                   it costs, because "Sign in to continue" on a button somebody
                   has already decided to press reads as a toll rather than as a
                   reason. Free and takes a minute are both true and are the two
                   facts that decide whether they bother. */
                <>
                  <Link href={applyGateHref} className="grotesk-bold apply-card-cta">
                    Sign in to apply
                  </Link>
                  <p className="grotesk-regular apply-card-note">
                    {/* No em dashes, per the copy standard. This read "The
                        application route for this role — the employer's link or
                        address — is for members", where the dashes were doing
                        the work of an apposition. Naming the thing directly is
                        shorter and needs no punctuation to hold it together. */}
                    The employer&rsquo;s link or address is for members. An account is free, takes
                    a minute, and also gets you the tracker and the rest of the board.
                  </p>
                </>
              ) : applyHref ? (
                <TrackOnApply
                  href={applyHref}
                  kind={job.apply_url ? 'external' : 'email'}
                  label={job.apply_url ? 'Apply now' : 'Apply by email'}
                  target={{
                    firm: job.employer,
                    role: job.title,
                    type: job.type === 'internship' ? 'Internship' : 'Full-time',
                    location: job.location,
                    deadline: job.deadline ?? null,
                  }}
                />
              ) : (
                <p className="grotesk-regular apply-card-note">
                  No application link was published for this role.
                </p>
              )}

              <p className="grotesk-regular apply-card-note">
                {canApply && job.apply_email && (
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

/**
 * An opportunity rendered on the jobs detail route.
 *
 * Kept as its own component rather than threaded through the job markup above,
 * because almost none of that markup applies: an opportunity has no salary
 * band, no employer careers site, no requirements list, and its apply route is
 * a multi-step flow rather than a button. Sharing the shell would have meant a
 * dozen conditionals inside a page that is already long, and every one of them
 * would be a place for a job to start rendering an opportunity's field or the
 * reverse.
 *
 * What IS shared is the thing that matters: the route, so a card on the board
 * links to /jobs/{slug} whichever kind of row it came from, and the gate, since
 * `canApply` is decided by the same rule for both.
 */
function OpportunityPage({
  opportunity,
  slug,
  canApply,
}: {
  opportunity: Opportunity
  slug: string
  canApply: boolean
}) {
  return (
    <div>
      <JsonLd
        data={[
          breadcrumb([
            { name: 'Esquirely', path: '/' },
            { name: 'Jobs', path: '/jobs' },
            { name: opportunity.title, path: `/jobs/${slug}` },
          ]),
        ]}
      />
      <main className="opp-page">
        <div className="shell">
          <Link href="/jobs" className="grotesk-regular opp-back">
            <ArrowLeft size={15} /> All roles and opportunities
          </Link>
          <OpportunityCard
            opportunity={opportunity}
            /* Null rather than hidden, so the firm's form URL is not sitting in
               the HTML for a signed-out reader to find in View Source. */
            applyHref={canApply ? opportunity.link : null}
            applyGateHref={`/auth/login?redirect=/jobs/${slug}`}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}


/**
 * The role description, as paragraphs, with a gated footnote.
 *
 * ⚠ THIS USED TO BE `<p>{job.role_desc}</p>` AND THAT HAD TWO FAULTS AT ONCE.
 *
 * A single <p> means the whole description is one block however it was written.
 * The Heirs Holdings listing needs a closing aside that is NOT part of the
 * description — a fallback route to use when the employer’s own link will not
 * open — and running that into the same paragraph as the job’s content is how
 * a reader misses it.
 *
 * And a bare URL in a text node is not a link. It rendered as characters, so a
 * reader on a phone had to retype a Google Forms path by hand, which nobody
 * does. The one thing the sentence exists to provide was the one thing it did
 * not provide.
 *
 * ============================================================
 * ⚠ THE NOTE IS BEHIND THE ACCOUNT, AND THAT IS THE WHOLE REASON THIS TAKES
 * `canApply` RATHER THAN JUST RENDERING
 * ============================================================
 *
 * Read the long note on `applyHref` above. The product’s split is that the
 * DESCRIPTION is public and the APPLICATION ROUTE is what the account is for,
 * and applyHref goes null at the source so there is nothing in the markup to
 * find. A footnote carrying a working application URL in the description would
 * walk straight through that gate: this listing is in OPEN_JOB_SLUGS, so a
 * signed-out reader renders this section, and the form link would sit in the
 * HTML for anybody who pressed View Source — while the Apply button two
 * sections down still said "sign in to apply".
 *
 * So a Note paragraph is dropped entirely for a signed-out reader. Not hidden,
 * not stubbed: never rendered. The body paragraphs are unaffected, which is
 * correct, because the description is the half that is meant to be public.
 *
 * ============================================================
 * THE CONVENTION, AND WHY IT IS A PREFIX RATHER THAN A COLUMN
 * ============================================================
 *
 * A paragraph is a note when it starts with "Note:". That is a convention in a
 * text column rather than a schema change, and the trade is deliberate: one
 * listing needs this today, and a migration plus a nullable column plus a
 * second editing surface is a lot of machinery for one row. WHEN A THIRD
 * LISTING NEEDS ONE, give it a real `apply_note` column and read it here —
 * everything downstream of this component already goes through one place.
 *
 * Paragraphs split on a blank line, which is how the seed scripts write them.
 *
 * ⚠ LINKS ARE BUILT AS REACT ELEMENTS, NEVER dangerouslySetInnerHTML. This
 * text comes from a database row, so an href assembled into a raw HTML string
 * would be an injection point one careless edit away. React escapes the text
 * nodes and the href, and the URL pattern below cannot match a `javascript:`
 * scheme because it only ever matches https:// or a bare domain, which is then
 * prefixed with https:// by us rather than by the row.
 */
/** Paragraphs are separated by a blank line, which is how the seed scripts write them. */
const SPLIT_ON_BLANK_LINE = /\n\s*\n/
const URL_IN_PROSE = /(https?:\/\/[^\s)]+|(?:docs\.google\.com|forms\.gle)\/[^\s)]+)/g

function linkify(text: string, key: string) {
  const parts = text.split(URL_IN_PROSE)
  return parts.map((part, i) => {
    if (!part) return null
    if (!URL_IN_PROSE.test(part)) {
      URL_IN_PROSE.lastIndex = 0
      return <span key={`${key}-t${i}`}>{part}</span>
    }
    URL_IN_PROSE.lastIndex = 0
    /* Trailing sentence punctuation is not part of the address. Stripped here
       rather than tightened in the pattern, because a URL may legitimately end
       in a character this drops and only the LAST one is ever punctuation. */
    const trimmed = part.replace(/[.,;:]+$/, '')
    const tail = part.slice(trimmed.length)
    const href = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    return (
      <span key={`${key}-l${i}`}>
        <a href={href} target="_blank" rel="noopener noreferrer" className="job-prose-link">
          {trimmed}
        </a>
        {tail}
      </span>
    )
  })
}

function RoleProse({ text, canApply }: { text: string; canApply: boolean }) {
  const paragraphs = text.split(SPLIT_ON_BLANK_LINE).map(p => p.trim()).filter(Boolean)
  return (
    <>
      {paragraphs.map((para, i) => {
        const isNote = /^Note:/i.test(para)
        if (isNote && !canApply) return null
        return (
          <p
            key={i}
            className={`grotesk-regular job-prose${isNote ? ' job-prose-note' : ''}`}
          >
            {linkify(para, `p${i}`)}
          </p>
        )
      })}
    </>
  )
}
