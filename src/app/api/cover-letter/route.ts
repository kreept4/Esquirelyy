import { requireUserWithQuota } from '@/lib/ai-quota'
import { NextRequest, NextResponse } from 'next/server'
import { askClaude, parseJSON, friendlyError } from '@/lib/ai'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/cover-letter/prompt'
import { readUpload } from '@/lib/cv/extract'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { error: unauthorized } = await requireUserWithQuota('cover-letter')
  if (unauthorized) return unauthorized

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

    const responseText = await askClaude({
      system: buildSystemPrompt(),
      prompt: buildUserPrompt({
        firstName,
        targetRole,
        employer,
        careerStage,
        tone,
        cvSummary,
        cvText,
        highlights,
      }),
      maxTokens: 2048,
    })

    return NextResponse.json(parseJSON(responseText))
  } catch (err: any) {
    const { error, status } = friendlyError(err, 'letter')
    return NextResponse.json({ error }, { status })
  }
}
