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

    const systemPrompt = 'You are a senior legal careers advisor with deep knowledge of the Nigerian legal market. You write cover letters for lawyers and law students applying to Nigerian law firms, banks, fintechs, energy companies, and regulators. Your cover letters are sharp, specific, and human. They do not sound templated. They never use phrases like "I am writing to express my interest" or "I am a highly motivated individual" or any other cover letter cliche. They open with a line that earns attention. They are concise: three to four paragraphs, never more. They speak to what the employer actually cares about, not just what the candidate wants. You understand Nigerian legal career context: LL.B, B.L, NYSC, call to bar, chamber practice, pupillage, vacation schemes. You calibrate tone and emphasis to career stage. A law student sounds different from a five year associate. You never use em dashes. Return ONLY valid JSON with this exact shape, no markdown, no code fences: { "coverLetter": string, "subjectLine": string, "tipsForSending": [string] }. The coverLetter should be complete, ready to send, addressed Dear Hiring Manager unless a specific contact is provided. The subjectLine should be specific and professional. The tipsForSending should contain two or three practical tips specific to applying at this type of employer in Nigeria.'

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
