'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, X, MapPin, ChevronDown, Trash2, ArrowRight, Check,
  FileText, PenLine, MessagesSquare,
} from 'lucide-react'
import Footer from '@/components/layout/Footer'
import BrandLoader from '@/components/ui/BrandLoader'
import { createClient } from '@/lib/supabase/client'
import { stateOptions } from '@/lib/nigeria'

/**
 * The tracker.
 *
 * What this replaced was a six-column kanban board at a 900px minimum width,
 * built out of inline styles with its own private palette. Three things were
 * wrong with it beyond the styling.
 *
 * A kanban is a project-management idiom and this is not a project. Six columns
 * for a student with four applications is five empty boxes and one card, so the
 * page's dominant visual statement was emptiness. It also could not be used on a
 * phone at all, which is where most of this audience is.
 *
 * And it carried a panel offering to auto-log applications forwarded to
 * "you@mail.esquirely.app". There is no such inbox, no parser and no address,
 * and the button under it had no handler. That has been removed rather than
 * restyled.
 *
 * What is here instead is a funnel and a ledger. The funnel answers the question
 * the page is named for in one glance, and the ledger is the site's own row
 * idiom, which works from 360px up to a television without a horizontal
 * scrollbar.
 */

/* `Saved` is a shortlist, not a stage.
 *
 * It is what the bookmark on the jobs board writes, and it sits BEFORE the
 * funnel rather than at the top of it: nothing has been sent, so counting a
 * saved role as having "reached Applied" would overstate the top of the funnel
 * and understate every conversion under it — the same reason Closed is counted
 * beside the funnel rather than inside it. It leaves in one direction only: the
 * moment someone taps Applied on a saved row it becomes an ordinary
 * application and does not come back.
 *
 * No migration was needed. The live table has no CHECK constraint on `status`
 * at all (verified 2026-08-07 — an insert of `bogus_value_xyz` was accepted),
 * which also means nothing outside this file protects the column. */
type UIStatus = 'Saved' | 'Applied' | 'Assessment' | 'First interview' | 'Second interview' | 'Offer' | 'Closed'
type DBStatus = 'saved' | 'applied' | 'assessment' | 'interview_1' | 'interview_2' | 'offer' | 'rejected'

/* DB values are unchanged. Only the labels moved.
 *
 * "Rejected" became "Closed" because the row holds more than rejections: a
 * withdrawal, a role that got filled, a firm that never replied and a cycle that
 * ended all land here, and naming the whole bucket after the worst case makes a
 * tracker something you avoid opening. */
const STATUS_TO_DB: Record<UIStatus, DBStatus> = {
  'Saved': 'saved',
  'Applied': 'applied',
  'Assessment': 'assessment',
  'First interview': 'interview_1',
  'Second interview': 'interview_2',
  'Offer': 'offer',
  'Closed': 'rejected',
}

const STATUS_FROM_DB: Record<DBStatus, UIStatus> = {
  'saved': 'Saved',
  'applied': 'Applied',
  'assessment': 'Assessment',
  'interview_1': 'First interview',
  'interview_2': 'Second interview',
  'offer': 'Offer',
  'rejected': 'Closed',
}

/** Order matters: this is the sequence the stepper advances through, and the
 *  index is what the funnel uses to decide whether an application has reached a
 *  given stage. Closed is outside the sequence because it is absorbing. */
const LIVE_STAGES: UIStatus[] = ['Applied', 'Assessment', 'First interview', 'Second interview', 'Offer']

interface Application {
  id: string
  firm: string
  role: string
  type: string
  location: string
  dateApplied: string
  appliedAt: number | null
  deadline: string
  status: UIStatus
  notes: string
}

/* Deadlines arrive two ways. TrackOnApply writes an ISO date off a listing;
 * the manual form takes free text, because a lot of these are published as
 * cycles rather than dates ("Rolling", "November intake"). Anything that does
 * not parse is shown as written rather than dropped or guessed at. */
