'use client'
import { useState, useEffect } from 'react'
import Footer from '@/components/layout/Footer'
import { Upload, FileText, Loader2, ArrowRight, AlertCircle, Clock, X } from 'lucide-react'
import { useRequireAuth } from '../useRequireAuth'
import { createClient } from '@/lib/supabase/client'

type ReviewResult = {
  greeting: string
  overallImpression: string
  scores: {
    structure: number
    impact: number
    marketFit: number
    atsCompatibility: number
  }
  strengths: string[]
  weaknesses: string[]
  rewrites: { original: string; improved: string; why: string }[]
  closingNote: string
}

type HistoryItem = {
  id: string
  first_name: string
  target_role: string
  career_stage: string
  file_name: string
  result: ReviewResult
  created_at: string
}

const SCORE_LABELS: Record<string, string> = {
  structure: 'Structure',
  impact: 'Impact',
  marketFit: 'Market Fit',
  atsCompatibility: 'ATS',
}

const CAREER_STAGES = [
  { value: '', label: 'Select your stage' },
  { value: 'student', label: 'Law Student' },
  { value: 'nysc', label: 'Entry-level' },
  { value: 'junior', label: 'Junior (0-3 yrs PQE)' },
  { value: 'mid', label: 'Mid-level (3-6 yrs PQE)' },
  { value: 'senior', label: 'Senior (6+ yrs PQE)' },
]

const accent = '#1A1A1A'
const ink = '#1A1A1A'
const muted = '#8C8275'
const sage = '#5B7560'
const cream = '#FAF6F0'
const rule = '#E8E0D5'

