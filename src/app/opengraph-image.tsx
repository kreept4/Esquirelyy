import { ImageResponse } from 'next/og'
import OgMark, { MARK_AMBER } from '@/components/seo/OgMark'

/**
 * The site's share card: the logo, and nothing else.
 *
 * WHAT THIS REPLACED, TWICE. First a headline, an amber rule, a sentence about
 * the firm count and the domain, all set on a dark ground. That read as a page
 * rather than as a brand, and a link preview is not a page: it is a thumbnail
 * about 300px wide, sitting directly above the title and description the
 * platform already renders from the page's own metadata, so every word inside
 * the image was either duplicating that text or shrinking below the size anyone
 * reads it at. Then the mark on the same dark ground with the wordmark beneath
 * it, which was closer but still two objects and a colour the logo does not
 * have.
 *
 * NOW IT IS THE LOGO, FULL BLEED. Amber to every edge, the letter centred, no
 * ink field, no wordmark, no domain. A card with one object on it survives
 * being shown at a third of its size, which is the only size that matters here.
 *
 * The card is 1200x630 and the logo is square, so the amber is what fills the
 * difference rather than a second colour doing it. That is why the mark is
 * drawn `bare`: the ground IS the logo's ground, extended.
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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: MARK_AMBER,
        }}
      >
        {/* Sized off the SHORT edge, not the long one. At 630 tall, 420 leaves a
            margin roughly equal to the logo's own internal one, so the card
            reads as the mark with its breathing room rather than as a mark
            cropped by the canvas. */}
        <OgMark size={420} bare />
      </div>
    ),
    size
  )
}
