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
  technical: '#0A4A7A',
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
    if (mode === 'role' && !targetRole.trim()) { setError('Enter a target role.'); return }
    if (mode === 'cv' && !cvFile) { setError('Upload your CV.'); return }
    setLoading(true); setError(''); setResult(null); setExpandedQ(null)
    try {
      const fd = new FormData()
      fd.append('persona', persona)
      if (mode === 'role') {
        fd.append('targetRole', targetRole)
        if (practiceArea) fd.append('practiceArea', practiceArea)
      } else if (cvFile) {
        fd.append('cv', cvFile)
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
    } catch { setError('Request failed.') }
    finally { setLoading(false) }
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'0.7rem 0.9rem',
    border:'0.5px solid #E8E0D5', borderRadius:'2px',
    fontFamily:'DM Sans, sans-serif', fontSize:'0.85rem',
    color:'#1A1A1A', backgroundColor:'#fff',
    outline:'none', boxSizing:'border-box',
  }

  function categoryColor(cat: string) {
    const key = Object.keys(CATEGORY_COLORS).find(k => cat?.toLowerCase().includes(k))
    return key ? CATEGORY_COLORS[key] : '#4A4A4A'
  }

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor:'#FAF7F2', minHeight:'100vh', paddingTop:'64px' }}>

        <div style={{ borderBottom:'0.5px solid #E8E0D5', padding:'3rem 2rem 2rem', maxWidth:'860px', margin:'0 auto' }}>
          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8B3A3A', marginBottom:'0.5rem' }}>
            AI Career Tools
          </p>
          <h1 style={{ fontFamily:'Playfair Display, Georgia, serif', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:800, color:'#1A1A1A', lineHeight:1.1, marginBottom:'0.75rem' }}>
            Interview Preparation
          </h1>
          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.88rem', color:'#6A6A6A', lineHeight:1.6 }}>
            Generate tailored questions from a senior partner, HR director, or firm-specific interviewer perspective.
          </p>

          <div style={{ display:'flex', gap:'0', marginTop:'2rem', borderBottom:'0.5px solid #E8E0D5' }}>
            {(['generate','history'] as const).map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{
                padding:'0.6rem 1.25rem',
                fontFamily:'DM Sans, sans-serif', fontSize:'0.75rem', fontWeight:600,
                letterSpacing:'0.08em', textTransform:'capitalize',
                border:'none', background:'none', cursor:'pointer',
                color: tab === t ? '#8B3A3A' : '#6A6A6A',
                borderBottom: tab === t ? '2px solid #8B3A3A' : '2px solid transparent',
                marginBottom:'-0.5px', transition:'color 0.15s',
              }}>
                {t === 'generate' ? 'Generate Questions' : 'Past Sessions'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:'860px', margin:'0 auto', padding:'2rem' }}>

          {tab === 'generate' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2.5rem' }}>

              <div>
                <div style={{ marginBottom:'1.5rem' }}>
                  <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#4A4A4A', marginBottom:'0.6rem' }}>
                    Input Mode
                  </p>
                  <div style={{ display:'flex', border:'0.5px solid #E8E0D5', borderRadius:'2px', overflow:'hidden' }}>
                    {(['role','cv'] as const).map(m => (
                      <button key={m} onClick={() => setMode(m)} style={{
                        flex:1, padding:'0.6rem',
                        fontFamily:'DM Sans, sans-serif', fontSize:'0.75rem', fontWeight:600,
                        border:'none', cursor:'pointer',
                        backgroundColor: mode === m ? '#8B3A3A' : '#fff',
                        color: mode === m ? '#FAF7F2' : '#4A4A4A',
                        transition:'all 0.15s',
                      }}>
                        {m === 'role' ? 'By Role' : 'Upload CV'}
                      </button>
                    ))}
                  </div>
                </div>

                {mode === 'role' ? (
                  <>
                    <div style={{ marginBottom:'1rem' }}>
                      <label style={{ display:'block', fontFamily:'DM Sans, sans-serif', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#4A4A4A', marginBottom:'0.4rem' }}>Target Role *</label>
                      <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Associate, Banking & Finance" style={inp} />
                    </div>
                    <div style={{ marginBottom:'1.5rem' }}>
                      <label style={{ display:'block', fontFamily:'DM Sans, sans-serif', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#4A4A4A', marginBottom:'0.4rem' }}>Practice Area</label>
                      <select value={practiceArea} onChange={e => setPracticeArea(e.target.value)} style={inp}>
                        <option value="">Any</option>
                        {AREAS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <div style={{ marginBottom:'1.5rem' }}>
                    <label style={{ display:'block', fontFamily:'DM Sans, sans-serif', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#4A4A4A', marginBottom:'0.4rem' }}>Your CV *</label>
                    <div onClick={() => fileRef.current?.click()} style={{ border:'0.5px dashed #C8B8A8', borderRadius:'2px', padding:'1.5rem', textAlign:'center', cursor:'pointer', backgroundColor: cvFile ? '#F0F7EC' : '#FAF7F2' }}>
                      <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.82rem', color: cvFile ? '#2D6A4F' : '#6A6A6A' }}>
                        {cvFile ? cvFile.name : 'Click to upload PDF, DOCX, or TXT'}
                      </p>
                      {cvFile && (
                        <button onClick={e => { e.stopPropagation(); setCvFile(null) }} style={{ marginTop:'0.5rem', fontFamily:'DM Sans, sans-serif', fontSize:'0.7rem', color:'#8B3A3A', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
                          Remove
                        </button>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display:'none' }} onChange={e => setCvFile(e.target.files?.[0] || null)} />
                  </div>
                )}

                <div style={{ marginBottom:'1.5rem' }}>
                  <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#4A4A4A', marginBottom:'0.6rem' }}>Interviewer Persona</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {PERSONAS.map(p => (
                      <button key={p.id} onClick={() => setPersona(p.id)} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.7rem 0.9rem', border: persona === p.id ? '0.5px solid #8B3A3A' : '0.5px solid #E8E0D5', borderRadius:'2px', background: persona === p.id ? '#FDF5F5' : '#fff', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                        <div style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor: persona === p.id ? '#8B3A3A' : '#C8B8A8', flexShrink:0 }} />
                        <div>
                          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.78rem', fontWeight:600, color:'#1A1A1A' }}>{p.label}</p>
                          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.7rem', color:'#6A6A6A' }}>{p.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.78rem', color:'#B5451B', marginBottom:'1rem' }}>{error}</p>}

                <button onClick={handleGenerate} disabled={loading} style={{ width:'100%', padding:'0.85rem', backgroundColor: loading ? '#C47070' : '#8B3A3A', color:'#FAF7F2', border:'none', borderRadius:'2px', fontFamily:'DM Sans, sans-serif', fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition:'background-color 0.2s' }}>
                  {loading ? 'Generating...' : 'Generate Questions'}
                </button>
              </div>

              <div>
                {!result ? (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', minHeight:'300px', color:'#C0B8AE', textAlign:'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:'1rem' }}>
                      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.82rem', lineHeight:1.6 }}>Configure your session and generate questions.</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom:'1.25rem', paddingBottom:'1rem', borderBottom:'0.5px solid #E8E0D5' }}>
                      <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#8B3A3A', marginBottom:'0.25rem' }}>
                        {result.interviewerPersona}
                      </p>
                      <p style={{ fontFamily:'Playfair Display, Georgia, serif', fontSize:'0.95rem', fontWeight:700, color:'#1A1A1A' }}>
                        {result.inferredRole}
                      </p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                      {result.questions.map((q, i) => (
                        <div key={q.id || i} style={{ backgroundColor:'#fff', border:'0.5px solid #E8E0D5', borderRadius:'2px', overflow:'hidden' }}>
                          <button onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)} style={{ width:'100%', padding:'0.9rem 1rem', background:'none', border:'none', cursor:'pointer', textAlign:'left', display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
                            <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.65rem', fontWeight:700, color:'#8B3A3A', flexShrink:0, marginTop:'2px' }}>Q{i+1}</span>
                            <div style={{ flex:1 }}>
                              <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.83rem', color:'#1A1A1A', lineHeight:1.6, marginBottom:'0.3rem' }}>{q.question}</p>
                              <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color: categoryColor(q.category), backgroundColor: categoryColor(q.category) + '14', padding:'2px 6px', borderRadius:'2px' }}>
                                {q.category}
                              </span>
                            </div>
                          </button>
                          {expandedQ === q.id && (
                            <div style={{ padding:'0 1rem 0.9rem 2.5rem', borderTop:'0.5px solid #F0EBE3' }}>
                              <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.72rem', fontWeight:600, color:'#6A6A6A', marginBottom:'0.25rem', marginTop:'0.6rem' }}>Why they ask this</p>
                              <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.78rem', color:'#4A4A4A', lineHeight:1.65 }}>{q.whyTheyAsk}</p>
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
            <div>
              {history.length === 0 ? (
                <div style={{ textAlign:'center', padding:'4rem 2rem', color:'#C0B8AE' }}>
                  <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.85rem' }}>No past sessions yet. Generate your first set of questions.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {history.map(s => (
                    <details key={s.id} style={{ backgroundColor:'#fff', border:'0.5px solid #E8E0D5', borderRadius:'2px', overflow:'hidden' }}>
                      <summary style={{ padding:'1rem 1.25rem', cursor:'pointer', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <p style={{ fontFamily:'Playfair Display, Georgia, serif', fontSize:'0.95rem', fontWeight:700, color:'#1A1A1A' }}>{s.role}</p>
                          <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.7rem', color:'#6A6A6A', marginTop:'0.15rem' }}>
                            {PERSONAS.find(p => p.id === s.persona)?.label || s.persona} · {s.createdAt}
                          </p>
                        </div>
                        <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.7rem', color:'#8B3A3A', fontWeight:600, flexShrink:0, marginLeft:'1rem' }}>
                          {s.questions.length} questions
                        </span>
                      </summary>
                      <div style={{ borderTop:'0.5px solid #E8E0D5', padding:'1rem 1.25rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                        {s.questions.map((q: any, i: number) => (
                          <div key={q.id || i} style={{ display:'flex', gap:'0.75rem' }}>
                            <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.7rem', fontWeight:700, color:'#8B3A3A', flexShrink:0, marginTop:'2px' }}>Q{i+1}</span>
                            <div>
                              <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.82rem', color:'#1A1A1A', lineHeight:1.6 }}>{q.question || q}</p>
                              {q.category && <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', color: categoryColor(q.category) }}>{q.category}</span>}
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
      </main>
      <Footer />
    </>
  )
}
`);

console.log('done');