'use client'

import Link from 'next/link'

/**
 * Footer: link columns grouped by intent, then a base line. No headline,
 * watermark or buttons -- every destination here already exists in the nav.
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
                .footer-links,
        .footer-base {
          max-width: min(2200px, 94vw);
          margin: 0 auto;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 2.5rem;
          padding: 4rem 1.5rem 3.5rem;
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
          .footer-links { padding: 2.5rem 1.25rem; gap: 2rem; }
        }
      `}</style>
    </footer>
  )
}
