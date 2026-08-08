import { rankingsOf, type Firm } from '@/lib/firms-data'

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
  firm: Pick<Firm, 'rankings'>
  variant?: 'compact' | 'full'
}) {
  const ranked = rankingsOf(firm)

  // Renders nothing at all rather than an "unranked" state. Absent data here
  // means nobody has checked the firm, and a label saying otherwise would be
  // making a claim the table cannot support.
  if (ranked.length === 0) return null

  if (variant === 'compact') {
    return (
      <span className="rank-badges" aria-label={`Ranked by ${ranked.map(r => r.label).join(', ')}`}>
        {ranked.map(r => (
          // The title carries the guide's full name and the edition, so the
          // information the compact form drops is still one hover away.
          <span key={r.key} className="grotesk-bold rank-badge" title={`${r.full}: ${r.band}, ${r.year}`}>
            {r.label}
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className="rank-panel">
      <p className="firm-profile-section-heading">Independent rankings</p>
      <ul className="rank-panel-list">
        {ranked.map(r => (
          <li key={r.key} className="rank-panel-row">
            <span className="grotesk-bold rank-badge rank-badge-lg">{r.label}</span>
            <span className="rank-panel-text">
              <span className="grotesk-bold rank-panel-band">{r.band}</span>
              <span className="grotesk-regular rank-panel-source">{r.full}, {r.year}</span>
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
    </div>
  )
}
