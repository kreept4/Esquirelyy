import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { renderDocx } from '@/lib/cv/docx'
import { renderPdf } from '@/lib/cv/pdf'
import { isGeneratedCV, type GeneratedCV } from '@/lib/cv/types'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Turn a generated CV into a file.
 *
 * Rendering is deliberately not part of generation. A user who wants both
 * formats, or who comes back to a saved CV a week later, should not pay for a
 * second trip to the model to get a second file. The document is the JSON; this
 * route is just a printer.
 *
 * Both formats are drawn from the same measurements in lib/cv/template.ts, so
 * asking for both gives two files that agree rather than two that resemble each
 * other. See lib/cv/pdf.ts for why that holds.
 */

const FORMATS = ['pdf', 'docx', 'both'] as const
type Format = (typeof FORMATS)[number]

/**
 * A filename someone can find again.
 *
 * "cv.pdf" in a downloads folder is indistinguishable from the other nine, and
 * a recruiter receiving an attachment called "document.pdf" notices. Reserved
 * characters are stripped rather than replaced so the name reads normally.
 */
function fileStem(cv: GeneratedCV): string {
  const name = cv.name
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()

  return name ? `${name} CV` : 'CV'
}

/**
 * Content-Disposition with a name that survives non-ASCII.
 *
 * Nigerian names carry diacritics often enough that the plain `filename=` form
 * mangles them, so both forms are sent and the browser takes the one it
 * understands.
 */
function disposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '')
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`
}

export async function POST(req: NextRequest) {
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
    const cv = body?.cv

    if (!isGeneratedCV(cv)) {
      return NextResponse.json({ error: 'No CV to export.' }, { status: 400 })
    }

    const stem = fileStem(cv)

    if (format === 'docx') {
      const buf = await renderDocx(cv)
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': disposition(`${stem}.docx`),
          'Content-Length': String(buf.length),
        },
      })
    }

    if (format === 'pdf') {
      const buf = await renderPdf(cv)
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': disposition(`${stem}.pdf`),
          'Content-Length': String(buf.length),
        },
      })
    }

    // Both, as a zip. Two downloads from one click is blocked as a popup in
    // most browsers, and a zip is the one thing every platform opens.
    const [pdf, docx] = await Promise.all([renderPdf(cv), renderDocx(cv)])
    const zip = new JSZip()
    zip.file(`${stem}.pdf`, pdf)
    zip.file(`${stem}.docx`, docx)
    // No compression worth having on an already-compressed PDF and DOCX, and
    // deflating them costs time the user is waiting through.
    const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' })

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': disposition(`${stem}.zip`),
        'Content-Length': String(buf.length),
      },
    })
  } catch (err: any) {
    // Nothing here talks to the model, so the review route's error translation
    // does not apply. The realistic failures are a missing font in the deployed
    // bundle and malformed JSON, neither of which the user can act on.
    console.error('CV export failed:', err)
    return NextResponse.json(
      { error: 'Could not build the file. Please try again.' },
      { status: 500 }
    )
  }
}
