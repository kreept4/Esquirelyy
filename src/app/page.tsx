'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'

const TICKER_ITEMS = [
  'Aluko & Oyebode, Associate, Banking & Finance',
  'Templars, Intern, Corporate (Deadline: 30 Jun)',
  'AELEX, Vacation Scheme 2025, Now Open',
  'Banwo & Ighodalo, Capital Markets Associate',
  'Streamsowers & Köhn, Dispute Resolution Pupil',
  'G. Elias & Co, Junior Associate, Telecoms',
  'Olaniwun Ajayi, NYSC Legal Trainee',
  'Federal High Court, Law Clerk Openings',
]

const FEATURED_LISTINGS = [
  {
    id: 1,
    title: 'Associate, Banking & Finance',
    firm: 'Aluko & Oyebode',
    tier: 'Tier 1',
    type: 'Full-time',
    location: 'Lagos',
    deadline: '30 Jun 2025',
    isVerified: true,
    isClosingSoon: false,
    practiceAreas: ['Banking & Finance', 'Capital Markets'],
  },
  {
    id: 2,
    title: '2025 Vacation Scheme',
    firm: 'Templars',
    tier: 'Tier 1',
    type: 'Vacation Scheme',
    location: 'Lagos · Abuja',
    deadline: '15 Jun 2025',
    isVerified: true,
    isClosingSoon: true,
    practiceAreas: ['Corporate', 'Energy'],
  },
  {
    id: 3,
    title: 'Dispute Resolution Pupil',
    firm: 'Streamsowers & Köhn',
    tier: 'Tier 1',
    type: 'Pupillage',
    location: 'Lagos',
    deadline: 'Rolling',
    isVerified: true,
    isClosingSoon: false,
    practiceAreas: ['Dispute Resolution', 'Arbitration'],
  },
  {
    id: 4,
    title: 'Legal Trainee (NYSC)',
    firm: 'Olaniwun Ajayi LP',
    tier: 'Tier 1',
    type: 'Internship',
    location: 'Lagos',
    deadline: '20 Jun 2025',
    isVerified: false,
    isClosingSoon: false,
    practiceAreas: ['Corporate', 'Tax'],
  },
  {
    id: 5,
    title: 'Capital Markets Associate',
    firm: 'Banwo & Ighodalo',
    tier: 'Tier 1',
    type: 'Full-time',
    location: 'Lagos',
    deadline: '10 Jul 2025',
    isVerified: true,
    isClosingSoon: false,
    practiceAreas: ['Capital Markets', 'Securities'],
  },
  {
    id: 6,
    title: 'Junior Associate, Telecoms',
    firm: 'G. Elias & Co',
    tier: 'Tier 1',
    type: 'Full-time',
    location: 'Lagos',
    deadline: '25 Jun 2025',
    isVerified: true,
    isClosingSoon: true,
    practiceAreas: ['Telecoms', 'Regulatory'],
  },
]

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

