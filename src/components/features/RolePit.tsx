'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { logoForEmployer } from '@/lib/firms-data'

/**
 * Ball pit of open roles. Each ball carries an employer mark; tap one and it
 * expands into the opening's details.
 *
 * Every ball is a real <button> with an accessible label, and the detail card is
 * real DOM — the physics only moves elements around, it never becomes the only
 * route to the content. Under prefers-reduced-motion the simulation never
 * starts and the balls lay out as a static grid.
 */

const INK = '#1A1A1A'
const CREAM = '#FAF7F2'
const BORDER = '#E8E0D5'
const MUTED = '#8A8378'
const CARTON = '#FFF8E5'

const GRAVITY = 0.42
const DAMPING = 0.986
const BOUNCE = 0.62

type Ball = { x: number; y: number; vx: number; vy: number; r: number }

const TYPE_LABELS: Record<string, string> = {
  job: 'Full-time',
  internship: 'Internship',
  vacation_scheme: 'Vacation scheme',
  pupillage: 'Pupillage',
}

/** Most employers here are banks, fintechs and corporates with no logo asset in
 *  the directory. Initials on a white ball read as an empty circle, so those get
 *  a filled ball in their sector colour instead — designed, not missing. */
const SECTOR_FILL: Record<string, string> = {
  law_firm: '#1A1A1A',
  banking: '#0EA5E9',
  energy: '#F97316',
  fintech: '#22C55E',
  other: '#EF4444',
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'the', 'plc', 'inc.', 'inc'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

function deadlineLabel(l: any) {
  if (l.is_rolling) return 'Rolling'
  if (!l.deadline) return 'Open'
  return new Date(l.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export default function RolePit({ listings }: { listings: any[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const ballsRef = useRef<Ball[]>([])
  const nodesRef = useRef<(HTMLButtonElement | null)[]>([])
  const frameRef = useRef(0)
  const dragRef = useRef<{ i: number; dx: number; dy: number } | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  const roles = useMemo(() => listings.slice(0, 11), [listings])

  const layout = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const { width, height } = wrap.getBoundingClientRect()
    const r = Math.max(34, Math.min(58, width / 16))
    const perRow = Math.max(1, Math.floor((width - r) / (r * 2.2)))
    ballsRef.current = roles.map((_, i) => ({
      // Start inside the box, laid out in rows. They used to start above the
      // container and only became visible once the simulation dropped them in,
      // so any frame the loop did not run — throttled tab, reduced motion, a
      // slow first paint — showed an empty pit.
      x: r + (i % perRow) * r * 2.2 + (Math.random() - 0.5) * r * 0.3,
      y: r + Math.floor(i / perRow) * r * 2.2,
      vx: (Math.random() - 0.5) * 2.4,
      vy: 0,
      r,
    }))
    // Paint the starting positions immediately rather than waiting for frame one.
    ballsRef.current.forEach((b, i) => {
      const node = nodesRef.current[i]
      if (node) node.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`
    })
    if (height) setReady(true)
  }, [roles])

  useEffect(() => {
    layout()
    window.addEventListener('resize', layout)
    return () => window.removeEventListener('resize', layout)
  }, [layout])

  useEffect(() => {
    if (!ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const wrap = wrapRef.current
    if (!wrap) return

    const step = () => {
      frameRef.current = requestAnimationFrame(step)
      const { width, height } = wrap.getBoundingClientRect()
      const balls = ballsRef.current

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i]
        if (dragRef.current?.i === i) continue
        b.vy += GRAVITY
        b.vx *= DAMPING
        b.vy *= DAMPING
        b.x += b.vx
        b.y += b.vy

        if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) * BOUNCE }
        if (b.x + b.r > width) { b.x = width - b.r; b.vx = -Math.abs(b.vx) * BOUNCE }
        if (b.y + b.r > height) { b.y = height - b.r; b.vy = -Math.abs(b.vy) * BOUNCE }
      }

      // Pairwise separation. n is at most 11, so the naive O(n^2) pass is far
      // cheaper than any spatial index would be here.
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i], b = balls[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const dist = Math.hypot(dx, dy) || 0.01
          const overlap = a.r + b.r - dist
          if (overlap <= 0) continue
          const nx = dx / dist, ny = dy / dist
          const push = overlap / 2
          a.x -= nx * push; a.y -= ny * push
          b.x += nx * push; b.y += ny * push
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
          if (rel < 0) {
            const imp = rel * BOUNCE
            a.vx += imp * nx; a.vy += imp * ny
            b.vx -= imp * nx; b.vy -= imp * ny
          }
        }
      }

      for (let i = 0; i < balls.length; i++) {
        const node = nodesRef.current[i]
        if (!node) continue
        const b = balls[i]
        node.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`
      }
    }

    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [ready])

  function onPointerDown(e: React.PointerEvent, i: number) {
    const wrap = wrapRef.current
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    const b = ballsRef.current[i]
    dragRef.current = { i, dx: e.clientX - rect.left - b.x, dy: e.clientY - rect.top - b.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current
    const wrap = wrapRef.current
    if (!d || !wrap) return
    const rect = wrap.getBoundingClientRect()
    const b = ballsRef.current[d.i]
    const nx = e.clientX - rect.left - d.dx
    const ny = e.clientY - rect.top - d.dy
    b.vx = nx - b.x
    b.vy = ny - b.y
    b.x = nx
    b.y = ny
  }

  function onPointerUp() {
    dragRef.current = null
  }

  const active = open !== null ? roles[open] : null

  return (
    <section style={{ borderBottom: `0.5px solid ${BORDER}`, backgroundColor: CREAM, overflow: 'hidden' }}>
      <div style={{ maxWidth: 'min(2200px, 94vw)', margin: '0 auto', padding: '5rem 1.5rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <h2 className="display-black" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', color: INK, lineHeight: 1.05 }}>
            open right now.
          </h2>
          <Link href="/jobs" className="grotesk-bold" style={{ fontSize: '0.78rem', color: INK, textDecoration: 'none', paddingBottom: '0.35rem', borderBottom: `1px solid ${INK}` }}>
            View all roles
          </Link>
        </div>
        <div ref={wrapRef} className="role-pit" style={{ marginTop: '1.5rem' }} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          {roles.map((l, i) => {
            const url = logoForEmployer(l.employer)
            const fill = SECTOR_FILL[l.sector] || SECTOR_FILL.other
            const size = ballsRef.current[i]?.r ? ballsRef.current[i].r * 2 : 90
            return (
              <button
                key={l.id}
                ref={el => { nodesRef.current[i] = el }}
                className="role-pit-ball"
                onPointerDown={e => onPointerDown(e, i)}
                onClick={() => setOpen(open === i ? null : i)}
                aria-label={`${l.title} at ${l.employer}`}
                style={{ width: size, height: size, backgroundColor: url ? '#FFFFFF' : fill }}
              >
                {url ? (
                  <img src={url} alt="" style={{ maxWidth: '68%', maxHeight: '68%', objectFit: 'contain' }} />
                ) : (
                  <span className="display-black" style={{ fontSize: size * 0.3, color: '#FFF8E5', letterSpacing: '-0.02em' }}>
                    {initials(l.employer)}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {active && (
          <div className="role-pit-card" style={{ backgroundColor: CARTON, border: `1.5px solid ${INK}`, borderRadius: '10px', boxShadow: '6px 8px 0 rgba(0,0,0,0.85)' }}>
            <button onClick={() => setOpen(null)} aria-label="Close" className="role-pit-close">×</button>
            <p className="grotesk-bold" style={{ fontSize: '0.72rem', color: MUTED, marginBottom: '0.3rem' }}>{active.employer}</p>
            <h3 className="display-bold" style={{ fontSize: 'clamp(1.15rem, 2vw, 1.6rem)', color: INK, lineHeight: 1.2, marginBottom: '0.75rem' }}>
              {active.title}
            </h3>
            <p className="grotesk-regular" style={{ fontSize: '0.78rem', color: '#4A4A4A', marginBottom: '1.1rem' }}>
              {[TYPE_LABELS[active.type] || active.type, active.location, deadlineLabel(active)].filter(Boolean).join(' · ')}
            </p>
            <Link href={'/jobs/' + active.slug} className="grotesk-bold" style={{ display: 'inline-block', padding: '0.65rem 1.5rem', borderRadius: '999px', fontSize: '0.76rem', backgroundColor: INK, color: CARTON, textDecoration: 'none' }}>
              View role
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
