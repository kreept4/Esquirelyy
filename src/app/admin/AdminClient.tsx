'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ScholarshipRow } from '@/lib/scholarships-live'
import {
  saveJob,
  setJobActive,
  saveScholarship,
  setScholarshipPublished,
  saveOpportunity,
  setOpportunityPublished,
  type ActionResult,
  type JobInput,
  type ScholarshipInput,
  type OpportunityInput,
} from './actions'

export type AdminJob = {
  id: string
  slug: string
  title: string
  employer: string
  sector: string
  type: string
  level: string | null
  tier: string | null
  location: string | null
  deadline: string | null
  is_rolling: boolean | null
  practice_areas: string[] | null
  about: string | null
  role_desc: string | null
  requirements: string[] | null
  apply_email: string | null
  apply_url: string | null
  source: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string | null
  delisted_at: string | null
}

export type AdminOpportunity = {
  id: string
  title: string
  organization: string
  type: string
  target: string | null
  location: string | null
  deadline: string | null
  link: string
  description: string | null
  eligibility: string | null
  logo_url: string | null
  practice_areas: string[] | null
  status: string | null
  created_at: string | null
}

type Kind = 'jobs' | 'scholarships' | 'opportunities'
type Values = Record<string, string>

type Field = {
  name: string
  label: string
  input?: 'text' | 'textarea' | 'date' | 'select' | 'url' | 'email' | 'number'
  options?: { value: string; label: string }[]
  hint?: string
  required?: boolean
  rows?: number
  newOnly?: boolean
}

/* ---------- field definitions ---------- */

const JOB_FIELDS: Field[] = [
  { name: 'title', label: 'Role title', required: true },
  { name: 'employer', label: 'Employer', required: true, hint: 'As the firm writes its name. The logo is matched from the firm directory.' },
  { name: 'slug', label: 'Link', newOnly: true, hint: 'Optional. Made from the employer and title if left blank, e.g. esquirely.com.ng/jobs/<link>.' },
  { name: 'type', label: 'Type', input: 'select', options: [{ value: 'job', label: 'Job' }, { value: 'internship', label: 'Internship' }] },
  { name: 'sector', label: 'Sector', input: 'select', options: [{ value: 'law_firm', label: 'Law firm' }, { value: 'other', label: 'Other (bank, company, organisation)' }] },
  { name: 'level', label: 'Level', input: 'select', options: [{ value: '', label: 'Not set' }, { value: 'junior', label: 'Junior' }, { value: 'mid', label: 'Mid' }, { value: 'senior', label: 'Senior' }] },
  { name: 'location', label: 'Location', hint: 'e.g. Lagos, Remote, Lagos or Abuja' },
  { name: 'deadline', label: 'Closing date', input: 'date', hint: 'Leave empty for a rolling role with no closing date.' },
  { name: 'about', label: 'About the employer', input: 'textarea', rows: 3 },
  { name: 'role_desc', label: 'About the role', input: 'textarea', rows: 5, hint: 'What the role is and how to apply.' },
  { name: 'requirements', label: 'Requirements', input: 'textarea', rows: 5, hint: 'One per line.' },
  { name: 'practice_areas', label: 'Practice areas', hint: 'Comma separated, e.g. Litigation, Corporate' },
  { name: 'apply_url', label: 'Apply link', input: 'url', hint: 'A link, an email below, or both.' },
  { name: 'apply_email', label: 'Apply email', input: 'email' },
  { name: 'tier', label: 'Firm tier', hint: 'Optional: Tier 1, Leading, Established or Boutique.' },
  { name: 'logo_url', label: 'Logo path', hint: 'Optional. Only if the firm is not in the directory, e.g. /employer-logos/name.png' },
  { name: 'source', label: 'Source', input: 'textarea', rows: 2, hint: 'Where the listing came from, for our records. Not shown on the site.' },
]

