'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight, Shield } from 'lucide-react'

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

const STATS = [
  { value: '340+', label: 'Live Listings' },
  { value: '80+', label: 'Verified Firms' },
  { value: '24', label: 'Scholarships' },
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
  <svg viewBox="0 0 881.753 800" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(-649.896 -305.824)">
      <path d="M1067.947,497.383c-63.182-47.234-162.14-91.9-271.5-122.556-99.573-27.909-196.693-41.384-273.491-37.943l-.4-8.931c77.713-3.48,175.841,10.108,276.3,38.266,110.38,30.938,210.411,76.136,274.441,124Z" transform="translate(339.007 182.878)" fill="#0A2342" opacity="0.3"/>
      <path d="M785.81,474.819a99.219,99.219,0,1,0,5.625,146.532l121.7,102.694a9.143,9.143,0,1,0,11.806-13.964l-.014-.011-121.7-102.694A99.225,99.225,0,0,0,785.81,474.819Zm-7.846,122.667a74.336,74.336,0,1,1-8.875-104.751h0a74.336,74.336,0,0,1,8.874,104.751Z" transform="translate(466.683 379.618)" fill="#0A2342"/>
      <path d="M717.583,286.191a46.761,46.761,0,0,0-46.761,46.761c0,25.825,46.761,110.63,46.761,110.63s46.761-84.8,46.761-110.63a46.761,46.761,0,0,0-46.761-46.761Zm0,69.571a21.67,21.67,0,1,1,21.67-21.67,21.67,21.67,0,0,1-21.67,21.67Z" transform="translate(523.281 131.638)" fill="#0A2342"/>
    </g>
  </svg>
)

const ApplicationTrackerIcon = () => (
  <svg viewBox="0 0 500 500" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="155" y="245" width="130" height="39" rx="7" fill="#0A2342" opacity="0.15"/>
    <rect x="292" y="285" width="130" height="39" rx="7" fill="#0A2342" opacity="0.15"/>
    <rect x="429" y="324" width="130" height="39" rx="7" fill="#0A2342" opacity="0.15"/>
    <rect x="155" y="166" width="130" height="39" rx="7" fill="#0A2342" opacity="0.25"/>
    <rect x="292" y="206" width="130" height="39" rx="7" fill="#0A2342" opacity="0.25"/>
    <rect x="429" y="245" width="130" height="39" rx="7" fill="#0A2342" opacity="0.25"/>
    <rect x="155" y="107" width="130" height="39" rx="7" fill="#0A2342" opacity="0.4"/>
    <rect x="292" y="146" width="130" height="39" rx="7" fill="#0A2342" opacity="0.4"/>
    <rect x="429" y="186" width="130" height="39" rx="7" fill="#0A2342" opacity="0.4"/>
    <circle cx="270" cy="620" rx="300" ry="80" fill="#0A2342" opacity="0.05"/>
  </svg>
)

const ScholarshipsIcon = () => (
  <svg viewBox="0 0 500 500" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
    <polygon points="97,327 220,275 386,354 305,379 175,360" fill="#0A2342" opacity="0.15"/>
    <polygon points="97,320 97,327 220,275 221,266" fill="#0A2342" opacity="0.3"/>
    <polygon points="386,354 387,347 221,266 220,275" fill="#0A2342" opacity="0.3"/>
    <polygon points="150,390 163,329 317,360 306,421" fill="#0A2342" opacity="0.5"/>
    <ellipse cx="228" cy="406" rx="75" ry="21" fill="#0A2342" opacity="0.12"/>
    <polygon points="267,125 267,117 295,117 295,126" fill="#0A2342" opacity="0.4"/>
    <rect x="280" y="84" width="2" height="35" fill="#0A2342" opacity="0.5"/>
  </svg>
)

