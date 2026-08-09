/**
 * Structured data, as one component rather than a script tag copied per page.
 *
 * The site had none at all. That costs three separate things: rich results in
 * classic search, eligibility for the Google Jobs box on listings, and — the
 * one that matters most now — being legible to the retrieval systems behind AI
 * answers. Prose is ambiguous about what a page is; schema is not.
 *
 * WHY dangerouslySetInnerHTML AND NOT {JSON.stringify(data)} AS A CHILD. React
 * escapes text children, so `&` in "Aluko & Oyebode" ships as `&amp;` inside the
 * JSON and the block fails to parse. Script content is not HTML, and the escape
 * that protects a text node corrupts it here.
 *
 * WHY THE `<` REPLACEMENT. The one real injection route into a JSON-LD block is
 * a string containing `</script>`, which ends the element early and lets
 * whatever follows run as markup. Every firm name and description in this
 * codebase is hand-written and safe, but job descriptions come from a database
 * row an employer supplied, so the guard has to be here rather than at each
 * call site. Escaping `<` to < is valid JSON, parses back to the same
 * string, and cannot close a tag.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

/** The absolute base every schema `@id` and `url` is built from.
 *
 *  Schema wants absolute URLs. A relative `/firms/templars` is silently useless
 *  to a consumer that has no page context, which is exactly the case for a
 *  crawler holding the JSON on its own. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://esquirely.com.ng'

/**
 * A complete Open Graph block for a page, including the share image.
 *
 * ⚠ THIS EXISTS BECAUSE INHERITANCE DOES NOT WORK THE WAY IT LOOKS LIKE IT
 * DOES. Next's file-based `opengraph-image` is merged into a route's resolved
 * metadata, but a page that declares its own `openGraph` object REPLACES the
 * parent's rather than merging into it, and that replacement takes the image
 * with it. So adding `openGraph: { url: '/about' }` to a page silently deletes
 * the site share card from that page. The build succeeds, the tags look
 * plausible, and every link to /about previews blank.
 *
 * The failure is invisible in review, which is why the fix is a function rather
 * than a note asking people to remember `images`. Call this and the image is
 * never the thing that got forgotten.
 *
 * `image` overrides the default for routes with a card of their own, such as a
 * firm profile.
 */
export function openGraph(opts: {
  path: string
  title?: string
  description?: string
  image?: string
  type?: 'website' | 'article' | 'profile'
}) {
  return {
    ...(opts.title ? { title: opts.title } : {}),
    ...(opts.description ? { description: opts.description } : {}),
    url: opts.path,
    siteName: 'Esquirely',
    locale: 'en_NG',
    type: opts.type ?? 'website',
    images: [opts.image ?? '/opengraph-image'],
  }
}

/** Trail of ancestors, ending at the current page.
 *
 *  Google renders this as the readable path in a search result in place of a
 *  raw URL, and it is what tells a retrieval system that a firm profile sits
 *  under a directory rather than floating on its own. */
export function breadcrumb(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path}`,
    })),
  }
}
