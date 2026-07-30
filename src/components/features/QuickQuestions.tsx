'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

/**
 * Three-question preference quiz, inlined on the home page.
 *
 * Mirrors auth/onboarding's shape (career stage / goal / city) so an answer
 * given here is the same answer given there. Signed-in visitors get it written
 * to their profile; everyone else gets it in localStorage, which onboarding can
 * pick up later rather than asking twice.
 */

const PREFS_KEY = 'esquirely:prefs'

const STAGES = [
  { value: 'law_student', label: 'Law student', level: 'student' },
  { value: 'nysc', label: 'NYSC', level: 'nysc' },
  { value: 'junior_associate', label: 'Junior associate', level: 'junior' },
  { value: 'senior_lawyer', label: 'Senior lawyer', level: 'senior' },
]

const GOALS = [
  { value: 'jobs', label: 'Jobs and schemes', href: '/jobs' },
  { value: 'scholarships', label: 'Scholarships', href: '/scholarships' },
  { value: 'all', label: 'All of the above', href: '/opportunities' },
]

const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Anywhere']

type Answers = { stage: string; goal: string; city: string }

const QUESTIONS: {
  key: keyof Answers
  question: string
  options: { value: string; label: string }[]
}[] = [
  { key: 'stage', question: 'where are you right now?', options: STAGES },
  { key: 'goal', question: 'what are you looking for?', options: GOALS },
  {
    key: 'city',
    question: 'where do you want to work?',
    options: CITIES.map((c) => ({ value: c, label: c })),
  },
]

export default function QuickQuestions() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [answers, setAnswers] = useState<Answers>({ stage: '', goal: '', city: '' })
  const [saving, setSaving] = useState(false)

  const current = QUESTIONS[step]
  const isLast = step === QUESTIONS.length - 1

  async function persist(final: Answers) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(final))
    } catch {
      // Private browsing or storage disabled — the redirect below still works.
    }
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await (supabase as any).from('profiles').upsert({
          id: user.id,
          career_stage: final.stage,
          goals: final.goal,
          location: final.city === 'Anywhere' ? null : final.city,
          updated_at: new Date().toISOString(),
        })
      }
    } catch {
      // Never block the visitor on a profile write.
    }
  }

  async function choose(value: string) {
    const next = { ...answers, [current.key]: value }
    setAnswers(next)

    if (!isLast) {
      setDirection('forward')
      setStep((s) => s + 1)
      return
    }

    setSaving(true)
    await persist(next)

    const goal = GOALS.find((g) => g.value === next.goal)
    const level = STAGES.find((s) => s.value === next.stage)?.level
    const params = new URLSearchParams()
    if (level) params.set('level', level)
    if (next.city && next.city !== 'Anywhere') params.set('location', next.city)
    const query = params.toString()
    router.push((goal?.href || '/jobs') + (query ? `?${query}` : ''))
  }

  function back() {
    setDirection('back')
    setStep((s) => s - 1)
  }

  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <h2
          className="display-black"
          style={{
            fontSize: 'clamp(1.9rem, 4.5vw, 3rem)',
            color: '#FAF6F0',
            lineHeight: 1.1,
            marginBottom: '2.5rem',
          }}
        >
          tell us what you want, we&rsquo;ll show you the rest.
        </h2>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.25rem' }}>
          {QUESTIONS.map((q, i) => (
            <div
              key={q.key}
              style={{ display: 'flex', alignItems: 'center', flex: i < QUESTIONS.length - 1 ? 1 : 'initial' }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: i <= step ? '#FAF6F0' : 'transparent',
                  border: i <= step ? 'none' : '0.5px solid rgba(250,246,240,0.3)',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease',
                }}
              >
                {i < step ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span
                    className="grotesk-bold"
                    style={{ fontSize: '0.65rem', color: i === step ? '#1A1A1A' : 'rgba(250,246,240,0.5)' }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              {i < QUESTIONS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    backgroundColor: i < step ? '#FAF6F0' : 'rgba(250,246,240,0.18)',
                    margin: '0 8px',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction === 'forward' ? 40 : -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === 'forward' ? -40 : 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <h3
              className="display-bold"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#FAF6F0', marginBottom: '1.75rem' }}
            >
              {current.question}
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {current.options.map((opt) => {
                const selected = answers[current.key] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => choose(opt.value)}
                    disabled={saving}
                    className="grotesk-regular quick-q-option"
                    style={{
                      padding: '0.8rem 1.5rem',
                      fontSize: '0.88rem',
                      color: selected ? '#1A1A1A' : '#FAF6F0',
                      backgroundColor: selected ? '#FAF6F0' : 'transparent',
                      border: '1px solid rgba(250,246,240,0.25)',
                      borderRadius: '999px',
                      cursor: saving ? 'wait' : 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {step > 0 && (
            <button
              onClick={back}
              disabled={saving}
              className="grotesk-regular"
              style={{
                fontSize: '0.78rem',
                color: 'rgba(250,246,240,0.6)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={() => router.push('/jobs')}
            disabled={saving}
            className="grotesk-regular"
            style={{
              fontSize: '0.78rem',
              color: 'rgba(250,246,240,0.4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {saving ? 'Setting things up…' : 'Skip for now'}
          </button>
        </div>
      </div>
    </section>
  )
}
