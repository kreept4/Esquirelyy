import { requireUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { askClaude, parseJSON, friendlyError, AIFormatError } from '@/lib/ai'
import { readUpload } from '@/lib/cv/extract'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/cv/prompt'
import { isGeneratedCV, type GenerateResponse } from '@/lib/cv/types'
import { sortSections } from '@/lib/cv/template'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * Rebuild a CV.
 *
 * Separate from the review route on purpose. Reviewing and generating are two
 * things a user may want independently: they may only want the feedback, they
 * may want a rebuilt CV without reading a review first, or they may want both.
 * Folding generation into the review response would have taken that choice away
 * and made every review slower and more expensive for the people who only
 * wanted the review.
 *
 * The route takes the file again rather than a stored copy of the text. The
 * review route reads the upload and discards it, and the product tells users so
 * on the page. Keeping the extracted text server side to save one upload would
 * quietly make that untrue.
 */

/** Opus rather than the Sonnet the other tools use.
 *
 * The review is read once and acted on; a generated CV is the document someone
 * actually sends to a firm, and the difference between the two models shows up
 * exactly where it matters here, in whether a bullet reads as written by a
 * person. It is slower, which is why the tools that do not need it do not use
 * it, and why this route runs to the platform's full five minutes.
 */
const MODEL = 'claude-opus-5'

function str(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : ''
  return s.length ? s : null
}

/**
 * Make a typed LinkedIn URL into one that will actually open.
 *
 * People write this four ways — "linkedin.com/in/x", "www.linkedin.com/in/x",
 * "https://…/in/x", and just "x" — and only the third is a working href. A CV
 * whose LinkedIn line is not clickable is worse than one with no LinkedIn line,
 * because it looks like a link and fails, so the scheme is added here rather
 * than hoped for from the model.
 *
 * Deliberately conservative about what it accepts. A bare handle becomes a
 * profile URL, but anything that is not recognisably LinkedIn is returned as
 * typed rather than coerced: guessing wrong would put a confident, wrong link
 * on a real person's CV, and the prompt already refuses to invent one.
 */
function normaliseLinkedIn(raw: string | null): string | null {
  if (!raw) return null
  const value = raw.trim().replace(/^@/, '')
  if (!value) return null

  // Already absolute. Trust it, minus a trailing slash for tidiness.
  if (/^https?:\/\//i.test(value)) return value.replace(/\/+$/, '')

  // A LinkedIn host without a scheme is the common case.
  if (/^(www\.)?linkedin\.com\//i.test(value)) {
    return `https://${value.replace(/^www\./i, 'www.').replace(/\/+$/, '')}`
  }

  // A bare handle: no slashes, no spaces, no dots. "damian-obi" and nothing else.
  if (/^[A-Za-z0-9][A-Za-z0-9-]{1,98}$/.test(value)) {
    return `https://www.linkedin.com/in/${value}`
  }

  return value
}

/** The model returns nulls for absent optional fields; the renderers want them gone. */
function prune<T extends Record<string, any>>(obj: T): T {
  const out = {} as T
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue
    if (typeof v === 'string' && !v.trim()) continue
    out[k as keyof T] = v
  }
  return out
}

/**
 * Normalise what came back.
 *
 * Two things get fixed here rather than being left to the renderers. Bullets
 * arrive with a leading glyph often enough to be worth stripping, since the
 * renderer draws its own and the result is otherwise a double bullet. And em
 * dashes are banned in the prompt but still appear occasionally in date ranges,
 * where they are the natural character; they are replaced rather than
 * regenerated because a second call for one character is not worth the wait.
 */
function clean(cv: any) {
  const text = (s: unknown) =>
    typeof s === 'string' ? s.replace(/\s*[—–]\s*/g, m => (/\s/.test(m) ? ' - ' : '-')).trim() : s

  const bullet = (s: string) => text(s.replace(/^\s*[••\-\*·]\s*/, '')) as string

  return {
    name: String(cv.name || '').trim(),
    contact: (Array.isArray(cv.contact) ? cv.contact : [])
      .map((c: any) =>
        typeof c === 'string'
          ? { text: c.trim() }
          : prune({ text: String(c?.text ?? '').trim(), href: c?.href || undefined })
      )
      .filter((c: any) => c.text),
    sections: sortSections(
      (Array.isArray(cv.sections) ? cv.sections : [])
        .map((s: any) => {
          const heading = String(s?.heading || '').trim().toUpperCase()
          if (!heading) return null

          if (s.kind === 'prose') {
            const body = text(String(s.body || '')) as string
            return body ? { kind: 'prose', heading, body } : null
          }

          if (s.kind === 'grouped') {
            const groups = (Array.isArray(s.groups) ? s.groups : [])
              .map((g: any) => ({
                label: String(g?.label || '').trim(),
                items: text(String(g?.items || '')) as string,
              }))
              .filter((g: any) => g.label && g.items)
            return groups.length ? { kind: 'grouped', heading, groups } : null
          }

          const entries = (Array.isArray(s.entries) ? s.entries : [])
            .map((e: any) =>
              prune({
                title: text(String(e?.title || '')) as string,
                titleRight: text(e?.titleRight),
                subtitle: text(e?.subtitle),
                subtitleRight: text(e?.subtitleRight),
                detail: text(e?.detail),
                bullets: (Array.isArray(e?.bullets) ? e.bullets : [])
                  .map((b: any) => bullet(String(b || '')))
                  .filter(Boolean),
              })
            )
            .filter((e: any) => e.title)
          return entries.length ? { kind: 'entries', heading, entries } : null
        })
        .filter(Boolean) as any[]
    ),
  }
}

export async function POST(req: NextRequest) {
  const { error: unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  try {
    const formData = await req.formData()

    const read = await readUpload(formData.get('file') as File | null)
    if ('error' in read) {
      return NextResponse.json({ error: read.error }, { status: read.status })
    }

    // The review, if the user came here from one. Passed through from the
    // client rather than re-fetched, because the client already has it and a
    // round trip to the database would only be a chance to disagree with it.
    let review = null
    const rawReview = str(formData.get('review'))
    if (rawReview) {
      try {
        review = JSON.parse(rawReview)
      } catch {
        // A malformed review is not worth failing the whole generation over.
        // The CV still gets rebuilt, just without the reviewer's notes.
        console.warn('cv-generate: could not parse the review payload, continuing without it')
      }
    }

    const responseText = await askClaude({
      model: MODEL,
      system: buildSystemPrompt(),
      prompt: buildUserPrompt({
        cvText: read.text,
        firstName: str(formData.get('firstName')),
        targetRole: str(formData.get('targetRole')),
        careerStage: str(formData.get('careerStage')),
        linkedinUrl: normaliseLinkedIn(str(formData.get('linkedinUrl'))),
        jobDescription: str(formData.get('jobDescription')),
        review,
      }),
      // A two page CV plus the changes and gaps lists. The ceiling is high
      // because a truncated response is not valid JSON and costs a full retry.
      maxTokens: 16000,
    })

    const parsed = parseJSON<any>(responseText)
    const cv = clean(parsed?.cv ?? parsed)

    if (!isGeneratedCV(cv)) {
      throw new AIFormatError('The rebuilt CV came back incomplete.')
    }

    const payload: GenerateResponse = {
      cv,
      changes: Array.isArray(parsed?.changes) ? parsed.changes.filter(Boolean).map(String) : [],
      gaps: Array.isArray(parsed?.gaps) ? parsed.gaps.filter(Boolean).map(String) : [],
    }

    return NextResponse.json(payload)
  } catch (err: any) {
    const { error, status } = friendlyError(err, 'CV')
    return NextResponse.json({ error }, { status })
  }
}
