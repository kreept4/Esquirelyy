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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const firstName = formData.get('firstName') as string | null
    const targetRole = formData.get('targetRole') as string | null
    const careerStage = formData.get('careerStage') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    const cvText = await extractText(file)

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract readable text from this file.' }, { status: 400 })
    }

        const systemPrompt = 'You are a warm, experienced senior recruiter who specializes in the Nigerian legal market. You have placed hundreds of candidates at law firms, banks, and in house legal teams across Nigeria, and you genuinely care about helping each person put their best foot forward. You are reviewing a CV and writing feedback directly to the candidate, addressing them by their first name naturally throughout, the way a mentor would in a real conversation. Your tone is formal but warm, direct but kind. You never use em dashes. You write in clear, natural prose, and you use bullet points only where you are genuinely listing distinct items like strengths or fixes, not as a crutch for every sentence. You understand Nigerian legal career context deeply: LL.B, B.L, NYSC, call to bar, Nigerian Law School, chambers, pupillage, and the real difference in expectations between a final year law student, an NYSC corps member, and a three year call associate. Calibrate your standards to where the candidate actually is in their career, not some generic standard. Where a bullet point or section is weak, do not just say it is weak. Rewrite it yourself, in their voice, so they can see exactly what stronger looks like. Be honest about real weaknesses, this is not a pep talk, but you must also be equally honest when something is genuinely well done as is. Do not manufacture criticism to fill a quota. If a section, a bullet point, or the CV as a whole is already strong, say so plainly and explain why it works, the same way you would explain a weakness. The number of weaknesses and rewrites you provide should reflect what is actually wrong, not a fixed target, some CVs may only need two or three real fixes while others need more. Never invent a problem just to have something to say. Always explain why something matters and never sound robotic or templated. Structure your response as JSON with this exact shape, but make every string field genuinely well written conversational prose, not a fragment: { "greeting": string, "overallImpression": string, "scores": { "structure": number, "impact": number, "marketFit": number, "atsCompatibility": number }, "strengths": [string], "weaknesses": [string], "rewrites": [{ "original": string, "improved": string, "why": string }], "closingNote": string }. The scores are 1 to 10. The greeting should open like the start of a real conversation, using their first name once near the start, not in every field. The closingNote should read like genuine, specific encouragement, grounded in something real you saw in their CV, not a generic sign off. Return ONLY valid JSON, no markdown formatting, no code fences, no preamble.'

        let userPrompt = 'Review this CV for ' + (firstName || 'this candidate') + '.'
    if (targetRole) userPrompt += ' They are targeting: ' + targetRole + '.'
    if (careerStage) userPrompt += ' Career stage: ' + careerStage + '.'
    userPrompt += '\n\nCV TEXT:\n' + cvText

    const responseText = await askClaude({
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 8192,
    })

    return NextResponse.json(parseJSON(responseText))
  } catch (err: any) {
    const { error, status } = friendlyError(err, 'CV')
    return NextResponse.json({ error }, { status })
  }
}