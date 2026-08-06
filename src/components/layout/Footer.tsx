'use client'

import Link from 'next/link'

/**
 * Footer: one amber panel, a wordmark set at poster scale, the links, and the
 * legal line.
 *
 * This replaces a dark footer that was three tidy link columns on ink. It was
 * correct and it was invisible: the page ended in the same black the hero and
 * the ball pit are drawn on, so the site had no bottom edge, just a fade out.
 *
 * The panel is the design language the site already uses for the one card it
 * wants you to act on, the ambassador application: carton stock, a 1.5px ink
 * rule, and a hard offset shadow with no blur. Nothing new is introduced here.
 * The amber and the teal are lifted straight out of the news carousel's
 * palette, so the loudest block on the site is still made of its own colours.
 *
 * The wordmark carries the block. At this scale it stops being a logo in a
 * corner and becomes the surface, which is the whole idea: the footer is where
 * the name should be unmissable, because it is the last thing on the page.
 *
 * Sentence case on the links, deliberately, against the all-caps reference.
 * Fourteen links shouting is a wall of text; the force here comes from scale,
 * colour and the rule, and the labels can stay in the site's own voice.
 */

const AMBER = '#FBBF24'
const TEAL = '#14B8A6'
const INK = '#241F16'

const FOOTER_LINKS: Record<string, { href: string; label: string }[]> = {
  Find: [
    { href: '/jobs', label: 'Jobs board' },
    { href: '/scholarships', label: 'Scholarships' },
    { href: '/firms', label: 'Firms directory' },
  ],
  Tools: [
    { href: '/tools/cv-review', label: 'CV review' },
    { href: '/tools/cover-letter', label: 'Cover letter' },
    { href: '/tools/interview-prep', label: 'Interview prep' },
    { href: '/tracker', label: 'Application tracker' },
  ],
  More: [
    { href: '/ambassador', label: 'Be an ambassador' },
    { href: '/news', label: 'News and updates' },
    { href: '/faq', label: 'FAQ' },
    { href: '/advertise', label: 'Post a role' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy policy' },
    { href: '/terms', label: 'Terms of use' },
  ],
}

export default function Footer() {
  function toTop() {
    // Honour a reduced-motion preference: a smooth scroll the length of the
    // whole page is exactly the kind of movement that setting exists to stop.
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <footer className="site-footer">
      <div className="footer-panel">
        <Link href="/" className="display-black footer-wordmark" aria-label="Esquirely home">
          Esquirely.
        </Link>

        <div className="footer-body">
          <nav className="footer-cols" aria-label="Footer">
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <p className="grotesk-bold footer-col-title">{section}</p>
                <ul>
                  {links.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="grotesk-regular footer-link">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="footer-meta">
            <button type="button" onClick={toTop} className="grotesk-bold footer-top">
              Back to top
            </button>
            <p className="grotesk-bold footer-legal">
              &copy; {new Date().getFullYear()} Esquirely
            </p>
          </div>
        </div>
      </div>

      <style>{`
        /* The panel is inset rather than bled to the edge, so the hard shadow
           has somewhere to fall. The ground behind it is the page cream. */
        .site-footer {
          background: var(--cream);
          padding: 3.5rem 1.5rem 4rem;
        }

        .footer-panel {
          max-width: min(2200px, 94vw);
          margin: 0 auto;
          background: ${AMBER};
          border: 1.5px solid ${INK};
          border-radius: 10px;
          box-shadow: 8px 10px 0 ${INK};
          padding: 3rem 2.5rem 2.5rem;
        }

        /* Poster scale. The clamp ceiling is high enough that on a wide monitor
           the wordmark genuinely spans the panel instead of sitting as a large
           label in the corner. */
        .footer-wordmark {
          display: block;
          font-size: clamp(2.75rem, 12.5vw, 11.5rem);
          line-height: 0.82;
          letter-spacing: -0.055em;
          color: ${INK};
          text-decoration: none;
          margin-bottom: 2.75rem;
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
          grid-template-columns: repeat(3, minmax(8.5rem, 11rem));
          gap: 2.5rem;
        }
        .footer-cols ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.55rem; }

        .footer-col-title {
          font-size: 0.78rem;
          color: rgba(36, 31, 22, 0.55);
          margin-bottom: 0.9rem;
        }

        .footer-link {
          font-size: 0.9rem;
          color: ${INK};
          text-decoration: none;
          /* Underline on hover only, drawn as a border so it sits clear of the
             descenders rather than cutting through them. */
          border-bottom: 1.5px solid transparent;
          padding-bottom: 1px;
          transition: border-color 0.18s ease;
        }
        .footer-link:hover { border-bottom-color: ${INK}; }

        .footer-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.4rem;
          text-align: right;
        }

        /* The one accent on the panel, and the same stamped treatment the panel
           itself has, one size down. */
        .footer-top {
          background: ${TEAL};
          color: #04211E;
          border: 1.5px solid ${INK};
          border-radius: 6px;
          box-shadow: 4px 5px 0 ${INK};
          padding: 0.6rem 1.15rem;
          font-size: 0.8rem;
          cursor: pointer;
          margin-bottom: 1rem;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }
        /* Presses into its own shadow, which is the whole gesture. */
        .footer-top:hover { transform: translate(2px, 2.5px); box-shadow: 2px 2.5px 0 ${INK}; }
        .footer-top:active { transform: translate(4px, 5px); box-shadow: 0 0 0 ${INK}; }

        .footer-legal { font-size: 0.78rem; color: ${INK}; }
        .footer-note { font-size: 0.78rem; color: rgba(36, 31, 22, 0.62); }

        @media (max-width: 860px) {
          .site-footer { padding: 2.5rem 1.1rem 3rem; }
          .footer-panel { padding: 2rem 1.5rem 1.75rem; box-shadow: 6px 7px 0 ${INK}; }
          .footer-wordmark { margin-bottom: 2rem; }
          /* Stacked, and the meta block keeps its right alignment so the button
             and the legal line stay pinned to the corner as in the reference. */
          .footer-body { flex-direction: column; align-items: stretch; gap: 2.25rem; }
          .footer-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.75rem; }
          .footer-meta { align-items: flex-end; }
        }

        @media (max-width: 420px) {
          .footer-cols { grid-template-columns: minmax(0, 1fr); }
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-top { transition: none; }
          .footer-top:hover, .footer-top:active { transform: none; box-shadow: 4px 5px 0 ${INK}; }
        }
      `}</style>
    </footer>
  )
}
