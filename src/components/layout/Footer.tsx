'use client'

import Link from 'next/link'

/**
 * Footer: a brand block, three link columns, one legal line.
 *
 * The previous version read as scattered for two structural reasons, both
 * fixed here rather than restyled around.
 *
 * First, it inherited the `min(2200px, 94vw)` shell the content sections use.
 * That is right for a hero or a feature grid and wrong for a footer: four
 * `minmax(180px, 1fr)` columns stretched across 2200px end up marooned at
 * opposite edges of the screen with a void between them. The footer gets its
 * own, tighter measure so the columns stay in conversation with each other.
 *
 * Second, it carried seventeen links, and several were the same destination
 * twice. `/jobs` appeared as "All Opportunities" next to `/opportunities` as
 * "Opportunities", which is not a navigation choice anyone can make. The firms
 * page appeared three times under different query strings. Filtered views are
 * the job of the filters on those pages, not of permanent footer furniture, so
 * only real destinations survive: twelve links, three even columns.
 */

const INK = '#1A1A1A'
const CREAM = '#FAF6F0'
const RULE = 'rgba(250,246,240,0.12)'
const MUTED = 'rgba(250,246,240,0.5)'

const FOOTER_LINKS: Record<string, { href: string; label: string }[]> = {
  Find: [
    { href: '/jobs', label: 'Jobs board' },
    { href: '/scholarships', label: 'Scholarships' },
    { href: '/firms', label: 'Firm directory' },
  ],
  Tools: [
    { href: '/tools/cv-review', label: 'CV review' },
    { href: '/tools/cover-letter', label: 'Cover letter' },
    { href: '/tools/interview-prep', label: 'Interview prep' },
    { href: '/tracker', label: 'Application tracker' },
  ],
  Company: [
    { href: '/advertise', label: 'Post a role' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy policy' },
    { href: '/terms', label: 'Terms of use' },
  ],
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: INK, color: CREAM }}>
      <div className="footer-inner">
        {/* The wordmark anchors the left rather than floating alone on a base
            line, which gives the columns something to sit against. */}
        <div className="footer-brand">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="display-black" style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.045em', color: CREAM }}>
              Esquirely.
            </span>
          </Link>
          <p className="grotesk-regular" style={{ fontSize: '0.82rem', color: MUTED, lineHeight: 1.6, marginTop: '0.75rem', maxWidth: '22ch' }}>
            Every legal opportunity in Nigeria, in one place.
          </p>
        </div>

        <div className="footer-cols">
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="grotesk-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, marginBottom: '1.1rem' }}>
                {section}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="grotesk-regular footer-link" style={{ fontSize: '0.88rem' }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-base">
        {/* Three competing muted lines spread across the full width was most of
            the clutter. One line, one alignment. */}
        <p className="grotesk-regular" style={{ fontSize: '0.74rem', color: MUTED }}>
          &copy; {new Date().getFullYear()} Esquirely. Made for the Nigerian bar.
        </p>
      </div>

      <style>{`
        .footer-inner,
        .footer-base {
          /* Same shell as every other section. Capping the footer narrower than
             the site made it a centred island that drifted away from the page
             edges on a wide monitor. It spans like everything else; the columns
             are kept together by their own track sizes instead. */
          max-width: min(2200px, 94vw);
          margin: 0 auto;
        }

        /* Brand hard left, links grouped hard right. The gap between the two
           absorbs the extra width on a large screen, so the link columns never
           stretch apart no matter how wide the viewport gets. */
        .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 4rem;
          padding: 4.5rem 1.5rem 3.5rem;
        }

        .footer-brand { flex: 0 1 24rem; }

        .footer-cols {
          display: grid;
          /* Fixed track ceiling is the whole point: 1fr tracks would spread. */
          grid-template-columns: repeat(3, minmax(8.5rem, 11rem));
          gap: 3.5rem;
        }

        .footer-link {
          color: rgba(250,246,240,0.72);
          text-decoration: none;
          transition: color 0.18s ease;
        }
        .footer-link:hover { color: ${CREAM}; }

        .footer-base {
          padding: 1.5rem 1.5rem 2.5rem;
          border-top: 1px solid ${RULE};
        }

        @media (max-width: 860px) {
          .footer-inner {
            flex-direction: column;
            gap: 2.5rem;
            padding: 3rem 1.25rem 2.5rem;
          }
          .footer-brand { flex: 1 1 auto; }
          .footer-cols { gap: 2rem 2.5rem; }
        }

        @media (max-width: 460px) {
          .footer-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
    </footer>
  )
}
