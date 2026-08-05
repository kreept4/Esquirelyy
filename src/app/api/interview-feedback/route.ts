import { NextRequest, NextResponse } from 'next/server'
import { askClaude, parseJSON, friendlyError } from '@/lib/ai'

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
  try {
    const body = await req.json()
    const { question, answer, targetRole, employer } = body

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required.' }, { status: 400 })
    }

    const persona = getPersona(targetRole)

    const systemPrompt = 'You are ' + persona + ' giving direct, honest feedback to a candidate practicing for a real interview. You are constructive but not soft, the way a respected senior figure in this field would actually critique someone they want to see succeed. You never use em dashes. Return ONLY valid JSON with this exact shape, no markdown, no code fences: { "score": number, "whatWorked": [string], "whatToImprove": [string], "strongerAnswer": string }. Score is 1 to 10. whatWorked has one or two short points. whatToImprove has one or two specific, actionable points, not generic advice. strongerAnswer is a brief example of how to sharpen the actual answer given, not a generic template, written in first person as if the candidate said it.'

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
