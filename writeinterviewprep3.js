const fs = require('fs');

fs.writeFileSync('src/app/tools/interview-prep/page.tsx', `'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Loader2, AlertCircle, ArrowRight, ChevronRight, Clock, X, Upload, FileText } from 'lucide-react'
import { useRequireAuth } from '../useRequireAuth'
import { createClient } from '@/lib/supabase/client'

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

type HistoryItem = {
  id: string
  target_role: string
  employer: string
  career_stage: string
  practice_area: string
  interviewer_persona: string
  questions: Question[]
  created_at: string
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
  const { checking, userId } = useRequireAuth()
  const [inputMode, setInputMode] = useState<'manual' | 'cv'>('manual')
  const [form, setForm] = useState({
    targetRole: '',
    employer: '',
    careerStage: '',
    practiceArea: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [persona, setPersona] = useState('')
  const [inferredRole, setInferredRole] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<Record<string, Feedback>>({})
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function loadHistory() {
    if (!userId) return
    setHistoryLoading(true)
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    setHistory(data || [])
    setHistoryLoading(false)
  }

  function openHistory() {
    setShowHistory(true)
    loadHistory()
  }

  function loadFromHistory(item: HistoryItem) {
    setQuestions(item.questions)
    setPersona(item.interviewer_persona || '')
    setForm(f => ({ ...f, targetRole: item.target_role || '', employer: item.employer || '', careerStage: item.career_stage || '', practiceArea: item.practice_area || '' }))
    setFeedbackByQuestion({})
    setActiveIndex(0)
    setAnswer('')
    setShowHistory(false)
  }

  const handleFile = (f: File | null) => {
    if (!f) return
    const validTypes = ['.pdf', '.docx', '.txt']
    const isValid = validTypes.some(ext => f.name.toLowerCase().endsWith(ext))
    if (!isValid) {
      setError('Please upload a PDF, DOCX, or TXT file.')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.')
      return
    }
    setError('')
    setFile(f)
  }

  async function handleGenerate() {
    if (inputMode === 'manual' && !form.targetRole) {
      setError('Please enter the target role, or switch to CV upload.')
      return
    }
    if (inputMode === 'cv' && !file) {
      setError('Please upload your CV, or switch to manual entry.')
      return
    }
    setLoading(true)
    setError('')
    setQuestions(null)
    setFeedbackByQuestion({})
    setActiveIndex(0)
    setAnswer('')

    try {
      let res: Response
      if (inputMode === 'cv' && file) {
        const formData = new FormData()
        formData.append('file', file)
        if (form.targetRole) formData.append('targetRole', form.targetRole)
        if (form.employer) formData.append('employer', form.employer)
        if (form.careerStage) formData.append('careerStage', form.careerStage)
        if (form.practiceArea) formData.append('practiceArea', form.practiceArea)
        res = await fetch('/api/interview-prep', { method: 'POST', body: formData })
      } else {
        res = await fetch('/api/interview-prep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'Something went wrong.'); return }
      setQuestions(data.questions)
      setPersona(data.interviewerPersona || '')
      setInferredRole(data.inferredRole || form.targetRole || '')

      if (userId) {
        const supabase = createClient()
        await (supabase as any).from('interview_sessions').insert({
          user_id: userId,
          target_role: data.inferredRole || form.targetRole || null,
          employer: form.employer || null,
          career_stage: form.careerStage || null,
          practice_area: form.practiceArea || null,
          interviewer_persona: data.interviewerPersona || null,
          questions: data.questions,
        })
      }
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
          targetRole: inferredRole || form.targetRole,
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
    setFile(null)
    setError('')
    setFeedbackByQuestion({})
    setActiveIndex(0)
    setAnswer('')
  }

  const current = questions ? questions[activeIndex] : null
  const currentFeedback = current ? feedbackByQuestion[current.id] : null

  if (checking) {
    return (
      <div>
        <Navbar />
        <main style={{ backgroundColor: cream, paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={20} className="animate-spin" style={{ color: muted }} />
        </main>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <main style={{ backgroundColor: cream, paddingTop: '80px', minHeight: '100vh' }}>

        {!questions && (
          <>
            <div style={{ padding: '5rem 2rem 3rem' }}>
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: accent, opacity: 0.75 }}>
                    AI Career Tools
                  </p>
                  <button onClick={openHistory} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: muted, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em' }}>
                    <Clock size={13} /> History
                  </button>
                </div>
                <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, color: ink, marginBottom: '1rem', lineHeight: 1.1 }}>
                  Interview Prep
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', color: muted, lineHeight: 1.7, maxWidth: '480px' }}>
                  Tell us about the role, or upload your CV and we will infer it. We will generate the questions you are likely to face and let you practice with honest feedback.
                </p>
              </div>
            </div>

            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 2rem 6rem' }}>

              <div style={{ display: 'flex', gap: '0', marginBottom: '2.5rem', borderBottom: '1px solid ' + rule }}>
                <button onClick={() => setInputMode('manual')} style={{
                  padding: '0.75rem 0', marginRight: '2rem',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  color: inputMode === 'manual' ? ink : muted,
                  background: 'none', border: 'none',
                  borderBottom: inputMode === 'manual' ? '2px solid ' + accent : '2px solid transparent',
                  cursor: 'pointer', marginBottom: '-1px',
                }}>
                  Enter manually
                </button>
                <button onClick={() => setInputMode('cv')} style={{
                  padding: '0.75rem 0',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  color: inputMode === 'cv' ? ink : muted,
                  background: 'none', border: 'none',
                  borderBottom: inputMode === 'cv' ? '2px solid ' + accent : '2px solid transparent',
                  cursor: 'pointer', marginBottom: '-1px',
                }}>
                  Upload my CV
                </button>
              </div>

              {inputMode === 'cv' && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] || null) }}
                  style={{
                    border: dragOver ? '1.5px dashed ' + accent : '1px dashed ' + rule,
                    borderRadius: '4px', padding: '2.5rem 1.5rem', textAlign: 'center' as const,
                    marginBottom: '2rem', backgroundColor: dragOver ? '#F8F0EC' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input id="interview-cv-input" type="file" accept=".pdf,.docx,.txt" onChange={e => handleFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                  {file ? (
                    <div>
                      <FileText size={24} style={{ color: accent, margin: '0 auto 0.75rem' }} />
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: ink, fontWeight: 600, marginBottom: '0.5rem' }}>{file.name}</p>
                      <button onClick={() => setFile(null)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.76rem', color: muted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        Choose a different file
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="interview-cv-input" style={{ cursor: 'pointer', display: 'block' }}>
                      <Upload size={24} style={{ color: '#A89A8A', margin: '0 auto 0.75rem' }} />
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: ink, fontWeight: 600, marginBottom: '0.25rem' }}>
                        Drop your CV here or click to upload
                      </p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.76rem', color: muted }}>
                        PDF, DOCX, or TXT. We will infer your role and tailor questions to your background.
                      </p>
                    </label>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <label style={labelStyle}>Target role {inputMode === 'manual' && <span style={{ color: accent }}>*</span>} {inputMode === 'cv' && <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0 }}>(optional, helps focus)</span>}</label>
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
                disabled={loading || (inputMode === 'manual' && !form.targetRole) || (inputMode === 'cv' && !file)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.95rem 2.5rem',
                  backgroundColor: (loading || (inputMode === 'manual' && !form.targetRole) || (inputMode === 'cv' && !file)) ? '#C8B8A8' : ink,
                  color: cream, border: 'none',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                  cursor: (loading || (inputMode === 'manual' && !form.targetRole) || (inputMode === 'cv' && !file)) ? 'not-allowed' : 'pointer',
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
                Interviewing as {persona || 'Interviewer'}{inferredRole ? ' · ' + inferredRole : ''}
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: muted }}>
                Question {activeIndex + 1} of {questions.length}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' as const }}>
              {questions.map((q, i) => {
                const answered = !!feedbackByQuestion[q.id]
                const isActive = i === activeIndex
                return (
                  <button key={q.id} onClick={() => goToQuestion(i)} style={{
                    width: '32px', height: '32px', borderRadius: '50%',
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
                marginBottom: '3rem', transition: 'background-color 0.2s ease',
              }}
            >
              {feedbackLoading
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Reviewing your answer...</>
                : 'Get Feedback'}
            </button>

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

        {showHistory && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(26,26,26,0.4)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setShowHistory(false)}>
            <div style={{ width: '100%', maxWidth: '420px', height: '100%', backgroundColor: cream, overflowY: 'auto' as const, padding: '2rem' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: ink }}>Interview History</h3>
                <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted }}>
                  <X size={18} />
                </button>
              </div>

              {historyLoading && <Loader2 size={18} className="animate-spin" style={{ color: muted }} />}

              {!historyLoading && history.length === 0 && (
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: muted }}>No sessions yet. Your past interview prep sessions will appear here.</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
                {history.map(item => (
                  <button key={item.id} onClick={() => loadFromHistory(item)} style={{ textAlign: 'left' as const, padding: '1rem', backgroundColor: '#fff', border: '0.5px solid ' + rule, cursor: 'pointer' }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: ink, marginBottom: '0.25rem' }}>{item.target_role || 'Interview session'}{item.employer ? ' at ' + item.employer : ''}</p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: muted }}>
                      {new Date(item.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <style>{\`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }\`}</style>
      </main>
      <Footer />
    </div>
  )
}
\`);

console.log('done step 2 of 2 - page written');