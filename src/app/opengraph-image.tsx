import { ImageResponse } from 'next/og'
import OgMark from '@/components/seo/OgMark'

/**
 * The site's share card: the mark, and nothing else.
 *
 * WHAT THIS REPLACED, AND WHY. This card used to carry the headline, an amber
 * rule, a sentence about the firm count and the domain. It read as a page
 * rather than as a brand, and a link preview is not a page. It is a thumbnail
 * roughly 300px wide in a WhatsApp thread, sitting directly above the title and
 * description the platform already renders from the page's own metadata. Every
 * word set inside the image was therefore either duplicating that text or
 * shrinking below the size anyone reads it at.
 *
 * So the image does the one job the metadata cannot: it says whose link this is
 * at a glance, in the colour the brand is recognised by.
 *
 * DRAWN AS RECTS, IN THE FAVICON'S OWN GEOMETRY. The previous version set a
 * capital E as text inside the circle and relied on the renderer's default
 * face, which is not the drawn E in icon.svg and did not match it. The mark now
 * comes from OgMark, which both share cards render. See that file.
 *
 * NO WEBFONT IS FETCHED, and now nothing depends on a font at all. The old note
 * here argued a plain default face was an acceptable cost against a build time
 * dependency on a third party host. That trade no longer has to be made: the
 * wordmark is the only text left, and it is small enough that the default face
 * carries it.
 */

export const alt = 'Esquirely'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#191510',
        }}
      >
        <OgMark size={300} />

        {/* The name, and only the name. A logo card with no word on it makes a
            reader work out whose link it is from the shape alone, and the
            wordmark is part of the mark rather than copy about the product. */}
        <div
          style={{
            display: 'flex',
            marginTop: 56,
            fontSize: 64,
            fontWeight: 700,
            color: '#FAF6F0',
            letterSpacing: -1.5,
          }}
        >
          Esquirely
        </div>
      </div>
    ),
    size
  )
}
