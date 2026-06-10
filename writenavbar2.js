const fs = require('fs');

fs.writeFileSync('src/components/layout/Navbar.tsx', `'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: scrolled ? '0.5px solid #E8E0D5' : '0.5px solid transparent', backgroundColor: scrolled ? 'rgba(250,246,240,0.96)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', transition: 'all 0.3s ease' }}>
      <nav style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '1.35rem', color: '#1A1A1A', letterSpacing: '-0.01em' }}>
              Esquirely<span style={{ color: '#1A1A1A' }}>.</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: pathname === href ? '#8B3A3A' : '#4A4A4A', textDecoration: 'none', position: 'relative', display: 'inline-block', transition: 'color 0.2s ease' }}>
                {label}
                {pathname === href && (
                  <svg viewBox="0 0 60 8" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-5px', left: '-2px', width: 'calc(100% + 4px)', height: '6px' }}>
                    <path d="M2,5 Q10,1 20,4 Q35,7 45,3 Q52,1 58,4" stroke="#8B3A3A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  </svg>
                )}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
            {user ? (
              <>
                <Link href="/dashboard" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A4A4A', textDecoration: 'none' }}>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B3A3A', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A4A4A', textDecoration: 'none' }}>
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
                  Join Free
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="mobile-menu-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A', padding: '4px' }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div style={{ position: 'fixed', top: '64px', left: 0, right: 0, backgroundColor: 'rgba(250,246,240,0.98)', backdropFilter: 'blur(12px)', borderTop: '0.5px solid #E8E0D5', borderBottom: '0.5px solid #E8E0D5', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', zIndex: 99 }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500, color: pathname === href ? '#8B3A3A' : '#1A1A1A', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
            <hr style={{ border: 'none', borderTop: '0.5px solid #E8E0D5' }} />
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#4A4A4A', textDecoration: 'none' }}>Dashboard</Link>
                <button onClick={handleSignOut} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#8B3A3A', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0' }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#4A4A4A', textDecoration: 'none' }}>Sign In</Link>
                <Link href="/auth/signup" onClick={() => setOpen(false)} className="btn-primary" style={{ textAlign: 'center' }}>Join Free</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <style>{\`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
        @media (min-width: 769px) { .mobile-menu-btn { display: none !important; } }
      \`}</style>
    </header>
  )
}
`);

// Recolor SVG pink circle to sky blue
let icons = fs.readFileSync('src/app/HomeIcons.tsx', 'utf8');
icons = icons.replace(/#EC5A5A/g, '#8B3A3A');
const pinkPatterns = [
  /fill="#ffd6d6"/gi,
  /fill="#ffb3b3"/gi,
  /fill="#ffe0e0"/gi,
  /fill="#fce4e4"/gi,
  /fill="#f8d7da"/gi,
  /"fill":"#EC5A5A"/g,
];
pinkPatterns.forEach(p => { icons = icons.replace(p, 'fill="#D6EAF8"'); });
icons = icons.replace(/style=\{\{fill:"[^"]*pink[^"]*"\}\}/gi, 'style={{fill:"#D6EAF8"}}');
fs.writeFileSync('src/app/HomeIcons.tsx', icons);

console.log('done');