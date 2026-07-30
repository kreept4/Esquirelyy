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
    <section className="firm-globe">
      {/* Framed so it isn't an unexplained black void: an interaction nobody is
          told about reads as a broken embed. The canvas itself stays hidden from
          assistive tech — the directory below is the accessible route. */}
      <div className="firm-globe-caption">
        <p className="display-bold" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', color: '#FAF6F0', lineHeight: 1.15 }}>
          spin to explore
        </p>
        <p className="grotesk-regular" style={{ fontSize: '0.78rem', color: 'rgba(250,246,240,0.6)', marginTop: '0.3rem' }}>
          Drag the globe. {items.length} firms, tap any to open its profile.
        </p>
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <InfiniteMenu items={items} />
      </div>
    </section>
  )
}
