import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'
import HeroSection from './HeroSection'
import ScrollColorSection from '@/components/layout/ScrollColorSection'
import QuickQuestions from '@/components/features/QuickQuestions'
import RolePit from '@/components/features/RolePit'
import EverythingYouNeed from '@/components/features/EverythingYouNeed'
import { FIRMS_WITH_LOGOS, firmLogo } from '@/lib/firms-data'
import LogoFrame from '@/components/ui/LogoFrame'

export const revalidate = 3600

const SECTOR_ACCENT: Record<string, string> = {
  law_firm: '#1A1A1A', banking: '#1A1A1A', energy: '#7A3B00', fintech: '#0E5C3A', other: '#3B3B3B'
}

/** One black for the whole opening act. The hero is #000 and QuickQuestions was
 *  #1A1A1A, which left a faint seam wherever two dark sections met; everything
 *  in the dark run now shares this value so the sections read as one surface. */
export const INK_BLACK = '#000000'

export default async function HomePage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { data: jobs } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
  const listings = jobs || []
  // 'Open right now' must mean it. Anything past its deadline is excluded;
  // rolling roles and roles with no stated deadline stay.
  const today = new Date().toISOString().slice(0, 10)
  const openRoles = listings.filter((j: any) => j.is_rolling || !j.deadline || j.deadline >= today)
  const tickerItems = listings.slice(0, 8).map((j: any) => j.employer + ', ' + j.title)

  return (
    <div className="min-h-screen bg-cream font-sans">
      <style>{`
        ::selection { background: #1A1A1A; color: #FAF6F0; }
        ::-moz-selection { background: #1A1A1A; color: #FAF6F0; }
      `}</style>

      <HeroSection />
      {/* The hero ran into a 90px black-to-beige gradient here. At 90px that was
          a hard cut wearing a fade costume, and it dropped into a two-section
          beige island before the page slammed back to black at QuickQuestions.
          The dark run is now continuous from the hero to EverythingYouNeed, so
          there is one deliberate transition into the light instead of two. */}
      <div className="overflow-hidden" style={{ backgroundColor: INK_BLACK, borderBottom: '0.5px solid rgba(250,246,240,0.10)' }}>
        <div className="flex animate-ticker whitespace-nowrap py-6 items-center" style={{ width: 'max-content' }}>
          {[...FIRMS_WITH_LOGOS, ...FIRMS_WITH_LOGOS].map((firm, i) => (
            <LogoFrame
              key={firm.slug + i}
              src={firmLogo(firm)!}
              alt={firm.shortName}
              capHeight={2.4}
              maxWidth={8}
              plate
              className="ticker-logo"
            />
          ))}
        </div>
      </div>

      

      <RolePit listings={openRoles} />

      <QuickQuestions />

      <EverythingYouNeed />
      <ScrollColorSection animate={false}>
        Every opportunity.<br />One platform.
      </ScrollColorSection>


      <Footer />
    </div>
  )
}


