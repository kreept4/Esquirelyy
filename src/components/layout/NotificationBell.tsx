'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  buildFeed,
  dismiss,
  dismissAll,
  isUnread,
  markRead,
  markSeen,
  markUnread,
  readDismissedIds,
  readPrefs,
  readReadIds,
  readSeen,
  readWelcomedAt,
  restoreDismissed,
  timeAgo,
  unreadCount,
  type Notification,
} from '@/lib/notifications'
import { TEAM_CALL } from '@/lib/team-call'
/* Same adapter the board uses, so an opportunity is the same shape in the bell
   as it is on /jobs and the two cannot describe it differently. */
import { toBoardRow } from '@/lib/opportunities'
import {
  NEW_ROLES,
  NEW_ROLES_HREF,
  checkedSentence,
  hiringSentence,
  roleCountLabel,
  seatsSentence,
} from '@/lib/new-roles'

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

/**
 * The per-row delete.
 *
 * A SIBLING OF THE ROW, NOT A CHILD OF IT. Every row is either a Link or a
 * button, and a button inside either one is invalid HTML that browsers resolve
 * by unnesting it — so the delete would have ended up outside the row it
 * belonged to, and clicking it would also have followed the link. The two sit
 * side by side in the same grid cell instead, which is why `.notif-row` exists
 * in the CSS.
 *
 * IT IS NOT HIDDEN UNTIL HOVER. That is the usual treatment and it puts the
 * control out of reach of every touch device, which is most of this audience.
 * It is always rendered and simply quiet: low contrast until the row is hovered
 * or the button itself is focused.
 *
 * The label names the notification rather than saying "Delete", because a
 * screen reader user tabbing a list of twelve rows would otherwise hear
 * "Delete" twelve times with nothing to tell them apart.
 */
