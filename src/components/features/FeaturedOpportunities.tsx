import Link from 'next/link'
import { logoForEmployer } from '@/lib/firms-data'

/**
 * Featured roles, rendered as an editorial index rather than a card grid.
 *
 * The old version stacked six bordered cards with a coloured left rule, which
 * read as filler because every card was the same weight. This gives the first
 * role the space it deserves and lists the rest as a numbered index, which is
 * how a directory actually wants to be read.
 */

const INK = '#1A1A1A'
const BORDER = '#E8E0D5'
const MUTED = '#8A8378'
const VERIFIED = '#2D6A4F'

const TYPE_LABELS: Record<string, string> = {
  job: 'Full-time',
  internship: 'Internship',
  vacation_scheme: 'Vacation scheme',
  pupillage: 'Pupillage',
}

function deadlineLabel(l: any): string {
  if (l.is_rolling) return 'Rolling'
  if (!l.deadline) return 'Open'
  return new Date(l.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

/** Employer mark: real logo for directory firms, initials for everyone else
 *  (banks, fintechs, corporates) — never a generic grey placeholder. */
function Mark({ employer, size = 34 }: { employer: string; size?: number }) {
  const url = logoForEmployer(employer)
  const initials = employer
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'the', 'plc', 'inc.', 'inc'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
  return (
    // One treatment for every employer: white landscape plate, thin rule. These
    // are mostly wide wordmarks, so a circular plate shrank them to its inscribed
    // width and left a small rectangle floating in a round hole.
    <span style={{ width: Math.round(size * 1.6), height: size, borderRadius: '6px', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', border: `0.5px solid ${BORDER}`, padding: '3px' }}>
      {url ? (
        <img src={url} alt={employer} style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
      ) : (
        <span className="display-bold" style={{ fontSize: size * 0.36, color: INK, letterSpacing: '-0.02em' }}>{initials}</span>
      )}
    </span>
  )
}

function Meta({ listing }: { listing: any }) {
  const bits = [TYPE_LABELS[listing.type] || listing.type, listing.location, deadlineLabel(listing)].filter(Boolean)
  return (
    <p className="grotesk-regular" style={{ fontSize: '0.72rem', color: MUTED }}>
      {bits.join(' · ')}
    </p>
  )
}

export default function FeaturedOpportunities({ listings }: { listings: any[] }) {
  if (!listings.length) return null
  const [lead, ...rest] = listings

  return (
    <section style={{ borderBottom: `0.5px solid ${BORDER}`, backgroundColor: '#FAF7F2' }}>
      <div style={{ maxWidth: 'min(1800px, 94vw)', margin: '0 auto', padding: '5.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', marginBottom: '3rem' }}>
          <h2 className="display-black" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', color: INK, lineHeight: 1.05, maxWidth: '14ch' }}>
            open right now.
          </h2>
          <Link href="/jobs" className="grotesk-bold featured-all" style={{ fontSize: '0.78rem', color: INK, textDecoration: 'none', paddingBottom: '0.4rem', borderBottom: `1px solid ${INK}`, whiteSpace: 'nowrap' }}>
            View all roles
          </Link>
        </div>

        <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '3.5rem', alignItems: 'start' }}>
          {/* Lead role, given real weight */}
          <Link href={'/jobs/' + lead.slug} className="featured-lead" style={{ display: 'block', textDecoration: 'none', border: `0.5px solid ${BORDER}`, borderRadius: '14px', backgroundColor: '#FFFFFF', padding: '2rem', height: '100%' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {lead.is_verified && (
                <span className="grotesk-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: VERIFIED, border: `1px solid ${VERIFIED}`, borderRadius: '999px', padding: '3px 11px' }}>Verified</span>
              )}
              {lead.tier && (
                <span className="grotesk-regular" style={{ fontSize: '0.62rem', color: MUTED, border: `1px solid ${BORDER}`, borderRadius: '999px', padding: '3px 11px' }}>{lead.tier}</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.9rem' }}>
              <Mark employer={lead.employer} size={44} />
              <p className="grotesk-bold" style={{ fontSize: '0.85rem', color: INK }}>{lead.employer}</p>
            </div>
            <h3 className="display-bold" style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', color: INK, lineHeight: 1.15, marginBottom: '1rem' }}>
              {lead.title}
            </h3>

            {lead.practice_areas?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {lead.practice_areas.slice(0, 3).map((a: string) => (
                  <span key={a} className="grotesk-regular" style={{ fontSize: '0.68rem', color: '#4A4A4A', backgroundColor: '#F0EBE3', borderRadius: '999px', padding: '4px 12px' }}>{a}</span>
                ))}
              </div>
            )}

            <div style={{ paddingTop: '1.25rem', borderTop: `0.5px solid ${BORDER}` }}>
              <Meta listing={lead} />
            </div>
          </Link>

          {/* The rest, as a numbered index */}
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {rest.map((l: any, i: number) => (
              <li key={l.id}>
                <Link href={'/jobs/' + l.slug} className="featured-row" style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start', textDecoration: 'none', padding: '1.15rem 0.75rem', borderTop: `0.5px solid ${BORDER}`, borderRadius: '8px' }}>
                  <Mark employer={l.employer} size={34} />
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <span className="grotesk-bold" style={{ fontSize: '0.9rem', color: INK, lineHeight: 1.3 }}>{l.title}</span>
                      {l.is_verified && (
                        <span className="grotesk-bold" style={{ fontSize: '0.56rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: VERIFIED, flexShrink: 0 }}>Verified</span>
                      )}
                    </span>
                    <span className="grotesk-regular" style={{ display: 'block', fontSize: '0.76rem', color: '#4A4A4A', margin: '3px 0 5px' }}>{l.employer}</span>
                    <Meta listing={l} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
