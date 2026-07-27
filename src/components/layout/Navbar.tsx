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

  const isToolsActive = AI_TOOLS.some(t => pathname === t.href)

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: scrolled ? '0.5px solid #E1EBE6' : '0.5px solid transparent', backgroundColor: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', transition: 'all 0.3s ease' }}>
      <nav style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 700, fontSize: '1.35rem', color: '#171E1B', letterSpacing: '-0.01em' }}>
              Esquirely<span style={{ color: '#171E1B' }}>.</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="nav-link" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: pathname === href ? '#4FA980' : '#5C6B64', textDecoration: 'none', position: 'relative', display: 'inline-block', transition: 'color 0.2s ease' }}>
                {label}
                {pathname !== href && (
                  <svg viewBox="0 0 60 8" preserveAspectRatio="none" className="nav-underline" style={{ position: 'absolute', bottom: '-5px', left: '-2px', width: 'calc(100% + 4px)', height: '6px' }}>
                    <path d="M2,5 Q10,1 20,4 Q35,7 45,3 Q52,1 58,4" stroke="#4FA980" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  </svg>
                )}
                {pathname === href && (
                  <svg viewBox="0 0 60 8" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-5px', left: '-2px', width: 'calc(100% + 4px)', height: '6px' }}>
                    <path d="M2,5 Q10,1 20,4 Q35,7 45,3 Q52,1 58,4" stroke="#4FA980" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  </svg>
                )}
              </Link>
            ))}

            <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: isToolsActive ? '#4FA980' : '#5C6B64', cursor: 'pointer', display: 'inline-block', position: 'relative', transition: 'color 0.2s ease' }}>
                AI Tools
                {isToolsActive && (
                  <svg viewBox="0 0 60 8" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-5px', left: '-2px', width: 'calc(100% + 4px)', height: '6px' }}>
                    <path d="M2,5 Q10,1 20,4 Q35,7 45,3 Q52,1 58,4" stroke="#4FA980" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  </svg>
                )}
              </span>
              {toolsOpen && (
                <div style={{ position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFFFFF', border: '1px solid #E1EBE6', borderRadius: '16px', minWidth: '260px', padding: '6px', boxShadow: '0 8px 24px rgba(23,30,27,0.1)', zIndex: 200, paddingTop: '20px', animation: 'dropdownIn 0.18s ease' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7C8B83', padding: '0 0.65rem 0.5rem' }}>Career Tools</p>
                  {AI_TOOLS.map(({ href, label, description }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setToolsOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.65rem',
                        textDecoration: 'none',
                        borderRadius: '10px',
                        borderLeft: '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#EAF3EF'
                        e.currentTarget.style.borderLeftColor = '#4FA980'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderLeftColor = 'transparent'
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#171E1B', marginBottom: '1px' }}>{label}</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: '#5C6B64', lineHeight: 1.3 }}>{description}</p>
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
                <Link href="/dashboard" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C6B64', textDecoration: 'none' }}>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4FA980', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C6B64', textDecoration: 'none' }}>
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
                  Join Esquirely
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="mobile-menu-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#171E1B', padding: '4px' }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div style={{ position: 'fixed', top: '64px', left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderTop: '0.5px solid #E1EBE6', borderBottom: '0.5px solid #E1EBE6', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', zIndex: 99, animation: 'mobileMenuIn 0.22s ease' }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500, color: pathname === href ? '#4FA980' : '#171E1B', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
            {AI_TOOLS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500, color: pathname === href ? '#4FA980' : '#171E1B', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
            <hr style={{ border: 'none', borderTop: '0.5px solid #E1EBE6' }} />
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#5C6B64', textDecoration: 'none' }}>Dashboard</Link>
                <button onClick={handleSignOut} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#4FA980', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0' }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#5C6B64', textDecoration: 'none' }}>Sign In</Link>
                <Link href="/auth/signup" onClick={() => setOpen(false)} className="btn-primary" style={{ textAlign: 'center' }}>Join Esquirely</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
        @media (min-width: 769px) { .mobile-menu-btn { display: none !important; } }
        .nav-link { overflow: visible; }
        .nav-underline { position: absolute; bottom: -5px; left: -2px; width: calc(100% + 4px); height: 6px; opacity: 0; transition: opacity 0.25s ease; }
        .nav-link:hover .nav-underline { opacity: 0.45; }
        @keyframes dropdownIn { from { opacity: 0; transform: translate(-50%, -4px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes mobileMenuIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </header>
  )
}