const FirmDirectoryIcon = () => (
  <svg viewBox="0 0 606 565" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
    <path d="M502,294a127,127,0,1,1,0-254,127,127,0,0,1,0,254Zm0-252a125,125,0,1,0,0,250,125,125,0,0,0,0-250Z" fill="#0A2342" opacity="0.15"/>
    <rect x="289" y="78" width="17" height="17" rx="2" fill="#0A2342"/>
    <path d="M554,57a23,23,0,0,0-23-23H275a23,23,0,0,0-23,23V466a23,23,0,0,0,23,23H554a23,23,0,0,0,23-23V57Z" fill="#0A2342" opacity="0.08"/>
    <line x1="341" y1="127" x2="528" y2="127" stroke="#0A2342" strokeWidth="2" opacity="0.3"/>
    <line x1="341" y1="165" x2="528" y2="165" stroke="#0A2342" strokeWidth="2" opacity="0.3"/>
    <line x1="341" y1="202" x2="528" y2="202" stroke="#0A2342" strokeWidth="2" opacity="0.3"/>
    <line x1="341" y1="240" x2="528" y2="240" stroke="#0A2342" strokeWidth="2" opacity="0.3"/>
    <rect x="371" y="111" x2="430" width="130" height="8" rx="4" fill="#0A2342" opacity="0.4"/>
    <rect x="371" y="149" width="100" height="8" rx="4" fill="#0A2342" opacity="0.3"/>
  </svg>
)

const JobAlertsIcon = () => (
  <svg viewBox="0 0 500 500" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
    <path d="M442,485H263a29,29,0,0,1-29-29V217a29,29,0,0,1,29-29H442a29,29,0,0,1,29,29V456A29,29,0,0,1,442,485Z" fill="#0A2342" opacity="0.1"/>
    <path d="M443,467H263a9,9,0,0,1-9-9V216a9,9,0,0,1,9-9H443a9,9,0,0,1,9,9V458A9,9,0,0,1,443,467Z" fill="#0A2342" opacity="0.08"/>
    <circle cx="288" cy="356" r="31" fill="#0A2342" opacity="0.15"/>
    <path d="M442,485H263a28.58,28.58,0,0,1-28.55-28.55V217.61A28.58,28.58,0,0,1,263,189.06H442a28.58,28.58,0,0,1,28.55,28.55V456.45A28.58,28.58,0,0,1,442,485Z" fill="none" stroke="#0A2342" strokeWidth="3" opacity="0.2"/>
    <rect x="270" y="280" width="120" height="8" rx="4" fill="#0A2342" opacity="0.4"/>
    <rect x="270" y="300" width="90" height="6" rx="3" fill="#0A2342" opacity="0.25"/>
    <rect x="270" y="316" width="100" height="6" rx="3" fill="#0A2342" opacity="0.25"/>
    <rect x="270" y="340" width="60" height="20" rx="4" fill="#0A2342" opacity="0.5"/>
  </svg>
)

