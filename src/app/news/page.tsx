import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import PageHeader from '@/components/layout/PageHeader'
import { getNewsItems, formatNewsDate, KIND_LABEL, type NewsItem } from '@/lib/news-data'

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
 * Laid out as a dated index rather than a grid of cards. These entries are
 * wildly uneven in weight, a Bar election result next to a note about how
 * internships get filled, and a card grid would give all of them the same
 * visual claim. A ruled list with the date hanging in the margin reads as a
 * record, which is what it is.
 */

const isExternal = (href: string) => /^https?:\/\//i.test(href)

function Entry({ item }: { item: NewsItem }) {
  const body = (
    <>
      <span className="news-entry-meta">
        <span className="grotesk-bold news-entry-kind" data-kind={item.kind}>
          {KIND_LABEL[item.kind]}
        </span>
        <time className="grotesk-regular news-entry-date" dateTime={item.date}>
          {formatNewsDate(item.date)}
        </time>
      </span>

      <span className="news-entry-main">
        <span className="display-black news-entry-title">{item.title}</span>
        <span className="grotesk-regular news-entry-summary">{item.summary}</span>
        {item.href && (
          <span className="grotesk-bold news-entry-cta">
            {item.cta ?? 'Read more'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </span>
    </>
  )

  if (!item.href) {
    return <li className="news-entry news-entry-static">{body}</li>
  }

  return (
    <li className="news-entry">
      {isExternal(item.href) ? (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="news-entry-link">
          {body}
        </a>
      ) : (
        <Link href={item.href} className="news-entry-link">
          {body}
        </Link>
      )}
    </li>
  )
}

export default function NewsPage() {
  const items = getNewsItems()

  return (
    <>
      <main className="page-main">
        <PageHeader
          tone="ink"
          heading="News and updates."
          subcopy="What is happening in the profession, what has changed on Esquirely, and the things worth knowing if you are looking for a role."
        />

        <div className="shell news-page">
          <ul className="news-list">
            {items.map(item => (
              <Entry key={item.slug} item={item} />
            ))}
          </ul>

          <p className="grotesk-regular news-page-note">
            Something we should be covering? Tell us at{' '}
            <a href="mailto:hello@esquirely.com">hello@esquirely.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
