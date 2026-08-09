'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import PageHeader from '@/components/layout/PageHeader'
import LogoFrame from '@/components/ui/LogoFrame'
import EmptyState from '@/components/ui/EmptyState'
import RankingBadges from '@/components/ui/RankingBadges'
import { ALL_FIRMS, firmLogo, getMonogram, rankingsOf } from '@/lib/firms-data'

const TIER_OPTIONS = [
  { value: '', label: 'All Tiers' },
  { value: 'Tier 1', label: 'Tier 1' },
  { value: 'Tier 2', label: 'Tier 2' },
  { value: 'Boutique', label: 'Boutique' },
]
/** Which directory ranked the firm. Options are the three guides plus "any",
 *  because "is this firm in any of them" is the question most readers actually
 *  have; the individual guides are there for someone who knows they care about
 *  one of them in particular. */
const RANKED_OPTIONS = [
  { value: '', label: 'All Firms' },
  { value: 'any', label: 'Ranked (any guide)' },
  { value: 'chambers', label: 'Chambers' },
  { value: 'iflr', label: 'IFLR1000' },
  { value: 'emea', label: 'Legal 500 EMEA' },
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

/** How densely the directory is drawn.
 *
 *  Stored rather than reset each visit. Density is a standing preference about
 *  how someone likes to read a directory, not a per-visit decision, and a
 *  reader who wants the list is going to want it every time. */
type View = 'detailed' | 'grid' | 'list'

const VIEW_KEY = 'esquirely.firms.view'
const VIEWS: View[] = ['detailed', 'grid', 'list']

/** Firm mark for the directory grid.
 *
 *  This used to be a bespoke 48px avatar with its own copy of the storage URL,
 *  its own monogram routine and its own fit rules, which is why the directory
 *  and the home marquee never sized their logos alike. Both now render through
 *  LogoFrame, so a change to how marks are fitted lands in both places at once.
 *
 *  Only the frame is smaller here; the proportions and the cream plate match
 *  the ticker. Firms with no usable art keep the ink monogram tile, since an
 *  empty plate reads as a broken image rather than a deliberate blank.
 *
 *  The list row takes a smaller frame, and it is a prop rather than a CSS
 *  override because LogoFrame sizes its box with inline styles. Reaching past
 *  that from a stylesheet would take !important on two properties, and the
 *  next person to touch LogoFrame would have no way of knowing this page
 *  depended on the exact numbers. */
function FirmAvatar({ firm, compact }: { firm: { slug: string; logoFile?: string | null; name: string }; compact?: boolean }) {
  const url = firmLogo(firm)

  if (!url) {
    /* Quiet monogram, not a solid ink block.
     *
     * Twelve firms in the directory have no artwork yet, and a filled black
     * tile is heavier than any real logo on the page: it pulls the eye to
     * precisely the firms with the least to show. A hairline plate with ink
     * lettering occupies the same box and holds the grid without shouting. */
    return (
      <span className={`firm-monogram${compact ? ' firm-monogram-sm' : ''}`}>
        <span className="grotesk-bold">{getMonogram(firm.name)}</span>
      </span>
    )
  }

  return compact
    ? <LogoFrame src={url} alt={firm.name} capHeight={1.1} maxWidth={3.4} plate />
    : <LogoFrame src={url} alt={firm.name} capHeight={1.6} maxWidth={5} plate />
}

const SearchIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>)
/**
 * The card-foot marks. Duotone, and drawn to geometry rather than sketched.
 *
 * These have been through three states. Stock stroked icons first, which at
 * this size is hopeless: a 2-unit stroke on a 24 viewBox lands under one device
 * pixel, so the pin lost its point and read as a faint ◎. Filling them fixed
 * legibility and left them flat, which is the state this replaces. Flat is what
 * makes a mark read as cheap: one silhouette at one opacity is the shape of an
 * icon rather than a picture of an object.
 *
 * THE FIX IS A SECOND TONE, NOT MORE LINE WORK, and the distinction matters
 * because the obvious way to enrich an icon is to add interior detail, and at
 * this size that is the one thing guaranteed to fail. A 1-unit seam on a 24
 * viewBox is 0.6 of a device pixel at 14px: it does not render as a fine line,
 * it renders as a grey smear that dirties the whole mark. Areas survive
 * downscaling where hairlines do not, so the depth here is carried by two
 * opacity planes and a cast shadow, all of which are areas.
 *
 * THE PIN is a true teardrop, not a rounded blob with a spike. A circle of
 * r 6.4 centred at (12, 9.2), an apex at (12, 20.15), and the two flanks are
 * the actual TANGENTS from that apex to that circle. Tangency is the whole
 * trick: where a hand-drawn curve meets the point there is always a slight
 * shoulder or a kink, and at this size a kink is a blurred pixel. A tangent
 * meets the circle at exactly one point with no change of direction, so the
 * silhouette runs unbroken from tip to bulb. Contact points fall at
 * (6.8, 12.92) and (17.2, 12.92), from h = r²/d and w = r√(d²−r²)/d with
 * d = 10.95.
 *
 * ITS SHADOW is the whole upgrade. A 4.4 × 1.5 ellipse at 30%, sitting a
 * fraction below the tip so the pin stands on it rather than overlaps it. At
 * 14px that ellipse is under a pixel tall, which for a hairline would be fatal
 * and for a shadow is exactly right: it antialiases into a soft grey smudge,
 * which is what a shadow is. It is the difference between a symbol lying on the
 * page and an object standing on it.
 *
 * THE HOLE is knocked out with evenodd rather than drawn in the page colour, so
 * the mark works on cream, on the carton panels and on ink without carrying a
 * fill that has to match its ground.
 *
 * THE BRIEFCASE is built as three planes. The handle at full weight, the case
 * body at 36%, and the lid band at full weight across the middle. Reading the
 * body back at a third gives the case a front and a lid instead of one
 * undifferentiated block, and the band lands where a real case opens.
 *
 * ITS CLASP is knocked out of the band, not drawn on it, so what shows through
 * is the 36% body beneath rather than the page. That is what keeps the clasp
 * legible: a hole to the page would be a hard white notch on any ground and
 * would fail outright on the ink panels, while a hole to the lighter plane is a
 * tonal step that holds up everywhere. The band spans the full 2 to 22, which
 * is safe because a rect of rx 2.8 is at its full width across its middle, so
 * the two edges meet flush with no seam to fake.
 *
 * SIZE went 11, then 12, now 14. The pin's hole needed a clean pixel and a half
 * to stop closing up on non-retina screens, and the duotone needs a little more
 * again before the two planes separate. 14 against the 0.72rem label beside it
 * is a touch larger than the old ratio and reads as deliberate rather than as
 * an icon that outgrew its row.
 *
 * Kept as a matched pair on purpose: same optical weight, same corner radius
 * family, same two-tone rule, same 36% for the recessive plane. They sit 1rem
 * apart on the same row, so any mismatch between them reads as two icon sets.
 * The 15px SearchIcon above stays stroked and flat, because it belongs to the
 * filter bar with the other controls rather than to this row.
 */