const SCHOLARSHIP_FIELDS: Field[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'provider', label: 'Provider', required: true },
  { name: 'slug', label: 'Link', newOnly: true, hint: 'Optional. Made from the title if left blank.' },
  { name: 'link', label: 'Apply link', input: 'url', required: true },
  { name: 'region', label: 'Where', hint: 'e.g. United Kingdom, Nigeria' },
  { name: 'level', label: 'Level', hint: "e.g. LLM, Master's abroad, Nigerian Law School" },
  { name: 'funding', label: 'Funding', hint: 'What it pays for, in one line.' },
  { name: 'closes_on', label: 'Closing date', input: 'date', hint: 'Sets the countdown and closes the listing automatically.' },
  { name: 'opens_on', label: 'Opening date', input: 'date', hint: 'Only if applications have not opened yet.' },
  { name: 'deadline', label: 'Deadline wording', hint: 'As shown on the page, e.g. "Closes 17 December 2026".' },
  { name: 'status', label: 'Status when there are no dates', input: 'select', options: [{ value: 'open', label: 'Open' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'closed', label: 'Closed' }], hint: 'Ignored when a closing or opening date is set.' },
  { name: 'description', label: 'Description', input: 'textarea', rows: 4, hint: 'Two or three plain sentences.' },
  { name: 'eligibility', label: 'Who can apply', input: 'textarea', rows: 5, hint: 'One point per line.' },
  { name: 'logo', label: 'Logo path', hint: 'e.g. /employer-logos/nyu-law.png' },
  { name: 'logo_bg', label: 'Logo background colour', hint: 'Only for a white logo, e.g. #013240' },
  { name: 'sort_order', label: 'Order', input: 'number', hint: 'Lower shows first within its status. Leave blank to add at the end.' },
]

const OPPORTUNITY_FIELDS: Field[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'organization', label: 'Organisation', required: true },
  { name: 'type', label: 'Type', input: 'select', options: [
    { value: 'internship', label: 'Internship' },
    { value: 'virtual_internship', label: 'Virtual internship' },
    { value: 'event', label: 'Event' },
    { value: 'competition', label: 'Competition' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'workshop', label: 'Workshop' },
  ] },
  { name: 'target', label: 'For', input: 'select', options: [{ value: 'all', label: 'Everyone' }, { value: 'undergraduate', label: 'Undergraduates' }] },
  { name: 'link', label: 'Link', input: 'url', required: true },
  { name: 'location', label: 'Location' },
  { name: 'deadline', label: 'Closing date', input: 'date' },
  { name: 'description', label: 'Description', input: 'textarea', rows: 4 },
  { name: 'eligibility', label: 'Who can apply', input: 'textarea', rows: 3 },
  { name: 'practice_areas', label: 'Practice areas', hint: 'Comma separated.' },
  { name: 'logo_url', label: 'Logo path', hint: 'Optional.' },
]

const FIELDS: Record<Kind, Field[]> = {
  jobs: JOB_FIELDS,
  scholarships: SCHOLARSHIP_FIELDS,
  opportunities: OPPORTUNITY_FIELDS,
}

const BLANK: Record<Kind, Values> = {
  jobs: { type: 'job', sector: 'law_firm', level: '' },
  scholarships: { status: 'open' },
  opportunities: { type: 'internship', target: 'all' },
}

/* ---------- row helpers ---------- */

const s = (v: unknown) => (v == null ? '' : String(v))

function jobValues(j: AdminJob): Values {
  return {
    title: j.title, employer: j.employer, type: j.type, sector: j.sector, level: s(j.level), tier: s(j.tier),
    location: s(j.location), deadline: s(j.deadline), about: s(j.about), role_desc: s(j.role_desc),
    requirements: (j.requirements ?? []).join('\n'), practice_areas: (j.practice_areas ?? []).join(', '),
    apply_url: s(j.apply_url), apply_email: s(j.apply_email), logo_url: s(j.logo_url), source: s(j.source),
  }
}

function scholarshipValues(r: ScholarshipRow): Values {
  return {
    title: r.title, provider: r.provider, link: r.link, region: r.region, level: r.level, funding: r.funding,
    closes_on: s(r.closes_on), opens_on: s(r.opens_on), deadline: r.deadline, status: r.status,
    description: r.description, eligibility: (r.eligibility ?? []).join('\n'), logo: s(r.logo),
    logo_bg: s(r.logo_bg), sort_order: s(r.sort_order),
  }
}

function opportunityValues(o: AdminOpportunity): Values {
  return {
    title: o.title, organization: o.organization, type: o.type, target: s(o.target) || 'all', link: o.link,
    location: s(o.location), deadline: s(o.deadline), description: s(o.description), eligibility: s(o.eligibility),
    practice_areas: (o.practice_areas ?? []).join(', '), logo_url: s(o.logo_url),
  }
}

function todayLagos(): string {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10)
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return ''
  const t = Date.parse(`${d}T12:00:00Z`)
  if (Number.isNaN(t)) return d
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

type Item = {
  key: string
  title: string
  sub: string
  closes: string
  live: boolean
  pastDeadline: boolean
  href: string | null
  values: Values
}

/* ---------- component ---------- */

