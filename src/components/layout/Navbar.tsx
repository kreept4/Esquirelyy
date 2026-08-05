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
  const [hidden, setHidden] = useState(false)

  /**
   * Hide the header on the way down, bring it back on the way up.
   *
   * Pinned-always meant the wordmark and toggle sat over the content the whole
   * time; anchoring them to the top would put navigation out of reach on a long
   * board. This gives an uncluttered read going down and instant navigation the
   * moment you reverse.
   *
   * Notes on the guards. The read is deferred to rAF because scroll fires far
   * more often than the browser paints, and doing work per event is what makes
   * a header like this feel sticky. THRESHOLD swallows the small jitters of a
   * trackpad, so it hides on a real gesture rather than a twitch. And it never
   * hides within REVEAL_ABOVE of the top, since a header that vanishes on the
   * first flick of the hero reads as a glitch.
   */
  useEffect(() => {
    const THRESHOLD = 8
    const REVEAL_ABOVE = 120
    let last = window.scrollY
    let ticking = false

    const update = () => {
      ticking = false
      const y = window.scrollY
      const delta = y - last
      if (Math.abs(delta) < THRESHOLD) return
      // Never hide near the top, and always reveal when scrolling up.
      setHidden(y > REVEAL_ABOVE && delta > 0)
      last = y
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Opening the panel while the header is hidden would strand the close button
  // off-screen, so any route change resets it.
  useEffect(() => { setHidden(false) }, [pathname])

  // The wordmark and toggle sit over the top of whatever the page opens with, so
  // their colour has to follow that. Cream on a light page is invisible, which
  // once left inner pages with no way back to the home page; ink on a dark one
  // is the same fault in reverse.
  //
  // This used to be "home is dark, everything else is cream". That stopped being
  // true when inner pages started opening with a full-bleed ink header, which is
  // the device that ties the white product surfaces back to the homepage. Add
  // each route to DARK_HEADER_ROUTES as it converts; once every inner page has
  // one, this can collapse back to a constant.
  // Prefix match, not equality: /jobs/<slug> carries the same ink header as
  // /jobs, and an exact check left the wordmark invisible on every detail page.
  const DARK_HEADER_ROUTES = ['/jobs', '/privacy', '/terms']
  const overDark = pathname === '/' || DARK_HEADER_ROUTES.some(r => pathname.startsWith(r))
  const restColor = overDark ? '#FAF6F0' : '#1A1A1A'

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
        className={hidden ? 'nav-hidden' : undefined}
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
            <span className="display-black sm-wordmark" style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.045em', color: restColor }}>
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
