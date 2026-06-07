import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'

export const revalidate = 3600

const SmartJobBoardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)
const ApplicationTrackerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)
const ScholarshipsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/>
  </svg>
)
const FirmDirectoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="8" y1="12" x2="8" y2="12.01"/>
    <line x1="12" y1="12" x2="16" y2="12"/>
    <line x1="8" y1="16" x2="8" y2="16.01"/>
    <line x1="12" y1="16" x2="16" y2="16"/>
  </svg>
)
const JobAlertsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    <circle cx="18" cy="5" r="3" fill="#0A2342" stroke="none"/>
  </svg>
)
const AIToolsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
)

const SECTOR_ACCENT: Record<string, string> = {
  law_firm: '#0A2342', banking: '#0A4A8C', energy: '#7A3B00', fintech: '#0E5C3A', other: '#3B3B3B'
}

export default async function HomePage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { data: jobs } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
  const listings = jobs || []
  const featured = listings.slice(0, 6)
  const tickerItems = listings.map((j: any) => `${j.employer}, ${j.title}`)

  return (
    <div className="min-h-screen bg-cream font-sans" style={{ paddingTop: '64px' }}>
      <Navbar />

      {/* TICKER */}
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

      {/* HERO */}
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
            <p className="text-sm text-charcoal/40 italic mb-10 max-w-md">
              For Nigerian legal professionals at every stage, from law school to senior practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/jobs" className="inline-flex items-center justify-center gap-2 bg-ink text-cream px-6 py-3 rounded-lg font-medium text-sm hover:bg-ink/90 transition-colors">
                Browse Opportunities <ArrowRight size={16} />
              </Link>
              <Link href="/tracker" className="inline-flex items-center justify-center gap-2 border border-cream-border text-charcoal px-6 py-3 rounded-lg font-medium text-sm hover:border-ink/30 transition-colors">
                Track Applications
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full max-w-md" aria-hidden="true">
              <g><path d="M415.34,324.94s37.13-44.87,27.13-123S381.07,101.26,348.23,101,284,136.83,239.7,144.11,134,130.72,84.06,148.2,29.8,270.79,70.5,312.18,197.58,351.94,249,341.55,377.5,372.69,415.34,324.94Z" fill="#0A2342" opacity="0.05"/></g>
              <g>
                <polygon points="253,306 251,139 284,139 283,311" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
                <polygon points="284,139 310,139 308,294 283,311" fill="#1A1A1A" opacity="0.75"/>
                <rect x="280" y="84" width="2" height="35" fill="#0A2342" opacity="0.5"/>
                <polygon points="267,125 267,117 295,117 295,126" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
                <polygon points="282,125 282,117 295,117 295,126" fill="#1A1A1A" opacity="0.7"/>
                <polygon points="251,139 258,131 284,131 284,139" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
                <polygon points="284,131 304,132 310,139 284,139" fill="#1A1A1A" opacity="0.7"/>
              </g>
              <g>
                <polygon points="306,197 362,201 381,196 324,192" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
                <polygon points="362,201 361,295 379,287 381,196" fill="#1A1A1A" opacity="0.65"/>
                <polygon points="306,197 306,284 361,295 362,201" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
                <rect x="311" y="202" width="42" height="21" fill="#0A2342" opacity="0.75"/>
                <text x="316" y="216" fontSize="7" fill="#FAF7F2" fontFamily="serif" fontWeight="bold">HIRING</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
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
                        {listing.is_verified && (
                          <span className="text-xs font-medium text-verified bg-verified/10 px-2 py-0.5 rounded-full">Verified</span>
                        )}
                        {listing.is_closing_soon && (
                          <span className="text-xs font-medium text-closing bg-closing/10 px-2 py-0.5 rounded-full">Closing Soon</span>
                        )}
                      </div>
                      <h3 className="font-bold text-charcoal text-sm group-hover:text-ink transition-colors leading-snug mb-0.5">{listing.title}</h3>
                      <p className="text-xs font-medium text-ink/70">{listing.employer}</p>
                    </div>
                    {listing.tier && (
                      <span className="text-xs border border-ink/15 px-2 py-1 rounded-md text-charcoal/50 shrink-0 ml-3 bg-ink/3 font-medium">{listing.tier}</span>
                    )}
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

      {/* FEATURES */}
      <section className="border-b border-cream-border bg-cream-dark">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-charcoal mb-2">Everything you need</h2>
            <p className="text-charcoal/50 text-sm max-w-md mx-auto">Built for Nigerian legal professionals at every stage, from law school through senior practice.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <SmartJobBoardIcon />, title: 'Smart Job Board', desc: 'Filter by employer type, practice area, location, and role type across law firms, banks, fintechs, NGOs, and more.' },
              { icon: <ApplicationTrackerIcon />, title: 'Application Tracker', desc: 'Forward confirmation emails to your unique tracker address. Status updates automatically.' },
              { icon: <ScholarshipsIcon />, title: 'Scholarships', desc: 'Local and international scholarships for Nigerian law students, curated and deadline-tracked.' },
              { icon: <FirmDirectoryIcon />, title: 'Firm Directory', desc: 'Profiles of Nigerian law firms with tier rankings, practice area breakdowns, and hiring history.' },
              { icon: <JobAlertsIcon />, title: 'Job Alerts', desc: 'Get notified instantly when roles matching your criteria are posted. Never miss a deadline again.' },
              { icon: <AIToolsIcon />, title: 'AI Career Tools', desc: 'CV reviews, cover letter drafts, and interview prep tailored to the Nigerian legal market.' },
            ].map((feature) => (
              <div key={feature.title} className="border border-cream-border rounded-xl p-6 bg-cream hover:border-ink/20 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-ink/6 flex items-center justify-center mb-4 border border-ink/8">{feature.icon}</div>
                <h3 className="font-semibold text-charcoal mb-2">{feature.title}</h3>
                <p className="text-sm text-charcoal/55 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

  {/* CTA */}
      <section style={{ backgroundColor: '#0A2342' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-4xl font-black mb-4" style={{ color: '#FAF7F2' }}>
            New roles added daily.<br />Never miss a deadline.
          </h2>
          <p className="mb-2 max-w-lg mx-auto" style={{ color: 'rgba(250,247,242,0.6)' }}>
            Set up alerts for the practice areas, firms, and role types you care about. Esquirely. notifies you the moment a matching role goes live.
          </p>
          <p className="text-sm italic mb-10" style={{ color: 'rgba(250,247,242,0.35)' }}>
            Because in Nigerian legal hiring, deadlines wait for no one.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/jobs" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-medium text-sm transition-colors" style={{ backgroundColor: '#FAF7F2', color: '#0A2342' }}>
              Create Job Alert <ArrowRight size={16} />
            </Link>
            <Link href="/jobs" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-medium text-sm transition-colors" style={{ border: '1px solid rgba(250,247,242,0.2)', color: '#FAF7F2' }}>
              Browse All Opportunities
            </Link>
          </div>
        </div>
      </section>