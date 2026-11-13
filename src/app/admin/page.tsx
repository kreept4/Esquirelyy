import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { currentAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ScholarshipRow } from '@/lib/scholarships-live'
import AdminClient, { type AdminJob, type AdminOpportunity } from './AdminClient'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

/* Always fresh: this page is where changes are made, so it must never show a
   cached copy from before the last save. */
export const dynamic = 'force-dynamic'

/**
 * The owner's listings console. 404 for everybody but the accounts in
 * lib/admin.ts, so the page does not even admit to existing.
 */
export default async function AdminPage() {
  const admin = await currentAdmin()
  if (!admin) notFound()

  const db = createAdminClient()
  const [jobs, scholarships, opportunities] = await Promise.all([
    db
      .from('jobs')
      .select('id, slug, title, employer, sector, type, level, tier, location, deadline, is_rolling, practice_areas, about, role_desc, requirements, apply_email, apply_url, source, logo_url, is_active, created_at, delisted_at')
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(300),
    db.from('scholarships').select('*').order('sort_order', { ascending: true }),
    db
      .from('opportunities')
      .select('id, title, organization, type, target, location, deadline, link, description, eligibility, logo_url, practice_areas, status, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  return (
    <AdminClient
      adminEmail={admin.email}
      jobs={(jobs.data ?? []) as AdminJob[]}
      scholarships={(scholarships.data ?? []) as ScholarshipRow[]}
      opportunities={(opportunities.data ?? []) as AdminOpportunity[]}
      loadError={[jobs.error, scholarships.error, opportunities.error].filter(Boolean).map(e => e!.message).join('; ') || null}
    />
  )
}
