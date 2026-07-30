'use client'

import Link from 'next/link'

const FOOTER_LINKS = {
  Opportunities: [
    { href: '/jobs', label: 'All Opportunities' },
    { href: '/jobs?type=job', label: 'Full-time Roles' },
    { href: '/jobs?type=internship', label: 'Internships' },
    { href: '/jobs?type=vacation_scheme', label: 'Vacation Schemes' },
    { href: '/scholarships', label: 'Scholarships' },
    { href: '/jobs?sector=banking', label: 'Banking Roles' },
    { href: '/jobs?sector=fintech', label: 'Fintech Roles' },
  ],
  Explore: [
    { href: '/firms', label: 'Firm Directory' },
    { href: '/firms?tier=Tier+1', label: 'Tier 1 Firms' },
    { href: '/firms?tier=Boutique', label: 'Boutique Firms' },
    { href: '/jobs?sector=energy', label: 'Energy Sector' },
  ],
  Platform: [
    { href: '/tracker', label: 'Application Tracker' },
    { href: '/auth/signup', label: 'Create Account' },
    { href: '/auth/login', label: 'Sign In' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Use' },
    { href: '/advertise', label: 'Post a Role' },
    { href: '/contact', label: 'Contact' },
  ],
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1A1A1A', color: '#FAF6F0' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '4rem 2rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '2.5rem',
      }}>
        <div>
          <span style={{
            fontFamily: 'Schibsted Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#FAF6F0',
            display: 'block',
            marginBottom: '0.75rem',
          }}>
            Esquirely.
          </span>
          <p style={{
            fontFamily: 'Schibsted Grotesk, sans-serif',
            fontSize: '0.8rem',
            color: 'rgba(250,246,240,0.45)',
            lineHeight: 1.7,
            maxWidth: '200px',
          }}>
            Nigeria's definitive platform for legal careers, opportunities, and professional growth.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section}>
            <p style={{
              fontFamily: 'Schibsted Grotesk, sans-serif',
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(250,246,240,0.35)',
              marginBottom: '1rem',
            }}>
              {section}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} style={{
                    fontFamily: 'Schibsted Grotesk, sans-serif',
                    fontSize: '0.82rem',
                    color: 'rgba(250,246,240,0.6)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FAF6F0')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,246,240,0.6)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem 2rem',
        borderTop: '0.5px solid rgba(250,246,240,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <p style={{
          fontFamily: 'Schibsted Grotesk, sans-serif',
          fontSize: '0.72rem',
          color: 'rgba(250,246,240,0.3)',
        }}>
          &copy; {new Date().getFullYear()} Esquirely. All rights reserved.
        </p>
        <p style={{
          fontFamily: 'Schibsted Grotesk, sans-serif',
          fontSize: '0.72rem',
          color: 'rgba(250,246,240,0.3)',
        }}>
          Made for the Nigerian bar.
        </p>
      </div>
    </footer>
  )
}
