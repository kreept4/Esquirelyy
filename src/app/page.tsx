import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'
import HeroSection from './HeroSection'
import ScrollColorSection from '@/components/layout/ScrollColorSection'
import QuickQuestions from '@/components/features/QuickQuestions'
import RolePit from '@/components/features/RolePit'
import EverythingYouNeed from '@/components/features/EverythingYouNeed'
import NewsCarousel from '@/components/features/NewsCarousel'
import { getNewsItems } from '@/lib/news-data'
import { FIRMS_WITH_LOGOS, firmLogo } from '@/lib/firms-data'
import LogoFrame from '@/components/ui/LogoFrame'

export const revalidate = 3600

/**
 * The homepage's own canonical, which it used to get by inheritance.
 *
 * The root layout no longer sets one, so this page states its own like every
 * other route. It is the only page for which the old inherited value happened to
 * be correct, and that accident is exactly why the inherited version was hard to
 * spot: the page you check first is the one page it did not break.
 *
 * Title and description are left to the layout deliberately. The default title
 * IS the homepage title, and repeating it here would mean two places to edit the
 * same string.
 */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const SECTOR_ACCENT: Record<string, string> = {
  law_firm: '#1A1A1A', banking: '#1A1A1A', energy: '#7A3B00', fintech: '#0E5C3A', other: '#3B3B3B'
}

/** One black for the whole opening act. The hero is #000 and QuickQuestions was
 *  #1A1A1A, which left a faint seam wherever two dark sections met; everything
 *  in the dark run now shares this value so the sections read as one surface. */
export const INK_BLACK = '#000000'

export default async function HomePage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  /* Closed listings never reach the ball pit. Same clause as the board — see
     the note there, and the migration that added the column. */
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  const listings = jobs || []
  // 'Open right now' must mean it. Anything past its deadline is excluded;
  // rolling roles and roles with no stated deadline stay.
  const today = new Date().toISOString().slice(0, 10)
  const open = listings.filter((j: any) => j.is_rolling || !j.deadline || j.deadline >= today)

  /**
   * ⚠ THE PIT SHOWS THE EIGHT MOST RECENT, NOT EVERYTHING OPEN.
   *
   * It used to take every open role, which was fine at nine and stopped being
   * fine the moment the twelve Aluko rows were made publicly visible: the pit
   * went to twenty three balls, most of them one employer, and it read as a
   * crowd rather than as a selection. Reported as overpopulated, and it was.
   *
   * EIGHT, AND MOST RECENTLY ADDED FIRST. `listings` is already ordered by
   * created_at descending, so this is a slice rather than a re-sort, and the
   * property that matters is that the pit turns over on its own as rows are
   * added. Nobody has to curate it.
   *
   * ⚠ NOT SORTED BY DEADLINE, and that is a real trade-off worth naming. A role
   * closing in three days is more useful to a reader than a rolling one added
   * yesterday, and this ordering can bury it. The pit is not where urgency
   * lives: ClosingSoon on the board is, the bell raises deadlines inside seven
   * days, and the announcement email leads with whatever is shutting. The pit's
   * job is to show the board is alive, and "what went up most recently" is the
   * honest answer to that.
   *
   * The full set is one tap away and the ticker above still reads from the
   * unsliced list, so nothing is hidden, only unstacked.
   */
  const openRoles = open.slice(0, 8)
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
              capHeight={3.1}
              maxWidth={10.5}
              plate
              className="ticker-logo"
            />
          ))}
        </div>
      </div>

      {/* Between the ticker and the pit, still inside the dark run, so the
          glass panel has ink behind it to be glass against. */}
      <NewsCarousel items={getNewsItems()} />

      <RolePit listings={openRoles} />

      <QuickQuestions />

      <EverythingYouNeed />
      {/* Pinned, so the footer rises over it instead of following it. The
          closing statement holds while the amber panel slides up and covers
          it, which reads as one movement into the end of the page rather than
          as two stacked blocks. */}
      <div className="closing-glide">
        <ScrollColorSection animate={false}>
          Every opportunity.<br />One platform.
        </ScrollColorSection>
      </div>


      <Footer />
    </div>
  )
}


