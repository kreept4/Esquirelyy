'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, X, Bookmark, ChevronRight } from 'lucide-react'
import { logoForEmployer, ballBgForEmployer } from '@/lib/firms-data'
import EmptyState from '@/components/ui/EmptyState'
import { useSavedJobs } from '@/lib/saved-jobs'
import { stateOptions, matchesState } from '@/lib/nigeria'

/**
 * The job board.
 *
 * Rebuilt. The previous version put every listing in a narrow left-hand column
 * and left roughly two thirds of a desktop viewport empty, opened with a tall
 * empty beige block, and labelled each row with a run of tiny uppercase words
 * (LAW FIRM / FULL-TIME / VERIFIED) that carried almost no information for the
 * space they occupied.
 *
 * Three ideas replace that.
 *
 * A dark header. Each inner page repeats the homepage's move in miniature: an
 * ink statement, then light substance. That is what keeps a white product
 * surface feeling like the same object as the hero rather than a plain table.
 *
 * A real column grid. Role, employer, location, type and deadline each get a
 * track, and the tracks align down the whole board, so the eye can scan one
 * attribute vertically instead of re-reading every row. The width finally does
 * something.
 *
 * Logos on white. Most firm marks are dark artwork on an opaque white field, so
 * on a white page they need no plate at all: the reason the rest of the site
 * carries a plate is the cream and black grounds, and here that cost disappears.
 * Employers whose art sits on a solid brand colour keep a tile matching that
 * colour, the same rule the ball pit uses.
 */

const TYPE_LABELS: Record<string, string> = {
  job: 'Full-time',
  internship: 'Internship',
  clerkship: 'Clerkship',
  fellowship: 'Fellowship',
}

