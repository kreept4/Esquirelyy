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
 * Headline and body colour are derived from the live background's luminance
 * rather than hardcoded, so cream text never lands on sky blue and dark text
 * never lands on ink as the colours cross over mid-scroll. The preview panels
 * are a fixed carton brown, so their contents are measured against that instead.
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

/** Tone for the headline and body copy, which sit directly on the changing
 *  background and so have to follow its luminance. */
function toneFor(rgb: RGB): Tone {
  const light = isLight(rgb)
  return light
    ? { fg: INK, soft: 'rgba(18,16,14,0.68)', line: 'rgba(18,16,14,0.14)', fill: 'rgba(255,255,255,0.55)', chipBg: INK, chipFg: CREAM }
    : { fg: CREAM, soft: 'rgba(250,246,240,0.66)', line: 'rgba(250,246,240,0.16)', fill: 'rgba(250,246,240,0.07)', chipBg: CREAM, chipFg: INK }
}

/** Panels are solid carton stock rather than glass, so everything inside them is
 *  measured against that fixed colour instead of the section background.
 *  #FFF8E5 with a black rule is the "Speak to a Lawyer" button from the law-firm
 *  project; on a light panel the contents run ink, not cream. */
const CARTON = '#FFF8E5'
const CARTON_RULE = '#000000'
const PANEL_TONE: Tone = {
  fg: '#12100E',
  soft: 'rgba(18,16,14,0.66)',
  line: 'rgba(18,16,14,0.16)',
  fill: 'rgba(18,16,14,0.04)',
  chipBg: '#12100E',
  chipFg: CARTON,
}

const BLOCKS = [
  { title: 'every role, one board', desc: 'Filter by employer type, practice area, location, and seniority across law firms, banks, fintechs, NGOs, and regulators. No endless scrolling.', href: '/jobs', cta: 'Browse roles', preview: 'jobs' },
  { title: 'the whole pipeline, tracked', desc: 'Every application in one board, from first submission through assessment, interview, and offer. Nothing slips.', href: '/tracker', cta: 'Open tracker', preview: 'tracker' },
  { title: 'funding, deadline-tracked', desc: 'Local and international scholarships for Nigerian law students and lawyers, curated and watched so you never miss a cycle.', href: '/scholarships', cta: 'See scholarships', preview: 'scholarships' },
  { title: 'know the firm before you apply', desc: 'Tier rankings, practice-area breakdowns, office locations, and hiring history for Nigerian firms.', href: '/firms', cta: 'Browse firms', preview: 'firms' },
  { title: 'feedback that says something', desc: 'CV reviews, cover letter drafts, and interview prep tuned to the Nigerian legal market: specific notes, not platitudes.', href: '/tools/cv-review', cta: 'Try the tools', preview: 'ai' },
]

/* ---------------- previews: real UI, real copy ---------------- */

function Panel({ children, pad = '1.1rem' }: { children: React.ReactNode; pad?: string }) {
  return (
    // Solid carton stock, no backdrop blur. The glass finish read as generic and
    // fought the bright stops behind it; a flat card with a hard black rule holds
    // its own against every colour in the sequence.
    <div style={{ backgroundColor: CARTON, border: `1.5px solid ${CARTON_RULE}`, borderRadius: '10px', padding: pad, boxShadow: '6px 8px 0 rgba(0,0,0,0.85)' }}>
      {children}
    </div>
  )
}

/** Dotted spiral linking one block to the next, so the eye is led down the
 *  narrative instead of jumping. Mirrored to follow the alternating layout.
 *  The arrowhead is a marker with orient="auto" so it stays aligned to the curve
 *  (and to the mirrored curve) instead of being hand-placed and drifting. */
