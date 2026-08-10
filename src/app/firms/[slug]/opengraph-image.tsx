import { ImageResponse } from 'next/og'
import { ALL_FIRMS, rankingsOf } from '@/lib/firms-data'
import OgMark from '@/components/seo/OgMark'

/**
 * The per-firm share card, and the highest-value one on the site.
 *
 * A directory link is shared far more often than a homepage link, because the
 * thing somebody sends a friend is "look at this firm", not "look at this site".
 * Before this, all sixty seven profiles previewed identically, as the same blank
 * slot with the same sitewide title. Now a profile pasted into a group chat
 * previews as that firm, with its tier and its cities, which is the difference
 * between a link and a recommendation.
 *
 * THE FIRM'S OWN LOGO IS DELIBERATELY NOT DRAWN HERE. ImageResponse would have
 * to fetch it over the network at render time, from Supabase storage or the
 * firm's own host, and a card that renders a broken box for the twelve firms
 * with no artwork — or times out for any firm whose host is slow — is worse than
 * one that never tries. The type does the work, and the name is what the reader
 * is looking for anyway.
 *
 * SIZE IS SET FROM THE NAME LENGTH because these names are not the same shape.
 * "Templars" and "Olaniwun Ajayi LP" and "Aluko & Oyebode" want three different
 * sizes to fill the same box, and a single size that fits the longest wastes
 * two thirds of the card on the shortest.
 */

export const alt = 'Law firm profile on Esquirely'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const firm = ALL_FIRMS.find(f => f.slug === slug)

  const name = firm?.name ?? 'Esquirely'
  const cities = firm ? [...new Set(firm.offices.map(o => o.city))] : []
  const rankings = firm ? rankingsOf(firm) : []

  /* Thresholds picked against the real names in the directory rather than
     round numbers: the longest is "Aluko & Oyebode" territory at the upper
     band and "Punuka Attorneys & Solicitors" at the lower one. */
  const nameSize = name.length > 28 ? 62 : name.length > 18 ? 76 : 96

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
          padding: '68px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* The same drawing as the favicon and the site card, not a capital
              E set in whatever face the renderer resolves. See OgMark. */}
          <OgMark size={44} />
          <div style={{ fontSize: 25, fontWeight: 600, color: '#FAF6F0' }}>Esquirely</div>
          <div style={{ fontSize: 25, color: '#5C5445' }}>/</div>
          <div style={{ fontSize: 25, color: '#B5AB98' }}>Firms directory</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: nameSize,
              fontWeight: 700,
              color: '#FAF6F0',
              lineHeight: 1.03,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {name}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 32 }}>
            {firm && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#191510',
                  backgroundColor: '#FBBF24',
                  padding: '8px 18px',
                  borderRadius: 999,
                }}
              >
                {firm.tier}
              </div>
            )}
            {/* Only shown when a firm actually has rankings, which most do not.
                That absence is the signal working: a badge every card carries
                distinguishes nothing. */}
            {rankings.length > 0 && (
              <div style={{ display: 'flex', fontSize: 24, color: '#FBBF24' }}>
                {`Ranked in ${rankings.length} international ${rankings.length === 1 ? 'guide' : 'guides'}`}
              </div>
            )}
          </div>

          {cities.length > 0 && (
            <div style={{ display: 'flex', fontSize: 30, color: '#B5AB98', marginTop: 26 }}>
              {cities.join('  ·  ')}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', fontSize: 22, color: '#7C7261', letterSpacing: 1.5 }}>
          {`esquirely.com.ng/firms/${slug}`}
        </div>
      </div>
    ),
    size
  )
}
