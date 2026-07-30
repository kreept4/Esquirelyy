'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/**
 * Feature narrative: a vertical stack the reader glides through, rather than a
 * grid of equal cards. One scroll listener drives the whole section — the
 * background eases between colour stops while each block's copy and preview
 * glide in from opposite sides.
 *
 * Colour stops are taken from the palette already used for sectors and statuses
 * elsewhere in the app (verified green, interview blue, energy ochre) so the
 * section stays inside the existing system.
 */

type RGB = [number, number, number]

const STOPS: RGB[] = [
  [26, 26, 26], // ink
  [10, 42, 34], // deep green  — sits under `verified` #2D6A4F
  [10, 34, 58], // deep blue   — sits under `Interview` #0A4A7A
  [46, 32, 10], // deep ochre  — sits under `energy` #7A3B00
  [26, 26, 26], // back to ink
]

const CREAM = '#FAF6F0'

const BLOCKS = [
  {
    title: 'every role, one board',
    desc: 'Filter by employer type, practice area, location, and seniority across law firms, banks, fintechs, NGOs, and regulators. No endless scrolling.',
    href: '/jobs',
    cta: 'Browse roles',
    preview: 'jobs',
  },
  {
    title: 'the whole pipeline, tracked',
    desc: 'Every application in one board, from first submission through assessment, interview, and offer. Nothing slips.',
    href: '/tracker',
    cta: 'Open tracker',
    preview: 'tracker',
  },
  {
    title: 'funding, deadline-tracked',
    desc: 'Local and international scholarships for Nigerian law students and lawyers, curated and watched so you never miss a cycle.',
    href: '/scholarships',
    cta: 'See scholarships',
    preview: 'scholarships',
  },
  {
    title: 'know the firm before you apply',
    desc: 'Tier rankings, practice-area breakdowns, office locations, and hiring history for Nigerian firms.',
    href: '/firms',
    cta: 'Browse firms',
    preview: 'firms',
  },
  {
    title: 'feedback that says something',
    desc: 'CV reviews, cover letter drafts, and interview prep tuned to the Nigerian legal market — specific notes, not platitudes.',
    href: '/tools/cv-review',
    cta: 'Try the tools',
    preview: 'ai',
  },
]

/* ---------------- previews ---------------- */

const panel: React.CSSProperties = {
  border: '1px solid rgba(250,246,240,0.14)',
  borderRadius: '10px',
  backgroundColor: 'rgba(250,246,240,0.05)',
  padding: '1rem',
  backdropFilter: 'blur(6px)',
}

function Bar({ w, dim = false }: { w: string; dim?: boolean }) {
  return <div style={{ height: '8px', width: w, borderRadius: '999px', backgroundColor: `rgba(250,246,240,${dim ? 0.14 : 0.3})` }} />
}