export default function AdminClient({
  adminEmail,
  jobs,
  scholarships,
  opportunities,
  loadError,
}: {
  adminEmail: string
  jobs: AdminJob[]
  scholarships: ScholarshipRow[]
  opportunities: AdminOpportunity[]
  loadError: string | null
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Kind>('jobs')
  const [show, setShow] = useState<'live' | 'closed' | 'all'>('live')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<{ kind: Kind; key: string | null; values: Values } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const today = todayLagos()

  const items: Record<Kind, Item[]> = useMemo(() => ({
    jobs: jobs.map(j => ({
      key: j.id,
      title: j.title,
      sub: [j.employer, j.location].filter(Boolean).join(' · '),
      closes: j.deadline ? fmtDate(j.deadline) : 'Rolling',
      live: j.is_active,
      pastDeadline: !!j.deadline && j.deadline < today,
      href: j.is_active ? `/jobs/${j.slug}` : null,
      values: jobValues(j),
    })),
    scholarships: scholarships.map(r => ({
      key: r.slug,
      title: r.title,
      sub: [r.provider, r.region].filter(Boolean).join(' · '),
      closes: r.closes_on ? fmtDate(r.closes_on) : (r.status === 'closed' ? 'Closed' : 'No date'),
      live: r.is_published,
      pastDeadline: !!r.closes_on && r.closes_on < today,
      href: r.is_published ? `/scholarships/${r.slug}` : null,
      values: scholarshipValues(r),
    })),
    opportunities: opportunities.map(o => ({
      key: o.id,
      title: o.title,
      sub: [o.organization, o.location].filter(Boolean).join(' · '),
      closes: o.deadline ? fmtDate(o.deadline) : 'No date',
      live: o.status === 'published',
      pastDeadline: !!o.deadline && o.deadline < today,
      href: null,
      values: opportunityValues(o),
    })),
  }), [jobs, scholarships, opportunities, today])

  const counts = {
    jobs: items.jobs.filter(i => i.live).length,
    scholarships: items.scholarships.filter(i => i.live).length,
    opportunities: items.opportunities.filter(i => i.live).length,
  }

  const q = query.trim().toLowerCase()
  const visible = items[tab]
    .filter(i => (show === 'all' ? true : show === 'live' ? i.live : !i.live))
    .filter(i => !q || `${i.title} ${i.sub}`.toLowerCase().includes(q))

  function done(r: ActionResult, message: string) {
    if (!r.ok) {
      setError(r.error)
      return false
    }
    setError(null)
    setNotice(message)
    router.refresh()
    return true
  }

  function save() {
    if (!editing) return
    const { kind, key, values } = editing
    for (const f of FIELDS[kind]) {
      if (f.required && !s(values[f.name]).trim()) {
        setError(`${f.label} is required.`)
        return
      }
    }
    startTransition(async () => {
      let r: ActionResult
      if (kind === 'jobs') r = await saveJob({ ...(values as unknown as JobInput), id: key ?? undefined })
      else if (kind === 'scholarships') r = await saveScholarship({ ...(values as unknown as ScholarshipInput), original_slug: key ?? undefined })
      else r = await saveOpportunity({ ...(values as unknown as OpportunityInput), id: key ?? undefined })
      if (done(r, key ? 'Saved. The site is updated.' : 'Added. It is live on the site now.')) setEditing(null)
    })
  }

  function toggle(kind: Kind, item: Item) {
    const closing = item.live
    const verb = kind === 'scholarships' ? (closing ? 'Hide' : 'Show') : closing ? 'Close' : 'Reopen'
    if (!window.confirm(`${verb} "${item.title}"?`)) return
    startTransition(async () => {
      let r: ActionResult
      if (kind === 'jobs') r = await setJobActive(item.key, !closing)
      else if (kind === 'scholarships') r = await setScholarshipPublished(item.key, !closing)
      else r = await setOpportunityPublished(item.key, !closing)
      done(r, closing ? 'Taken off the site.' : 'Back on the site.')
    })
  }

  const kindLabel = { jobs: 'job', scholarships: 'scholarship', opportunities: 'opportunity' }[tab]

  return (
    <main className="admin-page">
      <header className="admin-head">
        <div>
          <h1 className="grotesk-bold">Admin</h1>
          <p className="admin-muted">Signed in as {adminEmail}. Changes go live as soon as you save.</p>
        </div>
      </header>

      {loadError && <p className="admin-alert" role="alert">Some data did not load: {loadError}</p>}
      {error && !editing && <p className="admin-alert" role="alert">{error}</p>}
      {notice && !editing && (
        <p className="admin-notice" role="status" onClick={() => setNotice(null)}>{notice}</p>
      )}

      <nav className="admin-tabs" aria-label="Listing type">
        {(['jobs', 'scholarships', 'opportunities'] as Kind[]).map(k => (
          <button
            key={k}
            type="button"
            className={`admin-tab${tab === k ? ' is-on' : ''}`}
            onClick={() => { setTab(k); setQuery(''); setNotice(null) }}
          >
            {k === 'jobs' ? 'Jobs' : k === 'scholarships' ? 'Scholarships' : 'Opportunities'}
            <span className="admin-count">{counts[k]}</span>
          </button>
        ))}
      </nav>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search listings"
        />
        <select className="admin-select" value={show} onChange={e => setShow(e.target.value as typeof show)} aria-label="Show">
          <option value="live">On the site</option>
          <option value="closed">{tab === 'scholarships' ? 'Hidden' : 'Closed'}</option>
          <option value="all">All</option>
        </select>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => { setError(null); setNotice(null); setEditing({ kind: tab, key: null, values: { ...BLANK[tab] } }) }}
        >
          Add {kindLabel}
        </button>
      </div>

      <ul className="admin-list">
        {visible.length === 0 && <li className="admin-empty">Nothing here.</li>}
        {visible.map(item => (
          <li key={item.key} className={`admin-row${item.live ? '' : ' is-off'}`}>
            <div className="admin-row-main">
              <p className="admin-row-title grotesk-bold">{item.title}</p>
              <p className="admin-muted">{item.sub}</p>
              <p className="admin-row-meta">
                {/* Red only where a passed date means something is wrong: a job
                    or opportunity still live after it closed. A closed
                    scholarship stays on the board as "Closed" by design. */}
                <span className={item.pastDeadline && item.live && tab !== 'scholarships' ? 'admin-late' : ''}>
                  {item.pastDeadline ? `${tab === 'scholarships' ? 'Closed' : 'Deadline passed'} ${item.closes}` : item.closes}
                </span>
                {!item.live && <span className="admin-pill">{tab === 'scholarships' ? 'Hidden' : 'Closed'}</span>}
              </p>
            </div>
            <div className="admin-row-actions">
              <button
                type="button"
                className="admin-btn"
                onClick={() => { setError(null); setNotice(null); setEditing({ kind: tab, key: item.key, values: { ...item.values } }) }}
              >
                Edit
              </button>
              <button type="button" className="admin-btn" disabled={pending} onClick={() => toggle(tab, item)}>
                {tab === 'scholarships' ? (item.live ? 'Hide' : 'Show') : item.live ? 'Close' : 'Reopen'}
              </button>
              {item.href && (
                <Link className="admin-btn admin-btn-ghost" href={item.href} target="_blank">View</Link>
              )}
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="admin-sheet" role="dialog" aria-modal="true" aria-label={editing.key ? 'Edit listing' : 'Add listing'}>
          <form
            className="admin-form"
            onSubmit={e => { e.preventDefault(); save() }}
          >
            <div className="admin-form-head">
              <h2 className="grotesk-bold">{editing.key ? 'Edit' : 'Add'} {({ jobs: 'job', scholarships: 'scholarship', opportunities: 'opportunity' })[editing.kind]}</h2>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => { setEditing(null); setError(null) }}>Cancel</button>
            </div>

            {FIELDS[editing.kind]
              .filter(f => !(f.newOnly && editing.key))
              .map(f => {
                const id = `admin-${f.name}`
                const value = editing.values[f.name] ?? ''
                const set = (v: string) => setEditing(cur => (cur ? { ...cur, values: { ...cur.values, [f.name]: v } } : cur))
                return (
                  <label key={f.name} className="admin-field" htmlFor={id}>
                    <span className="admin-label">{f.label}{f.required ? ' *' : ''}</span>
                    {f.input === 'textarea' ? (
                      <textarea id={id} rows={f.rows ?? 3} value={value} onChange={e => set(e.target.value)} />
                    ) : f.input === 'select' ? (
                      <select id={id} value={value} onChange={e => set(e.target.value)}>
                        {f.options!.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input
                        id={id}
                        type={f.input === 'url' ? 'url' : f.input === 'email' ? 'email' : f.input === 'date' ? 'date' : f.input === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={e => set(e.target.value)}
                        required={f.required}
                      />
                    )}
                    {f.hint && <span className="admin-hint">{f.hint}</span>}
                  </label>
                )
              })}

            {error && <p className="admin-alert" role="alert">{error}</p>}

            <div className="admin-form-foot">
              <button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
                {pending ? 'Saving…' : editing.key ? 'Save changes' : 'Add to the site'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
