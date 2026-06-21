import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const runtime = 'nodejs'
export const maxDuration = 60

async function extractText(file) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf')) {
    const data = await pdfParse(buffer)
    return data.text
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

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const targetRole = formData.get('targetRole')
    const careerStage = formData.get('careerStage')

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

    const systemPrompt = 'You are a senior legal recruiter and career advisor specializing in the Nigerian legal market. You review CVs for law students, NYSC corps members, and practicing lawyers in Nigeria. Your feedback must be specific, honest, and actionable. Reference exact phrases from the CV when giving feedback. Do not give generic advice. Do not use em dashes. Write in clear, direct prose. You understand Nigerian legal career context: LL.B, B.L, NYSC, call to bar, Nigerian Law School, chambers, pupillage, vacation schemes, and the difference between Tier 1 firms, boutique firms, and in-house roles. Structure your response as JSON with this exact shape: { "overallScore": number 1-10, "summary": string, "strengths": [string], "weaknesses": [string], "sectionFeedback": [{ "section": string, "feedback": string }], "atsIssues": [string], "priorityFixes": [string] }. Return ONLY valid JSON, no markdown formatting, no code fences, no preamble.'

    let userPrompt = 'Review this CV.'
    if (targetRole) userPrompt += ' The candidate is targeting: ' + targetRole + '.'
    if (careerStage) userPrompt += ' Career stage: ' + careerStage + '.'
    userPrompt += '\n\nCV TEXT:\n' + cvText

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const responseText = message.content.map(function(block) { return block.type === 'text' ? block.text : '' }).join('')

    let parsed
    try {
      const cleaned = responseText.replace(/```json\s*|\s*```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse review. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('CV review error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong processing your CV.' },
      { status: 500 }
    )
  }
}