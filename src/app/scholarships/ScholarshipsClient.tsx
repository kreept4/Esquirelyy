'use client'

import { useState, useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Scholarship } from '@/lib/scholarships-data'
import EmptyState from '@/components/ui/EmptyState'

/**
 * Scholarships, rebuilt on the job board's structure.
 *
 * The old page was a stack of full-width cards, each repeating the same four
 * labelled facts (Level, Funding, Deadline, plus eligibility chips) in its own
 * little grid. Nothing lined up between cards, so comparing two scholarships
 * meant reading both in full.
 *
 * These are inherently comparison shopping: the question is always "which of
 * these can I actually apply for, and when does it close". So the layout is the
 * same as the board, for the same reason: shared column tracks, so one attribute
 * can be scanned down the page.
 *
 * Two differences from jobs are deliberate. Status leads, because a closed
 * scholarship is worthless and that should be visible before you read the name.
 * And deadlines stay as free text, because these are published as cycles
 * ("Two cycles yearly, November to December") far more often than as dates.
 */

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'is-open' },
  upcoming: { label: 'Upcoming', cls: 'is-upcoming' },
  closed: { label: 'Closed', cls: 'is-closed' },
}

/**
 * The state mark.
 *
 * Three states told apart by three colours of the same dot is the weakest
 * version of this: it carries no meaning on a greyscale screen, none for the
 * ~8% of men with a red-green deficiency, and it makes the reader learn an
 * arbitrary legend. So each state gets its own shape, and the shape says the
 * thing directly. A filled disc is a door that is open. A ring is that same
 * door with nothing behind it yet. A ring struck through is one that has shut.
 *
 * The same component renders inside the filter and inside every row, so the
 * mark is learned once and means one thing everywhere on the page.
 */
function StatusMark({ status }: { status: string }) {
  return <span className={`sch-mark sch-mark-${status}`} aria-hidden />
}

const STATUS_FILTERS = [
  { value: '', label: 'Everything' },
  { value: 'open', label: 'Open' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'closed', label: 'Closed' },
]

