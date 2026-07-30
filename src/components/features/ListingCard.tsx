'use client'

import Link from 'next/link'
import { MapPin, Clock, BookmarkPlus } from 'lucide-react'
import { formatDistanceToNow, differenceInDays, parseISO } from 'date-fns'
import type { Listing } from '@/types/database'
import { LISTING_TYPE_LABELS, TIER_LABELS } from '@/types/database'

interface ListingCardProps {
  listing: Listing
  showFirm?: boolean
  animate?: boolean
  delay?: number
}

function getDeadlineStatus(deadline: string | null, isRolling: boolean) {
  if (isRolling) return { label: 'Rolling', variant: 'new' as const }
  if (!deadline) return null
  const days = differenceInDays(parseISO(deadline), new Date())
  if (days < 0) return { label: 'Closed', variant: 'closing' as const }
  if (days <= 7) return { label: `${days}d left`, variant: 'closing' as const }
  if (days <= 21) return { label: `${days}d left`, variant: 'new' as const }
  return { label: formatDistanceToNow(parseISO(deadline), { addSuffix: false }), variant: 'new' as const }
}

export default function ListingCard({ listing, showFirm = true, animate = false, delay = 0 }: ListingCardProps) {
  const deadlineStatus = getDeadlineStatus(listing.deadline, listing.is_rolling)
  const isClosingSoon = deadlineStatus?.variant === 'closing'

  return (
    <article
      className={`card-esquirely ${animate ? `animate-fade-up delay-${delay}` : ''}`}
      style={{ padding: '1.5rem', position: 'relative' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          {/* Type + level badges */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className="label-caps badge-new" style={{ padding: '2px 8px', borderRadius: '2px' }}>
              {LISTING_TYPE_LABELS[listing.type]}
            </span>
            {listing.level && (
              <span className="label-caps" style={{
                padding: '2px 8px',
                borderRadius: '2px',
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#4A4A4A',
                backgroundColor: '#F0EBE3',
              }}>
                {listing.level.replace('_', ' ')}
              </span>
            )}
            {listing.is_verified && (
              <span className="label-caps badge-verified" style={{ padding: '2px 8px', borderRadius: '2px' }}>
                ✓ Verified
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/jobs/${listing.slug}`}
            style={{
              fontFamily: 'Schibsted Grotesk, sans-serif',
              fontSize: '1.05rem',
              fontWeight: 600,
              color: '#1A1A1A',
              textDecoration: 'none',
              lineHeight: 1.3,
              display: 'block',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1A1A1A')}
            onMouseLeave={e => (e.currentTarget.style.color = '#1A1A1A')}
          >
            {listing.title}
          </Link>

          {/* Firm name */}
          {showFirm && listing.firm && (
            <Link
              href={`/firms/${listing.firm.slug}`}
              style={{
                fontFamily: 'Schibsted Grotesk, sans-serif',
                fontSize: '0.82rem',
                color: '#1A1A1A',
                textDecoration: 'none',
                display: 'block',
                marginTop: '0.25rem',
              }}
            >
              {listing.firm.name}
              {listing.firm.tier && (
                <span style={{ color: '#4A4A4A', marginLeft: '0.5rem' }}>
                  · {TIER_LABELS[listing.firm.tier]}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Save button */}
        <button
          style={{
            background: 'none',
            border: '0.5px solid #E8E0D5',
            borderRadius: '2px',
            padding: '6px',
            cursor: 'pointer',
            color: '#4A4A4A',
            flexShrink: 0,
            transition: 'border-color 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#1A1A1A'
            e.currentTarget.style.color = '#1A1A1A'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#E8E0D5'
            e.currentTarget.style.color = '#4A4A4A'
          }}
          title="Save listing"
        >
          <BookmarkPlus size={14} />
        </button>
      </div>

      {/* Meta row */}
      <div style={{
        display: 'flex',
        gap: '1.25rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '0.5px solid #E8E0D5',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4A4A4A', fontSize: '0.78rem', fontFamily: 'Schibsted Grotesk, sans-serif' }}>
          <MapPin size={12} />
          {listing.location}
          {listing.is_remote && ' · Remote'}
          {listing.is_hybrid && ' · Hybrid'}
        </span>

        {listing.practice_areas.length > 0 && (
          <span style={{ color: '#4A4A4A', fontSize: '0.78rem', fontFamily: 'Schibsted Grotesk, sans-serif' }}>
            {listing.practice_areas.slice(0, 2).join(' · ')}
          </span>
        )}

        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {deadlineStatus && (
            <span
              className={`label-caps ${isClosingSoon ? 'badge-closing' : 'badge-new'}`}
              style={{ padding: '2px 8px', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Clock size={9} />
              {deadlineStatus.label}
            </span>
          )}
        </span>
      </div>
    </article>
  )
}
