'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  buildFeed,
  markSeen,
  readPrefs,
  readSeen,
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
 * Everything it shows is derived at open time from data the site already holds
 * — see src/lib/notifications.ts for why there is no table behind this.
 */

const KIND_DOT: Record<Notification['kind'], string> = {
  role: '#14B8A6',
  deadline: '#EF4444',
  tracker: '#8B5CF6',
}

const KIND_LABEL: Record<Notification['kind'], string> = {
  role: 'New role',
  deadline: 'Closing soon',
  tracker: 'Tracker',
}

export default function NotificationBell({ hidden }: { hidden?: boolean }) {
  const [open, setOpen] = useState(false)
  const [feed, setFeed] = useState<Notification[]>([])
  const [seen, setSeen] = useState(0)
  const [signedIn, setSignedIn] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setSignedIn(!!user)
    if (!user) { setFeed([]); return }

    // One round trip for each source. The tracker read is scoped to the user by
    // the query as well as by RLS, so a policy change cannot leak someone
    // else's applications into this panel.
    const [{ data: jobs }, { data: apps }] = await Promise.all([
      supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(40),
      supabase.from('applications').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(20),
    ])

    setFeed(buildFeed(jobs || [], apps || [], readPrefs()))
  }, [])

  useEffect(() => {
    setSeen(readSeen())
    load()
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    return () => subscription.unsubscribe()
  }, [load])

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
  if (!signedIn) return null

  return (
    <div ref={rootRef} className={`notif${hidden ? ' notif-hidden' : ''}`}>
      <button
        type="button"
        className="notif-btn"
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
                  <Link href={n.href} className="notif-item" onClick={() => setOpen(false)}>
                    <span className="notif-dot" style={{ background: KIND_DOT[n.kind] }} aria-hidden />
                    <span className="notif-item-main">
                      <span className="grotesk-bold notif-item-kind">{KIND_LABEL[n.kind]}</span>
                      <span className="grotesk-bold notif-item-title">{n.title}</span>
                      <span className="grotesk-regular notif-item-detail">{n.detail}</span>
                    </span>
                    <span className="grotesk-regular notif-item-time">{timeAgo(n.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
