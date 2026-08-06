'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import PageHeader from '@/components/layout/PageHeader'
import LogoFrame from '@/components/ui/LogoFrame'
import EmptyState from '@/components/ui/EmptyState'
import { ALL_FIRMS, firmLogo, getMonogram } from '@/lib/firms-data'

const TIER_OPTIONS = [
  { value: '', label: 'All Tiers' },
  { value: 'Tier 1', label: 'Tier 1' },
  { value: 'Tier 2', label: 'Tier 2' },
  { value: 'Boutique', label: 'Boutique' },
]
/** Derived from the data, not hand-listed.
 *
 *  This was a fixed list of Lagos, Abuja and Port Harcourt, so every other
 *  office was unreachable by filter: firms have addresses in Ibadan, Enugu,
 *  Benin City, Asaba, Accra, Yaoundé and London, and none of them could be
 *  selected. Deriving the options means a city added to a firm's `offices`
 *  shows up here on its own.
 *
 *  Ordered by how many firms have an office there, so the useful choices sit at
 *  the top of the list rather than in alphabetical order. */
const CITY_OPTIONS = [
  { value: '', label: 'All Cities' },
  ...Object.entries(
    ALL_FIRMS.flatMap(f => f.offices.map(o => o.city)).reduce<Record<string, number>>(
      (acc, city) => ({ ...acc, [city]: (acc[city] || 0) + 1 }),
      {}
    )
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([city]) => ({ value: city, label: city })),
]
const PRACTICE_OPTIONS = [
  'Corporate & Commercial','Dispute Resolution','Energy & Natural Resources',
  'Banking & Finance','Capital Markets','Tax','Arbitration',
  'Intellectual Property','Shipping & Maritime','Public Law & Regulatory',
]

/** Firm mark for the directory grid.
 *
 *  This used to be a bespoke 48px avatar with its own copy of the storage URL,
 *  its own monogram routine and its own fit rules, which is why the directory
 *  and the home marquee never sized their logos alike. Both now render through
 *  LogoFrame, so a change to how marks are fitted lands in both places at once.
 *
 *  Only the frame is smaller here; the proportions and the cream plate match
 *  the ticker. Firms with no usable art keep the ink monogram tile, since an
 *  empty plate reads as a broken image rather than a deliberate blank. */
function FirmAvatar({ firm }: { firm: { slug: string; logoFile?: string | null; name: string } }) {
  const url = firmLogo(firm)

  if (!url) {
    /* Quiet monogram, not a solid ink block.
     *
     * Twelve firms in the directory have no artwork yet, and a filled black
     * tile is heavier than any real logo on the page: it pulls the eye to
     * precisely the firms with the least to show. A hairline plate with ink
     * lettering occupies the same box and holds the grid without shouting. */
    return (
      <span className="firm-monogram">
        <span className="grotesk-bold">{getMonogram(firm.name)}</span>
      </span>
    )
  }

  return <LogoFrame src={url} alt={firm.name} capHeight={1.6} maxWidth={5} plate />
}

const SearchIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>)
const MapPinIcon = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>)
const BriefcaseIcon = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>)
const XIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>)

