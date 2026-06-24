const fs = require('fs');

fs.writeFileSync('src/app/tools/interview-prep/page.tsx', `'use client'
import { useState, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
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

const CATEGORY_COLORS: Record<string, string> = {
  behavioural: '#2D6A4F',
  technical: '#1A3A5C',
  situational: '#7B5E00',
  ethics: '#7B5E00',
  motivation: '#8B3A3A',
  fit: '#8B3A3A',
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

interface SessionEntry {
  id: string
  role: string
  persona: string
  questions: Question[]
  createdAt: string
}

function categoryColor(cat: string) {
  const key = Object.keys(CATEGORY_COLORS).find(k => cat?.toLowerCase().includes(k))
  return key ? CATEGORY_COLORS[key] : '#4A4A4A'
}

export default function InterviewPrepPage() {
  const [tab, setTab] = useState<'generate'|'history'>('generate')
  const [mode, setMode] = useState<'role'|'cv'>('role')
  const [targetRole, setTargetRole] = useState('')
  const [practiceArea, setPracticeArea] = useState('')
  const [persona, setPersona] = useState('senior_partner')
  const [cvFile, setCvFile] = useState<File|null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SessionResult|null>(null)
  const [expandedQ, setExpandedQ] = useState<string|null>(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<SessionEntry[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadHistory() {
    if (historyLoaded) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) {
      setHistory(data.map((r: any) => ({
        id: r.id,
        role: r.target_role || 'CV-based session',
        persona: r.persona,
        questions: r.questions || [],
        createdAt: new Date(r.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
      })))
    }
    setHistoryLoaded(true)
  }

  function switchTab(t: 'generate'|'history') {
    setTab(t)
    if (t === 'history') loadHistory()
  }

  async function handleGenerate() {
    setError('')
    if (mode === 'role' && !targetRole.trim()) { setError('Enter a target role.'); return }
    if (mode === 'cv' && !cvFile) { setError('Upload your CV.'); return }
    setLoading(true); setResult(null); setExpandedQ(null)
    try {
      const fd = new FormData()
      fd.append('persona', persona)
      if (mode === 'role') {
        fd.append('targetRole', targetRole)
        if (practiceArea) fd.append('practiceArea', practiceArea)
      } else if (cvFile) {
        fd.append('cv', cvFile)
        fd.append('targetRole', ' ')
      }
      const res = await fetch('/api/interview-prep', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setResult(data)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('interview_sessions').insert({
          user_id: user.id,
          target_role: mode === 'role' ? targetRole : (data.inferredRole || null),
          persona,
          questions: data.questions,
        })
        setHistoryLoaded(false)
      }
    } catch { setError('Request failed. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ paddingTop: '64px' }}>

        {/* Dark hero header */}
        <div style={{ backgroundColor: '#111111' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 2rem 4rem' }}>
            <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#8B3A3A', letterSpacing: '0.18em' }}>
              AI Career Tools
            </p>
            <h1 className="font-serif font-bold tracking-tight" style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', color: '#FAF6F0', lineHeight: 1.05, marginBottom: '1.25rem', maxWidth: '700px' }}>
              Interview Preparation.
            </h1>
            <p className="font-sans" style={{ fontSize: '1.05rem', color: 'rgba(250,246,240,0.55)', lineHeight: 1.75, maxWidth: '520px', marginBottom: '2.5rem' }}>
              Generate questions from a senior partner, HR director, or Nigerian firm partner perspective. Upload your CV for tailored prep.
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(250,246,240,0.1)' }}>
              {(['generate', 'history'] as const).map(t => (
                <button key={t} onClick={() => switchTab(t)} className="font-sans font-semibold" style={{
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  textTransform: 'capitalize',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: tab === t ? '#FAF6F0' : 'rgba(250,246,240,0.35)',
                  borderBottom: tab === t ? '2px solid #8B3A3A' : '2px solid transparent',
                  marginBottom: '-1px',
                  transition: 'color 0.15s',
                }}>
                  {t === 'generate' ? 'Generate Questions' : 'Past Sessions'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="bg-cream" style={{ minHeight: '70vh' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3.5rem 2rem' }}>

            {tab === 'generate' && (
              <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '4rem', alignItems: 'start' }}>

                {/* Left: config panel */}
                <div>
                  {/* Mode toggle */}
                  <div style={{ marginBottom: '2rem' }}>
                    <p className="font-sans font-semibold uppercase tracking-widest" style={{ fontSize: '0.62rem', color: '#4A4A4A', marginBottom: '0.75rem', letterSpacing: '0.14em' }}>
                      Input Mode
                    </p>
                    <div style={{ display: 'flex', border: '1px solid #E8E0D5', borderRadius: '3px', overflow: 'hidden' }}>
                      {(['role', 'cv'] as const).map(m => (
                        <button key={m} onClick={() => { setMode(m); setError('') }} className="font-sans font-semibold" style={{
                          flex: 1,
                          padding: '0.65rem',
                          fontSize: '0.78rem',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: mode === m ? '#1A1A1A' : '#fff',
                          color: mode === m ? '#FAF6F0' : '#4A4A4A',
                          transition: 'all 0.15s',
                        }}>
                          {m === 'role' ? 'By Role' : 'Upload CV'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {mode === 'role' ? (
                    <>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label className="font-sans font-semibold uppercase" style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.14em', color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Target Role *
                        </label>
                        <input
                          value={targetRole}
                          onChange={e => setTargetRole(e.target.value)}
                          placeholder="e.g. Associate, Banking & Finance"
                          className="font-sans"
                          style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #E8E0D5', borderRadius: '3px', fontSize: '0.88rem', color: '#1A1A1A', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ marginBottom: '2rem' }}>
                        <label className="font-sans font-semibold uppercase" style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.14em', color: '#4A4A4A', marginBottom: '0.5rem' }}>
                          Practice Area
                        </label>
                        <select
                          value={practiceArea}
                          onChange={e => setPracticeArea(e.target.value)}
                          className="font-sans"
                          style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #E8E0D5', borderRadius: '3px', fontSize: '0.88rem', color: '#1A1A1A', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}
                        >
                          <option value="">Any practice area</option>
                          {AREAS.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </div>
                    </>
                  ) : (
                    <div style={{ marginBottom: '2rem' }}>
                      <label className="font-sans font-semibold uppercase" style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.14em', color: '#4A4A4A', marginBottom: '0.5rem' }}>
                        Your CV *
                      </label>
                      <div
                        onClick={() => fileRef.current?.click()}
                        style={{
                          border: '1px dashed #C8B8A8',
                          borderRadius: '3px',
                          padding: '2rem 1.5rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          backgroundColor: cvFile ? '#F0F7EC' : '#FDFAF6',
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <p className="font-sans" style={{ fontSize: '0.85rem', color: cvFile ? '#2D6A4F' : '#6A6A6A', marginBottom: cvFile ? '0.5rem' : 0 }}>
                          {cvFile ? cvFile.name : 'Click to upload PDF, DOCX, or TXT'}
                        </p>
                        {!cvFile && (
                          <p className="font-sans" style={{ fontSize: '0.72rem', color: '#A0A0A0', marginTop: '0.25rem' }}>Max 10MB</p>
                        )}
                        {cvFile && (
                          <button
                            onClick={e => { e.stopPropagation(); setCvFile(null) }}
                            className="font-sans"
                            style={{ fontSize: '0.72rem', color: '#8B3A3A', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={e => setCvFile(e.target.files?.[0] || null)} />
                    </div>
                  )}

                  {/* Persona */}
                  <div style={{ marginBottom: '2rem' }}>
                    <p className="font-sans font-semibold uppercase" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: '#4A4A4A', marginBottom: '0.75rem' }}>
                      Interviewer Persona
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {PERSONAS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setPersona(p.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.9rem',
                            padding: '0.8rem 1rem',
                            border: persona === p.id ? '1px solid #1A1A1A' : '1px solid #E8E0D5',
                            borderRadius: '3px',
                            background: persona === p.id ? '#1A1A1A' : '#fff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: persona === p.id ? '#8B3A3A' : '#C8B8A8', flexShrink: 0 }} />
                          <div>
                            <p className="font-sans font-semibold" style={{ fontSize: '0.82rem', color: persona === p.id ? '#FAF6F0' : '#1A1A1A', lineHeight: 1.3 }}>{p.label}</p>
                            <p className="font-sans" style={{ fontSize: '0.72rem', color: persona === p.id ? 'rgba(250,246,240,0.5)' : '#6A6A6A', marginTop: '1px' }}>{p.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p className="font-sans" style={{ fontSize: '0.78rem', color: '#B5451B', marginBottom: '1rem' }}>{error}</p>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="font-sans font-semibold uppercase"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: loading ? '#4A4A4A' : '#1A1A1A',
                      color: '#FAF6F0',
                      border: 'none',
                      borderRadius: '3px',
                      fontSize: '0.75rem',
                      letterSpacing: '0.12em',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate Questions'}
                  </button>
                </div>

                {/* Right: output */}
                <div>
                  {!result ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #E8E0D5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8B8A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </div>
                      <p className="font-sans" style={{ fontSize: '0.88rem', color: '#A0A0A0', lineHeight: 1.7, maxWidth: '280px' }}>
                        Configure your session on the left and generate questions.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Session meta */}
                      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E8E0D5' }}>
                        <p className="font-sans font-semibold uppercase" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: '#8B3A3A', marginBottom: '0.4rem' }}>
                          {result.interviewerPersona}
                        </p>
                        <h2 className="font-serif font-bold" style={{ fontSize: '1.6rem', color: '#1A1A1A', lineHeight: 1.15, tracking: '-0.02em' }}>
                          {result.inferredRole}
                        </h2>
                      </div>

                      {/* Questions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {result.questions.map((q, i) => (
                          <div
                            key={q.id || i}
                            style={{ border: '1px solid #E8E0D5', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#fff' }}
                          >
                            <button
                              onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                              style={{ width: '100%', padding: '1.1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                            >
                              <span className="font-sans font-bold" style={{ fontSize: '0.62rem', color: '#8B3A3A', flexShrink: 0, marginTop: '3px', letterSpacing: '0.08em' }}>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <div style={{ flex: 1 }}>
                                <p className="font-sans" style={{ fontSize: '0.9rem', color: '#1A1A1A', lineHeight: 1.65, marginBottom: '0.5rem' }}>
                                  {q.question}
                                </p>
                                <span
                                  className="font-sans font-semibold uppercase"
                                  style={{
                                    fontSize: '0.58rem',
                                    letterSpacing: '0.1em',
                                    color: categoryColor(q.category),
                                    backgroundColor: categoryColor(q.category) + '12',
                                    padding: '2px 7px',
                                    borderRadius: '2px',
                                  }}
                                >
                                  {q.category}
                                </span>
                              </div>
                              <svg
                                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8B8A8" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"
                                style={{ flexShrink: 0, marginTop: '3px', transform: expandedQ === q.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                              >
                                <polyline points="6 9 12 15 18 9"/>
                              </svg>
                            </button>

                            {expandedQ === q.id && (
                              <div style={{ padding: '0 1.25rem 1.1rem 3.25rem', borderTop: '1px solid #F0EBE3' }}>
                                <p className="font-sans font-semibold uppercase" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', color: '#A0A0A0', marginBottom: '0.4rem', marginTop: '0.9rem' }}>
                                  Why they ask this
                                </p>
                                <p className="font-sans" style={{ fontSize: '0.85rem', color: '#4A4A4A', lineHeight: 1.7 }}>
                                  {q.whyTheyAsk}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'history' && (
              <div style={{ maxWidth: '700px' }}>
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                    <p className="font-sans" style={{ fontSize: '0.9rem', color: '#A0A0A0' }}>
                      No past sessions yet. Generate your first set of questions.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {history.map(s => (
                      <details key={s.id} style={{ backgroundColor: '#fff', border: '1px solid #E8E0D5', borderRadius: '3px', overflow: 'hidden' }}>
                        <summary style={{ padding: '1.1rem 1.25rem', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p className="font-serif font-bold" style={{ fontSize: '1rem', color: '#1A1A1A' }}>{s.role}</p>
                            <p className="font-sans" style={{ fontSize: '0.72rem', color: '#6A6A6A', marginTop: '0.2rem' }}>
                              {PERSONAS.find(p => p.id === s.persona)?.label || s.persona} · {s.createdAt}
                            </p>
                          </div>
                          <span className="font-sans font-semibold" style={{ fontSize: '0.72rem', color: '#8B3A3A', flexShrink: 0, marginLeft: '1rem' }}>
                            {s.questions.length} questions
                          </span>
                        </summary>
                        <div style={{ borderTop: '1px solid #F0EBE3', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                          {s.questions.map((q: any, i: number) => (
                            <div key={q.id || i} style={{ display: 'flex', gap: '1rem' }}>
                              <span className="font-sans font-bold" style={{ fontSize: '0.62rem', color: '#8B3A3A', flexShrink: 0, marginTop: '3px', letterSpacing: '0.08em' }}>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <div>
                                <p className="font-sans" style={{ fontSize: '0.85rem', color: '#1A1A1A', lineHeight: 1.65 }}>{q.question || q}</p>
                                {q.category && (
                                  <span className="font-sans font-semibold uppercase" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', color: categoryColor(q.category) }}>
                                    {q.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
`);

console.log('done');