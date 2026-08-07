'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Check, Copy, X } from 'lucide-react'

/**
 * A note to phone visitors that the site has more to show on a bigger screen.
 *
 * Honest rather than apologetic. The board's five columns, the firm profiles'
 * sidebar and the tracker's funnel all genuinely carry more at desktop width;
 * saying so is useful. What it must not do is imply the phone experience is
 * broken, because it is not, so "Continue on mobile" is the primary action and
 * the notice never blocks anything.
 *
 * Three decisions worth keeping:
 *
 * IT IS NOT A MODAL. It is a sheet at the bottom with no scrim, so the page
 * behind it stays readable and scrollable. An interstitial between a visitor
 * and the thing they came for, on their first visit, is the single most
 * disliked pattern on the mobile web and the reason so many sites lose the
 * visit entirely.
 *
 * IT ASKS ONCE, EVER. The dismissal goes to localStorage. A note that reappears
 * every navigation is an advert.
 *
 * IT WAITS FOR THE FIRST PAINT. Rendering this during hydration would push it
 * into the largest-contentful-paint window and let it flash on desktop before
 * the media query resolves, so the check runs in an effect and the component
 * renders nothing at all on the server.
 */

const KEY = 'esquirely.smallscreen.v1'
/* Matched to the breakpoint where the real layouts collapse: the job board
   loses its column grid at 900px and the detail pages lose their sidebar at
   the same point, so below this is where the claim is actually true. */
const QUERY = '(max-width: 900px)'

/* Entry points only.
   Home is where someone arrives, and the two auth pages are where they commit
   to an account, so those are the three moments the note is worth making. On an
   inner page it would interrupt work already in progress to tell the reader
   something about the site rather than about what they are doing. */
const ROUTES = ['/', '/auth/login', '/auth/signup']

export default function SmallScreenNotice() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!pathname || !ROUTES.includes(pathname)) { setShow(false); return }
    try {
      if (window.localStorage.getItem(KEY)) return
    } catch {
      // Private mode. Showing it once per session is an acceptable fallback.
    }
    if (!window.matchMedia(QUERY).matches) return

    /* A beat after load, so it arrives as a note about the page rather than as
       a gate in front of it. */
    const t = window.setTimeout(() => setShow(true), 1200)
    return () => window.clearTimeout(t)
  }, [pathname])

  /**
   * Leaves before it unmounts.
   *
   * Setting `show` to false alone made the sheet vanish on the frame the button
   * was pressed, which reads as a glitch rather than as a dismissal. The exit
   * class runs first and the node is only pulled once the animation is done.
   *
   * The curve is ease-IN: barely moving at the start, quickest as it goes off
   * the bottom edge. That is the same shape as the footer's back-to-top, and it
   * is what makes a departure feel decisive instead of draggy. The remembering
   * happens immediately, so a fast second visit cannot beat the animation and
   * see the notice again.
   */
  function dismiss() {
    try { window.localStorage.setItem(KEY, '1') } catch { /* nothing to do */ }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setShow(false); return }

    setLeaving(true)
    window.setTimeout(() => setShow(false), 320)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(dismiss, 1100)
    } catch {
      /* Clipboard is permission-gated and blocked outright in some in-app
         browsers. Failing silently would look broken, so the notice just
         closes and leaves the address bar to do the job. */
      dismiss()
    }
  }

  if (!show) return null

  return (
    <div className={`ssn${leaving ? ' ssn-leaving' : ''}`} role="status" aria-live="polite">
      <button type="button" className="ssn-close" onClick={dismiss} aria-label="Dismiss">
        <X size={15} aria-hidden />
      </button>

      <p className="display-black ssn-title">Esquirely works best on a bigger screen.</p>
      <p className="grotesk-regular ssn-copy">
        The jobs board, the firm profiles and the tracker all show more at desktop width.
        Everything works here too.
      </p>

      <div className="ssn-actions">
        <button type="button" className="grotesk-bold ssn-primary" onClick={dismiss}>
          Continue on mobile
        </button>
        <button type="button" className="grotesk-bold ssn-secondary" onClick={copyLink}>
          {copied ? <><Check size={13} aria-hidden /> Copied</> : <><Copy size={13} aria-hidden /> Copy link for desktop</>}
        </button>
      </div>
    </div>
  )
}
