'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type UserType = 'student' | 'graduate' | null

const WELCOME_COPY = {
  student: {
    headline: 'Your legal career starts here.',
    body: `We built Esquirely because we remember what it felt like to not know where to look. Law school in Nigeria is demanding, and yet nobody really tells you how to find the opportunities that shape your career.

This platform was made for you — whether you are in your first year wondering what practice areas even mean, navigating your penultimate year vacation scheme applications, or in your final year preparing for call to bar. Every listing on here was sourced and verified with students in mind.

You are in good hands. We are genuinely glad you are here.`,
  },
  graduate: {
    headline: 'You belong in this room.',
    body: `Welcome to Esquirely. If you are a law graduate navigating call to bar, NYSC placement, or your first associate position at a firm or in-house team, you are in the right place.

And if you are already a practicing lawyer looking for your next step — whether at a larger firm, a boutique practice, or a seat in-house at a bank, energy company, or fintech — this platform was built with your specific journey in mind.

The Nigerian legal market deserves a dedicated career platform. And so do you. We are glad you found us.`,
  },
}

export default function WelcomePage() {
  const router = useRouter()
  const [userType, setUserType] = useState<UserType>(null)
  const [saving, setSaving] = useState(false)

  async function handleContinue() {
    if (!userType) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        user_type: userType,
        updated_at: new Date().toISOString(),
      })
    }

    router.push('/auth/onboarding')
  }

  const copy = userType ? WELCOME_COPY[userType] : null

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
          Step 1 of 2
        </span>
      </div>

      <div style={{
        flex: 1,
        maxWidth: '760px',
        margin: '0 auto',
        padding: '4rem 2rem',
        width: '100%',
      }}>

        {/* Founders section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          marginBottom: '3rem',
        }}>
          {/* Founder 1 photo — replace /founders/boluwatife.jpg with actual photo */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { initials: 'OB', name: 'Ogunleye Boluwatife' },
              { initials: 'OI', name: 'Ogunleye Ipinuoluwa' },
            ].map((f) => (
              <div
                key={f.initials}
                title={f.name}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#0A2342',
                  border: '2.5px solid #FAF7F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: '#FAF7F2',
                  flexShrink: 0,
                  // To use real photos: replace this div with:
                  // <img src="/founders/boluwatife.jpg" alt="Boluwatife" style={{width:52,height:52,borderRadius:'50%',objectFit:'cover'}} />
                }}
              >
                {f.initials}
              </div>
            ))}
          </div>

          <div>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#1A1A1A',
              marginBottom: '0.15rem',
            }}>
              Ogunleye Boluwatife &amp; Ogunleye Ipinuoluwa
            </p>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.72rem',
              color: '#4A4A4A',
              letterSpacing: '0.04em',
            }}>
              Co-founders, Esquirely
            </p>
          </div>
        </div>

        {/* User type selector */}
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: '#0A2342',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '0.875rem',
        }}>
          I am a
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.75rem',
          marginBottom: '3rem',
        }}>
          {([
            {
              value: 'student' as const,
              label: 'Law Student',
              sub: 'Currently enrolled in a Nigerian law faculty',
            },
            {
              value: 'graduate' as const,
              label: 'Graduate or Practicing Lawyer',
              sub: 'Called to bar, in NYSC, or already working',
            },
          ] as const).map(option => {
            const selected = userType === option.value
            return (
              <button
                key={option.value}
                onClick={() => setUserType(option.value)}
                style={{
                  textAlign: 'left',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: selected ? '#0A2342' : '#fff',
                  border: selected ? '0.5px solid #0A2342' : '0.5px solid #E8E0D5',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <p style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: selected ? '#FAF7F2' : '#1A1A1A',
                  marginBottom: '0.35rem',
                }}>
                  {option.label}
                </p>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.78rem',
                  color: selected ? 'rgba(250,247,242,0.65)' : '#4A4A4A',
                  lineHeight: 1.5,
                }}>
                  {option.sub}
                </p>
              </button>
            )
          })}
        </div>

        {/* Personalized message — appears once user picks a type */}
        {copy && (
          <div style={{
            backgroundColor: '#fff',
            border: '0.5px solid #E8E0D5',
            borderLeft: '3px solid #0A2342',
            padding: '2rem 2rem 2rem 1.75rem',
            marginBottom: '2.5rem',
            animation: 'fadeIn 0.3s ease',
          }}>
            <h2 style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: '1.25rem',
              lineHeight: 1.2,
            }}>
              {copy.headline}
            </h2>
            {copy.body.split('\n\n').map((para, i) => (
              <p key={i} style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.92rem',
                color: '#2A2A2A',
                lineHeight: 1.85,
                marginBottom: i < copy.body.split('\n\n').length - 1 ? '1rem' : 0,
              }}>
                {para}
              </p>
            ))}
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#0A2342',
              marginTop: '1.5rem',
              letterSpacing: '0.05em',
            }}>
              Ogunleye Boluwatife &amp; Ogunleye Ipinuoluwa
            </p>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={handleContinue}
            disabled={!userType || saving}
            style={{
              padding: '0.85rem 2.5rem',
              backgroundColor: (!userType || saving) ? '#B0BEC5' : '#0A2342',
              color: '#FAF7F2',
              border: 'none',
              borderRadius: '2px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: (!userType || saving) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
          {!userType && (
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.78rem',
              color: '#4A4A4A',
            }}>
              Select your profile type to continue
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
