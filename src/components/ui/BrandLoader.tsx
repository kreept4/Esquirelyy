/**
 * Loading state, as the wordmark rather than a spinner.
 *
 * A generic spinner says "something is happening" and nothing else. These waits
 * are long by web standards, thirty to fifty seconds while a model reads a CV,
 * so the thing on screen during that time is doing brand work whether we intend
 * it to or not. The mark pulsing under its own glow reads as the product
 * thinking rather than as a page that has stalled.
 *
 * `label` is the honest status line, and it matters more than the animation:
 * anyone waiting this long wants to know the wait is expected.
 */
export default function BrandLoader({
  label,
  note,
}: {
  label?: string
  note?: string
}) {
  return (
    <div className="brand-loader" role="status" aria-live="polite">
      <span className="display-black brand-loader-mark" aria-hidden>
        Esquirely.
      </span>
      {label && <p className="grotesk-bold brand-loader-label">{label}</p>}
      {note && <p className="grotesk-regular brand-loader-note">{note}</p>}
      <span className="sr-only">{label || 'Loading'}</span>
    </div>
  )
}
