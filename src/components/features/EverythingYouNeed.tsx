'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { logoUrl, logoForEmployer } from '@/lib/firms-data'

/**
 * Feature narrative: a vertical stack the reader glides through, rather than a
 * grid of equal cards. One scroll listener drives the whole section, easing the
 * background between bright colour stops while each block's copy and preview
 * glide in from opposite sides.
 *
 * Foreground colour is derived from the live background's luminance rather than
 * hardcoded, so cream text never lands on sky blue and dark text never lands on
 * ink as the colours cross over mid-scroll.
 */

type RGB = [number, number, number]

const STOPS: RGB[] = [
  [26, 26, 26],   // ink
  [56, 189, 248], // sky blue
  [249, 115, 22], // orange
  [239, 68, 68],  // red
  [34, 197, 94],  // green
  [26, 26, 26],   // ink
]

const INK = '#12100E'
const CREAM = '#FAF6F0'

/** Relative luminance, sRGB. Above ~0.45 the background needs dark text. */
function isLight([r, g, b]: RGB) {
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.45
}

type Tone = { fg: string; soft: string; line: string; fill: string; chipBg: string; chipFg: string }

function toneFor(rgb: RGB): Tone {
  const light = isLight(rgb)
  return light
    ? { fg: INK, soft: 'rgba(18,16,14,0.68)', line: 'rgba(18,16,14,0.14)', fill: 'rgba(255,255,255,0.55)', chipBg: INK, chipFg: CREAM }
    : { fg: CREAM, soft: 'rgba(250,246,240,0.66)', line: 'rgba(250,246,240,0.16)', fill: 'rgba(250,246,240,0.07)', chipBg: CREAM, chipFg: INK }
}

const BLOCKS = [
  { title: 'every role, one board', desc: 'Filter by employer type, practice area, location, and seniority across law firms, banks, fintechs, NGOs, and regulators. No endless scrolling.', href: '/jobs', cta: 'Browse roles', preview: 'jobs' },
  { title: 'the whole pipeline, tracked', desc: 'Every application in one board, from first submission through assessment, interview, and offer. Nothing slips.', href: '/tracker', cta: 'Open tracker', preview: 'tracker' },
  { title: 'funding, deadline-tracked', desc: 'Local and international scholarships for Nigerian law students and lawyers, curated and watched so you never miss a cycle.', href: '/scholarships', cta: 'See scholarships', preview: 'scholarships' },
  { title: 'know the firm before you apply', desc: 'Tier rankings, practice-area breakdowns, office locations, and hiring history for Nigerian firms.', href: '/firms', cta: 'Browse firms', preview: 'firms' },
  { title: 'feedback that says something', desc: 'CV reviews, cover letter drafts, and interview prep tuned to the Nigerian legal market: specific notes, not platitudes.', href: '/tools/cv-review', cta: 'Try the tools', preview: 'ai' },
]

/* ---------------- previews: real UI, real copy ---------------- */

function Panel({ tone, children, pad = '1.1rem' }: { tone: Tone; children: React.ReactNode; pad?: string }) {
  return (
    <div style={{ border: `1px solid ${tone.line}`, borderRadius: '14px', backgroundColor: tone.fill, padding: pad, backdropFilter: 'blur(10px)', boxShadow: '0 18px 50px rgba(0,0,0,0.16)' }}>
      {children}
    </div>
  )
}

function Chip({ tone, label, solid = false }: { tone: Tone; label: string; solid?: boolean }) {
  return (
    <span className="grotesk-regular" style={{ fontSize: '0.68rem', padding: '4px 12px', borderRadius: '999px', whiteSpace: 'nowrap', color: solid ? tone.chipFg : tone.fg, backgroundColor: solid ? tone.chipBg : 'transparent', border: `1px solid ${solid ? tone.chipBg : tone.line}` }}>
      {label}
    </span>
  )
}

function Row({ tone, first, children }: { tone: Tone; first: boolean; children: React.ReactNode }) {
  return <div style={{ padding: '0.8rem 0', borderTop: first ? 'none' : `1px solid ${tone.line}` }}>{children}</div>
}

/** Employer mark. Falls back to initials only when the employer isn't a firm in
 *  the directory (banks, fintechs), never as a generic grey placeholder. */
