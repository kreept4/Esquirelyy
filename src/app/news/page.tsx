import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { getNewsItems, formatNewsDate, KIND_LABEL, type NewsItem, type NewsKind } from '@/lib/news-data'

export const metadata = {
  title: 'News and updates',
  description:
    'What is happening in the Nigerian legal profession, what has changed on Esquirely, and the things worth knowing if you are looking for a role.',
}

/**
 * The full list behind the homepage carousel.
 *
 * A server component: nothing here is interactive, so the whole page is HTML at
 * build time and every item is readable by a search engine and by anyone whose
 * JavaScript never arrives.
 *
 * Built on the .doc-* page shell rather than on a layout of its own. The first
 * version was a bespoke ruled list with its own grid, its own type scale and
 * its own breakpoints, which is how a page ends up looking like it came from a
 * different site. This one is the same shape as the ambassador page: ink
 * masthead, a legend strip stating the taxonomy, then one sticky-labelled
 * section per month with a numbered index inside it.
 *
 * Grouping by month rather than by kind is deliberate. This is a record, and a
 * record is chronological; grouping by kind would scatter one week's entries
 * across three sections. It also scales without a decision — a new month makes
 * a new section, and the numerals restart inside it.
 */

const isExternal = (href: string) => /^https?:\/\//i.test(href)

/** Colour per kind, matching .news-kind in the stylesheet. Kept here only for
 *  the legend dots, which need the value inline. */
const KIND_COLOUR: Record<NewsKind, string> = {
  news: '#0C6C93',
  tip: '#6D3FD4',
  update: '#0A7A6E',
}

const KIND_BLURB: Record<NewsKind, string> = {
  news: 'The profession',
  tip: 'Worth knowing',
  update: 'Changes here',
}

/** Month buckets, newest first. getNewsItems() is already date-sorted, so this
 *  only has to break the run whenever the month changes. */
function byMonth(items: NewsItem[]): { key: string; label: string; items: NewsItem[] }[] {
  const groups: { key: string; label: string; items: NewsItem[] }[] = []
  for (const item of items) {
    const t = Date.parse(item.date)
    // An unparseable date would otherwise open a group called "Invalid Date".
    const key = Number.isNaN(t) ? 'undated' : item.date.slice(0, 7)
    const label = Number.isNaN(t)
      ? 'Undated'
      : new Date(t).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.items.push(item)
    else groups.push({ key, label, items: [item] })
  }
  return groups
}

function Entry({ item, index }: { item: NewsItem; index: number }) {
  const external = !!item.href && isExternal(item.href)

  const body = (
    <>
      <span className="grotesk-bold news-kind" data-kind={item.kind}>
        {KIND_LABEL[item.kind]}
      </span>
      <h3 className="display-black doc-row-title">{item.title}</h3>
      <p className="grotesk-regular doc-row-body">{item.summary}</p>
      {item.href && (
        <span className="grotesk-bold news-entry-cta">
          {item.cta ?? 'Read more'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </>
  )

  return (
    <li className="doc-row" data-linked={!!item.href}>
      <span className="display-black doc-num" aria-hidden>
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="doc-row-main">
        {!item.href ? (
          body
        ) : external ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer" className="news-row-link">
            {body}
          </a>
        ) : (
          <Link href={item.href} className="news-row-link">
            {body}
          </Link>
        )}
      </div>

      {/* The date sits in the margin, in the manner of a dateline. On a phone
          the shared breakpoint moves it above the headline, where a date on a
          news entry actually belongs. */}
      <p className="grotesk-regular doc-aside">
        <time className="news-date" dateTime={item.date}>
          {formatNewsDate(item.date)}
        </time>
        {external && <span className="news-source">Off-site</span>}
      </p>
    </li>
  )
}

export default function NewsPage() {
  const items = getNewsItems()
  const months = byMonth(items)

  return (
    <>
      <main className="page-main doc-page">
        <header className="doc-masthead">
          <div className="shell doc-masthead-inner">
            <h1 className="display-black doc-title">
              News and updates.
            </h1>
            <p className="grotesk-regular doc-lede">
              What is happening in the profession, what has changed on Esquirely, and the things
              worth knowing if you are looking for a role. Everything here is checkable, and the
              entries that came from somewhere else say where.
            </p>

            {/* The taxonomy, stated once. Each entry below carries one of these
                three labels, so the strip is a legend rather than decoration. */}
            <dl className="doc-strip">
              {(Object.keys(KIND_LABEL) as NewsKind[]).map(kind => (
                <div key={kind} className="doc-strip-item">
                  <dt className="grotesk-regular">
                    <span className="news-legend-dot" style={{ background: KIND_COLOUR[kind] }} aria-hidden />
                    {KIND_LABEL[kind]}
                  </dt>
                  <dd className="grotesk-bold">{KIND_BLURB[kind]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <div className="shell doc-body">
          {months.map(month => (
            <section key={month.key} className="doc-section">
              <div className="doc-section-label">
                <h2 className="display-black news-month">{month.label}</h2>
                <p className="grotesk-regular doc-section-note">
                  {month.items.length} {month.items.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>

              <ol className="doc-rows">
                {month.items.map((item, i) => (
                  <Entry key={item.slug} item={item} index={i} />
                ))}
              </ol>
            </section>
          ))}

          <p className="grotesk-regular news-note">
            Something we should be covering? Tell us at{' '}
            <a href="mailto:hello@esquirely.com.ng">hello@esquirely.com.ng</a>. If it names a firm or a
            deadline, we check it against the source before it goes up.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
