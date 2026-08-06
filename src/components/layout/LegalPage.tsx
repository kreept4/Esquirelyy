import { Children, isValidElement } from 'react'
import Footer from '@/components/layout/Footer'

/**
 * Shell for the legal pages.
 *
 * Two attempts came before this one and both were wrong in opposite directions.
 * First the prose column carried `.shell` as well as its own narrower
 * max-width, so it centred itself while the heading above stayed hard left and
 * the page read as two unrelated designs. Then it was left-aligned but narrow,
 * which filled a third of a wide screen and left the rest empty.
 *
 * Neither is fixed by simply widening the text. A single prose column across
 * 1500px gives roughly 150 characters a line, which is past the point where the
 * eye reliably finds the start of the next one.
 *
 * So the width is filled with something useful instead: a sticky clause index
 * on the left, prose on the right at a readable measure. The page occupies the
 * screen, long documents become navigable, and clause numbers stay citable.
 *
 * The index is derived from the Clause children rather than declared twice, so
 * it cannot drift out of step with the document.
 */
export default function LegalPage({
  title,
  updated,
  intro,
  summary,
  children,
}: {
  title: string
  updated: string
  intro?: string
  /** Plain-language précis, shown in the right column. Not a substitute for the
   *  document, and labelled as such: a summary that reads like the operative
   *  terms is worse than none. */
  summary?: { heading: string; points: string[]; footnote?: string }
  children: React.ReactNode
}) {
  const index = Children.toArray(children)
    .filter(isValidElement)
    .map(child => (child as React.ReactElement<{ n?: number; heading?: string }>).props)
    .filter((p): p is { n: number; heading: string } => typeof p.n === 'number' && typeof p.heading === 'string')

  return (
    <div>
      <main className="jobs-page">
        <header className="jobs-header legal-header">
          <div className="shell">
            <h1 className="display-black jobs-title">{title}</h1>
            {intro && <p className="grotesk-regular jobs-sub">{intro}</p>}
            <p className="grotesk-regular legal-updated">Last updated {updated}</p>
          </div>
        </header>

        <div className="legal-body">
          <div className="shell legal-grid">
            {index.length > 0 && (
              <nav className="legal-index" aria-label="Contents">
                <p className="grotesk-bold legal-index-title">Contents</p>
                <ol>
                  {index.map(({ n, heading }) => (
                    <li key={n}>
                      <a href={`#clause-${n}`} className="grotesk-regular">
                        <span className="legal-index-num">{n}</span>
                        {heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="legal-measure">{children}</div>

            {summary && (
              <aside className="legal-aside" aria-label="Summary">
                <div className="legal-summary">
                  <p className="grotesk-bold legal-summary-heading">{summary.heading}</p>
                  <ul>
                    {summary.points.map(p => (
                      <li key={p} className="grotesk-regular">{p}</li>
                    ))}
                  </ul>
                  {summary.footnote && (
                    <p className="grotesk-regular legal-summary-foot">{summary.footnote}</p>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

/** A numbered section. The id makes it linkable from the index and citable in
 *  correspondence, which is most of the point of numbering a policy. */
export function Clause({ n, heading, children }: { n: number; heading: string; children: React.ReactNode }) {
  return (
    /* The numeral hangs in its own column rather than sitting inline before the
       heading. Inline, it was the same size and weight as the words after it,
       so it read as part of the sentence; hanging and greyed back, it reads as
       structure, the headings all start on one line, and the clause number is
       still there to cite. Same treatment as the ambassador index. */
    <section className="legal-clause" id={`clause-${n}`}>
      <span className="display-black doc-num legal-num" aria-hidden>
        {String(n).padStart(2, '0')}
      </span>
      <div className="legal-clause-main">
        <h2 className="grotesk-bold legal-heading">{heading}</h2>
        {children}
      </div>
    </section>
  )
}
