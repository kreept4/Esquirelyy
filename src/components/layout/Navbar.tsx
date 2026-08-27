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
  /* ⚠ THERE IS DELIBERATELY NO "OPPORTUNITIES" ENTRY, AND ONE WAS TRIED.
     It pointed at /jobs#opportunities, one line under Jobs, and both landed on
     the same board. Two adjacent entries going to one page is not a choice a
     reader can make; it is a question about what the difference is, asked every
     time the menu is opened. The board already is the opportunities page, which
     is what pre-flight rule five in the ship plan says in as many words.
     The #opportunities anchor still exists and is still used, by the carousel
     slide and the featured block itself. It simply is not a navigation item. */
  { label: 'Firms', ariaLabel: 'Browse the firms directory', link: '/firms' },
  { label: 'Scholarships', ariaLabel: 'Browse scholarships', link: '/scholarships' },
  { label: 'Tracker', ariaLabel: 'Open your application tracker', link: '/tracker' },
  { label: 'CV Review', ariaLabel: 'Get your CV reviewed', link: '/tools/cv-review' },
  { label: 'Cover Letter', ariaLabel: 'Draft a cover letter', link: '/tools/cover-letter' },
  { label: 'Interview Prep', ariaLabel: 'Practise for interviews', link: '/tools/interview-prep' },
  /* ⚠ THE ARIA LABEL WAS "Become a campus ambassador" AND IS NOT ANY MORE,
     24 August 2026. Applications are closed while we get the intake right,
     and an imperative in an accessible name is a call to apply that only
     screen reader users hear — the one recruiting surface that would have
     survived the takedown by being invisible to everyone checking it.
     The link stays: what the role involves is still worth reading. */
  { label: 'Ambassador', ariaLabel: 'The campus ambassador programme', link: '/ambassador' },
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

  /* The wordmark and toggle sit over the top of whatever the page opens with, so
     their colour follows that. Cream on a light page is invisible, which once
     left inner pages with no way back to the home page; ink on a dark one is
     the same fault in reverse.

     The home page is the only thing left that opens on a dark ground, so there
     is no list of routes to maintain.

     ⚠ A DARK BAND WAS TRIED HERE, ON 27 AUGUST 2026, SO THAT THE MARK COULD BE
     CREAM ON EVERY PAGE. It was reverted the same day and should not be tried
     again without reading this.

     The idea was that one ink colour everywhere reads as one brand. It does
     not survive contact with the page. The mark is #FAF6F0 and the inner pages
     are #FAF7F2, so a band behind it has to supply the entire contrast: below
     about 85% ink opacity white type on it fails legibility, and at 85% it is a
     slab. There is no setting that is both light and readable, which is why
     "just make it lighter" was not available. On top of that it stacked a dark
     block directly above the amber masthead, which is the exact failure
     globals.css records when inner mastheads were taken off ink ("the top of
     each page a second black band under a black nav"), and being fixed it
     covered the breadcrumb on firm profiles.

     Inverting a wordmark to suit its ground is not an inconsistency; it is what
     wordmarks do. What would make it two marks is a change of size, weight,
     letterspacing or face, and there is none: the span below is the single
     definition of the mark and `color` is the only thing that varies. */
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
        className={[hidden ? 'nav-hidden' : '', overDark ? 'nav-over-dark' : ''].filter(Boolean).join(' ') || undefined}
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
        /* ⚠ THE HEADER SCRIM DARKENS, AND ONLY THE HOME PAGE STILL WANTS THAT.

           StaggeredMenu.css puts blur(12px) brightness(0.55) behind the header,
           and its comment says why: the wordmark and toggle are cream, so the
           backdrop is dimmed to keep cream legible over pale sections. That was
           true when the mark was cream on every page. It is not true now. On the
           inner pages the mark is ink, and dimming the cream behind dark type
           lowers its contrast rather than raising it: the scrim was working
           against the thing it exists to help, everywhere except home.

           Blur alone on the light routes. Blur is what separates the header from
           whatever scrolls under it, and unlike brightness it takes no position
           on tone, so it helps ink and cream equally. The dimming is kept where
           the mark is still cream. */
        .staggered-menu-header::before {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .staggered-menu-wrapper.nav-over-dark .staggered-menu-header::before {
          backdrop-filter: blur(12px) brightness(0.55);
          -webkit-backdrop-filter: blur(12px) brightness(0.55);
        }

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
