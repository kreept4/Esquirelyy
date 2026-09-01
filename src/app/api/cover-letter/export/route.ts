/**
 * Download a cover letter as PDF or Word.
 *
 * Modelled on api/cv-export/route.ts, which does the same job for the CV
 * builder, and deliberately so: same auth, same disposition handling, same
 * shape of error. Two export endpoints that behave differently is how you end
 * up with one of them quietly broken.
 *
 * ⚠ NO AI QUOTA HERE, AND THAT IS CORRECT. requireUserWithQuota exists to meter
 * calls to Anthropic. This route calls nothing: it renders text the user already
 * paid a quota unit to generate, and charging them again for pressing Download
 * would mean a candidate who wants both formats loses a cover letter for it.
 * cv-export makes the same call. Auth is still required, because the rendered
 * letter is the user's own document.
 *
 * ⚠ THE LETTER COMES FROM THE REQUEST, NOT FROM THE DATABASE, because the tool
 * lets people edit the draft before downloading and the edited text is the one
 * they want. That means the body is user-controlled, so it is length-capped
 * below: pdfkit and docx will both happily spend a minute laying out a megabyte
 * of pasted text on a serverless function billed by the second.
 */

import { requireUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { buildLetterDoc } from '@/lib/cover-letter/letter-doc'
import { letterFileStem } from '@/lib/cover-letter/letter-doc'
import { renderLetterPdf } from '@/lib/cover-letter/pdf'
import { renderLetterDocx } from '@/lib/cover-letter/docx'

export const runtime = 'nodejs'
export const maxDuration = 60

const FORMATS = ['pdf', 'docx'] as const
type Format = (typeof FORMATS)[number]

/* Generous next to a 250 word letter and small enough that nothing here can be
   turned into a way to burn function time. */
const MAX_LETTER_CHARS = 20_000
const MAX_FIELD_CHARS = 200

function disposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '')
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`
}

const trim = (v: unknown, max = MAX_FIELD_CHARS): string =>
  typeof v === 'string' ? v.slice(0, max).trim() : ''

export async function POST(req: NextRequest) {
  const { error: unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  try {
    const url = new URL(req.url)
    const format = (url.searchParams.get('format') || 'pdf').toLowerCase() as Format

    if (!FORMATS.includes(format)) {
      return NextResponse.json(
        { error: `Unknown format. Expected one of: ${FORMATS.join(', ')}.` },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => null)
    const letter = typeof body?.letter === 'string' ? body.letter : ''

    if (!letter.trim()) {
      return NextResponse.json({ error: 'There is no letter to export.' }, { status: 400 })
    }
    if (letter.length > MAX_LETTER_CHARS) {
      return NextResponse.json(
        { error: 'That letter is too long to export. Trim it and try again.' },
        { status: 413 }
      )
    }

    const doc = buildLetterDoc({
      letter,
      name: trim(body?.name),
      email: trim(body?.email),
      phone: trim(body?.phone),
      location: trim(body?.location),
      linkedin: trim(body?.linkedin),
      employer: trim(body?.employer),
      employerLocation: trim(body?.employerLocation),
    })

    const stem = letterFileStem(doc)

    if (format === 'docx') {
      const buf = await renderLetterDocx(doc)
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': disposition(`${stem}.docx`),
          'Cache-Control': 'no-store',
        },
      })
    }

    const buf = await renderLetterPdf(doc)
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition(`${stem}.pdf`),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('[cover-letter/export]', err?.message || err)
    return NextResponse.json(
      { error: 'That did not export. Try again in a moment.' },
      { status: 500 }
    )
  }
}
