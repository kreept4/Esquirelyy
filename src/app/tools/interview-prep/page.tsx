'use client'
import { useState, useRef } from 'react'
import { Loader2, ArrowRight, AlertCircle, X } from 'lucide-react'
import { useRequireAuth } from '../useRequireAuth'
import { createClient } from '@/lib/supabase/client'
import ToolShell from '../ToolShell'
import BrandLoader from '@/components/ui/BrandLoader'

const PERSONAS = [
  { id: 'senior_partner', label: 'Senior partner', desc: 'Probing, precedent-focused' },
  { id: 'hr_director', label: 'HR director', desc: 'Competency and culture fit' },
  { id: 'magic_circle', label: 'Magic Circle associate', desc: 'Technical, commercial awareness' },
  { id: 'nigerian_firm', label: 'Nigerian firm partner', desc: 'Local market, client handling' },
]

const AREAS = [
  'Corporate/M&A','Dispute Resolution','Banking & Finance',
  'Energy & Natural Resources','Capital Markets','Tax',
  'Employment','Real Estate','Intellectual Property','General Practice',
]

/** Category accents, drawn from the site palette rather than a private set. */
const CATEGORY_COLORS: Record<string, string> = {
  behavioural: '#0A7A6E',
  technical: '#0C6C93',
  situational: '#8C6D1F',
  ethics: '#8C6D1F',
  motivation: '#6D3FD4',
  fit: '#6D3FD4',
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
  return key ? CATEGORY_COLORS[key] : '#4A4A4A'
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
      <main className="page-main doc-page">
        <div className="tool-centre"><BrandLoader /></div>
      </main>
    )
  }

  return (
    <>
      <ToolShell
        title="Interview prep."
        lede="Questions you are actually likely to face, written from the perspective of the person who will be across the table."
        onHistory={openHistory}
      >
        {!result && (
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">The interview</p>
              <p className="grotesk-regular doc-section-note">
                Start from a role, or upload a CV and let the questions come from what is on it.
              </p>
            </div>

            {loading ? (
              <div className="tool-card">
                <BrandLoader
                  label="Building your session"
                  note="This takes about half a minute. Each question comes back with the reason it gets asked."
                />
              </div>
            ) : (
              <div className="tool-card">
                <div className="tool-tabs" role="tablist">
                  {(['role', 'cv'] as const).map(m => (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={mode === m}
                      className="grotesk-bold tool-tab"
                      data-active={mode === m}
                      onClick={() => { setMode(m); setError('') }}
                    >
                      {m === 'role' ? 'By target role' : 'By CV'}
                    </button>
                  ))}
                </div>

                {mode === 'role' ? (
                  <div className="tool-grid">
                    <div>
                      <label htmlFor="ip-role" className="tool-label">Target role</label>
                      <input id="ip-role" type="text" className="tool-input grotesk-regular"
                        value={targetRole} onChange={e => setTargetRole(e.target.value)}
                        placeholder="e.g. Associate, Banking and Finance" />
                    </div>
                    <div>
                      <label htmlFor="ip-area" className="tool-label">
                        Practice area <span className="tool-label-hint">(optional)</span>
                      </label>
                      <select id="ip-area" className="tool-select grotesk-regular"
                        value={practiceArea} onChange={e => setPracticeArea(e.target.value)}>
                        <option value="">Any</option>
                        {AREAS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="tool-row">
                    <label className="tool-label">Your CV</label>
                    <div className="tool-drop" data-over={!!cvFile} onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
                      <p className="grotesk-bold tool-drop-title">
                        {cvFile ? cvFile.name : 'Click to upload a PDF, DOCX or TXT'}
                      </p>
                      {cvFile ? (
                        <button type="button" className="tool-drop-swap"
                          onClick={e => { e.stopPropagation(); setCvFile(null) }}>
                          Remove
                        </button>
                      ) : (
                        <p className="grotesk-regular tool-drop-note">
                          The file is read for this session and not stored.
                        </p>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }}
                      onChange={e => setCvFile(e.target.files?.[0] || null)} />
                  </div>
                )}

                <div className="tool-row">
                  <label className="tool-label">Who is interviewing you</label>
                  <div className="tool-personas">
                    {PERSONAS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPersona(p.id)}
                        className="tool-persona"
                        data-active={persona === p.id}
                      >
                        <span className="grotesk-bold tool-persona-name">{p.label}</span>
                        <span className="grotesk-regular tool-persona-desc">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="grotesk-regular tool-error" role="alert">
                    <AlertCircle size={15} aria-hidden />
                    <p>{error}</p>
                  </div>
                )}

                <button type="button" onClick={handleGenerate} disabled={loading} className="tool-submit">
                  Generate questions <ArrowRight size={15} aria-hidden />
                </button>
                <p className="grotesk-regular tool-note">
                  AI-generated. Adapt every answer to your own background before an interview.
                </p>
              </div>
            )}
          </section>
        )}

        {result && (
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">{result.interviewerPersona}</p>
              <p className="grotesk-regular doc-section-note">{result.inferredRole}</p>
            </div>

            <div>
              <p className="grotesk-regular tool-note" style={{ marginTop: 0, marginBottom: '1.75rem' }}>
                Tap a question to see why it gets asked. These are AI-generated, so adapt them to
                your real background rather than rehearsing them as written.
              </p>

              <ol className="tool-questions">
                {result.questions.map((q, i) => (
                  <li key={q.id || i} className="tool-question" data-open={expandedQ === q.id}>
                    <button
                      type="button"
                      className="tool-question-btn"
                      aria-expanded={expandedQ === q.id}
                      onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                    >
                      <span className="display-black tool-question-num" aria-hidden>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="tool-question-main">
                        <span className="grotesk-bold tool-question-text">{q.question}</span>
                        <span className="grotesk-bold tool-question-cat" style={{ color: categoryColor(q.category) }}>
                          {q.category}
                        </span>
                      </span>
                    </button>
                    {expandedQ === q.id && (
                      <div className="tool-question-body">
                        <p className="grotesk-bold tool-rewrite-tag">Why they ask this</p>
                        <p className="grotesk-regular">{q.whyTheyAsk}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ol>

              <button type="button" onClick={handleReset} className="tool-restart">
                Start a new session <ArrowRight size={14} aria-hidden />
              </button>
            </div>
          </section>
        )}
      </ToolShell>

      {showHistory && (
        <div className="tool-drawer-scrim" onClick={() => setShowHistory(false)}>
          <div className="tool-drawer" role="dialog" aria-label="Past sessions" onClick={e => e.stopPropagation()}>
            <div className="tool-drawer-head">
              <h3 className="display-black tool-drawer-title">Past sessions</h3>
              <button type="button" onClick={() => setShowHistory(false)} className="tool-drawer-close" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {historyLoading && <Loader2 size={18} className="animate-spin" />}

            {!historyLoading && history.length === 0 && (
              <p className="grotesk-regular tool-drawer-empty">
                No sessions yet. Every set of questions you generate will be listed here.
              </p>
            )}

            <div className="tool-drawer-list">
              {history.map(h => (
                <button key={h.id} onClick={() => loadFromHistory(h)} className="tool-drawer-item">
                  <p className="grotesk-bold tool-drawer-item-title">{h.target_role || 'CV-based session'}</p>
                  <p className="grotesk-regular tool-drawer-item-meta">
                    {PERSONAS.find(p => p.id === h.interviewer_persona)?.label || h.interviewer_persona} · {new Date(h.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </>
  )
}
