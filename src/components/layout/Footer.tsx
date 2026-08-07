'use client'

import Link from 'next/link'

/**
 * Footer, rebuilt against the supplied reference.
 *
 * The first attempt softened every characteristic that made the reference work:
 * a 1.5px rule instead of a heavy one, a 10px radius instead of square corners,
 * sentence-case links under section headings instead of one caps stack, and the
 * contour texture painted inside the panel rather than on the page around it.
 * The result was a tidy card. The reference is a printed block, and the effect
 * comes from the weight of the rule, the flatness of the field and the scale of
 * the wordmark against it.
 *
 * So: square corners, a 3px rule, a hard offset shadow with no blur, a flat
 * amber field, and the contour pattern on the cream behind the panel where the
 * reference puts it.
 *
 * The one departure is the link count. The reference carries four social links
 * in a single column; this site has fifteen real destinations. They keep the
 * reference's treatment — uppercase, bold, generously leaded, no headings — in
 * three columns, because a fifteen-deep single stack would stand taller than
 * the wordmark and turn the block into a directory.
 *
 * That last sentence was true on desktop and quietly false everywhere else. The
 * columns were a three-track grid that collapsed to two below 860px and to ONE
 * below 420px, so on a phone the footer became exactly the fifteen-deep stack it
 * was written to avoid: 782px tall against an 844px viewport, 93% of the screen.
 * A block that fills the screen is not read as the end of the page, it is read
 * as another section of it, and it also pushed the closing ink statement out of
 * view entirely.
 *
 * The fix is CSS columns over ONE flat list rather than a grid over three.
 * `column-fill: balance` splits fifteen items evenly at whatever count fits, so
 * three columns still give the same 5/5/5 desktop layout while a phone gets a
 * balanced 8/7 in two — no media query picks the split, and no column is left
 * holding a hole. The order down each column is unchanged, so the product /
 * tools / company grouping still reads on desktop.
 */

const AMBER = '#FBBF24'
const MINT = '#14B8A6'
const INK = '#241F16'

/**
 * Flat and ordered, because `column-fill: balance` does the grouping. At three
 * columns the breaks land after News and after Ambassadors, which is where the
 * three hand-built arrays used to end.
 */
