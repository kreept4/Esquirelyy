Set-Content -Path src\app\page.tsx -Encoding UTF8 -Value @'
'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Briefcase, GraduationCap, BookOpen, BarChart3,
  Mail, Bell, ArrowRight, Shield, Search
} from 'lucide-react'

// ─── Static data (replace with Supabase queries in production) ────────────────

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
    title: 'Junior Associate — Energy',
    firm: 'AELEX',
    tier: 'Tier 1',
    type: 'Full-time',
    location: 'Lagos',
    deadline: '10 Jul 2025',
    isVerified: true,
    isClosingSoon: false,
    practiceAreas: ['Energy', 'Dispute Resolution'],
  },
  {
    id: 6,
    title: 'Capital Markets Associate',
    firm: 'Banwo & Ighodalo',
    tier: 'Tier 1',
    type: 'Full-time',
    location: 'Lagos',
    deadline: '5 Jul 2025',
    isVerified: true,
    isClosingSoon: false,
    practiceAreas: ['Capital Markets', 'Corporate'],
  },
]

const TOP_FIRMS = [
  { slug: 'aluko-oyebode', name: 'Aluko & Oyebode', tier: 'Tier 1', roles: 3 },
  { slug: 'templars', name: 'Templars', tier: 'Tier 1', roles: 2 },
  { slug: 'aelex', name: 'AELEX', tier: 'Tier 1', roles: 4 },
  { slug: 'olajide-oyewole', name: 'Olajide Oyewole LLP', tier: 'Tier 1', roles: 1 },
  { slug: 'banwo-ighodalo', name: 'Banwo & Ighodalo', tier: 'Tier 1', roles: 2 },
  { slug: 'g-elias', name: 'G. Elias & Co', tier: 'Tier 1', roles: 1 },
  { slug: 'olaniwun-ajayi', name: 'Olaniwun Ajayi LP', tier: 'Tier 1', roles: 2 },
  { slug: 'stl-attorneys', name: 'STL Attorneys', tier: 'Tier 2', roles: 1 },
]

const FEATURES = [
  {
    icon: Search,
    title: 'Curated Listings',
    body: 'Every role is sourced directly from firms or their official channels — no aggregated noise, no stale postings.',
  },
  {
    icon: Shield,
    title: 'Verified Deadlines',
    body: 'Closing dates are confirmed and monitored. We flag roles closing within seven days so you never miss a window.',
  },
  {
    icon: Mail,
    title: 'Smart Email Tracker',
    body: 'Forward your application confirmations to your unique Esquirely address and we log every update automatically.',
  },
  {
    icon: Bell,
    title: 'Deadline Alerts',
    body: 'Set alerts by practice area, firm tier, or role type. Receive a clean digest — weekly or instant.',
  },
  {
    icon: BarChart3,
    title: 'Application Dashboard',
    body: 'Track every application from submission to offer in one place. Kanban view. Timeline view. All yours.',
  },
  {
    icon: BookOpen,
    title: 'Scholarship Directory',
    body: 'Local and international scholarships for law students — LLM funding, bar course bursaries, prize competitions.',
  },
]

