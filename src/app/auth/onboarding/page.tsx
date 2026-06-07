'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Check } from 'lucide-react'

const NIGERIAN_CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano',
  'Benin City', 'Enugu', 'Kaduna', 'Onitsha', 'Calabar',
  'Uyo', 'Warri', 'Owerri', 'Abeokuta', 'Ilorin',
  'Jos', 'Maiduguri', 'Sokoto', 'Akure', 'Asaba',
]

const LAW_AREAS = [
  'Corporate & Commercial',
  'Banking & Finance',
  'Capital Markets',
  'Energy & Natural Resources',
  'Dispute Resolution',
  'Arbitration',
  'Intellectual Property',
  'Employment & Labour',
  'Real Estate & Property',
  'Tax',
  'Criminal Law',
  'Public Law & Constitutional',
  'Maritime & Admiralty',
  'Telecommunications',
  'Technology & Startups',
  'Competition & Antitrust',
  'Private Equity & M&A',
  'Insurance',
  'Healthcare & Pharmaceutical',
  'Environmental Law',
  'Family Law',
  'Immigration',
  'Data Protection & Privacy',
  'NGO & International Law',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function toggleArea(area: string) {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )
  }

  async function handleFinish() {
    if (!location || selectedAreas.length === 0) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await (supabase.from('profiles') as any).upsert({
        id: user.id,
        location,
        preferred_areas: selectedAreas,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
    }

    router.push('/jobs')
  }

  const canFinish = location && selectedAreas.length > 0

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAF7F2',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '1.25rem 2rem',
        borderBottom: '0.5px solid #E8E0D5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#1A1A1A',
        }}>
          Esquirely
        </span>
        <span style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.72rem',
          color: '#4A4A4A',
          letterSpacing: '0.06em',
        }}>
          Step 2 of 2
        </span>
      </div>

      <div style={{
        flex: 1,
        maxWidth: '680px',
        margin: '0 auto',
        padding: '4rem 2rem',
        width: '100%',
      }}>

        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: '#8B3A3A',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}>
          Almost there
        </p>

        <h1 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
          fontWeight: 700,
          color: '#1A1A1A',
          lineHeight: 1.15,
          marginBottom: '0.75rem',
        }}>
          Personalise your experience
        </h1>

        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.9rem',
          color: '#4A4A4A',
          lineHeight: 1.7,
          marginBottom: '3rem',
          maxWidth: '520px',
        }}>
          Tell us where you are and what areas of law interest you. We use this to surface the most relevant listings and alerts for you.
        </p>

        {/* Location */}
        <div style={{ marginBottom: '3rem' }}>
          <label style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#1A1A1A',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '1rem',
          }}>
            <MapPin size={13} style={{ color: '#8B3A3A' }} />
            Current location
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {NIGERIAN_CITIES.map(city => {
              const active = location === city
              return (
                <button
                  key={city}
                  onClick={() => setLocation(city)}
                  style={{
                    padding: '0.45rem 1rem',
                    backgroundColor: active ? '#8B3A3A' : '#fff',
                    color: active ? '#FAF7F2' : '#1A1A1A',
                    border: active ? '0.5px solid #8B3A3A' : '0.5px solid #E8E0D5',
                    borderRadius: '100px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {active && <Check size={11} strokeWidth={3} />}
                  {city}
                </button>
              )
            })}
          </div>
        </div>

        {/* Law Areas */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#1A1A1A',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '0.3rem',
            }}>
              Preferred areas of law
            </label>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.78rem',
              color: '#4A4A4A',
            }}>
              Pick as many as you like. You can always update these later.
              {selectedAreas.length > 0 && (
                <span style={{ color: '#8B3A3A', fontWeight: 600, marginLeft: '0.5rem' }}>
                  {selectedAreas.length} selected
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {LAW_AREAS.map(area => {
              const active = selectedAreas.includes(area)
              return (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  style={{
                    padding: '0.5rem 1.1rem',
                    backgroundColor: active ? '#8B3A3A' : '#fff',
                    color: active ? '#FAF7F2' : '#1A1A1A',
                    border: active ? '0.5px solid #8B3A3A' : '0.5px solid #E8E0D5',
                    borderRadius: '100px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {active && <Check size={11} strokeWidth={3} />}
                  {area}
                </button>
              )
            })}
          </div>
        </div>

        {/* Finish */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleFinish}
            disabled={!canFinish || saving}
            style={{
              padding: '0.85rem 2.5rem',
              backgroundColor: (!canFinish || saving) ? '#B0BEC5' : '#8B3A3A',
              color: '#FAF7F2',
              border: 'none',
              borderRadius: '2px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: (!canFinish || saving) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            {saving ? 'Saving...' : 'Go to Esquirely'}
          </button>

          <button
            onClick={() => router.push('/jobs')}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.8rem',
              color: '#4A4A4A',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: '#E8E0D5',
            }}
          >
            Skip for now
          </button>
        </div>

        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.72rem',
          color: '#4A4A4A',
          marginTop: '1.25rem',
          lineHeight: 1.6,
        }}>
          You can update your preferences at any time from your account settings.
        </p>
      </div>
    </div>
  )
}