function Preview({ kind }: { kind: string }) {
  if (kind === 'jobs') {
    return (
      <div style={panel}>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
          {['Law firm', 'Lagos', 'Junior'].map((c, i) => (
            <span key={c} className="grotesk-regular" style={{ fontSize: '0.65rem', padding: '3px 11px', borderRadius: '999px', color: i === 0 ? '#1A1A1A' : CREAM, backgroundColor: i === 0 ? CREAM : 'transparent', border: `1px solid rgba(250,246,240,${i === 0 ? 1 : 0.25})` }}>{c}</span>
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0.7rem 0', borderTop: i > 1 ? '1px solid rgba(250,246,240,0.1)' : 'none' }}>
            <Bar w={`${72 - i * 8}%`} />
            <Bar w={`${44 - i * 5}%`} dim />
          </div>
        ))}
      </div>
    )
  }
  if (kind === 'tracker') {
    return (
      <div style={{ ...panel, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
        {['Applied', 'Interview', 'Offer'].map((c, ci) => (
          <div key={c}>
            <p className="grotesk-regular" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(250,246,240,0.45)', marginBottom: '0.6rem' }}>{c}</p>
            {Array.from({ length: 3 - ci }).map((_, i) => (
              <div key={i} style={{ height: '30px', borderRadius: '6px', backgroundColor: 'rgba(250,246,240,0.1)', marginBottom: '5px' }} />
            ))}
          </div>
        ))}
      </div>
    )
  }
  if (kind === 'scholarships') {
    return (
      <div style={panel}>
        {['Chevening', 'Commonwealth', 'Fordham'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: i > 0 ? '1px solid rgba(250,246,240,0.1)' : 'none' }}>
            <span className="grotesk-regular" style={{ fontSize: '0.8rem', color: CREAM }}>{s}</span>
            <span className="grotesk-regular" style={{ fontSize: '0.62rem', padding: '3px 10px', borderRadius: '999px', color: CREAM, border: '1px solid rgba(250,246,240,0.25)' }}>{i === 0 ? 'Open' : 'Upcoming'}</span>
          </div>
        ))}
      </div>
    )
  }
  if (kind === 'firms') {
    return (
      <div style={panel}>
        {[['AO', 'Tier 1'], ['TM', 'Tier 1'], ['BA', 'Boutique']].map(([m, t], i) => (
          <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 0', borderTop: i > 0 ? '1px solid rgba(250,246,240,0.1)' : 'none' }}>
            <span className="grotesk-bold" style={{ width: '30px', height: '30px', borderRadius: '999px', border: '1px solid rgba(250,246,240,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: CREAM, flexShrink: 0 }}>{m}</span>
            <Bar w="45%" />
            <span className="grotesk-regular" style={{ marginLeft: 'auto', fontSize: '0.62rem', color: 'rgba(250,246,240,0.5)' }}>{t}</span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={panel}>
      {['Your third bullet buries the result.', 'Opens with the firm, not with you.', 'Answer ran long — cut the preamble.'].map((l, i) => (
        <p key={i} className="grotesk-regular" style={{ fontSize: '0.78rem', lineHeight: 1.5, color: 'rgba(250,246,240,0.8)', padding: '0.7rem 0', borderTop: i > 0 ? '1px solid rgba(250,246,240,0.1)' : 'none' }}>{l}</p>
      ))}
    </div>
  )
}

/* ---------------- block ---------------- */

function Block({ block, flip }: { block: (typeof BLOCKS)[number]; flip: boolean }) {
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
  const glide = (from: number) => ({
    opacity: ease,
    transform: `translate3d(${from * (1 - ease)}px, ${28 * (1 - ease)}px, 0)`,
    transition: 'opacity 0.1s linear',
  })

  return (
    <div
      ref={ref}
      className="glide-block"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
        padding: '7rem 0',
      }}
    >
      <div style={{ ...glide(flip ? 40 : -40), order: flip ? 2 : 1 }}>
        <h3 className="display-black" style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.9rem)', color: CREAM, lineHeight: 1.08, marginBottom: '1rem' }}>
          {block.title}
        </h3>
        <p className="grotesk-regular" style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(250,246,240,0.62)', maxWidth: '44ch', marginBottom: '1.75rem' }}>
          {block.desc}
        </p>
        <Link
          href={block.href}
          className="grotesk-bold glide-cta"
          style={{ display: 'inline-block', padding: '0.8rem 1.9rem', borderRadius: '999px', fontSize: '0.8rem', color: '#1A1A1A', backgroundColor: CREAM, textDecoration: 'none' }}
        >
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

  // Walk the colour stops as the reader moves through the section.
  const seg = t * (STOPS.length - 1)
  const i = Math.min(Math.floor(seg), STOPS.length - 2)
  const f = seg - i
  const c = (n: 0 | 1 | 2) => Math.round(STOPS[i][n] + (STOPS[i + 1][n] - STOPS[i][n]) * f)
  const bg = `rgb(${c(0)},${c(1)},${c(2)})`

  return (
    <section ref={ref} style={{ backgroundColor: bg, transition: 'background-color 0.08s linear' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '7rem 1.5rem 5rem' }}>
        <h2 className="display-black" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', color: CREAM, lineHeight: 1.05, maxWidth: '15ch' }}>
          everything you need, in one place.
        </h2>
      </div>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {BLOCKS.map((b, idx) => (
          <Block key={b.title} block={b} flip={idx % 2 === 1} />
        ))}
      </div>
    </section>
  )
}
