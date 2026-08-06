'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, X, Bookmark, ChevronRight } from 'lucide-react'
import { logoForEmployer, ballBgForEmployer } from '@/lib/firms-data'
import EmptyState from '@/components/ui/EmptyState'

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
function EmployerMark({ employer }: { employer: string }) {
  const url = logoForEmployer(employer)
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

export default function JobsClient({ jobs }: { jobs: any[] }) {
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
  const [saved, setSaved] = useState<Set<string>>(new Set())

  /**
   * The three cities Nigerian legal hiring actually happens in.
   *
   * This was derived from the listings, which kept surfacing whatever odd value
   * a row happened to carry ("Lekki", "Nigeria") as though it were a peer of
   * Lagos. A fixed list reads better and matches how people actually search.
   *
   * The known cost is that a role whose location matches none of the three is
   * only reachable under "All locations". The filter matches on substring, so
   * "Lekki, Lagos" would still be found by Lagos, but "Nigeria" would not.
   * Keeping listing locations tidy is what keeps that from biting.
   */
  const LOCATION_OPTIONS = [
    { value: '', label: 'All locations' },
    { value: 'Lagos', label: 'Lagos' },
    { value: 'Abuja', label: 'Abuja' },
    { value: 'Port Harcourt', label: 'Port Harcourt' },
  ]

  const filtered = useMemo(
    () =>
      jobs.filter(l => {
        const q = search.toLowerCase()
        if (q && !l.title?.toLowerCase().includes(q) && !l.employer?.toLowerCase().includes(q)) return false
        if (sector && l.sector !== sector) return false
        if (type && l.type !== type) return false
        if (level && l.level !== level) return false
        if (location && !l.location?.toLowerCase().includes(location.toLowerCase())) return false
        return true
      }),
    [jobs, search, sector, type, level, location]
  )

  const activeCount = [sector, type, level, location].filter(Boolean).length
  const clearAll = () => { setSector(''); setType(''); setLevel(''); setLocation('') }

  const toggleSave = (id: string) =>
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

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

          <p className="grotesk-regular jobs-count">
            {filtered.length} {filtered.length === 1 ? 'role' : 'roles'}
            {filtered.length !== jobs.length ? ` of ${jobs.length}` : ''} open
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
                <EmployerMark employer={job.employer} />

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

                <span className="grotesk-regular job-cell">{job.location}</span>
                <span className="grotesk-regular job-cell">{TYPE_LABELS[job.type] || job.type}</span>
                <span className="grotesk-regular job-cell job-deadline">{deadlineLabel(job)}</span>

                <span className="job-actions">
                  <button
                    onClick={() => toggleSave(job.id)}
                    aria-label={saved.has(job.id) ? `Unsave ${job.title}` : `Save ${job.title}`}
                    aria-pressed={saved.has(job.id)}
                  >
                    <Bookmark size={15} fill={saved.has(job.id) ? 'currentColor' : 'none'} />
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