const HeroIllustration = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full max-w-md" aria-hidden="true">
    <g>
      <path d="M415.34,324.94s37.13-44.87,27.13-123S381.07,101.26,348.23,101,284,136.83,239.7,144.11,134,130.72,84.06,148.2,29.8,270.79,70.5,312.18,197.58,351.94,249,341.55,377.5,372.69,415.34,324.94Z" fill="#0A2342" opacity="0.05"/>
    </g>
    <g>
      <path d="M269.83,116.11c-4.79-2.61-7-.44-8.71-2.61s4.79-7.84-8.27-13.49c0,0-.87-12.19-18.71-12.63s-13.06,12.19-17.85,15.24-6.09-1.74-10.88,1.3-2.61,9.14-6.53,10-9.14-3.91-13.92-.87-4.79,5.66-7,5.66-6.53-1.74-9.14,0-5.66,3.92-5.66,3.92H273.31S274.61,118.72,269.83,116.11Z" fill="#0A2342" opacity="0.07"/>
      <path d="M118.2,217.63c-2.64-1.44-3.85-.24-4.81-1.44s2.65-4.33-4.56-7.46c0,0-.48-6.73-10.34-7s-7.21,6.73-9.86,8.42-3.36-1-6,.72-1.45,5-3.61,5.53-5-2.17-7.69-.48-2.65,3.12-3.85,3.12-3.6-1-5.05,0-3.12,2.16-3.12,2.16h60.81S120.85,219.07,118.2,217.63Z" fill="#0A2342" opacity="0.05"/>
    </g>
    <g>
      <polygon points="253,306 251,139 284,139 283,311" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
      <polygon points="284,139 310,139 308,294 283,311" fill="#1A1A1A" opacity="0.75"/>
      <rect x="280" y="84" width="2" height="35" fill="#0A2342" opacity="0.5"/>
      <polygon points="267,125 267,117 295,117 295,126" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
      <polygon points="282,125 282,117 295,117 295,126" fill="#1A1A1A" opacity="0.7"/>
      <polygon points="251,139 258,131 284,131 284,139" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
      <polygon points="284,131 304,132 310,139 284,139" fill="#1A1A1A" opacity="0.7"/>
      <line x1="255" y1="150" x2="282" y2="150" stroke="#0A2342" strokeWidth="0.75" opacity="0.3"/>
      <line x1="255" y1="161" x2="282" y2="161" stroke="#0A2342" strokeWidth="0.75" opacity="0.3"/>
      <line x1="255" y1="172" x2="282" y2="172" stroke="#0A2342" strokeWidth="0.75" opacity="0.3"/>
      <line x1="255" y1="183" x2="282" y2="183" stroke="#0A2342" strokeWidth="0.75" opacity="0.3"/>
    </g>
    <g>
      <polygon points="306,197 362,201 381,196 324,192" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
      <polygon points="362,201 361,295 379,287 381,196" fill="#1A1A1A" opacity="0.65"/>
      <polygon points="306,197 306,284 361,295 362,201" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
      <rect x="311" y="202" width="42" height="21" fill="#0A2342" opacity="0.75"/>
      <text x="316" y="216" fontSize="7" fill="#FAF7F2" fontFamily="serif" fontWeight="bold">HIRING</text>
    </g>
    <g>
      <polygon points="213,210 246,214 277,208 246,214" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
      <polygon points="246,214 277,208 277,356 247,348" fill="#1A1A1A" opacity="0.65"/>
      <polygon points="212,210 246,214 247,348 216,340" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
      <rect x="249" y="237" width="27" height="17" fill="#0A2342" opacity="0.75"/>
      <text x="252" y="249" fontSize="6" fill="#FAF7F2" fontFamily="serif" fontWeight="bold">JOB</text>
    </g>
    <g>
      <polyline points="63,346 154,305 409,377 357,417" fill="none" stroke="#0A2342" strokeWidth="1" strokeLinejoin="round"/>
      <polyline points="83,351 156,318 363,376 320,409" fill="none" stroke="#0A2342" strokeWidth="1" strokeLinejoin="round"/>
      <polygon points="156,318 156,327 354,383 363,376" fill="#0A2342" opacity="0.45"/>
      <ellipse cx="141" cy="365" rx="36" ry="16" fill="#0A2342" opacity="0.1"/>
    </g>
    <g>
      <path d="M150,166.24s2.5,6,2,9-7.24,5.5-8.24,6-6.24-1.75-6.24-7.5S147,161.5,150,166.24Z" fill="#FAF7F2" stroke="#263238" strokeWidth="0.75"/>
      <path d="M151,145a23,23,0,0,1,1.26,5.31c0,1.76-1,3-.76,4.29s2.27,3.28.51,6.56-.26,8.08-2.78,9.09a16.26,16.26,0,0,1-5.3,1l-.76,5.55-12.62-4V162.68s5.3.25,7.32-2.28,1.51-7.82,2.52-11.36,5.05-5.8,6.82-5.8S151,145,151,145Z" fill="#FAF7F2" stroke="#263238" strokeWidth="0.75"/>
      <path d="M124.49,173.78a27.86,27.86,0,0,0-7.72,8.45c-3,5.3.9,29.93,1.91,36.49s-1.26,17.42.51,20.45,7.57,5.55,13.12,6.06,14.14-.25,17.42-1.26,5.05-3.79,5.05-5.05-.25-16.66-.25-19.95-.25-26.76-2.27-31.3a19.29,19.29,0,0,0-8.84-9.09C140.39,177.07,129,171.51,124.49,173.78Z" fill="#0A2342" opacity="0.8"/>
      <path d="M118.9,236.51s-2.14,8.82-.53,12.82,1.87,10.42,2.14,12.56-2.68,20-3.75,29.39-5.61,19.77-3.74,26.45.27,31,.81,34.73,1.6,7,2.4,7.48,3.74.8,6.15-.27,4-9.08,4.54-11.48,2.67-30.46,3.47-34.74,3.21-23.51,3.21-23.51,2.13,15.77,1.6,20-2.41,12.56-1.6,20,2.13,35.26,2.13,35.26a11.17,11.17,0,0,0,3.74,1.34c1.34,0,11.49-6.95,12.56-9.35s0-6.68,0-6.68,1.87-42.48,3.74-56.91-2.4-53.7-2.4-53.7S132.26,244.79,118.9,236.51Z" fill="#1A1A1A" opacity="0.65"/>
      <path d="M152,357.27l.72.24,14.78,4.84s1.87,1.06,1.33,2.67-16,3.47-22.17,3.47-10.15-.53-10.15-2.94S152,357.27,152,357.27Z" fill="#0A2342" opacity="0.6"/>
      <path d="M125.05,348.19s7.74-3.21,9.08-.54-1.87,6.68-3.74,7.48-3.21,1.34-4.27,2.67-4.28,4.55-7.75,4-3.48-5.07-3.21-5.88S125.05,348.19,125.05,348.19Z" fill="#0A2342" opacity="0.5"/>
    </g>
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream font-sans" style={{ paddingTop: '64px' }}>
      <Navbar />

      {/* TICKER */}
      <div className="border-b border-cream-border bg-cream-dark overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap py-2">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
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
          {/* Left: copy */}
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
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 bg-ink text-cream px-6 py-3 rounded-lg font-medium text-sm hover:bg-ink/90 transition-colors"
              >
                Browse Opportunities <ArrowRight size={16} />
              </Link>
              <Link
                href="/tracker"
                className="inline-flex items-center justify-center gap-2 border border-cream-border text-charcoal px-6 py-3 rounded-lg font-medium text-sm hover:border-ink/30 transition-colors"
              >
                Track Applications
              </Link>
            </div>
          </div>

          {/* Right: illustration — visible on all screens, stacks on mobile */}
          <div className="flex items-center justify-center">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="border-b border-cream-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-charcoal mb-1">Featured Opportunities</h2>
              <p className="text-charcoal/50 text-sm">Handpicked from Nigeria&apos;s leading firms and institutions</p>
            </div>
            <Link
              href="/jobs"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-ink font-medium hover:underline"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_LISTINGS.map((listing) => (
              <Link
                key={listing.id}
                href="/jobs"
                className="group border border-cream-border rounded-xl p-5 bg-cream hover:border-ink/30 hover:shadow-md transition-all block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {listing.isVerified && (
                        <span className="text-xs font-medium text-verified bg-verified/10 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                      {listing.isClosingSoon && (
                        <span className="text-xs font-medium text-closing bg-closing/10 px-2 py-0.5 rounded-full">
                          Closing Soon
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-charcoal text-sm group-hover:text-ink transition-colors leading-snug mb-0.5">
                      {listing.title}
                    </h3>
                    <p className="text-xs font-medium text-ink/70">{listing.firm}</p>
                  </div>
                  <span className="text-xs border border-ink/15 px-2 py-1 rounded-md text-charcoal/50 shrink-0 ml-3 bg-ink/3 font-medium">
                    {listing.tier}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {listing.practiceAreas.map((area) => (
                    <span key={area} className="text-xs bg-ink/5 border border-ink/10 px-2 py-0.5 rounded-md text-charcoal/70 font-medium">
                      {area}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-cream-border flex items-center justify-between text-xs text-charcoal/40">
                  <span className="font-medium">{listing.type}</span>
                  <span>{listing.location}</span>
                  <span className={listing.isClosingSoon ? 'text-closing font-semibold' : 'font-medium'}>
                    {listing.deadline}
                  </span>
                </div>
              </Link>
            ))}
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
            <p className="text-charcoal/50 text-sm max-w-md mx-auto">
              Built for Nigerian legal professionals at every stage, from law school through senior practice.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <SmartJobBoardIcon />,
                title: 'Smart Job Board',
                desc: 'Filter by employer type, practice area, location, and role type across law firms, banks, fintechs, NGOs, and more.',
              },
              {
                icon: <ApplicationTrackerIcon />,
                title: 'Application Tracker',
                desc: 'Forward confirmation emails to your unique tracker address. Status updates automatically.',
              },
              {
                icon: <ScholarshipsIcon />,
                title: 'Scholarships',
                desc: 'Local and international scholarships for Nigerian law students, curated and deadline-tracked.',
              },
              {
                icon: <FirmDirectoryIcon />,
                title: 'Organisation Directory',
                desc: 'Profiles on 80+ Nigerian law firms, in-house legal teams, and institutions, with contacts and hiring timelines.',
              },
              {
                icon: <JobAlertsIcon />,
                title: 'Job Alerts',
                desc: 'Get notified the moment a role matching your criteria is posted. Never miss a deadline.',
              },
              {
                icon: <AIToolsIcon />,
                title: 'AI Career Tools',
                desc: 'CV reviews, cover letter drafts, and interview prep tailored to the Nigerian legal market.',
              },
            ].map((feature) => (
              <div key={feature.title} className="border border-cream-border rounded-xl p-6 bg-cream hover:border-ink/20 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-ink/6 flex items-center justify-center mb-4 border border-ink/8">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-charcoal mb-2">{feature.title}</h3>
                <p className="text-sm text-charcoal/55 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-4xl font-black text-charcoal mb-4">
            Every opportunity.<br />One platform.
          </h2>
          <p className="text-charcoal/50 mb-2 max-w-lg mx-auto">
            From law school to senior practice, Esquirely connects Nigerian legal professionals with opportunities across law firms, corporates, NGOs, and international organisations.
          </p>
          <p className="text-charcoal/35 text-sm italic mb-10">
            The only platform built for the full arc of a Nigerian legal career.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 bg-ink text-cream px-8 py-3.5 rounded-lg font-medium text-sm hover:bg-ink/90 transition-colors"
            >
              Browse All Opportunities <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 border border-cream-border text-charcoal px-8 py-3.5 rounded-lg font-medium text-sm hover:border-ink/30 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