const SECTOR_OPTIONS = [
  { value: '', label: 'All sectors' },
  { value: 'law_firm', label: 'Law firms' },
  { value: 'banking', label: 'Banking & finance' },
  { value: 'energy', label: 'Energy & extractives' },
  { value: 'fintech', label: 'Technology & fintech' },
  { value: 'other', label: 'Multinationals & other' },
]
const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'job', label: 'Full-time' },
  { value: 'internship', label: 'Internship' },
]
const LEVEL_OPTIONS = [
  { value: '', label: 'All levels' },
  { value: 'student', label: 'Student' },
  { value: 'junior', label: 'Entry-level' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
]

function deadlineLabel(job: any) {
  if (job.is_rolling) return 'Rolling'
  if (!job.deadline) return 'Open'
  return new Date(job.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
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

/** Employer mark, sized to the row. No plate: on a white board a dark-on-white
 *  logo simply sits on the page. Only marks drawn on a solid brand field get a
 *  tile, and it matches that field so no edge shows. */
/**
 * @param logoUrl The listing's own `logo_url`, used ONLY when we have no
 *   curated mark for this employer. The agent sets it from Clearbit when it
 *   adds a listing for an employer nobody has drawn a logo for yet — see the
 *   column's note in scripts/2026-08-15-agent-schema.sql.
 *
 *   ⚠ THE CURATED MARK WINS, and the order matters rather than being a
 *   preference. Files in public/employer-logos have been through
 *   normalise-logos.mjs and share a cap height with every other mark on the
 *   board; a raw Clearbit PNG has not and does not. Taking the curated one
 *   first means dropping a proper file in later upgrades every listing for that
 *   employer with nothing to clean up here.
 */
function EmployerMark({ employer, logoUrl }: { employer: string; logoUrl?: string | null }) {
  const url = logoForEmployer(employer) || logoUrl || null
  const brand = ballBgForEmployer(employer)

  if (!url) {
    return (
      <span className="job-mark job-mark-fallback">
        <span className="grotesk-bold">{initials(employer)}</span>
      </span>
    )
  }
  return (
    <span className="job-mark" style={brand ? { background: brand, borderRadius: '8px' } : undefined}>
      <img src={url} alt="" />
    </span>
  )
}

/**
 * @param jobs        What this reader is allowed to see. Already filtered on the
 *                    server for a signed-out visitor, so this component never
 *                    holds a listing it must not render. Do not filter on
 *                    `gated` in here.
 * @param gated       No session. Changes what the page SAYS, never what it has.
 * @param totalCount  How many listings are on the board in total, so the count
 *                    line can be honest about what is being withheld. A gated
 *                    reader seeing "6 roles open" would reasonably conclude the
 *                    board is nearly empty, which is a worse impression than
 *                    the truth.
 */
export default function JobsClient({
  jobs,
  gated = false,
  totalCount,
}: {
  jobs: any[]
  gated?: boolean
  totalCount?: number
}) {
  /**
   * Filters start from the URL.
   *
   * They did not, and that quietly broke the home page: the three-question quiz
   * pushes to /jobs?level=junior&location=Lagos, the board initialised every
   * filter to empty, and the visitor arrived at an unfiltered list having just
   * answered three questions for nothing.
   *
   * It also makes filter states linkable, which is what lets a single board
   * cover internships without a second page: /jobs?type=internship is a
   * shareable view rather than a duplicate route to maintain.
   */
  const params = useSearchParams()
  const initial = (key: string) => params.get(key) ?? ''

  const [search, setSearch] = useState(initial('q'))
  const [sector, setSector] = useState(initial('sector'))
  const [type, setType] = useState(initial('type'))
  const [level, setLevel] = useState(initial('level'))
  const [location, setLocation] = useState(initial('location'))
  /* Saved roles are tracker rows now, not a Set that dies on navigation.
     `onlySaved` is the view that makes the bookmark worth pressing on this
     page: without somewhere to see them, a shortlist is invisible until you
     open a different page entirely. */
  const { isSaved, toggle: toggleSave, savedCount, signedIn } = useSavedJobs()
  const [onlySaved, setOnlySaved] = useState(false)

  /**
   * All 36 states and the FCT, from lib/nigeria.ts.
   *
   * This used to offer Lagos, Abuja and Port Harcourt only. That covers most
   * hiring, but it quietly told anyone practising outside those three that the
   * board was not for them, and it made a role in Enugu or Kano reachable only
   * by scrolling every listing. The shared list is used by the account page and
   * the tracker as well, so one place cannot start offering a different answer
   * to the same question.
   *
   * Matching is still substring, so "Victoria Island, Lagos" is found by Lagos.
   */
  const LOCATION_OPTIONS = stateOptions('All locations')

  /**
   * `?roles=slug,slug` pins the board to a named set of listings.
   *
   * This is what the "Show me the new roles" button opens, from the
   * notification, the carousel slide and the announcement email. It is a
   * different kind of filter from the selects: those narrow the board by a
   * property and stack with each other, this one names its results outright and
   * overrides everything else, because a reader who followed "show me the two
   * new roles" should not land on a board still carrying a location filter they
   * set last week.
   *
   * Held in state rather than read from `params` on every render so the Clear
   * button can drop it. Once cleared it does not come back, which is the whole
   * point: the pinned view is a starting position, not a mode to be trapped in.
   */
  const [pinned, setPinned] = useState<string[]>(() => {
    const raw = params.get('roles')
    return raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : []
  })

  const filtered = useMemo(
    () =>
      jobs.filter(l => {
        if (pinned.length) return pinned.includes(l.slug)
        if (onlySaved && !isSaved(l.employer, l.title)) return false
        const q = search.toLowerCase()
        if (q && !l.title?.toLowerCase().includes(q) && !l.employer?.toLowerCase().includes(q)) return false
        if (sector && l.sector !== sector) return false
        if (type && l.type !== type) return false
        /* `l.level &&` so a listing with NO level passes every level filter.
           Some roles genuinely span the range: Pentagon Partners advertise one
           seat open from one to ten years post call, and the column holds a
           single value, so any choice made there hides the role from two thirds
           of the people it is for. Marking it 'mid' is the worst of the three,
           since exact matching then excludes juniors AND seniors.
           An empty level is therefore read as "open to all levels" rather than
           as missing data. buildFeed in lib/notifications.ts has always worked
           this way; the board simply never learned it, so the same listing
           behaved differently in the bell and on the page. */
        if (level && l.level && l.level !== level) return false
        if (!matchesState(l.location, location)) return false
        return true
      }),
    [jobs, search, sector, type, level, location, onlySaved, isSaved, pinned]
  )

  const activeCount = [sector, type, level, location].filter(Boolean).length
  const clearAll = () => { setSector(''); setType(''); setLevel(''); setLocation(''); setPinned([]) }

  return (
    <main className="jobs-page">
      {/* Ink header: the homepage move, repeated small. */}
      <header className="jobs-header">
        <div className="shell jobs-header-inner">
          <h1 className="display-black jobs-title">Jobs</h1>
          <p className="grotesk-regular jobs-sub">
            Roles across law firms, banks, energy companies, fintechs and regulators, for every
            stage from call to the Bar to partner.
          </p>

          {/* A pinned board has to say so.
              Without this line the reader sees two listings under a heading
              that says "Jobs" and concludes the board is nearly empty, which is
              the opposite of the impression the announcement was trying to
              make. It also carries the only way out, since none of the selects
              below can clear a filter they did not set. */}
          {pinned.length > 0 && (
            <div className="jobs-pinned" role="status">
              <span className="grotesk-bold">
                Showing {filtered.length} {filtered.length === 1 ? 'role' : 'roles'} we have just added.
              </span>
              <button type="button" className="grotesk-bold jobs-pinned-clear" onClick={() => setPinned([])}>
                Show the whole board
              </button>
            </div>
          )}

          <div className="jobs-controls">
            <div className="jobs-search">
              <Search size={15} aria-hidden />
              <input
                type="text"
                placeholder="Search roles or employers"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search roles or employers"
              />
            </div>

            <select className="jobs-select" data-active={!!sector} value={sector} onChange={e => setSector(e.target.value)} aria-label="Sector">
              {SECTOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="jobs-select" data-active={!!type} value={type} onChange={e => setType(e.target.value)} aria-label="Type">
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="jobs-select" data-active={!!level} value={level} onChange={e => setLevel(e.target.value)} aria-label="Level">
              {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="jobs-select" data-active={!!location} value={location} onChange={e => setLocation(e.target.value)} aria-label="Location">
              {LOCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {activeCount > 0 && (
              <button className="jobs-clear" onClick={clearAll}>
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {/* Entry-route explainer.
              These three get conflated constantly, and the cost is real: people
              filter for internships when they want a graduate trainee scheme,
              or skip trainee associate roles thinking they are unpaid. Collapsed
              by default because most visitors already know which one they are,
              and open on demand for the ones who do not. */}
          <details className="jobs-explainer">
            <summary className="grotesk-regular">
              <span>Trainee, graduate trainee or internship? What each one means</span>
              <span className="jobs-explainer-marker" aria-hidden>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>

            <div className="jobs-explainer-body">
              {/* Undergraduates only. Law School students are not looking for
                  attachments; that year is short, examined throughout, and ends
                  in call to the Bar, so they are already applying for trainee
                  associate roles rather than internships. */}
              <div className="jobs-route">
                <p className="grotesk-bold">Internship</p>
                <p className="grotesk-regular">
                  For undergraduates still in the law faculty. You spend a few weeks in chambers
                  over the long vacation, learning how a file actually moves, usually unpaid or on
                  a small stipend. You will find very few listed here, and that is not a gap on this
                  board: firms fill these places from letters students send them directly, so there
                  is nothing to advertise.
                </p>
                <p className="grotesk-regular">
                  Which makes the{' '}
                  <Link href="/firms" className="jobs-route-link">firms directory</Link>{' '}
                  the place to start. Every profile carries the practice areas, the offices and the
                  address to write to, so you can pick the chambers whose work actually interests
                  you instead of sending the same letter to forty firms.
                </p>
              </div>

              <div className="jobs-route">
                <p className="grotesk-bold">Trainee or NYSC associate</p>
                <p className="grotesk-regular">
                  For people already called to the Nigerian Bar, serving their NYSC year or just out
                  of it. Firms put corps members on the same files as first-year associates, and
                  many keep them on at the end of service. This is a salaried entry-level job, not
                  an internship, and it sits here under <strong>Entry-level</strong>.
                </p>
                <p className="grotesk-regular">
                  Start with{' '}
                  <Link href="/jobs?level=junior&sector=law_firm" className="jobs-route-link">
                    entry-level roles at firms
                  </Link>
                  , then read the chambers up in the{' '}
                  <Link href="/firms" className="jobs-route-link">firms directory</Link>{' '}
                  before you apply. Knowing a firm&rsquo;s practice areas is most of what separates
                  a good cover letter from a generic one.
                </p>
              </div>

              <div className="jobs-route">
                <p className="grotesk-bold">Graduate trainee</p>
                <p className="grotesk-regular">
                  The in-house route. Banks, fintechs, energy companies, regulators and
                  multinationals run structured intakes for recent graduates, often rotating you
                  through departments before you land in legal, compliance or company secretarial.
                  Salaried, with a fixed start and a hard closing date. Also{' '}
                  <strong>Entry-level</strong>, not an internship.
                </p>
                <p className="grotesk-regular">
                  These sit outside the law firms, so set the sector filter accordingly:{' '}
                  <Link href="/jobs?level=junior&sector=banking" className="jobs-route-link">
                    banking and finance
                  </Link>
                  ,{' '}
                  <Link href="/jobs?level=junior&sector=fintech" className="jobs-route-link">
                    technology and fintech
                  </Link>
                  , or{' '}
                  <Link href="/jobs?level=junior&sector=energy" className="jobs-route-link">
                    energy
                  </Link>
                  . Deadlines here are real, so apply before the closing date rather than on it.
                </p>
              </div>
            </div>
          </details>

          {/* The board is smaller than it looks, and it has to say so.
              Without this a signed-out reader counts six roles under a heading
              that says "Jobs" and leaves thinking that is the whole board. It
              sits above the count rather than replacing it so the number they
              can see stays the number they can act on. */}
          {gated && typeof totalCount === 'number' && totalCount > jobs.length && (
            <div className="jobs-pinned" role="status">
              <span className="grotesk-bold">
                Showing the {jobs.length} roles you can read without an account.
              </span>{' '}
              <span className="grotesk-regular">
                There are {totalCount} on the board.{' '}
                <Link href="/auth/signup?redirect=%2Fjobs">Create a free account</Link> to see
                the rest, or{' '}
                <Link href="/auth/login?redirect=%2Fjobs">sign in</Link>.
              </span>
            </div>
          )}

          <p className="grotesk-regular jobs-count">
            {filtered.length} {filtered.length === 1 ? 'role' : 'roles'}
            {filtered.length !== jobs.length ? ` of ${jobs.length}` : ''} open
            {/* The shortlist has to be reachable from the page you build it on.
                Only shown once something is in it, so it is a door rather than
                a permanently empty tab. */}
            {savedCount > 0 && (
              <>
                {' · '}
                <button
                  type="button"
                  className="jobs-saved-toggle"
                  data-active={onlySaved}
                  aria-pressed={onlySaved}
                  onClick={() => setOnlySaved(v => !v)}
                >
                  {onlySaved ? `Showing ${savedCount} saved · show all` : `${savedCount} saved`}
                </button>
                {signedIn === false && (
                  <span className="jobs-saved-note">
                    {' '}Kept on this device.{' '}
                    <Link href="/auth/login?redirect=%2Fjobs">Sign in</Link> to keep them in your tracker.
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </header>

      <div className="shell jobs-board-wrap">
        {filtered.length === 0 ? (
          /* An empty internship filter is not a failed search, it is the normal
             state of the Nigerian market: firms take interns constantly and
             almost never advertise it. Saying so, and pointing at the directory
             where the addresses are, turns a dead end into the actual next step.
             It only appears on the internship filter, so it stays advice rather
             than clutter. */
          type === 'internship' ? (
            <div className="jobs-empty jobs-empty-internship">
              <p className="display-black">Nigerian firms rarely advertise internships.</p>
              <p className="grotesk-regular">
                That is not a gap in this board. Most placements, attachments and externships here
                are arranged by writing to the firm directly, and a good speculative letter is how
                most students get in the door. Firms expect them.
              </p>
              <div className="jobs-empty-steps">
                <p className="grotesk-bold">How to go about it</p>
                <ol className="grotesk-regular">
                  <li>
                    Pick firms whose practice actually interests you. A letter that names the area
                    you want to learn reads very differently from one sent to forty firms.
                  </li>
                  <li>
                    Take the recruitment address from the{' '}
                    <a href="/firms">firms directory</a>. Every profile carries one, along with the
                    practice areas and offices.
                  </li>
                  <li>
                    Keep it short. Who you are, where you are in your studies, the period you are
                    free, and why that firm. Attach your CV.
                  </li>
                  <li>
                    Write well before the vacation. Most firms plan intakes a term ahead, and the
                    long vacation fills up early.
                  </li>
                </ol>
              </div>
              <a className="grotesk-bold jobs-empty-cta" href="/firms">
                Browse the firms directory
              </a>
            </div>
          ) : (
            <EmptyState
              heading="Nothing matches that."
              body="Try clearing a filter or searching for something broader."
            >
              {activeCount > 0 && (
                <button className="jobs-clear empty-state-action" onClick={clearAll}>
                  Clear filters
                </button>
              )}
            </EmptyState>
          )
        ) : (
          <div className="jobs-board">
            {/* Column headings sit above the grid so the tracks read as columns
                rather than as coincidence. Hidden on narrow screens where the
                rows stack. */}
            <div className="job-row job-row-head" aria-hidden>
              <span />
              <span>Role</span>
              <span>Location</span>
              <span>Type</span>
              <span>Closes</span>
              <span />
            </div>

            {filtered.map(job => (
              <div key={job.id} className="job-row" data-closing={!!job.is_closing_soon}>
                <EmployerMark employer={job.employer} logoUrl={(job as any).logo_url} />

                <span className="job-role">
                  {/* Schibsted, not Hanken. The two-family rule is display vs
                      body/UI, and a 1rem row title in a scannable list is UI:
                      Hanken at that size reads thin and slightly literary,
                      which is wrong for a dense board. Hanken is reserved for
                      the page title above. */}
                  <Link href={'/jobs/' + job.slug} className="grotesk-bold job-link">
                    {job.title}
                  </Link>
                  <span className="grotesk-regular job-employer">{job.employer}</span>
                </span>

                {/* `display: contents` by default, so these three stay direct
                    grid items in their own Location / Type / Closes columns and
                    the head row still lines up. Below 900px the wrapper becomes
                    a real box in the stacked layout's `meta` area and runs them
                    together as one dot-separated line.
                    Without it all three carried `grid-area: meta` themselves,
                    which placed them in the SAME cell — so on every phone the
                    location, the type and the deadline were painted on top of
                    one another. */}
                <span className="job-meta">
                  <span className="grotesk-regular job-cell">{job.location}</span>
                  <span className="grotesk-regular job-cell">{TYPE_LABELS[job.type] || job.type}</span>
                  <span className="grotesk-regular job-cell job-deadline">{deadlineLabel(job)}</span>
                </span>

                <span className="job-actions">
                  <button
                    onClick={() => toggleSave({
                      firm: job.employer,
                      role: job.title,
                      type: TYPE_LABELS[job.type] || job.type,
                      location: job.location,
                      deadline: deadlineLabel(job),
                    })}
                    aria-label={isSaved(job.employer, job.title) ? `Unsave ${job.title}` : `Save ${job.title}`}
                    aria-pressed={isSaved(job.employer, job.title)}
                    data-saved={isSaved(job.employer, job.title)}
                  >
                    <Bookmark size={15} fill={isSaved(job.employer, job.title) ? 'currentColor' : 'none'} />
                  </button>
                  <Link href={'/jobs/' + job.slug} aria-label={`View ${job.title}`}>
                    <ChevronRight size={18} />
                  </Link>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
