'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ALL_FIRMS, getMonogram, type FirmTier } from '@/lib/firms-data'

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
  return (
    <div style={{
      width: '48px', height: '48px', flexShrink: 0, borderRadius: '2px',
      border: '0.5px solid #E8E0D5', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    }}>
      {url ? (
        <img src={url} alt={name} width={48} height={48}
          style={{ objectFit: 'contain', width: '80%', height: '80%' }}
          onError={() => setFailed(true)} />
      ) : (
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2D6A4F' }}>Verified</span>
                      </div>
                      <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '0.95rem', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.2 }}>{firm.name}</p>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4A4A4A', lineHeight: 1.65, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {firm.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {firm.practiceAreas.slice(0, 3).map((area: string) => (
                      <span key={area} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', backgroundColor: '#F0EBE3', color: '#4A4A4A', padding: '2px 7px', borderRadius: '2px' }}>{area}</span>
                    ))}
                    {firm.practiceAreas.length > 3 && (
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: '#4A4A4A', padding: '2px 4px' }}>+{firm.practiceAreas.length - 3} more</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '0.5px solid #E8E0D5' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A' }}>
                        <MapPinIcon />{firm.offices.map((o: any) => o.city).join(' · ')}
                      </span>
                      {firm.openRoles > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#2D6A4F', fontWeight: 600 }}>
                          <BriefcaseIcon />{firm.openRoles} open role{firm.openRoles !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#8B3A3A' }}><ArrowRightIcon /></span>
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
