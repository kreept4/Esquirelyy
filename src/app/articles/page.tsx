import Link from 'next/link'
import type { Metadata } from 'next'
import Footer from '@/components/layout/Footer'
import JsonLd, { breadcrumb, openGraph, webPageSchema } from '@/components/seo/JsonLd'
import { publishedArticles, articleDate, readingMinutes } from '@/lib/articles-data'
import WriterMark from '@/components/features/WriterMark'

/**
 * The articles index.
 *
 * ⚠ PUBLIC AND INDEXED, UNLIKE /news, WHICH IS NEITHER. That page is a members
 * feed of product updates behind the login gate with a Disallow in robots.txt.
 * This is the opposite by design: the point of the section is that somebody who
 * has never heard of Esquirely searches a question about Nigerian law, finds a
 * piece written by a Nigerian lawyer, and arrives here. Gating it would remove
 * the only reason to build it.
 *
 * ⚠ THE COPY IS SHORT BECAUSE THIS IS A PRODUCT SURFACE, NOT AN ESSAY. Earlier
 * versions explained the section in paragraphs. A reader is answering one
 * question, "is this for me", and every sentence they have to get through first
 * is a cost. Four scannable lines and a three-line pitch.
 */

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Nigerian lawyers and law students writing about the areas of law that need more attention.',
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
            'Nigerian lawyers and law students writing about the areas of law that need more attention.',
        }),
        breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Articles', path: '/articles' },
        ]),
      ]} />

      <main className="shell articles-page">
        <h1 className="display-black articles-title">Articles</h1>
        <p className="grotesk-regular articles-lede">
          Nigerian lawyers and law students, writing about the areas of law that need more
          attention.
        </p>

        {articles.length === 0 ? (
          /* ⚠ THE ARTWORK CARRIES THE EMPTY STATE, NOT AN APOLOGY. A line of
             grey text saying nothing is here is the most common way a new
             section announces that it is abandoned. The illustration says what
             the page is for in the one second before anybody reads, and it goes
             when the first piece lands. It is decorative, so it is hidden from
             a screen reader: the sentence under it already says the same thing. */
          <div className="articles-empty">
            <img
              src="/illustrations/publish-article.svg"
              alt=""
              aria-hidden
              className="articles-empty-art"
            />
            <p className="grotesk-regular articles-empty-line">
              No articles yet. The first ones are being written.
            </p>
          </div>
        ) : (
          <ul className="articles-list">
            {articles.map(a => (
              <li key={a.slug}>
                <Link href={`/articles/${a.slug}`} className="articles-row">
                  <span className="articles-row-head">
                    <WriterMark author={a.author} size={38} />
                    <span className="articles-row-head-text">
                      <span className="grotesk-bold articles-row-title">{a.title}</span>
                      <span className="grotesk-regular articles-row-meta">
                        {a.author.name} · {articleDate(a.publishedOn)} · {readingMinutes(a)} min
                      </span>
                    </span>
                  </span>
                  <span className="grotesk-regular articles-row-summary">{a.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* ⚠ THE BRIEF IS ON THE PAGE, WHICH IS WHAT KEEPS IT FROM LOOKING
            EMPTY. An articles page with no articles has little to say for
            itself, and the honest way to fill it is the brief rather than
            decoration. It does two jobs: the page has substance while it is
            empty, and a writer can tell in five seconds whether their subject
            fits. Both survive the first pieces landing, which a placeholder
            article would not.

            ⚠ THE FRAMING IS A VENUE, NOT A COMMISSION. "Write for Esquirely"
            casts the writer as a contributor to our editorial line. They are
            not. The piece is theirs, this is where it is published, and the
            reason to publish it here is the readers. That is also the point
            commercially: a writer with a link carrying their own name has a
            reason to send it to their own audience, and that audience lands on
            Esquirely. */}
        <section className="articles-brief">
          <p className="grotesk-bold articles-brief-title">What belongs here</p>
          <ul className="articles-brief-list">
            <li className="grotesk-regular">An area of Nigerian law that is not talked about enough</li>
            <li className="grotesk-regular">A change in the law most people have not caught up with</li>
            <li className="grotesk-regular">Something you know well, explained plainly</li>
            <li className="grotesk-regular">Written for a reader who is not a specialist in it</li>
          </ul>
        </section>

        <section className="articles-pitch">
          <p className="grotesk-bold articles-pitch-title">Publish here</p>
          <p className="grotesk-regular articles-pitch-body">
            The piece stays yours. Your name on it, your firm or faculty beside it, and a link you
            can share anywhere.
          </p>
          <p className="grotesk-regular articles-pitch-body">
            Email <a href="mailto:hello@esquirely.com.ng">hello@esquirely.com.ng</a> with the
            subject you want to write about. It does not have to be written yet.
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
