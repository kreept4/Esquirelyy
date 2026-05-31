'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, MapPin, Clock, Bookmark, ExternalLink } from 'lucide-react'

const ALL_LISTINGS = [
  { id: '1', slug: 'aluko-associate-banking', title: 'Associate, Banking & Finance', employer: 'Aluko & Oyebode', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-06-30', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Banking & Finance', 'Capital Markets'], about: 'Aluko & Oyebode is one of Nigeria\'s foremost full-service commercial law firms, with offices in Lagos, Abuja, and Port Harcourt.', roleDesc: 'The Banking & Finance team is seeking an Associate to support on financing transactions, regulatory advisory work, and capital markets mandates.', requirements: ['LL.B and B.L with strong academic record', '0-3 years post-call experience', 'Prior banking and finance exposure preferred', 'Excellent drafting and research skills'], applyEmail: 'careers@aluko-oyebode.com' },
  { id: '2', slug: 'templars-vacation-2026', title: '2026 Vacation Scheme', employer: 'Templars', sector: 'law_firm', tier: 'Tier 1', type: 'vacation_scheme', level: 'student', location: 'Lagos - Abuja', deadline: '2026-06-15', isVerified: true, isClosingSoon: true, isRolling: false, practiceAreas: ['Corporate', 'Energy'], about: 'Templars is a leading pan-African law firm with offices across Nigeria, Ghana, and Kenya.', roleDesc: 'The 2026 Vacation Scheme offers penultimate and final-year law students structured exposure to the firm\'s practice groups over a two-week placement.', requirements: ['Penultimate or final-year LL.B student', 'Minimum 2.1 degree classification or equivalent', 'Strong written communication skills'], applyEmail: 'careers@templars-law.com' },
  { id: '3', slug: 'aelex-dispute-pupil', title: 'Dispute Resolution Pupil', employer: 'AELEX', sector: 'law_firm', tier: 'Tier 1', type: 'pupillage', level: 'junior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Dispute Resolution', 'Arbitration'], about: 'AELEX is a full-service commercial law firm with a market-leading dispute resolution practice.', roleDesc: 'AELEX accepts applications for pupillage on a rolling basis. Pupils work closely with the dispute resolution team.', requirements: ['LL.B and B.L with minimum Second Class Upper', 'Strong academic background in procedural law', 'Excellent oral and written advocacy skills'], applyEmail: 'info@aelex.com' },
  { id: '4', slug: 'olaniwun-nysc-trainee', title: 'Legal Trainee (NYSC)', employer: 'Olaniwun Ajayi LP', sector: 'law_firm', tier: 'Tier 1', type: 'internship', level: 'nysc', location: 'Lagos', deadline: '2026-06-20', isVerified: false, isClosingSoon: false, isRolling: false, practiceAreas: ['Corporate', 'Tax'], about: 'Olaniwun Ajayi LP is one of Nigeria\'s oldest and most respected full-service commercial law firms.', roleDesc: 'NYSC corps members are accepted into the firm\'s legal trainee programme, working alongside associates and partners on live client matters.', requirements: ['Currently serving NYSC corps member', 'LL.B and B.L with strong academic record', 'Interest in transactional legal practice'], applyEmail: 'recruitment@olaniwunajayi.net' },
  { id: '5', slug: 'aelex-energy-associate', title: 'Junior Associate, Energy', employer: 'AELEX', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-10', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Energy', 'Dispute Resolution'], about: 'AELEX has one of the most active energy law practices in Nigeria.', roleDesc: 'The energy team is looking for a junior associate to support on upstream transactions and regulatory advisory.', requirements: ['LL.B and B.L', '0-3 years PQE', 'Interest in the Nigerian oil and gas sector', 'Strong drafting and analytical skills'], applyEmail: 'info@aelex.com' },
  { id: '6', slug: 'banwo-capital-markets', title: 'Capital Markets Associate', employer: 'Banwo & Ighodalo', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-07-05', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Capital Markets', 'Corporate'], about: 'Banwo & Ighodalo is a top-tier Nigerian law firm with a market-leading capital markets practice.', roleDesc: 'Seeking a mid-level associate to join the capital markets team, working on public offerings and bond issuances.', requirements: ['LL.B and B.L', '3-6 years PQE in capital markets or corporate law', 'SEC regulatory experience an advantage'], applyEmail: 'hr@banwo-ighodalo.com' },
  { id: '20', slug: 'access-bank-legal-counsel', title: 'Legal Counsel, Retail Banking', employer: 'Access Bank', sector: 'banking', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-31', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Banking & Finance', 'Regulatory'], about: 'Access Bank is one of Africa\'s largest banks by assets, with operations across 20+ countries.', roleDesc: 'The in-house legal team is looking for a counsel to support the retail banking business with contract review and regulatory compliance advice.', requirements: ['LL.B and B.L', '1-3 years PQE, preferably in financial services', 'Strong understanding of CBN regulations'], applyEmail: 'careers@accessbankplc.com' },
  { id: '40', slug: 'flutterwave-legal-counsel', title: 'Legal Counsel, Payments', employer: 'Flutterwave', sector: 'fintech', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-07-15', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Regulatory', 'Banking & Finance'], about: 'Flutterwave is Africa\'s leading payments infrastructure company, processing billions of dollars in transactions across 34 African countries.', roleDesc: 'The legal team is hiring a payments-focused counsel to support licensing applications and CBN regulatory engagement.', requirements: ['LL.B and B.L', '3-6 years PQE with payments or fintech regulatory experience', 'Strong commercial instincts'], applyEmail: 'legal@flutterwave.com' },
  { id: '30', slug: 'seplat-energy-legal-counsel', title: 'Counsel, Upstream Operations', employer: 'Seplat Energy', sector: 'energy', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-08-30', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Energy', 'Corporate'], about: 'Seplat Energy is a leading Nigerian independent oil and gas company listed on both the Nigerian Exchange Group and the London Stock Exchange.', roleDesc: 'The upstream legal team requires a mid-level counsel to handle JOA matters, JV governance, and petroleum licensing.', requirements: ['LL.B and B.L', '3-6 years PQE with upstream oil and gas experience', 'Familiarity with PSCs and JOAs'], applyEmail: 'careers@seplatenergy.com' },
  { id: '53', slug: 'sec-ng-legal-officer', title: 'Legal Officer II', employer: 'Securities & Exchange Commission', sector: 'other', tier: null, type: 'job', level: 'junior', location: 'Abuja', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Capital Markets', 'Regulatory'], about: 'The Securities and Exchange Commission Nigeria is the apex regulator of the Nigerian capital market.', roleDesc: 'The SEC is recruiting Legal Officers to join the legal and enforcement directorate on a rolling basis.', requirements: ['LL.B and B.L', '0-3 years PQE or recent call to bar', 'Interest in securities regulation and enforcement'], applyEmail: 'recruitment@sec.gov.ng' },
]

