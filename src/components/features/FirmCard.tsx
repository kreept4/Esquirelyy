'use client'
import { useState } from 'react'

import Link from 'next/link'
import { MapPin, ExternalLink } from 'lucide-react'
import type { Firm } from '@/types/database'
import { TIER_LABELS } from '@/types/database'

interface FirmCardProps {
  firm: Firm
  liveRoles?: number
  animate?: boolean
  delay?: number
}

// Generate initials monogram for firms without logos
function getMonogram(name: string): string {
  return name
    .split(' ')
    .filter(w => w.length > 2 && !['&', 'and', 'LLP', 'LP', 'Co', 'the'].includes(w))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

const TIER_COLORS: Record<string, string> = {
  tier_1: '#1A1A1A',
  tier_2: '#1B3A5E',
  tier_3: '#2E5080',
  boutique: '#2D6A4F',
  court: '#4A4A4A',
  institution: '#4A4A4A',
}


function FirmLogo({ logoFile, monogram, tierColor }: { logoFile?: string | null; monogram: string; tierColor: string }) {
  const [failed, setFailed] = useState(false)
  const url = logoFile && !failed ? 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/' + logoFile.replace(/ /g, '%20') : null
  return (
    <div style={{
      width: '48px', height: '48px', flexShrink: 0, borderRadius: '2px',
      border: '0.5px solid #E8E0D5', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: url ? '#FFFFFF' : tierColor,
    }}>
      {url ? (
        <img src={url} alt={monogram} width={48} height={48}
          style={{ objectFit: 'contain', width: '80%', height: '80%' }}
          onError={() => setFailed(true)} />
      ) : (
        <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: '1rem', color: '#FAF7F2' }}>
          {monogram}
        </span>
      )}
    </div>
  )
}


export default function FirmCard({ firm, liveRoles = 0, animate = false, delay = 0 }: FirmCardProps) {
  const monogram = getMonogram(firm.name)
  const tierColor = TIER_COLORS[firm.tier] || '#4A4A4A'

  return (
    <article
      className={`card-esquirely ${animate ? `animate-fade-up delay-${delay}` : ''}`}
      style={{ padding: '1.5rem' }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <FirmLogo logoFile={firm.logoFile} monogram={monogram} tierColor={tierColor} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tier + verified */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span className="label-caps" style={{
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: tierColor,
            }}>
              {TIER_LABELS[firm.tier]}
            </span>
            {firm.verified && (
              <span className="label-caps badge-verified" style={{ padding: '1px 6px', borderRadius: '2px', fontSize: '0.58rem' }}>
                ✓ Verified
              </span>
            )}
          </div>

          {/* Firm name */}
          <Link
            href={`/firms/${firm.slug}`}
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#1A1A1A',
              textDecoration: 'none',
              display: 'block',
              lineHeight: 1.3,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1A1A1A')}
            onMouseLeave={e => (e.currentTarget.style.color = '#1A1A1A')}
          >
            {firm.name}
          </Link>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
            <MapPin size={11} color="#4A4A4A" />
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.78rem', color: '#4A4A4A' }}>
              {firm.city}, {firm.state}
            </span>
          </div>
        </div>
      </div>

      {/* Practice areas */}
      {firm.practice_areas.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {firm.practice_areas.slice(0, 3).map(area => (
            <span key={area} style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.7rem',
              color: '#4A4A4A',
              backgroundColor: '#F0EBE3',
              padding: '2px 8px',
              borderRadius: '2px',
            }}>
              {area}
            </span>
          ))}
          {firm.practice_areas.length > 3 && (
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.7rem',
              color: '#4A4A4A',
            }}>
              +{firm.practice_areas.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: '1rem',
        paddingTop: '0.75rem',
        borderTop: '0.5px solid #E8E0D5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href={`/firms/${firm.slug}`} style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#1A1A1A',
          textDecoration: 'none',
        }}>
          {liveRoles > 0 ? `${liveRoles} open role${liveRoles > 1 ? 's' : ''}` : 'View profile →'}
        </Link>

        {firm.website && (
          <a
            href={firm.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4A4A4A', display: 'flex', alignItems: 'center' }}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </article>
  )
}

