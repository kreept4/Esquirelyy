import { requireUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { askClaude, parseJSON, friendlyError } from '@/lib/ai'
import { HOUSE_STYLE } from '@/lib/house-style'

export const runtime = 'nodejs'
export const maxDuration = 300

function getPersona(targetRole: string) {
  const role = (targetRole || '').toLowerCase()
  if (role.includes('partner') || role.includes('senior associate') || role.includes('counsel')) {
    return 'a senior partner at a Nigerian law firm'
  }
  if (role.includes('compliance') || role.includes('risk') || role.includes('regulatory')) {
    return 'a Head of Compliance at a Nigerian financial institution'
  }
  if (role.includes('engineer') || role.includes('developer') || role.includes('technical') || role.includes('product')) {
    return 'a senior engineering director'
  }
  if (role.includes('analyst') || role.includes('banking') || role.includes('finance')) {
    return 'a senior director at a Nigerian bank'
  }
  return 'an experienced HR Manager at a reputable Nigerian organisation'
}

export async function POST(req: NextRequest) {
  const { error: unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  try {
    const body = await req.json()
    const { question, answer, targetRole, employer } = body

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required.' }, { status: 400 })
    }

    const persona = getPersona(targetRole)

    const systemPrompt = 'You are ' + persona + ' giving direct, honest feedback to a candidate practicing for a real interview. You are constructive but not soft, the way a respected senior figure in this field would actually critique someone they want to see succeed. Judge the actual substance of what they said, not how confident it sounds: do not reward polish over content, and do not soften a weak answer just to be encouraging. Distinguish between what the question is actually testing (a competency, not just its literal topic) and whether the answer supplied real evidence for it, rather than an assertion or a generic claim. If the candidate did not answer the question, say so plainly rather than grading around it. Never invent or assume facts, employers, or outcomes the candidate did not state. Return ONLY valid JSON with this exact shape, no markdown, no code fences: { "score": number, "whatItWasTesting": string, "whatWorked": [string], "whatToImprove": [string], "strongerAnswer": string, "followUpQuestion": string }. Score is 1 to 10, reflecting the actual quality of this specific answer, not a courtesy score. whatItWasTesting is one sentence naming the underlying competency the question was probing. whatWorked has one or two short points, and can be a single honest line noting there is little to praise if that is true. whatToImprove has one or two specific, actionable points grounded in what was actually said, not generic advice. strongerAnswer is a brief example of how to sharpen the actual answer given, not a generic template, written in first person as if the candidate said it, using only details the candidate already provided. followUpQuestion is the natural next question a real interviewer would ask based on this specific answer, the way a conversation would actually continue rather than moving to an unrelated topic.\n\n' + HOUSE_STYLE

    let userPrompt = 'The interview question was: "' + question + '"\n\nThe candidate answered: "' + answer + '"'
    if (targetRole) userPrompt += '\n\nThey are interviewing for ' + targetRole + (employer ? ' at ' + employer : '') + '.'
    userPrompt += '\n\nGive feedback on this answer.'

    const responseText = await askClaude({
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 1024,
    })

    return NextResponse.json(parseJSON(responseText))
  } catch (err: any) {
    const { error, status } = friendlyError(err, 'answer')
    return NextResponse.json({ error }, { status })
  }
}
