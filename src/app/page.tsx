import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'
import HomeIcons from './HomeIcons'
import FadeSection from './FadeSection'

export const revalidate = 3600

const SECTOR_ACCENT: Record<string, string> = {
  law_firm: '#8B3A3A', banking: '#8B3A3A', energy: '#7A3B00', fintech: '#0E5C3A', other: '#3B3B3B'
}

export default async function HomePage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { data: jobs } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
  const listings = jobs || []
  const featured = listings.slice(0, 6)
  const tickerItems = listings.map((j: any) => j.employer + ', ' + j.title)

  return (
    <div className="min-h-screen bg-cream font-sans" style={{ paddingTop: '80px' }}>
      <Navbar />
      <style>{`
        ::selection { background: #8B3A3A; color: #FAF6F0; }
        ::-moz-selection { background: #8B3A3A; color: #FAF6F0; }
      `}</style>

      <div className="border-b border-cream-border bg-cream-dark overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap py-2">
          {[...tickerItems, ...tickerItems].map((item: string, i: number) => (
            <span key={i} className="inline-flex items-center gap-3 px-6 text-sm text-charcoal/70">
              <span className="w-1 h-1 rounded-full bg-ink inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="border-b border-cream-border">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-5xl lg:text-6xl font-black text-charcoal leading-tight mb-4">
              Your legal career<br />
              <span className="text-ink">starts here.</span>
            </h1>
            <p className="text-lg text-charcoal/60 leading-relaxed mb-3 max-w-md">
              Jobs, vacation schemes, pupillages, and scholarships across law firms, corporates, and institutions, verified and updated daily.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/jobs" className="inline-flex items-center justify-center gap-2 bg-ink text-cream px-6 py-3 rounded-lg font-medium text-sm hover:bg-ink-light transition-colors">
                Browse Opportunities <ArrowRight size={16} />
              </Link>
              <Link href="/tracker" className="inline-flex items-center justify-center gap-2 border border-cream-border text-charcoal px-6 py-3 rounded-lg font-medium text-sm hover:border-ink/30 transition-colors">
                Track Applications
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <HomeIcons type="hero" />
          </div>
        </div>
      </section>

      <section className="border-b border-cream-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-charcoal mb-1">Featured Opportunities</h2>
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
                <Link key={listing.id} href={'/jobs/' + listing.slug} className="group border border-cream-border rounded-xl p-5 bg-cream hover:border-ink/30 hover:shadow-md transition-all block" style={{ borderLeft: '3px solid ' + accent }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {listing.is_verified && <span className="text-xs font-medium text-verified bg-verified/10 px-2 py-0.5 rounded-full">Verified</span>}
                        {listing.is_closing_soon && <span className="text-xs font-medium text-closing bg-closing/10 px-2 py-0.5 rounded-full">Closing Soon</span>}
                      </div>
                      <h3 className="font-bold text-charcoal text-sm group-hover:text-ink transition-colors leading-snug mb-0.5">{listing.title}</h3>
                      <p className="text-xs font-medium text-ink/70">{listing.employer}</p>
                    </div>
                    {listing.tier && <span className="text-xs border border-ink/15 px-2 py-1 rounded-md text-charcoal/50 shrink-0 ml-3 bg-ink/3 font-medium">{listing.tier}</span>}
                  </div>
                  {listing.practice_areas?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {listing.practice_areas.slice(0, 2).map((area: string) => (
                        <span key={area} className="text-xs bg-ink/5 border border-ink/10 px-2 py-0.5 rounded-md text-charcoal/70 font-medium">{area}</span>
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

      <section className="border-b border-cream-border bg-cream-dark">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-charcoal mb-2">Everything you need</h2>
            <p className="text-charcoal/50 text-sm max-w-md mx-auto">Built for Nigerian legal professionals at every stage, from law school through senior practice.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { type: 'search', title: 'Smart Job Board', desc: 'Filter by employer type, practice area, location, and role type across law firms, banks, fintechs, NGOs, and more.' },
              { type: 'tracker', title: 'Application Tracker', desc: 'Forward confirmation emails to your unique tracker address. Status updates automatically.' },
              { type: 'scholarship', title: 'Scholarships', desc: 'Local and international scholarships for Nigerian law students, curated and deadline-tracked.' },
              { type: 'firm', title: 'Firm Directory', desc: 'Profiles of Nigerian law firms with tier rankings, practice area breakdowns, and hiring history.' },
              { type: 'alert', title: 'Job Alerts', desc: 'Get notified instantly when roles matching your criteria are posted. Never miss a deadline again.' },
              { type: 'ai', title: 'AI Career Tools', desc: 'CV reviews, cover letter drafts, and interview prep tailored to the Nigerian legal market.' },
            ].map((feature) => (
              <div key={feature.title} className="border border-cream-border rounded-xl p-6 bg-cream hover:border-ink/20 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-ink/6 flex items-center justify-center mb-4 border border-ink/8">
                  <HomeIcons type={feature.type} />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">{feature.title}</h3>
                <p className="text-sm text-charcoal/55 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FadeSection />

      <Footer />
    </div>
  )
}

