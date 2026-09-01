'use client'
import { useState, useRef, useEffect } from 'react'
import { Copy, Check, AlertCircle, ArrowRight, X, Loader2, Pencil, FileDown, FileText } from 'lucide-react'
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

  /* The draft the user is actually holding.
     ⚠ SEPARATE FROM `result`, NOT A MUTATION OF IT. `result` is what the model
     returned and it stays untouched, so Reset gives back the original draft
     rather than whatever state an edit left behind. Everything downstream, the
     copy button, the word count and both exports, reads `letter` below. */
  const [edited, setEdited] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  /* The letterhead. Not asked for before the letter exists, because none of it
     changes a word of the draft: it is only needed at the moment somebody
     downloads, and putting four more boxes above the Write button would cost
     completions on the step that matters. Prefilled from the profile where we
     already know the answer. */
  const [contact, setContact] = useState({ fullName: '', email: '', phone: '', location: '', linkedin: '' })
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null)

  useEffect(() => {
    if (!userId) return
    let live = true
    ;(async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { data } = await (supabase as any)
          .from('profiles')
          .select('full_name, email, linkedin_url, location')
          .eq('id', userId)
          .maybeSingle()
        if (!live) return
        setContact(c => ({
          ...c,
          fullName: c.fullName || data?.full_name || '',
          email: c.email || data?.email || user?.email || '',
          linkedin: c.linkedin || data?.linkedin_url || '',
          location: c.location || data?.location || '',
        }))
      } catch {
        /* A letterhead the user can type themselves is not worth an error
           message. The fields simply start empty. */
      }
    })()
    return () => { live = false }
  }, [userId])

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
    /* Clear the edit, or the letter opened from history renders the previous
       draft's edited text over the top of it. `letter` prefers `edited`. */
    setEdited(null)
    setEditing(false)
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

  /** The draft as it stands: the edit if there is one, else what came back. */
  const letter = edited ?? result?.coverLetter ?? ''

  function handleCopy() {
    if (!letter) return
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /**
   * Download the letter as PDF or Word.
   *
   * ⚠ THE BLOB IS REVOKED AND THE ANCHOR REMOVED. An object URL held after the
   * click keeps the whole rendered file in memory for the life of the tab, and
   * somebody trying both formats on three drafts would be holding six of them.
   */
  async function handleDownload(format: 'pdf' | 'docx') {
    if (!letter || downloading) return
    setDownloading(format)
    setError('')
    try {
      const res = await fetch(`/api/cover-letter/export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letter,
          name: contact.fullName || form.firstName,
          email: contact.email,
          phone: contact.phone,
          location: contact.location,
          linkedin: contact.linkedin,
          employer: form.employer,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error || 'That did not download. Try again in a moment.')
        return
      }

      /* The server sets the filename in Content-Disposition; read it back so
         the two cannot disagree, and fall back if the header is missing. */
      const disp = res.headers.get('Content-Disposition') || ''
      const starred = /filename\*=UTF-8''([^;]+)/i.exec(disp)
      const plain = /filename="([^"]+)"/i.exec(disp)
      const filename = starred
        ? decodeURIComponent(starred[1])
        : plain
          ? plain[1]
          : `cover-letter.${format}`

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('That did not download. Check your connection and try again.')
    } finally {
      setDownloading(null)
    }
  }

  const handleReset = () => {
    setResult(null)
    setEdited(null)
    setEditing(false)
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
          /* Counts the draft in hand, not the one that came back, so the number
             tracks an edit as it is typed. It is the only signal that a letter
             has drifted past the 250 word brief after somebody added to it. */
          const wordCount = letter.trim().split(/\s+/).filter(Boolean).length
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
                <div className="tool-letter-actions">
                  <button
                    type="button"
                    onClick={() => {
                      /* Entering edit seeds the textarea from whatever is
                         showing. Leaving it keeps the text: there is no Cancel,
                         because the only way back to the original is "Write
                         another letter", and a Cancel that silently discarded a
                         paragraph somebody had just typed would be worse than
                         not offering one at all. */
                      if (!editing) setEdited(letter)
                      setEditing(e => !e)
                    }}
                    className="grotesk-bold tool-copy"
                  >
                    {editing
                      ? <><Check size={13} aria-hidden /> Done</>
                      : <><Pencil size={13} aria-hidden /> Edit</>}
                  </button>
                  <button type="button" onClick={handleCopy} className="grotesk-bold tool-copy">
                    {copied ? <><Check size={13} aria-hidden /> Copied</> : <><Copy size={13} aria-hidden /> Copy</>}
                  </button>
                </div>
              </div>

              {editing ? (
                <textarea
                  className="tool-letter-edit grotesk-regular"
                  value={letter}
                  onChange={e => setEdited(e.target.value)}
                  aria-label="Edit your cover letter"
                  spellCheck
                />
              ) : (
                <div className="tool-letter">
                  {letter.split('\n').map((para, i) => para.trim()
                    ? <p key={i} className="grotesk-regular">{para}</p>
                    : <div key={i} style={{ height: '0.5rem' }} />)}
                </div>
              )}

              {/* ---- Letterhead and download -------------------------------
                  Asked for here rather than on the form above, because none of
                  it changes a word of the draft. It is only needed at the point
                  somebody downloads, and four more boxes above the Write button
                  would cost completions on the step that actually matters. */}
              <div className="tool-row">
                <p className="grotesk-bold tool-section-heading">Your details</p>
                <p className="grotesk-regular doc-section-note" style={{ marginBottom: '0.9rem' }}>
                  These go in the letterhead of the download. The LinkedIn address becomes a real
                  link in both formats. Leave anything blank and it is left out.
                </p>
                <div className="tool-grid">
                  <div>
                    <label htmlFor="cl-fullname" className="tool-label">Full name</label>
                    <input id="cl-fullname" type="text" className="tool-input grotesk-regular"
                      value={contact.fullName}
                      onChange={e => setContact(c => ({ ...c, fullName: e.target.value }))}
                      placeholder="e.g. Boluwatife Ogunleye" />
                  </div>
                  <div>
                    <label htmlFor="cl-email" className="tool-label">Email</label>
                    <input id="cl-email" type="email" className="tool-input grotesk-regular"
                      value={contact.email}
                      onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                      placeholder="you@example.com" />
                  </div>
                  <div>
                    <label htmlFor="cl-phone" className="tool-label">Phone</label>
                    <input id="cl-phone" type="tel" className="tool-input grotesk-regular"
                      value={contact.phone}
                      onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                      placeholder="+234 800 000 0000" />
                  </div>
                  <div>
                    <label htmlFor="cl-linkedin" className="tool-label">
                      LinkedIn <span className="tool-label-hint">(optional)</span>
                    </label>
                    <input id="cl-linkedin" type="text" className="tool-input grotesk-regular"
                      value={contact.linkedin}
                      onChange={e => setContact(c => ({ ...c, linkedin: e.target.value }))}
                      placeholder="linkedin.com/in/your-name" />
                  </div>
                  <div>
                    <label htmlFor="cl-location" className="tool-label">Location</label>
                    <input id="cl-location" type="text" className="tool-input grotesk-regular"
                      value={contact.location}
                      onChange={e => setContact(c => ({ ...c, location: e.target.value }))}
                      placeholder="e.g. Lagos, Nigeria" />
                  </div>
                </div>

                <div className="tool-letter-actions" style={{ marginTop: '1.1rem' }}>
                  <button type="button" onClick={() => handleDownload('pdf')}
                    disabled={!!downloading} className="grotesk-bold tool-copy">
                    {downloading === 'pdf'
                      ? <><Loader2 size={13} className="animate-spin" aria-hidden /> Building</>
                      : <><FileDown size={13} aria-hidden /> Download PDF</>}
                  </button>
                  <button type="button" onClick={() => handleDownload('docx')}
                    disabled={!!downloading} className="grotesk-bold tool-copy">
                    {downloading === 'docx'
                      ? <><Loader2 size={13} className="animate-spin" aria-hidden /> Building</>
                      : <><FileText size={13} aria-hidden /> Download Word</>}
                  </button>
                </div>
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
