'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Loader2, Copy, Check, AlertCircle, ArrowRight, Clock, X } from 'lucide-react'
import { useRequireAuth } from '../useRequireAuth'
import { createClient } from '@/lib/supabase/client'

type Result = {
  coverLetter: string
  subjectLine: string
  tipsForSending: string[]
}

type HistoryItem = {
  id: string
  target_role: string
  employer: string
  career_stage: string
  tone: string
  result: Result
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

const TONES = [
  { value: 'formal and confident', label: 'Formal & confident' },
  { value: 'warm and professional', label: 'Warm & professional' },
  { value: 'direct and concise', label: 'Direct & concise' },
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

export default function CoverLetterPage() {
  const { checking, userId } = useRequireAuth()
  const [form, setForm] = useState({
    firstName: '',
    targetRole: '',
    employer: '',
    careerStage: '',
    tone: 'formal and confident',
    cvSummary: '',
    highlights: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function loadHistory() {
    if (!userId) return
    setHistoryLoading(true)
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('cover_letters')
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
    setResult(item.result)
    setForm(f => ({ ...f, targetRole: item.target_role || '', employer: item.employer || '', careerStage: item.career_stage || '', tone: item.tone || 'formal and confident' }))
    setShowHistory(false)
  }

  async function handleGenerate() {
    if (!form.targetRole || !form.employer) {
      setError('Please enter the target role and employer.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'Something went wrong.'); return }
      setResult(data)

      if (userId) {
        const supabase = createClient()
        await (supabase as any).from('cover_letters').insert({
          user_id: userId,
          target_role: form.targetRole,
          employer: form.employer,
          career_stage: form.careerStage || null,
          tone: form.tone,
          result: data,
        })
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setResult(null)
    setForm({ firstName: '', targetRole: '', employer: '', careerStage: '', tone: 'formal and confident', cvSummary: '', highlights: '' })
    setError('')
  }

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

        {!result && (
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
                  Cover Letter Generator
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', color: muted, lineHeight: 1.7, maxWidth: '480px' }}>
                  Tell us about the role and your background. We will write a cover letter that does not sound like every other application in the pile.
                </p>
              </div>
            </div>

            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 2rem 6rem' }}>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ ...labelStyle, fontSize: '0.7rem' }}>Your first name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  placeholder="e.g. Boluwatife"
                  style={{
                    width: '100%', padding: '0.85rem 0',
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1.15rem', color: ink, backgroundColor: 'transparent',
                    border: 'none', borderBottom: '1.5px solid ' + rule, outline: 'none', boxSizing: 'border-box' as const,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                  <label style={labelStyle}>Target role <span style={{ color: accent }}>*</span></label>
                  <input type="text" value={form.targetRole} onChange={e => set('targetRole', e.target.value)}
                    placeholder="e.g. Associate, B&F" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Employer <span style={{ color: accent }}>*</span></label>
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
                  <label style={labelStyle}>Tone</label>
                  <select value={form.tone} onChange={e => set('tone', e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                    {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>Brief background <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, fontSize: '0.7rem', color: muted }}>(optional but improves quality)</span></label>
                <textarea
                  value={form.cvSummary}
                  onChange={e => set('cvSummary', e.target.value)}
                  placeholder="e.g. LL.B from Unilag, NYSC at Streamsowers, one year at a Lagos litigation firm..."
                  rows={3}
                  style={{ ...fieldStyle, borderBottom: 'none', borderLeft: '1.5px solid ' + rule, paddingLeft: '1rem', resize: 'vertical' as const, lineHeight: 1.7 }}
                />
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <label style={labelStyle}>Key highlights to emphasise <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, fontSize: '0.7rem', color: muted }}>(optional)</span></label>
                <textarea
                  value={form.highlights}
                  onChange={e => set('highlights', e.target.value)}
                  placeholder="e.g. led moot court team, published research on capital markets regulation..."
                  rows={2}
                  style={{ ...fieldStyle, borderBottom: 'none', borderLeft: '1.5px solid ' + rule, paddingLeft: '1rem', resize: 'vertical' as const, lineHeight: 1.7 }}
                />
              </div>

              {error && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <AlertCircle size={15} style={{ color: accent, flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: accent, margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !form.targetRole || !form.employer}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.95rem 2.5rem',
                  backgroundColor: (loading || !form.targetRole || !form.employer) ? muted : ink,
                  color: cream, border: 'none',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                  cursor: (loading || !form.targetRole || !form.employer) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {loading
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Writing your letter...</>
                  : <>Generate <ArrowRight size={15} /></>}
              </button>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: muted, marginTop: '1rem' }}>AI-generated draft. Review before sending.</p>
            </div>
          </>
        )}

        {result && (
          <div style={{ maxWidth: '640px', margin: '0 auto', padding: '5rem 2rem 6rem' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: muted, marginBottom: '2.5rem' }}>AI-generated draft. Review before sending.</p>

            <div style={{ marginBottom: '3rem' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: accent, opacity: 0.75, marginBottom: '0.5rem' }}>
                Suggested subject line
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', color: ink, fontWeight: 500, borderBottom: '1px solid ' + rule, paddingBottom: '1.5rem' }}>
                {result.subjectLine}
              </p>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: muted }}>
                  Your cover letter
                </p>
                <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', backgroundColor: 'transparent', border: '0.5px solid ' + rule, fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: muted, cursor: 'pointer' }}>
                  {copied ? <><Check size={13} style={{ color: '#2D6A4F' }} /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
              {result.coverLetter.split('\n').map((para, i) => para.trim() ? (
                <p key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', color: ink, lineHeight: 1.85, marginBottom: '1.25rem' }}>{para}</p>
              ) : <div key={i} style={{ height: '0.5rem' }} />)}
            </div>

            {result.tipsForSending?.length > 0 && (
              <div style={{ borderTop: '1px solid ' + rule, paddingTop: '2rem', marginBottom: '3rem' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: muted, marginBottom: '1.25rem' }}>
                  Tips for sending
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.875rem' }}>
                  {result.tipsForSending.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: accent, flexShrink: 0, paddingTop: '2px' }}>{String(i + 1).padStart(2, '0')}</span>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: ink, lineHeight: 1.7, margin: 0 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleReset} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: muted, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em', textDecoration: 'underline' }}>
              Start over
            </button>

          </div>
        )}

        {showHistory && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(26,26,26,0.4)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setShowHistory(false)}>
            <div style={{ width: '100%', maxWidth: '420px', height: '100%', backgroundColor: cream, overflowY: 'auto' as const, padding: '2rem' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: ink }}>Cover Letter History</h3>
                <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted }}>
                  <X size={18} />
                </button>
              </div>

              {historyLoading && <Loader2 size={18} className="animate-spin" style={{ color: muted }} />}

              {!historyLoading && history.length === 0 && (
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: muted }}>No cover letters yet. Your past letters will appear here.</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
                {history.map(item => (
                  <button key={item.id} onClick={() => loadFromHistory(item)} style={{ textAlign: 'left' as const, padding: '1rem', backgroundColor: '#fff', border: '0.5px solid ' + rule, cursor: 'pointer' }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: ink, marginBottom: '0.25rem' }}>{item.target_role} at {item.employer}</p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: muted }}>
                      {new Date(item.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
      </main>
      <Footer />
    </div>
  )
}
