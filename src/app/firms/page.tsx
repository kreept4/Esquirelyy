'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import PageHeader from '@/components/layout/PageHeader'
import FirmGlobe from '@/components/features/FirmGlobe'
import { ALL_FIRMS, type FirmTier } from '@/lib/firms-data'

const STORAGE = 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/'

const TIER_OPTIONS = [
  { value: '', label: 'All Tiers' },
  { value: 'Tier 1', label: 'Tier 1' },
  { value: 'Tier 2', label: 'Tier 2' },
  { value: 'Boutique', label: 'Boutique' },
]
const CITY_OPTIONS = [
  { value: '', label: 'All Cities' },
  { value: 'Lagos', label: 'Lagos' },
  { value: 'Abuja', label: 'Abuja' },
  { value: 'Port Harcourt', label: 'Port Harcourt' },
]
const PRACTICE_OPTIONS = [
  'Corporate & Commercial','Dispute Resolution','Energy & Natural Resources',
  'Banking & Finance','Capital Markets','Tax','Arbitration',
  'Intellectual Property','Shipping & Maritime','Public Law & Regulatory',
]

function FirmAvatar({ logoFile, name }: { logoFile?: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  const url = logoFile && !failed ? STORAGE + logoFile.replace(/ /g, '%20') : null
  const monogram = name
    .split(' ')
    .filter((w: string) => w.length > 2 && !['and','LLP','LP','Co','the'].includes(w))
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div style={{
      width: '48px', height: '48px', flexShrink: 0, borderRadius: '2px',
      border: '0.5px solid #E8E0D5', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: url ? '#FFFFFF' : '#1A1A1A',
    }}>
      {url ? (
        /* Contain within the box instead of forcing 80% on both axes, which
           squashed wide wordmarks and floated square marks off-centre. */
        <img src={url} alt={name} width={48} height={48}
          style={{ objectFit: 'contain', maxWidth: '82%', maxHeight: '82%', width: 'auto', height: 'auto' }}
          onError={() => setFailed(true)} />
      ) : (
        <span style={{
          fontFamily: 'Schibsted Grotesk, sans-serif',
          fontWeight: 700, fontSize: '0.75rem', color: '#FAF7F2',
        }}>{monogram}</span>
      )}
    </div>
  )
}

const SearchIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>)
const ArrowRightIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>)
const MapPinIcon = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>)
const BriefcaseIcon = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>)
const XIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>)

export default function FirmsPage() {
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('')
  const [city, setCity] = useState('')
  const [practiceArea, setPracticeArea] = useState('')

  const filtered = useMemo(() => {
    return ALL_FIRMS.filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.practiceAreas.some((p: string) => p.toLowerCase().includes(search.toLowerCase()))) return false
      if (tier && f.tier !== tier) return false
      if (city && !f.offices.some((o: { city: string; address: string }) => o.city === city)) return false
      if (practiceArea && !f.practiceAreas.includes(practiceArea)) return false
      return true
    })
  }, [search, tier, city, practiceArea])

  const hasFilters = tier || city || practiceArea

  return (
    <>
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '80px', minHeight: '100vh' }}>

        {/* Showpiece only. The searchable, crawlable list still lives below it:
            the sphere renders to a canvas, so nothing inside it is indexable or
            reachable by keyboard, and the directory itself must be both. */}
        <FirmGlobe />

        <PageHeader          heading="firm directory"
          subcopy="Profiles of Nigerian law firms with tier rankings, practice-area breakdowns, and hiring history."
        >

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
              <div style={{ position: 'relative' as const, flex: '1 1 280px' }}>
                <span style={{ position: 'absolute' as const, left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4A4A4A' }}><SearchIcon /></span>
                <input
                  type="text"
                  placeholder="Search firms or practice areas"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.85rem', color: '#1A1A1A', backgroundColor: '#FAF7F2', border: '0.5px solid #E8E0D5', borderRadius: '2px', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              {[
                { value: tier, setter: setTier, options: TIER_OPTIONS, placeholder: 'Tier' },
                { value: city, setter: setCity, options: CITY_OPTIONS, placeholder: 'City' },
              ].map(({ value, setter, options, placeholder }) => (
                <select key={placeholder} value={value} onChange={e => setter(e.target.value)}
                  style={{ padding: '0.65rem 1rem', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.8rem', color: value ? '#1A1A1A' : '#4A4A4A', backgroundColor: '#FAF7F2', border: `0.5px solid ${value ? '#1A1A1A' : '#E8E0D5'}`, borderRadius: '999px', outline: 'none', cursor: 'pointer' }}>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ))}

              <select value={practiceArea} onChange={e => setPracticeArea(e.target.value)}
                style={{ padding: '0.65rem 1rem', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.8rem', color: practiceArea ? '#1A1A1A' : '#4A4A4A', backgroundColor: '#FAF7F2', border: `0.5px solid ${practiceArea ? '#1A1A1A' : '#E8E0D5'}`, borderRadius: '999px', outline: 'none', cursor: 'pointer' }}>
                <option value="">All Practice Areas</option>
                {PRACTICE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {hasFilters && (
                <button onClick={() => { setTier(''); setCity(''); setPracticeArea('') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.65rem 1rem', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.78rem', color: '#000000', backgroundColor: 'transparent', border: '0.5px solid rgba(181,69,27,0.3)', borderRadius: '999px', cursor: 'pointer' }}>
                  <XIcon /> Clear
                </button>
              )}
            </div>
        </PageHeader>

        <div style={{ maxWidth: 'min(1800px, 94vw)', margin: '0 auto', padding: '2rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center' as const, padding: '5rem 0' }}>
              <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '1.5rem', color: '#1A1A1A', marginBottom: '0.5rem' }}>No firms match your filters.</p>
              <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.85rem', color: '#4A4A4A' }}>Try broadening your search.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1px', backgroundColor: '#E8E0D5', border: '0.5px solid #E8E0D5' }}>
              {filtered.map(firm => (
                <Link key={firm.slug} href={`/firms/${firm.slug}`}
                  style={{ backgroundColor: '#FAF7F2', padding: '1.75rem', textDecoration: 'none', display: 'block', transition: 'background-color 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FAF7F2')}>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <FirmAvatar logoFile={firm.logoFile} name={firm.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' as const }}>
                        <span style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#1A1A1A', opacity: 0.5 }}>
                          {firm.tier}
                        </span>
                        <span style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#2D6A4F' }}>
                          Verified
                        </span>
                      </div>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.2 }}>{firm.name}</p>
                    </div>
                  </div>

                  <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.8rem', color: '#4A4A4A', lineHeight: 1.65, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                    {firm.description}
                  </p>

                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' as const, marginBottom: '1rem' }}>
                    {firm.practiceAreas.slice(0, 3).map((area: string) => (
                      <span key={area} style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.68rem', backgroundColor: '#F0EBE3', color: '#4A4A4A', padding: '2px 7px', borderRadius: '2px' }}>{area}</span>
                    ))}
                    {firm.practiceAreas.length > 3 && (
                      <span style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.68rem', color: '#4A4A4A', padding: '2px 4px' }}>+{firm.practiceAreas.length - 3} more</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '0.5px solid #E8E0D5' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.72rem', color: '#4A4A4A' }}>
                        <MapPinIcon />{firm.offices.map((o: { city: string; address: string }) => o.city).join(' · ')}
                      </span>
                      {firm.openRoles > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.72rem', color: '#2D6A4F', fontWeight: 600 }}>
                          <BriefcaseIcon />{firm.openRoles} open role{firm.openRoles !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#1A1A1A' }}><ArrowRightIcon /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
