'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, AlertCircle } from 'lucide-react'
import BrandLoader from '@/components/ui/BrandLoader'

/**
 * A practice interview, one question at a time.
 *
 * Built to cost two AI calls a sitting, not one per answer. The questions and
 * two follow-ups for each ("probes") come from the call that generated the
 * session; this screen picks when to use a probe by rule, with no model in the
 * loop; and one call at the end reviews the whole transcript.
 *
 * When to follow up: after a short answer (under SHORT_ANSWER words) the first
 * probe, which asks for an example; otherwise the second probe, which tests
 * judgement, on every other question. Never more than MAX_FOLLOW_UPS in a
 * sitting, because a real interviewer moves on.
 */

export type MockQuestion = { id: string; question: string; category: string; probes?: string[] }
type Turn = { question: string; answer: string; followUp?: string; followUpAnswer?: string }
type Debrief = {
  score: number
  summary: string
  strengths: string[]
  priorities: string[]
  answers: { verdict: string; improve: string; strongerAnswer: string }[]
}
type Line = { who: 'them' | 'you'; text: string }

const SHORT_ANSWER = 45
const MAX_FOLLOW_UPS = 3
const ACKS = ['Thank you.', 'Okay, that is helpful.', 'Right.', 'I see.', 'Understood, thank you.', 'Okay.']
const PROBE_LEADS = ['Can I push on that a little?', 'Let me follow up on that.', 'Just to press on that,']

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

export default function MockInterview({
  questions, interviewer, persona, targetRole, employer, onExit,
}: {
  questions: MockQuestion[]
  interviewer: string
  persona: string
  targetRole: string
  employer?: string
  onExit: () => void
}) {
  const [lines, setLines] = useState<Line[]>([
    { who: 'them', text: 'Thank you for coming in. I have a few questions for you, so take your time with each one.' },
    { who: 'them', text: questions[0]?.question || '' },
  ])
  const [turns, setTurns] = useState<Turn[]>([])
  const [qi, setQi] = useState(0)
  const [inFollowUp, setInFollowUp] = useState(false)
  const [followUps, setFollowUps] = useState(0)
  const [draft, setDraft] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debrief, setDebrief] = useState<Debrief | null>(null)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [lines, done, debrief])

  function say(...add: Line[]) { setLines(l => [...l, ...add]) }

  function nextQuestion(nextTurns: Turn[]) {
    const n = qi + 1
    if (n >= questions.length) {
      say({ who: 'them', text: 'That is everything from me. Thank you for your time.' })
      setDone(true)
      return
    }
    setQi(n)
    setInFollowUp(false)
    say({ who: 'them', text: `${ACKS[n % ACKS.length]} ${questions[n].question}` })
    void nextTurns
  }

  function submit() {
    const answer = draft.trim()
    if (!answer) return
    setDraft('')
    say({ who: 'you', text: answer })
    const q = questions[qi]

    if (inFollowUp) {
      const updated = turns.map((t, i) => (i === turns.length - 1 ? { ...t, followUpAnswer: answer } : t))
      setTurns(updated)
      nextQuestion(updated)
      return
    }

    const updated = [...turns, { question: q.question, answer }]
    setTurns(updated)
    const probes = (q.probes || []).filter(Boolean)
    const wantProbe = followUps < MAX_FOLLOW_UPS && probes.length > 0 && (words(answer) < SHORT_ANSWER || qi % 2 === 1)
    if (wantProbe) {
      const probe = words(answer) < SHORT_ANSWER ? probes[0] : probes[1] || probes[0]
      updated[updated.length - 1].followUp = probe
      setTurns([...updated])
      setFollowUps(f => f + 1)
      setInFollowUp(true)
      say({ who: 'them', text: `${PROBE_LEADS[followUps % PROBE_LEADS.length]} ${probe}` })
      return
    }
    nextQuestion(updated)
  }

  async function getDebrief() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/interview-debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, targetRole, employer, turns }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'The review did not come back. Try again in a moment.')
      setDebrief(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mock">
      <ol className="mock-lines">
        {lines.map((l, i) => (
          <li key={i} className={`grotesk-regular mock-line mock-line-${l.who}`}>
            <span className="grotesk-bold mock-who">{l.who === 'them' ? interviewer : 'You'}</span>
            {l.text}
          </li>
        ))}
      </ol>

      {!done && (
        <div className="mock-answer">
          <textarea
            className="tool-textarea mock-input"
            rows={4}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
            placeholder="Answer as you would in the room."
          />
          <div className="mock-actions">
            <button type="button" className="tool-submit" onClick={submit} disabled={!draft.trim()}>
              Answer <ArrowRight size={15} aria-hidden />
            </button>
            {turns.length > 0 && (
              <button type="button" className="grotesk-regular tool-restart" onClick={() => { setDone(true); say({ who: 'them', text: 'Let us stop there. Thank you.' }) }}>
                End the interview here
              </button>
            )}
          </div>
          <p className="grotesk-regular tool-note">
            Question {Math.min(qi + 1, questions.length)} of {questions.length}. Nothing is reviewed until the end, so answer the way you would on the day.
          </p>
        </div>
      )}

      {done && !debrief && (
        <div className="mock-answer">
          {loading ? (
            <BrandLoader label="Reviewing your interview" note="One review of every answer together." />
          ) : (
            <>
              {error && (
                <div className="grotesk-regular tool-error" role="alert">
                  <AlertCircle size={15} aria-hidden />
                  <p>{error}</p>
                </div>
              )}
              <button type="button" className="tool-submit" onClick={getDebrief}>
                Get my feedback <ArrowRight size={15} aria-hidden />
              </button>
            </>
          )}
        </div>
      )}

      {debrief && (
        <div className="mock-debrief tool-card">
          <p className="display-black mock-score">{debrief.score}<span>/10</span></p>
          <p className="grotesk-regular mock-summary">{debrief.summary}</p>
          {debrief.strengths?.length > 0 && (
            <>
              <p className="grotesk-bold mock-h">What worked</p>
              <ul className="grotesk-regular mock-list">{debrief.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </>
          )}
          {debrief.priorities?.length > 0 && (
            <>
              <p className="grotesk-bold mock-h">Work on before the real one</p>
              <ul className="grotesk-regular mock-list">{debrief.priorities.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </>
          )}
          <p className="grotesk-bold mock-h">Answer by answer</p>
          <ol className="mock-answers">
            {turns.map((t, i) => {
              const a = debrief.answers?.[i]
              if (!a) return null
              return (
                <li key={i} className="mock-answer-review">
                  <p className="grotesk-bold">{t.question}</p>
                  <p className="grotesk-regular">{a.verdict}</p>
                  <p className="grotesk-regular"><strong>Improve:</strong> {a.improve}</p>
                  {a.strongerAnswer && <p className="grotesk-regular mock-stronger">&ldquo;{a.strongerAnswer}&rdquo;</p>}
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <div ref={end} />
      <button type="button" onClick={onExit} className="tool-restart">
        Back to the question list <ArrowRight size={14} aria-hidden />
      </button>
    </div>
  )
}
