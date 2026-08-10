'use client'

import { useEffect } from 'react'
import { captureReferral } from '@/lib/referral'

/**
 * Records an ambassador's invite code on arrival. Renders nothing.
 *
 * IT LIVES IN THE ROOT LAYOUT, not on the home page, because an ambassador
 * shares whatever page makes their point. A link to one firm profile, or to a
 * single opening, works as well as a link to the front door and usually better,
 * so the code has to be caught wherever the reader lands.
 *
 * No `useSearchParams` here. That hook opts every page rendering this component
 * out of static generation unless it is wrapped in its own Suspense boundary,
 * and via the root layout that would be every page on the site. A plain effect
 * reading window.location has no such cost and only needs to run once.
 */
export default function ReferralCapture() {
  useEffect(() => {
    captureReferral()
  }, [])

  return null
}
