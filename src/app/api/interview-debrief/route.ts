import { requireUserWithQuota, quotaRemaining, refundLastUse } from '@/lib/ai-quota'
import { requireUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { askClaude, parseJSON, friendlyError } from '@/lib/ai'
import { HOUSE_STYLE } from '@/lib/house-style'
import { INTERVIEWERS } from '@/lib/interviewers'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * The debrief at the end of a mock interview: one call for the whole
 * transcript.
 *
 * The interview makes no calls of its own. Its follow-up questions were
 * written by /api/interview-prep when the session's questions were, so a full
 * sitting costs two calls, where reviewing each answer as it came would cost
 * one per answer.
 */
type Turn = { question: string; answer: string; followUp?: string; followUpAnswer?: string }

const MAX_TURNS = 10
const MAX_CHARS = 2500

/** Whether this member has today's mock interview left. Spends nothing. */
export async function GET() {
  const auth = await requireUser()
  if (auth.error) return auth.error
  const remaining = await quotaRemaining(auth.user, 'interview-debrief')
  return NextResponse.json({ remaining: Number.isFinite(remaining) ? remaining : 99 })
}

export async function POST(req: NextRequest) {
  const { user, error: unauthorized } = await requireUserWithQuota('interview-debrief')
  if (unauthorized) return unauthorized

  try {
    const body = await req.json()
    const turns: Turn[] = Array.isArray(body.turns) ? body.turns.slice(0, MAX_TURNS) : []
    const answered = turns.filter(t => t && typeof t.question === 'string' && typeof t.answer === 'string' && t.answer.trim())
    if (!answered.length) {
      await refundLastUse(user.id, 'interview-debrief').catch(() => {})
      return NextResponse.json({ error: 'Answer at least one question first.' }, { status: 400 })
    }

    const chosen = INTERVIEWERS.find(i => i.id === body.persona)
    const who = chosen ? chosen.brief : 'an experienced interviewer at a reputable Nigerian organisation'
    const role = String(body.targetRole || '').slice(0, 200)
    const employer = String(body.employer || '').slice(0, 200)
    const cut = (s: unknown) => String(s || '').slice(0, MAX_CHARS)

    const system =
      'You are ' + who + '. You have just finished a practice interview with a candidate and are giving them an honest debrief, the way a respected senior figure would for someone they want to see succeed: constructive, specific and not soft. Judge substance, not confidence. Credit real evidence; name assertions and generic claims as such. If an answer did not address the question, say so plainly. Never invent facts the candidate did not state. The interview opens with "tell me about yourself", judged as a two-minute pitch, and closes with "do you have any questions for us?", where a question that shows the candidate researched the employer is a strong close and having none is a weak one. ' +
      'Return ONLY valid JSON, no markdown, no code fences, in this exact shape: { "score": number, "summary": string, "strengths": [string], "priorities": [string], "answers": [{ "verdict": string, "improve": string, "strongerAnswer": string }] }. ' +
      'score is 1 to 10 for the interview as a whole, not a courtesy score. summary is two sentences on how the interview went overall. strengths has one to three short points. priorities has one to three specific things to work on before the real interview, most important first. answers has one entry per question in the order given: verdict is one sentence on how that answer (and its follow-up, if there was one) landed; improve is one specific, actionable sentence; strongerAnswer is a short first-person example of a better answer using only details the candidate gave, or an empty string if the answer was already strong.\n\n' +
      HOUSE_STYLE

    let prompt = 'Practice interview' + (role ? ' for ' + role : '') + (employer ? ' at ' + employer : '') + '.\n\n'
    answered.forEach((t, i) => {
      prompt += 'Question ' + (i + 1) + ': ' + cut(t.question) + '\nAnswer: ' + cut(t.answer) + '\n'
      if (t.followUp && t.followUpAnswer) prompt += 'Follow-up: ' + cut(t.followUp) + '\nAnswer: ' + cut(t.followUpAnswer) + '\n'
      prompt += '\n'
    })
    prompt += 'Give the debrief.'

    const text = await askClaude({ system, prompt, maxTokens: 2600 })
    return NextResponse.json(parseJSON(text))
  } catch (err: any) {
    /* Our failure, not the member's: hand the day's interview back. */
    await refundLastUse(user.id, 'interview-debrief').catch(() => {})
    const { error, status } = friendlyError(err, 'interview')
    return NextResponse.json({ error }, { status })
  }
}
