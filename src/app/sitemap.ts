import type { MetadataRoute } from 'next'
import { ALL_FIRMS, isPubliclyReadable } from '@/lib/firms-data'

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
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://esquirely.com.ng'
  const now = new Date()

  const pages: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    /* The directory index, and then the firms a signed-out reader can actually
     * read in full. Not the whole directory: a gated profile is a sign-in
     * prompt, and offering Google fifty-nine URLs when thirty-nine of them
     * answer with a prompt is how a small site teaches a crawler to stop
     * bothering. isPubliclyReadable is the same test the page itself applies,
     * so this list cannot drift away from what the pages do. */
    { path: '/firms', priority: 0.9, changeFrequency: 'weekly' },
    ...ALL_FIRMS.filter(isPubliclyReadable).map(f => ({
      path: `/firms/${f.slug}`,
      priority: 0.8,
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
