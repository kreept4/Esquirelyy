'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Upload, FileText, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

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

const SCORE_LABELS: Record<string, string> = {
  structure: 'Structure & Formatting',
  impact: 'Impact & Specificity',
  marketFit: 'Market Fit',
  atsCompatibility: 'ATS Compatibility',
}

const CAREER_STAGES = [
  { value: '', label: 'Select your stage' },
  { value: 'student', label: 'Law Student' },
  { value: 'nysc', label: 'NYSC Corps Member' },
  { value: 'junior', label: 'Junior (0-3 yrs PQE)' },
  { value: 'mid', label: 'Mid-level (3-6 yrs PQE)' },
  { value: 'senior', label: 'Senior (6+ yrs PQE)' },
]

export default function CVReviewPage() {
  const [firstName, setFirstName] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [careerStage, setCareerStage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReviewResult | null>(null)

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

  const accent = '#8B3A3A'

  return (
    <div>
      <Navbar />
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '80px', minHeight: '100vh' }}>

        <div style={{ borderBottom: '0.5px solid #E8E0D5', padding: '3rem 2rem 2.5rem', backgroundColor: '#F0EBE3' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: accent, opacity: 0.7, marginBottom: '0.5rem' }}>
              AI Career Tools
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.6rem', lineHeight: 1.15 }}>
              CV Review
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem', color: '#4A4A4A', lineHeight: 1.6, maxWidth: '560px' }}>
              Upload your CV and get honest, specific feedback written for the Nigerian legal market, the kind you would get from a senior recruiter who has actually placed candidates at firms like yours.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>

          {!result && (
            <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid #E8E0D5', padding: '2rem' }}>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                  Your First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. Adaeze"
                  style={{
                    width: '100%', padding: '0.75rem 1rem', fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.92rem', color: '#1A1A1A', backgroundColor: '#FAF7F2',
                    border: '0.5px solid #E8E0D5', borderRadius: '2px', outline: 'none', boxSizing: 'border-box' as const,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                    Target Role (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="e.g. Junior Associate"
                    style={{
                      width: '100%', padding: '0.75rem 1rem', fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.92rem', color: '#1A1A1A', backgroundColor: '#FAF7F2',
                      border: '0.5px solid #E8E0D5', borderRadius: '2px', outline: 'none', boxSizing: 'border-box' as const,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.5rem' }}>
                    Career Stage
                  </label>
                  <select
                    value={careerStage}
                    onChange={e => setCareerStage(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.92rem', color: '#1A1A1A', backgroundColor: '#FAF7F2',
                      border: '0.5px solid #E8E0D5', borderRadius: '2px', cursor: 'pointer', boxSizing: 'border-box' as const,
                    }}
                  >
                    {CAREER_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  handleFile(e.dataTransfer.files[0] || null)
                }}
                style={{
                  border: dragOver ? '1.5px dashed ' + accent : '1.5px dashed #D5C9BC',
                  borderRadius: '2px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center' as const,
                  backgroundColor: dragOver ? '#FAF1ED' : '#FAF7F2',
                  marginBottom: '1.5rem',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="file"
                  id="cv-file-input"
                  accept=".pdf,.docx,.txt"
                  onChange={e => handleFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                {file ? (
                  <div>
                    <FileText size={28} style={{ color: accent, margin: '0 auto 0.75rem' }} />
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1A1A1A', fontWeight: 600, marginBottom: '0.25rem' }}>{file.name}</p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A', marginBottom: '0.75rem' }}>{(file.size / 1024).toFixed(0)} KB</p>
                    <button
                      onClick={() => setFile(null)}
                      style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: accent, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Choose a different file
                    </button>
                  </div>
                ) : (
                  <label htmlFor="cv-file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload size={28} style={{ color: '#A89A8A', margin: '0 auto 0.75rem' }} />
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1A1A1A', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Drop your CV here or click to upload
                    </p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A' }}>
                      PDF, DOCX, or TXT. Maximum 5MB.
                    </p>
                  </label>
                )}
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '0.75rem 1rem', backgroundColor: '#FBEAEA', border: '0.5px solid #E0B8B8', borderRadius: '2px', marginBottom: '1.5rem' }}>
                  <AlertCircle size={15} style={{ color: '#B5451B', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#7A2E1B' }}>{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  backgroundColor: loading ? '#B0A89E' : accent, color: '#FAF7F2',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  border: 'none', borderRadius: '2px', cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Reading your CV...
                  </>
                ) : (
                  <>
                    Get My Review
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          )}

          {result && (
            <div>
              <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid #E8E0D5', borderTop: '3px solid ' + accent, padding: '2rem', marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.98rem', color: '#1A1A1A', lineHeight: 1.75 }}>
                  {result.greeting}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid #E8E0D5', padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '1rem' }}>
                  Overall Impression
                </h2>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem', color: '#1A1A1A', lineHeight: 1.75 }}>
                  {result.overallImpression}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid #E8E0D5', padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '1.25rem' }}>
                  Scorecard
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {Object.entries(result.scores).map(([key, value]) => (
                    <div key={key} style={{ padding: '1rem', backgroundColor: '#FAF7F2', border: '0.5px solid #E8E0D5' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.4rem' }}>
                        <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.6rem', fontWeight: 700, color: accent }}>{value}</span>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A' }}>/10</span>
                      </div>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#1A1A1A' }}>{SCORE_LABELS[key] || key}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid #E8E0D5', padding: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#2D6A4F', marginBottom: '1rem' }}>
                    What's Working
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
                    {result.strengths.map((s, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#1A1A1A', lineHeight: 1.5 }}>
                        <CheckCircle2 size={14} style={{ color: '#2D6A4F', flexShrink: 0, marginTop: '2px' }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid #E8E0D5', padding: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#B5451B', marginBottom: '1rem' }}>
                    Where to Improve
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
                    {result.weaknesses.map((w, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#1A1A1A', lineHeight: 1.5 }}>
                        <AlertCircle size={14} style={{ color: '#B5451B', flexShrink: 0, marginTop: '2px' }} />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.rewrites && result.rewrites.length > 0 && (
                <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid #E8E0D5', padding: '2rem', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '1.5rem' }}>
                    Suggested Rewrites
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' }}>
                    {result.rewrites.map((r, i) => (
                      <div key={i} style={{ borderLeft: '3px solid ' + accent, paddingLeft: '1.25rem' }}>
                        <div style={{ marginBottom: '0.6rem' }}>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#B5451B', marginBottom: '0.3rem' }}>Before</p>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#4A4A4A', lineHeight: 1.6, fontStyle: 'italic' }}>{r.original}</p>
                        </div>
                        <div style={{ marginBottom: '0.6rem' }}>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#2D6A4F', marginBottom: '0.3rem' }}>After</p>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#1A1A1A', lineHeight: 1.6, fontWeight: 500 }}>{r.improved}</p>
                        </div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A', lineHeight: 1.5 }}>{r.why}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ backgroundColor: '#F0EBE3', border: '0.5px solid #E8E0D5', padding: '1.75rem', marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#1A1A1A', lineHeight: 1.75, fontStyle: 'italic' }}>
                  {result.closingNote}
                </p>
              </div>

              <button
                onClick={handleReset}
                style={{
                  width: '100%', padding: '0.85rem', textAlign: 'center' as const,
                  backgroundColor: 'transparent', color: '#1A1A1A',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  border: '0.5px solid #E8E0D5', borderRadius: '2px', cursor: 'pointer',
                }}
              >
                Review Another CV
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}
