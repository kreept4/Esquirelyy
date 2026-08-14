import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import Footer from '@/components/layout/Footer'
import JobsClient from './JobsClient'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { openJobs } from '@/lib/open-jobs'
import JsonLd, { breadcrumb, jobListSchema, openGraph } from '@/components/seo/JsonLd'
export const revalidate = 0

/**
 * ⚠ THIS PAGE HAD NO METADATA AT ALL, and it was the most expensive omission on
 * the site.
 *
 * Every other public route declares a title, a description and a canonical.
 * This one declared nothing, so it inherited the root layout's defaults and
 * served the generic site title — "Esquirely | Nigeria's Legal Career Platform"
 * — as the name of the jobs board. Compare /firms, which announces itself as
 * "Nigerian Law Firms Directory: 68 Firms, Offices and Practice Areas". One of
 * those two pages can rank for what it is about and the other cannot, and the
 * difference is this block rather than anything about the content.
 *
 * THE MISSING CANONICAL WAS THE WORSE HALF. The filtered board is reached as
 * /jobs?roles=slug-a,slug-b — the URL the announcement email, the notification
 * bell and the carousel slide ALL point at, which means it is the variant most
 * likely to be linked and crawled. With no canonical, that is a separate page
 * to a search engine: link equity splits between it and /jobs, and the version
 * that gets indexed is a board filtered to two roles that will be closed in
 * three months. Pointing every query-string variant at /jobs consolidates them
 * and is the honest answer, because they are all the same board.
 *
 * A LONG DESCRIPTION, DELIBERATELY. This is the field an AI answer engine
 * quotes when asked what the page is, and "legal jobs in Nigeria" is not an
 * answer. Naming the levels, the cities and what a listing actually carries is.
 */
export const metadata: Metadata = {
  title: 'Legal Jobs in Nigeria: Law Firm Vacancies, NYSC and Internships',
  description:
    'Open roles for Nigerian lawyers and law students, checked against each employer’s own notice. Associate and senior associate seats, post-NYSC and post-call openings, internships and graduate programmes across Lagos, Abuja and Port Harcourt, each with the practice area, the closing date and how to apply.',
  alternates: { canonical: '/jobs' },
  openGraph: openGraph({
    path: '/jobs',
    title: 'Legal Jobs in Nigeria | Esquirely',
    description:
      'Open roles for Nigerian lawyers and law students, checked against each employer’s own notice.',
  }),
}

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
  /* ⚠ `is_active` MUST BE FILTERED HERE. It is how a listing comes off the
     board without its row being deleted — see the long note in
     scripts/2026-08-15-agent-schema.sql. Adding the column hid nothing on its
     own; this clause is what makes closing a role mean anything, and a query
     that forgets it shows closed roles as open. */
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  /* Two clients on purpose. The one above is cookie-less and reads the public
     `jobs` rows; this one carries the session cookie and answers one question.
     Merging them would mean every board fetch waited on an auth round trip. */
  const { data: { user } } = await createSessionClient().auth.getUser()

  const all = jobs || []
  const visible = user ? all : openJobs(all)

  /* ALWAYS THE OPEN SET, never `visible`, and the distinction matters because
     this page is rendered per-request. `visible` is the whole board for a
     signed-in reader, so keying the schema off it would publish the gated
     listings' titles and URLs into the JSON-LD of whichever render a crawler
     happened to catch with a session — and every one of those URLs answers a
     stranger with a redirect to /auth/login. The list a machine is told about
     has to be the list a machine can actually read. */
  const crawlable = openJobs(all)

  return (
    <div>
      <JsonLd
        data={[
          jobListSchema(crawlable),
          breadcrumb([
            { name: 'Esquirely', path: '/' },
            { name: 'Jobs', path: '/jobs' },
          ]),
        ]}
      />
      {/* JobsClient reads useSearchParams to seed its filters from the URL, and
          Next requires that to sit inside a Suspense boundary. */}
      <Suspense fallback={null}>
        <JobsClient jobs={visible} gated={!user} totalCount={all.length} />
      </Suspense>
      <Footer />
    </div>
  )
}
