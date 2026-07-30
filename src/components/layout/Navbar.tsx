'use client'

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

const AI_TOOLS = [
  { href: '/tools/cv-review', label: 'CV Review', description: 'Get honest, specific feedback on your CV' },
  { href: '/tools/cover-letter', label: 'Cover Letter', description: 'Generate a cover letter that stands out' },
  { href: '/tools/interview-prep', label: 'Interview Prep', description: 'Practice answers and get honest feedback' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    handler()
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

  const isToolsActive = AI_TOOLS.some(t => pathname === t.href)

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 110 }}>
      <div style={{ padding: '1.5rem 1.5rem 0' }}>
        <nav
          className="liquid-glass"
          style={{
            borderRadius: '0.75rem',
            padding: '0.6rem 1.25rem',
            maxWidth: '1280px',
            margin: '0 auto',
            background: scrolled ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.4)',
            transition: 'background 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="grotesk-bold" style={{ fontSize: '1.35rem', color: '#FAF6F0', letterSpacing: '-0.02em' }}>
                Esquirely.
              </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="grotesk-regular nav-link"
                  style={{
                    fontSize: '0.8rem',
                    color: pathname === href ? '#FAF6F0' : 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    position: 'relative',
                  }}
                >
                  {label}
                </Link>
              ))}

              <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
                <span className="grotesk-regular" style={{ fontSize: '0.8rem', color: isToolsActive ? '#FAF6F0' : 'rgba(255,255,255,0.7)', cursor: 'pointer', position: 'relative' }}>
                  AI Tools
                </span>
                {toolsOpen && (
                  <div style={{ position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', minWidth: '260px', padding: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 200, paddingTop: '20px', borderRadius: '0.5rem', animation: 'dropdownIn 0.18s ease' }}>
                    <p className="grotesk-regular" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', padding: '0 0.65rem 0.5rem' }}>Career Tools</p>
                    {AI_TOOLS.map(({ href, label, description }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setToolsOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.65rem', textDecoration: 'none', borderRadius: '999px', borderLeft: '2px solid transparent', cursor: 'pointer', transition: 'background-color 0.15s, border-color 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderLeftColor = '#FAF6F0' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent' }}
                      >
                        <div>
                          <p className="grotesk-bold" style={{ fontSize: '0.8rem', color: '#FAF6F0', marginBottom: '1px' }}>{label}</p>
                          <p className="grotesk-regular" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.3 }}>{description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
              {user ? (
                <>
                  <Link href="/dashboard" className="grotesk-regular" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="grotesk-regular" style={{ fontSize: '0.75rem', color: '#FAF6F0', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="grotesk-regular" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="grotesk-bold" style={{ background: '#FAF6F0', color: '#1A1A1A', padding: '0.5rem 1.35rem', borderRadius: '999px', fontSize: '0.78rem', textDecoration: 'none' }}>
                    Join Esquirely
                  </Link>
                </>
              )}
            </div>

            <button onClick={() => setOpen(!open)} className="mobile-menu-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FAF6F0', padding: '4px' }}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div style={{ margin: '0 1.5rem', backgroundColor: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', marginTop: '0.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'mobileMenuIn 0.22s ease' }}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="grotesk-regular" style={{ fontSize: '0.9rem', color: pathname === href ? '#FAF6F0' : 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
          {AI_TOOLS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="grotesk-regular" style={{ fontSize: '0.9rem', color: pathname === href ? '#FAF6F0' : 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="grotesk-regular" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>Dashboard</Link>
              <button onClick={handleSignOut} className="grotesk-regular" style={{ fontSize: '0.9rem', color: '#FAF6F0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)} className="grotesk-regular" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>Sign In</Link>
              <Link href="/auth/signup" onClick={() => setOpen(false)} className="grotesk-bold" style={{ background: '#FAF6F0', color: '#1A1A1A', padding: '0.6rem', borderRadius: '0.5rem', fontSize: '0.85rem', textDecoration: 'none', textAlign: 'center' }}>Join Esquirely</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
        @media (min-width: 769px) { .mobile-menu-btn { display: none !important; } }
        .nav-link { overflow: visible; }
        @keyframes dropdownIn { from { opacity: 0; transform: translate(-50%, -4px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes mobileMenuIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </header>
  )
}
