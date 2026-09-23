import { firmForEmployer, firmLogo } from '@/lib/firms-data'
import type { ArticleAuthor } from '@/lib/articles-data'

/**
 * A writer's photograph with their firm's mark on it.
 *
 * ⚠ THE BADGE IS THE POINT, NOT DECORATION. A piece by an associate at a firm
 * in our directory carries that firm's logo on the byline, which does more than
 * the firm's name in text: the reader places the writer in a second, and the
 * firm is visibly attached to something written well by one of its own. That is
 * most of what a writer is being paid in, and it is the reason a firm would
 * ever point its own people here.
 *
 * ⚠ RESOLVED THROUGH firmForEmployer, NEVER A HAND-WRITTEN SLUG OR PATH. That
 * is the matcher the job board, the logo lookup and the firm pages all use, so
 * a writer's employer resolves exactly the way an employer on a listing does
 * and the two cannot drift apart. A firm outside the directory gets no mark,
 * which is the honest outcome rather than a broken image.
 *
 * ⚠ DEGRADES IN BOTH DIRECTIONS. No photograph and it renders the initial on a
 * plain disc; no firm and it renders the photograph alone. Neither is an error
 * state, because most writers will have one and not the other.
 */
export default function WriterMark(
  { author, size = 40 }: { author: ArticleAuthor; size?: number },
) {
  const firm = firmForEmployer(author.firm)
  const mark = firm ? firmLogo(firm) : null
  const initial = author.name.trim().charAt(0).toUpperCase()

  return (
    <span
      className="writer-mark"
      style={{ width: size, height: size }}
      /* The firm is named for a screen reader here rather than in the img alt,
         because the mark is a fact about the writer and not a second image
         worth announcing on its own. */
      title={firm ? `${author.name}, ${firm.shortName || firm.name}` : author.name}
    >
      {author.image ? (
        <img className="writer-mark-face" src={author.image} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="writer-mark-initial grotesk-bold" aria-hidden="true">{initial}</span>
      )}
      {mark && (
        <span className="writer-mark-badge">
          <img src={mark} alt="" loading="lazy" decoding="async" />
        </span>
      )}
    </span>
  )
}
