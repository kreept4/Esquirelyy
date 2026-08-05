import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import Footer from '@/components/layout/Footer'
import JobsClient from './JobsClient'
export const revalidate = 0
export default async function JobsPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  console.log('SUPABASE_URL:', url ? 'set' : 'MISSING')
  console.log('SUPABASE_ANON_KEY:', key ? 'set' : 'MISSING')
  if (!url || !key) return <div style={{padding:'2rem'}}>Config error: missing env vars</div>
  const supabase = createClient(url, key)
  const { data: jobs, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
  console.log('jobs count:', jobs?.length, 'error:', error?.message)
  return (
    <div>
      {/* JobsClient reads useSearchParams to seed its filters from the URL, and
          Next requires that to sit inside a Suspense boundary. */}
      <Suspense fallback={null}>
        <JobsClient jobs={jobs || []} />
      </Suspense>
      <Footer />
    </div>
  )
}
