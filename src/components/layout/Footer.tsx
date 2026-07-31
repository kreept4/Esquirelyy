'use client'

import Link from 'next/link'

/**
 * Footer: a slim action row, the link columns grouped by intent, and a base
 * line. No headline or watermark.
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
      {/* Actions only: the headline and the oversized wordmark are gone. */}
      <div className="footer-cta">
        <Link href="/jobs" className="grotesk-bold footer-btn-solid">
          Browse roles
        </Link>
        <Link href="/auth/signup" className="grotesk-bold footer-btn-ghost">
          Create an account
        </Link>
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
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding: 3.25rem 1.5rem 2.75rem;
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
