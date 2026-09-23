'use client'
import { useState, useRef, useEffect } from 'react'
import { Copy, Check, AlertCircle, ArrowRight, X, Loader2, Pencil, FileDown, FileText } from 'lucide-react'
import { useRequireAuth } from '../useRequireAuth'
import { createClient } from '@/lib/supabase/client'
import { officesForEmployer } from '@/lib/firms-data'
import ToolShell from '../ToolShell'
import { countBodyWords, WORD_CEILING } from '@/lib/cover-letter/word-count'
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
  division: string | null
  career_stage: string
  tone: string
  advert: string | null
  employer_knowledge: string | null
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

/**
 * Suggestions for the division box.
 *
 * ⚠ A PLAIN LIST RATHER THAN THE PRACTICE AREAS OF THE MATCHED FIRM, and the
 * reason is the client bundle. firms-data.ts is three thousand lines; pulling
 * it into this page to populate a datalist would ship the whole directory to
 * anybody who opens the cover letter tool, for a dropdown. These are the areas
 * the directory itself uses most, so a candidate typing from this list produces
 * a string that matches a firm's published practice area on the server anyway.
 *
 * It is a datalist, not a select. Divisions are named inconsistently across
 * firms, half of them are hyphenated differently, and a candidate applying to a
 * team we have not thought of must be able to type it.
 */
