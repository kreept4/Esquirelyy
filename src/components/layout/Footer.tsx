'use client'

import Link from 'next/link'

/**
 * Footer as a closing statement rather than a link dump. Three bands: a CTA that
 * gives the page somewhere to go, the link columns, and an oversized wordmark
 * that signs the page off.
 */

const INK = '#1A1A1A'
const CREAM = '#FAF6F0'
const RULE = 'rgba(250,246,240,0.12)'
const MUTED = 'rgba(250,246,240,0.5)'

const FOOTER_LINKS: Record<string, { href: string; label: string }[]> = {
  Opportunities: [
    { href: '/jobs', label: 'All Opportunities' },
    { href: '/jobs?type=job', label: 'Full-time Roles' },
    { href: '/jobs?type=internship', label: 'Internships' },
    { href: '/jobs?type=vacation_scheme', label: 'Vacation Schemes' },
    { href: '/scholarships', label: 'Scholarships' },
  ],
  Explore: [
    { href: '/firms', label: 'Firm Directory' },
    { href: '/firms?tier=Tier+1', label: 'Tier 1 Firms' },
    { href: '/firms?tier=Boutique', label: 'Boutique Firms' },
    { href: '/opportunities', label: 'Opportunities' },
  ],
  Tools: [
    { href: '/tools/cv-review', label: 'CV Review' },
    { href: '/tools/cover-letter', label: 'Cover Letter' },
    { href: '/tools/interview-prep', label: 'Interview Prep' },
    { href: '/tracker', label: 'Application Tracker' },
  ],
  Company: [
    { href: '/advertise', label: 'Post a Role' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Use' },
  ],
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: INK, color: CREAM }}>
      {/* Closing CTA */}
      <div className="footer-cta">
        <h2 className="display-black" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', lineHeight: 0.98, letterSpacing: '-0.04em', maxWidth: '16ch' }}>
          Your next role is already on here.
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/jobs" className="grotesk-bold footer-btn-solid">
            Browse roles
          </Link>
          <Link href="/auth/signup" className="grotesk-bold footer-btn-ghost">
            Create an account
          </Link>
        </div>
      </div>

      {/* Links */}
      <div className="footer-links">
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

      {/* Oversized wordmark signs the page off */}
      <div className="footer-mark" aria-hidden="true">
        <span className="display-black">Esquirely.</span>
      </div>

      <div className="footer-base">
        <p className="grotesk-regular" style={{ fontSize: '0.74rem', color: MUTED }}>
          &copy; {new Date().getFullYear()} Esquirely. All rights reserved.
        </p>
        <p className="grotesk-regular" style={{ fontSize: '0.74rem', color: MUTED }}>
          Made for the Nigerian bar.
        </p>
      </div>

      <style>{`
        .footer-cta,
        .footer-links,
        .footer-base {
          max-width: min(2200px, 94vw);
          margin: 0 auto;
        }
        .footer-cta {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2.5rem;
          flex-wrap: wrap;
          padding: 5.5rem 1.5rem 4rem;
          border-bottom: 1px solid ${RULE};
        }
        .footer-btn-solid,
        .footer-btn-ghost {
          display: inline-block;
          padding: 0.85rem 2rem;
          border-radius: 999px;
          font-size: 0.82rem;
          text-decoration: none;
          transition: transform 0.18s ease, background-color 0.18s ease, color 0.18s ease;
        }
        .footer-btn-solid { background: ${CREAM}; color: ${INK}; }
        .footer-btn-ghost { border: 1px solid ${RULE}; color: ${CREAM}; }
        .footer-btn-solid:hover,
        .footer-btn-ghost:hover { transform: translateY(-2px); }
        .footer-btn-ghost:hover { background: rgba(250,246,240,0.08); }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 2.5rem;
          padding: 3.5rem 1.5rem;
        }
        .footer-link {
          color: rgba(250,246,240,0.72);
          text-decoration: none;
          transition: color 0.18s ease, padding-left 0.18s ease;
        }
        .footer-link:hover { color: ${CREAM}; padding-left: 4px; }

        /* Wordmark scales with the viewport and is clipped to a sliver of
           descender, so it reads as a watermark rather than a heading. */
        .footer-mark {
          overflow: hidden;
          padding: 0 1.5rem;
          line-height: 0.78;
          user-select: none;
        }
        .footer-mark span {
          display: block;
          font-size: clamp(4rem, 17vw, 15rem);
          letter-spacing: -0.05em;
          color: rgba(250,246,240,0.07);
          white-space: nowrap;
        }

        .footer-base {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.75rem 1.5rem 2.25rem;
          border-top: 1px solid ${RULE};
        }

        @media (max-width: 640px) {
          .footer-cta { padding: 3.5rem 1.25rem 2.5rem; }
          .footer-links { padding: 2.5rem 1.25rem; gap: 2rem; }
        }
      `}</style>
    </footer>
  )
}