export default function FirmsPage() {
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('')
  const [city, setCity] = useState('')
  const [practiceArea, setPracticeArea] = useState('')

  const filtered = useMemo(() => {
    return ALL_FIRMS.filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.practiceAreas.some((p: string) => p.toLowerCase().includes(search.toLowerCase()))) return false
      if (tier && f.tier !== tier) return false
      if (city && !f.offices.some((o: { city: string; address: string }) => o.city === city)) return false
      if (practiceArea && !f.practiceAreas.includes(practiceArea)) return false
      return true
    })
  }, [search, tier, city, practiceArea])

  const hasFilters = tier || city || practiceArea

  return (
    <>
      <main className="page-main">

        <PageHeader
          tone="ink"
          heading="Firms directory"
          subcopy="Profiles of Nigerian law firms with tier rankings, practice-area breakdowns, and hiring history."
        >

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Capped rather than free-growing. At flex:1 the search bar ate
                  the whole row on a wide viewport and the three selects were
                  pushed to the far edge, which read as a stray input rather
                  than as one control group. */}
              <div style={{ position: 'relative', flex: '1 1 17.5rem', maxWidth: '26rem' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }}><SearchIcon /></span>
                <input
                  type="text"
                  placeholder="Search firms or practice areas"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="field"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>

              {[
                { value: tier, setter: setTier, options: TIER_OPTIONS, placeholder: 'Tier' },
                { value: city, setter: setCity, options: CITY_OPTIONS, placeholder: 'City' },
              ].map(({ value, setter, options, placeholder }) => (
                <select key={placeholder} className="filter-pill" data-active={!!value} value={value} onChange={e => setter(e.target.value)}>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ))}

              <select className="filter-pill" data-active={!!practiceArea} value={practiceArea} onChange={e => setPracticeArea(e.target.value)}>
                <option value="">All Practice Areas</option>
                {PRACTICE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Colour is left to .filter-pill so the ink header can invert it.
                  The inline `color: var(--ink)` this button used to carry made
                  the label invisible against the dark ground. */}
              {hasFilters && (
                <button className="filter-pill" onClick={() => { setTier(''); setCity(''); setPracticeArea('') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XIcon /> Clear
                </button>
              )}
            </div>
        </PageHeader>

        {/* One practical note, placed where someone is about to pick a firm and
            write to it rather than buried in the FAQ. Addressing a letter to a
            named person is the single cheapest thing that separates an
            application that gets read from one that gets filed. */}
        <div className="shell firms-tip-wrap">
          <p className="grotesk-regular firms-tip">
            <span className="grotesk-bold">Before you write, find out who will read it.</span>{' '}
            A letter addressed to the partner who leads the practice you are interested in, or to the
            firm&rsquo;s recruitment or HR lead, reads very differently from one that opens
            &ldquo;Dear Sir/Madam&rdquo;. Most firms list their partners and associates on their own
            site, and LinkedIn usually fills the gaps.
          </p>
          <p className="grotesk-regular firms-tip">
            If no name is published anywhere, address the role rather than nobody at all:{' '}
            <span className="grotesk-bold">The Managing Partner</span> or{' '}
            <span className="grotesk-bold">The Head of Recruitment</span>{' '}is correct and
            professional. Avoid &ldquo;To Whom It May Concern&rdquo;.
          </p>
        </div>

        <div className="shell" style={{ padding: '0 2rem 2rem' }}>
          {filtered.length === 0 ? (
            <EmptyState
              heading="No firms match that."
              body="Try a broader practice area, or clear a filter to see the full directory."
            />
          ) : (
            <div className="card-grid">
              {filtered.map(firm => (
                <Link key={firm.slug} href={`/firms/${firm.slug}`}>

                  {/* Name first, tier as a quiet line beneath it.
                      This replaces two stacked uppercase micro-labels above the
                      firm name: a tier eyebrow and a green "Verified" chip that
                      sat on all forty four cards. A badge every card carries
                      distinguishes nothing, it just adds a second colour and a
                      second type size before the reader reaches the name. The
                      name is the thing being scanned, so it now leads. */}
                  <div className="firm-card-head">
                    <FirmAvatar firm={firm} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="grotesk-bold firm-card-name">{firm.name}</p>
                      <p className="grotesk-regular firm-card-tier">{firm.tier}</p>
                    </div>
                  </div>

                  <p className="grotesk-regular firm-card-desc">{firm.description}</p>

                  <div className="firm-card-tags">
                    {firm.practiceAreas.slice(0, 3).map((area: string) => (
                      <span key={area} className="tag-chip">{area}</span>
                    ))}
                    {firm.practiceAreas.length > 3 && (
                      <span className="grotesk-regular firm-card-more">+{firm.practiceAreas.length - 3}</span>
                    )}
                  </div>

                  {/* The trailing arrow is gone. The whole card is a link, so an
                      arrow on each one repeated the affordance in miniature
                      forty four times without adding a target. */}
                  <div className="firm-card-foot">
                    <span className="meta-line">
                      <MapPinIcon />{firm.offices.map((o: { city: string; address: string }) => o.city).join(' · ')}
                    </span>
                    {firm.openRoles > 0 && (
                      <span className="meta-line firm-card-roles">
                        <BriefcaseIcon />{firm.openRoles} open role{firm.openRoles !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
