'use client'

import { useMemo } from 'react'
import InfiniteMenu from './InfiniteMenu'
import { ALL_FIRMS, logoUrl } from '@/lib/firms-data'

/**
 * Drag-to-spin globe of firm logos, sitting above the firm directory.
 *
 * Decorative by design: it renders to a WebGL canvas, so nothing in it is
 * crawlable, focusable, or readable by assistive tech. The real directory below
 * carries all of that — this only has to be the moment that makes someone stay.
 */
export default function FirmGlobe() {
  const items = useMemo(
    () =>
      ALL_FIRMS.filter(f => f.logoFile).map(f => ({
        image: logoUrl(f.logoFile)!,
        link: `/firms/${f.slug}`,
        title: f.shortName || f.name,
        description: [f.tier, f.practiceAreas?.[0]].filter(Boolean).join(' · '),
      })),
    []
  )

  if (!items.length) return null

  return (
    <section aria-hidden="true" className="firm-globe">
      <InfiniteMenu items={items} />
    </section>
  )
}