const FOOTER_LINKS = [
  { href: '/jobs', label: 'Jobs board' },
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/firms', label: 'Firms directory' },
  { href: '/tracker', label: 'Tracker' },
  { href: '/news', label: 'News' },
  { href: '/tools/cv-review', label: 'CV review' },
  { href: '/tools/cover-letter', label: 'Cover letter' },
  { href: '/tools/interview-prep', label: 'Interview prep' },
  { href: '/advertise', label: 'Post a role' },
  { href: '/ambassador', label: 'Ambassadors' },
  { href: '/about', label: 'About us' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
]

export default function Footer() {
  /**
   * Slow away, fast home.
   *
   * `behavior: 'smooth'` is ease-IN-OUT: it decelerates into the top, so the
   * last third of a long page crawls and the trip reads as slow even when it
   * is not. This is ease-in — a cubic on t, so the page eases away from the
   * footer and arrives at speed, which is the shape that makes a long return
   * feel short. The browser gives no hook to change its curve, so the tween is
   * run by hand.
   *
   * Duration scales with distance and is capped, because a fixed duration
   * makes a short page feel sluggish and a very long one feel weightless.
   *
   * Reduced motion gets the jump, not a slower version of the same travel:
   * a long animated scroll is exactly the vestibular trigger that setting is
   * asking us to avoid.
   */
  function toTop() {
    if (typeof window === 'undefined') return

    const start = window.scrollY
    if (start <= 0) return

    /* `behavior: 'instant'`, never 'auto', on every write below.
       `html` carries `scroll-behavior: smooth`, and 'auto' means "use the CSS
       value" — so an unqualified scrollTo would hand each frame of this tween
       back to the browser's own smooth scroll and the two would fight. Only
       'instant' actually overrides the stylesheet. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }

    const duration = Math.min(1100, Math.max(450, start * 0.45))
    const begun = performance.now()

    /* Cancels on any real input. Hijacking a scroll the user has taken back is
       the single most irritating thing a scroll-to-top can do. */
    let cancelled = false
    const stop = () => { cancelled = true }
    window.addEventListener('wheel', stop, { passive: true, once: true })
    window.addEventListener('touchstart', stop, { passive: true, once: true })
    window.addEventListener('keydown', stop, { once: true })

    const step = (now: number) => {
      if (cancelled) return
      const t = Math.min((now - begun) / duration, 1)
      // Ease-in cubic: near-still at first, quickest as it lands.
      window.scrollTo({ top: start * (1 - t * t * t), behavior: 'instant' })
      if (t < 1) requestAnimationFrame(step)
      else {
        window.removeEventListener('wheel', stop)
        window.removeEventListener('touchstart', stop)
        window.removeEventListener('keydown', stop)
      }
    }
    requestAnimationFrame(step)
  }

  return (
    <footer className="site-footer">
      <div className="footer-panel">
        <Link href="/" className="display-black footer-wordmark" aria-label="Esquirely home">
          ESQUIRELY
        </Link>

        <div className="footer-body">
          <nav className="footer-cols" aria-label="Footer">
            <ul>
              {FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="grotesk-bold footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-meta">
            <button type="button" onClick={toTop} className="grotesk-bold footer-top">
              Scroll to top
            </button>
            <p className="grotesk-bold footer-legal">&copy;{new Date().getFullYear()} Esquirely</p>
          </div>
        </div>
      </div>

      <style>{`
        /* The contour texture sits on the page behind the panel, which is where
           the reference puts it. A tiling SVG data URI: under 600 bytes, no
           request, cannot 404. Ink at very low alpha, so it reads as paper
           texture on the cream rather than as a second colour. */
        .site-footer {
          background-color: var(--cream);
          background-image: var(--contour);
          padding: 2.25rem 2.5rem 2.75rem;
        }

        /* Square, heavy-ruled, flat. Each of those is load-bearing: round the
           corners or thin the rule and it stops reading as a printed block. */
        .footer-panel {
          max-width: min(2200px, 92vw);
          margin: 0 auto;
          background: ${AMBER};
          border: 2px solid ${INK};
          border-radius: 0;
          box-shadow: 5px 5px 0 ${INK};
          padding: 1.75rem 1.75rem 1.5rem;
        }

        /* The wordmark is the panel. Uppercase, tight, sized to run most of the
           width rather than to sit in a corner. */
        .footer-wordmark {
          display: block;
          font-size: clamp(1.6rem, 7vw, 6rem);
          line-height: 0.9;
          letter-spacing: -0.045em;
          color: ${INK};
          text-decoration: none;
          margin-bottom: 1.75rem;
        }

        .footer-body {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 3rem;
          flex-wrap: wrap;
        }

        /* Three tracks on desktop, but declared as columns rather than as a
           grid so the count can drop without leaving a short column stranded
           beside an empty one. */
        .footer-cols {
          columns: 3;
          column-gap: 1.75rem;
          column-fill: balance;
          max-width: 33rem;
        }
        .footer-cols ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        /* Wide leading. In the reference the space between the links does as
           much work as their weight. Margin, not flex gap: a column box breaks
           the list across tracks, so there is no single flex container left to
           space its children. */
        .footer-cols li {
          break-inside: avoid;
          margin-bottom: 0.6rem;
        }
        .footer-cols li:last-child { margin-bottom: 0; }

        .footer-link {
          display: inline-block;
          font-size: 0.82rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${INK};
          text-decoration: none;
          border-bottom: 2px solid transparent;
          padding-bottom: 2px;
          transition: border-color 0.16s ease;
        }
        .footer-link:hover { border-bottom-color: ${INK}; }

        .footer-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        /* Rectangular, not a pill, carrying the panel's rule and hard shadow one
           size down. */
        .footer-top {
          background: ${MINT};
          color: #FFFFFF;
          border: 2px solid ${INK};
          border-radius: 2px;
          box-shadow: 4px 4px 0 ${INK};
          padding: 0.55rem 1.1rem;
          font-size: 0.74rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          margin-bottom: 1.1rem;
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }
        /* Presses into its own shadow. */
        .footer-top:hover { transform: translate(2px, 2px); box-shadow: 2px 2px 0 ${INK}; }
        .footer-top:active { transform: translate(4px, 4px); box-shadow: 0 0 0 ${INK}; }

        .footer-legal {
          font-size: 0.75rem;
          line-height: 1.45;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: ${INK};
        }
        .footer-built {
          margin-top: 0.9rem;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: rgba(36, 31, 22, 0.55);
        }

        @media (max-width: 860px) {
          .site-footer { padding: 1.5rem 1.1rem 1.75rem; }
          .footer-panel { padding: 1.25rem 1.15rem 1.1rem; border-width: 2px; box-shadow: 4px 4px 0 ${INK}; }
          .footer-wordmark { margin-bottom: 1.1rem; }
          /* Stacked, with the meta block holding the right edge so the button
             and the legal lines stay in the corner as in the reference. */
          .footer-body { flex-direction: column; align-items: stretch; gap: 1.5rem; }
          .footer-cols { columns: 2; column-gap: 1.25rem; max-width: none; }
          .footer-meta { align-items: flex-end; }
        }

        /* Phone. Two things keep this a footer rather than a section.
           The links stay in TWO columns — eight rows, not fifteen — which is
           the whole of the height saving. And the wordmark grows instead of
           shrinking, so the block is signed by the mark and merely listed by
           the links, which is the hierarchy the reference has and the one a
           single fifteen-deep stack inverts. */
        @media (max-width: 640px) {
          .site-footer { padding: 1.25rem 1rem 1.5rem; }
          .footer-panel { padding: 1.1rem 1.1rem 1rem; }
          .footer-wordmark { font-size: clamp(2.2rem, 13.5vw, 6rem); margin-bottom: 0.9rem; }
          .footer-body { gap: 1.35rem; }
          .footer-cols { column-gap: 1rem; }
          .footer-cols li { margin-bottom: 0.55rem; }
          .footer-link { font-size: 0.78rem; letter-spacing: 0.04em; }

          /* One bottom bar rather than a right-aligned stack: the button and the
             copyright cost two rows and a 1.1rem gap when stacked, and side by
             side they also give the panel a definite last line. */
          .footer-meta {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            text-align: left;
            border-top: 2px solid ${INK};
            padding-top: 0.9rem;
          }
          .footer-top { margin-bottom: 0; padding: 0.5rem 0.9rem; font-size: 0.7rem; }
          .footer-legal { font-size: 0.7rem; }
        }

        /* Smallest phones keep the two columns. "FIRMS DIRECTORY" is the widest
           label at about 109px set at 0.78rem, and a 320px screen still leaves
           each column 121px, so nothing wraps; dropping to one column here cost
           220px of height to solve a problem that does not exist. The tracking
           comes off because that is what buys the last few pixels per label. */
        @media (max-width: 360px) {
          .footer-cols { column-gap: 0.85rem; }
          .footer-link { font-size: 0.75rem; letter-spacing: 0.02em; }
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-top { transition: none; }
          .footer-top:hover, .footer-top:active { transform: none; box-shadow: 4px 4px 0 ${INK}; }
        }
      `}</style>
    </footer>
  )
}
