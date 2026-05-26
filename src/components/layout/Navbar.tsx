'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/jobs', label: 'Jobs' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/firms', label: 'Firms' },
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/tracker', label: 'Tracker' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: scrolled ? '0.5px solid #E8E0D5' : '0.5px solid transparent',
        backgroundColor: scrolled ? 'rgba(250, 247, 242, 0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <nav style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Wordmark */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: 700,
              fontSize: '1.35rem',
              color: '#1A1A1A',
              letterSpacing: '-0.01em',
            }}>
              Esquirely
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: pathname === href ? '#0A2342' : '#4A4A4A',
                  textDecoration: 'none',
                  borderBottom: pathname === href ? '1px solid #0A2342' : '1px solid transparent',
                  paddingBottom: '2px',
                  transition: 'color 0.2s ease, border-color 0.2s ease',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
            <Link
              href="/auth/login"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#4A4A4A',
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
            <Link href="/jobs" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
              Browse Jobs
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="mobile-menu-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1A1A1A',
              padding: '4px',
            }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{
            borderTop: '0.5px solid #E8E0D5',
            padding: '1.5rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: pathname === href ? '#0A2342' : '#1A1A1A',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
            <hr style={{ border: 'none', borderTop: '0.5px solid #E8E0D5' }} />
            <Link href="/auth/login" onClick={() => setOpen(false)} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#4A4A4A', textDecoration: 'none'
            }}>Sign in</Link>
            <Link href="/jobs" onClick={() => setOpen(false)} className="btn-primary" style={{ textAlign: 'center' }}>
              Browse Jobs
            </Link>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  )
}
