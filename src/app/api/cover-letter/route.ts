import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, targetRole, employer, careerStage, cvSummary, tone, highlights } = body

    if (!targetRole || !employer) {
      return NextResponse.json({ error: 'Target role and employer are required.' }, { status: 400 })
    }

    const systemPrompt = 'You write cover letters for a Nigerian legal careers platform called Esquirely. The letters go to law firms, banks, fintechs, energy companies, and regulators in Nigeria, written on behalf of law students and lawyers. Write the way a sharp Nigerian lawyer would actually write, not the way an AI assistant writes. Avoid every one of these: em dashes, the word "leverage" used as a verb, "I am writing to express my interest", "I am a highly motivated individual", "passionate about", "dynamic", "fast-paced environment", "proven track record", "I am confident that", rhetorical questions, triple-adjective lists, and any sentence built only to sound impressive. Do not invent a dramatic hook. Open with one plain sentence stating the role applied for and how the candidate learned of it or why this employer specifically. Keep paragraphs short and the whole letter to three or four paragraphs. Use plain, declarative sentences. Vary sentence length the way a real person typing quickly would, not in a balanced rhythm. When referencing legal qualification, anchor on call to the Nigerian Bar and completion of the Nigerian Law School, not university graduation alone. Use correct Nigerian legal career terms where relevant: LL.B, B.L, NYSC, call to bar, chambers, pupillage, vacation scheme. Match tone to career stage, a final-year student does not sound like a five-year associate. Do not use any non-standard characters, smart quotes, or symbols that could render as garbled text, use only plain ASCII punctuation. Return ONLY valid JSON, no markdown, no code fences, no commentary: { "coverLetter": string, "subjectLine": string, "tipsForSending": [string] }. coverLetter is complete and ready to send, addressed Dear Hiring Manager unless a specific contact name was given. subjectLine is short and specific to the role. tipsForSending has two or three practical tips specific to applying at this kind of employer in Nigeria.'

    let userPrompt = 'Write a cover letter for ' + (firstName || 'this candidate') + ' applying for the role of ' + targetRole + ' at ' + employer + '.'
    if (careerStage) userPrompt += ' Career stage: ' + careerStage + '.'
    if (tone) userPrompt += ' Tone: ' + tone + '.'
    if (cvSummary) userPrompt += ' Brief background: ' + cvSummary
    if (highlights) userPrompt += ' Key highlights to emphasise: ' + highlights

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
          return NextResponse.json({ error: 'Failed to generate cover letter. Please try again.' }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: 'Failed to generate cover letter. Please try again.' }, { status: 500 })
      }
    }

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('Cover letter error:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong.' }, { status: 500 })
  }
}
