const fs = require('fs');

fs.writeFileSync('src/app/auth/welcome/page.tsx', `'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type UserType = 'student' | 'graduate' | null

const WELCOME_COPY = {
  student: {
    headline: 'Your legal career starts here.',
    body: [
      "Law school is demanding, and nobody really hands you a map for what comes after. Where do you find vacation schemes? Which firms actually take students seriously? What even is a clerkship?",
      "Esquirely exists to answer those questions. Every listing here was sourced with students in mind, from first year curiosity to final year applications. You will find firms, opportunities, scholarships, and guidance built specifically for where you are right now.",
      "Glad to have you. Let us get started."
    ]
  },
  graduate: {
    headline: 'You belong in this room.',
    body: [
      "Whether you are navigating call to bar, figuring out NYSC placement, hunting for your first associate position, or looking for your next move at a larger firm or an in-house team, you are in the right place.",
      "The Nigerian legal market has never had a dedicated careers platform built by lawyers, for lawyers. That changes now.",
      "Welcome to Esquirely. We are glad you found us."
    ]
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
      await (supabase as any).from('profiles').upsert({
        id: user.id,
        user_type: userType,
        updated_at: new Date().toISOString(),
      })
    }
    router.push('/auth/onboarding')
  }

  const copy = userType ? WELCOME_COPY[userType] : null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.25rem 2rem', borderBottom: '0.5px solid #E8E0D5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '1.25rem', color: '#1A1A1A' }}>
          Esquirely.
        </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', letterSpacing: '0.06em' }}>
          Step 1 of 2
        </span>
      </div>

      <div style={{ flex: 1, maxWidth: '760px', margin: '0 auto', padding: '4rem 2rem', width: '100%' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { initials: 'OB', name: 'Ogunleye Boluwatife' },
              { initials: 'OI', name: 'Ogunleye Ipinuoluwa' },
            ].map((f) => (
              <div key={f.initials} title={f.name} style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#8B3A3A', border: '2.5px solid #FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '0.8rem', color: '#FAF6F0', flexShrink: 0 }}>
                {f.initials}
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.15rem' }}>
              Ogunleye Boluwatife & Ogunleye Ipinuoluwa
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', letterSpacing: '0.04em' }}>
              Co-founders, Esquirely
            </p>
          </div>
        </div>

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#8B3A3A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
          I am a
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '3rem' }}>
          {([
            { value: 'student' as const, label: 'Law Student', sub: 'Currently enrolled in a Nigerian law faculty' },
            { value: 'graduate' as const, label: 'Graduate or Practicing Lawyer', sub: 'Called to bar, in NYSC, or already working' },
          ]).map(option => {
            const selected = userType === option.value
            return (
              <button key={option.value} onClick={() => setUserType(option.value)} style={{ textAlign: 'left', padding: '1.25rem 1.5rem', backgroundColor: selected ? '#8B3A3A' : '#fff', border: selected ? '0.5px solid #8B3A3A' : '0.5px solid #E8E0D5', borderRadius: '3px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1rem', fontWeight: 700, color: selected ? '#FAF6F0' : '#1A1A1A', marginBottom: '0.35rem' }}>
                  {option.label}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: selected ? 'rgba(250,246,240,0.65)' : '#4A4A4A', lineHeight: 1.5 }}>
                  {option.sub}
                </p>
              </button>
            )
          })}
        </div>

        {copy && (
          <div style={{ backgroundColor: '#fff', border: '0.5px solid #E8E0D5', borderLeft: '3px solid #8B3A3A', padding: '2rem 2rem 2rem 1.75rem', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 700, color: '#1A1A1A', marginBottom: '1.25rem', lineHeight: 1.2 }}>
              {copy.headline}
            </h2>
            {copy.body.map((para, i) => (
              <p key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem', color: '#2A2A2A', lineHeight: 1.85, marginBottom: i < copy.body.length - 1 ? '1rem' : 0 }}>
                {para}
              </p>
            ))}
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#8B3A3A', marginTop: '1.5rem', letterSpacing: '0.05em' }}>
              Ogunleye Boluwatife & Ogunleye Ipinuoluwa
            </p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={handleContinue} disabled={!userType || saving} style={{ padding: '0.85rem 2.5rem', backgroundColor: (!userType || saving) ? '#C8BEB4' : '#8B3A3A', color: '#FAF6F0', border: 'none', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: (!userType || saving) ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s ease' }}>
            {saving ? 'Saving...' : 'Continue'}
          </button>
          {!userType && (
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A' }}>
              Select your profile type to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
`);

console.log('done');