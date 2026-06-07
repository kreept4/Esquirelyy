const fs = require('fs');

fs.writeFileSync('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#1A1A1A',
          light: '#2C2C2C',
          muted: '#4A4A4A',
        },
        cream: {
          DEFAULT: '#FAF6F0',
          dark: '#F2EBE1',
          border: '#E8E0D5',
        },
        ink: {
          DEFAULT: '#5C1A1A',
          light: '#7A2424',
          muted: '#9A3A3A',
        },
        verified: '#2D6A4F',
        closing: '#B5451B',
        new: '#5C1A1A',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        widest: '0.2em',
        'ultra-wide': '0.3em',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
`);

fs.writeFileSync('src/app/HomeIcons.tsx', `'use client'

export default function HomeIcons({ type }: { type: string }) {
  if (type === 'hero') return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full max-w-md" aria-hidden="true">
      <ellipse cx="250" cy="420" rx="180" ry="20" fill="#5C1A1A" opacity="0.06"/>
      <g>
        <polygon points="253,310 251,140 286,140 285,314" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1.5"/>
        <polygon points="286,140 314,140 312,298 285,314" fill="#5C1A1A" opacity="0.18"/>
        <rect x="282" y="82" width="2.5" height="38" fill="#5C1A1A" opacity="0.4"/>
        <polygon points="268,128 268,118 298,118 298,128" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1.5"/>
        <polygon points="284,128 284,118 298,118 298,128" fill="#5C1A1A" opacity="0.18"/>
        <polygon points="251,140 259,131 286,131 286,140" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1.5"/>
        <polygon points="286,131 308,133 314,140 286,140" fill="#5C1A1A" opacity="0.18"/>
        <rect x="258" y="180" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="195" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="210" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="225" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="240" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="255" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="270" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
      </g>
      <g>
        <polygon points="308,200 368,204 388,198 326,194" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1.5"/>
        <polygon points="368,204 367,300 386,292 388,198" fill="#5C1A1A" opacity="0.14"/>
        <polygon points="308,200 308,288 367,300 368,204" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1.5"/>
        <rect x="314" y="205" width="44" height="22" fill="#5C1A1A" opacity="0.85" rx="1"/>
        <text x="319" y="220" fontSize="7.5" fill="#FAF6F0" fontFamily="Georgia, serif" fontWeight="bold" letterSpacing="1">HIRING</text>
        <rect x="314" y="236" width="30" height="2.5" fill="#5C1A1A" opacity="0.1"/>
        <rect x="314" y="246" width="24" height="2.5" fill="#5C1A1A" opacity="0.1"/>
        <rect x="314" y="256" width="28" height="2.5" fill="#5C1A1A" opacity="0.1"/>
        <rect x="314" y="266" width="20" height="2.5" fill="#5C1A1A" opacity="0.1"/>
      </g>
      <g>
        <polygon points="160,240 210,243 224,239 172,236" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1"/>
        <polygon points="210,243 209,310 222,305 224,239" fill="#5C1A1A" opacity="0.1"/>
        <polygon points="160,240 160,306 209,310 210,243" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1"/>
      </g>
    </svg>
  )
  const icons: Record<string, JSX.Element> = {
    search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
    tracker: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    scholarship: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/></svg>,
    firm: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="8" y1="12" x2="8" y2="12.01"/><line x1="12" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="8" y2="16.01"/><line x1="12" y1="16" x2="16" y2="16"/></svg>,
    alert: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="18" cy="5" r="3" fill="#5C1A1A" stroke="none"/></svg>,
    ai: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  }
  return icons[type] || null
}
`);

fs.writeFileSync('src/app/page.tsx', `import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'
import HomeIcons from './HomeIcons'

export const revalidate = 3600

const SECTOR_ACCENT: Record<string, string> = {
  law_firm: '#5C1A1A', banking: '#1A3A5C', energy: '#7A3B00', fintech: '#0E5C3A', other: '#3B3B3B'
}

export default async function HomePage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { data: jobs } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
  const listings = jobs || []
  const featured = listings.slice(0, 6)
  const tickerItems = listings.map((j: any) => j.employer + ', ' + j.title)

  return (
    <div className="min-h-screen bg-cream font-sans" style={{ paddingTop: '64px' }}>
      <Navbar />

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
            <p className="text-sm text-charcoal/40 italic mb-10 max-w-md">
              For Nigerian legal professionals at every stage, from law school to senior practice.
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

      <section style={{ backgroundColor: '#5C1A1A' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-4xl font-black mb-4" style={{ color: '#FAF6F0' }}>
            New roles added daily.<br />Never miss a deadline.
          </h2>
          <p className="mb-2 max-w-lg mx-auto" style={{ color: 'rgba(250,246,240,0.6)' }}>
            Set up alerts for the practice areas, firms, and role types you care about. Esquirely. notifies you the moment a matching role goes live.
          </p>
          <p className="text-sm italic mb-10" style={{ color: 'rgba(250,246,240,0.35)' }}>
            Because in Nigerian legal hiring, deadlines wait for no one.
          </p>
          <Link href="/jobs" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-medium text-sm" style={{ backgroundColor: '#FAF6F0', color: '#5C1A1A' }}>
            Create Job Alert <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section style={{
        background: 'linear-gradient(to bottom, #5C1A1A 0%, #7A2424 20%, #FAF6F0 100%)',
        padding: '8rem 1.5rem',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          color: '#1A1A1A',
          maxWidth: '800px',
          margin: '0 auto',
          paddingTop: '4rem',
        }}>
          Every opportunity.<br />One platform.
        </h2>
      </section>

      <Footer />
    </div>
  )
}
`);

console.log('done');