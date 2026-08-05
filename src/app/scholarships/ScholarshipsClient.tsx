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

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open now' },
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

  const openCount = scholarships.filter(s => s.status === 'open').length

  return (
    <main className="jobs-page">
      <header className="jobs-header">
        <div className="shell">
          <h1 className="display-black jobs-title">Scholarships</h1>
          <p className="grotesk-regular jobs-sub">
            Funding for Nigerian law students and lawyers, at home and abroad. Every one here is open
            to law, which rules out most of what the general scholarship lists carry.
          </p>

          <div className="jobs-controls">
            <select className="jobs-select" data-active={!!status} value={status} onChange={e => setStatus(e.target.value)} aria-label="Status">
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="jobs-select" data-active={!!region} value={region} onChange={e => setRegion(e.target.value)} aria-label="Region">
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
                {/* A dot and a label, not a coloured chip. Filled pills read as
                    generic UI furniture; letting the colour live in a single
                    small mark and keeping the type in ink is what makes it look
                    considered. The open dot carries a slow pulse, so "you can
                    apply to this today" is legible at a glance without shouting. */}
                <span className={`sch-status ${STATUS[s.status]?.cls ?? ''}`}>
                  <span className="sch-dot" aria-hidden />
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

                <span className="grotesk-regular sch-cell">{s.level}</span>
                <span className="grotesk-regular sch-cell">{s.funding}</span>
                <span className="grotesk-regular sch-cell sch-deadline">{s.deadline}</span>

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
