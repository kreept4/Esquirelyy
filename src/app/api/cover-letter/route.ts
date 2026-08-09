import { NextRequest, NextResponse } from 'next/server'
import { askClaude, parseJSON, friendlyError } from '@/lib/ai'
import { HOUSE_STYLE } from '@/lib/house-style'
import { readUpload } from '@/lib/cv/extract'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let firstName = ''
    let targetRole = ''
    let employer = ''
    let careerStage = ''
    let tone = ''
    let cvSummary = ''
    let highlights = ''
    let cvText = ''

    /* CV upload is an alternative to the manual background fields, not an
       addition to them: someone who has already uploaded a CV should not
       also be asked to summarise it by hand. The two paths share every other
       field, so only the source of "background" branches. */
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('cv') as File | null
      firstName = (formData.get('firstName') as string) || ''
      targetRole = (formData.get('targetRole') as string) || ''
      employer = (formData.get('employer') as string) || ''
      careerStage = (formData.get('careerStage') as string) || ''
      tone = (formData.get('tone') as string) || ''
      highlights = (formData.get('highlights') as string) || ''

      const upload = await readUpload(file)
      if ('error' in upload) {
        return NextResponse.json({ error: upload.error }, { status: upload.status })
      }
      cvText = upload.text
    } else {
      const body = await req.json()
      firstName = body.firstName || ''
      targetRole = body.targetRole || ''
      employer = body.employer || ''
      careerStage = body.careerStage || ''
      tone = body.tone || ''
      cvSummary = body.cvSummary || ''
      highlights = body.highlights || ''
    }

    if (!targetRole || !employer) {
      return NextResponse.json({ error: 'Target role and employer are required.' }, { status: 400 })
    }

    const systemPrompt = 'You write cover letters for a Nigerian legal careers platform called Esquirely. The letters go to law firms, banks, fintechs, energy companies, and regulators in Nigeria, written on behalf of law students and lawyers. Before drafting, work out silently: what is this employer actually seeking, which of the candidate\'s supplied experiences map directly to that, what differentiates this candidate, and what would a recruiter find generic or unconvincing. The letter should not repeat the CV, it should explain why the experience on it matters for this specific role. Background may arrive as a full uploaded CV rather than a short typed summary; treat it the same way either way, selecting only the two or three points that actually serve this application rather than working through it in order. Prefer evidence over adjectives: describe the actual work, responsibility, or result rather than asserting the candidate is motivated, dedicated, or hardworking. Only mention the employer with a substantive, specific reason drawn from what was supplied, never generic praise like "your prestigious organization". Never invent achievements, clients, matters, employer facts, or enthusiasm the candidate did not give you. If the candidate is changing practice area, industry, or career path, do not hide it, frame it around genuine transferable capability and credible motivation. If experience is limited, draw on internships, coursework, moot court, or academic work rather than padding with adjectives. Write the way a sharp Nigerian lawyer would actually write, not the way an AI assistant writes. Avoid every one of these: "I am writing to express my interest", "I am a highly motivated individual", "passionate about", "dynamic", "fast-paced environment", "proven track record", "I am confident that", "thrilled", "perfect fit", "unique opportunity", "make a meaningful impact", rhetorical questions, triple-adjective lists, and any sentence built only to sound impressive. Do not invent a dramatic hook. Open with one plain sentence stating the role applied for and how the candidate learned of it or why this employer specifically. Keep paragraphs short and the whole letter to three or four paragraphs, roughly 300 to 500 words total, shorter rather than longer if there is little genuine ground to cover. Use plain, declarative sentences. Vary sentence length and structure the way a real person typing quickly would, not in a balanced rhythm, and do not reuse the same paragraph shape or opening move for every candidate. When referencing legal qualification, anchor on call to the Nigerian Bar and completion of the Nigerian Law School, not university graduation alone. Use correct Nigerian legal career terms where relevant: LL.B, B.L, NYSC, call to bar, chambers and pupillage. Match tone to career stage, a final-year student does not sound like a five-year associate. Return ONLY valid JSON, no markdown, no code fences, no commentary: { "coverLetter": string, "subjectLine": string, "tipsForSending": [string] }. coverLetter is complete and ready to send, addressed Dear Hiring Manager unless a specific contact name was given. subjectLine is short and specific to the role. tipsForSending has two or three practical tips specific to applying at this kind of employer in Nigeria.' + '\n\n' + HOUSE_STYLE

    let userPrompt = 'Write a cover letter for ' + (firstName || 'this candidate') + ' applying for the role of ' + targetRole + ' at ' + employer + '.'
    if (careerStage) userPrompt += ' Career stage: ' + careerStage + '.'
    if (tone) userPrompt += ' Tone: ' + tone + '.'
    if (cvText) {
      // Select from the whole CV rather than everything on it, same instruction
      // the system prompt already gives for a typed summary.
      userPrompt += '\n\nCV TEXT:\n' + cvText
    } else if (cvSummary) {
      userPrompt += ' Brief background: ' + cvSummary
    }
    if (highlights) userPrompt += ' Key highlights to emphasise: ' + highlights

    const responseText = await askClaude({
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 2048,
    })

    return NextResponse.json(parseJSON(responseText))
  } catch (err: any) {
    const { error, status } = friendlyError(err, 'letter')
    return NextResponse.json({ error }, { status })
  }
}