const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <ellipse cx="12" cy="21.1" rx="4.4" ry="1.5" opacity="0.3" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.8 12.92A6.4 6.4 0 1 1 17.2 12.92L12 20.15Z M12 6.45a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z"
    />
  </svg>
)
const BriefcaseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M9.7 2.4h4.6A2.6 2.6 0 0 1 16.9 5v2.1h-2.2V5.3a.85.85 0 0 0-.85-.85h-3.7a.85.85 0 0 0-.85.85v1.8H7.1V5a2.6 2.6 0 0 1 2.6-2.6Z" />
    <rect x="2" y="7.5" width="20" height="14" rx="2.8" opacity="0.36" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 11.6h20v3.7H2Z M11.05 12.5a.95.95 0 0 0 0 1.9h1.9a.95.95 0 0 0 0-1.9Z"
    />
  </svg>
)
const XIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>)

/**
 * The three layout marks.
 *
 * Stroked, not filled, and at 15px, which is the rule the SearchIcon above
 * already follows: a stroke resolves at this size, and these belong to the
 * filter bar rather than to the 12px card foot where filling was necessary.
 *
 * Each one is a picture of its own result rather than a generic symbol. The
 * detailed mark is a single card with a head band, the grid mark is four tiles,
 * the list mark is stacked rows with a leading bullet. Someone who has never
 * used the control should be able to guess all three from the shapes, because
 * there is no room in the row for three text labels on a phone.
 *
 * The list bullets are zero-length segments with a round cap, which is the
 * cheapest way to draw a dot that inherits stroke width along with the rules
 * beside it. Drawing them as circles would mean maintaining a separate radius
 * that stops matching the moment the stroke weight changes.
 */
const ViewDetailedIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3.5" y="4" width="17" height="16" rx="2" />
    <path d="M3.5 11h17" />
  </svg>
)
const ViewGridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
    <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
  </svg>
)
const ViewListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01M9.5 6.5h10M9.5 12h10M9.5 17.5h10" />
  </svg>
)

