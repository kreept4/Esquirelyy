'use client'
import { useState } from 'react'
import { Upload, FileText, Loader2, ArrowRight, AlertCircle, X } from 'lucide-react'
import { useRequireAuth } from '../useRequireAuth'
import { createClient } from '@/lib/supabase/client'
import ToolShell from '../ToolShell'
import BrandLoader from '@/components/ui/BrandLoader'

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
  marketFit: 'Market fit',
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
    } catch {
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
      <main className="page-main doc-page">
        <div className="tool-centre">
          <BrandLoader />
        </div>
      </main>
    )
  }

  return (
    <>
      <ToolShell
        title="CV review."
        lede="Upload your CV and get specific, unsentimental feedback written against what Nigerian firms actually screen for."
        onHistory={openHistory}
      >
        {!result && (
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">Your CV</p>
              <p className="grotesk-regular doc-section-note">
                The file is read, analysed and discarded. Only the review is saved.
              </p>
            </div>

            {loading ? (
              <div className="tool-card">
                <BrandLoader
                  label="Reading your CV"
                  note="This takes up to a minute. The file is parsed, assessed against what an applicant tracking system looks for, then read line by line."
                />
              </div>
            ) : (
            <div className="tool-card">
              <div className="tool-grid">
                <div>
                  <label htmlFor="cv-first-name" className="tool-label">First name</label>
                  <input
                    id="cv-first-name"
                    type="text"
                    className="tool-input grotesk-regular"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="e.g. Damian"
                  />
                </div>
                <div>
                  <label htmlFor="cv-target-role" className="tool-label">
                    Target role <span className="tool-label-hint">(optional)</span>
                  </label>
                  <input
                    id="cv-target-role"
                    type="text"
                    className="tool-input grotesk-regular"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="e.g. Litigation Associate"
                  />
                </div>
              </div>

              <div className="tool-row">
                <label htmlFor="cv-stage" className="tool-label">Career stage</label>
                <select
                  id="cv-stage"
                  className="tool-select grotesk-regular"
                  value={careerStage}
                  onChange={e => setCareerStage(e.target.value)}
                >
                  {CAREER_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div
                className="tool-drop"
                data-over={dragOver}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] || null) }}
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
                    <FileText size={22} className="tool-drop-icon" aria-hidden />
                    <p className="grotesk-bold tool-drop-title">{file.name}</p>
                    <button type="button" onClick={() => setFile(null)} className="tool-drop-swap">
                      Choose a different file
                    </button>
                  </div>
                ) : (
                  <label htmlFor="cv-file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload size={22} className="tool-drop-icon" aria-hidden />
                    <p className="grotesk-bold tool-drop-title">Drop your CV here, or click to upload</p>
                    <p className="grotesk-regular tool-drop-note">PDF, DOCX or TXT. Maximum 5MB.</p>
                  </label>
                )}
              </div>

              {error && (
                <div className="grotesk-regular tool-error" role="alert">
                  <AlertCircle size={15} aria-hidden />
                  <p>{error}</p>
                </div>
              )}

              <button type="button" onClick={handleSubmit} disabled={loading} className="tool-submit">
                Get my review <ArrowRight size={15} aria-hidden />
              </button>

              <p className="grotesk-regular tool-note">
                AI-generated, and it can get things slightly wrong. Read it against your own
                judgment before acting on any of it.
              </p>
            </div>
            )}
          </section>
        )}

        {result && (
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">Your review</p>
              <p className="grotesk-regular doc-section-note">
                AI-generated. Treat it as a second opinion, not a verdict.
              </p>
            </div>

            <div>
              <p className="display-black tool-greeting">{result.greeting}</p>
              <p className="grotesk-regular tool-impression">{result.overallImpression}</p>

              <div className="tool-scores">
                {Object.entries(result.scores).map(([key, value]) => (
                  <div key={key} className="tool-score">
                    <p className="tool-score-value">{value}</p>
                    <p className="grotesk-bold tool-score-label">{SCORE_LABELS[key] || key}</p>
                  </div>
                ))}
              </div>

              <div className="tool-columns">
                <div>
                  <h2 className="grotesk-bold tool-col-heading">What is working</h2>
                  <div className="tool-list">
                    {result.strengths.map((s, i) => (
                      <p key={i} className="grotesk-regular">{s}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="grotesk-bold tool-col-heading">Where to improve</h2>
                  <div className="tool-list">
                    {result.weaknesses.map((w, i) => (
                      <p key={i} className="grotesk-regular">{w}</p>
                    ))}
                  </div>
                </div>
              </div>

              {result.rewrites && result.rewrites.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                  <h2 className="grotesk-bold tool-section-heading">Suggested rewrites</h2>
                  <div className="tool-rewrites">
                    {result.rewrites.map((r, i) => (
                      <div key={i} className="tool-rewrite">
                        <p className="grotesk-bold tool-rewrite-tag">Before</p>
                        <p className="grotesk-regular tool-rewrite-before">{r.original}</p>
                        <p className="grotesk-bold tool-rewrite-tag">After</p>
                        <p className="grotesk-bold tool-rewrite-after">{r.improved}</p>
                        <p className="grotesk-regular tool-rewrite-why">{r.why}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="display-black tool-closing">{result.closingNote}</p>

              <button type="button" onClick={handleReset} className="tool-restart">
                Review another CV <ArrowRight size={14} aria-hidden />
              </button>
            </div>
          </section>
        )}
      </ToolShell>

      {showHistory && (
        <div className="tool-drawer-scrim" onClick={() => setShowHistory(false)}>
          <div className="tool-drawer" role="dialog" aria-label="Review history" onClick={e => e.stopPropagation()}>
            <div className="tool-drawer-head">
              <h3 className="display-black tool-drawer-title">Review history</h3>
              <button type="button" onClick={() => setShowHistory(false)} className="tool-drawer-close" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {historyLoading && <Loader2 size={18} className="animate-spin" />}

            {!historyLoading && history.length === 0 && (
              <p className="grotesk-regular tool-drawer-empty">
                No reviews yet. Every CV you run through this will be listed here.
              </p>
            )}

            <div className="tool-drawer-list">
              {history.map(item => (
                <button key={item.id} onClick={() => loadFromHistory(item)} className="tool-drawer-item">
                  <p className="grotesk-bold tool-drawer-item-title">{item.file_name || 'CV review'}</p>
                  <p className="grotesk-regular tool-drawer-item-meta">
                    {item.target_role || 'No target role'} · {new Date(item.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
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
