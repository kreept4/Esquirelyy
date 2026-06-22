const fs = require('fs');

fs.writeFileSync('src/app/api/interview-prep/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { extractText as extractPdfText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const runtime = 'nodejs'
export const maxDuration = 60

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf')) {
    const uint8 = new Uint8Array(buffer)
    const pdf = await getDocumentProxy(uint8)
    const { text } = await extractPdfText(pdf, { mergePages: true })
    return text
  }

  if (name.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (name.endsWith('.txt')) {
    return buffer.toString('utf-8')
  }

  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.')
}

function getPersona(targetRole: string) {
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
    const contentType = req.headers.get('content-type') || ''
    let targetRole = ''
    let employer = ''
    let careerStage = ''
    let practiceArea = ''
    let cvText = ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      targetRole = (formData.get('targetRole') as string) || ''
      employer = (formData.get('employer') as string) || ''
      careerStage = (formData.get('careerStage') as string) || ''
      practiceArea = (formData.get('practiceArea') as string) || ''

      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
        }
        cvText = await extractText(file)
        if (!cvText || cvText.trim().length < 50) {
          return NextResponse.json({ error: 'Could not extract readable text from this file.' }, { status: 400 })
        }
      }
    } else {
      const body = await req.json()
      targetRole = body.targetRole || ''
      employer = body.employer || ''
      careerStage = body.careerStage || ''
      practiceArea = body.practiceArea || ''
    }

    if (!targetRole && !cvText) {
      return NextResponse.json({ error: 'Please provide a target role or upload your CV.' }, { status: 400 })
    }

    const persona = getPersona(targetRole)

    const systemPrompt = 'You are ' + persona + '. You have interviewed hundreds of candidates and you know exactly what people in this position actually ask in Nigeria, including technical or practice-area specific questions, situational and ethics questions, and standard Nigerian market context like NYSC, call to bar, or relevant certifications depending on the field. If given a CV, infer the most relevant target role, practice area, and seniority from it, and tailor questions specifically to the candidate background described, referencing specifics from their experience where relevant. You never use em dashes. Return ONLY valid JSON with this exact shape, no markdown, no code fences: { "interviewerPersona": string, "inferredRole": string, "questions": [{ "id": string, "question": string, "category": string, "whyTheyAsk": string }] }. The interviewerPersona field should be a short phrase describing who is asking, e.g. "Senior Partner, Corporate Practice" or "HR Manager, Talent Acquisition". The inferredRole field should state the role you are targeting the questions at, whether given directly or inferred from the CV. Generate exactly 6 questions. Mix categories: include at least one behavioural, one technical or role-specific, one situational or ethics-based, and one about motivation or fit. The whyTheyAsk field should be one sharp sentence explaining what the interviewer is actually evaluating.'

    let userPrompt = ''
    if (cvText) {
      userPrompt = 'Generate interview questions based on this candidate CV, tailored to the Nigerian market.'
      if (targetRole) userPrompt += ' They have indicated interest in: ' + targetRole + '.'
      if (employer) userPrompt += ' Specifically applying to: ' + employer + '.'
      if (careerStage) userPrompt += ' Career stage: ' + careerStage + '.'
      if (practiceArea) userPrompt += ' Practice area or specialisation: ' + practiceArea + '.'
      userPrompt += '\\n\\nCV TEXT:\\n' + cvText
    } else {
      userPrompt = 'Generate interview questions for a candidate applying for ' + targetRole
      if (employer) userPrompt += ' at ' + employer
      userPrompt += ' in the Nigerian market.'
      if (careerStage) userPrompt += ' Career stage: ' + careerStage + '.'
      if (practiceArea) userPrompt += ' Practice area or specialisation: ' + practiceArea + '.'
    }

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

console.log('done step 1 of 2 - API route with CV upload support written');