'use client'

import Link from 'next/link'

/**
 * Sign in and Join Esquirely, in the header rather than inside the menu panel.
 *
 * Both used to live only in the staggered panel, under a heading that read
 * "Socials", two taps deep. A visitor who never opened the menu never saw
 * either of them, and the two things we most want a first-time visitor to be
 * able to do were the two things hardest to find. They now sit on the same line
 * as the wordmark, over the top of the hero, and ride along to every page.
 *
 * The pair is weighted, not balanced. Join is an amber pill and Sign in is a
 * plain link, because they are not equally likely: most people arriving on the
 * home page do not have an account yet, and giving both the same treatment
 * would make the reader choose between two identical-looking controls before
 * they know which one applies to them.
 *
 * The group takes the notification bell's slot. It can never collide with the
 * bell — that needs someone signed in and this needs someone signed out — so
 * they share one inset rather than each reserving their own.
 */
export default function AuthActions({
  hidden,
  user,
  ready,
  /* Sign in is a bare link, so it needs the same treatment as the wordmark:
     cream over the dark home hero, ink over every light inner header. The Join
     pill is exempt — amber on an ink border carries itself on both grounds. */
  color = '#1A1A1A',
}: {
  hidden?: boolean
  user: { id: string } | null
  ready?: boolean
  color?: string
}) {
  // `user` resolves a beat after mount. Rendering on the optimistic assumption
  // of signed-out would flash these at people who already have an account, so
  // the group stays transparent until the answer is in and then fades up.
  const stowed = hidden || !ready || !!user

  return (
    <div className={`auth-cta${stowed ? ' auth-cta-hidden' : ''}`} aria-hidden={stowed || undefined}>
      <Link
        href="/auth/login"
        className="grotesk-bold auth-cta-signin"
        style={{ color }}
        tabIndex={stowed ? -1 : undefined}
      >
        Sign in
      </Link>
      <Link href="/auth/signup" className="grotesk-bold auth-cta-join" tabIndex={stowed ? -1 : undefined}>
        Join<span className="auth-cta-word">&nbsp;Esquirely</span>
      </Link>
    </div>
  )
}
