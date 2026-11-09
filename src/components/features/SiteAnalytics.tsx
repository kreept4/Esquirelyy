'use client'

import { useEffect } from 'react'
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'
import { createClient } from '@/lib/supabase/client'
import { EXCLUDED_ACCOUNT_IDS, applyOptOutSwitch, cleanUrl, isOptedOut, setOptedOut } from '@/lib/analytics'

/**
 * Vercel Web Analytics for the whole site, minus the founders' own visits and
 * minus anything in a URL that is not traffic data. lib/analytics.ts has the
 * reasoning; this file is the wiring.
 *
 * In the root layout so every page is counted. Renders nothing visible.
 *
 * Inert until Web Analytics is enabled for the project in the Vercel
 * dashboard: until then the script it loads is not served and nothing is sent.
 */

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  let url: URL
  try {
    url = new URL(event.url)
  } catch {
    return event
  }
  applyOptOutSwitch(url)
  if (isOptedOut()) return null
  return { ...event, url: cleanUrl(url) }
}

export default function SiteAnalytics() {
  useEffect(() => {
    const supabase = createClient()
    const mark = (id?: string | null) => {
      if (id && EXCLUDED_ACCOUNT_IDS.has(id)) setOptedOut(true)
    }
    /* getSession, not getUser: this only needs the id the browser already
       holds, and getUser would be a network round trip on every page load. */
    supabase.auth.getSession().then(({ data }) => mark(data.session?.user.id))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => mark(session?.user.id))
    return () => subscription.unsubscribe()
  }, [])

  return <Analytics beforeSend={beforeSend} />
}
