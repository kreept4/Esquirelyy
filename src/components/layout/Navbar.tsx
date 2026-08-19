'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StaggeredMenu from './StaggeredMenu'
import NotificationBell from './NotificationBell'
import AuthActions from './AuthActions'
import './StaggeredMenu.css'

/**
 * Site navigation. The glass bar with inline links is gone: the header is the
 * wordmark, the two auth actions and a Menu toggle, and every destination lives
 * in the staggered panel.
 *
 * Sign in and Join are the exception to "everything lives in the panel", and
 * deliberately so. A destination is something you go looking for; these two are
 * what the whole site is asking you to do, and behind a closed menu they were
 * the hardest things on the page to find. See AuthActions.
 */

const NAV_ITEMS = [
  { label: 'Jobs', ariaLabel: 'Browse legal jobs', link: '/jobs' },
  /* ⚠ AN ANCHOR, NOT A ROUTE, and the distinction is the ship plan's pre-flight
     rule five: opportunities fold into the existing jobs and internships page
     rather than becoming a new top level destination. /opportunities does not
     exist and deliberately does not.
     It is a separate entry rather than a rename of Jobs above because the two
     answer different questions — "what is hiring" and "what can I do this
     month" — and somebody looking for an internship programme does not think of
     it as a job. Both land on the same board; this one lands on the featured
     block within it. */
  { label: 'Opportunities', ariaLabel: 'Browse internships and other opportunities', link: '/jobs#opportunities' },
  { label: 'Firms', ariaLabel: 'Browse the firms directory', link: '/firms' },
  { label: 'Scholarships', ariaLabel: 'Browse scholarships', link: '/scholarships' },
  { label: 'Tracker', ariaLabel: 'Open your application tracker', link: '/tracker' },
  { label: 'CV Review', ariaLabel: 'Get your CV reviewed', link: '/tools/cv-review' },
  { label: 'Cover Letter', ariaLabel: 'Draft a cover letter', link: '/tools/cover-letter' },
  { label: 'Interview Prep', ariaLabel: 'Practise for interviews', link: '/tools/interview-prep' },
  { label: 'Ambassador', ariaLabel: 'Become a campus ambassador', link: '/ambassador' },
  { label: 'News', ariaLabel: 'Read news and product updates', link: '/news' },
  { label: 'FAQ', ariaLabel: 'Read frequently asked questions', link: '/faq' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  // Distinct from `user === null`, which is also the state before the first
  // auth read comes back. JoinButton needs to tell "signed out" from "not
  // known yet" so it does not flash at people who are already signed in.
  const [authReady, setAuthReady] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
  // The home page is the only thing left that opens on a dark ground. Every
  // inner header is now a cream band carrying an amber panel, so the list of
  // "dark header" routes this used to keep — /jobs, /privacy, /terms — was
  // painting the wordmark and the toggle cream on cream and making both vanish.
  // With one dark surface left there is no list to maintain.
  const overDark = pathname === '/'
  const restColor = overDark ? '#FAF6F0' : '#1A1A1A'

  /* No menu on the auth pages.
     Signing in is the one place on the site with a single job, and a Menu
     toggle beside the form is an invitation to wander off mid-way. Nothing is
     trapped: each auth page links to the other, and the wordmark goes home. */
  const isAuthRoute = !!pathname?.startsWith('/auth')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setAuthReady(true) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
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

  /* Nothing for a signed-out visitor here any more: Sign in and Join are both
     header controls now, visible without opening anything. Listing them in the
     panel as well would ask twice and make the panel copy look like the
     canonical one. An empty array renders no section at all, so the panel
     simply ends after the destinations. */
  const authItems = user
    ? [{ label: 'Dashboard', link: '/dashboard' }, { label: 'Sign Out', link: '#sign-out' }]
    : []

  // Declared after every hook, so the early return cannot change hook order.
  if (isAuthRoute) return null

  return (
    <>
      {/* Its own control beside the toggle, not an item inside the panel: a
          badge two taps deep and invisible until you go looking is not a badge.
          Renders nothing at all unless someone is signed in. */}
      {/* `hidden || menuOpen` for the same reason as the auth actions below.
          The bell sits at z-index 60, above the panel, so an open menu left it
          and its red badge floating over the cream panel — and its colour
          follows the page behind it, so on the home page it was cream on cream
          with a red pip attached to nothing. */}
      <NotificationBell hidden={hidden || menuOpen} user={user} color={restColor} />

      {/* Stowed while the panel is open: they would otherwise float over the
          cream panel they are meant to be an alternative to. */}
      <AuthActions hidden={hidden || menuOpen} user={user} ready={authReady} color={restColor} />

      {/* ⚠ displayItemNumbering IS PASSED false EXPLICITLY, AND IT HAS TO BE.
          StaggeredMenu defaults it to true, so simply not passing the prop
          leaves the numbering ON. Deleting it from the list is not the same as
          turning it off, and that is the trap this closes.
          Why off: the panel lettered every entry 01, 02, 03, and against eleven
          items that is a column of numbers carrying no information. Numbered
          markers should encode a real sequence, and a nav list is not one.
          LBVIP's application steps keep theirs precisely because they are. */}
      <StaggeredMenu
        className={hidden ? 'nav-hidden' : undefined}
        position="right"
        isFixed
        onMenuOpen={() => setMenuOpen(true)}
        onMenuClose={() => setMenuOpen(false)}
        items={NAV_ITEMS}
        socialItems={authItems}
        socialsTitle="Account"
        displaySocials
        displayItemNumbering={false}
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
        .sm-panel-list[data-numbering] .sm-panel-itemWrap::after {
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
