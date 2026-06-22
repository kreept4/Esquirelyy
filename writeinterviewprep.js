const fs = require('fs');

fs.mkdirSync('src/app/api/interview-prep', { recursive: true });
fs.mkdirSync('src/app/api/interview-feedback', { recursive: true });
fs.mkdirSync('src/app/tools/interview-prep', { recursive: true });

// ─── API ROUTE: generate questions ────────────────────────────
fs.writeFileSync('src/app/api/interview-prep/route.ts', `import { NextRequest, NextResponse } from 'next/server'
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
    let cleaned = responseText.trim().replace(/^\`\`\`(?:json)?\\s*/i, '').replace(/\`\`\`\\s*$/, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\\{[\\s\\S]*\\}/)
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
`);

// ─── API ROUTE: feedback on an answer ─────────────────────────
fs.writeFileSync('src/app/api/interview-feedback/route.ts', `import { NextRequest, NextResponse } from 'next/server'
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

    let userPrompt = 'The interview question was: "' + question + '"\\n\\nThe candidate answered: "' + answer + '"'
    if (targetRole) userPrompt += '\\n\\nThey are interviewing for ' + targetRole + (employer ? ' at ' + employer : '') + '.'
    userPrompt += '\\n\\nGive feedback on this answer.'

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const responseText = message.content.map((b: any) => b.type === 'text' ? b.text : '').join('')
    let cleaned = responseText.trim().replace(/^\`\`\`(?:json)?\\s*/i, '').replace(/\`\`\`\\s*$/, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\\{[\\s\\S]*\\}/)
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
`);

console.log('done step 1 of 2 - API routes written, persona-aware');