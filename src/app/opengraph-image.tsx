import { ImageResponse } from 'next/og'
import { ALL_FIRMS } from '@/lib/firms-data'

/**
 * The site's share card, which did not exist.
 *
 * The root metadata declared `twitter: { card: 'summary_large_image' }` with no
 * image to put in it, which renders worse than declaring nothing: the platform
 * reserves the large slot and fills it with blank. Every link pasted into a
 * WhatsApp group, a LinkedIn post or an X reply previewed as a bare URL.
 *
 * That matters more here than the usual "polish" framing allows. In this market
 * the link travels by being pasted into a Law School class group, and a preview
 * card is the entire first impression. There is no second one.
 *
 * NO WEBFONT IS FETCHED. ImageResponse can load a font over the network at
 * render time, and the cost of that is a build-time or request-time dependency
 * on a third-party host for an image that must never fail. The default face is
 * plain, so the design carries the identity instead: the ink ground, the amber
 * rule, the scale jump between the claim and the count. A card that always
 * renders beats a prettier one that sometimes 500s.
 *
 * THE COUNT IS DERIVED, not typed, so it cannot go stale against the directory
 * it describes.
 */

export const alt = 'Esquirely: Nigeria\'s legal careers platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const firmCount = ALL_FIRMS.length

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#191510',
          padding: '72px 80px',
        }}
      >
        {/* The wordmark, set as the tile plus the name so the favicon and the
            share card are visibly the same object.

            ROUND, AND THE LETTER SET LARGE, TRACKING icon.svg. That file is now
            a circular pip with the E filling it, and this tile is the only
            other place the mark is drawn. The two have to move together or the
            claim in the line above stops being true — a share card and the
            favicon of the same link sit inches apart in a chat client, which is
            the one place a mismatch is unmissable.

            Still set as text here rather than as the favicon's four rects,
            because this renderer has a real font and the constraint that forced
            rects on the favicon does not apply. 42 rather than 34 puts the cap
            height at about the same fraction of the circle as the drawn E. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              backgroundColor: '#FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 42,
              fontWeight: 700,
              color: '#191510',
            }}
          >
            E
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: '#FAF6F0', letterSpacing: -0.5 }}>
            Esquirely
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              color: '#FAF6F0',
              lineHeight: 1.04,
              letterSpacing: -2.5,
              maxWidth: 900,
            }}
          >
            Your legal career starts here.
          </div>
          <div style={{ display: 'flex', height: 5, width: 128, backgroundColor: '#FBBF24', marginTop: 34 }} />
          {/* One interpolated string, not a value beside a text node. Satori
              requires an explicit display on any element with more than one
              child, and `{firmCount} Nigerian law firms...` is two children. */}
          <div style={{ fontSize: 30, color: '#B5AB98', marginTop: 30, maxWidth: 860, lineHeight: 1.4 }}>
            {`${firmCount} Nigerian law firms, verified job and internship listings, and scholarship deadlines.`}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: '#7C7261', letterSpacing: 1.5 }}>
          esquirely.com.ng
        </div>
      </div>
    ),
    size
  )
}
