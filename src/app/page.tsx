import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'
import HeroSection from './HeroSection'
import ScrollColorSection from '@/components/layout/ScrollColorSection'
import QuickQuestions from '@/components/features/QuickQuestions'
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
  const seen = new Set(); const featured = listings.filter((j: any) => { if (seen.has(j.employer)) return false; seen.add(j.employer); return true; }).slice(0, 6)
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

      

      <section className="border-b border-cream-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-4xl font-bold text-charcoal mb-1 tracking-tight">Featured Opportunities</h2>
              <p className="text-charcoal/50 text-sm">Latest verified roles across Nigeria</p>
            </div>
            <Link href="/jobs" className="hidden sm:inline-flex items-center gap-2 text-sm text-ink font-medium hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((listing: any) => {
              const accent = SECTOR_ACCENT[listing.sector] || '#3B3B3B'
              return (
                <Link key={listing.id} href={'/jobs/' + listing.slug} className="group border border-cream-border rounded p-5 bg-cream hover:border-ink/30 hover:shadow-md transition-all block" style={{ borderLeft: '3px solid ' + accent }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {listing.is_verified && <span className="text-xs font-medium text-verified bg-verified/10 px-2 py-0.5 rounded-sm">Verified</span>}
                        {listing.is_closing_soon && <span className="text-xs font-medium text-closing bg-closing/10 px-2 py-0.5 rounded-sm">Closing Soon</span>}
                      </div>
                      <h3 className="font-bold text-charcoal text-sm group-hover:text-ink transition-colors leading-snug mb-0.5">{listing.title}</h3>
                      <p className="text-xs font-medium text-ink/70">{listing.employer}</p>
                    </div>
                    {listing.tier && <span className="text-xs border border-ink/15 px-2 py-1 rounded-sm text-charcoal/50 shrink-0 ml-3 bg-ink/3 font-medium">{listing.tier}</span>}
                  </div>
                  {listing.practice_areas?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {listing.practice_areas.slice(0, 2).map((area: string) => (
                        <span key={area} className="text-xs bg-ink/5 border border-ink/10 px-2 py-0.5 rounded-sm text-charcoal/70 font-medium">{area}</span>
                      ))}
                    </div>
                  )}
                  <div className="pt-3 border-t border-cream-border flex items-center justify-between text-xs text-charcoal/40">
                    <span className="font-medium">{listing.type}</span>
                    <span>{listing.location}</span>
                    <span className={listing.is_closing_soon ? 'text-closing font-semibold' : 'font-medium'}>
                      {listing.is_rolling ? 'Rolling' : listing.deadline ? new Date(listing.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : 'Open'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="mt-6 sm:hidden text-center">
            <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-ink font-medium">
              View all opportunities <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <QuickQuestions />

      <EverythingYouNeed />
      <ScrollColorSection>
        Every opportunity.<br />One platform.
      </ScrollColorSection>

      <Footer />
    </div>
  )
}


