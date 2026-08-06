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
 */

const AMBER = '#FBBF24'
const MINT = '#14B8A6'
const INK = '#241F16'

const FOOTER_LINKS = [
  [
    { href: '/jobs', label: 'Jobs board' },
    { href: '/scholarships', label: 'Scholarships' },
    { href: '/firms', label: 'Firms directory' },
    { href: '/tracker', label: 'Tracker' },
    { href: '/news', label: 'News' },
  ],
  [
    { href: '/tools/cv-review', label: 'CV review' },
    { href: '/tools/cover-letter', label: 'Cover letter' },
    { href: '/tools/interview-prep', label: 'Interview prep' },
    { href: '/advertise', label: 'Post a role' },
    { href: '/ambassador', label: 'Ambassadors' },
  ],
  [
    { href: '/about', label: 'About us' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ],
]

export default function Footer() {
  function toTop() {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <footer className="site-footer">
      <div className="footer-panel">
        <Link href="/" className="display-black footer-wordmark" aria-label="Esquirely home">
          ESQUIRELY
        </Link>

        <div className="footer-body">
          <nav className="footer-cols" aria-label="Footer">
            {FOOTER_LINKS.map((col, i) => (
              <ul key={i}>
                {col.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="grotesk-bold footer-link">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
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
          padding: 4rem 2.5rem 5rem;
        }

        /* Square, heavy-ruled, flat. Each of those is load-bearing: round the
           corners or thin the rule and it stops reading as a printed block. */
        .footer-panel {
          max-width: min(2200px, 92vw);
          margin: 0 auto;
          background: ${AMBER};
          border: 3px solid ${INK};
          border-radius: 0;
          box-shadow: 7px 8px 0 ${INK};
          padding: 2.75rem 2.5rem 2.5rem;
        }

        /* The wordmark is the panel. Uppercase, tight, sized to run most of the
           width rather than to sit in a corner. */
        .footer-wordmark {
          display: block;
          font-size: clamp(2.6rem, 14.5vw, 13rem);
          line-height: 0.86;
          letter-spacing: -0.045em;
          color: ${INK};
          text-decoration: none;
          margin-bottom: 3rem;
        }

        .footer-body {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .footer-cols {
          display: grid;
          grid-template-columns: repeat(3, minmax(7.5rem, 10.5rem));
          gap: 2.25rem;
        }
        .footer-cols ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          /* Wide leading. In the reference the space between the links does as
             much work as their weight. */
          gap: 1rem;
        }

        .footer-link {
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
          .site-footer { padding: 2.5rem 1.1rem 3rem; }
          .footer-panel { padding: 1.75rem 1.4rem 1.6rem; border-width: 2.5px; box-shadow: 5px 6px 0 ${INK}; }
          .footer-wordmark { margin-bottom: 2rem; }
          /* Stacked, with the meta block holding the right edge so the button
             and the legal lines stay in the corner as in the reference. */
          .footer-body { flex-direction: column; align-items: stretch; gap: 2rem; }
          .footer-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
          .footer-meta { align-items: flex-end; }
        }

        @media (max-width: 420px) {
          .footer-cols { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
          .footer-cols ul { gap: 0.85rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-top { transition: none; }
          .footer-top:hover, .footer-top:active { transform: none; box-shadow: 4px 4px 0 ${INK}; }
        }
      `}</style>
    </footer>
  )
}
