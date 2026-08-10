/**
 * The canonical origin of this deployment, cleaned.
 *
 * WHY THIS IS A MODULE AND NOT `process.env.NEXT_PUBLIC_SITE_URL`.
 *
 * The expression `process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')` was
 * written out five times, in layout.tsx, robots.ts, sitemap.ts, JsonLd.tsx and
 * welcome-once.ts. It stripped a trailing slash and nothing else, and on
 * production the variable was set with a LEADING SPACE. Every one of those five
 * places passed the space straight through, and the damage was not cosmetic:
 *
 *   sitemap.xml   every one of seventy six <loc> values read
 *                 "<loc> https://esquirely.com.ng/</loc>". A loc containing a
 *                 space is not a URL, so the whole sitemap is rejected and none
 *                 of those pages are submitted at all.
 *   JSON-LD       "@id" and "url" carried the space, so the Organization and
 *                 the breadcrumb trail pointed at nothing resolvable.
 *   robots.txt    "Sitemap:  https://..." with the doubled space.
 *
 * The site was telling Google, in three different files, that it lived at an
 * address that does not parse. That is the kind of fault that produces exactly
 * the symptom it produced: a site that is technically online, technically
 * indexable, and absent from search.
 *
 * TRIM, THEN STRIP THE TRAILING SLASH, IN THAT ORDER. A value like
 * " https://esquirely.com.ng/ " has both problems, and stripping the slash
 * first would leave the trailing space in place and do nothing about the
 * leading one.
 *
 * A misconfigured environment variable should not be able to take the site out
 * of a search index. It can now be as untidy as it likes.
 */
export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '') || 'https://esquirely.com.ng'

/** `SITE_URL` joined to a path, with exactly one slash between them. */
export function siteUrl(path = ''): string {
  if (!path) return SITE_URL
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`
}
