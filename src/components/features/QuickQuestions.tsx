'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUIZ_PRACTICE_AREAS } from '@/lib/practice-areas'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

/**
 * Four-question preference quiz, inlined on the home page.
 *
 * Mirrors auth/onboarding’s shape (career stage / goal / city) so an answer
 * given here is the same answer given there. Signed-in visitors get it written
 * to their profile; everyone else gets it in localStorage, which onboarding can
 * pick up later rather than asking twice.
 */

const PREFS_KEY = 'esquirely:prefs'
/** Set when a signed-in member skips or closes the questionnaire on the board,
 *  so the prompt there asks once rather than on every visit. */
export const QUIZ_DISMISSED_KEY = 'esquirely:quiz-dismissed'

function readStored(): Answers | null {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    const saved = raw ? JSON.parse(raw) : null
    return saved && saved.stage ? saved : null
  } catch {
    return null
  }
}

/**
 * Write answers to the member's profile. Shared by the questionnaire itself and
 * by syncStoredAnswers below.
 */
async function saveToProfile(final: Answers) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await (supabase as any).from('profiles').upsert({
      id: user.id,
      career_stage: final.stage,
      goals: final.goal,
      location: final.city === 'Anywhere' ? null : final.city,
      practice_areas: final.area ? [final.area] : [],
      updated_at: new Date().toISOString(),
    })
    if (error) console.error('[quiz] could not save profile', error)
  } catch (err) {
    console.error('[quiz] could not save profile', err)
  }
}

/**
 * Whether a signed-in member still needs asking, after carrying over answers
 * given on this device before they signed in.
 *
 * ⚠ THIS IS WHY ONLY 2 OF 221 PROFILES HELD ANSWERS ON 12 NOVEMBER. Most people
 * meet the questionnaire on the home page signed out. Their answers went to
 * localStorage only, and nothing copied them to the profile after sign-up, so
 * the account never learned them and the home page, reading localStorage,
 * never asked again.
 *
 * Returns 'answered' (profile holds a stage, possibly just copied), 'ask', or
 * 'signed-out'.
 */
export async function syncStoredAnswers(): Promise<'answered' | 'ask' | 'signed-out'> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'signed-out'
    const { data } = await (supabase as any)
      .from('profiles')
      .select('career_stage')
      .eq('id', user.id)
      .maybeSingle()
    if (data?.career_stage) return 'answered'
    const stored = readStored()
    if (stored) {
      await saveToProfile(stored)
      return 'answered'
    }
    return 'ask'
  } catch {
    return 'ask'
  }
}

const STAGES = [
  { value: 'law_student', label: 'Law student', level: 'student' },
  { value: 'nysc', label: 'Entry-level', level: 'junior' },
  { value: 'junior_associate', label: 'Junior associate', level: 'junior' },
  { value: 'senior_lawyer', label: 'Senior lawyer', level: 'senior' },
]

/* A law student is not looking for a job, they are looking for an internship,
   and calling it a job sends them to a board filtered to roles that require a
   call to the Bar. The wording and the destination both change with the stage
   answer, which is the only reason the stage question comes first. */
function goalsFor(stage: string) {
  const student = stage === 'law_student'
  return [
    student
      ? { value: 'jobs', label: 'Internships', href: '/jobs?type=internship' }
      : { value: 'jobs', label: 'Jobs', href: '/jobs' },
    { value: 'scholarships', label: 'Scholarships', href: '/scholarships' },
    {
      value: 'all',
      label: 'All of the above',
      href: student ? '/jobs?type=internship' : '/jobs',
    },
  ]
}
const GOALS = goalsFor('')

const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Anywhere']

/**
 * The area of law question.
 *
 * ⚠ "NOT SURE YET" IS FIRST, AND IT IS THE HONEST DEFAULT. The people this quiz
 * is mostly for are law students, and a law student who has not yet done their
 * electives has no answer to this. Putting the six areas first and leaving them
 * to hunt for an escape implies they ought to know, and pushes them into picking
 * one at random, which then filters the board down for a reason they did not
 * intend. First position and plain wording make declining the question the easy
 * move rather than the awkward one.
 *
 * The values come from lib/practice-areas.ts, which is also what the board's
 * filter reads. They are data, not labels: the string written into ?practice=
 * has to match `practice_areas` on a listing exactly, so the two sides cannot
 * be allowed to drift.
 */
