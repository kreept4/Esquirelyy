import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import JobsClient from './JobsClient'

export const revalidate = 3600

export default async function JobsPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { data: jobs, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
  return (
    <div>
      <Navbar />
      <JobsClient jobs={jobs || []} />
      <Footer />
    </div>
  )
}
