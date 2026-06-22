const fs = require('fs');

fs.writeFileSync('src/app/tools/interview-prep/page.tsx', `'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Loader2, AlertCircle, ArrowRight, ChevronRight } from 'lucide-react'

type Question = {
  id: string
  question: string
  category: string
  whyTheyAsk: string
}

type Feedback = {
  score: number
  whatWorked: string[]
  whatToImprove: string[]
  strongerAnswer: string
}

const CAREER_STAGES = [
  { value: '', label: 'Select your stage' },
  { value: 'Final year law student', label: 'Final year law student' },
  { value: 'Recently called to bar', label: 'Recently called to bar' },
  { value: 'NYSC corps member', label: 'NYSC corps member' },
  { value: '1-3 years post-call', label: '1-3 years post-call' },
  { value: '3-6 years post-call', label: '3-6 years post-call' },
  { value: '6+ years post-call', label: '6+ years post-call' },
]

const accent = '#8B3A3A'
const ink = '#1A1A1A'
const muted = '#8C8275'
const cream = '#FAF6F0'
const rule = '#E8E0D5'

const fieldStyle = {
  width: '100%',
  padding: '0.6rem 0',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.92rem',
  color: ink,
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: '1px solid ' + rule,
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  display: 'block' as const,
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.7rem',
  fontWeight: 700 as const,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: muted,
  marginBottom: '0.6rem',
}

export default function InterviewPrepPage() {
  const [form, setForm] = useState({
    targetRole: '',
    employer: '',
    careerStage: '',
    practiceArea: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [persona, setPersona] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<Record<string, Feedback>>({})

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleGenerate() {
    if (!form.targetRole) {
      setError('Please enter the target role.')
      return
    }
    setLoading(true)
    setError('')
    setQuestions(null)
    setFeedbackByQuestion({})
    setActiveIndex(0)
    setAnswer('')

    try {
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'Something went wrong.'); return }
      setQuestions(data.questions)
      setPersona(data.interviewerPersona || '')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitAnswer() {
    if (!questions || !answer.trim()) return
    const current = questions[activeIndex]
    setFeedbackLoading(true)
    setFeedbackError('')

    try {
      const res = await fetch('/api/interview-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: current.question,
          answer: answer.trim(),
          targetRole: form.targetRole,
          employer: form.employer,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setFeedbackError(data.error || 'Something went wrong.'); return }
      setFeedbackByQuestion(f => ({ ...f, [current.id]: data }))
    } catch {
      setFeedbackError('Something went wrong. Please try again.')
    } finally {
      setFeedbackLoading(false)
    }
  }

  function goToQuestion(i: number) {
    setActiveIndex(i)
    setAnswer('')
    setFeedbackError('')
  }

  function handleReset() {
    setQuestions(null)
    setForm({ targetRole: '', employer: '', careerStage: '', practiceArea: '' })
    setError('')
    setFeedbackByQuestion({})
    setActiveIndex(0)
    setAnswer('')
  }

  const current = questions ? questions[activeIndex] : null
  const currentFeedback = current ? feedbackByQuestion[current.id] : null

  return (
    <div>
      <Navbar />
      <main style={{ backgroundColor: cream, paddingTop: '80px', minHeight: '100vh' }}>

        {!questions && (
          <>
            <div style={{ padding: '5rem 2rem 3rem' }}>
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: accent, opacity: 0.75, marginBottom: '0.75rem' }}>
                  AI Career Tools
                </p>
                <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, color: ink, marginBottom: '1rem', lineHeight: 1.1 }}>
                  Interview Prep
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', color: muted, lineHeight: 1.7, maxWidth: '480px' }}>
                  Tell us about the role. We will generate the questions you are likely to face and let you practice your answers with honest feedback.
                </p>
              </div>
            </div>

            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 2rem 6rem' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <label style={labelStyle}>Target role <span style={{ color: accent }}>*</span></label>
                  <input type="text" value={form.targetRole} onChange={e => set('targetRole', e.target.value)}
                    placeholder="e.g. Associate, Banking & Finance" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Employer <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, fontSize: '0.7rem', color: muted }}>(optional)</span></label>
                  <input type="text" value={form.employer} onChange={e => set('employer', e.target.value)}
                    placeholder="e.g. Aluko & Oyebode" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Career stage</label>
                  <select value={form.careerStage} onChange={e => set('careerStage', e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                    {CAREER_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Practice area <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, fontSize: '0.7rem', color: muted }}>(optional)</span></label>
                  <input type="text" value={form.practiceArea} onChange={e => set('practiceArea', e.target.value)}
                    placeholder="e.g. Capital Markets" style={fieldStyle} />
                </div>
              </div>

              {error && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <AlertCircle size={15} style={{ color: accent, flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: accent, margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !form.targetRole}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.95rem 2.5rem',
                  backgroundColor: (loading || !form.targetRole) ? '#C8B8A8' : ink,
                  color: cream, border: 'none',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                  cursor: (loading || !form.targetRole) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {loading
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Preparing your questions...</>
                  : <>Generate Questions <ArrowRight size={15} /></>}
              </button>
            </div>
          </>
        )}

        {questions && current && (
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>

            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: accent, opacity: 0.75, marginBottom: '0.5rem' }}>
                Interviewing as {persona || 'Interviewer'}
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: muted }}>
                Question {activeIndex + 1} of {questions.length}
              </p>
            </div>

            {/* Question pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' as const }}>
              {questions.map((q, i) => {
                const answered = !!feedbackByQuestion[q.id]
                const isActive = i === activeIndex
                return (
                  <button key={q.id} onClick={() => goToQuestion(i)} style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    border: isActive ? '1.5px solid ' + ink : '1px solid ' + rule,
                    backgroundColor: answered ? '#F2EBE1' : 'transparent',
                    color: isActive ? ink : muted,
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}>
                    {i + 1}
                  </button>
                )
              })}
            </div>

            {/* Current question */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: accent, marginBottom: '0.875rem' }}>
                {current.category}
              </p>
              <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.6rem', fontWeight: 700, color: ink, lineHeight: 1.3, marginBottom: '1rem' }}>
                {current.question}
              </h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: muted, lineHeight: 1.65, fontStyle: 'italic' as const }}>
                {current.whyTheyAsk}
              </p>
            </div>

            {/* Answer box */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Your answer</label>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer as you would say it..."
                rows={6}
                style={{ ...fieldStyle, borderBottom: 'none', borderLeft: '1.5px solid ' + rule, paddingLeft: '1rem', resize: 'vertical' as const, lineHeight: 1.7 }}
              />
            </div>

            {feedbackError && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <AlertCircle size={15} style={{ color: accent, flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: accent, margin: 0 }}>{feedbackError}</p>
              </div>
            )}

            <button
              onClick={handleSubmitAnswer}
              disabled={feedbackLoading || !answer.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.85rem 2rem',
                backgroundColor: (feedbackLoading || !answer.trim()) ? '#C8B8A8' : ink,
                color: cream, border: 'none',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                cursor: (feedbackLoading || !answer.trim()) ? 'not-allowed' : 'pointer',
                marginBottom: '3rem',
                transition: 'background-color 0.2s ease',
              }}
            >
              {feedbackLoading
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Reviewing your answer...</>
                : 'Get Feedback'}
            </button>

            {/* Feedback */}
            {currentFeedback && (
              <div style={{ borderTop: '1px solid ' + rule, paddingTop: '2.5rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.75rem' }}>
                  <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.5rem', fontWeight: 700, color: currentFeedback.score >= 7 ? '#2D6A4F' : currentFeedback.score >= 4 ? '#B5851B' : accent }}>
                    {currentFeedback.score}
                  </span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: muted }}>/ 10</span>
                </div>

                {currentFeedback.whatWorked?.length > 0 && (
                  <div style={{ marginBottom: '1.75rem' }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#2D6A4F', marginBottom: '0.75rem' }}>What worked</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
                      {currentFeedback.whatWorked.map((point, i) => (
                        <p key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: ink, lineHeight: 1.65, margin: 0 }}>{point}</p>
                      ))}
                    </div>
                  </div>
                )}

                {currentFeedback.whatToImprove?.length > 0 && (
                  <div style={{ marginBottom: '1.75rem' }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: accent, marginBottom: '0.75rem' }}>What to improve</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
                      {currentFeedback.whatToImprove.map((point, i) => (
                        <p key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: ink, lineHeight: 1.65, margin: 0 }}>{point}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: muted, marginBottom: '0.75rem' }}>A stronger answer</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem', color: ink, lineHeight: 1.8, fontStyle: 'italic' as const, paddingLeft: '1rem', borderLeft: '1.5px solid ' + rule }}>
                    {currentFeedback.strongerAnswer}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={handleReset} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: muted, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em', textDecoration: 'underline' }}>
                Start over
              </button>

              {activeIndex < questions.length - 1 && (
                <button onClick={() => goToQuestion(activeIndex + 1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: ink, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Next question <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        <Footer />
        <style>{\`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\`}</style>
      </main>
    </div>
  )
}
`);

console.log('done step 2 of 2 - page written');