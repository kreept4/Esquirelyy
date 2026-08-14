import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { ALL_FIRMS, isIndexable, isPubliclyReadable } from '@/lib/firms-data'
import { openJobs } from '@/lib/open-jobs'
import { SITE_URL } from '@/lib/site-url'

/* An hour. The open set changes when somebody edits lib/open-jobs.ts, which is
   a deploy, so this is really about the listings being deleted underneath it. */
export const revalidate = 3600

/**
 * The open listings, read from the database rather than from the slug list.
 *
 * lib/open-jobs.ts names slugs; only the table knows whether the row is still
 * there. Publishing a name whose listing has since been deleted puts a 404 in
 * the sitemap, which is the specific thing this file's header says it exists to
 * avoid, so `openJobs` is fed real rows and can only return what exists.
 *
 * On any failure this returns nothing and the rest of the sitemap still ships.
 * A sitemap briefly missing six URLs is recoverable; one that fails to render
 * takes the firm profiles down with it.
 */
async function openJobPaths(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []
  try {
    /* Closed listings leave the sitemap, because their pages 404 — see the
       is_active check in jobs/[slug]/page.tsx. A sitemap that keeps advertising
       a URL that 404s is the exact pattern lib/open-jobs.ts warns about: it
       teaches a crawler to stop trusting the host. */
    const { data, error } = await createClient(url, key)
      .from('jobs')
      .select('slug')
      .eq('is_active', true)
    if (error || !data) return []
    return openJobs(data).map(j => `/jobs/${j.slug}`)
  } catch {
    return []
  }
}

/**
 * sitemap.xml.
 *
 * Only the pages a signed-out crawler can actually read. That is the whole
 * design rule here: middleware.ts gates everything except an allowlist, so a
 * sitemap listing a gated path would be a list of redirects to the login page.
 * Submitting that to Search Console reports them as errors and teaches Google
 * that this host wastes its time.
 *
 * ⚠ "PUBLIC" IS NO LONGER THE SAME QUESTION AS "IN PUBLIC_PATHS". /firms and
 * /jobs are both open in middleware.ts while individual pages under them still
 * decide for themselves, so listing a whole section here on the strength of its
 * prefix would publish exactly the redirects this file exists to keep out. Both
 * sections are therefore expanded through the same predicate the pages use:
 * isIndexable for firms, isOpenJob for listings.
 *
 * The auth routes are public in the middleware sense but are deliberately NOT
 * here. Nobody should arrive at a password reset form from a search result.
 *
 * Kept as a hand-written list rather than derived from the filesystem. A route
 * being public is a decision made in middleware.ts, and deriving this from
 * app/ would silently publish the next private page somebody adds.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = SITE_URL
  const now = new Date()
  const jobPaths = await openJobPaths()

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
    /* The board and the listings a stranger can actually read. Weekly on the
       board because its contents turn over; the listings themselves never
       change once posted, so the only event worth recrawling for is the page
       disappearing. Priority sits below an open firm profile deliberately: a
       profile is evergreen and a role expires, and a search result pointing at
       a closed vacancy is worth less than one pointing at a firm. */
    { path: '/jobs', priority: 0.8, changeFrequency: 'weekly' },
    ...jobPaths.map(path => ({ path, priority: 0.6, changeFrequency: 'monthly' as const })),
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
