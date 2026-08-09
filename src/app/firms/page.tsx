import type { Metadata } from 'next'
import FirmsClient from './FirmsClient'
import JsonLd, { SITE_URL, breadcrumb, openGraph } from '@/components/seo/JsonLd'
import { ALL_FIRMS, isIndexable } from '@/lib/firms-data'

/**
 * The firms directory, as a route.
 *
 * THIS FILE EXISTS BECAUSE OF A HEAD, NOT A BODY. Everything visible is in
 * FirmsClient. What could not live there is this: a `'use client'` module cannot
 * export `metadata`, so for as long as the page was one file, the directory went
 * out announcing itself as "Esquirely | Nigeria's Legal Career Platform" with
 * the sitewide description and a canonical pointing at the homepage. A searcher
 * looking for "list of law firms in Lagos" had nothing here to match against,
 * and Google was being told the page was a duplicate of / anyway.
 *
 * THE TITLE LEADS WITH THE COUNT because the count is the differentiator. Any
 * page can claim to list Nigerian law firms; a stated sixty seven is a claim
 * that can be checked, and it is the kind of specific that gets a result clicked
 * over the four vaguer ones around it. It is derived rather than typed, so
 * adding a firm updates the title, the description and the schema together and
 * cannot leave one of the three lying.
 */

const TOTAL = ALL_FIRMS.length
const CITIES = [...new Set(ALL_FIRMS.flatMap(f => f.offices.map(o => o.city)))]

export const metadata: Metadata = {
  title: `Nigerian Law Firms Directory: ${TOTAL} Firms, Offices and Practice Areas`,
  description:
    `Browse ${TOTAL} law firms in Nigeria by tier, city and practice area. Offices, practice-area breakdowns, ` +
    `Chambers, IFLR1000 and Legal 500 rankings, and which firms are hiring.`,
  alternates: { canonical: '/firms' },
  openGraph: openGraph({
    path: '/firms',
    title: 'Nigerian Law Firms Directory | Esquirely',
    description: `${TOTAL} Nigerian law firms with offices, practice areas and rankings.`,
  }),
}

/**
 * The directory, stated for machines.
 *
 * `ItemList` is the difference between "a page with links on it" and "a list of
 * sixty seven named organisations". The second is the thing worth retrieving
 * when somebody asks an assistant which law firms operate in Abuja, and it is
 * the reason this dataset is an asset rather than a table: nobody else in this
 * market publishes it in a form a machine can read.
 *
 * ALL SIXTY SEVEN ARE NAMED HERE. This was filtered to the twenty two Tier 1
 * firms while the rest were noindexed, with a note that the filter came off in
 * the same commit as the noindex. This is that commit.
 *
 * The rule that put the filter there still holds and is why the list is built
 * from `isIndexable` rather than from ALL_FIRMS directly: schema must never
 * describe more than the page shows a signed-out reader, and the gap between
 * markup and page is what Google issues manual actions for. It is safe to name
 * all of them because this page renders all of them to everybody — the
 * directory grid has no signed-in branch. What a gated profile withholds is
 * withheld on the profile, and the block here carries nothing but a name and a
 * URL.
 */
function directorySchema() {
  const listed = ALL_FIRMS.filter(isIndexable)

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/firms#page`,
    url: `${SITE_URL}/firms`,
    name: 'Nigerian Law Firms Directory',
    description: `A directory of ${TOTAL} law firms in Nigeria, with offices, practice areas and rankings.`,
    inLanguage: 'en-NG',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@type': 'Thing', name: 'Law firms in Nigeria' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: listed.length,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: listed.map((f, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/firms/${f.slug}`,
        name: f.name,
      })),
    },
  }
}

export default function FirmsPage() {
  return (
    <>
      <JsonLd
        data={[
          directorySchema(),
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Firms', path: '/firms' },
          ]),
        ]}
      />
      {/* A sentence that says, in words a crawler and a screen reader both read,
          what the interactive grid below is. The h1 in the header panel is
          "Firms directory", which is right for a reader who already knows where
          they are and says nothing to a search engine about the country, the
          count or the cities. This is not hidden text: it is the same claim the
          page makes visually, written out once. */}
      <p className="sr-only">
        A directory of {TOTAL} law firms in Nigeria, with offices in{' '}
        {CITIES.slice(0, 6).join(', ')} and elsewhere, listed by tier, practice area and
        city, including which firms are currently hiring.
      </p>
      <FirmsClient />
    </>
  )
}
