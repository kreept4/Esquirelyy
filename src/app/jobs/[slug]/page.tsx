'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, MapPin, Clock, Bookmark, ExternalLink } from 'lucide-react'

const ALL_LISTINGS = [
  { id: '1', slug: 'aluko-associate-banking', title: 'Associate, Banking & Finance', employer: 'Aluko & Oyebode', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-06-30', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Banking & Finance', 'Capital Markets'], about: 'Aluko & Oyebode is one of Nigeria\'s foremost full-service commercial law firms, with offices in Lagos, Abuja, and Port Harcourt. The firm advises leading corporates, financial institutions, and government bodies across the full spectrum of commercial practice.', roleDesc: 'The Banking & Finance team is seeking an Associate to support on financing transactions, regulatory advisory work, and capital markets mandates. The successful candidate will work directly with partners on live transactions from day one.', requirements: ['LL.B and B.L with strong academic record', '0–3 years post-call experience', 'Prior banking and finance exposure preferred', 'Excellent drafting and research skills'], applyEmail: 'careers@aluko-oyebode.com' },
  { id: '2', slug: 'templars-vacation-2026', title: '2026 Vacation Scheme', employer: 'Templars', sector: 'law_firm', tier: 'Tier 1', type: 'vacation_scheme', level: 'student', location: 'Lagos · Abuja', deadline: '2026-06-15', isVerified: true, isClosingSoon: true, isRolling: false, practiceAreas: ['Corporate', 'Energy'], about: 'Templars is a leading pan-African law firm with offices across Nigeria, Ghana, and Kenya. The firm is consistently ranked among Nigeria\'s top tier practices across corporate, energy, and dispute resolution.', roleDesc: 'The 2026 Vacation Scheme offers penultimate and final-year law students structured exposure to the firm\'s practice groups over a two-week placement. Participants rotate across departments and receive mentoring from senior associates and partners.', requirements: ['Penultimate or final-year LL.B student', 'Minimum 2.1 degree classification or equivalent', 'Strong written communication skills', 'Genuine interest in commercial law'], applyEmail: 'careers@templars-law.com' },
  { id: '3', slug: 'aelex-dispute-pupil', title: 'Dispute Resolution Pupil', employer: 'AELEX', sector: 'law_firm', tier: 'Tier 1', type: 'pupillage', level: 'junior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Dispute Resolution', 'Arbitration'], about: 'AELEX is a full-service commercial law firm with a market-leading dispute resolution practice. The firm handles high-value commercial litigation, international arbitration, and regulatory disputes for blue-chip clients across multiple sectors.', roleDesc: 'AELEX accepts applications for pupillage on a rolling basis. Pupils work closely with the firm\'s dispute resolution team, gaining exposure to court proceedings, arbitration hearings, and client advisory work across commercial litigation and ADR.', requirements: ['LL.B and B.L with minimum Second Class Upper', 'Strong academic background in procedural law', 'Excellent oral and written advocacy skills', 'Ability to manage multiple matters simultaneously'], applyEmail: 'info@aelex.com' },
  { id: '4', slug: 'olaniwun-nysc-trainee', title: 'Legal Trainee (NYSC)', employer: 'Olaniwun Ajayi LP', sector: 'law_firm', tier: 'Tier 1', type: 'internship', level: 'nysc', location: 'Lagos', deadline: '2026-06-20', isVerified: false, isClosingSoon: false, isRolling: false, practiceAreas: ['Corporate', 'Tax'], about: 'Olaniwun Ajayi LP is one of Nigeria\'s oldest and most respected full-service commercial law firms, with deep expertise in corporate, tax, energy, and dispute resolution matters.', roleDesc: 'NYSC corps members are accepted into the firm\'s legal trainee programme, working alongside associates and partners on live client matters. Trainees gain exposure to corporate transactions, tax advisory, and regulatory compliance work.', requirements: ['Currently serving NYSC corps member', 'LL.B and B.L with strong academic record', 'Interest in transactional legal practice'], applyEmail: 'recruitment@olaniwunajayi.net' },
  { id: '5', slug: 'aelex-energy-associate', title: 'Junior Associate, Energy', employer: 'AELEX', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-10', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Energy', 'Dispute Resolution'], about: 'AELEX has one of the most active energy law practices in Nigeria, advising upstream and midstream operators, government agencies, and international investors on a broad range of energy sector matters.', roleDesc: 'The energy team is looking for a junior associate to support on upstream transactions, regulatory advisory, and energy-related dispute resolution. The role involves significant client interaction and requires someone who can hit the ground running.', requirements: ['LL.B and B.L', '0–3 years PQE', 'Interest in the Nigerian oil and gas sector', 'Strong drafting and analytical skills'], applyEmail: 'info@aelex.com' },
  { id: '6', slug: 'banwo-capital-markets', title: 'Capital Markets Associate', employer: 'Banwo & Ighodalo', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-07-05', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Capital Markets', 'Corporate'], about: 'Banwo & Ighodalo is a top-tier Nigerian law firm with a market-leading capital markets practice. The firm advises issuers, underwriters, and regulators on debt and equity transactions across the Nigerian capital markets.', roleDesc: 'Seeking a mid-level associate to join the capital markets team, working on public offerings, bond issuances, regulatory filings with the SEC, and advisory mandates for financial institutions.', requirements: ['LL.B and B.L', '3–6 years PQE in capital markets or corporate law', 'SEC regulatory experience an advantage', 'Strong transaction management skills'], applyEmail: 'hr@banwo-ighodalo.com' },
  { id: '7', slug: 'g-elias-telecoms', title: 'Associate, Technology & Telecoms', employer: 'G. Elias & Co', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-20', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Telecommunications', 'Corporate'], about: 'G. Elias & Co is a Tier 1 Nigerian law firm with a strong TMT practice, advising telecoms operators, technology companies, and regulators on licensing, regulatory compliance, and commercial transactions.', roleDesc: 'The TMT team is hiring a junior associate to support on telecoms regulatory matters, technology contracts, and data protection advisory. The role suits someone with a genuine interest in the intersection of law and technology.', requirements: ['LL.B and B.L', '0–3 years PQE', 'Interest in technology and telecoms law', 'Familiarity with NCC regulatory framework an advantage'], applyEmail: 'info@gelias.com' },
  { id: '8', slug: 'streamsowers-arbitration-intern', title: 'Arbitration Intern', employer: 'Streamsowers & Köhn', sector: 'law_firm', tier: 'Tier 1', type: 'internship', level: 'student', location: 'Lagos', deadline: '2026-06-25', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Arbitration', 'Dispute Resolution'], about: 'Streamsowers & Köhn is a leading dispute resolution boutique, consistently ranked among Nigeria\'s top arbitration practices. The firm handles high-value domestic and international arbitration across energy, construction, and commercial disputes.', roleDesc: 'Internship placement within the arbitration practice group, offering exposure to case preparation, legal research, hearing logistics, and pleadings drafting across active arbitration matters.', requirements: ['Law student in penultimate or final year', 'Strong research and writing skills', 'Academic or extracurricular interest in dispute resolution'], applyEmail: 'info@sklaw.com.ng' },
  { id: '20', slug: 'access-bank-legal-counsel', title: 'Legal Counsel, Retail Banking', employer: 'Access Bank', sector: 'banking', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-31', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Banking & Finance', 'Regulatory'], about: 'Access Bank is one of Africa\'s largest banks by assets, with operations across 20+ countries. The legal team supports all business lines including retail, corporate, investment banking, and digital banking.', roleDesc: 'The in-house legal team is looking for a counsel to support the retail banking business with contract review, regulatory compliance advice, and dispute management. The role reports to the Head of Legal.', requirements: ['LL.B and B.L', '1–3 years PQE, preferably in financial services', 'Strong understanding of CBN regulations', 'Ability to manage high volumes of work under pressure'], applyEmail: 'careers@accessbankplc.com' },
  { id: '21', slug: 'zenith-bank-compliance-counsel', title: 'Compliance & Legal Officer', employer: 'Zenith Bank', sector: 'banking', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Regulatory', 'Banking & Finance'], about: 'Zenith Bank is one of Nigeria\'s systemically important financial institutions, with a large in-house legal and compliance function covering the full range of banking, capital markets, and regulatory matters.', roleDesc: 'Seeking a mid-level legal and compliance officer to support the bank\'s regulatory affairs function, including CBN examinations, AML/CFT compliance, and internal policy advisory. Rolling applications accepted.', requirements: ['LL.B and B.L', '3–6 years PQE with compliance or regulatory focus', 'CAMS certification an advantage', 'Strong knowledge of BOFIA and CBN regulations'], applyEmail: 'careers@zenithbank.com' },
  { id: '40', slug: 'flutterwave-legal-counsel', title: 'Legal Counsel, Payments', employer: 'Flutterwave', sector: 'fintech', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-07-15', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Regulatory', 'Banking & Finance'], about: 'Flutterwave is Africa\'s leading payments infrastructure company, processing billions of dollars in transactions across 34 African countries. The legal team operates across multiple jurisdictions covering payments regulation, commercial contracts, and corporate governance.', roleDesc: 'The legal team is hiring a payments-focused counsel to support licensing applications, CBN regulatory engagement, commercial contract negotiation, and cross-border payments compliance. The role is high-impact and fast-paced.', requirements: ['LL.B and B.L', '3–6 years PQE with payments or fintech regulatory experience', 'Multi-jurisdictional exposure an advantage', 'Strong commercial instincts'], applyEmail: 'legal@flutterwave.com' },
  { id: '41', slug: 'paystack-compliance-counsel', title: 'Compliance Counsel', employer: 'Paystack', sector: 'fintech', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Regulatory', 'Banking & Finance'], about: 'Paystack (a Stripe company) is one of Nigeria\'s most prominent fintech businesses, processing payments for thousands of businesses across Africa. The compliance function works closely with the CBN, NIBSS, and other regulators.', roleDesc: 'Seeking a compliance counsel to support day-to-day regulatory compliance operations, policy development, and CBN engagement. Rolling applications. Strong growth trajectory for the right candidate.', requirements: ['LL.B and B.L', '1–3 years PQE with compliance focus', 'Familiarity with CBN Payment System Vision 2025', 'Detail-oriented with strong written communication'], applyEmail: 'jobs@paystack.com' },
  { id: '30', slug: 'seplat-energy-legal-counsel', title: 'Counsel, Upstream Operations', employer: 'Seplat Energy', sector: 'energy', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-08-30', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Energy', 'Corporate'], about: 'Seplat Energy is a leading Nigerian independent oil and gas company listed on both the Nigerian Exchange Group and the London Stock Exchange. The in-house legal team covers upstream operations, JV management, regulatory affairs, and capital markets.', roleDesc: 'The upstream legal team requires a mid-level counsel to handle JOA matters, JV governance, petroleum licensing, and regulatory compliance for producing assets. Experience with NUPRC regulatory framework is essential.', requirements: ['LL.B and B.L', '3–6 years PQE with upstream oil and gas experience', 'Familiarity with PSCs and JOAs', 'NUPRC regulatory exposure preferred'], applyEmail: 'careers@seplatenergy.com' },
  { id: '53', slug: 'sec-ng-legal-officer', title: 'Legal Officer II', employer: 'Securities & Exchange Commission', sector: 'other', tier: null, type: 'job', level: 'junior', location: 'Abuja', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Capital Markets', 'Regulatory'], about: 'The Securities and Exchange Commission (SEC) Nigeria is the apex regulator of the Nigerian capital market. The legal directorate handles enforcement actions, regulatory policy, market surveillance, and legislative advisory.', roleDesc: 'The SEC is recruiting Legal Officers at Grade Level II to join the legal and enforcement directorate. Responsibilities include regulatory investigations, enforcement proceedings, policy drafting, and stakeholder advisory. Applications accepted on a rolling basis.', requirements: ['LL.B and B.L', '0–3 years PQE or recent call to bar', 'Interest in securities regulation and enforcement', 'Strong analytical and report-writing skills'], applyEmail: 'recruitment@sec.gov.ng' },
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
  junior: 'Junior (0–3 yrs PQE)',
  mid: 'Mid-level (3–6 yrs PQE)',
  senior: 'Senior (6+ yrs PQE)',
}

