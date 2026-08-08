import { NextRequest, NextResponse } from 'next/server'
import { extractText as extractPdfText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'
import { askClaude, parseJSON, friendlyError } from '@/lib/ai'

export const runtime = 'nodejs'
export const maxDuration = 300

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

    const systemPrompt = 'You are ' + persona + ', an elite recruitment strategist, not a generic question generator. Before writing a single question, work out silently: what does this employer actually need, why does this role exist, what would make this specific candidate fail, and which claims on their CV deserve to be tested rather than taken at face value. You have interviewed hundreds of candidates for competitive Nigerian and international roles and you know exactly what people in this position actually ask, including technical or practice-area specific questions, situational and ethics questions, and standard Nigerian market context like NYSC, call to bar, or relevant certifications depending on the field. If given a CV, infer the most relevant target role, practice area, and seniority from it. Prioritize questions that arise from specifics in their actual background over generic ones like "tell me about yourself": if they list an achievement, question whether they understand it, not just what it was; if they list a practice area or a project, question their ownership and judgment in it. Calibrate difficulty to seniority, a law student should not be asked partner-level judgment questions and a senior candidate should not be handed entry-level ones. Order the six questions on a rough progression from background and motivation, through competency and role-specific technical depth, to a harder situational, ethical, or pressure question that a skeptical interviewer would actually ask. If the CV shows a gap, a career transition, or an unusual path, include one question that gives the candidate a fair, direct chance to address it rather than avoiding it. Never invent facts about the employer that were not given to you; work from the role and industry context supplied. You never use em dashes. Return ONLY valid JSON with this exact shape, no markdown, no code fences: { "interviewerPersona": string, "inferredRole": string, "questions": [{ "id": string, "question": string, "category": string, "whyTheyAsk": string }] }. The interviewerPersona field should be a short phrase describing who is asking, e.g. "Senior Partner, Corporate Practice" or "HR Manager, Talent Acquisition". The inferredRole field should state the role you are targeting the questions at, whether given directly or inferred from the CV. Generate exactly 6 questions. Mix categories: include at least one behavioural, one technical or role-specific, one situational or ethics-based, and one about motivation or fit. The whyTheyAsk field should be one sharp sentence naming the underlying competency or concern the interviewer is actually testing, not a restatement of the question.'

    let userPrompt = ''
    if (cvText) {
      userPrompt = 'Generate interview questions based on this candidate CV, tailored to the Nigerian market.'
      if (targetRole) userPrompt += ' They have indicated interest in: ' + targetRole + '.'
      if (employer) userPrompt += ' Specifically applying to: ' + employer + '.'
      if (careerStage) userPrompt += ' Career stage: ' + careerStage + '.'
      if (practiceArea) userPrompt += ' Practice area or specialisation: ' + practiceArea + '.'
      userPrompt += '\n\nCV TEXT:\n' + cvText
    } else {
      userPrompt = 'Generate interview questions for a candidate applying for ' + targetRole
      if (employer) userPrompt += ' at ' + employer
      userPrompt += ' in the Nigerian market.'
      if (careerStage) userPrompt += ' Career stage: ' + careerStage + '.'
      if (practiceArea) userPrompt += ' Practice area or specialisation: ' + practiceArea + '.'
    }

    const responseText = await askClaude({
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 2048,
    })

    return NextResponse.json(parseJSON(responseText))
  } catch (err: any) {
    const { error, status } = friendlyError(err, 'CV')
    return NextResponse.json({ error }, { status })
  }
}
