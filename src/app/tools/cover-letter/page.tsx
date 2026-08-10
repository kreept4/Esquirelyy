'use client'
import { useState, useRef } from 'react'
import { Copy, Check, AlertCircle, ArrowRight, X, Loader2 } from 'lucide-react'
import { useRequireAuth } from '../useRequireAuth'
import { createClient } from '@/lib/supabase/client'
import ToolShell from '../ToolShell'
import BrandLoader from '@/components/ui/BrandLoader'

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
  { value: 'Entry-level', label: 'Entry-level' },
  { value: '1-3 years post-call', label: '1-3 years post-call' },
  { value: '3-6 years post-call', label: '3-6 years post-call' },
  { value: '6+ years post-call', label: '6+ years post-call' },
]

const TONES = [
  { value: 'formal and confident', label: 'Formal and confident' },
  { value: 'warm and professional', label: 'Warm and professional' },
  { value: 'direct and concise', label: 'Direct and concise' },
]

/** Upload is an alternative to typing a background summary, not an addition
 *  to it, same choice interview-prep already offers between a target role
 *  and a CV. */
type Mode = 'manual' | 'cv'

export default function CoverLetterPage() {
  const { checking, userId } = useRequireAuth()
  const [mode, setMode] = useState<Mode>('manual')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
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

  /* Checked here as well as on the server, so a wrong file type or an oversized
     one is said immediately rather than after an upload and a round trip. Same
     two rules and the same wording as cv-review. */
  const handleFile = (f: File | null) => {
    if (!f) return
    if (!['.pdf', '.docx', '.txt'].some(ext => f.name.toLowerCase().endsWith(ext))) {
      setError('Please upload a PDF, DOCX, or TXT file.')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.')
      return
    }
    setError('')
    setCvFile(f)
  }

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
    if (mode === 'cv' && !cvFile) {
      setError('Please upload your CV, or switch to entering details manually.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      let res: Response
      if (mode === 'cv' && cvFile) {
        const fd = new FormData()
        fd.append('cv', cvFile)
        fd.append('firstName', form.firstName)
        fd.append('targetRole', form.targetRole)
        fd.append('employer', form.employer)
        if (form.careerStage) fd.append('careerStage', form.careerStage)
        fd.append('tone', form.tone)
        if (form.highlights) fd.append('highlights', form.highlights)
        res = await fetch('/api/cover-letter', { method: 'POST', body: fd })
      } else {
        res = await fetch('/api/cover-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
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
    setCvFile(null)
    setMode('manual')
    setError('')
  }

  if (checking) {
    return (
      <main className="page-main doc-page">
        <div className="tool-centre"><BrandLoader /></div>
      </main>
    )
  }

  const blocked = loading || !form.targetRole || !form.employer || (mode === 'cv' && !cvFile)

  return (
    <>
      <ToolShell
        title="Cover letter."
        lede="Tell us about the role and your background, and we will draft a letter that does not read like every other application in the pile."
        onHistory={openHistory}
      >
        {!result && (
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">The application</p>
              <p className="grotesk-regular doc-section-note">
                Role and employer are the only required fields. The background boxes are optional
                and they are what make the difference.
              </p>
            </div>

            {loading ? (
              <div className="tool-card">
                <BrandLoader
                  label="Writing your letter"
                  note="This takes about half a minute. The draft is written against the role, the employer and whatever background you gave us."
                />
              </div>
            ) : (
              <div className="tool-card">
                <div className="tool-grid">
                  <div>
                    <label htmlFor="cl-name" className="tool-label">
                      First name <span className="tool-label-hint">(optional)</span>
                    </label>
                    <input id="cl-name" type="text" className="tool-input grotesk-regular"
                      value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="e.g. Damian" />
                  </div>
                  <div>
                    <label htmlFor="cl-role" className="tool-label">Target role</label>
                    <input id="cl-role" type="text" className="tool-input grotesk-regular"
                      value={form.targetRole} onChange={e => set('targetRole', e.target.value)} placeholder="e.g. Associate, Banking and Finance" />
                  </div>
                  <div>
                    <label htmlFor="cl-employer" className="tool-label">Employer</label>
                    <input id="cl-employer" type="text" className="tool-input grotesk-regular"
                      value={form.employer} onChange={e => set('employer', e.target.value)} placeholder="e.g. Aluko &amp; Oyebode" />
                  </div>
                  <div>
                    <label htmlFor="cl-stage" className="tool-label">Career stage</label>
                    <select id="cl-stage" className="tool-select grotesk-regular"
                      value={form.careerStage} onChange={e => set('careerStage', e.target.value)}>
                      {CAREER_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cl-tone" className="tool-label">Tone</label>
                    <select id="cl-tone" className="tool-select grotesk-regular"
                      value={form.tone} onChange={e => set('tone', e.target.value)}>
                      {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="tool-row">
                  <label className="tool-label">
                    Background <span className="tool-label-hint">(optional, and it improves the draft a lot)</span>
                  </label>
                  <div className="tool-tabs" role="tablist">
                    {(['manual', 'cv'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        role="tab"
                        aria-selected={mode === m}
                        className="grotesk-bold tool-tab"
                        data-active={mode === m}
                        onClick={() => { setMode(m); setError('') }}
                      >
                        {m === 'manual' ? 'Enter manually' : 'Upload your CV'}
                      </button>
                    ))}
                  </div>

                  {mode === 'manual' ? (
                    <textarea id="cl-bg" className="tool-textarea grotesk-regular" rows={3}
                      value={form.cvSummary} onChange={e => set('cvSummary', e.target.value)}
                      placeholder="e.g. LL.B from Unilag, NYSC at Streamsowers, one year at a Lagos litigation firm" />
                  ) : (
                    /* The picker is opened by a <label for>, not by an onClick on
                       this box. It used to be the latter, with the input nested
                       inside the box that carried the handler, so the synthetic
                       click on the input bubbled straight back into the handler
                       that had just fired it. The browser suppresses the
                       re-entrant call, and the dialog never opened — which is
                       what "I cannot upload my CV" actually was. Same
                       construction as cv-review, which never had the fault. */
                    <div
                      className="tool-drop"
                      data-over={dragOver || !!cvFile}
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => {
                        e.preventDefault()
                        setDragOver(false)
                        handleFile(e.dataTransfer.files[0] || null)
                      }}
                    >
                      <input
                        id="cl-cv-file"
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        style={{ display: 'none' }}
                        onChange={e => handleFile(e.target.files?.[0] || null)}
                      />
                      {cvFile ? (
                        <>
                          <p className="grotesk-bold tool-drop-title">{cvFile.name}</p>
                          <button type="button" className="tool-drop-swap" onClick={() => setCvFile(null)}>
                            Remove
                          </button>
                        </>
                      ) : (
                        <label htmlFor="cl-cv-file" style={{ cursor: 'pointer', display: 'block' }}>
                          <p className="grotesk-bold tool-drop-title">
                            Drop your CV here, or click to upload
                          </p>
                          <p className="grotesk-regular tool-drop-note">
                            PDF, DOCX or TXT, up to 5MB. Read for this session only, never stored.
                          </p>
                        </label>
                      )}
                    </div>
                  )}
                </div>

                <div className="tool-row">
                  <label htmlFor="cl-highlights" className="tool-label">
                    Highlights to emphasise <span className="tool-label-hint">(optional)</span>
                  </label>
                  <textarea id="cl-highlights" className="tool-textarea grotesk-regular" rows={2}
                    value={form.highlights} onChange={e => set('highlights', e.target.value)}
                    placeholder="e.g. led the moot court team, published research on capital markets regulation" />
                </div>

                {error && (
                  <div className="grotesk-regular tool-error" role="alert">
                    <AlertCircle size={15} aria-hidden />
                    <p>{error}</p>
                  </div>
                )}

                <button type="button" onClick={handleGenerate} disabled={blocked} className="tool-submit">
                  Write my letter <ArrowRight size={15} aria-hidden />
                </button>
                <p className="grotesk-regular tool-note">
                  An AI-generated draft. Read it, make it sound like you, and check every fact
                  before you send it.
                </p>
              </div>
            )}
          </section>
        )}

        {result && (() => {
          const wordCount = result.coverLetter.trim().split(/\s+/).filter(Boolean).length
          return (
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">Your draft</p>
              <p className="grotesk-regular doc-section-note">
                Read it before sending. A letter that sounds nothing like you is worse than a plain
                one.
              </p>
            </div>

            <div>
              <div className="tool-row">
                <p className="grotesk-bold tool-section-heading">Suggested subject line</p>
                <p className="grotesk-bold tool-subject">{result.subjectLine}</p>
              </div>

              <div className="tool-letter-head">
                {/* The count is shown, not just enforced in the prompt. Length is
                    the one thing a reader can check at a glance, and seeing it
                    is how anyone would notice the model drifting past the brief. */}
                <p className="grotesk-bold tool-section-heading" style={{ marginBottom: 0 }}>
                  Your cover letter <span className="grotesk-regular tool-label-hint">{wordCount} words</span>
                </p>
                <button type="button" onClick={handleCopy} className="grotesk-bold tool-copy">
                  {copied ? <><Check size={13} aria-hidden /> Copied</> : <><Copy size={13} aria-hidden /> Copy</>}
                </button>
              </div>

              <div className="tool-letter">
                {result.coverLetter.split('\n').map((para, i) => para.trim()
                  ? <p key={i} className="grotesk-regular">{para}</p>
                  : <div key={i} style={{ height: '0.5rem' }} />)}
              </div>

              {result.tipsForSending?.length > 0 && (
                <div className="tool-tips">
                  <p className="grotesk-bold tool-section-heading">Before you send it</p>
                  <ol className="tool-tip-list">
                    {result.tipsForSending.map((tip, i) => (
                      <li key={i}>
                        <span className="display-black tool-tip-num" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                        <p className="grotesk-regular">{tip}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <button type="button" onClick={handleReset} className="tool-restart">
                Write another letter <ArrowRight size={14} aria-hidden />
              </button>
            </div>
          </section>
          )
        })()}
      </ToolShell>

      {showHistory && (
        <div className="tool-drawer-scrim" onClick={() => setShowHistory(false)}>
          <div className="tool-drawer" role="dialog" aria-label="Cover letter history" onClick={e => e.stopPropagation()}>
            <div className="tool-drawer-head">
              <h3 className="display-black tool-drawer-title">Letter history</h3>
              <button type="button" onClick={() => setShowHistory(false)} className="tool-drawer-close" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {historyLoading && <Loader2 size={18} className="animate-spin" />}

            {!historyLoading && history.length === 0 && (
              <p className="grotesk-regular tool-drawer-empty">
                No letters yet. Every draft you generate will be listed here.
              </p>
            )}

            <div className="tool-drawer-list">
              {history.map(item => (
                <button key={item.id} onClick={() => loadFromHistory(item)} className="tool-drawer-item">
                  <p className="grotesk-bold tool-drawer-item-title">{item.target_role} at {item.employer}</p>
                  <p className="grotesk-regular tool-drawer-item-meta">
                    {new Date(item.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
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