const SECTOR_ACCENT: Record<string, string> = {
  law_firm: '#0A2342',
  banking: '#0A4A8C',
  energy: '#7A3B00',
  fintech: '#0E5C3A',
  other: '#3B3B3B',
}

const SECTOR_LABELS: Record<string, string> = {
  law_firm: 'Law Firm',
  banking: 'Banking',
  energy: 'Energy',
  fintech: 'Tech & Fintech',
  other: 'Industry',
}

const TYPE_LABELS: Record<string, string> = {
  job: 'Full-time',
  internship: 'Internship',
  vacation_scheme: 'Vacation Scheme',
  pupillage: 'Pupillage',
}

const LEVEL_LABELS: Record<string, string> = {
  student: 'Student',
  nysc: 'NYSC',
  junior: 'Junior (0-3 yrs PQE)',
  mid: 'Mid-level (3-6 yrs PQE)',
  senior: 'Senior (6+ yrs PQE)',
}

export default function JobDetailPage({ params }: { params: { slug: string } }) {
  const listing = ALL_LISTINGS.find(l => l.slug === params.slug)
  if (!listing) return notFound()

  const accent = SECTOR_ACCENT[listing.sector] || '#3B3B3B'
  const applyHref = 'mailto:' + listing.applyEmail + '?subject=Application: ' + listing.title

  return (
    <div>
      <Navbar />
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '80px', minHeight: '100vh' }}>
        <div style={{ borderBottom: '0.5px solid #E8E0D5', padding: '1rem 2rem', backgroundColor: '#F0EBE3' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Link href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A4A4A', textDecoration: 'none' }}>
              <ArrowLeft size={13} /> Back to Listings
            </Link>
          </div>
        </div>

        <div style={{ borderBottom: '0.5px solid #E8E0D5', borderLeft: '4px solid ' + accent, padding: '2.5rem 2rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' as const }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: accent }}>{SECTOR_LABELS[listing.sector]}</span>
              {listing.tier && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4A4A4A' }}>{listing.tier}</span>}
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4A4A4A' }}>{TYPE_LABELS[listing.type] || listing.type}</span>
              {listing.isVerified && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#2D6A4F' }}>Verified</span>}
              {listing.isClosingSoon && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#B5451B' }}>Closing Soon</span>}
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: '0.4rem' }}>{listing.title}</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#0A2342', marginBottom: '1rem' }}>{listing.employer}</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' as const, marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4A4A4A' }}><MapPin size={12} /> {listing.location}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4A4A4A' }}>{LEVEL_LABELS[listing.level]}</span>
              {listing.isRolling
                ? <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#4A4A4A' }}>Rolling applications</span>
                : listing.deadline
                ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: listing.isClosingSoon ? '#B5451B' : '#4A4A4A' }}><Clock size={12} />Deadline: {new Date(listing.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                : null}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
              {listing.practiceAreas.map(area => (
                <span key={area} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 500, padding: '3px 10px', backgroundColor: '#F0EBE3', border: '0.5px solid #E8E0D5', borderRadius: '2px', color: '#4A4A4A' }}>{area}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr min(280px, 35%)', gap: '3rem', alignItems: 'start' }}>
          <div>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.75rem' }}>About the Organisation</h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1A1A1A', lineHeight: 1.7 }}>{listing.about}</p>
            </section>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.75rem' }}>The Role</h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1A1A1A', lineHeight: 1.7 }}>{listing.roleDesc}</p>
            </section>
            <section>
              <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.75rem' }}>Requirements</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
                {listing.requirements.map((req, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1A1A1A', lineHeight: 1.5 }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: accent, flexShrink: 0, marginTop: '8px' }} />
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div style={{ position: 'sticky' as const, top: '96px' }}>
            <div style={{ border: '0.5px solid #E8E0D5', borderTop: '3px solid ' + accent, backgroundColor: '#FFFFFF', padding: '1.5rem' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '1rem' }}>Apply for this role</p>
              <a href={applyHref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '0.75rem', boxSizing: 'border-box' as const, backgroundColor: '#0A2342', color: '#FAF7F2', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '2px', marginBottom: '0.75rem' }}>
                <ExternalLink size={13} /> Apply via Email
              </a>
              <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '0.75rem', boxSizing: 'border-box' as const, backgroundColor: 'transparent', color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, border: '0.5px solid #E8E0D5', borderRadius: '2px', cursor: 'pointer' }}>
                <Bookmark size={13} /> Save Role
              </button>
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '0.5px solid #E8E0D5' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', lineHeight: 1.6 }}>
                  Send your CV and cover letter to <a href={'mailto:' + listing.applyEmail} style={{ color: '#0A2342', fontWeight: 600 }}>{listing.applyEmail}</a>.{' '}
                  {listing.isRolling ? 'Applications are reviewed on a rolling basis.' : listing.deadline ? 'Deadline: ' + new Date(listing.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) + '.' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
