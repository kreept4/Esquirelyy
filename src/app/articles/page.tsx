import Link from 'next/link'
import type { Metadata } from 'next'
import Footer from '@/components/layout/Footer'
import JsonLd, { SITE_URL, breadcrumb, openGraph, webPageSchema } from '@/components/seo/JsonLd'
import { publishedArticles, articleDate, readingMinutes } from '@/lib/articles-data'

/**
 * The articles index.
 *
 * ⚠ PUBLIC AND INDEXED, UNLIKE /news, WHICH IS NEITHER. That page is a members
 * feed of product updates and sits behind the login gate with a Disallow in
 * robots.txt. This is the opposite by design: the whole argument for the
 * section is that somebody outside Esquirely searches "what is NYSC posting
 * actually like", finds a piece written by a Nigerian law student, and arrives
 * here having never heard of us. Gating that would remove the only reason to
 * build it.
 *
 * ⚠ RENDERS AN EMPTY STATE RATHER THAN A PLACEHOLDER ARTICLE, and the empty
 * state says what the section is for rather than apologising. A section that
 * opens with invented writing to look populated is lying about the one thing
 * this site claims: that everything on it was checked.
 */

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Writing by Nigerian law students and lawyers about how legal practice and study actually work in Nigeria: what a process involved, and what it cost.',
  alternates: { canonical: '/articles' },
  openGraph: openGraph({ path: '/articles' }),
}

export default function ArticlesPage() {
  const articles = publishedArticles()

  return (
    <>
      <JsonLd data={[
        webPageSchema({
          path: '/articles',
          name: 'Articles',
          description:
            'Writing by Nigerian law students and lawyers about how legal practice and study actually work here.',
        }),
        breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Articles', path: '/articles' },
        ]),
      ]} />

      <main className="shell articles-page">
        <h1 className="display-black articles-title">Articles</h1>
        <p className="grotesk-regular articles-lede">
          Written by Nigerian law students and lawyers, about the parts of practice and study
          that nobody writes down: what a process actually involved, and what it cost.
        </p>

        {articles.length === 0 ? (
          <p className="grotesk-regular articles-empty-line">
            Nothing published yet. The first pieces are being written.
          </p>
        ) : (
          <ul className="articles-list">
            {articles.map(a => (
              <li key={a.slug}>
                <Link href={`/articles/${a.slug}`} className="articles-row">
                  <span className="grotesk-bold articles-row-title">{a.title}</span>
                  <span className="grotesk-regular articles-row-summary">{a.summary}</span>
                  <span className="grotesk-regular articles-row-meta">
                    {a.author.name} · {a.author.affiliation} · {articleDate(a.publishedOn)} ·{' '}
                    {readingMinutes(a)} min read
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* ⚠ THE BRIEF IS ON THE PAGE, WHICH IS WHAT STOPS IT LOOKING EMPTY.
            The first version was a heading, a lede and a box, and it read as
            thin because it was: an articles page with no articles has almost
            nothing to say for itself.

            The honest way to fill it is not decoration, it is the brief. These
            three lines are what we would tell a writer who asked, so putting
            them where a writer can read them costs nothing and does two jobs at
            once: the page has substance while it is empty, and somebody
            deciding whether to pitch can tell in five seconds whether their
            idea fits. It stays useful after the first articles land, which a
            placeholder would not. */}
        <section className="articles-brief">
          <p className="grotesk-bold articles-brief-title">What we publish</p>
          <ul className="articles-brief-list">
            <li className="grotesk-regular">
              First-hand accounts. How a firm&rsquo;s recruitment actually ran, what a term at Law
              School cost, what a service year posting involved day to day.
            </li>
            <li className="grotesk-regular">
              Things you had to find out yourself, where writing them down saves the next person
              the same trouble.
            </li>
            <li className="grotesk-regular">
              Your own name on it, with your faculty or your firm.
            </li>
          </ul>
        </section>

        <section className="articles-pitch">
          <p className="grotesk-bold articles-pitch-title">Write for us</p>
          <p className="grotesk-regular articles-pitch-body">
            Email <a href="mailto:hello@esquirely.com.ng">hello@esquirely.com.ng</a> and tell us
            what you have in mind. A couple of sentences is enough to start, and you do not need
            to have written anything yet.
          </p>
        </section>

      </main>
      <Footer />
    </>
  )
}
