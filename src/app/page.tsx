import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'
import HeroSection from './HeroSection'
import ScrollColorSection from '@/components/layout/ScrollColorSection'
import QuickQuestions from '@/components/features/QuickQuestions'
import FirmGlobe from '@/components/features/FirmGlobe'
import RolePit from '@/components/features/RolePit'
import EverythingYouNeed from '@/components/features/EverythingYouNeed'
import { FIRMS_WITH_LOGOS, logoUrl } from '@/lib/firms-data'

export const revalidate = 3600

const SECTOR_ACCENT: Record<string, string> = {
  law_firm: '#1A1A1A', banking: '#1A1A1A', energy: '#7A3B00', fintech: '#0E5C3A', other: '#3B3B3B'
}

export default async function HomePage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { data: jobs } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
  const listings = jobs || []
  const seen = new Set(); const featured = listings.filter((j: any) => { if (seen.has(j.employer)) return false; seen.add(j.employer); return true; })
  const tickerItems = listings.slice(0, 8).map((j: any) => j.employer + ', ' + j.title)

  return (
    <div className="min-h-screen bg-cream font-sans">
      <style>{`
        ::selection { background: #1A1A1A; color: #FAF6F0; }
        ::-moz-selection { background: #1A1A1A; color: #FAF6F0; }
      `}</style>

      <HeroSection />
      <div style={{ height: '90px', background: 'linear-gradient(180deg, #000000 0%, #0A0A0A 55%, #F2EBE1 100%)' }} />
      <div className="border-b border-cream-border bg-cream-dark overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap py-6 items-center" style={{ width: 'max-content' }}>
          {[...FIRMS_WITH_LOGOS, ...FIRMS_WITH_LOGOS].map((firm, i) => (
            /* Fixed-width slot: logos vary wildly in aspect ratio, and letting
               each one size the slot made the marquee spacing lurch. */
            <span key={firm.slug + i} className="inline-flex items-center justify-center shrink-0 w-[168px]">
              <img
                src={logoUrl(firm.logoFile)!}
                alt={firm.shortName}
                width={140}
                height={40}
                className="max-h-[40px] max-w-[132px] w-auto h-auto object-contain"
              />
            </span>
          ))}
        </div>
      </div>

      

      <RolePit listings={featured} />

      <QuickQuestions />

      <EverythingYouNeed />
      <ScrollColorSection>
        Every opportunity.<br />One platform.
      </ScrollColorSection>

      <FirmGlobe />

      <Footer />
    </div>
  )
}


