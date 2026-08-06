/**
 * The "nothing matched" state, shared by every filterable surface.
 *
 * Jobs, scholarships and the firms directory each had their own version of this:
 * two centred paragraphs, slightly different sizes, slightly different spacing,
 * and no illustration. An empty result is the one screen guaranteed to feel
 * like a dead end, so it is worth more than a line of grey text.
 *
 * The artwork is the Storyset searching illustration, recoloured into the ink
 * palette by scripts/recolour-illustrations.mjs. It is deliberately quiet:
 * dropped to 90% opacity and capped in width so it reads as a mood rather than
 * a graphic competing with the copy under it.
 */
export default function EmptyState({
  heading,
  body,
  children,
}: {
  heading: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div className="empty-state">
      <img
        src="/illustrations/file-searching.svg"
        alt=""
        /* Decorative: the heading beneath already states the outcome, so
           announcing the image again would just be noise for a screen reader. */
        aria-hidden
        className="empty-state-art"
      />
      <p className="display-black empty-state-heading">{heading}</p>
      <p className="grotesk-regular empty-state-body">{body}</p>
      {children}
    </div>
  )
}