const AIToolsIcon = () => (
  <svg viewBox="0 0 500 500" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
    <path d="M152,146c-4.7,2.71-8.53,10-8.53,16.28,0,5.59,3.05,8.49,7,7.13V288l-43.25-90.75a7.62,7.62,0,0,1-.08-5.54c10.92-25.27,19-53.74,21.72-82.95a6.59,6.59,0,0,1,2.91-4.55l40.4-23.33A1.81,1.81,0,0,1,175.61,82c2.72,25.27,10.45,44,20.93,56.64a6.18,6.18,0,0,1,1.11,5.2c-6.08,19.76-41.12,133.72-43.67,142V167.18c4-3.26,7-9.65,7-15.24C161,146,157.19,143,152,146Z" fill="#0A2342" opacity="0.6"/>
    <path d="M265,144c0-3.23-2.26-4.53-5.05-2.92a11.18,11.18,0,0,0-5.06,8.75c0,2.61,1.5,3.94,3.55,3.5-2.85,59.61-44.58,129.85-95.48,159.24-25.29,14.6-49,17-66.76,6.75C79.67,310,70,290,69,263a11.29,11.29,0,0,0,3.6-7.65c0-3.22-2.26-4.53-5-2.92a11.17,11.17,0,0,0-5.05,8.76c0,2.75,1.65,4.09,3.87,3.42,1.36,27,11.43,47.14,28.72,57.12a50.92,50.92,0,0,0,25.76,6.62c13.43,0,28.3-4.49,43.69-13.37,52.06-30.06,94.66-102.28,96.88-163.06A11.37,11.37,0,0,0,265,144Z" fill="#0A2342" opacity="0.4"/>
    <path d="M260,253a11.28,11.28,0,0,0-4.85,7.09L72,365.74c-.65-2-2.54-2.61-4.79-1.31a11.17,11.17,0,0,0-5.05,8.76c0,3.22,2.26,4.53,5.05,2.92a11.39,11.39,0,0,0,4.91-7.34L255,263c.59,2.13,2.52,2.83,4.85,1.49a11.18,11.18,0,0,0,5.05-8.76C265,253,262.75,251,260,253Z" fill="#0A2342" opacity="0.5"/>
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream font-sans">
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
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[88vh]">
          {/* Left: copy */}
          <div>
            <h1 className="font-display text-5xl lg:text-6xl font-black text-charcoal leading-tight mb-6">
              Your legal career<br />
              <span className="text-ink">starts here.</span>
            </h1>
            <p className="text-lg text-charcoal/60 leading-relaxed mb-10 max-w-md">
              Jobs, vacation schemes, pupillages, and scholarships from Nigeria&apos;s top law firms, verified and updated daily.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
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
            <div className="flex items-center gap-2 text-sm text-charcoal/40">
              <Shield size={13} className="text-verified" />
              Listings verified directly with firms
            </div>
          </div>

          {/* Right: illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full max-w-md opacity-90" aria-hidden="true">
              <g>
                <path d="M415.34,324.94s37.13-44.87,27.13-123S381.07,101.26,348.23,101,284,136.83,239.7,144.11,134,130.72,84.06,148.2,29.8,270.79,70.5,312.18,197.58,351.94,249,341.55,377.5,372.69,415.34,324.94Z" fill="#0A2342" opacity="0.06"/>
              </g>
              <g>
                <path d="M269.83,116.11c-4.79-2.61-7-.44-8.71-2.61s4.79-7.84-8.27-13.49c0,0-.87-12.19-18.71-12.63s-13.06,12.19-17.85,15.24-6.09-1.74-10.88,1.3-2.61,9.14-6.53,10-9.14-3.91-13.92-.87-4.79,5.66-7,5.66-6.53-1.74-9.14,0-5.66,3.92-5.66,3.92H273.31S274.61,118.72,269.83,116.11Z" fill="#0A2342" opacity="0.08"/>
                <path d="M403.41,163c-2.64-1.45-3.84-.24-4.8-1.45s2.64-4.32-4.57-7.45c0,0-.48-6.73-10.34-7s-7.21,6.73-9.85,8.42-3.37-1-6,.72-1.44,5-3.61,5.53-5.05-2.17-7.69-.49-2.64,3.13-3.85,3.13-3.6-1-5,0-3.13,2.16-3.13,2.16h60.82S406.06,164.39,403.41,163Z" fill="#0A2342" opacity="0.06"/>
              </g>
              <g>
                <polygon points="253,306 251,139 284,139 283,311" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1" strokeLinejoin="round"/>
                <polygon points="284,139 310,139 308,294 283,311" fill="#0A2342" opacity="0.7" strokeLinejoin="round"/>
                <rect x="280" y="84" width="2" height="35" fill="#0A2342" opacity="0.5"/>
                <polygon points="267,125 267,117 295,117 295,126" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
                <polygon points="282,125 282,117 295,117 295,126" fill="#0A2342" opacity="0.6"/>
                <polygon points="251,139 258,131 284,131 284,139" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
                <polygon points="284,131 304,132 310,139 284,139" fill="#0A2342" opacity="0.7"/>
              </g>
              <g>
                <polygon points="306,197 362,201 381,196 324,192" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
                <polygon points="362,201 361,295 379,287 381,196" fill="#0A2342" opacity="0.6"/>
                <polygon points="306,197 306,284 361,295 362,201" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
                <polygon points="353,223 311,219 311,202 353,206" fill="#0A2342" opacity="0.8"/>
                <text x="316" y="215" fontSize="8" fill="#FAF7F2" fontFamily="serif" fontWeight="bold">HIRING</text>
              </g>
              <g>
                <polyline points="63,346 154,305 409,377 357,417" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1" strokeLinejoin="round"/>
                <polyline points="83,351 156,318 363,376 320,409" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1" strokeLinejoin="round"/>
                <polyline points="156,318 156,327 354,383 363,376" fill="#0A2342" opacity="0.5"/>
                <ellipse cx="141" cy="365" rx="36" ry="16" fill="#0A2342" opacity="0.12"/>
              </g>
              <g>
                <path d="M150,166.24s2.5,6,2,9-7.24,5.5-8.24,6-6.24-1.75-6.24-7.5S147,161.5,150,166.24Z" fill="#FAF7F2" stroke="#263238" strokeWidth="0.5"/>
                <path d="M151,145a23,23,0,0,1,1.26,5.31c0,1.76-1,3-.76,4.29s2.27,3.28.51,6.56-.26,8.08-2.78,9.09a16.26,16.26,0,0,1-5.3,1l-.76,5.55-12.62-4V162.68s5.3.25,7.32-2.28,1.51-7.82,2.52-11.36,5.05-5.8,6.82-5.8S151,145,151,145Z" fill="#FAF7F2" stroke="#263238" strokeWidth="0.5"/>
                <path d="M124.49,173.78a27.86,27.86,0,0,0-7.72,8.45c-3,5.3.9,29.93,1.91,36.49s-1.26,17.42.51,20.45,7.57,5.55,13.12,6.06,14.14-.25,17.42-1.26,5.05-3.79,5.05-5.05-.25-16.66-.25-19.95-.25-26.76-2.27-31.3a19.29,19.29,0,0,0-8.84-9.09C140.39,177.07,129,171.51,124.49,173.78Z" fill="#0A2342" opacity="0.8"/>
                <path d="M152,357.27l.72.24,14.78,4.84s1.87,1.06,1.33,2.67-16,3.47-22.17,3.47-10.15-.53-10.15-2.94S152,357.27,152,357.27Z" fill="#0A2342" opacity="0.7"/>
                <path d="M125.05,348.19s7.74-3.21,9.08-.54-1.87,6.68-3.74,7.48-3.21,1.34-4.27,2.67-4.28,4.55-7.75,4-3.48-5.07-3.21-5.88S125.05,348.19,125.05,348.19Z" fill="#0A2342" opacity="0.6"/>
                <path d="M118.9,236.51s-2.14,8.82-.53,12.82,1.87,10.42,2.14,12.56-2.68,20-3.75,29.39-5.61,19.77-3.74,26.45.27,31,.81,34.73,1.6,7,2.4,7.48,3.74.8,6.15-.27,4-9.08,4.54-11.48,2.67-30.46,3.47-34.74,3.21-23.51,3.21-23.51,2.13,15.77,1.6,20-2.41,12.56-1.6,20,2.13,35.26,2.13,35.26a11.17,11.17,0,0,0,3.74,1.34c1.34,0,11.49-6.95,12.56-9.35s0-6.68,0-6.68,1.87-42.48,3.74-56.91-2.4-53.7-2.4-53.7S132.26,244.79,118.9,236.51Z" fill="#263238" opacity="0.7"/>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-cream-border bg-cream-dark">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-3 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-4xl font-black text-ink mb-1">{stat.value}</div>
              <div className="text-sm text-charcoal/50 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="border-b border-cream-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-charcoal mb-1">Featured Opportunities</h2>
              <p className="text-charcoal/50 text-sm">Handpicked from Nigeria&apos;s leading firms</p>
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
              <div
                key={listing.id}
                className="border border-cream-border rounded-xl p-5 bg-cream hover:border-ink/20 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
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
                    <h3 className="font-semibold text-charcoal text-sm group-hover:text-ink transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-charcoal/50 mt-0.5">{listing.firm}</p>
                  </div>
                  <span className="text-xs border border-cream-border px-2 py-1 rounded-md text-charcoal/50 shrink-0 ml-2">
                    {listing.tier}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {listing.practiceAreas.map((area) => (
                    <span key={area} className="text-xs bg-cream-dark border border-cream-border px-2 py-0.5 rounded-md text-charcoal/60">
                      {area}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-charcoal/40">
                  <span>{listing.type}</span>
                  <span>{listing.location}</span>
                  <span className={listing.isClosingSoon ? 'text-closing font-medium' : ''}>
                    {listing.deadline}
                  </span>
                </div>
              </div>
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
              Built specifically for Nigerian law students and young lawyers navigating a competitive market.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <SmartJobBoardIcon />,
                title: 'Smart Job Board',
                desc: 'Filter by firm tier, practice area, location, and type. Updated daily from verified sources.',
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
                title: 'Firm Directory',
                desc: 'In-depth profiles on 80+ Nigerian firms: practice areas, culture, hiring timelines.',
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
              <div key={feature.title} className="border border-cream-border rounded-xl p-6 bg-cream hover:border-ink/20 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-ink/5 flex items-center justify-center mb-4 overflow-hidden">
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
            Ready to find your role?
          </h2>
          <p className="text-charcoal/50 mb-8 max-w-md mx-auto">
            Join thousands of Nigerian law graduates using Esquirely to land their first and next legal role.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 bg-ink text-cream px-8 py-3.5 rounded-lg font-medium text-sm hover:bg-ink/90 transition-colors"
            >
              Browse All Jobs <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth-login"
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
