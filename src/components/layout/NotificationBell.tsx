'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  buildFeed,
  markSeen,
  readPrefs,
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

function NotifRow({ n }: { n: Notification }) {
  return (
    <>
      <span className="notif-dot" style={{ background: KIND_DOT[n.kind] }} aria-hidden />
      <span className="notif-item-main">
        <span className="grotesk-bold notif-item-title">{n.title}</span>
        <span className="grotesk-regular notif-item-detail">{n.detail}</span>
      </span>
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
}: { hidden?: boolean; user: { id: string } | null; color?: string }) {
  const [open, setOpen] = useState(false)
  const [feed, setFeed] = useState<Notification[]>([])
  const [seen, setSeen] = useState(0)
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

    setFeed(buildFeed(jobs || [], apps || [], readPrefs(), readWelcomedAt()))
  }, [user])

  useEffect(() => {
    setSeen(readSeen())
    load()
  }, [load])

  function openNote() {
    setOpen(false)
    setShowWelcome(true)
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

  const unread = unreadCount(feed, seen)

  function toggle() {
    const next = !open
    setOpen(next)
    // Marked on open, not on close: the badge should clear the moment the list
    // is on screen, not when the reader gets round to dismissing it.
    if (next && unread > 0) {
      markSeen()
      setSeen(Date.now())
    }
  }

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
              {feed.map(n => (
                <li key={n.id}>
                  {n.href ? (
                    <Link href={n.href} className="notif-item" onClick={() => setOpen(false)}>
                      <NotifRow n={n} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="notif-item notif-item-btn"
                      onClick={openNote}
                    >
                      <NotifRow n={n} />
                    </button>
                  )}
                </li>
              ))}
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

            <p className="grotesk-bold notif-modal-kind">From the co-founders</p>
            <p className="display-black notif-modal-title">You took the easy route. Good.</p>

            <div className="notif-modal-body">
              <p className="grotesk-regular">
                Most Nigerian lawyers find their first role by knowing someone. That is a rubbish
                system, and it is the entire reason this exists.
              </p>
              <p className="grotesk-regular">
                Everything is here, and everything gets checked before it goes up. If you spot
                something wrong, tell us. We would much rather hear it from you than not know.
              </p>
            </div>

            <p className="grotesk-bold notif-modal-sign">
              Boluwatife and Ipinuoluwa
              <span className="grotesk-regular notif-modal-sign-role">Co-founders, Esquirely</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
