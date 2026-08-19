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
export { SITE_URL } from '@/lib/site-url'
import { SITE_URL } from '@/lib/site-url'

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

/** The board's four bands, as the vocabulary schema.org actually accepts. */
const EMPLOYMENT_TYPE: Record<string, string> = {
  job: 'FULL_TIME',
  internship: 'INTERN',
}

/**
 * A listing, as JobPosting.
 *
 * THE HEADER OF THIS FILE HAS PROMISED "eligibility for the Google Jobs box on
 * listings" SINCE IT WAS WRITTEN, and until now nothing emitted the one type
 * that produces it. The firm profiles got their schema and the listings — the
 * pages with by far the most to gain, because JobPosting is the only schema on
 * this site that produces a dedicated search surface rather than a richer
 * snippet — got none.
 *
 * ⚠ ONLY CALL THIS FOR A LISTING A SIGNED-OUT READER CAN ACTUALLY READ. Google's
 * JobPosting policy requires the description to be visible without an account,
 * and marking up a page that redirects to /auth/login is a structured data
 * violation that can get the whole site's rich results suppressed rather than
 * just that page's. lib/open-jobs.ts decides which those are; the call site
 * guards on isOpenJob.
 *
 * `directApply` IS DELIBERATELY NOT CLAIMED. It asserts that pressing apply
 * takes the reader straight to the employer's form, and on this site it takes a
 * signed-out reader to a sign-in page first. It is an optional property, so the
 * honest thing is to omit it rather than to assert something the page does not
 * do — Google checks this one against the rendered page.
 */
export function jobPostingSchema(
  job: {
    slug: string
    title: string
    employer: string
    type?: string | null
    location?: string | null
    deadline?: string | null
    is_rolling?: boolean | null
    role_desc?: string | null
    about?: string | null
    requirements?: unknown
    created_at?: string | null
    practice_areas?: string[] | null
  },
  /** The employer's own site, when they are in the directory. Anchors the
   *  organisation to a real entity rather than to a bare string. */
  employerUrl?: string | null
) {
  const reqs = Array.isArray(job.requirements)
    ? (job.requirements as unknown[]).filter((r): r is string => typeof r === 'string')
    : []

  /* Google wants the description as HTML and reads the markup: a list rendered
     as a list is presented as one in the Jobs box, where the same text joined
     with full stops is a paragraph. This is the only place in the codebase that
     builds HTML from a database row, hence the escape — `about` and `role_desc`
     are employer-supplied prose and a stray `<` would otherwise land in the
     description as markup. */
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const description = [
    job.role_desc ? `<p>${esc(job.role_desc)}</p>` : '',
    reqs.length ? `<p>Requirements:</p><ul>${reqs.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : '',
    job.about ? `<p>About ${esc(job.employer)}: ${esc(job.about)}</p>` : '',
  ]
    .filter(Boolean)
    .join('')

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': `${SITE_URL}/jobs/${job.slug}`,
    url: `${SITE_URL}/jobs/${job.slug}`,
    title: job.title,
    description: description || job.title,
    identifier: {
      '@type': 'PropertyValue',
      name: job.employer,
      value: job.slug,
    },
    ...(job.created_at ? { datePosted: job.created_at.slice(0, 10) } : {}),
    /* Omitted entirely on a rolling role. An absent validThrough means "no
       stated closing date", which is true; a made-up one would expire the
       listing out of the Jobs box on a date the employer never set. */
    ...(!job.is_rolling && job.deadline ? { validThrough: job.deadline } : {}),
    ...(job.type && EMPLOYMENT_TYPE[job.type] ? { employmentType: EMPLOYMENT_TYPE[job.type] } : {}),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.employer,
      ...(employerUrl ? { sameAs: employerUrl } : {}),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        /* The board stores a city, sometimes with an area on the front ("Yaba,
           Lagos"). The city is the part a job search matches on, so it is the
           last comma-separated segment that goes in addressLocality and the
           whole string that goes in streetAddress. */
        ...(job.location
          ? {
              streetAddress: job.location,
              addressLocality: job.location.split(',').pop()!.trim(),
            }
          : {}),
        addressCountry: 'NG',
      },
    },
    ...(job.practice_areas?.length ? { occupationalCategory: job.practice_areas.join(', ') } : {}),
  }
}

/**
 * A plain page — about, privacy, terms.
 *
 * These carry no rich result and are worth marking up anyway, for the third
 * thing this file's header names: retrieval systems behind AI answers. "What is
 * Esquirely" and "does Esquirely sell my data" are both questions an answer
 * engine will be asked, and a typed page with a named publisher is what tells it
 * the answer on this page is authoritative about this site rather than being one
 * more document that mentions it.
 */
export function webPageSchema(opts: {
  path: string
  name: string
  description: string
  type?: 'AboutPage' | 'WebPage' | 'ContactPage'
}) {
  return {
    '@context': 'https://schema.org',
    '@type': opts.type ?? 'WebPage',
    '@id': `${SITE_URL}${opts.path}`,
    url: `${SITE_URL}${opts.path}`,
    name: opts.name,
    description: opts.description,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    publisher: { '@type': 'Organization', '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-NG',
  }
}

/**
 * The board, as a list of the listings on it.
 *
 * Only the ones a stranger can read, for the same reason jobPostingSchema is
 * guarded: a list whose items redirect to a login page is a list of dead ends,
 * and it teaches a crawler that this host's structured data cannot be trusted.
 */
export function jobListSchema(jobs: { slug: string; title: string; employer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/jobs#listings`,
    name: 'Legal roles in Nigeria',
    numberOfItems: jobs.length,
    itemListElement: jobs.map((j, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/jobs/${j.slug}`,
      /* "at", not an em dash. This string is read back by search engines and
         answer engines as the name of the listing, so it is copy even though no
         page renders it, and the copy standard applies. "Associate at Templars"
         is also simply how a role is said aloud. */
      name: `${j.title} at ${j.employer}`,
    })),
  }
}
