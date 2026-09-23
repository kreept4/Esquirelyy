import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import JsonLd, { SITE_URL, breadcrumb, openGraph } from '@/components/seo/JsonLd'
import { publishedArticles, articleBySlug, articleDate, readingMinutes } from '@/lib/articles-data'
import { firmForEmployer } from '@/lib/firms-data'
import WriterMark from '@/components/features/WriterMark'

/**
 * One article.
 *
 * ⚠ THE BODY IS RENDERED AS TEXT, ONE PARAGRAPH PER STRING. There is no
 * markdown parser here and nothing goes near dangerouslySetInnerHTML. The note
 * at the top of lib/articles-data.ts sets out why at length: this is the one
 * surface on the site built to carry writing from people outside the company,
 * so the renderer must not execute what they send. React escapes every string
 * it prints, which removes the whole class of problem rather than filtering it.
 *
 * ⚠ THE AUTHOR IS A REAL PERSON IN THE SCHEMA, not a string. `author` is a
 * Person node with their name and affiliation, which is what makes the byline
 * worth having to the writer: their name attached to a published piece, in a
 * form a search engine reads as authorship rather than as decoration. That is
 * most of what they are being paid in.
 *
 * It is deliberately NOT given an @id tying it to an Esquirely entity. A
 * contributor is not staff, and quietly binding an outside writer into the
 * organisation's own graph would assert a relationship neither of us agreed to.
 */

export function generateStaticParams() {
  return publishedArticles().map(a => ({ slug: a.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const a = articleBySlug(slug)
  if (!a) return {}
  return {
    title: a.title,
    description: a.summary,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: openGraph({ path: `/articles/${slug}` }),
  }
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const a = articleBySlug(slug)
  if (!a) notFound()

  const authorFirm = firmForEmployer(a.author.firm)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/articles/${a.slug}`,
    headline: a.title,
    description: a.summary,
    datePublished: a.publishedOn,
    author: {
      '@type': 'Person',
      name: a.author.name,
      description: a.author.affiliation,
      ...(a.author.linkedin ? { sameAs: [a.author.linkedin] } : {}),
      /* ⚠ POINTS AT THE FIRM'S OWN @id, WHICH ALREADY EXISTS on its directory
         page, rather than repeating the firm as a loose name. That is what
         makes it one entity to a search engine instead of two things that
         happen to share a spelling, and it is the same consolidation the
         founder pages use. Only for firms in the directory: an employer we do
         not have a page for gets nothing, because an @id we do not serve is a
         dangling reference. */
      ...(authorFirm
        ? { worksFor: { '@id': `${SITE_URL}/firms/${authorFirm.slug}#firm` } }
        : {}),
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}/articles/${a.slug}`,
    inLanguage: 'en-NG',
  }

  return (
    <>
      <JsonLd data={[schema, breadcrumb([
        { name: 'Home', path: '/' },
        { name: 'Articles', path: '/articles' },
        { name: a.title, path: `/articles/${a.slug}` },
      ])]} />

      <main className="shell article-page">
        <div className="article-crumb grotesk-regular">
          <Link href="/articles">Articles</Link>
        </div>

        <h1 className="display-black article-title">{a.title}</h1>

        {/* ⚠ THE FIRM'S MARK SITS ON THE WRITER'S FACE, NOT IN THE TEXT. See
            WriterMark for why that is worth building: the reader places the
            writer instantly, and a firm whose associate is on a well-written
            piece is visibly attached to it. It degrades to the photograph
            alone, or to an initial, so no writer is blocked on having both. */}
        <div className="article-byline-row">
          <WriterMark author={a.author} size={46} />
          <div>
            <p className="grotesk-regular article-byline">
              {a.author.linkedin ? (
                <a href={a.author.linkedin} target="_blank" rel="noopener noreferrer">
                  {a.author.name}
                </a>
              ) : (
                a.author.name
              )}
              <span className="article-byline-sep"> · </span>
              {a.author.affiliation}
            </p>
            <p className="grotesk-regular article-meta">
              {articleDate(a.publishedOn)} · {readingMinutes(a)} min read
            </p>
          </div>
        </div>

        {a.body.filter(p => p.trim()).map((para, i) => (
          <p key={i} className="grotesk-regular article-body">{para.trim()}</p>
        ))}

        {/* ⚠ SAID ON EVERY ARTICLE RATHER THAN ONCE IN THE FOOTER. A reader who
            arrives from a search has not seen the about page and has no reason
            to know whether this is the company writing or somebody else. Naming
            it under the piece is what keeps a first-person account from reading
            as Esquirely's own position. */}
        <p className="grotesk-regular article-note">
          Written by a contributor, not by Esquirely. It describes their own experience and is not
          legal advice.
        </p>

        <p className="grotesk-regular article-back">
          <Link href="/articles">More articles</Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