const VIEW_META: Record<View, { label: string; Icon: () => React.JSX.Element }> = {
  detailed: { label: 'Detailed cards', Icon: ViewDetailedIcon },
  grid: { label: 'Compact grid', Icon: ViewGridIcon },
  list: { label: 'List', Icon: ViewListIcon },
}

export default function FirmsPage() {
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('')
  const [city, setCity] = useState('')
  const [practiceArea, setPracticeArea] = useState('')
  const [ranked, setRanked] = useState('')

  /* Starts on the detailed card and corrects itself after mount.
     Reading storage in the useState initialiser would make the server render
     'detailed' and the client render whatever was saved, which is a hydration
     mismatch: React keeps the server's markup and the reader's choice silently
     does nothing until the next navigation. The one-frame correction here is
     the price of the preference surviving at all. */
  const [view, setView] = useState<View>('detailed')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_KEY)
      if (saved && (VIEWS as string[]).includes(saved)) setView(saved as View)
    } catch { /* Private mode. The default is a fine place to land. */ }
  }, [])

  function chooseView(next: View) {
    setView(next)
    try { window.localStorage.setItem(VIEW_KEY, next) } catch { /* nothing to do */ }
  }

  const filtered = useMemo(() => {
    return ALL_FIRMS.filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.practiceAreas.some((p: string) => p.toLowerCase().includes(search.toLowerCase()))) return false
      if (tier && f.tier !== tier) return false
      if (city && !f.offices.some((o: { city: string; address: string }) => o.city === city)) return false
      if (practiceArea && !f.practiceAreas.includes(practiceArea)) return false
      if (ranked === 'any' && rankingsOf(f).length === 0) return false
      if (ranked && ranked !== 'any' && !rankingsOf(f).some(r => r.key === ranked)) return false
      return true
    })
  }, [search, tier, city, practiceArea, ranked])

  const hasFilters = tier || city || practiceArea || ranked

  /* The ranking filter is hidden until the table behind it has something in it.
     A select whose every option returns an empty directory is worse than no
     select: it reads as a broken filter rather than as an unpopulated one.
     Delete nothing to turn it on — adding a firm to FIRM_RANKINGS is enough. */
  const anyRankings = useMemo(() => ALL_FIRMS.some(f => rankingsOf(f).length > 0), [])

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

              {anyRankings && (
                <select className="filter-pill" data-active={!!ranked} value={ranked} onChange={e => setRanked(e.target.value)}>
                  {RANKED_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}

              {/* Colour is left to .filter-pill so the ink header can invert it.
                  The inline `color: var(--ink)` this button used to carry made
                  the label invisible against the dark ground. */}
              {hasFilters && (
                <button className="filter-pill" onClick={() => { setTier(''); setCity(''); setPracticeArea(''); setRanked('') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XIcon /> Clear
                </button>
              )}

              {/* Pushed to the far end of the row, because it is not a filter.
                  Everything to its left changes which firms are listed; this
                  changes only how they are drawn, and sitting it in the middle
                  of the selects would invite the reader to look for it in the
                  cleared-filters count. On a phone the row wraps and it takes
                  its own line, which is the correct outcome for a control that
                  belongs to the results rather than to the query. */}
              <div className="view-toggle" role="group" aria-label="Directory layout" style={{ marginLeft: 'auto' }}>
                {VIEWS.map(v => {
                  const { label, Icon } = VIEW_META[v]
                  return (
                    <button
                      key={v}
                      type="button"
                      className="view-toggle-btn"
                      data-active={view === v}
                      aria-pressed={view === v}
                      aria-label={label}
                      title={label}
                      onClick={() => chooseView(v)}
                    >
                      <Icon />
                    </button>
                  )
                })}
              </div>
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

        <div className="shell firms-grid-wrap">
          {filtered.length === 0 ? (
            <EmptyState
              heading="No firms match that."
              body="Try a broader practice area, or clear a filter to see the full directory."
            />
          ) : (
            <div className="card-grid" data-view={view}>
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
                    <FirmAvatar firm={firm} compact={view === 'list'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="grotesk-bold firm-card-name">{firm.name}</p>
                      {/* Tier is ours; the badges beside it are not. They sit
                          on the same line so the reader sees at a glance which
                          of the two labels came from outside. Renders nothing
                          for a firm with no checked rankings, which is most of
                          them — that absence is the signal working. */}
                      <p className="grotesk-regular firm-card-tier">
                        {firm.tier}
                        <RankingBadges firm={firm} />
                      </p>
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