function DismissButton({ n, onDismiss }: { n: Notification; onDismiss: (id: string) => void }) {
  return (
    <button
      type="button"
      className="notif-item-dismiss"
      aria-label={`Delete notification: ${n.title}`}
      title="Delete"
      onClick={e => {
        /* The row beneath is a link on most kinds. Without both of these a
           delete navigates to the thing it just deleted. */
        e.preventDefault()
        e.stopPropagation()
        onDismiss(n.id)
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
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
  /* Initialised empty rather than from storage, and hydrated in the effect
     below with everything else. Reading localStorage in a useState initialiser
     runs during render, which on the server is a crash and on the client is a
     hydration mismatch the moment the stored value differs from the empty
     default — which is exactly when it matters. */
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set())
  /* Set when a clear-all happens, cleared when the panel closes. It is what
     turns the empty state into an offer to undo, which is the safety net that
     makes a one-tap "Clear all" reasonable to ship without a confirm dialog. */
  const [justCleared, setJustCleared] = useState(0)
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
    const [{ data: jobs }, { data: apps }, { data: opps }] = await Promise.all([
      /* Closed listings never become notifications. Telling somebody about a
         role that is already off the board is the one notification guaranteed
         to waste their time. */
      supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(40),
      supabase.from('applications').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(20),
      /* Published opportunities. The RLS policy on this table admits only
         status = 'published' to the anon and authenticated roles, so the gate
         is the database's rather than a filter somebody has to remember to add
         here. See scripts/2026-08-17-opportunities-phase0-fix.sql. */
      supabase.from('opportunities').select('*').eq('status', 'published').order('deadline', { ascending: true }),
    ])

    /* Dated to when the ACCOUNT was created, not when this browser first saw
       the site. The earlier per-device timestamp meant a returning user on a
       new device, a cleared cache, or a private window looked exactly like a
       first-time visitor and got welcomed again. `created_at` comes from the
       Supabase user object and is stable no matter where they sign in.
       `readWelcomedAt()` only covers the case a signed-in user's `created_at`
       is unavailable for some reason. */
    /* Dismissed ids are read here, at build time, rather than being applied to
       the rendered list. Filtering at render would leave the deleted rows in
       `feed`, and `feed` is what "Clear all" and the unread count are computed
       from — so a cleared panel would still have reported unread notifications
       behind it. */
    setFeed(
      buildFeed(
        jobs || [],
        apps || [],
        readPrefs(),
        user.created_at || readWelcomedAt(),
        new Date(),
        readDismissedIds(),
        (opps || []).map(toBoardRow)
      )
    )
  }, [user])

  useEffect(() => {
    setSeen(readSeen())
    setReadIds(readReadIds())
    setDismissedIds(readDismissedIds())
    load()
  }, [load])

  /**
   * Delete one.
   *
   * The row goes from `feed` immediately as well as being written to storage.
   * `load()` would also produce the right list, but it is a network round trip,
   * and a delete that takes 300ms to visibly happen reads as a broken button and
   * gets pressed again.
   */
  function dismissOne(id: string) {
    setDismissedIds(dismiss(id))
    setFeed(f => f.filter(n => n.id !== id))
    // A fresh delete is a different action from the clear-all that may have
    // preceded it, so the undo offer for that clear is no longer accurate.
    setJustCleared(0)
  }

  function clearAll() {
    setDismissedIds(dismissAll(feed))
    setJustCleared(feed.length)
    setFeed([])
  }

  function undoClear() {
    setDismissedIds(restoreDismissed())
    setJustCleared(0)
    /* Rebuilt from source rather than restored from a copy held in state. The
       feed is derived, so re-running the build is both simpler and more correct
       than keeping a snapshot around: anything that landed while the panel was
       empty comes back too. Note this also restores individually deleted rows —
       restoreDismissed clears the whole store, and there is no per-action
       history here. The button says so. */
    load()
  }

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

  /* The undo offer is scoped to the panel session that created it. Closing the
     bell and reopening it should show the ordinary empty state, not an Undo
     button for a clear-all from an hour ago that the reader has long since
     stopped thinking about. Keyed on `open` rather than done inside a close
     handler because there are four ways to close this panel — the toggle, an
     outside click, Escape, and following a link — and only this catches all of
     them. */
  useEffect(() => {
    if (!open) setJustCleared(0)
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
            /* Two different empty states, because they mean opposite things. An
               untouched panel is telling somebody what will arrive here; a
               cleared one is confirming that something left, and owes them a way
               back. Running the first copy after a clear-all would read as
               though the deletion had failed. */
            justCleared > 0 ? (
              <div className="notif-empty">
                <p className="grotesk-regular notif-empty-line">
                  Cleared {justCleared} notification{justCleared === 1 ? '' : 's'}.
                </p>
                <button type="button" className="grotesk-bold notif-undo-btn" onClick={undoClear}>
                  Undo
                </button>
              </div>
            ) : (
              <p className="grotesk-regular notif-empty">
                New roles matching your filters, scholarship deadlines and tracker changes will show
                up here.
              </p>
            )
          ) : (
            <ul className="notif-list">
              {feed.map(n => {
                const isNew = isUnread(n, seen, readIds)
                return (
                  /* The row and its delete are siblings inside this li, not
                     nested. See DismissButton for why they cannot be nested. */
                  <li key={n.id} className="notif-row">
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
                    <DismissButton n={n} onDismiss={dismissOne} />
                  </li>
                )
              })}
            </ul>
          )}

          {/* The clear-all, at the base of the panel and pinned there.
              Sticky rather than scrolling away with the list, for the same
              reason the header is sticky: with twenty notifications the control
              that empties them should not be twenty rows down.
              Rendered only when there is something to clear — a disabled button
              on an empty panel is a control that exists to tell you it does
              nothing. There is no confirm step, deliberately: the empty state
              above offers Undo, which is a better answer than a dialog because
              it costs nothing when the press was intended. */}
          {feed.length > 0 && (
            <div className="notif-panel-foot">
              <button
                type="button"
                className="grotesk-bold notif-clear-btn"
                onClick={clearAll}
                aria-label={`Clear all ${feed.length} notifications`}
              >
                Clear all
              </button>
            </div>
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
                {roleCountLabel()} on the board.
              </p>

              <div className="notif-modal-body">
                {/* Every sentence here is a complete string built in
                    lib/new-roles.ts, and none of it is assembled out of JSX
                    fragments and ternaries any more. Two reasons. The copy was
                    wrong — the seats line was a verbless fragment and the
                    provenance line used a singular possessive for two firms —
                    and it was wrong in a way that could not be read off the
                    page, because half the sentence was spread across three
                    lines of markup with conditional whitespace between them.
                    Sentences that have to be grammatical should be written
                    somewhere you can read them as sentences. */}
                <p className="grotesk-regular">{hiringSentence()}</p>
                <p className="grotesk-regular">{seatsSentence()}</p>
                <p className="grotesk-regular">{checkedSentence()}</p>
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

              {/* Not a live mailto. Applications for the team aren't open yet
                  — see the note on the 0c push this modal used to be reached
                  from, in lib/notifications.ts. Left as a dead-end statement
                  rather than a disabled-looking button, since there is
                  currently no path that opens this modal at all. */}
              <p className="grotesk-regular notif-modal-cta-note">
                Not accepting applications for the team yet — check back soon.
              </p>
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
