'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  buildFeed,
  isUnread,
  markRead,
  markSeen,
  readPrefs,
  readReadIds,
  readSeen,
  readWelcomedAt,
  timeAgo,
  unreadCount,
  type Notification,
} from '@/lib/notifications'

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
}

/**
 * The mark on the welcome note.
 *
 * Inline, not an <img src="…svg">. An external SVG is a separate document
 * fetch, so it renders as an empty box for every reason a fetch can fail — a
 * path that does not resolve under the deployed basePath, a content-type the
 * host serves wrong, a CSP that does not list img-src. Inlined there is nothing
 * left to fail, and `currentColor` lets one drawing sit on ink here and on
 * amber anywhere else.
 *
 * An envelope with the seal broken open, which is what the note is.
 */
function WelcomeMark() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="notif-modal-mark"
    >
      <path d="M6 17.5 24 6l18 11.5v20a2.5 2.5 0 0 1-2.5 2.5h-31A2.5 2.5 0 0 1 6 37.5Z" />
      <path d="M6 17.5 24 29l18-11.5" />
      <path d="M17 44V29m14 15V29" />
    </svg>
  )
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
  const rootRef = useRef<HTMLDivElement>(null)

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

  /* Opening the note is what marks it read — not listing it, and not closing
     the panel. That is the whole reason the welcome is tracked by id rather
     than by the panel-open timestamp. */
  function openNote(n: Notification) {
    setOpen(false)
    setShowWelcome(true)
    setReadIds(markRead(n.id))
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
                        onClick={() => openNote(n)}
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

      {/* The welcome note in full. A dialog rather than a route, because it is a
          one-off greeting and giving it a URL would mean a page that exists
          forever to say hello once. */}
      {showWelcome && (
        <div className="notif-modal-scrim" onClick={() => setShowWelcome(false)}>
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
              onClick={() => setShowWelcome(false)}
              aria-label="Close"
            >
              ×
            </button>

            {/* Masthead. Ink ground carrying the contour in amber, the same
                construction as the signup email, so the note the site shows and
                the note that arrives by mail are recognisably one thing.
                The site's --contour strokes in ink because it goes on cream; on
                ink it would be invisible, so --contour-amber exists for dark
                grounds. */}
            <div className="notif-modal-head">
              <WelcomeMark />
              <p className="grotesk-bold notif-modal-kind">A note from the founders</p>
            </div>

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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
