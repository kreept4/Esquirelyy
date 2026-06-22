import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const runtime = 'nodejs'
export const maxDuration = 60

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

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const responseText = message.content.map((b: any) => b.type === 'text' ? b.text : '').join('')
    let cleaned = responseText.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (match) {
        try { parsed = JSON.parse(match[0]) } catch {
          return NextResponse.json({ error: 'Failed to generate feedback. Please try again.' }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: 'Failed to generate feedback. Please try again.' }, { status: 500 })
      }
    }

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('Interview feedback error:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong.' }, { status: 500 })
  }
}
