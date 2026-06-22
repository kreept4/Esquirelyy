'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Loader2, Copy, Check, AlertCircle, ArrowRight } from 'lucide-react'

type Result = {
  coverLetter: string
  subjectLine: string
  tipsForSending: string[]
}

const CAREER_STAGES = [
  { value: '', label: 'Select career stage' },
  { value: 'Final year law student', label: 'Final year law student' },
  { value: 'Recent call to bar', label: 'Recently called to bar' },
  { value: 'NYSC corps member', label: 'NYSC corps member' },
  { value: '1-3 years post-call', label: '1-3 years post-call' },
  { value: '3-6 years post-call', label: '3-6 years post-call' },
  { value: '6+ years post-call', label: '6+ years post-call' },
]

const TONES = [
  { value: 'formal and confident', label: 'Formal and confident' },
  { value: 'warm and professional', label: 'Warm and professional' },
  { value: 'direct and concise', label: 'Direct and concise' },
]

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: '#fff',
  border: '0.5px solid #E8E0D5',
  borderRadius: '2px',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.875rem',
  color: '#1A1A1A',
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.2s ease',
}

const labelStyle = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.7rem',
  fontWeight: 600 as const,
  color: '#1A1A1A',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  display: 'block' as const,
  marginBottom: '0.5rem',
}

export default function CoverLetterPage() {
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

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F0', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />
      <main style={{ paddingTop: '64px' }}>

        {/* Header */}
        <div style={{ borderBottom: '0.5px solid #E8E0D5', backgroundColor: '#F2EBE1', padding: '3rem 2rem 2.5rem' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8B3A3A', marginBottom: '0.75rem' }}>AI Career Tools</p>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.15, marginBottom: '0.75rem' }}>
              Cover Letter Generator
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#4A4A4A', lineHeight: 1.7, maxWidth: '520px' }}>
              Tell us about the role and your background. We will write a cover letter that does not sound like every other application in the pile.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 2rem' }}>

          {/* Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Your first name</label>
              <input style={inputStyle} placeholder="e.g. Boluwatife" value={form.firstName} onChange={e => set('firstName', e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = '#8B3A3A'}
                onBlur={e => e.currentTarget.style.borderColor = '#E8E0D5'} />
            </div>
            <div>
              <label style={labelStyle}>Career stage</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.careerStage} onChange={e => set('careerStage', e.target.value)}>
                {CAREER_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Target role <span style={{ color: '#8B3A3A' }}>*</span></label>
              <input style={inputStyle} placeholder="e.g. Associate, Banking & Finance" value={form.targetRole} onChange={e => set('targetRole', e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = '#8B3A3A'}
                onBlur={e => e.currentTarget.style.borderColor = '#E8E0D5'} />
            </div>
            <div>
              <label style={labelStyle}>Employer <span style={{ color: '#8B3A3A' }}>*</span></label>
              <input style={inputStyle} placeholder="e.g. Aluko & Oyebode" value={form.employer} onChange={e => set('employer', e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = '#8B3A3A'}
                onBlur={e => e.currentTarget.style.borderColor = '#E8E0D5'} />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Tone</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
              {TONES.map(t => (
                <button key={t.value} onClick={() => set('tone', t.value)} style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '2px',
                  border: form.tone === t.value ? '1px solid #8B3A3A' : '0.5px solid #E8E0D5',
                  backgroundColor: form.tone === t.value ? '#8B3A3A' : '#fff',
                  color: form.tone === t.value ? '#FAF6F0' : '#4A4A4A',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Brief background <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#9A9A9A', textTransform: 'none', letterSpacing: 0 }}>(optional but improves quality)</span></label>
            <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }} placeholder="e.g. LL.B from Unilag, NYSC at Streamsowers, one year at a Lagos litigation firm..." value={form.cvSummary} onChange={e => set('cvSummary', e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = '#8B3A3A'}
              onBlur={e => e.currentTarget.style.borderColor = '#E8E0D5'} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>Key highlights to emphasise <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#9A9A9A', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }} placeholder="e.g. Led moot court team, published research on capital markets regulation..." value={form.highlights} onChange={e => set('highlights', e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = '#8B3A3A'}
              onBlur={e => e.currentTarget.style.borderColor = '#E8E0D5'} />
          </div>

          {error && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', backgroundColor: '#FDF0EB', border: '0.5px solid #EDCCC2', borderRadius: '2px', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={16} style={{ color: '#B5451B', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '0.85rem', color: '#B5451B', margin: 0 }}>{error}</p>
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading || !form.targetRole || !form.employer} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            width: '100%', padding: '0.9rem',
            backgroundColor: (loading || !form.targetRole || !form.employer) ? '#C47070' : '#8B3A3A',
            color: '#FAF6F0', border: 'none', borderRadius: '2px',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            cursor: (loading || !form.targetRole || !form.employer) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease',
          }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Writing your letter...</> : <>Generate Cover Letter <ArrowRight size={16} /></>}
          </button>

          {/* Result */}
          {result && (
            <div style={{ marginTop: '3rem' }}>
              <div style={{ borderTop: '0.5px solid #E8E0D5', paddingTop: '2.5rem' }}>

                {/* Subject line */}
                <div style={{ marginBottom: '2rem', padding: '1rem 1.25rem', backgroundColor: '#fff', border: '0.5px solid #E8E0D5', borderLeft: '3px solid #8B3A3A' }}>
                  <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B3A3A', marginBottom: '0.4rem' }}>Suggested subject line</p>
                  <p style={{ fontSize: '0.9rem', color: '#1A1A1A', fontWeight: 500 }}>{result.subjectLine}</p>
                </div>

                {/* Cover letter */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A4A4A' }}>Your cover letter</p>
                    <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', backgroundColor: 'transparent', border: '0.5px solid #E8E0D5', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#4A4A4A', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                      {copied ? <><Check size={13} style={{ color: '#2D6A4F' }} /> Copied</> : <><Copy size={13} /> Copy</>}
                    </button>
                  </div>
                  <div style={{ backgroundColor: '#fff', border: '0.5px solid #E8E0D5', borderRadius: '2px', padding: '1.75rem 2rem' }}>
                    {result.coverLetter.split('\n').map((para, i) => para.trim() ? (
                      <p key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#1A1A1A', lineHeight: 1.8, marginBottom: '1rem' }}>{para}</p>
                    ) : <div key={i} style={{ height: '0.5rem' }} />)}
                  </div>
                </div>

                {/* Tips */}
                {result.tipsForSending?.length > 0 && (
                  <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#F2EBE1', border: '0.5px solid #E8D5C4', borderRadius: '2px' }}>
                    <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A4A4A', marginBottom: '0.875rem' }}>Tips for sending</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {result.tipsForSending.map((tip, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#8B3A3A', flexShrink: 0, marginTop: '8px' }} />
                          <span style={{ fontSize: '0.85rem', color: '#2C2C2C', lineHeight: 1.6 }}>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button onClick={() => { setResult(null); setForm({ firstName: '', targetRole: '', employer: '', careerStage: '', tone: 'formal and confident', cvSummary: '', highlights: '' }) }}
                  style={{ marginTop: '1.5rem', padding: '0.6rem 1.25rem', backgroundColor: 'transparent', border: '0.5px solid #E8E0D5', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#4A4A4A', cursor: 'pointer', letterSpacing: '0.06em' }}>
                  Start over
                </button>
              </div>
            </div>
          )}

          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </main>
      <Footer />
    </div>
  )
}
