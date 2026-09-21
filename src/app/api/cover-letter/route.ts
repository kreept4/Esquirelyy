import { requireUserWithQuota } from '@/lib/ai-quota'
import { NextRequest, NextResponse } from 'next/server'
import { askClaude, parseJSON, friendlyError } from '@/lib/ai'
import {
  buildSystemPrompt,
  buildUserPrompt,
  buildTrimPrompt,
  buildTrimSystemPrompt,
} from '@/lib/cover-letter/prompt'
import { countBodyWords, WORD_CEILING } from '@/lib/cover-letter/word-count'
import { buildFirmFacts } from '@/lib/cover-letter/firm-facts'
import { readUpload } from '@/lib/cv/extract'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * How far over the ceiling a draft has to be before the trim pass is worth a
 * second request.
 *
 * ⚠ NOT ZERO, DELIBERATELY. countBodyWords matches the salutation and sign off
 * by shape and fails safe by overcounting when it misses either, so a draft
 * measured at 203 may genuinely be 197. Trimming that one costs a few seconds
 * and a request to remove a sentence the letter needed. Anything past this is
 * over by more than the measurement can explain.
 */
const TRIM_THRESHOLD = WORD_CEILING + 10

/**
 * Length caps on everything that reaches the model.
 *
 * ⚠ EVERY FREE TEXT FIELD IS CAPPED, NOT JUST THE PASTED ONE. Found in review:
 * the advert had a limit and the other six did not, which put the ceiling in
 * the wrong place entirely. A JSON POST carrying a five megabyte
 * employerKnowledge is not blocked by a cap on a different field; it is billed
 * as input tokens, or it overflows the model's context and is billed anyway
 * before it fails. One quota unit, an unbounded bill.
 *
 * The caps are generous against real use and tiny against abuse. Truncating
 * rather than rejecting is deliberate for the long fields: a candidate who
 * pasted a whole careers page still gets a letter, and nobody is asked to edit
 * text they did not write down to a character count. The short fields are cut
 * hard because anything past them is not a job title.
 *
 * ⚠ THE CV IS NOT HERE BECAUSE IT IS ALREADY BOUNDED. readUpload enforces
 * MAX_UPLOAD_BYTES at 5MB on the file itself before any text is extracted.
 */
const LIMITS = {
  firstName: 100,
  targetRole: 200,
  employer: 200,
  division: 200,
  careerStage: 100,
  tone: 100,
  highlights: 2000,
  employerKnowledge: 2000,
  cvSummary: 5000,
  advert: 8000,
} as const

/** Trim and cap one field. Applied to every value on both request paths, so a
 *  field added later without a cap is the exception rather than the rule. */
const cap = (value: string, limit: number) => value.trim().slice(0, limit)

export async function POST(req: NextRequest) {
  const { error: unauthorized } = await requireUserWithQuota('cover-letter')
  if (unauthorized) return unauthorized

  try {
    const contentType = req.headers.get('content-type') || ''
    let firstName = ''
    let targetRole = ''
    let employer = ''
    let division = ''
    let careerStage = ''
    let tone = ''
    let cvSummary = ''
    let highlights = ''
    let advert = ''
    let employerKnowledge = ''
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
      division = (formData.get('division') as string) || ''
      careerStage = (formData.get('careerStage') as string) || ''
      tone = (formData.get('tone') as string) || ''
      highlights = (formData.get('highlights') as string) || ''
      advert = (formData.get('advert') as string) || ''
      employerKnowledge = (formData.get('employerKnowledge') as string) || ''

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
      division = body.division || ''
      careerStage = body.careerStage || ''
      tone = body.tone || ''
      cvSummary = body.cvSummary || ''
      highlights = body.highlights || ''
      advert = body.advert || ''
      employerKnowledge = body.employerKnowledge || ''
    }

    /* ⚠ CAPPED HERE, AFTER THE BRANCH, SO BOTH PATHS GET IT. The multipart and
       JSON readers above populate the same variables, and capping inside either
       one would leave the other unbounded, which is the shape of half the bugs
       this file has ever had. */
    firstName = cap(firstName, LIMITS.firstName)
    targetRole = cap(targetRole, LIMITS.targetRole)
    employer = cap(employer, LIMITS.employer)
    division = cap(division, LIMITS.division)
    careerStage = cap(careerStage, LIMITS.careerStage)
    tone = cap(tone, LIMITS.tone)
    highlights = cap(highlights, LIMITS.highlights)
    employerKnowledge = cap(employerKnowledge, LIMITS.employerKnowledge)
    cvSummary = cap(cvSummary, LIMITS.cvSummary)
    advert = cap(advert, LIMITS.advert)

    if (!targetRole || !employer) {
      return NextResponse.json({ error: 'Target role and employer are required.' }, { status: 400 })
    }

    /* What we already know about this employer, from our own researched
       directory, narrowed to the division being applied to. Null for the
       employers we have no record of, which is the normal case for banks,
       fintechs and regulators, and the prompt handles that by writing a shorter
       letter rather than a vaguer one. */
    const firmFacts = buildFirmFacts(employer, division)

    const responseText = await askClaude({
      system: buildSystemPrompt(),
      prompt: buildUserPrompt({
        firstName,
        targetRole,
        employer,
        division,
        careerStage,
        tone,
        firmFacts,
        advert,
        employerKnowledge,
        cvSummary,
        cvText,
        highlights,
      }),
      maxTokens: 2048,
    })

    const result = parseJSON(responseText) as {
      coverLetter?: string
      subjectLine?: string
      tipsForSending?: string[]
    }

    /**
     * Enforce the ceiling here rather than trusting the prompt.
     *
     * ⚠ A WORD LIMIT GIVEN TO A MODEL IS A SUGGESTION. It is stated four times
     * in the system prompt, including as a numbered step in the revision pass,
     * and drafts still come back at 220 to 240, because a model has no reliable
     * way to count its own output. The instruction stays because it lowers how
     * often this fires; this is what makes the number true.
     *
     * ⚠ A FAILED TRIM RETURNS THE ORIGINAL, NEVER AN ERROR. The candidate has a
     * complete, usable letter at this point. Losing it to a failure on a
     * tidying step would be the worst outcome available, and 230 words is a
     * letter they can cut themselves in a minute. The editor shows the count.
     */
    const letter = result.coverLetter || ''
    const words = countBodyWords(letter)

    if (letter && words > TRIM_THRESHOLD) {
      try {
        const trimmed = await askClaude({
          /* ⚠ NOT buildSystemPrompt(). The full letter-writing prompt is 29,000
             characters and this call deletes sentences; sending it was about
             7,300 input tokens of instruction the trimmer cannot use, on a
             second call the quota ledger does not charge for. See the note on
             buildTrimSystemPrompt. */
          system: buildTrimSystemPrompt(),
          prompt: buildTrimPrompt(letter, words),
          maxTokens: 1024,
        })

        /* Only accept the trim if it is both shorter and still a letter. A
           second call can come back with commentary wrapped around the draft,
           or with the salutation dropped, and either is worse than the honest
           overlong version it would replace. */
        const clean = trimmed.trim()
        if (clean && /^\s*dear\b/i.test(clean) && countBodyWords(clean) < words) {
          result.coverLetter = clean
        }
      } catch {
        /* Swallowed on purpose. See the note above: the letter we already have
           is the fallback, and it is a good one. */
      }
    }

    return NextResponse.json(result)
  } catch (err: any) {
    const { error, status } = friendlyError(err, 'letter')
    return NextResponse.json({ error }, { status })
  }
}
