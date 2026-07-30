'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import PageHeader from '@/components/layout/PageHeader'
import { ALL_OPPORTUNITIES, CATEGORY_META, type OpportunityCategory, type EligibilityLevel } from '@/lib/opportunities-data'

// SVG Icons
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const GlobeIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
  </svg>
)
const MapPinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)
const BookmarkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
  </svg>
)
const ExternalLinkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
  </svg>
)

const CATEGORY_GROUPS = [
  {
    label: 'For Undergraduates',
    description: 'Internships and scholarships for law students',
    categories: ['internship_law', 'scholarship_local', 'scholarship_international'] as OpportunityCategory[],
  },
  {
    label: 'Beyond the Bar',
    description: 'Graduate and in-house roles across industries',
    categories: ['grad_trainee_banking', 'grad_trainee_energy', 'grad_trainee_fintech', 'grad_trainee_other'] as OpportunityCategory[],
  },
]

const ELIGIBILITY_OPTIONS: { value: EligibilityLevel | ''; label: string }[] = [
  { value: '', label: 'All Levels' },
  { value: 'undergraduate', label: 'Law Students' },
  { value: 'law_graduate', label: 'Fresh Graduates' },
  { value: 'experienced_lawyer', label: 'Experienced Lawyers' },
]

const TYPE_LABELS: Record<OpportunityCategory, string> = {
  internship_law: 'Law Internship',
  scholarship_local: 'Local Scholarship',
  scholarship_international: 'International Scholarship',
  grad_trainee_banking: 'Banking Role',
  grad_trainee_energy: 'Energy Role',
  grad_trainee_fintech: 'Fintech Role',
  grad_trainee_other: 'Industry Role',
}

function DeadlinePill({ deadline, isRolling, isClosingSoon }: { deadline: string | null; isRolling: boolean; isClosingSoon: boolean }) {
  if (isRolling) return (
    <span className="label-caps badge-new" style={{ padding: '2px 7px', borderRadius: '2px', fontSize: '0.58rem' }}>Rolling</span>
  )
  if (!deadline) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.62rem', fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: isClosingSoon ? '#000000' : '#4A4A4A',
    }}>
      <ClockIcon />
      {new Date(deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
    </span>
  )
}