export default function ScholarshipsClient({ scholarships }: { scholarships: Scholarship[] }) {
  const [status, setStatus] = useState('')
  const [region, setRegion] = useState('')

  /** Regions come from the data. There are only a handful and they change as
   *  scholarships are added, so a hard-coded list would go stale immediately. */
  const REGION_OPTIONS = useMemo(() => {
    const seen = new Map<string, number>()
    for (const s of scholarships) seen.set(s.region, (seen.get(s.region) || 0) + 1)
    return [
      { value: '', label: 'Everywhere' },
      ...[...seen.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([r]) => ({ value: r, label: r })),
    ]
  }, [scholarships])

  /** Open first, then upcoming, then closed. Sorting by usefulness rather than
   *  by entry order means the thing you can act on today is at the top. */
  const ORDER: Record<string, number> = { open: 0, upcoming: 1, closed: 2 }

  const filtered = useMemo(
    () =>
      scholarships
        .filter(s => (!status || s.status === status) && (!region || s.region === region))
        .sort((a, b) => (ORDER[a.status] ?? 3) - (ORDER[b.status] ?? 3)),
    [scholarships, status, region]
  )

  /** Counts drive the filter, so the distribution is visible before you touch
   *  anything. A dropdown hid it: you had to pick "Upcoming" to discover there
   *  were two, and pick again to get back. */
  const counts = useMemo(() => {
    const c: Record<string, number> = { '': scholarships.length, open: 0, upcoming: 0, closed: 0 }
    for (const s of scholarships) c[s.status] = (c[s.status] ?? 0) + 1
    return c
  }, [scholarships])

  const openCount = counts.open ?? 0

  return (
    <main className="jobs-page">
      <header className="jobs-header">
        <div className="shell">
          <h1 className="display-black jobs-title">Scholarships</h1>
          <p className="grotesk-regular jobs-sub">
            Funding for Nigerian law students and lawyers, at home and abroad. Every one here is open
            to law, which rules out most of what the general scholarship lists carry.
          </p>

          {/* Status is a segmented control rather than a dropdown, for three
              reasons. The whole distribution is legible without interacting, so
              you can see there are only two upcoming before deciding to look.
              Every state is one tap from every other, instead of two taps
              through a menu. And the state marks sit in the control itself, so
              the legend is taught in the place it is first needed rather than
              left for the reader to infer from the rows.

              A state with nothing in it is disabled rather than hidden. A
              control whose options appear and disappear as you filter is a
              control you cannot learn. */}
          <div className="sch-filters">
            <div className="sch-segment" role="group" aria-label="Filter by status">
              {STATUS_FILTERS.map(o => {
                const n = counts[o.value] ?? 0
                return (
                  <button
                    key={o.value}
                    type="button"
                    className="grotesk-regular sch-seg"
                    data-active={status === o.value}
                    disabled={n === 0}
                    aria-pressed={status === o.value}
                    onClick={() => setStatus(o.value)}
                  >
                    {o.value && <StatusMark status={o.value} />}
                    <span className="sch-seg-label">{o.label}</span>
                    <span className="sch-seg-count">{n}</span>
                  </button>
                )
              })}
            </div>

            <select className="jobs-select sch-region" data-active={!!region} value={region} onChange={e => setRegion(e.target.value)} aria-label="Region">
              {REGION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <p className="grotesk-regular jobs-count">
            {openCount} open now, {scholarships.length} tracked
          </p>
        </div>
      </header>

      <div className="shell jobs-board-wrap">
        {filtered.length === 0 ? (
          <EmptyState
            heading="Nothing matches that."
            body="Try a different status or region. Closed scholarships usually reopen on the next cycle."
          />
        ) : (
          <div className="jobs-board">
            <div className="sch-row sch-row-head" aria-hidden>
              <span>Status</span>
              <span>Scholarship</span>
              <span>Level</span>
              <span>Funding</span>
              <span>Closes</span>
              <span />
            </div>

            {filtered.map(s => (
              <div key={s.slug} className="sch-row">
                {/* The same mark as the filter above, so the reader learns it
                    once. Type stays in ink; the state lives in the shape. */}
                <span className={`sch-status ${STATUS[s.status]?.cls ?? ''}`}>
                  <StatusMark status={s.status} />
                  {STATUS[s.status]?.label ?? s.status}
                </span>

                <span className="sch-main">
                  <span className="grotesk-bold sch-title">{s.title}</span>
                  <span className="grotesk-regular sch-provider">{s.provider}</span>
                  <span className="grotesk-regular sch-desc">{s.description}</span>
                  <span className="sch-elig">
                    {s.eligibility.map(e => (
                      <span key={e} className="tag-chip">{e}</span>
                    ))}
                  </span>
                </span>

                {/* Wrapped, and the wrapper is what the narrow layout places.
                    These three were bare grid items that each took
                    `grid-area: meta` below 1100px — and grid items sharing an
                    area STACK, so level, funding and deadline painted on top of
                    one another as unreadable overlapping text. `display: inline`
                    could never have fixed that: it changes how a grid item lays
                    out its own contents, not whether it is still a grid item.
                    One wrapper occupies the area, and the three run together
                    inside it as ordinary inline text, which is what the rule
                    below always meant. Contents-only on wide screens, where the
                    three still need to be separate columns. */}
                <span className="sch-meta">
                  <span className="grotesk-regular sch-cell">{s.level}</span>
                  <span className="grotesk-regular sch-cell">{s.funding}</span>
                  <span className="grotesk-regular sch-cell sch-deadline">{s.deadline}</span>
                </span>

                <span className="sch-action">
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grotesk-bold sch-apply"
                    aria-label={`Apply for ${s.title}`}
                  >
                    Apply <ExternalLink size={13} />
                  </a>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