function readDeadline(raw: string): { text: string; daysLeft: number | null } {
  if (!raw) return { text: '', daysLeft: null }
  const t = Date.parse(raw)
  if (Number.isNaN(t)) return { text: raw, daysLeft: null }
  const d = new Date(t)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((d.getTime() - today.getTime()) / 86400000)
  return {
    text: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    daysLeft: days,
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ------------------------------------------------------------------ funnel */

/**
 * Where the applications actually sit.
 *
 * Widths are proportional to how many applications reached each stage, not to
 * how many are sitting in it right now. Reaching is inferred from the current
 * stage's position in the sequence, which is the only history the table holds:
 * an application at second interview must have been applied for.
 *
 * Closed applications are counted beside the funnel rather than inside it. We
 * do not record how far one got before it closed, and quietly folding them into
 * the "applied" bar would overstate the top and understate every conversion
 * below it.
 */
function Funnel({
  apps, active, onPick,
}: {
  apps: Application[]
  active: UIStatus | null
  onPick: (s: UIStatus | null) => void
}) {
  /* Saved rows would contribute nothing anyway — `LIVE_STAGES.indexOf('Saved')`
     is -1, so they fail every `>= idx` test — but excluding them by name means
     the counts do not depend on that coincidence holding. */
  const live = apps.filter(a => a.status !== 'Closed' && a.status !== 'Saved')
  const reached = LIVE_STAGES.map(stage => {
    const idx = LIVE_STAGES.indexOf(stage)
    return live.filter(a => LIVE_STAGES.indexOf(a.status) >= idx).length
  })
  const top = reached[0] || 1

  return (
    <div className="trk-funnel" role="group" aria-label="Application stages">
      {LIVE_STAGES.map((stage, i) => {
        const count = reached[i]
        const here = live.filter(a => a.status === stage).length
        const prev = i > 0 ? reached[i - 1] : null
        const isActive = active === stage

        /* The first stage has nothing to convert from, so it reports how many
         * are still sitting there rather than a percentage. Later stages report
         * conversion, but only where the stage above them has anyone in it: a
         * conversion rate off a denominator of zero is not 0%, it is undefined,
         * and printing anything at all there says something untrue. */
        const sub =
          i === 0
            ? (here === count ? 'sent' : `${here} still here`)
            : prev && prev > 0
              ? `${Math.round((count / prev) * 100)}% through`
              : ''

        return (
          <button
            key={stage}
            type="button"
            className="trk-stage"
            data-active={isActive}
            data-empty={count === 0}
            /* Flex-grow on the reach count, with a floor, so a stage nobody has
             * got to yet is still a legible hairline with its name on it rather
             * than collapsing out of the row. An invisible stage would read as
             * a stage that does not exist. */
            style={{ flexGrow: Math.max(count / top, 0.22) }}
            onClick={() => onPick(isActive ? null : stage)}
            aria-pressed={isActive}
          >
            <span className="trk-stage-bar" aria-hidden />
            <span className="display-black trk-stage-count">{count}</span>
            <span className="grotesk-regular trk-stage-name">{stage}</span>
            {sub && <span className="grotesk-regular trk-stage-sub">{sub}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------- row */

function LedgerRow({
  app, index, onStatusChange, onDelete, onNoteChange,
}: {
  app: Application
  index: number
  onStatusChange: (id: string, s: UIStatus) => void
  onDelete: (id: string) => void
  onNoteChange: (id: string, n: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(app.notes)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dl = readDeadline(app.deadline)
  const stageIdx = LIVE_STAGES.indexOf(app.status)
  const closed = app.status === 'Closed'

  /* Urgency is only claimed where a real date parsed. A free-text cycle gets no
   * colour, because "November to December" is not a countdown. */
  const urgency =
    dl.daysLeft === null ? '' : dl.daysLeft < 0 ? 'past' : dl.daysLeft <= 7 ? 'soon' : ''

  return (
    <li className="trk-row" data-open={open} data-closed={closed}>
      <button
        type="button"
        className="trk-row-head"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="display-black trk-index" aria-hidden>
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="trk-row-main">
          <span className="grotesk-bold trk-firm">{app.firm}</span>
          <span className="grotesk-regular trk-role">{app.role || 'Speculative application'}</span>
          <span className="trk-meta">
            {app.location && (
              <span className="grotesk-regular trk-meta-item">
                <MapPin size={12} aria-hidden /> {app.location}
              </span>
            )}
            {app.type && <span className="tag-chip trk-type">{app.type}</span>}
            {app.dateApplied && (
              <span className="grotesk-regular trk-meta-item">Sent {app.dateApplied}</span>
            )}
          </span>
        </span>

        {/* The stage as a five-step gauge rather than a word in a coloured pill.
            It shows position and distance at once: how far this one has come and
            how far is left, which a pill cannot do. */}
        <span className="trk-gauge" title={app.status}>
          <span className="trk-gauge-pips" aria-hidden>
            {LIVE_STAGES.map((_, i) => (
              <span key={i} className="trk-pip" data-on={!closed && i <= stageIdx} />
            ))}
          </span>
          <span className="grotesk-regular trk-gauge-label">{app.status}</span>
        </span>

        <span className="grotesk-regular trk-deadline" data-urgency={urgency}>
          {dl.text
            ? dl.daysLeft !== null && dl.daysLeft >= 0
              ? `${dl.text} · ${dl.daysLeft}d`
              : dl.text
            : 'Not set'}
        </span>

        <span className="trk-chev" aria-hidden><ChevronDown size={15} /></span>
      </button>

      {open && (
        <div className="trk-row-body">
          <div className="trk-stepper-wrap">
            <p className="grotesk-regular trk-body-label">Move it along</p>
            {/* A stepper, not a dropdown. Where an application is going next is
                one tap, because that is the action people actually take, and the
                whole sequence stays visible while they take it. */}
            <div className="trk-stepper">
              {LIVE_STAGES.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  className="grotesk-regular trk-step"
                  data-on={!closed && i <= stageIdx}
                  data-current={!closed && i === stageIdx}
                  onClick={() => onStatusChange(app.id, s)}
                >
                  <span className="trk-step-dot" aria-hidden>
                    {!closed && i < stageIdx ? <Check size={10} strokeWidth={3} /> : null}
                  </span>
                  {s}
                </button>
              ))}
              <button
                type="button"
                className="grotesk-regular trk-step trk-step-closed"
                data-on={closed}
                data-current={closed}
                onClick={() => onStatusChange(app.id, 'Closed')}
              >
                <span className="trk-step-dot" aria-hidden />
                Closed
              </button>
            </div>
          </div>

          <div className="trk-note-wrap">
            <label className="grotesk-regular trk-body-label" htmlFor={`n-${app.id}`}>
              Notes
            </label>
            <textarea
              id={`n-${app.id}`}
              className="grotesk-regular trk-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={() => note !== app.notes && onNoteChange(app.id, note)}
              placeholder="Who you spoke to, what they asked, what to chase."
              rows={3}
            />
            <div className="trk-row-actions">
              {app.deadline && (
                <span className="grotesk-regular trk-deadline-full">Closes {app.deadline}</span>
              )}
              {confirmDelete ? (
                <span className="trk-confirm">
                  <span className="grotesk-regular">Remove it?</span>
                  <button type="button" className="grotesk-bold trk-confirm-yes" onClick={() => onDelete(app.id)}>Yes</button>
                  <button type="button" className="grotesk-regular trk-confirm-no" onClick={() => setConfirmDelete(false)}>Keep</button>
                </span>
              ) : (
                <button type="button" className="grotesk-regular trk-remove" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={13} aria-hidden /> Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

/* ------------------------------------------------------------------ modal */

function AddModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (a: Omit<Application, 'id' | 'appliedAt'>) => Promise<void>
}) {
  const [form, setForm] = useState({
    firm: '', role: '', type: 'Full-time', location: '',
    dateApplied: fmtDate(new Date().toISOString()),
    deadline: '', status: 'Applied' as UIStatus, notes: '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))
  const ready = form.firm.trim().length > 0

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  async function submit() {
    if (!ready || saving) return
    setSaving(true)
    await onAdd(form)
    onClose()
  }

  return (
    <div className="trk-scrim" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="trk-modal" role="dialog" aria-modal="true" aria-label="Log an application">
        <div className="trk-modal-head">
          <h2 className="display-black trk-modal-title">Log an application</h2>
          <button type="button" className="trk-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p className="grotesk-regular trk-modal-note">
          Only the firm is required. Anything you leave blank you can fill in later, and applications
          you send from a listing on here get logged on their own.
        </p>

        <div className="trk-form">
          <div className="trk-field trk-field-wide">
            <label className="grotesk-regular tool-label" htmlFor="f-firm">Firm or employer</label>
            <input id="f-firm" className="tool-input" value={form.firm} onChange={e => set('firm', e.target.value)} placeholder="Banwo &amp; Ighodalo" autoFocus />
          </div>
          <div className="trk-field trk-field-wide">
            <label className="grotesk-regular tool-label" htmlFor="f-role">Role</label>
            <input id="f-role" className="tool-input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="Associate, Banking and Finance" />
          </div>
          <div className="trk-field">
            <label className="grotesk-regular tool-label" htmlFor="f-type">Type</label>
            <select id="f-type" className="tool-select" value={form.type} onChange={e => set('type', e.target.value)}>
              {['Full-time', 'Internship', 'Clerkship', 'Contract', 'Scholarship'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="trk-field">
            <label className="grotesk-regular tool-label" htmlFor="f-stage">Stage</label>
            <select id="f-stage" className="tool-select" value={form.status} onChange={e => set('status', e.target.value as UIStatus)}>
              {[...LIVE_STAGES, 'Closed' as UIStatus].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="trk-field">
            <label className="grotesk-regular tool-label" htmlFor="f-loc">Location</label>
            {/* The shared state list, same as the board and the account page.
                Typed locations drifted into four spellings of one place, and
                nothing downstream could group them. */}
            <select id="f-loc" className="tool-input" value={form.location} onChange={e => set('location', e.target.value)}>
              {stateOptions('Pick a state').map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="trk-field">
            <label className="grotesk-regular tool-label" htmlFor="f-dl">
              Closes <span className="tool-label-hint">a date, or how it runs</span>
            </label>
            <input id="f-dl" className="tool-input" value={form.deadline} onChange={e => set('deadline', e.target.value)} placeholder="30 Sep, or Rolling" />
          </div>
          <div className="trk-field trk-field-wide">
            <label className="grotesk-regular tool-label" htmlFor="f-notes">Notes</label>
            <textarea id="f-notes" className="tool-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anything worth remembering." rows={3} />
          </div>
        </div>

        <button type="button" className="grotesk-bold tool-submit" onClick={submit} disabled={!ready || saving}>
          {saving ? 'Saving' : 'Log it'}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- page */

export default function TrackerPage() {
  const router = useRouter()
  const [apps, setApps] = useState<Application[]>([])
  const [work, setWork] = useState({ cv: 0, letters: 0, interviews: 0 })
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<UIStatus | null>(null)
  const [showClosed, setShowClosed] = useState(false)
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login?redirect=%2Ftracker'); return }

      setFirstName(
        (user.user_metadata?.full_name || user.email || '').split(/[\s@.]/)[0] || ''
      )

      /* Counts only. The tracker does not need the bodies of six cover letters,
       * and pulling them would be a slow query for a three-number strip. */
      const [appRes, cv, cl, ip] = await Promise.all([
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('cv_reviews').select('id', { count: 'exact', head: true }),
        supabase.from('cover_letters').select('id', { count: 'exact', head: true }),
        supabase.from('interview_sessions').select('id', { count: 'exact', head: true }),
      ])

      if (!appRes.error && appRes.data) {
        setApps(appRes.data.map((r: any) => ({
          id: r.id,
          firm: r.firm ?? '',
          role: r.role ?? '',
          type: r.type ?? '',
          location: r.location ?? '',
          dateApplied: r.date_applied ? fmtDate(r.date_applied) : '',
          appliedAt: r.date_applied ? Date.parse(r.date_applied) : null,
          deadline: r.deadline ?? '',
          status: STATUS_FROM_DB[r.status as DBStatus] ?? 'Applied',
          notes: r.notes ?? '',
        })))
      }
      setWork({ cv: cv.count ?? 0, letters: cl.count ?? 0, interviews: ip.count ?? 0 })
      setLoading(false)
    }
    init()
  }, [router])

  async function addApp(form: Omit<Application, 'id' | 'appliedAt'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const now = new Date().toISOString()
    const { data, error } = await (supabase.from('applications') as any).insert({
      user_id: user.id,
      firm: form.firm.trim(),
      role: form.role.trim(),
      type: form.type,
      location: form.location.trim(),
      date_applied: now,
      deadline: form.deadline.trim(),
      status: STATUS_TO_DB[form.status],
      notes: form.notes.trim(),
    }).select().single()
    if (!error && data) {
      setApps(prev => [{
        id: data.id,
        firm: data.firm ?? '',
        role: data.role ?? '',
        type: data.type ?? '',
        location: data.location ?? '',
        dateApplied: fmtDate(data.date_applied),
        appliedAt: Date.parse(data.date_applied),
        deadline: data.deadline ?? '',
        status: STATUS_FROM_DB[data.status as DBStatus] ?? 'Applied',
        notes: data.notes ?? '',
      }, ...prev])
    }
  }

  async function changeStatus(id: string, status: UIStatus) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    const supabase = createClient()
    await (supabase.from('applications') as any).update({ status: STATUS_TO_DB[status] }).eq('id', id)
  }

  async function deleteApp(id: string) {
    setApps(prev => prev.filter(a => a.id !== id))
    const supabase = createClient()
    await (supabase.from('applications') as any).delete().eq('id', id)
  }

  async function updateNote(id: string, notes: string) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, notes } : a))
    const supabase = createClient()
    await (supabase.from('applications') as any).update({ notes }).eq('id', id)
  }

  /* "In play" means sent and still open, so it excludes both ends: Closed
     because it is over, and Saved because it never started. */
  const live = apps.filter(a => a.status !== 'Closed' && a.status !== 'Saved')
  const savedCount = apps.filter(a => a.status === 'Saved').length
  const closedCount = apps.filter(a => a.status === 'Closed').length
  const offers = apps.filter(a => a.status === 'Offer').length
  const interviewing = apps.filter(a => a.status === 'First interview' || a.status === 'Second interview').length

  /** Anything with a real date still ahead of it, soonest first. This is the
   *  one thing on the page a person could otherwise miss entirely. */
  const upcoming = useMemo(() => (
    /* Saved roles keep their deadline here deliberately: a shortlisted job you
       have not applied to yet is exactly the one a closing date should chase
       you about. */
    apps
      .filter(a => a.status !== 'Closed')
      .map(a => ({ a, d: readDeadline(a.deadline) }))
      .filter(x => x.d.daysLeft !== null && x.d.daysLeft >= 0)
      .sort((x, y) => (x.d.daysLeft! - y.d.daysLeft!))
      .slice(0, 3)
  ), [apps])

  const visible = useMemo(() => {
    /* Unfiltered, the ledger is the things you have actually sent. Saved and
       Closed are both reachable by name from the funnel section; neither should
       pad the default list, because a shortlist of forty roles would bury the
       four applications that are live. */
    let list = filter
      ? apps.filter(a => a.status === filter)
      : apps.filter(a => a.status !== 'Closed' && a.status !== 'Saved')
    if (!filter && showClosed) list = apps.filter(a => a.status !== 'Saved')
    return list
  }, [apps, filter, showClosed])

  const STRIP = [
    { k: 'Saved', v: String(savedCount) },
    { k: 'In play', v: String(live.length) },
    { k: 'Interviewing', v: String(interviewing) },
    { k: 'Offers', v: String(offers) },
    { k: 'Closed', v: String(closedCount) },
  ]

  if (loading) {
    return (
      <main className="page-main doc-page trk-loading">
        <BrandLoader label="Opening your tracker" />
      </main>
    )
  }

  return (
    <>
      <main className="page-main doc-page trk-page">
        <header className="doc-masthead">
          <div className="shell doc-masthead-inner trk-masthead">
            <div className="trk-masthead-row">
              <h1 className="display-black doc-title">
                {firstName ? `Where you stand, ${firstName}.` : 'Where you stand.'}
              </h1>
              <button type="button" className="grotesk-bold trk-add" onClick={() => setShowModal(true)}>
                <Plus size={15} aria-hidden /> Log one
              </button>
            </div>
            <p className="grotesk-regular doc-lede">
              {apps.length === 0
                ? 'Nothing filed yet. Save a role on the board or apply to one from its listing, and it lands in this page on its own. You can put one in by hand too.'
                : 'Every role you have saved and every application you have sent, and how far each one has got. Saving and applying from a listing both file it for you.'}
            </p>
            <dl className="doc-strip trk-strip">
              {STRIP.map(s => (
                <div key={s.k} className="doc-strip-item">
                  <dt className="grotesk-regular">{s.k}</dt>
                  <dd className="grotesk-bold">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <div className="shell trk-body">
          {apps.length === 0 ? (
            <section className="trk-empty">
              <p className="display-black trk-empty-head">
                A tracker you have to fill in by hand is a worse spreadsheet than a spreadsheet.
              </p>
              {/* Was four lines describing the mechanism twice. It listed what
                  gets written down, then said the same thing again as a
                  promise, and the reader had to hold all of it to reach a point
                  they had already taken. Two sentences: what it does, and what
                  that means for you. */}
              <p className="grotesk-regular trk-empty-body">
                So this one fills itself. Save a role or apply through Esquirely and it lands
                here with the firm, the position and the closing date already in place.
              </p>
              <div className="trk-empty-actions">
                <Link href="/jobs" className="grotesk-bold trk-empty-cta">
                  Find something to apply for <ArrowRight size={15} aria-hidden />
                </Link>
                <button type="button" className="grotesk-regular trk-empty-alt" onClick={() => setShowModal(true)}>
                  Or log one you sent elsewhere
                </button>
              </div>
            </section>
          ) : (
            <>
              <section className="trk-section">
                <div className="trk-section-head">
                  <p className="grotesk-bold trk-section-title">The funnel</p>
                  {filter && (
                    <button type="button" className="grotesk-regular trk-clear" onClick={() => setFilter(null)}>
                      Showing {filter.toLowerCase()} only · clear
                    </button>
                  )}
                </div>
                <Funnel apps={apps} active={filter} onPick={setFilter} />
                {/* The shortlist, named and reachable. This is where the
                    bookmark on the jobs board now lands, so it has to be
                    visible from the page the bookmark promises to fill —
                    otherwise the button is exactly as redundant as it was when
                    it wrote to nothing. Opening one gives the same stepper
                    every other row has, so "I have now applied" is one tap. */}
                {savedCount > 0 && (
                  <p className="grotesk-regular trk-funnel-note">
                    {savedCount} {savedCount === 1 ? 'role is' : 'roles are'} saved but not applied
                    for. They sit before the funnel because nothing has been sent yet.{' '}
                    <button type="button" className="trk-inline-btn" onClick={() => setFilter('Saved')}>
                      Open the shortlist
                    </button>
                  </p>
                )}
                {closedCount > 0 && (
                  <p className="grotesk-regular trk-funnel-note">
                    {closedCount} {closedCount === 1 ? 'application has' : 'applications have'} closed.
                    They sit outside the funnel because we do not know how far each one got first.{' '}
                    <button type="button" className="trk-inline-btn" onClick={() => setFilter('Closed')}>
                      See them
                    </button>
                  </p>
                )}
              </section>

              {upcoming.length > 0 && !filter && (
                <section className="trk-section trk-next">
                  <p className="grotesk-bold trk-section-title">Closing soonest</p>
                  <ul className="trk-next-list">
                    {upcoming.map(({ a, d }) => (
                      <li key={a.id} className="trk-next-item" data-urgent={d.daysLeft! <= 7}>
                        <span className="display-black trk-next-days">
                          {d.daysLeft === 0 ? 'Today' : `${d.daysLeft}d`}
                        </span>
                        <span className="trk-next-main">
                          <span className="grotesk-bold trk-next-firm">{a.firm}</span>
                          <span className="grotesk-regular trk-next-role">{a.role || 'Speculative application'}</span>
                        </span>
                        <span className="grotesk-regular trk-next-date">{d.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="trk-section">
                <div className="trk-section-head">
                  <p className="grotesk-bold trk-section-title">
                    {filter ? filter : 'Everything in play'}
                    <span className="grotesk-regular trk-section-count">{visible.length}</span>
                  </p>
                  {!filter && closedCount > 0 && (
                    <button type="button" className="grotesk-regular trk-clear" onClick={() => setShowClosed(s => !s)}>
                      {showClosed ? 'Hide closed' : `Show ${closedCount} closed`}
                    </button>
                  )}
                </div>

                {visible.length === 0 ? (
                  <p className="grotesk-regular trk-none">Nothing at this stage yet.</p>
                ) : (
                  <ul className="trk-ledger">
                    {visible.map((a, i) => (
                      <LedgerRow
                        key={a.id}
                        app={a}
                        index={i}
                        onStatusChange={changeStatus}
                        onDelete={deleteApp}
                        onNoteChange={updateNote}
                      />
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {/* What you have made, not just what you have sent. On an empty
              tracker this is the only thing on the page with anything in it,
              and on a full one it is the shortest route back to the tools. */}
          <section className="trk-section trk-work">
            <p className="grotesk-bold trk-section-title">Your work</p>
            <div className="trk-work-grid">
              {[
                { icon: <FileText size={18} />, n: work.cv, one: 'CV review', many: 'CV reviews', href: '/tools/cv-review', cta: 'Review a CV' },
                { icon: <PenLine size={18} />, n: work.letters, one: 'cover letter', many: 'cover letters', href: '/tools/cover-letter', cta: 'Write a letter' },
                { icon: <MessagesSquare size={18} />, n: work.interviews, one: 'interview set', many: 'interview sets', href: '/tools/interview-prep', cta: 'Prep an interview' },
              ].map(w => (
                <Link key={w.href} href={w.href} className="trk-work-card">
                  <span className="trk-work-icon" aria-hidden>{w.icon}</span>
                  <span className="display-black trk-work-n">{w.n}</span>
                  <span className="grotesk-regular trk-work-label">{w.n === 1 ? w.one : w.many}</span>
                  <span className="grotesk-regular trk-work-cta">
                    {w.cta} <ArrowRight size={13} aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={addApp} />}
    </>
  )
}
