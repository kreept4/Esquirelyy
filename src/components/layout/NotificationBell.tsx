'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  buildFeed,
  isUnread,
  markRead,
  markSeen,
  markUnread,
  readPrefs,
  readReadIds,
  readSeen,
  readWelcomedAt,
  timeAgo,
  unreadCount,
  type Notification,
} from '@/lib/notifications'
import { TEAM_CALL, TEAM_CALL_MAILTO } from '@/lib/team-call'
import { NEW_ROLES, NEW_ROLES_COUNT, NEW_ROLES_HREF, employerSentence, roleSummary } from '@/lib/new-roles'

/**
 * Notification bell, beside the Menu toggle rather than inside the menu.
 *
 * Inside the panel it would be two taps away and invisible until you went
 * looking, which defeats the point of a badge. It sits in the header as its own
 * control, fixed to the same line as the toggle and hidden with it when the
 * header retracts on scroll.
 *
 * Everything it shows is derived at open time from data the site already holds.
 * See src/lib/notifications.ts for why there is no table behind this.
 */

const KIND_DOT: Record<Notification['kind'], string> = {
  role: '#14B8A6',
  deadline: '#EF4444',
  tracker: '#8B5CF6',
  welcome: '#FBBF24',
  /* Amber, like the welcome note, because both are announcements that open a
     note rather than navigating. The teal of a single role would say "this is
     one more listing", which is the one thing it is not. */
  drop: '#FBBF24',
  /* Mint, not amber. The two amber rows are things we have done for the reader;
     this is the one row asking something of them, and it should not look like
     another announcement. */
  team: '#14B8A6',
}

function NotifRow({ n, unread }: { n: Notification; unread: boolean }) {
  return (
    <>
      <span className="notif-dot" style={{ background: KIND_DOT[n.kind] }} aria-hidden />
      <span className="notif-item-main">
        <span className="grotesk-bold notif-item-title">{n.title}</span>
        <span className="grotesk-regular notif-item-detail">{n.detail}</span>
      </span>
      {/* Two signals, one meaning. The word is for a screen reader, which
          cannot see a bolder row; the pip is for everyone else. */}
      {unread && <span className="notif-item-new" aria-label="Unread" />}
      <span className="grotesk-regular notif-item-time">{timeAgo(n.at)}</span>
    </>
  )
}

