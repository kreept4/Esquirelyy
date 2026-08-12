import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import Footer from '@/components/layout/Footer'
import JobsClient from './JobsClient'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { openJobs } from '@/lib/open-jobs'
export const revalidate = 0

/**
 * The board.
 *
 * ⚠ A SIGNED-OUT READER IS SENT THE OPEN LISTINGS AND NOTHING ELSE, and the
 * filtering happens HERE rather than in JobsClient. That is the whole security
 * property of this page: rows that never leave the server cannot be read out of
 * the HTML payload, and a client-side filter would ship all sixty-odd listings
 * to a stranger and then hide them with JavaScript.
 *
 * WHY THE BOARD SHRINKS RATHER THAN LOCKING ROWS. The alternative was to render
 * every listing and point the closed ones at the login page. That hands a
 * crawler dozens of links which all answer a 307 to /auth/login, which is the
 * exact pattern robots.ts exists to prevent, and it makes a visitor click to
 * find out they cannot read something. Every role a stranger can see here, they
 * can open.
 */
export default async function JobsPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return <div style={{padding:'2rem'}}>Config error: missing env vars</div>
  const supabase = createClient(url, key)
  const { data: jobs } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })

  /* Two clients on purpose. The one above is cookie-less and reads the public
     `jobs` rows; this one carries the session cookie and answers one question.
     Merging them would mean every board fetch waited on an auth round trip. */
  const { data: { user } } = await createSessionClient().auth.getUser()

  const all = jobs || []
  const visible = user ? all : openJobs(all)

  return (
    <div>
      {/* JobsClient reads useSearchParams to seed its filters from the URL, and
          Next requires that to sit inside a Suspense boundary. */}
      <Suspense fallback={null}>
        <JobsClient jobs={visible} gated={!user} totalCount={all.length} />
      </Suspense>
      <Footer />
    </div>
  )
}
