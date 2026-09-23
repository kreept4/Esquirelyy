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
    'Writing by Nigerian law students and lawyers about how legal practice and study actually work here: what a process involved, what it cost, what nobody tells you first.',
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
          nobody writes down. What a process actually involved, what it cost, what would have been
          useful to know first.
        </p>

        {articles.length === 0 ? (
          <div className="articles-empty">
            <p className="grotesk-regular articles-empty-line">
              Nothing published yet. The first pieces are being written.
            </p>
            <p className="grotesk-regular articles-empty-line">
              If you have something worth writing down, from your faculty, your firm or your
              service year, we would rather read it than commission it.{' '}
              <Link href="/contact">Tell us what you want to write.</Link>
            </p>
          </div>
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
      </main>
      <Footer />
    </>
  )
}