export default function JobDetailPage({ params }: { params: { slug: string } }) {
  const listing = ALL_LISTINGS.find(l => l.slug === params.slug)
  if (!listing) notFound()

  const accent = SECTOR_ACCENT[listing.sector] || '#3B3B3B'

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '80px', minHeight: '100vh' }}>

        {/* Back nav */}
        <div style={{ borderBottom: '0.5px solid #E8E0D5', padding: '1rem 2rem', backgroundColor: '#F0EBE3' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Link href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A4A4A', textDecoration: 'none' }}>
              <ArrowLeft size={13} /> Back to Listings
            </Link>
          </div>
        </div>

        {/* Header */}
        <div style={{ borderBottom: '0.5px solid #E8E0D5', borderLeft: `4px solid ${accent}`, padding: '2.5rem 2rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Meta row */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' as const }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: accent }}>
                {SECTOR_LABELS[listing.sector]}
              </span>
              {listing.tier && (
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4A4A4A' }}>
                  {listing.tier}
                </span>
              )}
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4A4A4A' }}>
                {TYPE_LABELS[listing.type] || listing.type}
              </span>
              {listing.isVerified && (
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#2D6A4F' }}>
                  Verified
                </span>
              )}
              {listing.isClosingSoon && (
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#B5451B' }}>
                  Closing Soon
                </span>
              )}
            </div>

            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: '0.4rem' }}>
              {listing.title}
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#0A2342', marginBottom: '1rem' }}>
              {listing.employer}
            </p>

            {/* Quick facts */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' as const, marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4A4A4A' }}>
                <MapPin size={12} /> {listing.location}
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4A4A4A' }}>
                {LEVEL_LABELS[listing.level]}
              </span>
              {listing.isRolling ? (
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#4A4A4A' }}>
                  Rolling applications
                </span>
              ) : listing.deadline ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: listing.isClosingSoon ? '#B5451B' : '#4A4A4A', fontWeight: listing.isClosingSoon ? 600 : 400 }}>
                  <Clock size={12} />
                  Deadline: {new Date(listing.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              ) : null}
            </div>

            {/* Practice areas */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
              {listing.practiceAreas.map(area => (
                <span key={area} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 500, padding: '3px 10px', backgroundColor: '#F0EBE3', border: '0.5px solid #E8E0D5', borderRadius: '2px', color: '#4A4A4A' }}>
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr min(280px, 35%)', gap: '3rem', alignItems: 'start' }}>

          {/* Left: content */}
          <div>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.75rem' }}>
                About the Organisation
              </h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1A1A1A', lineHeight: 1.7 }}>
                {listing.about}
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.75rem' }}>
                The Role
              </h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1A1A1A', lineHeight: 1.7 }}>
                {listing.roleDesc}
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.75rem' }}>
                Requirements
              </h2>
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

          {/* Right: apply card */}
          <div style={{ position: 'sticky' as const, top: '96px' }}>
            <div style={{ border: '0.5px solid #E8E0D5', borderTop: `3px solid ${accent}`, backgroundColor: '#FFFFFF', padding: '1.5rem' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '1rem' }}>
                Apply for this role
              </p>

              href={`mailto:${listing.applyEmail}?subject=Application: ${listing.title}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  width: '100%', padding: '0.75rem', boxSizing: 'border-box' as const,
                  backgroundColor: '#0A2342', color: '#FAF7F2',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  textDecoration: 'none', borderRadius: '2px', marginBottom: '0.75rem',
                }}
              >
                <ExternalLink size={13} /> Apply via Email
              </a>

              <button
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  width: '100%', padding: '0.75rem', boxSizing: 'border-box' as const,
                  backgroundColor: 'transparent', color: '#1A1A1A',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  border: '0.5px solid #E8E0D5', borderRadius: '2px', cursor: 'pointer',
                }}
              >
                <Bookmark size={13} /> Save Role
              </button>

              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '0.5px solid #E8E0D5' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', lineHeight: 1.6 }}>
                  Send your CV and cover letter to{' '}
                  <a href={`mailto:${listing.applyEmail}`} style={{ color: '#0A2342', fontWeight: 600 }}>
                    {listing.applyEmail}
                  </a>
                  {'. '}
                  {listing.isRolling
                    ? 'Applications are reviewed on a rolling basis.'
                    : listing.deadline
                    ? `Deadline: ${new Date(listing.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}.`
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