function Mark({ employer, tone, size = 30 }: { employer: string; tone: Tone; size?: number }) {
  const url = logoForEmployer(employer)
  const initials = employer
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'the', 'plc', 'inc.', 'inc'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
  return (
    <span style={{ width: size, height: size, borderRadius: '999px', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: url ? '#FFFFFF' : tone.chipBg, border: `1px solid ${tone.line}` }}>
      {url ? (
        <img src={url} alt={employer} width={size} height={size} style={{ objectFit: 'contain', maxWidth: '76%', maxHeight: '76%', width: 'auto', height: 'auto' }} />
      ) : (
        <span className="grotesk-bold" style={{ fontSize: size * 0.32, color: tone.chipFg }}>{initials}</span>
      )}
    </span>
  )
}

function Preview({ kind, tone }: { kind: string; tone: Tone }) {
  if (kind === 'jobs') {
    const rows = [
      ['Associate, Corporate & Commercial', 'Aluko & Oyebode', 'Lagos', 'Verified'],
      ['Vacation Scheme 2027', 'Templars', 'Lagos', 'Closing soon'],
      ['Legal Trainee, Compliance', 'Zenith Bank Plc', 'Lagos', 'Rolling'],
    ]
    return (
      <Panel tone={tone}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
          <Chip tone={tone} label="Law firm" solid />
          <Chip tone={tone} label="Lagos" />
          <Chip tone={tone} label="Junior" />
        </div>
        {rows.map(([title, org, loc, tag], i) => (
          <Row key={title} tone={tone} first={i === 0}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <Mark employer={org} tone={tone} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.75rem' }}>
                  <p className="grotesk-bold" style={{ fontSize: '0.82rem', color: tone.fg, lineHeight: 1.3 }}>{title}</p>
                  <span className="grotesk-regular" style={{ fontSize: '0.62rem', color: tone.soft, whiteSpace: 'nowrap' }}>{tag}</span>
                </div>
                <p className="grotesk-regular" style={{ fontSize: '0.72rem', color: tone.soft, marginTop: '2px' }}>{org} · {loc}</p>
              </div>
            </div>
          </Row>
        ))}
      </Panel>
    )
  }

  if (kind === 'tracker') {
    const cols: [string, string[]][] = [
      ['Applied', ['Banwo & Ighodalo', 'Detail Solicitors', 'MTN Nigeria']],
      ['Interview', ['Templars', 'Flutterwave']],
      ['Offer', ['Aluko & Oyebode']],
    ]
    return (
      <Panel tone={tone}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
          {cols.map(([label, items]) => (
            <div key={label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span className="grotesk-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tone.soft }}>{label}</span>
                <span className="grotesk-regular" style={{ fontSize: '0.6rem', color: tone.soft }}>{items.length}</span>
              </div>
              {items.map((n) => (
                <div key={n} style={{ border: `1px solid ${tone.line}`, borderRadius: '8px', padding: '0.5rem 0.55rem', marginBottom: '5px', backgroundColor: tone.fill, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mark employer={n} tone={tone} size={18} />
                  <p className="grotesk-regular" style={{ fontSize: '0.62rem', color: tone.fg, lineHeight: 1.2, minWidth: 0 }}>{n}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Panel>
    )
  }

  if (kind === 'scholarships') {
    const rows = [
      ['Chevening Scholarship', 'UK Government', 'Fully funded', 'Open'],
      ['Commonwealth Shared Scholarship', 'CSC', 'Full tuition + stipend', 'Upcoming'],
      ['Fordham International Law', 'Fordham Law', 'Partial tuition', 'Feb 1'],
    ]
    return (
      <Panel tone={tone}>
        {rows.map(([name, provider, amount, status], i) => (
          <Row key={name} tone={tone} first={i === 0}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ minWidth: 0 }}>
                <p className="grotesk-bold" style={{ fontSize: '0.8rem', color: tone.fg, lineHeight: 1.3 }}>{name}</p>
                <p className="grotesk-regular" style={{ fontSize: '0.7rem', color: tone.soft, marginTop: '2px' }}>{provider} · {amount}</p>
              </div>
              <Chip tone={tone} label={status} solid={i === 0} />
            </div>
          </Row>
        ))}
      </Panel>
    )
  }

  if (kind === 'firms') {
    // Real logos off the same storage bucket the directory uses. White plate
    // behind them because most are dark marks on transparent/white.
    const rows = [
      ['aluko-oyebode.jpg', 'Aluko & Oyebode', 'Tier 1', 'Corporate · Energy · Capital markets'],
      ['banwo-ighodalo.jpg', 'Banwo & Ighodalo', 'Tier 1', 'Banking · Capital markets'],
      ['Detail solicitors.jpg', 'Detail Solicitors', 'Boutique', 'Energy · Dispute resolution'],
    ]
    return (
      <Panel tone={tone}>
        {rows.map(([name, tier, areas], i) => (
          <Row key={name} tone={tone} first={i === 0}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <Mark employer={name} tone={tone} size={38} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="grotesk-bold" style={{ fontSize: '0.8rem', color: tone.fg }}>{name}</p>
                <p className="grotesk-regular" style={{ fontSize: '0.66rem', color: tone.soft, marginTop: '1px' }}>{areas}</p>
              </div>
              <span className="grotesk-regular" style={{ fontSize: '0.62rem', color: tone.soft, whiteSpace: 'nowrap' }}>{tier}</span>
            </div>
          </Row>
        ))}
      </Panel>
    )
  }

  const notes = [
    ['CV review', 'Your third bullet buries the result. Lead with the outcome, then the matter.'],
    ['Cover letter', 'This opens with you. Open with the firm and what you noticed about their work.'],
    ['Interview prep', 'Answer ran 90 seconds. Cut the preamble and start at the decision you made.'],
  ]
  return (
    <Panel tone={tone}>
      {notes.map(([label, note], i) => (
        <Row key={label} tone={tone} first={i === 0}>
          <p className="grotesk-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tone.soft, marginBottom: '0.35rem' }}>{label}</p>
          <p className="grotesk-regular" style={{ fontSize: '0.78rem', color: tone.fg, lineHeight: 1.5 }}>{note}</p>
        </Row>
      ))}
    </Panel>
  )
}

/* ---------------- block ---------------- */

function Block({ block, flip, tone }: { block: (typeof BLOCKS)[number]; flip: boolean; tone: Tone }) {
  const ref = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const r = el.getBoundingClientRect()
        const h = window.innerHeight
        setP(Math.min(Math.max((h * 0.85 - r.top) / (h * 0.55), 0), 1))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const ease = p * p * (3 - 2 * p)
  const glide = (from: number): React.CSSProperties => ({
    opacity: ease,
    transform: `translate3d(${from * (1 - ease)}px, ${28 * (1 - ease)}px, 0)`,
  })

  return (
    <div ref={ref} className="glide-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', padding: '7rem 0' }}>
      <div style={{ ...glide(flip ? 40 : -40), order: flip ? 2 : 1 }}>
        <h3 className="display-black" style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.9rem)', color: tone.fg, lineHeight: 1.08, marginBottom: '1rem' }}>
          {block.title}
        </h3>
        <p className="grotesk-regular" style={{ fontSize: '0.95rem', lineHeight: 1.75, color: tone.soft, maxWidth: '44ch', marginBottom: '1.75rem' }}>
          {block.desc}
        </p>
        <Link href={block.href} className="grotesk-bold glide-cta" style={{ display: 'inline-block', padding: '0.8rem 1.9rem', borderRadius: '999px', fontSize: '0.8rem', color: tone.chipFg, backgroundColor: tone.chipBg, textDecoration: 'none' }}>
          {block.cta}
        </Link>
      </div>
      <div style={{ ...glide(flip ? -40 : 40), order: flip ? 1 : 2 }}>
        <Preview kind={block.preview} tone={tone} />
      </div>
    </div>
  )
}

/* ---------------- section ---------------- */

export default function EverythingYouNeed() {
  const ref = useRef<HTMLElement>(null)
  const [t, setT] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const r = el.getBoundingClientRect()
        const total = r.height - window.innerHeight
        setT(total <= 0 ? 0 : Math.min(Math.max(-r.top / total, 0), 1))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const seg = t * (STOPS.length - 1)
  const i = Math.min(Math.floor(seg), STOPS.length - 2)
  const f = seg - i
  const rgb: RGB = [0, 1, 2].map((n) => Math.round(STOPS[i][n] + (STOPS[i + 1][n] - STOPS[i][n]) * f)) as RGB
  const tone = toneFor(rgb)

  return (
    <section ref={ref} style={{ backgroundColor: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`, transition: 'background-color 0.08s linear' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '7rem 1.5rem 3rem' }}>
        <h2 className="display-black" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', color: tone.fg, lineHeight: 1.05, maxWidth: '15ch' }}>
          everything you need, in one place.
        </h2>
      </div>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {BLOCKS.map((b, idx) => (
          <Block key={b.title} block={b} flip={idx % 2 === 1} tone={tone} />
        ))}
      </div>
    </section>
  )
}
