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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const tickerText = TICKER_ITEMS.join('   ·   ')

  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: '#FAF7F2' }}>

        {/* ── TICKER ─────────────────────────────────────────────────────── */}
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

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section style={{
          minHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: '80px',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '120px 2rem 4rem',
        }}>
          {/* Editorial label */}
          <p className="label-caps" style={{ color: '#0A2342', marginBottom: '1.5rem', opacity: 0.7 }}>
            Nigeria's Legal Career Platform
          </p>

          {/* Hero headline */}
          <h1 style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: 'clamp(2.8rem, 7vw, 6rem)',
            fontWeight: 900,
            color: '#1A1A1A',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
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
            maxWidth: '520px',
            marginBottom: '2.5rem',
          }}>
            Jobs, internships, vacation schemes, scholarships — sourced from Nigeria's leading firms,
            courts, and institutions. One platform. No noise.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
            marginTop: '5rem',
            borderTop: '0.5px solid #E8E0D5',
            flexWrap: 'wrap',
          }}>
            {STATS.map(({ value, label }, i) => (
              <div key={label} style={{
                flex: '1 1 120px',
                padding: '1.5rem 2rem 1.5rem 0',
                borderRight: i < STATS.length - 1 ? '0.5px solid #E8E0D5' : 'none',
                marginRight: i < STATS.length - 1 ? '2rem' : 0,
              }}>
                <p style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '2rem',
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

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1px',
              backgroundColor: '#E8E0D5',
              border: '0.5px solid #E8E0D5',
            }}>
              {FEATURED_LISTINGS.map((listing, i) => (
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
                  {/* Badges */}
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

                  {/* Title */}
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

                  {/* Firm */}
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#0A2342', marginBottom: '0.15rem' }}>
                    {listing.firm}
                    <span style={{ color: '#4A4A4A' }}> · {listing.tier}</span>
                  </p>

                  {/* Meta */}
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

        {/* ── FIRM DIRECTORY PREVIEW ─────────────────────────────────────── */}
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
                  {/* Monogram */}
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

        {/* ── APPLICATION TRACKER CTA ────────────────────────────────────── */}
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
                When you sign up, you receive a personal tracking address — for example,{' '}
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
                . Forward any application confirmation to it and we automatically log the firm, role, and status.
                Every email update moves your tracker forward.
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
              {/* Mini kanban header */}
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

              {/* Mock application rows */}
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

        {/* ── FEATURES GRID ─────────────────────────────────────────────── */}
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
              {FEATURES.map(({ icon: Icon, title, body }, i) => (
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

        {/* ── SCHOLARSHIP STRIP ─────────────────────────────────────────── */}
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
                LLM funding, bar course bursaries, and prize competitions — local and international.
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
