import type { MetadataRoute } from 'next'

/**
 * robots.txt.
 *
 * The disallow list is not a security control. Everything in it is already
 * behind the auth gate in middleware.ts, which returns a redirect to /auth/login
 * to anyone without a session, crawlers included. Naming those paths here is
 * about crawl budget and about what shows up in a search result: without it,
 * Googlebot spends its visits fetching /jobs and /firms, gets a 307 to the login
 * page every time, and can end up indexing the login page under the firm's name.
 *
 * /firms is deliberately absent from the list. The directory index and the Tier
 * 1 profiles are the site's search-facing surface and are meant to be crawled;
 * the gated profiles keep crawlers out with a noindex tag from the page's own
 * generateMetadata rather than from here, which is the right tool for it. A
 * Disallow would stop Google reading those pages at all, and a page it cannot
 * read is a page whose noindex it never sees.
 *
 * ⚠ The jobs board, scholarships and the news page are still private, so they
 * still earn nothing. That is a consequence of the gate in middleware.ts, not
 * of this file.
 */
export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://esquirely.com.ng'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard',
          '/device-preview',
          // Gated today. Remove the matching line here in the same commit that
          // adds a section to PUBLIC_PATHS in middleware.ts.
          '/jobs',
          '/scholarships',
          '/news',
          '/tracker',
          '/tools/',
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}
