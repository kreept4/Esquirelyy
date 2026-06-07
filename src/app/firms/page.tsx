'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ALL_FIRMS, getMonogram, type FirmTier } from '@/lib/firms-data'

const TIER_OPTIONS: { value: string; label: string }[] = [
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
  'Corporate & Commercial',
  'Dispute Resolution',
  'Energy & Natural Resources',
  'Banking & Finance',
  'Capital Markets',
  'Tax',
  'Arbitration',
  'Intellectual Property',
  'Shipping & Maritime',
  'Public Law & Regulatory',
]

// SVG Icons
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const ArrowRightIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const MapPinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const BriefcaseIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
)
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)
const ShieldCheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
)


const STORAGE = 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/';

function FirmAvatar({ logoFile, name }: { logoFile?: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  const url = logoFile && !failed ? STORAGE + logoFile.replace(/ /g, '%20') : null
  return (
    <FirmAvatar logoFile={firm.logoFile} name={firm.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                        <p className="label-caps" style={{ color: '#8B3A3A', opacity: 0.6, fontSize: '0.58rem' }}>
                          {firm.tier}
                        </p>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          color: '#2D6A4F', fontSize: '0.58rem', fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                          <ShieldCheckIcon /> Verified
                        </span>
                      </div>
                      <p style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: '0.95rem', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.2,
                      }}>
                        {firm.name}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4A4A4A',
                    lineHeight: 1.65, marginBottom: '1rem',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {firm.description}
                  </p>

                  {/* Practice areas */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {firm.practiceAreas.slice(0, 3).map(area => (
                      <span key={area} style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem',
                        backgroundColor: '#F0EBE3', color: '#4A4A4A',
                        padding: '2px 7px', borderRadius: '2px',
                      }}>
                        {area}
                      </span>
                    ))}
                    {firm.practiceAreas.length > 3 && (
                      <span style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem',
                        color: '#4A4A4A', padding: '2px 4px',
                      }}>
                        +{firm.practiceAreas.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Footer row */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '0.75rem', borderTop: '0.5px solid #E8E0D5',
                  }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A' }}>
                        <MapPinIcon />
                        {firm.offices.map(o => o.city).join(' · ')}
                      </span>
                      {firm.openRoles > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#2D6A4F', fontWeight: 600 }}>
                          <BriefcaseIcon />
                          {firm.openRoles} open role{firm.openRoles !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#8B3A3A' }}><ArrowRightIcon size={14} /></span>
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