function Connector({ flip, id }: { flip: boolean; id: string }) {
  const head = `arrow-${id}`
  return (
    <div aria-hidden="true" className="glide-connector">
      {/* Spans the full block width so the stem leaves the panel above (x≈760 in
          viewBox units, the centre of the right-hand column) and the head lands
          on the panel below (x≈268, the left column). Mirrored on alternate
          blocks because the panels swap sides. */}
      <svg viewBox="0 0 1000 130" fill="none" className="glide-connector-svg" style={{ transform: flip ? 'scaleX(-1)' : 'none', overflow: 'visible' }}>
        <defs>
          <marker id={head} viewBox="0 0 16 16" refX="11" refY="8" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M2 1.5 L13 8 L2 14.5" fill="none" stroke="#000000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        <path
          d="M760 2
             C762 28 720 46 660 54
             C590 63 520 46 470 56
             C432 64 428 92 462 96
             C492 99 500 74 478 64
             C450 51 396 62 356 76
             C320 89 292 104 268 120"
          stroke="#000000"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeDasharray="0.1 11"
          markerEnd={`url(#${head})`}
        />
      </svg>
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
  // Landscape plate, not a circle. Most of these marks are wide wordmarks, and a
  // circle forces them to shrink to its inscribed width, which is what left small
  // rectangles floating in big round holes.
  const w = Math.round(size * 1.6)
  return (
    <span style={{ width: w, height: size, borderRadius: '6px', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: url ? '#FFFFFF' : tone.chipBg, border: '1px solid rgba(0,0,0,0.1)' }}>
      {url ? (
        <img src={url} alt={employer} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
      ) : (
        <span className="grotesk-bold" style={{ fontSize: size * 0.36, color: tone.chipFg, letterSpacing: '0.02em' }}>{initials}</span>
      )}
    </span>
  )
}

function Preview({ kind }: { kind: string }) {
  const tone = PANEL_TONE

  if (kind === 'jobs') {
    const rows = [
      ['Associate, Corporate & Commercial', 'Aluko & Oyebode', 'Lagos', 'Verified'],
      ['Vacation Scheme 2027', 'Templars', 'Lagos', 'Closing soon'],
      ['Legal Trainee, Compliance', 'Zenith Bank Plc', 'Lagos', 'Rolling'],
    ]
    return (
      <Panel>
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
      <Panel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
          {cols.map(([label, items]) => (
            <div key={label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span className="grotesk-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tone.soft }}>{label}</span>
                <span className="grotesk-regular" style={{ fontSize: '0.6rem', color: tone.soft }}>{items.length}</span>
              </div>
              {items.map((n) => (
                // Logo above the name rather than beside it: three columns inside
                // the panel leaves no horizontal room, and an inline mark shrank
                // to about 13px, which is why it was barely visible.
                <div key={n} style={{ border: `1px solid ${tone.line}`, borderRadius: '10px', padding: '0.6rem', marginBottom: '6px', backgroundColor: tone.fill }}>
                  <Mark employer={n} tone={tone} size={30} />
                  <p className="grotesk-regular" style={{ fontSize: '0.64rem', color: tone.fg, lineHeight: 1.25, marginTop: '0.45rem' }}>{n}</p>
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
      <Panel>
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
    // Names only: Mark resolves the logo from the directory.
    const rows = [
      ['Aluko & Oyebode', 'Tier 1', 'Corporate · Energy · Capital markets'],
      ['Banwo & Ighodalo', 'Tier 1', 'Banking · Capital markets'],
      ['Detail Solicitors', 'Boutique', 'Energy · Dispute resolution'],
    ]
    return (
      <Panel>
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

  // A before/after on one CV line, not a case study. Naming a firm implied an
  // endorsement and made the reader work out why that firm mattered; three
  // abstract critiques asked them to imagine a scenario they'd never seen. One
  // rewritten bullet shows the value in the time it takes to read it.
  const label: React.CSSProperties = {
    fontSize: '0.58rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: tone.soft,
    marginBottom: '0.4rem',
  }
  return (
    <Panel pad="1.3rem">
      <p className="grotesk-bold" style={label}>What you wrote</p>
      <p className="grotesk-regular" style={{ fontSize: '0.85rem', color: tone.soft, lineHeight: 1.55, fontStyle: 'italic' }}>
        &ldquo;Assisted with various corporate matters and general legal research.&rdquo;
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', margin: '1rem 0' }}>
        <span style={{ flex: 1, height: '1px', backgroundColor: tone.line }} />
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tone.fg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
        <span style={{ flex: 1, height: '1px', backgroundColor: tone.line }} />
      </div>

      <p className="grotesk-bold" style={label}>What we&rsquo;d send</p>
      <p className="grotesk-regular" style={{ fontSize: '0.88rem', color: tone.fg, lineHeight: 1.55 }}>
        &ldquo;Drafted share purchase agreements on a &#8358;2.1bn acquisition, closing three weeks ahead of schedule.&rdquo;
      </p>
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
    <div ref={ref} className="glide-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', padding: '4.5rem 0 3rem' }}>
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
        <Preview kind={block.preview} />
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
      <div style={{ maxWidth: 'min(1800px, 94vw)', margin: '0 auto', padding: '7rem 1.5rem 3rem' }}>
        <h2 className="display-black" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', color: tone.fg, lineHeight: 1.05, maxWidth: '15ch' }}>
          everything you need, in one place.
        </h2>
      </div>
      <div style={{ maxWidth: 'min(1800px, 94vw)', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {BLOCKS.map((b, idx) => (
          <div key={b.title}>
            <Block block={b} flip={idx % 2 === 1} tone={tone} />
            {idx < BLOCKS.length - 1 && <Connector flip={idx % 2 === 1} id={String(idx)} />}
          </div>
        ))}
      </div>
    </section>
  )
}
