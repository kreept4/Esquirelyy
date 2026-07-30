'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StaggeredMenu from './StaggeredMenu'
import './StaggeredMenu.css'

/**
 * Site navigation. The glass bar with inline links is gone: the header is now
 * just the wordmark and a Menu toggle, and every destination lives in the
 * staggered panel. Auth links go in the panel too, so signing in stays reachable
 * without a second row of controls.
 */

const NAV_ITEMS = [
  { label: 'Jobs', ariaLabel: 'Browse legal jobs', link: '/jobs' },
  { label: 'Opportunities', ariaLabel: 'Browse opportunities', link: '/opportunities' },
  { label: 'Firms', ariaLabel: 'Browse the firm directory', link: '/firms' },
  { label: 'Scholarships', ariaLabel: 'Browse scholarships', link: '/scholarships' },
  { label: 'Tracker', ariaLabel: 'Open your application tracker', link: '/tracker' },
  { label: 'CV Review', ariaLabel: 'Get your CV reviewed', link: '/tools/cv-review' },
  { label: 'Cover Letter', ariaLabel: 'Draft a cover letter', link: '/tools/cover-letter' },
  { label: 'Interview Prep', ariaLabel: 'Practise for interviews', link: '/tools/interview-prep' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  // Only the home page puts the header over the dark hero video. Everywhere else
  // the page is cream, so a cream wordmark and toggle were invisible — there was
  // no way back to the home page from an inner page.
  const overHero = pathname === '/'
  const restColor = overHero ? '#FAF6F0' : '#1A1A1A'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // The panel renders its items as plain anchors, so Sign Out is delegated:
  // catch the click before the browser follows the placeholder href.
  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest('a[href="#sign-out"]')
      if (!el) return
      e.preventDefault()
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [router])

  const authItems = user
    ? [{ label: 'Dashboard', link: '/dashboard' }, { label: 'Sign Out', link: '#sign-out' }]
    : [{ label: 'Sign In', link: '/auth/login' }, { label: 'Join Esquirely', link: '/auth/signup' }]

  return (
    <>
      <StaggeredMenu
        position="right"
        isFixed
        items={NAV_ITEMS}
        socialItems={authItems}
        displaySocials
        displayItemNumbering
        changeMenuColorOnOpen
        menuButtonColor={restColor}
        openMenuButtonColor="#1A1A1A"
        accentColor="#EF4444"
        colors={['#38BDF8', '#F97316', '#22C55E']}
        logo={
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="display-black sm-wordmark" style={{ fontSize: '1.4rem', letterSpacing: '-0.03em', color: restColor }}>
              Esquirely.
            </span>
          </Link>
        }
      />

      <style>{`
        /* Brand overrides for the vendored ReactBits panel. */
        .sm-wordmark { transition: color 0.3s ease; }
        .staggered-menu-wrapper[data-open] .sm-wordmark { color: #1A1A1A !important; }
        .staggered-menu-header { padding: 1.5rem 1.75rem; }
        .staggered-menu-panel {
          background: #FAF6F0;
          padding: 7rem 2.5rem 2.5rem;
        }
        .sm-panel-item {
          font-family: var(--font-display);
          color: #1A1A1A;
          text-transform: none;
          letter-spacing: -0.03em;
          font-size: clamp(2rem, 5vw, 3.25rem);
        }
        .sm-panel-list[data-numbering] .sm-panel-item::after {
          font-family: var(--font-sans);
          font-size: 0.7rem;
        }
        .sm-socials-title { font-family: var(--font-sans); font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase; }
        .sm-socials-link { font-family: var(--font-sans); font-size: 0.95rem; }
        .sm-toggle { font-family: var(--font-sans); font-size: 0.8rem; letter-spacing: 0.02em; }

        @media (max-width: 640px) {
          .staggered-menu-header { padding: 1.1rem 1.15rem; }
          .staggered-menu-panel { padding: 6rem 1.5rem 2rem; }
          .sm-panel-item { font-size: clamp(1.75rem, 9vw, 2.5rem); }
        }
      `}</style>
    </>
  )
}
