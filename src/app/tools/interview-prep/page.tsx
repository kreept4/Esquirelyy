'use client'
import { useState, useRef } from 'react'
import Footer from '@/components/layout/Footer'
import { Clock, Loader2 } from 'lucide-react'
import { useRequireAuth } from '../useRequireAuth'
import { createClient } from '@/lib/supabase/client'

const PERSONAS = [
  { id: 'senior_partner', label: 'Senior Partner', desc: 'Probing, precedent-focused' },
  { id: 'hr_director', label: 'HR Director', desc: 'Competency & culture fit' },
  { id: 'magic_circle', label: 'Magic Circle Associate', desc: 'Technical, commercial awareness' },
  { id: 'nigerian_firm', label: 'Nigerian Firm Partner', desc: 'Local market, client handling' },
]

const AREAS = [
  'Corporate/M&A','Dispute Resolution','Banking & Finance',
  'Energy & Natural Resources','Capital Markets','Tax',
  'Employment','Real Estate','Intellectual Property','General Practice',
]

const accent = '#1A1A1A'
const ink = '#1A1A1A'
const muted = '#8C8275'
const cream = '#FAF6F0'
const rule = '#E8E0D5'

const CATEGORY_COLORS: Record<string, string> = {
  behavioural: '#5B7560',
  technical: '#3D5A73',
  situational: '#8C6D1F',
  ethics: '#8C6D1F',
  motivation: accent,
  fit: accent,
}

interface Question {
  id: string
  question: string
  category: string
  whyTheyAsk: string
}

interface SessionResult {
  interviewerPersona: string
  inferredRole: string
  questions: Question[]
}

interface HistoryItem {
  id: string
  target_role: string | null
  interviewer_persona: string
  questions: Question[]
  created_at: string
}

function categoryColor(cat: string) {
  const key = Object.keys(CATEGORY_COLORS).find(k => cat?.toLowerCase().includes(k))
  return key ? CATEGORY_COLORS[key] : muted
}

