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
          <div className="articles-empty">
            <p className="grotesk-regular articles-empty-line">
              Nothing published yet. The first pieces are being written.
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

        {/* ⚠ OUTSIDE THE EMPTY STATE, SO IT IS THERE EITHER WAY. The first
            version put the invitation inside the "nothing published yet"
            branch, which means it disappears the day the section starts
            working. That is precisely backwards: a reader who has just read a
            piece by somebody at their own stage is far likelier to think they
            could write one than a reader looking at an empty page.

            ⚠ AND THE FIRST DRAFT OF THIS COPY DID NOT SURVIVE READING. It
            opened "we would rather publish what you already know than
            commission it", where "it" had nothing to refer to: you cannot
            commission knowledge. The sentence after it stacked three clauses
            before reaching the ask. Two shorter sentences, and the referent is
            a thing that exists.

            ⚠ AND IT ASKS FOR A PITCH, NOT A DRAFT. "What you want to cover and
            why you are the one to write it" is two sentences somebody sends on
            a phone. Asking for a finished article first means most people who
            would have written one never start, and it means reading long
            pieces that were never going to fit. The bar is in the second
            sentence rather than in a set of rules: only you know it, which is
            the whole filter this section runs on.

            A plain mailto rather than the contact form. The address is already
            published on /contact, /faq and /news, so this exposes nothing new,
            and somebody pitching wants to write in their own words at their own
            length rather than into a box. */}
        <div className="articles-pitch">
          <p className="grotesk-bold articles-pitch-title">Write for Esquirely</p>
          <p className="grotesk-regular articles-pitch-body">
            Most of what is useful about practising here is not written down anywhere. If you
            learned something the hard way, we would rather publish your account of it than
            anything we could write ourselves.
          </p>
          <p className="grotesk-regular articles-pitch-body">
            Email <a href="mailto:hello@esquirely.com.ng">hello@esquirely.com.ng</a>. Say what you
            would write about and why it should be you. A couple of sentences is plenty.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
