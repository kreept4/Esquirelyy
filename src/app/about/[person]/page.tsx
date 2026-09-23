import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import JsonLd, { SITE_URL, breadcrumb, openGraph } from '@/components/seo/JsonLd'
import { TEAM, AMBASSADORS, type Person } from '../people'

/**
 * A page for one person.
 *
 * ============================================================
 * ⚠ NO BIO, NO PAGE, AND THAT IS THE WHOLE GATE
 * ============================================================
 *
 * generateStaticParams is built from the people who have a `bio`, so somebody
 * without one has no page at all and their card on /about stays a card. This
 * is not a placeholder waiting to be filled in later; it is the rule.
 *
 * The reason is what these pages are for. A name query is matched against a
 * title, a heading and a description first, and a Person node in JSON-LD is
 * how an entity is DESCRIBED once a page has been retrieved rather than what
 * gets it retrieved. So a page per person is the right instrument. But eight
 * pages that differ only in a name, each saying "co-founder of Esquirely" and
 * nothing else, are near-duplicates: they rank worse than no page, and on a
 * site whose whole claim is that everything on it was checked they read as
 * filler. The bio is the entire reason the page earns a URL.
 *
 * ============================================================
 * ⚠ THE FOUNDERS KEEP THEIR EXISTING @id
 * ============================================================
 *
 * components/seo/JsonLd.tsx already defines both founders as Person entities
 * at ${SITE_URL}/about#boluwatife-ogunleye and #ipinuoluwa-ogunleye, carried in
 * Organization.founder on every page and re-emitted as top-level nodes on
 * /about. Minting a second id here for the same human would split one entity
 * into two and undo the sameAs work: a resolver would hold two Boluwatife
 * Ogunleyes, one with a LinkedIn profile attached and one with a page.
 *
 * So this page's Person node reuses the id and adds `mainEntityOfPage`, which
 * is the property that says "and this URL is about that entity". The entity is
 * unchanged; it has gained a page.
 *
 * An ambassador has no existing node, so theirs is minted here, anchored to
 * their own URL.
 */

const ALL: Person[] = [...TEAM, ...AMBASSADORS]

/** Only people with something to say get a URL. See the header. */
const WITH_PAGES = ALL.filter(p => !!p.slug && !!p.bio?.trim())

export function generateStaticParams() {
  return WITH_PAGES.map(p => ({ person: p.slug as string }))
}

function find(slug: string): Person | undefined {
  return WITH_PAGES.find(p => p.slug === slug)
}

/**
 * Natural case, from the stored shouting.
 *
 * The cards render "OGUNLEYE BOLUWATIFE, ESQ." because that is the house style
 * on that page. A title, a heading and a meta description are not that page,
 * and feeding a resolver a shouted, comma-suffixed, surname-first string is a
 * worse match for somebody's name than the plain form. Same argument the
 * founder schema already makes for `alternateName`.
 */
function displayName(raw: string): string {
  return raw
    .replace(/,\s*ESQ\.?$/i, '')
    .toLowerCase()
    .replace(/\b[a-z]/g, c => c.toUpperCase())
    .trim()
}

export async function generateMetadata(
  { params }: { params: Promise<{ person: string }> },
): Promise<Metadata> {
  const { person: slug } = await params
  const person = find(slug)
  if (!person) return {}
  const name = displayName(person.name)
  return {
    title: name,
    /* The bio's own first sentence, which is written for a reader rather than
       assembled for a crawler. Capped because a description past about 160
       characters is cut mid-word in a result. */
    description: `${name}, ${person.role.toLowerCase()} at Esquirely. ${person.bio!.split('. ')[0]}.`.slice(0, 200),
    alternates: { canonical: `/about/${slug}` },
    openGraph: openGraph({ path: `/about/${slug}` }),
  }
}

export default async function PersonPage(
  { params }: { params: Promise<{ person: string }> },
) {
  const { person: slug } = await params
  const person = find(slug)
  if (!person) notFound()

  const name = displayName(person.name)
  const isFounder = TEAM.some(t => t.slug === person.slug && t.role === 'Co-founder')

  /* Founders already exist as entities. See the header for why this reuses the
     id rather than minting a second one. */
  const personId = isFounder
    ? `${SITE_URL}/about#${slug}`
    : `${SITE_URL}/about/${slug}#person`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}/about/${slug}`,
    mainEntity: {
      '@type': 'Person',
      '@id': personId,
      name,
      jobTitle: person.role,
      description: person.bio,
      worksFor: { '@id': `${SITE_URL}/#organization` },
      mainEntityOfPage: `${SITE_URL}/about/${slug}`,
      ...(person.image ? { image: `${SITE_URL}${person.image}` } : {}),
      ...(person.linkedin ? { sameAs: [person.linkedin] } : {}),
    },
  }

  return (
    <>
      <JsonLd data={[schema, breadcrumb([
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name, path: `/about/${slug}` },
      ])]} />

      <main className="shell person-page">
        <div className="person-crumb grotesk-regular">
          <Link href="/about">About</Link>
          <span aria-hidden> / </span>
          <span>{name}</span>
        </div>

        {/* ⚠ RENDERED ONLY WHEN THE FILE EXISTS, like the bio gate above. A
            broken image on a page about a real person is worse than no image,
            and the reason this cannot simply point at LinkedIn is recorded on
            the `image` field in people.ts. Plain <img> rather than next/image:
            these are eight small square photographs on pages that are not
            performance sensitive, and the optimiser would need a remote pattern
            entry for nothing. */}
        {person.image && (
          <img
            className="person-photo"
            src={person.image}
            alt={`${name}, ${person.role.toLowerCase()} at Esquirely`}
            width={112}
            height={112}
            loading="lazy"
          />
        )}

        <h1 className="display-black person-name">{name}</h1>
        <p className="grotesk-regular person-role">{person.role}, Esquirely</p>

        {person.bio!.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="grotesk-regular person-bio">{para.trim()}</p>
        ))}

        {person.linkedin && (
          <a
            className="grotesk-bold person-link"
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        )}

        <p className="grotesk-regular person-back">
          <Link href="/about">Everyone who builds Esquirely</Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
