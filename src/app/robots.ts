import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

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
 * /jobs came off the list on 2026-08-12, on the same reasoning. The board and a
 * named set of listings are readable by a stranger; the rest redirect to the
 * login page as they always did. A Disallow would have stopped Google reading
 * the open ones at all.
 *
 * ⚠ Scholarships and the news page are still private, so they still earn
 * nothing. That is a consequence of the gate in middleware.ts, not of this file.
 */
export default function robots(): MetadataRoute.Robots {
  const site = SITE_URL

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