function getMonogram(name: string): string {
  return name
    .split(' ')
    .filter(w => w.length > 2 && !['&', 'and', 'LLP', 'LP', 'Co'].includes(w))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

// ─── Hero Illustration ────────────────────────────────────────────────────────
// Inline SVG — Nigerian legal scene, ink linework on cream
// Replace with your final illustration asset when ready
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 560 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', maxWidth: '560px', height: 'auto' }}
    >
      {/* ── Background geometric shapes ── */}
      <rect x="320" y="20" width="180" height="180" rx="2" fill="#E8E0D5" />
      <rect x="340" y="40" width="140" height="140" rx="2" fill="#F0EBE3" stroke="#0A2342" strokeWidth="1" />

      {/* ── Scales of justice (top right) ── */}
      <line x1="410" y1="60" x2="410" y2="130" stroke="#0A2342" strokeWidth="2" strokeLinecap="round" />
      <line x1="370" y1="80" x2="450" y2="80" stroke="#0A2342" strokeWidth="2" strokeLinecap="round" />
      <line x1="370" y1="80" x2="355" y2="110" stroke="#0A2342" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="450" y1="80" x2="465" y2="110" stroke="#0A2342" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M347 110 Q355 118 363 110" stroke="#0A2342" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M457 110 Q465 118 473 110" stroke="#0A2342" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="403" y="128" width="14" height="3" rx="1" fill="#0A2342" />

      {/* ── Halftone dot grid (decorative) ── */}
      {[0,1,2,3,4].map(row =>
        [0,1,2,3,4,5].map(col => (
          <circle
            key={`dot-${row}-${col}`}
            cx={330 + col * 18}
            cy={220 + row * 18}
            r="2"
            fill="#0A2342"
            opacity="0.15"
          />
        ))
      )}

      {/* ── Lagos skyline silhouette (bottom right) ── */}
      {/* Eko Bridge arch suggestion */}
      <path d="M300 420 Q350 370 400 420" stroke="#0A2342" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M310 420 Q360 380 410 420" stroke="#0A2342" strokeWidth="1" fill="none" opacity="0.2" />
      {/* Buildings */}
      <rect x="420" y="370" width="20" height="55" fill="#0A2342" opacity="0.12" />
      <rect x="445" y="355" width="16" height="70" fill="#0A2342" opacity="0.15" />
      <rect x="465" y="365" width="14" height="60" fill="#0A2342" opacity="0.12" />
      <rect x="483" y="380" width="18" height="45" fill="#0A2342" opacity="0.10" />
      <rect x="505" y="360" width="22" height="65" fill="#0A2342" opacity="0.15" />
      <rect x="531" y="375" width="15" height="50" fill="#0A2342" opacity="0.10" />
      {/* Ground line */}
      <line x1="300" y1="425" x2="560" y2="425" stroke="#0A2342" strokeWidth="1" opacity="0.2" />

      {/* ── Main figure: lawyer at desk ── */}
      {/* Desk */}
      <rect x="60" y="290" width="260" height="12" rx="2" fill="#0A2342" opacity="0.8" />
      <rect x="80" y="302" width="8" height="60" rx="2" fill="#0A2342" opacity="0.6" />
      <rect x="292" y="302" width="8" height="60" rx="2" fill="#0A2342" opacity="0.6" />

      {/* Laptop on desk */}
      <rect x="140" y="255" width="110" height="35" rx="2" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1.5" />
      <rect x="150" y="262" width="90" height="21" rx="1" fill="#E8E0D5" />
      {/* Screen lines suggesting content */}
      <line x1="157" y1="268" x2="220" y2="268" stroke="#0A2342" strokeWidth="1" opacity="0.4" />
      <line x1="157" y1="273" x2="210" y2="273" stroke="#0A2342" strokeWidth="1" opacity="0.4" />
      <line x1="157" y1="278" x2="225" y2="278" stroke="#0A2342" strokeWidth="1" opacity="0.4" />
      {/* Laptop base */}
      <path d="M135 290 L145 255 L245 255 L255 290 Z" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1.5" />

      {/* Books stacked (left of desk) */}
      <rect x="72" y="265" width="45" height="8" rx="1" fill="#0A2342" opacity="0.7" />
      <rect x="75" y="257" width="40" height="8" rx="1" fill="#0A2342" opacity="0.5" />
      <rect x="78" y="249" width="35" height="8" rx="1" fill="#0A2342" opacity="0.35" />

      {/* Document/paper on desk */}
      <rect x="270" y="265" width="35" height="25" rx="1" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1" />
      <line x1="275" y1="271" x2="298" y2="271" stroke="#0A2342" strokeWidth="0.8" opacity="0.5" />
      <line x1="275" y1="275" x2="300" y2="275" stroke="#0A2342" strokeWidth="0.8" opacity="0.5" />
      <line x1="275" y1="279" x2="295" y2="279" stroke="#0A2342" strokeWidth="0.8" opacity="0.5" />

      {/* Seated figure */}
      {/* Head */}
      <circle cx="195" cy="195" r="28" fill="#FAF7F2" stroke="#0A2342" strokeWidth="2" />
      {/* Hair */}
      <path d="M167 188 Q170 160 195 157 Q220 160 223 188" fill="#0A2342" />
      {/* Face features */}
      <circle cx="186" cy="193" r="3" fill="#0A2342" opacity="0.7" />
      <circle cx="204" cy="193" r="3" fill="#0A2342" opacity="0.7" />
      <path d="M187 206 Q195 212 203 206" stroke="#0A2342" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Collar/shirt */}
      <path d="M167 223 Q175 215 195 218 Q215 215 223 223 L230 255 L160 255 Z" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1.5" />
      {/* Tie */}
      <path d="M192 220 L188 245 L195 252 L202 245 L198 220 Z" fill="#0A2342" opacity="0.8" />

      {/* Shoulders / suit jacket */}
      <path d="M140 260 Q155 230 167 223 L160 255 Z" fill="#0A2342" opacity="0.15" stroke="#0A2342" strokeWidth="1.5" />
      <path d="M250 260 Q235 230 223 223 L230 255 Z" fill="#0A2342" opacity="0.15" stroke="#0A2342" strokeWidth="1.5" />

      {/* Arms reaching toward laptop */}
      <path d="M160 255 Q155 275 155 290" stroke="#0A2342" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M230 255 Q240 270 250 283" stroke="#0A2342" strokeWidth="8" strokeLinecap="round" fill="none" />

      {/* Hands */}
      <ellipse cx="155" cy="293" rx="9" ry="6" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1.5" />
      <ellipse cx="253" cy="286" rx="9" ry="6" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1.5" />

      {/* ── Floating UI cards (job listings) ── */}
      {/* Card 1 */}
      <rect x="20" y="80" width="130" height="60" rx="3" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1.2" />
      <rect x="28" y="89" width="50" height="5" rx="1" fill="#0A2342" opacity="0.7" />
      <rect x="28" y="99" width="80" height="4" rx="1" fill="#0A2342" opacity="0.3" />
      <rect x="28" y="108" width="65" height="4" rx="1" fill="#0A2342" opacity="0.3" />
      <rect x="28" y="122" width="30" height="10" rx="2" fill="#0A2342" opacity="0.8" />
      <rect x="63" y="122" width="40" height="10" rx="2" fill="#2D6A4F" opacity="0.8" />

      {/* Card 2 */}
      <rect x="390" y="200" width="130" height="60" rx="3" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1.2" />
      <rect x="398" y="209" width="55" height="5" rx="1" fill="#0A2342" opacity="0.7" />
      <rect x="398" y="219" width="85" height="4" rx="1" fill="#0A2342" opacity="0.3" />
      <rect x="398" y="228" width="70" height="4" rx="1" fill="#0A2342" opacity="0.3" />
      <rect x="398" y="242" width="35" height="10" rx="2" fill="#B5451B" opacity="0.8" />
      <rect x="438" y="242" width="45" height="10" rx="2" fill="#0A2342" opacity="0.5" />

      {/* Card 3 — small notification */}
      <rect x="20" y="185" width="110" height="45" rx="3" fill="#0A2342" />
      <rect x="28" y="194" width="45" height="4" rx="1" fill="#FAF7F2" opacity="0.9" />
      <rect x="28" y="203" width="70" height="3" rx="1" fill="#FAF7F2" opacity="0.5" />
      <rect x="28" y="210" width="55" height="3" rx="1" fill="#FAF7F2" opacity="0.5" />
      {/* Bell icon suggestion */}
      <circle cx="105" cy="200" r="8" fill="#FAF7F2" opacity="0.15" />
      <path d="M101 200 Q101 196 105 196 Q109 196 109 200 L110 204 L100 204 Z" fill="#FAF7F2" opacity="0.7" />

      {/* ── Connecting lines (dashed, suggesting data flow) ── */}
      <line x1="150" y1="140" x2="170" y2="195" stroke="#0A2342" strokeWidth="1" strokeDasharray="4 3" opacity="0.25" />
      <line x1="130" y1="185" x2="167" y2="210" stroke="#0A2342" strokeWidth="1" strokeDasharray="4 3" opacity="0.2" />
      <line x1="390" y1="230" x2="310" y2="265" stroke="#0A2342" strokeWidth="1" strokeDasharray="4 3" opacity="0.2" />

      {/* ── Decorative corner bracket (top left) ── */}
      <path d="M20 20 L20 50 M20 20 L50 20" stroke="#0A2342" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

      {/* ── Decorative corner bracket (bottom right) ── */}
      <path d="M540 460 L540 430 M540 460 L510 460" stroke="#0A2342" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: '#FAF7F2' }}>

        {/* ── TICKER ──────────────────────────────────────────────────────── */}
        <div style={{
          backgroundColor: '#0A2342',
          overflow: 'hidden',
          padding: '10px 0',
          borderBottom: '0.5px solid rgba(250,247,242,0.1)',
        }}>
          <div style={{ display: 'flex', width: 'max-content' }} className="animate-ticker">
            {[...Array(2)].map((_, i) => (
              <span key={i} style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: 'rgba(250,247,242,0.75)',
                whiteSpace: 'nowrap',
                paddingRight: '4rem',
              }}>
                {TICKER_ITEMS.map((item, j) => (
                  <span key={j}>
                    <span style={{ color: 'rgba(250,247,242,0.35)', marginRight: '0.75rem' }}>◆</span>
                    {item}
                    {'   '}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '80px 2rem 5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
          minHeight: '88vh',
        }}>
          {/* Left: text content */}
          <div>
            <p className="label-caps" style={{ color: '#0A2342', marginBottom: '1.5rem', opacity: 0.7 }}>
              Nigeria&rsquo;s Legal Career Platform
            </p>

            <h1 style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(2.8rem, 5vw, 5.5rem)',
              fontWeight: 900,
              color: '#1A1A1A',
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              marginBottom: '2rem',
            }}>
              Every legal<br />
              <em style={{ fontStyle: 'italic', color: '#0A2342' }}>opportunity</em><br />
              in Nigeria.
            </h1>

            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '1.05rem',
              color: '#4A4A4A',
              lineHeight: 1.7,
              maxWidth: '480px',
              marginBottom: '2.5rem',
            }}>
              Jobs, internships, vacation schemes, scholarships &mdash; sourced from
              Nigeria&rsquo;s leading firms, courts, and institutions. One platform. No noise.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
              <Link href="/jobs" className="btn-primary">
                Browse Opportunities
              </Link>
              <Link href="/auth/login" className="btn-outline">
                Create Free Account
              </Link>
            </div>

            {/* Stats bar */}
            <div style={{
              display: 'flex',
              gap: '0',
              borderTop: '0.5px solid #E8E0D5',
              flexWrap: 'wrap',
            }}>
              {STATS.map(({ value, label }, i) => (
                <div key={label} style={{
                  flex: '1 1 100px',
                  padding: '1.25rem 1.5rem 1.25rem 0',
                  borderRight: i < STATS.length - 1 ? '0.5px solid #E8E0D5' : 'none',
                  marginRight: i < STATS.length - 1 ? '1.5rem' : 0,
                }}>
                  <p style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    lineHeight: 1,
                    marginBottom: '0.25rem',
                  }}>
                    {value}
                  </p>
                  <p className="label-caps" style={{ color: '#4A4A4A', opacity: 0.7 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: illustration */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Background shape */}
            <div style={{
              position: 'absolute',
              inset: '5%',
              backgroundColor: '#F0EBE3',
              borderRadius: '4px',
              border: '0.5px solid #E8E0D5',
              zIndex: 0,
            }} />
            <div style={{ position: 'relative', zIndex: 1, padding: '2rem', width: '100%' }}>
              <HeroIllustration />
            </div>
          </div>
        </section>

        {/* ── FEATURED LISTINGS ──────────────────────────────────────────── */}
        <section style={{
          backgroundColor: '#F0EBE3',
          borderTop: '0.5px solid #E8E0D5',
          borderBottom: '0.5px solid #E8E0D5',
          padding: '6rem 2rem',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '3rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <p className="label-caps" style={{ color: '#0A2342', opacity: 0.7, marginBottom: '0.5rem' }}>
                  Latest Opportunities
                </p>
                <h2 style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  lineHeight: 1.1,
                }}>
                  Open right now
                </h2>
              </div>
              <Link href="/jobs" style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0A2342',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                View all listings <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1px',
              backgroundColor: '#E8E0D5',
              border: '0.5px solid #E8E0D5',
            }}>
              {FEATURED_LISTINGS.map((listing) => (
                <article
                  key={listing.id}
                  style={{
                    backgroundColor: '#FAF7F2',
                    padding: '1.75rem',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
                >
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="label-caps badge-new" style={{ padding: '2px 7px', borderRadius: '2px' }}>
                      {listing.type}
                    </span>
                    {listing.isVerified && (
                      <span className="label-caps badge-verified" style={{ padding: '2px 7px', borderRadius: '2px' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Verified
                      </span>
                    )}
                    {listing.isClosingSoon && (
                      <span className="label-caps badge-closing" style={{ padding: '2px 7px', borderRadius: '2px' }}>
                        Closing soon
                      </span>
                    )}
                  </div>

                  <Link href={`/jobs/${listing.id}`} style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    display: 'block',
                    marginBottom: '0.3rem',
                    lineHeight: 1.3,
                  }}>
                    {listing.title}
                  </Link>

                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#0A2342', marginBottom: '0.15rem' }}>
                    {listing.firm}
                    <span style={{ color: '#4A4A4A' }}> · {listing.tier}</span>
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '0.5px solid #E8E0D5',
                  }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: '#4A4A4A' }}>
                      {listing.location}
                    </span>
                    <span className="label-caps" style={{
                      fontSize: '0.6rem',
                      color: listing.isClosingSoon ? '#B5451B' : '#4A4A4A',
                      fontWeight: 600,
                    }}>
                      {listing.deadline === 'Rolling' ? 'Rolling' : `Closes ${listing.deadline}`}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FIRM DIRECTORY PREVIEW ──────────────────────────────────────── */}
        <section style={{ padding: '6rem 2rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '3rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <p className="label-caps" style={{ color: '#0A2342', opacity: 0.7, marginBottom: '0.5rem' }}>
                  Firm Directory
                </p>
                <h2 style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  lineHeight: 1.1,
                }}>
                  Leading Nigerian firms
                </h2>
              </div>
              <Link href="/firms" style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0A2342',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                Full directory <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1px',
              backgroundColor: '#E8E0D5',
              border: '0.5px solid #E8E0D5',
            }}>
              {TOP_FIRMS.map(firm => (
                <Link
                  key={firm.slug}
                  href={`/firms/${firm.slug}`}
                  style={{
                    backgroundColor: '#FAF7F2',
                    padding: '1.5rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: '#0A2342',
                    color: '#FAF7F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0,
                    borderRadius: '2px',
                  }}>
                    {getMonogram(firm.name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="label-caps" style={{ color: '#0A2342', opacity: 0.6, marginBottom: '0.2rem', fontSize: '0.58rem' }}>
                      {firm.tier}
                    </p>
                    <p style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {firm.name}
                    </p>
                    {firm.roles > 0 && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#2D6A4F', marginTop: '2px' }}>
                        {firm.roles} open role{firm.roles > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── APPLICATION TRACKER CTA ─────────────────────────────────────── */}
        <section style={{
          backgroundColor: '#F0EBE3',
          borderTop: '0.5px solid #E8E0D5',
          borderBottom: '0.5px solid #E8E0D5',
          padding: '6rem 2rem',
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
          }}>
            <div>
              <p className="label-caps" style={{ color: '#0A2342', opacity: 0.7, marginBottom: '1rem' }}>
                Application Tracker
              </p>
              <h2 style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                fontWeight: 700,
                color: '#1A1A1A',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
              }}>
                Never lose track<br />of where you stand.
              </h2>
              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.92rem',
                color: '#4A4A4A',
                lineHeight: 1.75,
                marginBottom: '2rem',
              }}>
                When you sign up, you receive a personal tracking address &mdash; for example,{' '}
                <code style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.82rem',
                  backgroundColor: '#E8E0D5',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  color: '#0A2342',
                }}>
                  chiamaka@mail.esquirely.app
                </code>
                . Forward any application confirmation to it and we automatically log the firm, role,
                and status. Every email update moves your tracker forward.
              </p>
              <Link href="/tracker" className="btn-primary">
                Set Up Your Tracker
              </Link>
            </div>

            {/* Tracker preview card */}
            <div style={{
              backgroundColor: '#FAF7F2',
              border: '0.5px solid #E8E0D5',
              borderRadius: '4px',
              padding: '1.5rem',
              boxShadow: '0 8px 40px rgba(10,35,66,0.07)',
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {['Applied', 'Interview', 'Offer'].map(col => (
                  <span key={col} className="label-caps" style={{
                    padding: '4px 10px',
                    backgroundColor: '#F0EBE3',
                    color: '#4A4A4A',
                    borderRadius: '2px',
                    fontSize: '0.6rem',
                  }}>
                    {col}
                  </span>
                ))}
              </div>

              {[
                { firm: 'Templars', role: '2025 Vacation Scheme', status: 'Interview I', statusColor: '#0A2342' },
                { firm: 'AELEX', role: 'Junior Associate', status: 'Applied', statusColor: '#4A4A4A' },
                { firm: 'Banwo & Ighodalo', role: 'Capital Markets', status: 'Offer', statusColor: '#2D6A4F' },
              ].map((app, i) => (
                <div key={i} style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: '#F0EBE3',
                  borderRadius: '2px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#1A1A1A' }}>
                      {app.firm}
                    </p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A' }}>
                      {app.role}
                    </p>
                  </div>
                  <span className="label-caps" style={{
                    fontSize: '0.58rem',
                    color: app.statusColor,
                    fontWeight: 700,
                  }}>
                    {app.status}
                  </span>
                </div>
              ))}

              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.68rem',
                color: '#4A4A4A',
                marginTop: '1rem',
                backgroundColor: '#F0EBE3',
                padding: '0.5rem 0.75rem',
                borderRadius: '2px',
              }}>
                → chiamaka@mail.esquirely.app
              </p>
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ───────────────────────────────────────────────── */}
        <section style={{ padding: '6rem 2rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ marginBottom: '3rem' }}>
              <p className="label-caps" style={{ color: '#0A2342', opacity: 0.7, marginBottom: '0.5rem' }}>
                Why Esquirely
              </p>
              <h2 style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: 700,
                color: '#1A1A1A',
                lineHeight: 1.1,
                maxWidth: '500px',
              }}>
                Built around how lawyers actually find work.
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1px',
              backgroundColor: '#E8E0D5',
              border: '0.5px solid #E8E0D5',
            }}>
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} style={{
                  backgroundColor: '#FAF7F2',
                  padding: '2rem',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EBE3')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#F0EBE3',
                    border: '0.5px solid #E8E0D5',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    color: '#0A2342',
                  }}>
                    <Icon size={18} />
                  </div>
                  <h3 style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '0.5rem',
                  }}>
                    {title}
                  </h3>
                  <p style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.85rem',
                    color: '#4A4A4A',
                    lineHeight: 1.7,
                  }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCHOLARSHIP STRIP ───────────────────────────────────────────── */}
        <section style={{
          backgroundColor: '#0A2342',
          padding: '5rem 2rem',
          borderTop: '0.5px solid rgba(250,247,242,0.1)',
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
          }}>
            <div>
              <p className="label-caps" style={{ color: 'rgba(250,247,242,0.45)', marginBottom: '0.75rem' }}>
                Scholarship Directory
              </p>
              <h2 style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 700,
                color: '#FAF7F2',
                lineHeight: 1.2,
                marginBottom: '0.5rem',
              }}>
                24 scholarships currently open.
              </h2>
              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.88rem',
                color: 'rgba(250,247,242,0.55)',
                lineHeight: 1.6,
              }}>
                LLM funding, bar course bursaries, and prize competitions &mdash; local and international.
              </p>
            </div>
            <Link href="/scholarships" style={{
              backgroundColor: 'transparent',
              color: '#FAF7F2',
              border: '0.5px solid rgba(250,247,242,0.3)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0.85rem 2rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s ease',
              whiteSpace: 'nowrap',
            }}>
              <GraduationCap size={15} />
              Browse Scholarships
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}

'@