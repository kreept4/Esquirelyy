import Footer from '@/components/layout/Footer'
import ScholarshipsClient from './ScholarshipsClient'
import { liveScholarships } from '@/lib/scholarships-live'

export const metadata = {
  title: 'Scholarships',
  description:
    'Funding for Nigerian law students and lawyers, at home and abroad. Every entry is open to law, checked against the provider’s own eligibility rules.',
}

/**
 * ⚠ REVALIDATED, BECAUSE A DERIVED STATUS IS USELESS ON A PAGE FROZEN AT BUILD.
 *
 * This page was fully static, so `allScholarships()` would have run once during
 * `next build` and every visitor for the next fortnight would have been served
 * whatever the answer was that afternoon. A scholarship that opened the
 * following Tuesday would still read "Upcoming" until an unrelated deploy
 * happened to rebuild it.
 *
 * An hour is far shorter than anything that changes here. Since 13 November
 * 2026 the list comes from the `scholarships` table (lib/scholarships-live.ts),
 * one small query per regeneration, and a save in /admin clears this page at
 * once rather than waiting for the hour. A window opening on the 8th is right
 * within an hour of midnight in Lagos rather than whenever somebody next ships.
 */
export const revalidate = 3600

export default async function ScholarshipsPage() {
  const scholarships = await liveScholarships()
  return (
    <div>
      <ScholarshipsClient scholarships={scholarships} />
      <Footer />
    </div>
  )
}
