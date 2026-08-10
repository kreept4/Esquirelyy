import type { MetadataRoute } from 'next'
import { ALL_FIRMS, isIndexable, isPubliclyReadable } from '@/lib/firms-data'
import { SITE_URL } from '@/lib/site-url'

/**
 * sitemap.xml.
 *
 * Only the pages a signed-out crawler can actually read. That is the whole
 * design rule here, and it is why this file is short: middleware.ts gates
 * everything except an allowlist, so a sitemap listing /jobs or /firms would be
 * a list of redirects to the login page. Submitting that to Search Console
 * reports them as errors and teaches Google that this host wastes its time.
 *
 * The auth routes are public in the middleware sense but are deliberately NOT
 * here. Nobody should arrive at a password reset form from a search result.
 *
 * Kept as a hand-written list rather than derived from the filesystem. A route
 * being public is a decision made in middleware.ts, and deriving this from
 * app/ would silently publish the next private page somebody adds.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = SITE_URL
  const now = new Date()

  const pages: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    /* The directory index, and then every profile. This used to be the twenty
     * two Tier 1 firms alone, on the reasoning that a gated profile is a
     * sign-in prompt and offering Google a prompt teaches it to stop bothering.
     * The premise was wrong: a gated profile withholds a street address and an
     * email and renders everything else, so it is a real page. isIndexable is
     * the same test the profile's robots directive applies, so this list cannot
     * drift away from what the pages do.
     *
     * The two keep different priorities because they are genuinely worth
     * different amounts, not as a hedge. An open profile answers a firm-name
     * search with the full record; a gated one answers the same search with
     * most of it. The split is isPubliclyReadable, which is a list of the most
     * searched firms and deliberately not the standing band. */
    { path: '/firms', priority: 0.9, changeFrequency: 'weekly' },
    ...ALL_FIRMS.filter(isIndexable).map(f => ({
      path: `/firms/${f.slug}`,
      priority: isPubliclyReadable(f) ? 0.8 : 0.7,
      changeFrequency: 'monthly' as const,
    })),
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/advertise', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/ambassador', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ]

  return pages.map(p => ({
    url: `${site}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))
}