export default function InterviewPrepPage() {
  const { checking, userId } = useRequireAuth()
  const [mode, setMode] = useState<'role'|'cv'>('role')
  const [targetRole, setTargetRole] = useState('')
  const [practiceArea, setPracticeArea] = useState('')
  const [persona, setPersona] = useState('senior_partner')
  const [cvFile, setCvFile] = useState<File|null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SessionResult|null>(null)
  const [expandedQ, setExpandedQ] = useState<string|null>(null)
  const [error, setError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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
    setResult({
      interviewerPersona: PERSONAS.find(p => p.id === item.interviewer_persona)?.label || item.interviewer_persona,
      inferredRole: item.target_role || 'CV-based session',
      questions: item.questions,
    })
    setShowHistory(false)
  }

  async function handleGenerate() {
    setError('')
    if (mode === 'role' && !targetRole.trim()) { setError('Please enter a target role.'); return }
    if (mode === 'cv' && !cvFile) { setError('Please upload your CV.'); return }
    setLoading(true); setResult(null); setExpandedQ(null)
    try {
      const fd = new FormData()
      fd.append('persona', persona)
      if (mode === 'role') {
        fd.append('targetRole', targetRole.trim())
        if (practiceArea) fd.append('practiceArea', practiceArea)
      } else if (cvFile) {
        fd.append('cv', cvFile)
        fd.append('targetRole', ' ')
      }
      const res = await fetch('/api/interview-prep', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      setResult(data)
      if (userId) {
        const supabase = createClient()
 const { error: insertError } = await (supabase as any).from('interview_sessions').insert({
          user_id: userId,
          target_role: mode === 'role' ? targetRole.trim() : (data.inferredRole || null),
          interviewer_persona: persona,
          practice_area: practiceArea || null,
          questions: data.questions,
        })
        if (insertError) console.error('INSERT FAILED:', insertError)
      }
    } catch {
      setError('Something went wrong. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setCvFile(null)
    setTargetRole('')
    setPracticeArea('')
    setError('')
  }

  if (checking) {
    return (
      <div>
        <main style={{ backgroundColor: cream, paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={20} className="animate-spin" style={{ color: muted }} />
        </main>
      </div>
    )
  }

  return (
    <div>
      <main style={{ backgroundColor: cream, paddingTop: '80px', minHeight: '100vh' }}>

        {!result && (
          <>
            <div style={{ padding: '5rem 2rem 3rem' }}>
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: accent, opacity: 0.75 }}>
                    AI Career Tools
                  </p>
                  <button onClick={openHistory} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: muted, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em' }}>
                    <Clock size={13} /> History
                  </button>
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, color: ink, marginBottom: '1rem', lineHeight: 1.1 }}>
                  Interview Prep
                </h1>
                <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '1rem', color: muted, lineHeight: 1.7, maxWidth: '480px' }}>
                  Generate tailored questions from a senior partner, HR director, or Nigerian firm partner perspective.
                </p>
              </div>
            </div>

            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 2rem 6rem' }}>

              <div style={{ display: 'flex', borderBottom: '1px solid ' + rule, marginBottom: '2rem' }}>
                {(['role', 'cv'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError('') }}
                    style={{
                      padding: '0.6rem 0',
                      marginRight: '1.75rem',
                      fontFamily: 'Schibsted Grotesk, sans-serif',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: mode === m ? ink : muted,
                      borderBottom: mode === m ? '2px solid ' + accent : '2px solid transparent',
                      marginBottom: '-1px',
                    }}
                  >
                    {m === 'role' ? 'By Target Role' : 'By CV Upload'}
                  </button>
                ))}
              </div>

              {mode === 'role' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: muted, marginBottom: '0.6rem' }}>
                      Target role <span style={{ color: accent }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      placeholder="e.g. Associate, Banking & Finance"
                      style={{ width: '100%', padding: '0.6rem 0', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.92rem', color: ink, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid ' + rule, outline: 'none', boxSizing: 'border-box' as const }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: muted, marginBottom: '0.6rem' }}>
                      Practice area <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, fontSize: '0.7rem' }}>(optional)</span>
                    </label>
                    <select
                      value={practiceArea}
                      onChange={e => setPracticeArea(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.92rem', color: ink, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid ' + rule, outline: 'none', boxSizing: 'border-box' as const }}
                    >
                      <option value="">Any</option>
                      {AREAS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: muted, marginBottom: '0.6rem' }}>
                    Your CV <span style={{ color: accent }}>*</span>
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{ border: '1px dashed ' + rule, borderRadius: '999px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', backgroundColor: cvFile ? '#F0F5EC' : 'transparent' }}
                  >
                    <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.85rem', color: cvFile ? '#3D6B3D' : muted }}>
                      {cvFile ? cvFile.name : 'Click to upload PDF, DOCX, or TXT'}
                    </p>
                    {cvFile && (
                      <button onClick={e => { e.stopPropagation(); setCvFile(null) }} style={{ marginTop: '0.4rem', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', color: accent, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        Remove
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={e => setCvFile(e.target.files?.[0] || null)} />
                </div>
              )}

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: muted, marginBottom: '0.75rem' }}>
                  Interviewer persona
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem' }}>
                  {PERSONAS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      title={p.desc}
                      style={{
                        padding: '0.5rem 0.9rem',
                        fontFamily: 'Schibsted Grotesk, sans-serif',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        borderRadius: '999px',
                        border: persona === p.id ? '1px solid ' + ink : '1px solid ' + rule,
                        backgroundColor: persona === p.id ? ink : 'transparent',
                        color: persona === p.id ? cream : ink,
                        cursor: 'pointer',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.82rem', color: '#000000', marginBottom: '1.25rem' }}>{error}</p>}

              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontFamily: 'Schibsted Grotesk, sans-serif',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  backgroundColor: loading ? muted : ink,
                  color: cream,
                  border: 'none',
                  borderRadius: '2px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Generating...
                  </>
                ) : 'Generate Questions'}
              </button>
              <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', color: muted, lineHeight: 1.6, marginTop: '0.75rem' }}>
                AI-generated and may contain minor inaccuracies or mix-ups. Please review and edit before relying on it.
              </p>
            </div>
          </>
        )}

        {result && (
          <div style={{ maxWidth: '640px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
            <button onClick={handleReset} style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: muted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '2rem' }}>
              ← New session
            </button>

            <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: accent, marginBottom: '0.5rem' }}>
              {result.interviewerPersona}
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em', fontSize: '1.8rem', fontWeight: 700, color: ink, marginBottom: '0.75rem', lineHeight: 1.2 }}>
              {result.inferredRole}
            </h2>
            <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', color: muted, lineHeight: 1.6, marginBottom: '2rem' }}>
              These questions are AI-generated and may contain minor inaccuracies or mix-ups. Review and adapt them to your real background before an interview.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
              {result.questions.map((q, i) => (
                <div key={q.id || i} style={{ border: '1px solid ' + rule, borderRadius: '2px', backgroundColor: '#fff' }}>
                  <button
                    onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                    style={{ width: '100%', padding: '1rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}
                  >
                    <span style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: accent, flexShrink: 0, marginTop: '3px' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.9rem', color: ink, lineHeight: 1.6, marginBottom: '0.4rem' }}>{q.question}</p>
                      <span style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: categoryColor(q.category) }}>
                        {q.category}
                      </span>
                    </div>
                  </button>
                  {expandedQ === q.id && (
                    <div style={{ padding: '0 1.1rem 1rem 2.9rem', borderTop: '1px solid #F0EBE3' }}>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: muted, marginTop: '0.8rem', marginBottom: '0.3rem' }}>
                        Why they ask this
                      </p>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.82rem', color: '#4A4A4A', lineHeight: 1.65 }}>{q.whyTheyAsk}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showHistory && (
          <div onClick={() => setShowHistory(false)} style={{ position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start' as const, justifyContent: 'center', padding: '4rem 1rem', zIndex: 50, overflowY: 'auto' as const }}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor: cream, maxWidth: '600px', width: '100%', borderRadius: '4px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em', fontSize: '1.3rem', fontWeight: 700, color: ink }}>Past Sessions</h3>
                <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: '1.2rem' }}>×</button>
              </div>
              {historyLoading ? (
                <Loader2 size={18} className="animate-spin" style={{ color: muted }} />
              ) : history.length === 0 ? (
                <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.85rem', color: muted }}>No past sessions yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' }}>
                  {history.map(h => (
                    <button
                      key={h.id}
                      onClick={() => loadFromHistory(h)}
                      style={{ textAlign: 'left' as const, padding: '0.85rem 1rem', border: '1px solid ' + rule, borderRadius: '999px', background: '#fff', cursor: 'pointer' }}
                    >
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: ink }}>
                        {h.target_role || 'CV-based session'}
                      </p>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.72rem', color: muted, marginTop: '0.2rem' }}>
                        {PERSONAS.find(p => p.id === h.interviewer_persona)?.label || h.interviewer_persona} · {new Date(h.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
