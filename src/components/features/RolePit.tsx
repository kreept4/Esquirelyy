'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { logoForEmployer, ballBgForEmployer } from '@/lib/firms-data'

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
const MUTED = '#8A8378'
const CARTON = '#FFF8E5'

/* The section sits inside the page's dark opening act now, so the palette is
   inverted: cream type on black, and the hairlines become low-opacity cream
   rather than the beige border that only existed to show up on cream. */
const BLACK = '#000000'
const ON_BLACK_LINE = 'rgba(250, 247, 242, 0.14)'
const ON_BLACK_MUTED = 'rgba(250, 247, 242, 0.55)'

const GRAVITY = 0.42
const DAMPING = 0.986
const BOUNCE = 0.62

type Ball = { x: number; y: number; vx: number; vy: number; r: number }

const TYPE_LABELS: Record<string, string> = {
  job: 'Full-time',
  internship: 'Internship',
}

/** Most employers here are banks, fintechs and corporates with no logo asset in
 *  the directory. Initials on a plain white ball read as an empty circle, so
 *  those get a filled ball in their sector colour instead: designed, not
 *  missing.
 *
 *  law_firm was #1A1A1A, which worked on the old cream ground and vanished
 *  completely once the section went black. It is carton now, the same warm
 *  off-white the detail card uses, so it stays the quiet one of the set without
 *  disappearing. Each fill carries its own foreground so the initials keep
 *  contrast whichever way the fill goes. */
