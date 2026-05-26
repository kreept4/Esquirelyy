'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function IconPlus({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconX({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconBriefcase({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="12" />
    </svg>
  )
}

function IconCalendar({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function IconMapPin({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function IconTrash({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function IconChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function IconSend({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function IconInbox({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'Applied' | 'Assessment' | 'Interview I' | 'Interview II' | 'Offer' | 'Rejected'

interface Application {
  id: string
  firm: string
  role: string
  type: string
  location: string
  dateApplied: string
  deadline: string
  status: Status
  notes: string
}

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMNS: { status: Status; color: string; dot: string }[] = [
  { status: 'Applied',      color: '#4A4A4A', dot: '#A0A0A0' },
  { status: 'Assessment',   color: '#7B5E00', dot: '#D4A017' },
  { status: 'Interview I',  color: '#0A4A7A', dot: '#3B82C4' },
  { status: 'Interview II', color: '#0A3A6A', dot: '#1D6FB8' },
  { status: 'Offer',        color: '#2D6A4F', dot: '#40916C' },
  { status: 'Rejected',     color: '#8B1A1A', dot: '#C44040' },
]

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Application[] = [
  {
    id: '1',
    firm: 'Templars',
    role: '2025 Vacation Scheme',
    type: 'Vacation Scheme',
    location: 'Lagos',
    dateApplied: '12 May 2025',
    deadline: '15 Jun 2025',
    status: 'Interview I',
    notes: 'Case study interview scheduled for 2 June.',
  },
  {
    id: '2',
    firm: 'AELEX',
    role: 'Junior Associate — Energy',
    type: 'Full-time',
    location: 'Lagos',
    dateApplied: '20 May 2025',
    deadline: '10 Jul 2025',
    status: 'Applied',
    notes: '',
  },
  {
    id: '3',
    firm: 'Banwo & Ighodalo',
    role: 'Capital Markets Associate',
    type: 'Full-time',
    location: 'Lagos',
    dateApplied: '5 May 2025',
    deadline: '5 Jul 2025',
    status: 'Offer',
    notes: 'Offer received. Deadline to respond: 20 Jun.',
  },
  {
    id: '4',
    firm: 'Streamsowers & Köhn',
    role: 'Dispute Resolution Pupil',
    type: 'Pupillage',
    location: 'Lagos',
    dateApplied: '1 May 2025',
    deadline: 'Rolling',
    status: 'Assessment',
    notes: 'Written exercise submitted.',
  },
  {
    id: '5',
    firm: 'G. Elias & Co',
    role: 'Junior Associate, Telecoms',
    type: 'Full-time',
    location: 'Lagos',
    dateApplied: '28 Apr 2025',
    deadline: '30 Jun 2025',
    status: 'Rejected',
    notes: 'Rejection received 18 May.',
  },
]

// ─── Utility ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function AppCard({
  app,
  onStatusChange,
  onDelete,
  onNoteChange,
}: {
  app: Application
  onStatusChange: (id: string, status: Status) => void
  onDelete: (id: string) => void
  onNoteChange: (id: string, note: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [noteVal, setNoteVal] = useState(app.notes)

  const col = COLUMNS.find(c => c.status === app.status)!

  return (
    <article style={{
      backgroundColor: '#FDFAF5',
      border: '0.5px solid #E8E0D5',
      borderRadius: '3px',
      marginBottom: '0.6rem',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,35,66,0.07)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Color bar */}
      <div style={{ height: '2px', backgroundColor: col.dot }} />

      <div style={{ padding: '0.9rem 1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <p style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#1A1A1A',
            lineHeight: 1.3,
            flex: 1,
          }}>
            {app.role}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0A0A0', padding: '0', flexShrink: 0, marginTop: '2px' }}
          >
            <div style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>
              <IconChevronDown />
            </div>
          </button>
        </div>

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#0A2342', marginBottom: '0.6rem' }}>
          {app.firm}
        </p>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: '#6A6A6A' }}>
            <IconMapPin /> {app.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: '#6A6A6A' }}>
            <IconCalendar /> Applied {app.dateApplied}
          </span>
        </div>

        {/* Type badge */}
        <span style={{
          display: 'inline-block',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.62rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#0A2342',
          backgroundColor: '#EBF0F7',
          padding: '2px 7px',
          borderRadius: '2px',
        }}>
          {app.type}
        </span>

        {/* Expanded section */}
        {expanded && (
          <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '0.5px solid #E8E0D5' }}>

            {/* Deadline */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: '#6A6A6A' }}>
                Deadline
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#1A1A1A' }}>
                {app.deadline}
              </span>
            </div>

            {/* Notes */}
            <textarea
              value={noteVal}
              onChange={e => setNoteVal(e.target.value)}
              onBlur={() => onNoteChange(app.id, noteVal)}
              placeholder="Add a note..."
              rows={2}
              style={{
                width: '100%',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.75rem',
                color: '#4A4A4A',
                backgroundColor: '#F5F0EB',
                border: '0.5px solid #E8E0D5',
                borderRadius: '2px',
                padding: '0.5rem 0.6rem',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.6,
                marginBottom: '0.75rem',
                boxSizing: 'border-box',
              }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: col.color,
                    background: 'none',
                    border: '0.5px solid currentColor',
                    borderRadius: '2px',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    opacity: 0.85,
                  }}
                >
                  Move to <IconChevronDown size={11} />
                </button>

                {showStatusMenu && (
                  <div style={{
                    position: 'absolute',
                    bottom: '110%',
                    left: 0,
                    backgroundColor: '#FDFAF5',
                    border: '0.5px solid #E8E0D5',
                    borderRadius: '3px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    minWidth: '140px',
                    overflow: 'hidden',
                  }}>
                    {COLUMNS.filter(c => c.status !== app.status).map(c => (
                      <button
                        key={c.status}
                        onClick={() => {
                          onStatusChange(app.id, c.status)
                          setShowStatusMenu(false)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: '0.75rem',
                          color: '#1A1A1A',
                          background: 'none',
                          border: 'none',
                          padding: '0.6rem 0.9rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          borderBottom: '0.5px solid #F0EBE3',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE3')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.dot, flexShrink: 0 }} />
                        {c.status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => onDelete(app.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0A0A0', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Remove application"
              >
                <IconTrash />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

// ─── Add modal ────────────────────────────────────────────────────────────────

function AddModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (app: Application) => void
}) {
  const [form, setForm] = useState({
    firm: '',
    role: '',
    type: 'Full-time',
    location: 'Lagos',
    dateApplied: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    deadline: '',
    status: 'Applied' as Status,
    notes: '',
  })

  const field = (key: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }))

  function submit() {
    if (!form.firm.trim() || !form.role.trim()) return
    onAdd({ id: uid(), ...form })
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.85rem',
    color: '#1A1A1A',
    backgroundColor: '#F5F0EB',
    border: '0.5px solid #E8E0D5',
    borderRadius: '2px',
    padding: '0.6rem 0.75rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#4A4A4A',
    marginBottom: '0.35rem',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(10,35,66,0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        backgroundColor: '#FAF7F2',
        border: '0.5px solid #E8E0D5',
        borderRadius: '4px',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0A2342', opacity: 0.6, marginBottom: '0.2rem' }}>
              Application Tracker
            </p>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#1A1A1A' }}>
              Log an application
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A4A4A', padding: '4px' }}>
            <IconX size={18} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 1.25rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Firm</label>
            <input value={form.firm} onChange={e => field('firm', e.target.value)} placeholder="e.g. Templars" style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Role</label>
            <input value={form.role} onChange={e => field('role', e.target.value)} placeholder="e.g. Associate, Banking & Finance" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <select value={form.type} onChange={e => field('type', e.target.value)} style={inputStyle}>
              {['Full-time', 'Internship', 'Vacation Scheme', 'Pupillage', 'NYSC', 'Contract'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => field('status', e.target.value as Status)} style={inputStyle}>
              {COLUMNS.map(c => <option key={c.status}>{c.status}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input value={form.location} onChange={e => field('location', e.target.value)} placeholder="Lagos" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Deadline</label>
            <input value={form.deadline} onChange={e => field('deadline', e.target.value)} placeholder="30 Jun 2025 or Rolling" style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={e => field('notes', e.target.value)} placeholder="Any context worth remembering..." rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#0A2342',
            color: '#FAF7F2',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            border: 'none',
            borderRadius: '2px',
            padding: '0.85rem',
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0D2E57')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0A2342')}
        >
          <IconSend size={14} /> Log Application
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrackerPage() {
  const [apps, setApps] = useState<Application[]>(SEED)
  const [showModal, setShowModal] = useState(false)

  function addApp(app: Application) {
    setApps(prev => [app, ...prev])
  }

  function changeStatus(id: string, status: Status) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  function deleteApp(id: string) {
    setApps(prev => prev.filter(a => a.id !== id))
  }

  function updateNote(id: string, notes: string) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, notes } : a))
  }

  // Stats
  const total = apps.length
  const interviews = apps.filter(a => a.status === 'Interview I' || a.status === 'Interview II').length
  const offers = apps.filter(a => a.status === 'Offer').length
  const responseRate = total > 0
    ? Math.round(((interviews + offers + apps.filter(a => a.status === 'Assessment').length) / total) * 100)
    : 0

  const STATS = [
    { label: 'Applications', value: String(total) },
    { label: 'Interviews', value: String(interviews) },
    { label: 'Offers', value: String(offers) },
    { label: 'Response Rate', value: `${responseRate}%` },
  ]

  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: '#FAF7F2', minHeight: '100vh', paddingTop: '64px' }}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div style={{
          borderBottom: '0.5px solid #E8E0D5',
          backgroundColor: '#FAF7F2',
          padding: '3rem 2rem 0',
          maxWidth: '1440px',
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', paddingBottom: '2rem' }}>
            <div>
              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#0A2342',
                opacity: 0.6,
                marginBottom: '0.4rem',
              }}>
                Application Tracker
              </p>
              <h1 style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                fontWeight: 800,
                color: '#1A1A1A',
                lineHeight: 1.1,
                marginBottom: '0.5rem',
              }}>
                Where you stand.
              </h1>
              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.88rem',
                color: '#6A6A6A',
                lineHeight: 1.6,
              }}>
                Every application, every stage. Forward confirmations to{' '}
                <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', backgroundColor: '#EBF0F7', padding: '1px 5px', borderRadius: '2px', color: '#0A2342' }}>
                  you@mail.esquirely.app
                </code>
                {' '}and we log them automatically.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#0A2342',
                color: '#FAF7F2',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: 'none',
                borderRadius: '2px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0D2E57')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0A2342')}
            >
              <IconPlus /> Log Application
            </button>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'flex',
            borderTop: '0.5px solid #E8E0D5',
            flexWrap: 'wrap',
          }}>
            {STATS.map(({ label, value }, i) => (
              <div key={label} style={{
                flex: '1 1 120px',
                padding: '1.25rem 1.75rem 1.25rem 0',
                borderRight: i < STATS.length - 1 ? '0.5px solid #E8E0D5' : 'none',
                marginRight: i < STATS.length - 1 ? '1.75rem' : 0,
              }}>
                <p style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  lineHeight: 1,
                  marginBottom: '0.2rem',
                }}>
                  {value}
                </p>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#6A6A6A',
                }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Kanban board ────────────────────────────────────────────────── */}
        <div style={{
          padding: '2rem',
          overflowX: 'auto',
          maxWidth: '1440px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            minWidth: '900px',
            alignItems: 'flex-start',
          }}>
            {COLUMNS.map(col => {
              const colApps = apps.filter(a => a.status === col.status)

              return (
                <div
                  key={col.status}
                  style={{
                    flex: '1 1 200px',
                    minWidth: '200px',
                    maxWidth: '280px',
                    backgroundColor: '#F0EBE3',
                    border: '0.5px solid #E8E0D5',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Column header */}
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '0.5px solid #E8E0D5',
                    backgroundColor: '#EAE4DB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: col.dot, flexShrink: 0 }} />
                      <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.09em',
                        textTransform: 'uppercase',
                        color: col.color,
                      }}>
                        {col.status}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#A0A0A0',
                    }}>
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ padding: '0.75rem 0.6rem', minHeight: '120px' }}>
                    {colApps.length === 0 ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem 1rem',
                        color: '#C0B8AE',
                        gap: '0.5rem',
                      }}>
                        <IconInbox size={28} />
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.5 }}>
                          Nothing here yet
                        </p>
                      </div>
                    ) : (
                      colApps.map(app => (
                        <AppCard
                          key={app.id}
                          app={app}
                          onStatusChange={changeStatus}
                          onDelete={deleteApp}
                          onNoteChange={updateNote}
                        />
                      ))
                    )}
                  </div>

                  {/* Add shortcut */}
                  <button
                    onClick={() => setShowModal(true)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '0.65rem',
                      background: 'none',
                      border: 'none',
                      borderTop: '0.5px solid #E8E0D5',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.68rem',
                      color: '#A0A0A0',
                      transition: 'background-color 0.15s ease, color 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#EAE4DB'
                      e.currentTarget.style.color = '#0A2342'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#A0A0A0'
                    }}
                  >
                    <IconPlus size={12} /> Add
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Email forward tip ──────────────────────────────────────────── */}
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto 4rem',
          padding: '0 2rem',
        }}>
          <div style={{
            backgroundColor: '#EBF0F7',
            border: '0.5px solid #C8D8EC',
            borderRadius: '3px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ color: '#0A2342', flexShrink: 0 }}>
              <IconSend size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#0A2342', marginBottom: '0.2rem' }}>
                Auto-log with email forwarding
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A6A8A', lineHeight: 1.5 }}>
                Forward any application confirmation to your Esquirely address and we parse the firm, role, and status automatically. No manual entry needed.
              </p>
            </div>
            <button style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0A2342',
              backgroundColor: 'transparent',
              border: '0.5px solid #0A2342',
              borderRadius: '2px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              flexShrink: 0,
              opacity: 0.8,
            }}>
              Set Up Address <IconArrowRight size={12} />
            </button>
          </div>
        </div>

      </main>

      <Footer />

      {showModal && (
        <AddModal onClose={() => setShowModal(false)} onAdd={addApp} />
      )}
    </>
  )
}
