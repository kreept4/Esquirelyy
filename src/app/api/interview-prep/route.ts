import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const runtime = 'nodejs'
export const maxDuration = 60

function getPersona(targetRole: string, employer: string) {
  const role = (targetRole || '').toLowerCase()
  if (role.includes('partner') || role.includes('senior associate') || role.includes('counsel')) {
    return 'a senior partner at a top Nigerian law firm conducting a partnership-track or senior associate interview'
  }
  if (role.includes('compliance') || role.includes('risk') || role.includes('regulatory')) {
    return 'a Head of Compliance or Chief Risk Officer at a Nigerian financial institution'
  }
  if (role.includes('engineer') || role.includes('developer') || role.includes('technical') || role.includes('product')) {
    return 'a senior engineering director conducting a technical and behavioural interview'
  }
  if (role.includes('analyst') || role.includes('banking') || role.includes('finance')) {
    return 'a senior director in a Nigerian bank or financial institution'
  }
  return 'an experienced HR Manager or Talent Lead at a reputable Nigerian organisation'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { targetRole, employer, careerStage, practiceArea } = body

    if (!targetRole) {
      return NextResponse.json({ error: 'Target role is required.' }, { status: 400 })
    }

    const persona = getPersona(targetRole, employer)

    const systemPrompt = 'You are ' + persona + '. You have interviewed hundreds of candidates and you know exactly what people in this position actually ask in Nigeria, including technical or practice-area specific questions, situational and ethics questions, and standard Nigerian market context like NYSC, call to bar, or relevant certifications depending on the field. You never use em dashes. Return ONLY valid JSON with this exact shape, no markdown, no code fences: { "interviewerPersona": string, "questions": [{ "id": string, "question": string, "category": string, "whyTheyAsk": string }] }. The interviewerPersona field should be a short phrase describing who is asking, e.g. "Senior Partner, Corporate Practice" or "HR Manager, Talent Acquisition". Generate exactly 6 questions. Mix categories: include at least one behavioural, one technical or role-specific, one situational or ethics-based, and one about motivation or fit. The whyTheyAsk field should be one sharp sentence explaining what the interviewer is actually evaluating.'

    let userPrompt = 'Generate interview questions for a candidate applying for ' + targetRole
    if (employer) userPrompt += ' at ' + employer
    userPrompt += ' in the Nigerian market.'
    if (careerStage) userPrompt += ' Career stage: ' + careerStage + '.'
    if (practiceArea) userPrompt += ' Practice area or specialisation: ' + practiceArea + '.'

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
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
          return NextResponse.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 })
      }
    }

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('Interview prep error:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong.' }, { status: 500 })
  }
}