const SECTOR_FILL: Record<string, { bg: string; fg: string }> = {
  law_firm: { bg: '#FFF8E5', fg: '#1A1A1A' },
  banking: { bg: '#0EA5E9', fg: '#FFFFFF' },
  energy: { bg: '#F97316', fg: '#1A1A1A' },
  fintech: { bg: '#22C55E', fg: '#1A1A1A' },
  other: { bg: '#EF4444', fg: '#FFFFFF' },
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

/**
 * Employer mark inside a ball, scaled by optical area rather than by a shared
 * bounding box.
 *
 * The marks vary in aspect from 0.85 (Access Bank, upright) to 2.60 (Union
 * Bank, a long wordmark). Capping every one at 68% of the ball meant the wide
 * marks were width-bound and rendered about a quarter of the ball tall, while
 * near-square marks filled it, so identical treatment produced wildly different
 * visual weight around the pit.
 *
 * Normalising area instead gives each mark roughly the same amount of ink. The
 * natural size is read on load rather than kept in a table, so a replaced or
 * newly added logo corrects itself.
 */
function BallMark({ src }: { src: string }) {
  const [ratio, setRatio] = useState<number | null>(null)

  // The circle's inscribed square, as a fraction of the ball's box.
  const S = 0.707
  // Area a square mark should occupy inside that square. Everything else is
  // matched to it. 0.82 puts a square mark at about 58% of the ball's width,
  // which is the point where the mark reads as the ball's content rather than
  // as something floating in the middle of it.
  const FILL = 0.82
  const AREA = (FILL * S) ** 2

  let w = S * FILL
  let h = S * FILL
  if (ratio) {
    h = Math.sqrt(AREA / ratio)
    w = ratio * h
    // A very wide or very tall mark hits the inscribed square before it reaches
    // the target area; clamping keeps it inside the circle.
    if (w > S) { w = S; h = S / ratio }
    if (h > S) { h = S; w = S * ratio }
  }

  return (
    <img
      src={src}
      alt=""
      onLoad={e => {
        const el = e.currentTarget
        if (el.naturalWidth && el.naturalHeight) setRatio(el.naturalWidth / el.naturalHeight)
      }}
      style={{
        width: `${w * 100}%`,
        height: `${h * 100}%`,
        objectFit: 'contain',
        // Until the natural size is known the mark renders at the square
        // default above, so it is never invisible and never jumps far.
        transition: 'width 0.2s ease, height 0.2s ease',
      }}
    />
  )
}

export default function RolePit({ listings }: { listings: any[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const ballsRef = useRef<Ball[]>([])
  const nodesRef = useRef<(HTMLButtonElement | null)[]>([])
  const frameRef = useRef(0)
  const dragRef = useRef<{ i: number; dx: number; dy: number } | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  /**
   * Round-robin across employers, at most two balls each.
   *
   * The previous version took one role per employer and then backfilled the
   * remaining slots from whatever was left, which defeated the point: with four
   * employers on the board and eleven slots, the backfill was seven more Aluko
   * roles and the pit rendered as a wall of one mark. Breadth is the only thing
   * this section communicates, so it cannot be the first casualty of padding.
   *
   * Taking one from each employer, then a second from each, keeps the mix even
   * however lopsided the board gets. The cap means a firm posting thirty roles
   * still occupies two balls.
   *
   * A thinner pit is the accepted cost. Eight balls of four different firms
   * says "this board has range"; eleven balls of one firm actively says the
   * opposite, and the true count is one click away on the board anyway.
   */
  const roles = useMemo(() => {
    const MAX_PER_EMPLOYER = 2
    const MAX_BALLS = 11

    const byEmployer = new Map<string, any[]>()
    for (const l of listings) {
      const key = (l.employer || '').toLowerCase().trim() || `__${byEmployer.size}`
      const bucket = byEmployer.get(key)
      if (bucket) bucket.push(l)
      else byEmployer.set(key, [l])
    }

    const picked: any[] = []
    for (let round = 0; round < MAX_PER_EMPLOYER; round++) {
      for (const bucket of byEmployer.values()) {
        if (bucket[round]) picked.push(bucket[round])
        if (picked.length >= MAX_BALLS) return picked
      }
    }
    return picked
  }, [listings])

  const layout = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const { width, height } = wrap.getBoundingClientRect()
    // Ball size tracks the pit, not the page. At full shell width the old
    // width/16 hit its 58px ceiling and nine balls filled about 9% of the box,
    // which read as an empty container rather than a pit.
    const r = Math.max(32, Math.min(74, width / 9))
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
    <section style={{ backgroundColor: BLACK, overflow: 'hidden' }}>
      <div style={{ maxWidth: 'min(2200px, 94vw)', margin: '0 auto', padding: '5rem 1.5rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <h2
            className="display-black"
            /* Sized down from the old 5rem ceiling: this heading is twice the
               length of the one it replaced, and at the previous scale it ran
               the full width and crowded the "View all roles" link off its row.
               The max-width lets it break to two lines on desktop, which is
               where the phrase reads best anyway. */
            style={{ fontSize: 'clamp(2.1rem, 4.8vw, 3.9rem)', color: CREAM, lineHeight: 0.95, letterSpacing: '-0.04em', maxWidth: '18ch' }}
          >
            You might want to check these out.
          </h2>
          <Link href="/jobs" className="grotesk-bold link-arrow link-arrow-cream">
            View all roles
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="role-pit-layout">
        <div ref={wrapRef} className="role-pit" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          {roles.map((l, i) => {
            const url = logoForEmployer(l.employer)
            const fill = SECTOR_FILL[l.sector] || SECTOR_FILL.other
            // Marks drawn on a solid brand field get a ball to match, so the
            // field dissolves into the ball rather than reading as a box on it.
            const brandBg = ballBgForEmployer(l.employer)
            const size = ballsRef.current[i]?.r ? ballsRef.current[i].r * 2 : 90
            return (
              <button
                key={l.id}
                ref={el => { nodesRef.current[i] = el }}
                className="role-pit-ball"
                onPointerDown={e => onPointerDown(e, i)}
                onClick={() => setOpen(open === i ? null : i)}
                aria-label={`${l.title} at ${l.employer}`}
                style={{ width: size, height: size, backgroundColor: url ? (brandBg || '#FFFFFF') : fill.bg }}
              >
                {url ? (
                  <BallMark src={url} />
                ) : (
                  <span className="display-black" style={{ fontSize: size * 0.3, color: fill.fg, letterSpacing: '-0.02em' }}>
                    {initials(l.employer)}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* The panel holds its column whether or not a ball is selected. Leaving
            it empty is what made the section feel like something was missing. */}
        {/* The carton card keeps its light ground: a lit panel against black is
            the point. Its drop shadow was pure black, which is now invisible,
            so the lift comes from a cream edge instead. */}
        <div className="role-pit-card" style={{ backgroundColor: active ? CARTON : 'transparent', border: active ? `1.5px solid ${CARTON}` : `1px dashed ${ON_BLACK_LINE}`, borderRadius: '10px', boxShadow: active ? '6px 8px 0 rgba(250,247,242,0.22)' : 'none' }}>
          {active ? (
            <>
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
            </>
          ) : (
            <div className="role-pit-empty">
              {/* The count moved up into the eyebrow, so this panel no longer
                  repeats it and just does the inviting. */}
              <p className="display-bold" style={{ fontSize: '1.05rem', color: CREAM, lineHeight: 1.25, marginBottom: '0.5rem' }}>
                Pick one up.
              </p>
              <p className="grotesk-regular" style={{ fontSize: '0.82rem', color: ON_BLACK_MUTED, lineHeight: 1.6 }}>
                Tap a ball to see the role, or throw them around first. Nobody&rsquo;s watching.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </section>
  )
}
