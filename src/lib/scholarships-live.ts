/**
 * Scholarships as the site shows them, read from the `scholarships` table.
 *
 * Since 13 November 2026 the table is the source of truth: the /admin page
 * adds, edits and hides entries there, and the pages read it here. The list in
 * lib/scholarships-data.ts is now only a fallback, served if the database
 * cannot be read, so a Supabase outage shows yesterday's list rather than an
 * empty page.
 *
 * SERVER ONLY. It uses the service-role client, because the table grants
 * nothing to anon or authenticated and the pages render without a session
 * (they are regenerated hourly, and on every admin save).
 *
 * Status is resolved the same way everywhere, through statusOf, for the reason
 * set out beside allScholarships in scholarships-data.ts.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { fileScholarships, statusOf, type Scholarship, type ScholarshipStatus } from '@/lib/scholarships-data'

export type ScholarshipRow = {
  slug: string
  title: string
  provider: string
  region: string
  level: string
  funding: string
  deadline: string
  opens_on: string | null
  closes_on: string | null
  status: ScholarshipStatus
  description: string
  eligibility: string[] | null
  link: string
  logo: string | null
  logo_bg: string | null
  is_published: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export function fromRow(r: ScholarshipRow): Scholarship {
  return {
    slug: r.slug,
    title: r.title,
    provider: r.provider,
    region: r.region,
    level: r.level,
    funding: r.funding,
    deadline: r.deadline,
    opensOn: r.opens_on ?? undefined,
    closesOn: r.closes_on ?? undefined,
    status: r.status,
    description: r.description,
    eligibility: r.eligibility ?? [],
    link: r.link,
    logo: r.logo ?? undefined,
    logoBg: r.logo_bg ?? undefined,
  }
}

/** Published entries in board order, with the stored status. */
async function loadPublished(): Promise<Scholarship[]> {
  try {
    const { data, error } = await createAdminClient()
      .from('scholarships')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error || !data) throw new Error(error?.message || 'no data')
    return (data as ScholarshipRow[]).map(fromRow)
  } catch (e) {
    console.error('[scholarships] falling back to the file list:', e instanceof Error ? e.message : e)
    return fileScholarships()
  }
}

/** Every published scholarship, with status resolved for `now`. */
export async function liveScholarships(now: Date = new Date()): Promise<Scholarship[]> {
  return (await loadPublished()).map(s => ({ ...s, status: statusOf(s, now) }))
}

/** One published scholarship by slug, or undefined so the page can 404. */
export async function liveScholarshipBySlug(slug: string, now: Date = new Date()): Promise<Scholarship | undefined> {
  return (await liveScholarships(now)).find(s => s.slug === slug)
}

/** Every published slug, for generateStaticParams. */
export async function liveScholarshipSlugs(): Promise<string[]> {
  return (await loadPublished()).map(s => s.slug)
}
