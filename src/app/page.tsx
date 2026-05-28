'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Briefcase, GraduationCap, BookOpen, BarChart3,
  Mail, Bell, ArrowRight, Shield, Search
} from 'lucide-react'

const TICKER_ITEMS = [
  'Aluko & Oyebode — Associate, Banking & Finance',
  'Templars — Intern, Corporate (Deadline: 30 Jun)',
  'AELEX — Vacation Scheme 2025 — Now Open',
  'Banwo & Ighodalo — Capital Markets Associate',
  'Streamsowers & Köhn — Dispute Resolution Pupil',
  'G. Elias & Co — Junior Associate, Telecoms',
  'Olaniwun Ajayi — NYSC Legal Trainee',
  'Federal High Court — Law Clerk Openings',
]

const STATS = [
  { value: '340+', label: 'Live Listings' },
  { value: '80+', label: 'Verified Firms' },
  { value: '24', label: 'Scholarships' },
  { value: '6,200+', label: 'Professionals' },
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
    tier: 'Tier 2',
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
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 border border-ink/20 rounded-full px-4 py-1.5 text-xs text-ink font-medium mb-8 bg-ink/5">
              <span className="w-1.5 h-1.5 rounded-full bg-ink animate-pulse" />
              Nigeria&apos;s Legal Career Platform
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-black text-charcoal leading-tight mb-6">
              Your legal career<br />
              <span className="text-ink">starts here.</span>
            </h1>
            <p className="text-lg text-charcoal/60 leading-relaxed mb-10 max-w-md">
              Jobs, vacation schemes, pupillages, and scholarships from Nigeria&apos;s top law firms — verified, updated daily.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
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
                Track Applications <BarChart3 size={16} />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal/50">
              <Shield size={14} className="text-verified" />
              Listings verified directly with firms
            </div>
          </div>

          {/* Right: illustration */}
          <div className="flex items-center justify-center">
            <svg
              viewBox="0 0 520 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-lg"
              aria-hidden="true"
            >
              {/* Background dots */}
              {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 10 }).map((_, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={col * 52 + 20}
                    cy={row * 60 + 20}
                    r={2}
                    fill="#0A2342"
                    opacity={0.08}
                  />
                ))
              )}

              {/* Desk surface */}
              <rect x="60" y="310" width="400" height="12" rx="4" fill="#0A2342" opacity="0.12" />

              {/* Laptop base */}
              <rect x="160" y="240" width="200" height="130" rx="8" fill="#FAF7F2" stroke="#0A2342" strokeWidth="2" />
              {/* Laptop screen */}
              <rect x="170" y="250" width="180" height="100" rx="4" fill="#0A2342" opacity="0.06" stroke="#0A2342" strokeWidth="1.5" />
              {/* Screen content lines */}
              <rect x="182" y="262" width="80" height="6" rx="2" fill="#0A2342" opacity="0.3" />
              <rect x="182" y="274" width="120" height="4" rx="2" fill="#0A2342" opacity="0.15" />
              <rect x="182" y="284" width="100" height="4" rx="2" fill="#0A2342" opacity="0.15" />
              <rect x="182" y="300" width="60" height="20" rx="3" fill="#0A2342" opacity="0.5" />
              {/* Laptop hinge */}
              <rect x="160" y="368" width="200" height="8" rx="4" fill="#0A2342" opacity="0.18" />

              {/* Seated figure */}
              {/* Head */}
              <circle cx="260" cy="180" r="28" fill="#FAF7F2" stroke="#0A2342" strokeWidth="2" />
              {/* Body */}
              <path d="M230 208 Q230 260 240 280 L280 280 Q290 260 290 208 Z" fill="#0A2342" opacity="0.85" />
              {/* Left arm */}
              <path d="M232 220 Q200 240 185 268" stroke="#0A2342" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Right arm */}
              <path d="M288 220 Q320 240 335 268" stroke="#0A2342" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Collar detail */}
              <path d="M248 208 L260 224 L272 208" stroke="#FAF7F2" strokeWidth="2" fill="none" />

              {/* Floating card 1 — Job listing */}
              <g transform="translate(20, 100)">
                <rect width="160" height="72" rx="8" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1.5" />
                <rect x="12" y="12" width="60" height="6" rx="2" fill="#0A2342" opacity="0.7" />
                <rect x="12" y="24" width="90" height="4" rx="2" fill="#0A2342" opacity="0.3" />
                <rect x="12" y="34" width="40" height="4" rx="2" fill="#0A2342" opacity="0.2" />
                <rect x="12" y="48" width="50" height="14" rx="3" fill="#0A2342" opacity="0.8" />
                <rect x="68" y="48" width="50" height="14" rx="3" fill="#0A2342" opacity="0.1" />
              </g>

              {/* Floating card 2 — Scholarship */}
              <g transform="translate(340, 80)">
                <rect width="155" height="68" rx="8" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1.5" />
                <rect x="12" y="12" width="50" height="6" rx="2" fill="#2D6A4F" opacity="0.8" />
                <rect x="12" y="24" width="100" height="4" rx="2" fill="#0A2342" opacity="0.3" />
                <rect x="12" y="34" width="70" height="4" rx="2" fill="#0A2342" opacity="0.2" />
                <circle cx="130" cy="20" r="10" fill="#2D6A4F" opacity="0.15" />
                <text x="126" y="24" fontSize="10" fill="#2D6A4F" fontWeight="bold">✓</text>
              </g>

              {/* Floating card 3 — Deadline warning */}
              <g transform="translate(350, 260)">
                <rect width="140" height="60" rx="8" fill="#FAF7F2" stroke="#B5451B" strokeWidth="1.5" />
                <rect x="12" y="12" width="70" height="6" rx="2" fill="#0A2342" opacity="0.6" />
                <rect x="12" y="24" width="50" height="4" rx="2" fill="#0A2342" opacity="0.2" />
                <rect x="12" y="36" width="80" height="14" rx="3" fill="#B5451B" opacity="0.15" />
                <rect x="14" y="38" width="30" height="10" rx="2" fill="#B5451B" opacity="0.7" />
              </g>

              {/* Scales of justice — background watermark */}
              <g transform="translate(200, 380)" opacity="0.08">
                <line x1="60" y1="10" x2="60" y2="60" stroke="#0A2342" strokeWidth="2" />
                <line x1="20" y1="30" x2="100" y2="30" stroke="#0A2342" strokeWidth="2" />
                <path d="M20 30 Q10 50 30 50 Q50 50 40 30" stroke="#0A2342" strokeWidth="1.5" fill="none" />
                <path d="M80 30 Q70 50 90 50 Q110 50 100 30" stroke="#0A2342" strokeWidth="1.5" fill="none" />
              </g>

              {/* Lagos skyline silhouette — bottom strip */}
              <g transform="translate(60, 380)" opacity="0.07" fill="#0A2342">
                <rect x="0" y="30" width="20" height="50" />
                <rect x="25" y="10" width="15" height="70" />
                <rect x="45" y="20" width="25" height="60" />
                <rect x="75" y="5" width="12" height="75" />
                <rect x="92" y="25" width="18" height="55" />
                <rect x="115" y="15" width="30" height="65" />
                <rect x="150" y="30" width="15" height="50" />
                <rect x="170" y="10" width="20" height="70" />
                <rect x="195" y="20" width="25" height="60" />
                <rect x="225" y="35" width="15" height="45" />
                <rect x="245" y="15" width="20" height="65" />
                <rect x="270" y="25" width="30" height="55" />
                <rect x="305" y="10" width="18" height="70" />
                <rect x="328" y="30" width="22" height="50" />
                <rect x="355" y="20" width="15" height="60" />
                <rect x="375" y="5" width="25" height="75" />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-cream-border bg-cream-dark">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
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
                  <span className="flex items-center gap-1">
                    <Briefcase size={11} />
                    {listing.type}
                  </span>
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
                icon: <Search size={20} />,
                title: 'Smart Job Board',
                desc: 'Filter by firm tier, practice area, location, and type. Updated daily from verified sources.',
              },
              {
                icon: <BarChart3 size={20} />,
                title: 'Application Tracker',
                desc: 'Forward confirmation emails to your unique tracker address. Status updates automatically.',
              },
              {
                icon: <GraduationCap size={20} />,
                title: 'Scholarships',
                desc: 'Local and international scholarships for Nigerian law students — curated and deadline-tracked.',
              },
              {
                icon: <BookOpen size={20} />,
                title: 'Firm Directory',
                desc: 'In-depth profiles on 80+ Nigerian firms: practice areas, culture, hiring timelines.',
              },
              {
                icon: <Bell size={20} />,
                title: 'Job Alerts',
                desc: 'Get notified the moment a role matching your criteria is posted. Never miss a deadline.',
              },
              {
                icon: <Mail size={20} />,
                title: 'AI Career Tools',
                desc: 'CV reviews, cover letter drafts, and interview prep tailored to the Nigerian legal market.',
              },
            ].map((feature) => (
              <div key={feature.title} className="border border-cream-border rounded-xl p-6 bg-cream hover:border-ink/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-ink/8 flex items-center justify-center text-ink mb-4">
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
            Join thousands of Nigerian law graduates using Esquirely to land their first — and next — legal role.
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