export default function OpportunitiesPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<OpportunityCategory | ''>('')
  const [eligibility, setEligibility] = useState<EligibilityLevel | ''>('')
  const [internationalOnly, setInternationalOnly] = useState(false)

  const filtered = useMemo(() => {
    return ALL_OPPORTUNITIES.filter(o => {
      if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.organisation.toLowerCase().includes(search.toLowerCase())) return false
      if (activeCategory && o.category !== activeCategory) return false
      if (eligibility && !o.eligibility.includes(eligibility)) return false
      if (internationalOnly && !o.isInternational) return false
      return true
    })
  }, [search, activeCategory, eligibility, internationalOnly])

  const hasFilters = activeCategory || eligibility || internationalOnly

  return (
    <>
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '64px', minHeight: '100vh' }}>

        <PageHeader          heading="opportunities"
          subcopy="Internships and scholarships for law undergraduates. Graduate trainee and in-house roles at banks, energy companies, fintechs, and more, for fresh graduates and experienced lawyers."
        >

            {/* Search */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', flex: '1 1 280px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4A4A4A' }}>
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Search opportunities or organisations"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem',
                    fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.85rem', color: '#1A1A1A',
                    backgroundColor: '#FAF7F2', border: '0.5px solid #E8E0D5',
                    borderRadius: '2px', outline: 'none',
                  }}
                />
              </div>
              <select
                value={eligibility}
                onChange={e => setEligibility(e.target.value as EligibilityLevel | '')}
                style={{
                  padding: '0.65rem 1rem',
                  fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.8rem',
                  color: eligibility ? '#1A1A1A' : '#4A4A4A',
                  backgroundColor: '#FAF7F2',
                  border: `0.5px solid ${eligibility ? '#1A1A1A' : '#E8E0D5'}`,
                  borderRadius: '999px', outline: 'none', cursor: 'pointer',
                }}
              >
                {ELIGIBILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                onClick={() => setInternationalOnly(!internationalOnly)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '0.65rem 1.1rem',
                  fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.78rem',
                  fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  backgroundColor: internationalOnly ? '#1A1A1A' : '#FAF7F2',
                  color: internationalOnly ? '#FAF7F2' : '#4A4A4A',
                  border: `0.5px solid ${internationalOnly ? '#1A1A1A' : '#E8E0D5'}`,
                  borderRadius: '999px', cursor: 'pointer',
                }}
              >
                <GlobeIcon /> International only
              </button>
              {hasFilters && (
                <button
                  onClick={() => { setActiveCategory(''); setEligibility(''); setInternationalOnly(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '0.65rem 1rem',
                    fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.78rem',
                    color: '#000000', backgroundColor: 'transparent',
                    border: '0.5px solid rgba(181,69,27,0.3)', borderRadius: '999px', cursor: 'pointer',
                  }}
                >
                  <XIcon /> Clear
                </button>
              )}
            </div>

            {/* Category pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveCategory('')}
                style={{
                  padding: '4px 12px',
                  fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.72rem', fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  backgroundColor: activeCategory === '' ? '#1A1A1A' : 'transparent',
                  color: activeCategory === '' ? '#FAF7F2' : '#4A4A4A',
                  border: `0.5px solid ${activeCategory === '' ? '#1A1A1A' : '#E8E0D5'}`,
                  borderRadius: '999px', cursor: 'pointer',
                }}
              >
                All
              </button>
              {(Object.keys(CATEGORY_META) as OpportunityCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                  style={{
                    padding: '4px 12px',
                    fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.72rem', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    backgroundColor: activeCategory === cat ? '#1A1A1A' : 'transparent',
                    color: activeCategory === cat ? '#FAF7F2' : '#4A4A4A',
                    border: `0.5px solid ${activeCategory === cat ? '#1A1A1A' : '#E8E0D5'}`,
                    borderRadius: '999px', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {CATEGORY_META[cat].label}
                </button>
              ))}
            </div>
        </PageHeader>

        {/* Results */}
        <div style={{ maxWidth: 'min(1800px, 94vw)', margin: '0 auto', padding: '2.5rem 2rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '1.5rem', color: '#1A1A1A', marginBottom: '0.5rem' }}>
                No opportunities match your filters.
              </p>
              <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.85rem', color: '#4A4A4A' }}>
                Try broadening your search or clearing the filters.
              </p>
            </div>
          ) : activeCategory ? (
            // Flat list when filtered
            <div style={{
              display: 'grid', gap: '1px',
              backgroundColor: '#E8E0D5', border: '0.5px solid #E8E0D5',
            }}>
              {filtered.map(opp => (
                <OpportunityCard key={opp.id} opp={opp} />
              ))}
            </div>
          ) : (
            // Grouped view
            CATEGORY_GROUPS.map(group => {
              const groupOpps = filtered.filter(o => group.categories.includes(o.category))
              if (groupOpps.length === 0) return null
              return (
                <div key={group.label} style={{ marginBottom: '4rem' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p className="label-caps" style={{ color: '#1A1A1A', opacity: 0.6, marginBottom: '0.25rem', fontSize: '0.6rem' }}>
                      {group.label}
                    </p>
                    <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.82rem', color: '#4A4A4A' }}>
                      {group.description}
                    </p>
                  </div>
                  <div style={{
                    display: 'grid', gap: '1px',
                    backgroundColor: '#E8E0D5', border: '0.5px solid #E8E0D5',
                  }}>
                    {groupOpps.map(opp => (
                      <OpportunityCard key={opp.id} opp={opp} />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function OpportunityCard({ opp }: { opp: typeof ALL_OPPORTUNITIES[0] }) {
  return (
    <article
      style={{
        backgroundColor: '#FAF7F2',
        padding: '1.5rem 1.75rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '1rem',
        alignItems: 'start',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
    >
      <div>
        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className="label-caps badge-new" style={{ padding: '2px 7px', borderRadius: '2px', fontSize: '0.58rem' }}>
            {TYPE_LABELS[opp.category]}
          </span>
          {opp.isInternational && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              padding: '2px 7px', borderRadius: '2px', fontSize: '0.58rem',
              fontFamily: 'Schibsted Grotesk, sans-serif', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#1A1A1A', backgroundColor: 'rgba(139,58,58,0.08)',
            }}>
              <GlobeIcon /> International
            </span>
          )}
          {opp.isVerified && (
            <span className="label-caps badge-verified" style={{ padding: '2px 7px', borderRadius: '2px', fontSize: '0.58rem' }}>
              Verified
            </span>
          )}
          {opp.isClosingSoon && (
            <span className="label-caps badge-closing" style={{ padding: '2px 7px', borderRadius: '2px', fontSize: '0.58rem' }}>
              Closing soon
            </span>
          )}
        </div>

        {/* Title */}
        <p style={{
          fontFamily: 'Schibsted Grotesk, sans-serif',
          fontSize: '1.05rem', fontWeight: 600, color: '#1A1A1A',
          lineHeight: 1.3, marginBottom: '0.2rem',
        }}>
          {opp.title}
        </p>

        {/* Organisation */}
        <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.82rem', color: '#1A1A1A', marginBottom: '0.5rem' }}>
          {opp.organisation}
        </p>

        {/* Description */}
        <p style={{
          fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.8rem', color: '#4A4A4A',
          lineHeight: 1.65, marginBottom: '0.75rem',
          maxWidth: '600px',
        }}>
          {opp.description}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.73rem', color: '#4A4A4A' }}>
            <MapPinIcon /> {opp.location}
          </span>
          {opp.amount && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#2D6A4F' }}>
              {opp.amount}
            </span>
          )}
          {opp.duration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.73rem', color: '#4A4A4A' }}>
              <ClockIcon /> {opp.duration}
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
        <DeadlinePill deadline={opp.deadline} isRolling={opp.isRolling} isClosingSoon={opp.isClosingSoon} />
        <button style={{
          background: 'none', border: '0.5px solid #E8E0D5', borderRadius: '999px',
          padding: '6px', cursor: 'pointer', color: '#4A4A4A',
        }} title="Save">
          <BookmarkIcon />
        </button>
        {opp.applyUrl ? (
          <a
            href={opp.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.7rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            Apply <ExternalLinkIcon />
          </a>
        ) : opp.applyEmail ? (
          <a
            href={`mailto:${opp.applyEmail}?subject=Application: ${opp.title}`}
            className="btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.7rem', whiteSpace: 'nowrap' }}
          >
            Apply via email
          </a>
        ) : (
          <Link href="/auth-login" className="btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
            Save role
          </Link>
        )}
      </div>
    </article>
  )
}
