import { RANKING_SOURCES, rankingsOf, type Firm } from '@/lib/firms-data'

/**
 * Chambers, IFLR1000 and Legal 500 EMEA badges.
 *
 * WHY THESE ARE ALLOWED TO BE BADGES WHEN THE OLD "VERIFIED" CHIP WAS NOT
 *
 * The directory used to carry a green "Verified" chip on every card, and it was
 * removed for the reason recorded on the firm card: a badge that every firm has
 * distinguishes nothing and merely adds a colour and a type size before the
 * reader reaches the name. These are the opposite case. Most firms will carry
 * none, some will carry one, a handful will carry three, and the difference is
 * the entire signal. A badge is worth its ink exactly when it is not universal.
 *
 * TWO SIZES, ONE COMPONENT
 *
 * `compact` is the directory card: initials only, no year, sitting under the
 * firm name where a fourth line of prose would not fit. `full` is the profile,
 * where there is room to name the guide and date the edition — and where the
 * year matters, because a reader deciding where to apply should be able to see
 * whether they are looking at this year's view or one from three years ago.
 *
 * NO LOGOS
 *
 * The guides' own marks are trademarks with licensing terms attached to their
 * use as an endorsement, and reproducing them would also mean three remote
 * images on a card that currently loads one. Set names carry the same
 * information and cost nothing.
 */
export default function RankingBadges({
  firm,
  variant = 'compact',
}: {
  firm: Pick<Firm, 'rankings' | 'memberships' | 'rankedIndividuals'>
  variant?: 'compact' | 'full'
}) {
  const ranked = rankingsOf(firm)
  /* Profile only, never the card. On a card it would sit inches from the firm
     badges at the same size and be read as one of them, which is the exact
     confusion it exists to avoid. The profile has room to say whose ranking it
     is in words. */
  const individuals = firm.rankedIndividuals ?? []
  /* Kept separate from `ranked` all the way through, never concatenated. A
     trade body admitting a firm and a directory banding it against its peers
     are different claims, and the moment they share a row they read as the
     same one. See FirmMembership. */
  const memberships = firm.memberships ?? []

  // Renders nothing at all rather than an "unranked" state. Absent data here
  // means nobody has checked the firm, and a label saying otherwise would be
  // making a claim the table cannot support.
  const hasIndividuals = variant === 'full' && individuals.length > 0
  if (ranked.length === 0 && memberships.length === 0 && !hasIndividuals) return null

  if (variant === 'compact') {
    return (
      <span
        className="rank-badges"
        aria-label={[
          ranked.length ? `Ranked by ${ranked.map(r => r.label).join(', ')}` : '',
          memberships.length ? `Member of ${memberships.map(m => m.body).join(', ')}` : '',
        ].filter(Boolean).join('. ')}
      >
        {memberships.map(m => (
          <span key={m.body} className="grotesk-bold rank-badge rank-badge-member" title={`${m.full}: ${m.note}`}>
            {m.body}
          </span>
        ))}
        {ranked.map(r => (
          // The title carries the guide's full name and the edition, so the
          // information the compact form drops is still one hover away.
          <span
            key={r.key}
            className="grotesk-bold rank-badge"
            title={
              r.areas && r.areas.length > 0
                ? `${r.full}: ${r.band}, ${r.year} (${r.areas.join(', ')})`
                : `${r.full}: ${r.band}, ${r.year}`
            }
          >
            {r.label}
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className="rank-panel">
      {memberships.length > 0 && (
        <>
          <p className="firm-profile-section-heading">Memberships</p>
          <ul className="rank-panel-list">
            {memberships.map(m => (
              <li key={m.body} className="rank-panel-row">
                <span className="grotesk-bold rank-badge rank-badge-lg rank-badge-member">{m.body}</span>
                <span className="rank-panel-text">
                  <span className="grotesk-bold rank-panel-band">{m.note}</span>
                  <span className="grotesk-regular rank-panel-source">{m.full}</span>
                </span>
              </li>
            ))}
          </ul>
          {/* The counterpart to the note under the rankings, and the more
              important of the two. A reader who has just seen Chambers and
              Legal 500 will read anything in the same panel as another
              scoreboard. ISDA does not score anyone: it admits firms and works
              with them on the documentation the market runs on. That is a
              different claim, and a better one for some readers, but only if it
              is not mistaken for a band. */}
          <p className="grotesk-regular rank-panel-note">
            ISDA is a trade body, not a legal directory. It bands nobody. It admits
            firms as members and works with them on the standard derivatives
            documentation its markets run on, so this tells you what a firm does
            rather than where it places.
          </p>
        </>
      )}

      {ranked.length === 0 ? null : (
      <>
      <p className="firm-profile-section-heading">Independent rankings</p>
      <ul className="rank-panel-list">
        {ranked.map(r => (
          <li key={r.key} className="rank-panel-row">
            <span className="grotesk-bold rank-badge rank-badge-lg">{r.label}</span>
            <span className="rank-panel-text">
              <span className="grotesk-bold rank-panel-band">{r.band}</span>
              <span className="grotesk-regular rank-panel-source">{r.full}, {r.year}</span>
              {/* What the band was earned in. Without this a reader reasonably
                  assumes the ranking covers everything the firm does, which is
                  the more misleading of the two ways this can be wrong. Only
                  the areas held AT this band are listed, so nothing here is
                  carried by a rank it did not earn. */}
              {r.areas && r.areas.length > 0 && (
                <span className="grotesk-regular rank-panel-areas">
                  {r.areas.join(' · ')}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {/* Said once, on the page where someone is deciding what the badge is
          worth. The guides are researched by interviewing clients and opposing
          counsel, which is the only reason a ranking means more than a firm's
          own description of itself — and a reader who does not know that cannot
          weigh it. */}
      <p className="grotesk-regular rank-panel-note">
        These are independent legal directories. Each researches its rankings by
        interviewing a firm&rsquo;s own clients and the lawyers on the other side of its
        matters, so no firm can place itself in one.
      </p>
      </>
      )}

      {hasIndividuals && (
        <>
          <p className="firm-profile-section-heading">Ranked lawyers</p>
          <ul className="rank-panel-list">
            {individuals.map(p => {
              const source = RANKING_SOURCES.find(s => s.key === p.source)
              return (
                <li key={p.name} className="rank-panel-row">
                  <span className="grotesk-bold rank-badge rank-badge-lg rank-badge-person">
                    {source?.label ?? p.source}
                  </span>
                  <span className="rank-panel-text">
                    <span className="grotesk-bold rank-panel-band">
                      {p.name}{p.band ? `, ${p.band}` : ''}
                    </span>
                    <span className="grotesk-regular rank-panel-source">
                      {[source?.full ?? p.source, p.year].filter(Boolean).join(', ')}
                    </span>
                    {p.area && <span className="grotesk-regular rank-panel-areas">{p.area}</span>}
                  </span>
                </li>
              )
            })}
          </ul>
          {/* The whole reason this block is allowed to exist. Without this
              sentence it is a ranking sitting on a firm profile, which is the
              one thing this directory has decided not to do. */}
          <p className="grotesk-regular rank-panel-note">
            This ranking belongs to the lawyer named, not to the firm. The guide
            records none for the practice as a whole, which is common where a
            litigation practice is built around a single senior advocate.
          </p>
        </>
      )}
    </div>
  )
}
