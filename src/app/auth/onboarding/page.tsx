'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano',
  'Benin City', 'Enugu', 'Kaduna', 'Onitsha', 'Calabar',
  'Warri', 'Jos', 'Owerri', 'Akure', 'Uyo',
  'Abeokuta', 'Ilorin', 'Asaba', 'Sokoto', 'Maiduguri',
]

const STAGES = [
  { value: 'law_student', label: 'Law Student' },
  { value: 'nysc', label: 'NYSC' },
  { value: 'junior_associate', label: 'Junior Associate' },
  { value: 'senior_lawyer', label: 'Senior Lawyer' },
]

const GOALS = [
  { value: 'jobs', label: 'Jobs' },
  { value: 'scholarships', label: 'Scholarships' },
  { value: 'all', label: 'All of the above' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [stage, setStage] = useState('')
  const [goal, setGoal] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  function next() {
    setDirection('forward')
    setStep(s => s + 1)
  }

  function back() {
    setDirection('back')
    setStep(s => s - 1)
  }

  async function finish() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await (supabase as any).from('profiles').upsert({
        id: user.id,
        career_stage: stage,
        goals: goal,
        location: city,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
    }
    router.push('/jobs')
  }

  const questions = [
    {
      key: 'stage',
      question: 'What stage are you at?',
      options: STAGES,
      value: stage,
      set: setStage,
    },
    {
      key: 'goal',
      question: 'What are you looking for?',
      options: GOALS,
      value: goal,
      set: setGoal,
    },
    {
      key: 'city',
      question: 'Where are you based in Nigeria?',
      options: CITIES.map(c => ({ value: c.toLowerCase(), label: c })),
      value: city,
      set: setCity,
    },
  ]

  const current = questions[step]
  const isLast = step === questions.length - 1

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F0', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '1.25rem 2rem', borderBottom: '0.5px solid #E8E0D5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1A1A1A' }}>
          Esquirely.
        </span>
        <button onClick={() => router.push('/jobs')} style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em' }}>
          Skip for now
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: '2px', backgroundColor: '#E8E0D5' }}>
        <div style={{ height: '100%', backgroundColor: '#1A1A1A', width: ((step + 1) / questions.length * 100) + '%', transition: 'width 0.4s ease' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          {/* Step circle indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem' }}>
            {questions.map((q, i) => (
              <div key={q.key} style={{ display: 'flex', alignItems: 'center', flex: i < questions.length - 1 ? 1 : 'initial' }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: i < step ? '#1A1A1A' : i === step ? '#1A1A1A' : 'transparent',
                  border: i === step ? '0.5px solid #1A1A1A' : i < step ? 'none' : '0.5px solid #E8E0D5',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease',
                }}>
                  {i < step ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FAF6F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <span style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: i === step ? '#FAF6F0' : '#A89A8A' }}>{i + 1}</span>
                  )}
                </div>
                {i < questions.length - 1 && (
                  <div style={{ flex: 1, height: '1px', backgroundColor: i < step ? '#1A1A1A' : '#E8E0D5', margin: '0 8px', transition: 'background-color 0.3s ease' }} />
                )}
              </div>
            ))}
          </div>

          {/* Step counter */}
          <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '1.25rem' }}>
            {step + 1} of {questions.length}
          </p>

          {/* Question + options, animated */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ x: direction === 'forward' ? 40 : -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === 'forward' ? -40 : 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
            {current.options.map(option => {
              const selected = current.value === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    current.set(option.value)
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '1rem 1.25rem',
                    backgroundColor: selected ? '#1A1A1A' : '#fff',
                    border: selected ? '0.5px solid #1A1A1A' : '0.5px solid #E8E0D5',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontFamily: 'Schibsted Grotesk, sans-serif',
                    fontSize: '0.92rem',
                    fontWeight: selected ? 600 : 400,
                    color: selected ? '#FAF6F0' : '#1A1A1A',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#1A1A1A' }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = '#E8E0D5' }}
                >
                  {option.label}
                  {selected && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAF6F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )
            })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {step > 0 ? (
              <button onClick={back} style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.78rem', color: '#4A4A4A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '0.04em' }}>
                Back
              </button>
            ) : <div />}

            <button
              onClick={isLast ? finish : next}
              disabled={!current.value || saving}
              style={{
                padding: '0.85rem 2.5rem',
                backgroundColor: (!current.value || saving) ? '#C8BEB4' : '#1A1A1A',
                color: '#FAF6F0',
                border: 'none',
                borderRadius: '2px',
                fontFamily: 'Schibsted Grotesk, sans-serif',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: (!current.value || saving) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
              }}
            >
              {saving ? 'Saving...' : isLast ? 'Finish' : 'Continue'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
