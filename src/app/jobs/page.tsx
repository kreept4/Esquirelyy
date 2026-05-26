'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, SlidersHorizontal, X, BookmarkPlus, MapPin, Clock, Building2 } from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────
const ALL_LISTINGS = [
  // ── Law Firm Roles ──────────────────────────────────────────────────────────
  { id: '1', slug: 'aluko-associate-banking', title: 'Associate, Banking & Finance', employer: 'Aluko & Oyebode', employerSlug: 'aluko-oyebode', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-06-30', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Banking & Finance', 'Capital Markets'], salary: '₦8m – ₦12m' },
  { id: '2', slug: 'templars-vacation-2025', title: '2025 Vacation Scheme', employer: 'Templars', employerSlug: 'templars', sector: 'law_firm', tier: 'Tier 1', type: 'vacation_scheme', level: 'student', location: 'Lagos · Abuja', deadline: '2026-06-15', isVerified: true, isClosingSoon: true, isRolling: false, practiceAreas: ['Corporate', 'Energy'], salary: 'Stipend provided' },
  { id: '3', slug: 'aelex-dispute-pupil', title: 'Dispute Resolution Pupil', employer: 'AELEX', employerSlug: 'aelex', sector: 'law_firm', tier: 'Tier 1', type: 'pupillage', level: 'junior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Dispute Resolution', 'Arbitration'], salary: null },
  { id: '4', slug: 'olaniwun-nysc-trainee', title: 'Legal Trainee (NYSC)', employer: 'Olaniwun Ajayi LP', employerSlug: 'olaniwun-ajayi', sector: 'law_firm', tier: 'Tier 1', type: 'internship', level: 'nysc', location: 'Lagos', deadline: '2026-06-20', isVerified: false, isClosingSoon: false, isRolling: false, practiceAreas: ['Corporate', 'Tax'], salary: 'NYSC allowance' },
  { id: '5', slug: 'aelex-energy-associate', title: 'Junior Associate — Energy', employer: 'AELEX', employerSlug: 'aelex', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-10', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Energy', 'Dispute Resolution'], salary: null },
  { id: '6', slug: 'banwo-capital-markets', title: 'Capital Markets Associate', employer: 'Banwo & Ighodalo', employerSlug: 'banwo-ighodalo', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-07-05', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Capital Markets', 'Corporate'], salary: '₦10m – ₦15m' },
  { id: '7', slug: 'g-elias-telecoms', title: 'Associate, Technology & Telecoms', employer: 'G. Elias & Co', employerSlug: 'g-elias', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-20', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Telecommunications', 'Corporate'], salary: null },
  { id: '8', slug: 'streamsowers-arbitration-intern', title: 'Arbitration Intern', employer: 'Streamsowers & Köhn', employerSlug: 'streamsowers-kohn', sector: 'law_firm', tier: 'Tier 1', type: 'internship', level: 'student', location: 'Lagos', deadline: '2026-06-25', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Arbitration', 'Dispute Resolution'], salary: null },
  { id: '9', slug: 'stl-public-law-abuja', title: 'Public Law Associate', employer: 'STL Attorneys', employerSlug: 'stl-attorneys', sector: 'law_firm', tier: 'Tier 2', type: 'job', level: 'junior', location: 'Abuja', deadline: '2026-07-15', isVerified: false, isClosingSoon: false, isRolling: false, practiceAreas: ['Public Law & Regulatory'], salary: null },
  { id: '10', slug: 'olajide-tax-associate', title: 'Tax Associate', employer: 'Olajide Oyewole LLP', employerSlug: 'olajide-oyewole', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'mid', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Tax', 'Banking & Finance'], salary: null },
  { id: '11', slug: 'kenna-partners-senior-associate', title: 'Senior Associate — Corporate', employer: 'Kenna Partners', employerSlug: 'kenna-partners', sector: 'law_firm', tier: 'Tier 2', type: 'job', level: 'senior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Corporate', 'M&A'], salary: '₦18m – ₦25m' },
  { id: '12', slug: 'jackson-etti-employment-assoc', title: 'Employment Law Associate', employer: 'Jackson Etti & Edu', employerSlug: 'jackson-etti-edu', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-08-01', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Employment & Labour', 'Dispute Resolution'], salary: null },
  { id: '13', slug: 'udo-udoma-real-estate', title: 'Real Estate Associate', employer: 'Udo Udoma & Belo-Osagie', employerSlug: 'udo-udoma', sector: 'law_firm', tier: 'Tier 1', type: 'job', level: 'mid', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Real Estate', 'Corporate'], salary: null },

  // ── Banking & Financial Services — In-house ─────────────────────────────────
  { id: '20', slug: 'access-bank-legal-counsel', title: 'Legal Counsel — Retail Banking', employer: 'Access Bank', employerSlug: null, sector: 'banking', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-31', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Banking & Finance', 'Regulatory'], salary: '₦7m – ₦10m' },
  { id: '21', slug: 'zenith-bank-compliance-counsel', title: 'Compliance & Legal Officer', employer: 'Zenith Bank', employerSlug: null, sector: 'banking', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Regulatory', 'Banking & Finance'], salary: '₦12m – ₦18m' },
  { id: '22', slug: 'gtb-corporate-counsel', title: 'Corporate Affairs Counsel', employer: 'Guaranty Trust Bank', employerSlug: null, sector: 'banking', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-08-15', isVerified: false, isClosingSoon: false, isRolling: false, practiceAreas: ['Corporate', 'Regulatory'], salary: null },
  { id: '23', slug: 'stanbic-ibtc-legal-analyst', title: 'Legal & Compliance Analyst', employer: 'Stanbic IBTC', employerSlug: null, sector: 'banking', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-07-20', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Banking & Finance', 'Regulatory'], salary: '₦8m – ₦11m' },
  { id: '24', slug: 'cbn-legal-officer', title: 'Legal Officer', employer: 'Central Bank of Nigeria', employerSlug: null, sector: 'banking', tier: null, type: 'job', level: 'junior', location: 'Abuja', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Regulatory', 'Public Law & Regulatory'], salary: 'CONPASS Grade Level' },

  // ── Energy & Extractives — In-house ─────────────────────────────────────────
  { id: '30', slug: 'seplat-energy-legal-counsel', title: 'Counsel — Upstream Operations', employer: 'Seplat Energy', employerSlug: null, sector: 'energy', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-08-30', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Energy', 'Corporate'], salary: '₦20m – ₦30m' },
  { id: '31', slug: 'totalenergies-legal-ng', title: 'Junior Legal Counsel — Exploration', employer: 'TotalEnergies Nigeria', employerSlug: null, sector: 'energy', tier: null, type: 'job', level: 'junior', location: 'Lagos · Port Harcourt', deadline: '2026-07-10', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Energy', 'Arbitration'], salary: null },
  { id: '32', slug: 'nnpcl-corporate-secretary', title: 'Company Secretary Assistant', employer: 'NNPC Limited', employerSlug: null, sector: 'energy', tier: null, type: 'job', level: 'junior', location: 'Abuja', deadline: null, isVerified: false, isClosingSoon: false, isRolling: true, practiceAreas: ['Corporate', 'Public Law & Regulatory'], salary: null },
  { id: '33', slug: 'chevron-contract-counsel', title: 'Contracts & Commercial Counsel', employer: 'Chevron Nigeria', employerSlug: null, sector: 'energy', tier: null, type: 'job', level: 'senior', location: 'Lagos', deadline: '2026-09-01', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Energy', 'Arbitration', 'Corporate'], salary: '₦35m+' },

  // ── Technology & Fintech — In-house ─────────────────────────────────────────
  { id: '40', slug: 'flutterwave-legal-counsel', title: 'Legal Counsel — Payments', employer: 'Flutterwave', employerSlug: null, sector: 'fintech', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-07-15', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Regulatory', 'Banking & Finance'], salary: '₦18m – ₦26m' },
  { id: '41', slug: 'paystack-compliance-counsel', title: 'Compliance Counsel', employer: 'Paystack', employerSlug: null, sector: 'fintech', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Regulatory', 'Banking & Finance'], salary: '₦10m – ₦15m' },
  { id: '42', slug: 'moniepoint-legal-ops', title: 'Legal Operations Specialist', employer: 'Moniepoint', employerSlug: null, sector: 'fintech', tier: null, type: 'job', level: 'junior', location: 'Lagos (Remote)', deadline: '2026-07-30', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Regulatory', 'Corporate'], salary: '₦9m – ₦13m' },
  { id: '43', slug: 'interswitch-ip-counsel', title: 'IP & Technology Counsel', employer: 'Interswitch Group', employerSlug: null, sector: 'fintech', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-08-20', isVerified: false, isClosingSoon: false, isRolling: false, practiceAreas: ['Intellectual Property', 'Telecommunications'], salary: null },
  { id: '44', slug: 'mtn-ng-legal-regulatory', title: 'Legal & Regulatory Affairs Manager', employer: 'MTN Nigeria', employerSlug: null, sector: 'fintech', tier: null, type: 'job', level: 'senior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Regulatory', 'Telecommunications', 'Public Law & Regulatory'], salary: '₦30m – ₦45m' },

  // ── Multinationals & Other Industries ───────────────────────────────────────
  { id: '50', slug: 'dangote-group-legal-counsel', title: 'Group Legal Counsel', employer: 'Dangote Industries', employerSlug: null, sector: 'other', tier: null, type: 'job', level: 'senior', location: 'Lagos', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Corporate', 'M&A', 'Energy'], salary: '₦40m+' },
  { id: '51', slug: 'nestlé-ng-legal-affairs', title: 'Legal Affairs Officer', employer: 'Nestlé Nigeria', employerSlug: null, sector: 'other', tier: null, type: 'job', level: 'junior', location: 'Lagos', deadline: '2026-08-10', isVerified: false, isClosingSoon: false, isRolling: false, practiceAreas: ['Employment & Labour', 'Corporate'], salary: null },
  { id: '52', slug: 'airtel-ng-regulatory-counsel', title: 'Regulatory Counsel', employer: 'Airtel Nigeria', employerSlug: null, sector: 'other', tier: null, type: 'job', level: 'mid', location: 'Lagos', deadline: '2026-07-25', isVerified: true, isClosingSoon: false, isRolling: false, practiceAreas: ['Regulatory', 'Telecommunications'], salary: '₦16m – ₦22m' },
  { id: '53', slug: 'sec-ng-legal-officer', title: 'Legal Officer II', employer: 'Securities & Exchange Commission', employerSlug: null, sector: 'other', tier: null, type: 'job', level: 'junior', location: 'Abuja', deadline: null, isVerified: true, isClosingSoon: false, isRolling: true, practiceAreas: ['Capital Markets', 'Regulatory', 'Public Law & Regulatory'], salary: 'CONPASS Grade Level' },
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

const SECTOR_LABELS: Record<string, string> = {
  law_firm: 'Law Firm',
  banking: 'Banking',
  energy: 'Energy',
  fintech: 'Tech & Fintech',
  other: 'Industry',
}

const SECTOR_COLORS: Record<string, { bg: string; color: string }> = {
  law_firm: { bg: '#EAE4FC', color: '#3B1FA3' },
  banking: { bg: '#E0F0FF', color: '#0A4A8C' },
  energy: { bg: '#FFF3E0', color: '#7A3B00' },
  fintech: { bg: '#E6F9F0', color: '#0E5C3A' },
  other: { bg: '#F0F0F0', color: '#333' },
}

const TYPE_LABELS: Record<string, string> = {
  job: 'Full-time', internship: 'Internship', vacation_scheme: 'Vacation Scheme',
  pupillage: 'Pupillage', clerkship: 'Clerkship', fellowship: 'Fellowship',
}

function DeadlineBadge({ deadline, isRolling, isClosingSoon }: { deadline: string | null; isRolling: boolean; isClosingSoon: boolean }) {
  if (isRolling) return (
    <span className="label-caps badge-new" style={{ padding: '2px 7px', borderRadius: '2px', fontSize: '0.58rem' }}>Rolling</span>
  )
  if (!deadline) return null
  return (
    <span style={{
      fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      color: isClosingSoon ? '#B5451B' : '#4A4A4A',
      display: 'flex', alignItems: 'center', gap: '3px',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <Clock size={10} />
      {new Date(deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
    </span>
  )
}

export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('')
  const [type, setType] = useState('')
  const [level, setLevel] = useState('')
  const [location, setLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)

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

  const hasActiveFilters = sector || type || level || location

  const clearFilter = (key: string) => {
    if (key === 'sector') setSector('')
    if (key === 'type') setType('')
    if (key === 'level') setLevel('')
    if (key === 'location') setLocation('')
  }

  const activeChips = [
    sector && { key: 'sector', label: SECTOR_OPTIONS.find(o => o.value === sector)?.label || sector },
    type && { key: 'type', label: TYPE_OPTIONS.find(o => o.value === type)?.label || type },
    level && { key: 'level', label: LEVEL_OPTIONS.find(o => o.value === level)?.label || level },
    location && { key: 'location', label: location },
  ].filter(Boolean) as { key: string; label: string }[]

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '64px', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ borderBottom: '0.5px solid #E8E0D5', padding: '3rem 2rem 2rem', backgroundColor: '#F0EBE3' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <p className="label-caps" style={{ color: '#0A2342', opacity: 0.6, marginBottom: '0.5rem' }}>
              {filtered.length} Listing{filtered.length !== 1 ? 's' : ''}
            </p>
            <h1 style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem', lineHeight: 1.1,
            }}>
              Legal Jobs
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#4A4A4A', marginBottom: '1.75rem', maxWidth: '540px' }}>
              Full-time roles across law firms, banks, energy companies, fintechs, and regulators — for all career stages.
            </p>

            {/* Search + filter toggle */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 280px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4A4A4A' }} />
                <input
                  type="text"
                  placeholder="Search roles, employers, practice areas…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#1A1A1A',
                    backgroundColor: '#FAF7F2', border: '0.5px solid #E8E0D5',
                    borderRadius: '2px', outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '0.65rem 1.25rem',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  backgroundColor: showFilters ? '#0A2342' : '#FAF7F2',
                  color: showFilters ? '#FAF7F2' : '#1A1A1A',
                  border: '0.5px solid #E8E0D5', borderRadius: '2px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <SlidersHorizontal size={13} />
                Filters {hasActiveFilters ? `(${activeChips.length})` : ''}
              </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div style={{
                marginTop: '1rem', padding: '1.25rem',
                backgroundColor: '#FAF7F2', border: '0.5px solid #E8E0D5',
                borderRadius: '2px', display: 'flex', gap: '1rem', flexWrap: 'wrap',
              }}>
                {[
                  { label: 'Sector', value: sector, setter: setSector, options: SECTOR_OPTIONS },
                  { label: 'Type', value: type, setter: setType, options: TYPE_OPTIONS },
                  { label: 'Level', value: level, setter: setLevel, options: LEVEL_OPTIONS },
                  { label: 'Location', value: location, setter: setLocation, options: LOCATION_OPTIONS },
                ].map(({ label, value, setter, options }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
                    <label className="label-caps" style={{ fontSize: '0.6rem', color: '#4A4A4A' }}>{label}</label>
                    <select
                      value={value}
                      onChange={e => setter(e.target.value)}
                      style={{
                        padding: '0.45rem 0.75rem', fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.8rem', color: '#1A1A1A', backgroundColor: '#FAF7F2',
                        border: '0.5px solid #E8E0D5', borderRadius: '2px', cursor: 'pointer',
                        minWidth: '150px',
                      }}
                    >
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {activeChips.map(chip => (
                  <button
                    key={chip.key}
                    onClick={() => clearFilter(chip.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '3px 10px', fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.72rem', color: '#1A1A1A',
                      backgroundColor: '#EEE8DF', border: 'none', borderRadius: '2px', cursor: 'pointer',
                    }}
                  >
                    {chip.label} <X size={10} />
                  </button>
                ))}
                <button
                  onClick={() => { setSector(''); setType(''); setLevel(''); setLocation('') }}
                  style={{
                    padding: '3px 10px', fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.72rem', color: '#B5451B',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Listings */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#1A1A1A', marginBottom: '0.5rem' }}>
                No listings match your filters
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#4A4A4A' }}>
                Try adjusting your search or clearing some filters.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
              {filtered.map(listing => {
                const sectorStyle = SECTOR_COLORS[listing.sector] || SECTOR_COLORS.other
                return (
                  <article key={listing.id} style={{
                    backgroundColor: '#FFFFFF', border: '0.5px solid #E8E0D5',
                    borderRadius: '3px', padding: '1.25rem 1.5rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    gap: '1rem', transition: 'border-color 0.2s',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>

                      {/* Top badges */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em',
                          textTransform: 'uppercase' as const, padding: '2px 7px',
                          borderRadius: '2px', fontFamily: 'DM Sans, sans-serif',
                          backgroundColor: sectorStyle.bg, color: sectorStyle.color,
                        }}>
                          {SECTOR_LABELS[listing.sector]}
                        </span>
                        {listing.tier && (
                          <span className="label-caps" style={{ fontSize: '0.58rem', color: '#4A4A4A' }}>
                            {listing.tier}
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.08em',
                          textTransform: 'uppercase' as const, padding: '2px 7px',
                          borderRadius: '2px', fontFamily: 'DM Sans, sans-serif',
                          backgroundColor: '#F0EBE3', color: '#4A4A4A',
                        }}>
                          {TYPE_LABELS[listing.type] || listing.type}
                        </span>
                        {listing.isVerified && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.58rem', color: '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <Link href={`/jobs/${listing.slug}`} style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: '1.05rem', fontWeight: 600, color: '#1A1A1A',
                        textDecoration: 'none', display: 'block', lineHeight: 1.3, marginBottom: '0.2rem',
                      }}>
                        {listing.title}
                      </Link>

                      {/* Employer */}
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#0A2342', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Building2 size={11} style={{ opacity: 0.6 }} />
                        {listing.employer}
                      </p>

                      {/* Meta row */}
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: '#4A4A4A' }}>
                          <MapPin size={11} /> {listing.location}
                        </span>
                        {listing.practiceAreas.slice(0, 2).map(a => (
                          <span key={a} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: '#4A4A4A' }}>{a}</span>
                        ))}
                        {listing.salary && (
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#2D6A4F' }}>
                            {listing.salary}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                      <DeadlineBadge deadline={listing.deadline} isRolling={listing.isRolling} isClosingSoon={listing.isClosingSoon} />
                      <button style={{
                        background: 'none', border: '0.5px solid #E8E0D5',
                        borderRadius: '2px', padding: '6px', cursor: 'pointer', color: '#4A4A4A',
                      }} title="Save">
                        <BookmarkPlus size={14} />
                      </button>
                      <Link href={`/jobs/${listing.slug}`} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.7rem', whiteSpace: 'nowrap' as const }}>
                        View →
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