export default function CVReviewPage() {
  const { checking, userId } = useRequireAuth()
  const [firstName, setFirstName] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [careerStage, setCareerStage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  async function loadHistory() {
    if (!userId) return
    setHistoryLoading(true)
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('cv_reviews')
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
    setFirstName(item.first_name || '')
    setTargetRole(item.target_role || '')
    setCareerStage(item.career_stage || '')
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

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload your CV first.')
      return
    }
    if (!firstName.trim()) {
      setError('Please tell us your first name.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('firstName', firstName.trim())
      if (targetRole.trim()) formData.append('targetRole', targetRole.trim())
      if (careerStage) formData.append('careerStage', CAREER_STAGES.find(s => s.value === careerStage)?.label || careerStage)
      const res = await fetch('/api/cv-review', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      setResult(data)

      if (userId) {
        const supabase = createClient()
        await (supabase as any).from('cv_reviews').insert({
          user_id: userId,
          first_name: firstName.trim(),
          target_role: targetRole.trim() || null,
          career_stage: careerStage || null,
          file_name: file.name,
          result: data,
        })
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setFile(null)
    setFirstName('')
    setTargetRole('')
    setCareerStage('')
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
                  CV Review
                </h1>
                <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '1rem', color: muted, lineHeight: 1.7, maxWidth: '480px' }}>
                  Upload your CV. We will give you honest, specific feedback tailored to the Nigerian legal market.
                </p>
              </div>
            </div>

            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 2rem 6rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: muted, marginBottom: '0.6rem' }}>
                    Your first name <span style={{ color: accent }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="e.g. Boluwatife"
                    style={{ width: '100%', padding: '0.6rem 0', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.92rem', color: ink, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid ' + rule, outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: muted, marginBottom: '0.6rem' }}>
                    Target role <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, fontSize: '0.7rem' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="e.g. Litigation Associate"
                    style={{ width: '100%', padding: '0.6rem 0', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.92rem', color: ink, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid ' + rule, outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: muted, marginBottom: '0.6rem' }}>
                  Career stage
                </label>
                <select value={careerStage} onChange={e => setCareerStage(e.target.value)} style={{ width: '100%', padding: '0.6rem 0', fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.92rem', color: ink, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid ' + rule, outline: 'none', cursor: 'pointer' }}>
                  {CAREER_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] || null) }}
                style={{
                  border: dragOver ? '1.5px dashed ' + accent : '1px dashed ' + rule,
                  borderRadius: '4px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center' as const,
                  marginBottom: '1.5rem',
                  backgroundColor: dragOver ? '#F8F0EC' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  id="cv-file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={e => handleFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                {file ? (
                  <div>
                    <FileText size={24} style={{ color: accent, margin: '0 auto 0.75rem' }} />
                    <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.88rem', color: ink, fontWeight: 600, marginBottom: '0.5rem' }}>{file.name}</p>
                    <button
                      onClick={() => setFile(null)}
                      style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.76rem', color: muted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Choose a different file
                    </button>
                  </div>
                ) : (
                  <label htmlFor="cv-file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload size={24} style={{ color: '#A89A8A', margin: '0 auto 0.75rem' }} />
                    <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.88rem', color: ink, fontWeight: 600, marginBottom: '0.25rem' }}>
                      Drop your CV here or click to upload
                    </p>
                    <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.76rem', color: muted }}>
                      PDF, DOCX, or TXT. Maximum 5MB.
                    </p>
                  </label>
                )}
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '0.5rem 0', marginBottom: '1.5rem' }}>
                  <AlertCircle size={15} style={{ color: '#000000', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.82rem', color: '#000000' }}>{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '0.9rem 2.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  backgroundColor: loading ? muted : ink, color: cream,
                  fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.78rem', fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  border: 'none', borderRadius: '2px', cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" style={{ marginRight: '4px' }} />
                    Reading your CV...
                  </>
                ) : (
                  <>
                    Get My Review
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
              <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', color: muted, lineHeight: 1.6, marginTop: '0.75rem' }}>
                AI-generated and may contain minor inaccuracies or mix-ups. Please review and edit before relying on it.
              </p>
            </div>
          </>
        )}

        {result && (
          <div style={{ maxWidth: '700px', margin: '0 auto', padding: '5rem 2rem 6rem' }}>

            <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 500, color: ink, lineHeight: 1.45, marginBottom: '2.5rem' }}>
              {result.greeting}
            </p>
            <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', color: muted, lineHeight: 1.6, marginBottom: '2.5rem' }}>
              This review is AI-generated and may contain minor inaccuracies or mix-ups. Review and adapt the feedback against your own judgment.
            </p>

            <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.95rem', color: ink, lineHeight: 1.85, maxWidth: '600px', marginBottom: '3rem' }}>
              {result.overallImpression}
            </p>

            <div style={{ borderTop: '1px solid ' + rule, paddingTop: '2.5rem', marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {Object.entries(result.scores).map(([key, value], i) => (
                  <div
                    key={key}
                    style={{
                      flex: 1,
                      textAlign: 'center' as const,
                      paddingLeft: i > 0 ? '1.5rem' : 0,
                      paddingRight: i < Object.keys(result.scores).length - 1 ? '1.5rem' : 0,
                      borderLeft: i > 0 ? '1px solid ' + rule : 'none',
                    }}
                  >
                    <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 700, color: accent, lineHeight: 1, marginBottom: '0.5rem' }}>
                      {value}
                    </p>
                    <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: muted }}>
                      {SCORE_LABELS[key] || key}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: sage, marginBottom: '1.25rem' }}>
                  What's Working
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
                  {result.strengths.map((s, i) => (
                    <p key={i} style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.86rem', color: ink, lineHeight: 1.65, paddingLeft: '0.9rem', borderLeft: '2px solid ' + sage }}>
                      {s}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h2 style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: accent, marginBottom: '1.25rem' }}>
                  Where to Improve
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
                  {result.weaknesses.map((w, i) => (
                    <p key={i} style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.86rem', color: ink, lineHeight: 1.65, paddingLeft: '0.9rem', borderLeft: '2px solid ' + accent }}>
                      {w}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {result.rewrites && result.rewrites.length > 0 && (
              <div style={{ marginBottom: '3.5rem' }}>
                <h2 style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: muted, marginBottom: '2rem' }}>
                  Suggested Rewrites
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2.5rem' }}>
                  {result.rewrites.map((r, i) => (
                    <div key={i} style={{ borderTop: i > 0 ? '1px solid ' + rule : 'none', paddingTop: i > 0 ? '2.5rem' : 0 }}>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: muted, marginBottom: '0.5rem' }}>Before</p>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.88rem', color: muted, lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.25rem' }}>{r.original}</p>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: accent, marginBottom: '0.5rem' }}>After</p>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.88rem', color: ink, lineHeight: 1.7, fontWeight: 500, marginBottom: '1rem' }}>{r.improved}</p>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.8rem', color: muted, lineHeight: 1.65 }}>{r.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 500, color: ink, lineHeight: 1.55, fontStyle: 'italic', borderTop: '1px solid ' + rule, paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
              {result.closingNote}
            </p>

            <button
              onClick={handleReset}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.78rem', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: ink,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              Review Another CV
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {showHistory && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(26,26,26,0.4)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setShowHistory(false)}>
            <div style={{ width: '100%', maxWidth: '420px', height: '100%', backgroundColor: cream, overflowY: 'auto' as const, padding: '2rem' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em', fontSize: '1.3rem', fontWeight: 700, color: ink }}>Review History</h3>
                <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted }}>
                  <X size={18} />
                </button>
              </div>

              {historyLoading && <Loader2 size={18} className="animate-spin" style={{ color: muted }} />}

              {!historyLoading && history.length === 0 && (
                <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.85rem', color: muted }}>No reviews yet. Your past CV reviews will appear here.</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
                {history.map(item => (
                  <button key={item.id} onClick={() => loadFromHistory(item)} style={{ textAlign: 'left' as const, padding: '1rem', backgroundColor: '#fff', border: '0.5px solid ' + rule, cursor: 'pointer' }}>
                    <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: ink, marginBottom: '0.25rem' }}>{item.file_name || 'CV Review'}</p>
                    <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.75rem', color: muted }}>
                      {item.target_role || 'No target role'} · {new Date(item.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  )
}
