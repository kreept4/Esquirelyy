'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, SlidersHorizontal, X, Bookmark, MapPin, Clock, ChevronRight } from 'lucide-react'

const ALL_LISTINGS = [
  { id: '1', slug: 'aluko-associate-banking', title: 'Associate, Banking & Finance', employer: 'Aluko & Oyebode', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-06-30', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '2', slug: 'templars-vacation-2026', title: '2026 Vacation Scheme', employer: 'Templars', sector: 'law_firm', tier: 'Tier 1', type: 'vacation_scheme', level: 'student', location: 'Lagos · Abuja', deadline: '2026-06-15', isVerified: true, isClosingSoon: true, isRolling: false },
  { id: '3', slug: 'aelex-dispute-pupil', title: 'Dispute Resolution Pupil', employer: 'AELEX', sector: 'law_firm', tier: 'Tier 1', type: 'pupillage', level: 'junior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true },
  { id: '4', slug: 'olaniwun-nysc-trainee', title: 'Legal Trainee (NYSC)', employer: 'Olaniwun Ajayi LP', sector: 'law_firm', tier: 'Tier 1', type: 'internship', level: 'nysc', location: 'Lagos', deadline: '2026-06-20', isVerified: false, isClosingSoon: false, isRolling: false },
  { id: '5', slug: 'aelex-energy-associate', title: 'Junior Associate, Energy', employer: 'AELEX', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-10', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '6', slug: 'banwo-capital-markets', title: 'Capital Markets Associate', employer: 'Banwo & Ighodalo', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-07-05', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '7', slug: 'g-elias-telecoms', title: 'Associate, Technology & Telecoms', employer: 'G. Elias & Co', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-20', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '8', slug: 'streamsowers-arbitration-intern', title: 'Arbitration Intern', employer: 'Streamsowers & Köhn', sector: 'law_firm', tier: 'Tier 1', type: 'internship', level: 'student', location: 'Lagos', deadline: '2026-06-25', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '9', slug: 'stl-public-law-abuja', title: 'Public Law Associate', employer: 'STL Attorneys', sector: 'law_firm', tier: 'Tier 2', type: 'job', level: 'junior', location: 'Abuja', deadline: '2026-07-15', isVerified: false, isClosingSoon: false, isRolling: false },
  { id: '10', slug: 'olajide-tax-associate', title: 'Tax Associate', employer: 'Olajide Oyewole LLP', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'mid', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true },
  { id: '11', slug: 'kenna-partners-senior-associate', title: 'Senior Associate, Corporate', employer: 'Kenna Partners', sector: 'law_firm', tier: 'Tier 2', type: 'job', level: 'senior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true },
  { id: '12', slug: 'jackson-etti-employment-assoc', title: 'Employment Law Associate', employer: 'Jackson Etti & Edu', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-08-01', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '13', slug: 'udo-udoma-real-estate', title: 'Real Estate Associate', employer: 'Udo Udoma & Belo-Osagie', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'mid', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true },
  { id: '20', slug: 'access-bank-legal-counsel', title: 'Legal Counsel, Retail Banking', employer: 'Access Bank', sector: 'banking', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-31', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '21', slug: 'zenith-bank-compliance-counsel', title: 'Compliance & Legal Officer', employer: 'Zenith Bank', sector: 'banking', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true },
  { id: '22', slug: 'gtb-corporate-counsel', title: 'Corporate Affairs Counsel', employer: 'Guaranty Trust Bank', sector: 'banking', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-08-15', isVerified: false, isClosingSoon: false, isRolling: false },
  { id: '23', slug: 'stanbic-ibtc-legal-analyst', title: 'Legal & Compliance Analyst', employer: 'Stanbic IBTC', sector: 'banking', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-20', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '24', slug: 'cbn-legal-officer', title: 'Legal Officer', employer: 'Central Bank of Nigeria', sector: 'banking', tier: null, type: 'job', level: 'junior', location: 'Abuja', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true },
  { id: '30', slug: 'seplat-energy-legal-counsel', title: 'Counsel, Upstream Operations', employer: 'Seplat Energy', sector: 'energy', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-08-30', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '31', slug: 'totalenergies-legal-ng', title: 'Junior Legal Counsel, Exploration', employer: 'TotalEnergies Nigeria', sector: 'energy', tier: null, type: 'job', level: 'junior', location: 'Lagos · Port Harcourt', deadline: '2026-07-10', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '32', slug: 'nnpcl-corporate-secretary', title: 'Company Secretary Assistant', employer: 'NNPC Limited', sector: 'energy', tier: null, type: 'job', level: 'junior', location: 'Abuja', deadline: null, isVerified: false, isClosingSoon: false, isRolling: true },
  { id: '33', slug: 'chevron-contract-counsel', title: 'Contracts & Commercial Counsel', employer: 'Chevron Nigeria', sector: 'energy', tier: null, type: 'job', level: 'senior', location: 'Lagos', deadline: '2026-09-01', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '40', slug: 'flutterwave-legal-counsel', title: 'Legal Counsel, Payments', employer: 'Flutterwave', sector: 'fintech', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-07-15', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '41', slug: 'paystack-compliance-counsel', title: 'Compliance Counsel', employer: 'Paystack', sector: 'fintech', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true },
  { id: '42', slug: 'moniepoint-legal-ops', title: 'Legal Operations Specialist', employer: 'Moniepoint', sector: 'fintech', tier: null, type: 'job', level: 'junior', location: 'Lagos (Remote)', deadline: '2026-07-30', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '43', slug: 'interswitch-ip-counsel', title: 'IP & Technology Counsel', employer: 'Interswitch Group', sector: 'fintech', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-08-20', isVerified: false, isClosingSoon: false, isRolling: false },
  { id: '44', slug: 'mtn-ng-legal-regulatory', title: 'Legal & Regulatory Affairs Manager', employer: 'MTN Nigeria', sector: 'fintech', tier: null, type: 'job', level: 'senior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true },
  { id: '50', slug: 'dangote-group-legal-counsel', title: 'Group Legal Counsel', employer: 'Dangote Industries', sector: 'other', tier: null, type: 'job', level: 'senior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true },
  { id: '51', slug: 'nestle-ng-legal-affairs', title: 'Legal Affairs Officer', employer: 'Nestlé Nigeria', sector: 'other', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-08-10', isVerified: false, isClosingSoon: false, isRolling: false },
  { id: '52', slug: 'airtel-ng-regulatory-counsel', title: 'Regulatory Counsel', employer: 'Airtel Nigeria', sector: 'other', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-07-25', isVerified: true, isClosingSoon: false, isRolling: false },
  { id: '53', slug: 'sec-ng-legal-officer', title: 'Legal Officer II', employer: 'Securities & Exchange Commission', sector: 'other', tier: null, type: 'job', level: 'junior', location: 'Abuja', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true },
]

const SECTOR_OPTIONS = [
  { value: '', label: 'All Sectors' },
  { value: 'law_firm', label: 'Law Firms' },
  { value: 'banking', label: 'Banking & Finance' },
  { value: 'energy', label: 'Energy & Extractives' },
  { value: 'fintech', label: 'Technology & Fintech' },
  { value: 'other', label: 'Multinationals & Other' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'job', label: 'Full-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'vacation_scheme', label: 'Vacation Scheme' },
  { value: 'pupillage', label: 'Pupillage' },
]

const LEVEL_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: 'student', label: 'Student' },
  { value: 'nysc', label: 'NYSC' },
  { value: 'junior', label: 'Junior (0–3 yrs)' },
  { value: 'mid', label: 'Mid (3–6 yrs)' },
  { value: 'senior', label: 'Senior (6+ yrs)' },
]

const LOCATION_OPTIONS = [
  { value: '', label: 'All Locations' },
  { value: 'Lagos', label: 'Lagos' },
  { value: 'Abuja', label: 'Abuja' },
  { value: 'Port Harcourt', label: 'Port Harcourt' },
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
  clerkship: 'Clerkship',
  fellowship: 'Fellowship',
}

export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('')
  const [type, setType] = useState('')
  const [level, setLevel] = useState('')
  const [location, setLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return ALL_LISTINGS.filter(l => {
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.employer.toLowerCase().includes(search.toLowerCase())) return false
      if (sector && l.sector !== sector) return false
      if (type && l.type !== type) return false
      if (level && l.level !== level) return false
      if (location && !l.location.toLowerCase().includes(location.toLowerCase())) return false
      return true
    })
  }, [search, sector, type, level, location])

  const activeChips = [
    sector && { key: 'sector', label: SECTOR_OPTIONS.find(o => o.value === sector)?.label || sector },
    type && { key: 'type', label: TYPE_OPTIONS.find(o => o.value === type)?.label || type },
    level && { key: 'level', label: LEVEL_OPTIONS.find(o => o.value === level)?.label || level },
    location && { key: 'location', label: location },
  ].filter(Boolean) as { key: string; label: string }[]

  const clearFilter = (key: string) => {
    if (key === 'sector') setSector('')
    if (key === 'type') setType('')
    if (key === 'level') setLevel('')
    if (key === 'location') setLocation('')
  }

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '80px', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ borderBottom: '0.5px solid #E8E0D5', padding: '2.5rem 2rem 2rem', backgroundColor: '#F0EBE3' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#0A2342', opacity: 0.5, marginBottom: '0.4rem' }}>
              {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.4rem', lineHeight: 1.1 }}>
              Legal Opportunities
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#4A4A4A', marginBottom: '1.75rem', maxWidth: '520px', lineHeight: 1.6 }}>
              Roles across law firms, banks, energy companies, fintechs, NGOs, and regulators. For all career stages.
            </p>

            {/* Search + filter toggle */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
              <div style={{ position: 'relative' as const, flex: '1 1 280px' }}>
                <Search size={14} style={{ position: 'absolute' as const, left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4A4A4A' }} />
                <input
                  type="text"
                  placeholder="Search roles, employers…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '0.6rem 1rem 0.6rem 2.2rem',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#1A1A1A',
                    backgroundColor: '#FAF7F2', border: '0.5px solid #E8E0D5',
                    borderRadius: '2px', outline: 'none', boxSizing: 'border-box' as const,
                  }}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '0.6rem 1.25rem',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  backgroundColor: showFilters ? '#0A2342' : '#FAF7F2',
                  color: showFilters ? '#FAF7F2' : '#1A1A1A',
                  border: '0.5px solid #E8E0D5', borderRadius: '2px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <SlidersHorizontal size={13} />
                Filters{activeChips.length > 0 ? ` (${activeChips.length})` : ''}
              </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div style={{
                marginTop: '1rem', padding: '1.25rem 1.5rem',
                backgroundColor: '#FAF7F2', border: '0.5px solid #E8E0D5',
                borderRadius: '2px', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' as const,
              }}>
                {[
                  { label: 'Sector', value: sector, setter: setSector, options: SECTOR_OPTIONS },
                  { label: 'Type', value: type, setter: setType, options: TYPE_OPTIONS },
                  { label: 'Level', value: level, setter: setLevel, options: LEVEL_OPTIONS },
                  { label: 'Location', value: location, setter: setLocation, options: LOCATION_OPTIONS },
                ].map(({ label, value, setter, options }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column' as const, gap: '5px' }}>
                    <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4A4A4A' }}>
                      {label}
                    </label>
                    <select
                      value={value}
                      onChange={e => setter(e.target.value)}
                      style={{
                        padding: '0.4rem 0.75rem', fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.82rem', color: '#1A1A1A', backgroundColor: '#FAF7F2',
                        border: '0.5px solid #E8E0D5', borderRadius: '2px', cursor: 'pointer', minWidth: '150px',
                      }}
                    >
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Active chips */}
            {activeChips.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const, marginTop: '0.75rem', alignItems: 'center' }}>
                {activeChips.map(chip => (
                  <button
                    key={chip.key}
                    onClick={() => clearFilter(chip.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '3px 10px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem',
                      color: '#1A1A1A', backgroundColor: '#EEE8DF', border: 'none', borderRadius: '2px', cursor: 'pointer',
                    }}
                  >
                    {chip.label} <X size={10} />
                  </button>
                ))}
                <button
                  onClick={() => { setSector(''); setType(''); setLevel(''); setLocation('') }}
                  style={{ padding: '3px 6px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#B5451B', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Listings */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 2rem 3rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center' as const, padding: '5rem 0' }}>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#1A1A1A', marginBottom: '0.5rem' }}>No listings match your filters.</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#4A4A4A' }}>Try broadening your search.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1px', backgroundColor: '#E8E0D5', border: '0.5px solid #E8E0D5' }}>
              {filtered.map(listing => {
                const accent = SECTOR_ACCENT[listing.sector] || '#3B3B3B'
                const isSaved = saved.has(listing.id)
                return (
                  <article
                    key={listing.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderLeft: `3px solid ${accent}`,
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    {/* Left */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Meta row */}
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' as const }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: accent }}>
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

                      {/* Title */}
                      <Link href={`/jobs/${listing.slug}`} style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: '1rem', fontWeight: 600, color: '#1A1A1A',
                        textDecoration: 'none', display: 'block', lineHeight: 1.3, marginBottom: '0.2rem',
                      }}>
                        {listing.title}
                      </Link>

                      {/* Employer */}
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#0A2342', marginBottom: '0.6rem', fontWeight: 500 }}>
                        {listing.employer}
                      </p>

                      {/* Bottom meta */}
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A' }}>
                          <MapPin size={10} /> {listing.location}
                        </span>
                        {listing.isRolling ? (
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A4A4A' }}>
                            Rolling
                          </span>
                        ) : listing.deadline ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: listing.isClosingSoon ? '#B5451B' : '#4A4A4A', fontWeight: listing.isClosingSoon ? 600 : 400 }}>
                            <Clock size={10} />
                            {new Date(listing.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                      <button
                        onClick={() => toggleSave(listing.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: isSaved ? '#0A2342' : '#C0B8B0', display: 'flex' }}
                        title={isSaved ? 'Unsave' : 'Save'}
                      >
                        <Bookmark size={15} fill={isSaved ? '#0A2342' : 'none'} />
                      </button>
                      <Link
                        href={`/jobs/${listing.slug}`}
                        style={{ color: '#0A2342', display: 'flex', alignItems: 'center' }}
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