const AREAS = [
  { value: '', label: 'Not sure yet' },
  ...QUIZ_PRACTICE_AREAS.map(a => ({ value: a, label: a })),
]

type Answers = { stage: string; goal: string; city: string; area: string }

const QUESTIONS: {
  key: keyof Answers
  question: string
  options: { value: string; label: string }[]
}[] = [
  { key: 'stage', question: 'Where are you right now?', options: STAGES },
  { key: 'goal', question: 'What are you looking for?', options: GOALS },
  {
    key: 'city',
    question: 'Where do you want to work?',
    options: CITIES.map((c) => ({ value: c, label: c })),
  },
  /* Last, deliberately. Stage and goal change what the other questions mean and
     where the answer sends you; this one only narrows the result, so it is the
     cheapest to abandon halfway. Asking it earlier would put the hardest
     question in front of somebody who has not yet been told what they are
     filling in. */
  { key: 'area', question: 'Which area of law?', options: AREAS },
]

export default function QuickQuestions({
  variant = 'section',
  onClose,
}: {
  /** 'section' is the home page band. 'modal' is the one-time prompt on the
   *  board for signed-in members who have not answered (see QuizPrompt). */
  variant?: 'section' | 'modal'
  onClose?: () => void
} = {}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [answers, setAnswers] = useState<Answers>({ stage: '', goal: '', city: '', area: '' })
  const [saving, setSaving] = useState(false)

  /**
   * ⚠ ASK ONCE. THIS SECTION USED TO COME BACK FOR EVERY VISITOR, FOREVER.
   *
   * persist() below has always written the answers twice, to localStorage and
   * to `profiles`, and the header of this file says the second copy exists so
   * that onboarding does not "ask twice". Nothing ever read either of them
   * back, and page.tsx renders this component unconditionally, so a member who
   * answered all four questions in August was asked the same four questions on
   * every home page visit since. It was reported as the questionnaire popping
   * up for returning users, which is exactly what it was.
   *
   * `resolved` is a third state, not a boolean flip, and it matters. The home
   * page is statically generated on an hourly revalidate, so the server has no
   * idea who is looking: localStorage only exists after mount. Rendering the
   * quiz first and hiding it once the check comes back would show the section
   * to everyone for a frame and then yank it, which is worse than the bug. So
   * nothing renders until the answer is known.
   *
   * BOTH SOURCES ARE CHECKED, and localStorage first because it needs no
   * network. The profile is the fallback for somebody who answered on their
   * phone and opened the site on a laptop: same person, same answers, empty
   * localStorage. A signed-out visitor only ever hits the first check.
   */
  const [resolved, setResolved] = useState(false)
  const [alreadyAnswered, setAlreadyAnswered] = useState(false)

  useEffect(() => {
    let live = true
    if (variant === 'modal') {
      setResolved(true)
      return
    }

    ;(async () => {
      /* Carry answers given signed-out over to a signed-in profile. */
      const sync = await syncStoredAnswers()
      if (sync === 'answered') {
        if (live) { setAlreadyAnswered(true); setResolved(true) }
        return
      }
      try {
        const raw = localStorage.getItem(PREFS_KEY)
        if (raw) {
          const saved = JSON.parse(raw)
          /* `stage` is the first question and the one every other answer keys
             off, so its presence is what "answered" means. A half-finished run
             never reaches persist(), so a stored stage implies a full set. */
          if (saved && saved.stage) {
            if (live) { setAlreadyAnswered(true); setResolved(true) }
            return
          }
        }
      } catch {
        // Private browsing or storage disabled. Fall through to the profile.
      }

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await (supabase as any)
            .from('profiles')
            .select('career_stage')
            .eq('id', user.id)
            .maybeSingle()
          if (data?.career_stage && live) {
            setAlreadyAnswered(true)
            setResolved(true)
            return
          }
        }
      } catch {
        /* Never let a failed lookup hide the quiz: showing it to somebody who
           already answered is a small annoyance, hiding it from somebody who
           has not is the feature not existing. */
      }

      if (live) setResolved(true)
    })()

    return () => { live = false }
  }, [variant])

  const stageGoals = goalsFor(answers.stage)
  const base = QUESTIONS[step]
  const current = base.key === 'goal' ? { ...base, options: stageGoals } : base
  const isLast = step === QUESTIONS.length - 1

  async function persist(final: Answers) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(final))
    } catch {
      // Private browsing or storage disabled. The redirect below still works.
    }
    /* All four answers go to the profile, practice area included: it used to
       be collected for the redirect and never stored. "Not sure yet" writes an
       empty array, not [''], so it never counts as a stated preference. */
    await saveToProfile(final)
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
    if (variant === 'modal') onClose?.()

    const goal = goalsFor(next.stage).find((g) => g.value === next.goal)
    const level = STAGES.find((s) => s.value === next.stage)?.level
    const params = new URLSearchParams()
    if (level) params.set('level', level)
    if (next.city && next.city !== 'Anywhere') params.set('location', next.city)
    /* "Not sure yet" is an empty value, so it writes no filter rather than
       narrowing the board to an area nobody chose. Answering the question and
       declining it are different things, and only one of them should change
       what the reader lands on. */
    if (next.area) params.set('practice', next.area)
    // The internship destination already carries ?type=internship, so level and
    // location have to merge into it rather than start a second query string.
    const href = goal?.href || '/jobs'
    const [path, existing] = href.split('?')
    const merged = new URLSearchParams(existing || '')
    params.forEach((v, k) => merged.set(k, v))
    const query = merged.toString()
    router.push(path + (query ? `?${query}` : ''))
  }

  function back() {
    setDirection('back')
    setStep((s) => s - 1)
  }

  /* Nothing until we know, and nothing ever again once they have answered. See
     the note on `resolved` above. Returning null rather than a collapsed
     section keeps the dark run continuous: the ticker, the carousel and the pit
     all share this background, so a zero-height gap here is invisible. */
  if (!resolved) return null

  /* Answered already: a single line instead of nothing, so the answers can be
     changed. Before 12 November there was no way back to these questions
     once answered, short of clearing the browser. */
  if (alreadyAnswered && variant === 'section') {
    return (
      <section style={{ backgroundColor: '#000000', padding: '2.25rem 1.5rem' }}>
        <div
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '0.75rem 1.5rem',
          }}
        >
          <p className="grotesk-regular" style={{ fontSize: '0.95rem', color: 'rgba(250,246,240,0.75)', margin: 0 }}>
            Your board is set to your answers.
          </p>
          <button
            onClick={() => { setAnswers({ stage: '', goal: '', city: '', area: '' }); setStep(0); setAlreadyAnswered(false) }}
            className="grotesk-bold"
            style={{
              fontSize: '0.85rem',
              color: '#FAF6F0',
              background: 'none',
              border: 'none',
              borderBottom: '2px solid #14B8A6',
              padding: '0 0 2px',
              cursor: 'pointer',
            }}
          >
            Change your answers
          </button>
        </div>
      </section>
    )
  }

  function skip() {
    if (variant === 'modal') {
      try { localStorage.setItem(QUIZ_DISMISSED_KEY, new Date().toISOString()) } catch {}
      onClose?.()
      return
    }
    router.push('/jobs')
  }

  const body = (

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
          {variant === 'modal' ? 'Set up your board' : <>Tell us what you want, we&rsquo;ll show you the rest.</>}
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
                      color: selected ? '#FFFFFF' : '#FAF6F0',
                      backgroundColor: selected ? '#14B8A6' : 'transparent',
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
            onClick={skip}
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
  )

  if (variant === 'modal') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Set up your board"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: '#000000',
            borderRadius: '16px',
            padding: 'clamp(1.75rem, 5vw, 3rem) clamp(1.25rem, 5vw, 3rem)',
            width: '100%',
            maxWidth: '760px',
            maxHeight: '100%',
            overflowY: 'auto',
          }}
        >
          {body}
        </div>
      </div>
    )
  }

  // #1A1A1A left a faint seam where this met the black sections above it.
  // The whole dark run shares one value now.
  return <section style={{ backgroundColor: '#000000', padding: '5rem 1.5rem' }}>{body}</section>
}