export default function NotificationBell({
  hidden,
  user,
  /* Same rule as the wordmark: cream over the dark home hero, ink over every
     light inner header. A fixed colour vanishes on one or the other. */
  color = '#1A1A1A',
}: { hidden?: boolean; user: { id: string; created_at?: string } | null; color?: string }) {
  const [open, setOpen] = useState(false)
  const [feed, setFeed] = useState<Notification[]>([])
  const [seen, setSeen] = useState(0)
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())
  const [showWelcome, setShowWelcome] = useState(false)
  const [showDrop, setShowDrop] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const checkedWelcomeParam = useRef(false)

  /* Auto-open, once, right after a brand new account finishes signing up.
     The signup OTP screen and the OAuth callback route both land here with
     `?welcome=1` on the very first redirect for a new account — see the
     comments there for why that flag is trustworthy and not just "a session
     that has never seen the note".

     Read from `window.location` directly rather than `useSearchParams()`:
     that hook forces every page rendering this component (which, via
     Navbar, is every page) out of static generation unless wrapped in its
     own Suspense boundary, which Navbar is not. A plain effect has no such
     cost and only needs to run once per mount. */
  useEffect(() => {
    if (!user || checkedWelcomeParam.current) return
    checkedWelcomeParam.current = true
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('welcome') !== '1') return
    setShowWelcome(true)
    params.delete('welcome')
    const qs = params.toString()
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash)
  }, [user])

  const load = useCallback(async () => {
    if (!user) { setFeed([]); return }
    const supabase = createClient()

    // One round trip for each source. The tracker read is scoped to the user by
    // the query as well as by RLS, so a policy change cannot leak someone
    // else's applications into this panel.
    const [{ data: jobs }, { data: apps }] = await Promise.all([
      supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(40),
      supabase.from('applications').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(20),
    ])

    /* Dated to when the ACCOUNT was created, not when this browser first saw
       the site. The earlier per-device timestamp meant a returning user on a
       new device, a cleared cache, or a private window looked exactly like a
       first-time visitor and got welcomed again. `created_at` comes from the
       Supabase user object and is stable no matter where they sign in.
       `readWelcomedAt()` only covers the case a signed-in user's `created_at`
       is unavailable for some reason. */
    setFeed(buildFeed(jobs || [], apps || [], readPrefs(), user.created_at || readWelcomedAt()))
  }, [user])

  useEffect(() => {
    setSeen(readSeen())
    setReadIds(readReadIds())
    load()
  }, [load])

  /* Listing the note is not reading it — that is the whole reason the welcome
     is tracked by id rather than by the panel-open timestamp. Opening it
     is not quite reading it either, now that the same dialog can appear
     unasked right after signup: someone who dismisses it a second after it
     appears has still seen the greeting, but someone who opens it from the
     list and then reconsiders and closes it without reading has too, so
     dismissal is the one signal both paths agree on. See closeWelcome. */
  function openNote() {
    setOpen(false)
    setShowWelcome(true)
  }

  /* The drop note. Marked read on OPEN rather than on dismiss, unlike the
     welcome: its whole content is two lines and a button, all of it visible the
     instant the dialog appears, so opening it genuinely is reading it. The
     welcome is a letter, and closing it is the only honest signal there. */
  function openDrop() {
    setOpen(false)
    setShowDrop(true)
    setReadIds(markRead(NEW_ROLES.id))
  }

  function openTeam() {
    setOpen(false)
    setShowTeam(true)
    setReadIds(markRead(TEAM_CALL.id))
  }

  function closeWelcome() {
    setShowWelcome(false)
    setReadIds(markRead('welcome'))
  }

  /* The opposite of closeWelcome, for someone who wants the badge back —
     "deal with this later" rather than "I have read this". Closes the
     dialog too: leaving it open in a state that contradicts what it just
     did would be confusing. */
  function markWelcomeUnread() {
    setShowWelcome(false)
    setReadIds(markUnread('welcome'))
  }

  // Close on outside click and on Escape, the two ways anyone expects to
  // dismiss a popover.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const unread = unreadCount(feed, seen, readIds)

  function toggle() {
    setOpen(o => !o)
  }

  /* Marked on open, not on close: the badge should clear the moment the list
     is on screen, not when the reader gets round to dismissing it.

     This has to be an effect keyed on `feed` rather than logic inlined in
     `toggle()`. `feed` loads over the network, so opening the bell right
     after signing in (before that request resolves) used to read `unread`
     against the still-empty initial feed, see 0, and skip marking anything
     seen — the welcome note would then populate a moment later while the
     panel sat open, and come back as unread on the next visit because
     nothing had actually been recorded. Re-running this whenever `feed`
     changes catches that case instead of only checking once at the click. */
  useEffect(() => {
    if (!open) return
    /* Deliberately unaware of `readIds`. This clears the timestamp kinds only,
       so the badge can legitimately still read 1 after the panel has been
       looked at — that 1 is the unopened welcome note, and it is correct. */
    if (unreadCount(feed, seen) > 0) {
      markSeen()
      setSeen(Date.now())
    }
  }, [open, feed, seen])

  // Nothing to notify a signed-out visitor about, and a bell that opens onto
  // "sign in to see this" is a control that does nothing.
  if (!user) return null

  return (
    <div ref={rootRef} className={`notif${hidden ? ' notif-hidden' : ''}`}>
      <button
        type="button"
        className="notif-btn"
        style={{ color }}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="notif-badge grotesk-bold" aria-hidden>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="Notifications">
          <div className="notif-panel-head">
            <p className="grotesk-bold notif-panel-title">Notifications</p>
            <p className="grotesk-regular notif-panel-note">
              {feed.length === 0 ? 'Nothing yet' : `${feed.length} recent`}
            </p>
          </div>

          {feed.length === 0 ? (
            <p className="grotesk-regular notif-empty">
              New roles matching your filters, scholarship deadlines and tracker changes will show
              up here.
            </p>
          ) : (
            <ul className="notif-list">
              {feed.map(n => {
                const isNew = isUnread(n, seen, readIds)
                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link
                        href={n.href}
                        className="notif-item"
                        data-unread={isNew || undefined}
                        onClick={() => setOpen(false)}
                      >
                        <NotifRow n={n} unread={isNew} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="notif-item notif-item-btn"
                        data-unread={isNew || undefined}
                        /* Two hrefless kinds now, so the click has to ask which
                           note it is opening rather than assuming the welcome. */
                        onClick={() =>
                          n.kind === 'drop' ? openDrop() : n.kind === 'team' ? openTeam() : openNote()
                        }
                      >
                        <NotifRow n={n} unread={isNew} />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* The roles drop. Same dialog furniture as the welcome note, and a
          deliberately short one: the reader tapped a line that said two roles
          are up, so the only thing left to do is get them to the roles. The
          button carries the filtered board rather than the whole of /jobs,
          because "show me the new roles" and "show me forty listings, two of
          which are new" are different promises. */}
      {showDrop && (
        <div className="notif-modal-scrim" onClick={() => setShowDrop(false)}>
          <div
            className="notif-modal"
            role="dialog"
            aria-modal="true"
            aria-label="New roles on the board"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="notif-modal-close"
              onClick={() => setShowDrop(false)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="notif-modal-inner">
              <p className="display-black notif-modal-title">
                {NEW_ROLES_COUNT} new roles on the board.
              </p>

              <div className="notif-modal-body">
                <p className="grotesk-regular">
                  {/* Both sentences are built from lib/new-roles.ts. The second
                      one used to be written out by hand, which is how it came to
                      describe three seats while four roles were on the board.
                      Adding a role there now brings its own clause with it. */}
                  {employerSentence()} are hiring, and every opening is checked against the
                  employer&rsquo;s own notice.
                </p>
                <p className="grotesk-regular">{roleSummary()}.</p>
              </div>

              <Link
                href={NEW_ROLES_HREF}
                className="grotesk-bold notif-modal-cta"
                onClick={() => setShowDrop(false)}
              >
                Show me the new roles
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* The open call to join the team.
          "VOLUNTEER" IS IN THE FIRST SENTENCE and the word "unpaid" is not
          anywhere. Volunteer is not a euphemism: it is the plain word for this
          and every reader already knows what it means, so spelling it out a
          second time reads as a company bracing for an objection rather than
          simply stating the terms. What matters is the position of the word,
          not how many ways it is said. */}
      {showTeam && (
        <div className="notif-modal-scrim" onClick={() => setShowTeam(false)}>
          <div
            className="notif-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Join the Esquirely team"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="notif-modal-close"
              onClick={() => setShowTeam(false)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="notif-modal-inner">
              <p className="display-black notif-modal-title">We are opening up the team.</p>

              <div className="notif-modal-body">
                <p className="grotesk-regular">
                  Esquirely is built by a small group of people, and we are making room for more.
                  These are volunteer positions, on something being used by Nigerian law students
                  right now.
                </p>
                <p className="grotesk-regular">
                  Lawyers, students, writers, designers and engineers are all useful here. Tell us
                  what you do and what you would want to build. Take as much space as you need.
                </p>
              </div>

              <a
                href={TEAM_CALL_MAILTO}
                className="grotesk-bold notif-modal-cta"
                onClick={() => setShowTeam(false)}
              >
                Tell us how you can help
              </a>
            </div>
          </div>
        </div>
      )}

      {/* The welcome note in full. A dialog rather than a route, because it is a
          one-off greeting and giving it a URL would mean a page that exists
          forever to say hello once. */}
      {showWelcome && (
        <div className="notif-modal-scrim" onClick={closeWelcome}>
          <div
            className="notif-modal"
            role="dialog"
            aria-modal="true"
            aria-label="A note from the co-founders"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="notif-modal-close"
              onClick={closeWelcome}
              aria-label="Close"
            >
              ×
            </button>

            {/* NO MASTHEAD HERE, DELIBERATELY.
                This carried the wordmark on an ink contour ground, mirroring
                the welcome email. It is gone. The email needs a masthead
                because it arrives cold in an inbox with nothing around it to
                say who sent it. This dialog opens from the notification bell,
                inside the site, one click after the reader looked at the
                wordmark in the header — so it re-announced the brand to
                someone who had just seen it, and pushed the actual note below
                the fold on a phone. The greeting carries it instead. */}
            <div className="notif-modal-inner">
            <p className="display-black notif-modal-title">Welcome to Esquirely.</p>

            <div className="notif-modal-body">
              <p className="grotesk-regular">
                Careers in this profession are usually built on information that travels by word of
                mouth. Who is hiring, what they really ask for, which deadline moved. We put all of
                it in one place so that knowing the right people stops being the deciding factor.
              </p>
              <p className="grotesk-regular">
                Everything here is checked against the source before it goes up. If you find
                something out of date or simply wrong, tell us. That is genuinely the most useful
                thing you can send us.
              </p>
              <p className="grotesk-regular">Glad you are here. Take your time and look around.</p>
            </div>

            {/* The short names, matching the welcome email word for word. Two
                different sign-offs from the same two people, arriving within a
                minute of each other, read as two different senders. */}
            <p className="grotesk-bold notif-modal-sign">
              from Bolu &amp; Ipinu
              <span className="grotesk-regular notif-modal-sign-role">Co-founders, Esquirely</span>
            </p>

            <button type="button" className="grotesk-regular notif-modal-unread-btn" onClick={markWelcomeUnread}>
              Mark as unread
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
