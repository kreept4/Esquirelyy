'use client'
import { useState } from 'react'
import {
  Upload,
  FileText,
  Loader2,
  ArrowRight,
  AlertCircle,
  X,
  Download,
  Sparkles,
  FileDown,
} from 'lucide-react'
import { useRequireAuth } from '../useRequireAuth'
import { createClient } from '@/lib/supabase/client'
import ToolShell from '../ToolShell'
import BrandLoader from '@/components/ui/BrandLoader'
import CVPreview from './CVPreview'
import type { GeneratedCV } from '@/lib/cv/types'

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

type GenerateResult = {
  cv: GeneratedCV
  changes: string[]
  gaps: string[]
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

type GenerationHistoryItem = {
  id: string
  first_name: string
  target_role: string
  source_file: string
  document: GeneratedCV
  changes: string[]
  gaps: string[]
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
  { value: 'junior', label: 'Junior (0-3 years post-call)' },
  { value: 'mid', label: 'Mid-level (3-6 years post-call)' },
  { value: 'senior', label: 'Senior (6+ years post-call)' },
]

/**
 * Reviewing and rebuilding are separate things a user may want.
 *
 * The obvious build was a Rebuild button bolted to the end of a review, which
 * quietly makes the review a toll gate on the rebuild. Someone who already
 * knows their CV is weak should not have to sit through a critique to get a
 * better version, and someone who only wanted the critique should not wait
 * through the slower call. So the choice is made up front, and the review still
 * offers the rebuild afterwards for the people who want both.
 */
type Mode = 'review' | 'generate'

const MODES: { value: Mode; label: string; note: string }[] = [
  {
    value: 'review',
    label: 'Review it',
    note: 'Specific feedback on what is working and what is not, written against what Nigerian firms screen for.',
  },
  {
    value: 'generate',
    label: 'Rebuild it',
    note: 'A rebuilt, ATS-ready CV in your own template, to download as Word or PDF.',
  },
]

export default function CVReviewPage() {
  const { checking, userId } = useRequireAuth()
  const [mode, setMode] = useState<Mode>('review')
  const [firstName, setFirstName] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [careerStage, setCareerStage] = useState('')
  /* Asked for rather than parsed out of the upload. A LinkedIn URL is the one
     contact line that is routinely wrong on a CV — truncated by a PDF export,
     left as the "www.linkedin.com/in/" stub, or missing because the source was
     written before the profile existed — and it is the only one a reader is
     likely to click. Typing it once is more reliable than any amount of
     extraction, and an empty box simply means the line is omitted. */
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [generated, setGenerated] = useState<GenerateResult | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  /**
   * Whether the rebuild can run without asking for the file again.
   *
   * It needs the file, because nothing server side keeps a copy: the upload is
   * read, parsed and dropped, which is what the note under the drop zone
   * promises. So a review loaded from history cannot be rebuilt until the
   * original comes back, and the page asks for it rather than failing when the
   * button is pressed.
   */
  const canGenerate = Boolean(file)

  async function loadHistory() {
    if (!userId) return
    setHistoryLoading(true)
    const supabase = createClient()

    // Both lists in one round trip. cv_generations may not exist yet on a
    // database where scripts/2026-08-07-cv-generations.sql has not been run, so
    // its failure is swallowed rather than emptying the whole drawer.
    const [reviews, generations] = await Promise.all([
      (supabase as any)
        .from('cv_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      (supabase as any)
        .from('cv_generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    setHistory(reviews.data || [])
    setGenerationHistory(generations.error ? [] : generations.data || [])
    setHistoryLoading(false)
  }

  function openHistory() {
    setShowHistory(true)
    loadHistory()
  }

  function loadFromHistory(item: HistoryItem) {
    setResult(item.result)
    setGenerated(null)
    setFirstName(item.first_name || '')
    setTargetRole(item.target_role || '')
    setCareerStage(item.career_stage || '')
    // The file that produced this review is long gone, so the rebuild has to
    // ask for it again.
    setFile(null)
    setError('')
    setShowHistory(false)
  }

  function loadGenerationFromHistory(item: GenerationHistoryItem) {
    setGenerated({ cv: item.document, changes: item.changes || [], gaps: item.gaps || [] })
    setResult(null)
    setFirstName(item.first_name || '')
    setTargetRole(item.target_role || '')
    setError('')
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

  /** The fields both routes take, assembled once. */
  function baseFormData(): FormData {
    const fd = new FormData()
    fd.append('file', file as File)
    fd.append('firstName', firstName.trim())
    if (targetRole.trim()) fd.append('targetRole', targetRole.trim())
    if (careerStage) {
      fd.append(
        'careerStage',
        CAREER_STAGES.find(s => s.value === careerStage)?.label || careerStage
      )
    }
    return fd
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

    if (mode === 'generate') {
      await runGeneration(null)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setGenerated(null)
    try {
      const res = await fetch('/api/cv-review', { method: 'POST', body: baseFormData() })
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

  /**
   * Rebuild the CV.
   *
   * `review` is passed through from the client rather than looked up again,
   * because the user is looking at it and it is the thing they expect the new
   * document to answer. Called with null when someone skipped straight here.
   */
  async function runGeneration(review: ReviewResult | null) {
    if (!file) {
      setError('Upload your CV again to rebuild it. We keep the review, not the file.')
      return
    }
    if (!firstName.trim()) {
      setError('Please tell us your first name.')
      return
    }
    setGenerating(true)
    setError('')
    setGenerated(null)
    try {
      const fd = baseFormData()
      if (linkedinUrl.trim()) fd.append('linkedinUrl', linkedinUrl.trim())
      if (jobDescription.trim()) fd.append('jobDescription', jobDescription.trim())
      if (review) fd.append('review', JSON.stringify(review))

      const res = await fetch('/api/cv-generate', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not rebuild the CV. Please try again.')
        setGenerating(false)
        return
      }
      setGenerated(data)

      if (userId) {
        const supabase = createClient()
        // Tolerant of the table not existing yet. A failed save should not take
        // away a document the user is already looking at.
        const { error: saveError } = await (supabase as any).from('cv_generations').insert({
          user_id: userId,
          first_name: firstName.trim(),
          target_role: targetRole.trim() || null,
          career_stage: careerStage || null,
          source_file: file.name,
          document: data.cv,
          changes: data.changes || [],
          gaps: data.gaps || [],
        })
        if (saveError) {
          console.warn('Generated CV was not saved to history:', saveError.message)
        }
      }
    } catch {
      setError('Something went wrong. Please check your connection and try again.')
    } finally {
      setGenerating(false)
    }
  }

  /**
   * Download.
   *
   * The file comes back as a blob rather than as a link to a stored one,
   * because nothing is stored: both formats are rendered on demand from the
   * JSON. The object URL is revoked straight after, since a page where someone
   * downloads three times otherwise leaks three documents' worth of memory.
   */
  async function download(format: 'pdf' | 'docx' | 'both') {
    if (!generated) return
    setDownloading(format)
    setError('')
    try {
      const res = await fetch(`/api/cv-export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv: generated.cv }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not build the file. Please try again.')
        return
      }

      // Use the filename the server chose, so the attachment arrives with the
      // candidate's name on it rather than as "cv".
      const disposition = res.headers.get('Content-Disposition') || ''
      const encoded = /filename\*=UTF-8''([^;]+)/.exec(disposition)
      const plain = /filename="([^"]+)"/.exec(disposition)
      const filename = encoded
        ? decodeURIComponent(encoded[1])
        : plain
          ? plain[1]
          : `CV.${format === 'both' ? 'zip' : format}`

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
      setError('The download did not start. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const handleReset = () => {
    setResult(null)
    setGenerated(null)
    setFile(null)
    setFirstName('')
    setTargetRole('')
    setCareerStage('')
    setJobDescription('')
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

  const showForm = !result && !generated

  return (
    <>
      <ToolShell
        title="CV review."
        lede="Upload your CV for specific, unsentimental feedback written against what Nigerian firms actually screen for, or have it rebuilt into an ATS-ready document you can download."
        onHistory={openHistory}
      >
        {showForm && (
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">Your CV</p>
              <p className="grotesk-regular doc-section-note">
                The file is read, analysed and discarded. Your review is saved to your account, and
                so is any CV you go on to generate.
              </p>
            </div>

            {loading || generating ? (
              <div className="tool-card">
                <BrandLoader
                  label={generating ? 'Rebuilding your CV' : 'Reading your CV'}
                  note={
                    generating
                      ? 'This takes a couple of minutes. Every line is rewritten against your own material, laid out in your template, then checked for anything a parser would trip on.'
                      : 'This takes up to a minute. The file is parsed, assessed against what an applicant tracking system looks for, then read line by line.'
                  }
                />
              </div>
            ) : (
              <div className="tool-card">
                <div className="tool-row">
                  <span className="tool-label" id="cv-mode-label">
                    What do you want done
                  </span>
                  <div className="tool-modes" role="radiogroup" aria-labelledby="cv-mode-label">
                    {MODES.map(m => (
                      <button
                        key={m.value}
                        type="button"
                        role="radio"
                        aria-checked={mode === m.value}
                        onClick={() => setMode(m.value)}
                        className="tool-mode"
                        data-active={mode === m.value}
                      >
                        <span className="grotesk-bold tool-mode-label">{m.label}</span>
                        <span className="grotesk-regular tool-mode-note">{m.note}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tool-grid">
                  <div>
                    <label htmlFor="cv-first-name" className="tool-label">
                      First name
                    </label>
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
                  <label htmlFor="cv-linkedin" className="tool-label">
                    LinkedIn <span className="tool-label-hint">(optional)</span>
                  </label>
                  {/* type="url" would make the browser reject "linkedin.com/in/x"
                      for having no scheme, which is how most people write it.
                      The server normalises instead, so what is typed is accepted
                      and what lands on the CV is a real link. */}
                  <input
                    id="cv-linkedin"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    className="tool-input grotesk-regular"
                    value={linkedinUrl}
                    onChange={e => setLinkedinUrl(e.target.value)}
                    placeholder="linkedin.com/in/your-profile"
                  />
                </div>

                <div className="tool-row">
                  <label htmlFor="cv-stage" className="tool-label">
                    Career stage
                  </label>
                  <select
                    id="cv-stage"
                    className="tool-select grotesk-regular"
                    value={careerStage}
                    onChange={e => setCareerStage(e.target.value)}
                  >
                    {CAREER_STAGES.map(s => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Only offered on the rebuild. The reviewer has no use for it:
                    it critiques the CV in front of it rather than writing
                    toward a posting. */}
                {mode === 'generate' && (
                  <div className="tool-row">
                    <label htmlFor="cv-jd" className="tool-label">
                      Job description <span className="tool-label-hint">(optional)</span>
                    </label>
                    <textarea
                      id="cv-jd"
                      className="tool-textarea grotesk-regular"
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      placeholder="Paste the posting you are applying to. The CV will be angled at it, using only experience you actually have."
                    />
                  </div>
                )}

                <div
                  className="tool-drop"
                  data-over={dragOver}
                  onDragOver={e => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setDragOver(false)
                    handleFile(e.dataTransfer.files[0] || null)
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
                      <FileText size={22} className="tool-drop-icon" aria-hidden />
                      <p className="grotesk-bold tool-drop-title">{file.name}</p>
                      <button type="button" onClick={() => setFile(null)} className="tool-drop-swap">
                        Choose a different file
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="cv-file-input" style={{ cursor: 'pointer', display: 'block' }}>
                      <Upload size={22} className="tool-drop-icon" aria-hidden />
                      <p className="grotesk-bold tool-drop-title">
                        Drop your CV here, or click to upload
                      </p>
                      <p className="grotesk-regular tool-drop-note">
                        PDF, DOCX or TXT. Maximum 5MB.
                      </p>
                    </label>
                  )}
                </div>

                {error && (
                  <div className="grotesk-regular tool-error" role="alert">
                    <AlertCircle size={15} aria-hidden />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || generating}
                  className="tool-submit"
                >
                  {mode === 'generate' ? 'Rebuild my CV' : 'Get my review'}{' '}
                  <ArrowRight size={15} aria-hidden />
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
                      <p key={i} className="grotesk-regular">
                        {s}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="grotesk-bold tool-col-heading">Where to improve</h2>
                  <div className="tool-list">
                    {result.weaknesses.map((w, i) => (
                      <p key={i} className="grotesk-regular">
                        {w}
                      </p>
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

              {/* The offer, not the assumption. Reading a review is not the same
                  as asking for the CV to be rewritten, so this is a button
                  rather than something that has already happened. */}
              <div className="tool-offer">
                <h2 className="grotesk-bold tool-offer-title">
                  <Sparkles size={16} aria-hidden /> Want this rebuilt?
                </h2>
                <p className="grotesk-regular tool-offer-note">
                  Every fix above, applied to your own material, laid out in the template your CV
                  already uses and checked against what an applicant tracking system parses. Nothing
                  gets invented. Download it as Word or PDF.
                </p>

                {generating ? (
                  <BrandLoader label="Rebuilding your CV" note="This takes a couple of minutes." />
                ) : canGenerate ? (
                  <button type="button" onClick={() => runGeneration(result)} className="tool-submit">
                    Rebuild my CV <ArrowRight size={15} aria-hidden />
                  </button>
                ) : (
                  <div
                    className="tool-drop tool-drop-inline"
                    data-over={dragOver}
                    onDragOver={e => {
                      e.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                      e.preventDefault()
                      setDragOver(false)
                      handleFile(e.dataTransfer.files[0] || null)
                    }}
                  >
                    <input
                      id="cv-file-reupload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={e => handleFile(e.target.files?.[0] || null)}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="cv-file-reupload"
                      style={{ cursor: 'pointer', display: 'block' }}
                    >
                      <Upload size={20} className="tool-drop-icon" aria-hidden />
                      <p className="grotesk-bold tool-drop-title">Upload your CV again</p>
                      <p className="grotesk-regular tool-drop-note">
                        We kept the review, not the file, so the original has to come back before it
                        can be rebuilt.
                      </p>
                    </label>
                  </div>
                )}

                {error && (
                  <div className="grotesk-regular tool-error" role="alert">
                    <AlertCircle size={15} aria-hidden />
                    <p>{error}</p>
                  </div>
                )}
              </div>

              <button type="button" onClick={handleReset} className="tool-restart">
                Review another CV <ArrowRight size={14} aria-hidden />
              </button>
            </div>
          </section>
        )}

        {generated && (
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">Your rebuilt CV</p>
              <p className="grotesk-regular doc-section-note">
                Built from what was already on your CV, in your own template. Read it before you
                send it.
              </p>
            </div>

            <div>
              <div className="tool-downloads">
                <button
                  type="button"
                  onClick={() => download('docx')}
                  disabled={downloading !== null}
                  className="tool-submit"
                >
                  {downloading === 'docx' ? (
                    <Loader2 size={15} className="animate-spin" aria-hidden />
                  ) : (
                    <FileDown size={15} aria-hidden />
                  )}
                  Word (.docx)
                </button>
                <button
                  type="button"
                  onClick={() => download('pdf')}
                  disabled={downloading !== null}
                  className="tool-submit"
                >
                  {downloading === 'pdf' ? (
                    <Loader2 size={15} className="animate-spin" aria-hidden />
                  ) : (
                    <FileDown size={15} aria-hidden />
                  )}
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => download('both')}
                  disabled={downloading !== null}
                  className="tool-submit tool-submit-quiet"
                >
                  {downloading === 'both' ? (
                    <Loader2 size={15} className="animate-spin" aria-hidden />
                  ) : (
                    <Download size={15} aria-hidden />
                  )}
                  Both
                </button>
              </div>

              <p className="grotesk-regular tool-note tool-downloads-note">
                The Word file stays editable. Both are laid out identically and both parse cleanly,
                so send whichever the employer asks for.
              </p>

              {error && (
                <div className="grotesk-regular tool-error" role="alert">
                  <AlertCircle size={15} aria-hidden />
                  <p>{error}</p>
                </div>
              )}

              <CVPreview cv={generated.cv} />

              {generated.changes.length > 0 && (
                <div className="tool-changes">
                  <h2 className="grotesk-bold tool-section-heading">What changed</h2>
                  <div className="tool-list">
                    {generated.changes.map((c, i) => (
                      <p key={i} className="grotesk-regular">
                        {c}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Shown rather than buried. The alternative to naming a gap is
                  filling it with something invented, which is the one thing
                  this tool must not do, so the restraint has to be visible or
                  it just looks like an omission. */}
              {generated.gaps.length > 0 && (
                <div className="tool-changes">
                  <h2 className="grotesk-bold tool-section-heading">What would make it stronger</h2>
                  <p className="grotesk-regular tool-offer-note">
                    None of this was on your CV, so none of it was added. Put it in yourself if it is
                    true.
                  </p>
                  <div className="tool-list">
                    {generated.gaps.map((g, i) => (
                      <p key={i} className="grotesk-regular">
                        {g}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <button type="button" onClick={handleReset} className="tool-restart">
                Start again <ArrowRight size={14} aria-hidden />
              </button>
            </div>
          </section>
        )}
      </ToolShell>

      {showHistory && (
        <div className="tool-drawer-scrim" onClick={() => setShowHistory(false)}>
          <div
            className="tool-drawer"
            role="dialog"
            aria-label="History"
            onClick={e => e.stopPropagation()}
          >
            <div className="tool-drawer-head">
              <h3 className="display-black tool-drawer-title">History</h3>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="tool-drawer-close"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {historyLoading && <Loader2 size={18} className="animate-spin" />}

            {!historyLoading && history.length === 0 && generationHistory.length === 0 && (
              <p className="grotesk-regular tool-drawer-empty">
                Nothing yet. Every CV you review or rebuild will be listed here.
              </p>
            )}

            {!historyLoading && generationHistory.length > 0 && (
              <>
                <p className="grotesk-bold tool-drawer-group">Rebuilt CVs</p>
                <div className="tool-drawer-list">
                  {generationHistory.map(item => (
                    <button
                      key={item.id}
                      onClick={() => loadGenerationFromHistory(item)}
                      className="tool-drawer-item"
                    >
                      <p className="grotesk-bold tool-drawer-item-title">
                        {item.source_file || 'Rebuilt CV'}
                      </p>
                      <p className="grotesk-regular tool-drawer-item-meta">
                        {item.target_role || 'No target role'} ·{' '}
                        {new Date(item.created_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {!historyLoading && history.length > 0 && (
              <>
                <p className="grotesk-bold tool-drawer-group">Reviews</p>
                <div className="tool-drawer-list">
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="tool-drawer-item"
                    >
                      <p className="grotesk-bold tool-drawer-item-title">
                        {item.file_name || 'CV review'}
                      </p>
                      <p className="grotesk-regular tool-drawer-item-meta">
                        {item.target_role || 'No target role'} ·{' '}
                        {new Date(item.created_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </>
  )
}