const DIVISIONS = [
  'Dispute Resolution',
  'Corporate & Commercial',
  'Banking & Finance',
  'Capital Markets',
  'Energy & Natural Resources',
  'Projects & Infrastructure',
  'Real Estate',
  'Intellectual Property',
  'Tax',
  'Employment & Labour',
  'Shipping & Maritime',
  'Aviation',
  'Technology, Media & Telecommunications',
  'Arbitration',
  'Public Law & Regulatory',
  'Compliance',
  'Private Client & Wealth',
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
    office: '',
    division: '',
    careerStage: '',
    tone: 'formal and confident',
    cvSummary: '',
    highlights: '',
    advert: '',
    employerKnowledge: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  /* The optional fields are folded away by default. See the note beside the
     toggle for why these six and not the other four. */
  const [more, setMore] = useState(false)
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

  const set = (k: string, v: string) =>
    setForm(f => ({
      ...f,
      [k]: v,
      /* ⚠ CHANGING THE EMPLOYER CLEARS THE OFFICE. Without this, picking
         Templars' Port Harcourt office and then correcting the employer to
         Aluko leaves Port Harcourt selected against a firm whose offices were
         never offered, and it prints on the letter as the recipient address. */
      ...(k === 'employer' ? { office: '' } : {}),
    }))

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
    /* Every input that shaped the draft comes back, not just the two that
       used to. Reopening a letter whose division and advert had been dropped
       and pressing Write again produced a different letter from the one on the
       screen, which is the thing a history drawer exists to prevent. */
    setForm(f => ({
      ...f,
      targetRole: item.target_role || '',
      employer: item.employer || '',
      office: '',
      division: item.division || '',
      careerStage: item.career_stage || '',
      tone: item.tone || 'formal and confident',
      advert: item.advert || '',
      employerKnowledge: item.employer_knowledge || '',
    }))
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
        if (form.division) fd.append('division', form.division)
        if (form.careerStage) fd.append('careerStage', form.careerStage)
        fd.append('tone', form.tone)
        if (form.highlights) fd.append('highlights', form.highlights)
        if (form.advert) fd.append('advert', form.advert)
        if (form.employerKnowledge) fd.append('employerKnowledge', form.employerKnowledge)
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
          division: form.division || null,
          career_stage: form.careerStage || null,
          tone: form.tone,
          advert: form.advert || null,
          employer_knowledge: form.employerKnowledge || null,
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
          /* ⚠ THE FULL STREET ADDRESS, NOT THE CITY. `form.office` holds the
             city because that is what a dropdown of "Lagos / Abuja / Port
             Harcourt" can usefully show, and a recipient block wants the
             address that city stands for. Looked up here rather than stored, so
             a corrected address in firms-data reaches the next letter without
             anything else changing.

             This is also the line that was missing entirely. LetterDoc has
             carried `employerLocation` since it was written, the export route
             accepts it and both the PDF and the DOCX render it; the page simply
             never sent one, so the recipient block printed the firm name over
             nothing. */
          employerLocation:
            offices.find(o => o.city === form.office)?.address || undefined,
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
    setForm({ firstName: '', targetRole: '', employer: '', office: '', division: '', careerStage: '', tone: 'formal and confident', cvSummary: '', highlights: '', advert: '', employerKnowledge: '' })
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

  /**
   * The typed employer's own offices, if we have researched that firm.
   *
   * ⚠ RECOMPUTED FROM `form.employer` ON EVERY RENDER RATHER THAN STORED. The
   * employer is a free text box somebody is still typing in, so any copy of
   * this held in state is stale the moment they correct a letter of it, and a
   * stale office list is one that offers Templars' addresses to somebody who
   * has since typed Aluko. Deriving it costs one array scan over 75 firms.
   *
   * Empty for any employer outside the directory, which is deliberate: see
   * officesForEmployer for why a firm we have not researched gets no office
   * block rather than a box to type one into.
   */
  const offices = officesForEmployer(form.employer)

  const blocked = loading || !form.targetRole || !form.employer || (mode === 'cv' && !cvFile)

  return (
    <>
      <ToolShell
        title="Cover letter."
        lede="Tell us the role, the team and your background. We will draft a letter that answers why this firm, why this team, why you fit and why it is the right move, in under 200 words."
        onHistory={openHistory}
      >
        {!result && (
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">The application</p>
              <p className="grotesk-regular doc-section-note">
                Role and employer are the only required fields. The team, the advert and your
                background are optional, and they are what stop the letter reading like everyone
                else&rsquo;s.
              </p>
            </div>

            {loading ? (
              <div className="tool-card">
                <BrandLoader
                  label="Writing your letter"
                  note="This takes about half a minute. The draft is written against the role, the team, our research on the employer and whatever background you gave us."
                />
              </div>
            ) : (
              <div className="tool-card">
                <div className="tool-grid">
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
                  {/* ⚠ ONLY APPEARS ONCE THE EMPLOYER IS ONE WE HAVE RESEARCHED,
                      and the options are that firm's own addresses rather than
                      anything typed. This ends up printed as the recipient block
                      on a formal application, so a free text box here would let
                      somebody put a wrong address on their own letter in a place
                      the reader is certain to look. A firm outside the directory
                      gets no office line at all, which is the honest version.

                      Rendered inside the grid so it takes the same column as
                      Employer above it and the row does not reflow when it
                      appears. Visible rather than behind the fold, unlike the
                      six refinements down there, because this one changes what
                      is printed rather than how the letter reads. */}
                  {offices.length > 0 && (
                    <div>
                      <label htmlFor="cl-office" className="tool-label">
                        Which office <span className="tool-label-hint">(optional)</span>
                      </label>
                      <select id="cl-office" className="tool-select grotesk-regular"
                        value={form.office} onChange={e => set('office', e.target.value)}>
                        <option value="">Not specified</option>
                        {offices.map(o => (
                          <option key={o.city} value={o.city}>{o.city}</option>
                        ))}
                      </select>
                    </div>
                  )}
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

                {/* ---- The two boxes that answer "why them" ------------------
                    Both optional, both last, and both worth more than anything
                    above them. The advert is the only text in the form the
                    employer wrote themselves, so it is what the letter answers
                    when it says why this experience fits. The box under it is
                    the only place a reason can come from that no other applicant
                    has. Where neither is filled, the letter falls back to our
                    own research on the firm, which is better than nothing and
                    thinner than either of these. */}
                <div className="tool-row">
                  <label htmlFor="cl-advert" className="tool-label">
                    Paste the job advert <span className="tool-label-hint">(optional, and it makes the biggest difference)</span>
                  </label>
                  <textarea id="cl-advert" className="tool-textarea grotesk-regular" rows={4}
                    value={form.advert} onChange={e => set('advert', e.target.value)}
                    placeholder="Paste the listing exactly as published. The letter answers what they actually asked for, in their order of priority." />
                </div>

                {/* ---- Everything that is optional, behind one fold -------
                    ⚠ WHY THIS IS FOLDED AND THE FOUR ABOVE IT ARE NOT.
                    The form grew to eleven inputs, and only two of them are
                    required. Nobody reads eleven boxes as "two required and
                    nine that help"; they read it as eleven boxes, and the
                    cover letter tool is the least used of the four despite
                    being the one that saves the most work. A form that looks
                    like an application form to write an application is the
                    wrong first impression.

                    ⚠ THE ADVERT AND THE BACKGROUND STAY IN THE OPEN, which is
                    the whole judgement here. The advert's own label says it
                    makes the biggest difference, and hiding the field that
                    matters most to prove the form is short would be trading
                    the output for the impression. What goes behind the fold is
                    the six that refine a letter rather than make one.

                    Open state is not persisted on purpose. Somebody who opened
                    it once is not thereby a person who wants eleven boxes
                    every time. */}
                <div className="tool-row">
                  <button type="button" className="tool-drop-swap" onClick={() => setMore(v => !v)}
                    aria-expanded={more} aria-controls="cl-more">
                    {more ? 'Hide the extra detail' : 'Add more detail (optional)'}
                  </button>
                  {!more && (
                    <p className="grotesk-regular tool-note" style={{ marginTop: '0.4rem' }}>
                      The team you are applying to, what you already know about them, and what to
                      lead with. Each one makes the letter more specific.
                    </p>
                  )}
                </div>

                {more && (
                  <div id="cl-more">
                    <div className="tool-grid">
                  <div>
                    <label htmlFor="cl-name" className="tool-label">
                      First name <span className="tool-label-hint">(optional)</span>
                    </label>
                    <input id="cl-name" type="text" className="tool-input grotesk-regular"
                      value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="e.g. Damian" />
                  </div>
                  <div>
                    <label htmlFor="cl-division" className="tool-label">
                      Team or division <span className="tool-label-hint">(optional)</span>
                    </label>
                    {/* The letter has to say why this team, and a letter written
                        to a firm without knowing which team can only say why the
                        firm. Type anything: the list is a shortcut, not a set of
                        allowed answers. */}
                    <input id="cl-division" type="text" className="tool-input grotesk-regular"
                      list="cl-division-list"
                      value={form.division} onChange={e => set('division', e.target.value)}
                      placeholder="e.g. Dispute Resolution" />
                    <datalist id="cl-division-list">
                      {DIVISIONS.map(d => <option key={d} value={d} />)}
                    </datalist>
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
                  <label htmlFor="cl-highlights" className="tool-label">
                    Highlights to emphasise <span className="tool-label-hint">(optional)</span>
                  </label>
                  <textarea id="cl-highlights" className="tool-textarea grotesk-regular" rows={2}
                    value={form.highlights} onChange={e => set('highlights', e.target.value)}
                    placeholder="e.g. led the moot court team, published research on capital markets regulation" />
                </div>

                <div className="tool-row">
                  <label htmlFor="cl-knowledge" className="tool-label">
                    What you know about them <span className="tool-label-hint">(optional)</span>
                  </label>
                  <textarea id="cl-knowledge" className="tool-textarea grotesk-regular" rows={2}
                    value={form.employerKnowledge} onChange={e => set('employerKnowledge', e.target.value)}
                    placeholder="e.g. a partner taught my arbitration module, or you acted on a deal I wrote about" />
                  <p className="grotesk-regular tool-note" style={{ marginTop: '0.5rem' }}>
                    Something real and specific beats praise. We already know the firm&rsquo;s
                    offices, practice areas and directory rankings, and the letter uses those.
                  </p>
                </div>

                  </div>
                )}

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
             has drifted past the brief after somebody added to it.

             ⚠ THE SAME COUNTER THE ROUTE ENFORCES WITH, imported rather than
             reimplemented. It counts the body only, between the salutation and
             the sign off, and a local one-liner counting the whole string
             showed a number twelve words higher than the one the server had
             just trimmed to. Two counts of the same letter that disagree is
             worse than no count at all. */
          const wordCount = countBodyWords(letter)
          const overCeiling = wordCount > WORD_CEILING
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
                  Your cover letter{' '}
                  {/* The ceiling is named next to the count rather than left
                      implied. A reader who sees "212 words" alone has no way to
                      know whether that is fine; the number only means something
                      beside the brief it is being held to. */}
                  <span className="grotesk-regular tool-label-hint">
                    {wordCount} words{overCeiling ? ` (over the ${WORD_CEILING} word brief)` : ''}
                  </span>
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
