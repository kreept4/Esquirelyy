/**
 * The cover letter as a Word document.
 *
 * Same layout as lib/cover-letter/pdf.ts, and the header note there carries the
 * measurements and where they came from. This file exists because a lot of
 * Nigerian firms ask for a Word attachment rather than a PDF, and because a
 * candidate who wants to change a sentence before sending should not have to
 * fight a PDF to do it.
 *
 * ⚠ THE TWO RENDERERS MUST AGREE. They are separate files because docx and
 * pdfkit have nothing in common, not because the documents differ. If you move
 * a margin or resize the name here, move it there too. Both read the same
 * LetterDoc and both are driven from lib/cover-letter/letter-doc.ts, so the
 * content cannot drift; only the geometry can, and only by hand.
 *
 * ⚠ CALIBRI IS NAMED HERE, NOT CARLITO, AND THAT IS DELIBERATE.
 * The PDF embeds Carlito because it cannot ship Calibri. A .docx embeds
 * nothing: it names a font and the reader's Word supplies it. Naming Calibri
 * means the file opens in the font the recipient actually expects on the
 * machine they open it on, and Carlito was drawn to Calibri's metrics anyway,
 * so the PDF and the Word version line-break in the same places. Naming Carlito
 * here would give most recipients a fallback substitution instead.
 *
 * Sizes in docx are half-points, hence the doubling. Twips are 1/20 of a point,
 * so 56pt of margin is 1120 twips.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import type { LetterDoc } from './letter-doc'
import { normaliseLinkedIn } from './letter-doc'

const FONT = 'Calibri'
const INK = '1A1A1A'

/** Points to half-points. */
const hp = (pt: number) => Math.round(pt * 2)
/** Points to twips. */
const tw = (pt: number) => Math.round(pt * 20)

const MARGIN = 56

export async function renderLetterDocx(doc: LetterDoc): Promise<Buffer> {
  const children: Paragraph[] = []

  /* ---- Letterhead --------------------------------------------------------
     ⚠ NOT A TABLE, AND NOT TAB STOPS EITHER. The PDF puts the contacts in a
     right-aligned column beside the name. Word can do that with a two-cell
     borderless table, and it is not worth it: the table survives Word and
     mangles in Google Docs and several webmail previewers, which is where a
     good share of these will actually be opened. Stacked blocks, name then
     contacts right-aligned under it, render identically everywhere. The PDF
     keeps the side-by-side because it controls its own canvas. */
  children.push(
    new Paragraph({
      spacing: { after: tw(2) },
      children: [
        new TextRun({ text: doc.name, font: FONT, size: hp(24), bold: true, color: INK }),
      ],
    })
  )

  const link = normaliseLinkedIn(doc.linkedin)
  const contactBits: (string | { label: string; href: string })[] = []
  if (doc.email) contactBits.push(doc.email)
  if (doc.phone) contactBits.push(doc.phone)
  if (link) contactBits.push({ label: link.label, href: link.href })
  if (doc.location) contactBits.push(doc.location)

  if (contactBits.length) {
    const runs: (TextRun | ExternalHyperlink)[] = []
    contactBits.forEach((bit, i) => {
      if (i) {
        runs.push(
          new TextRun({ text: '  |  ', font: FONT, size: hp(9.5), color: '8A8A8A' })
        )
      }
      if (typeof bit === 'string') {
        runs.push(new TextRun({ text: bit, font: FONT, size: hp(9.5), color: INK }))
      } else {
        /* A real hyperlink, not the URL as text. See normaliseLinkedIn. */
        runs.push(
          new ExternalHyperlink({
            link: bit.href,
            children: [
              new TextRun({
                text: bit.label,
                font: FONT,
                size: hp(9.5),
                color: '0B5FA5',
                underline: {},
              }),
            ],
          })
        )
      }
    })

    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: tw(8) },
        children: runs,
      })
    )
  }

  /* The rule under the letterhead, drawn as a bottom border on an empty
     paragraph. Word has no horizontal-rule primitive. */
  children.push(
    new Paragraph({
      spacing: { after: tw(16) },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: INK, space: 1 } },
      children: [new TextRun({ text: '', font: FONT, size: hp(2) })],
    })
  )

  /* ---- Recipient --------------------------------------------------------- */
  children.push(
    new Paragraph({
      spacing: { after: tw(2) },
      children: [
        new TextRun({ text: doc.salutation, font: FONT, size: hp(10.5), color: INK }),
      ],
    })
  )
  for (const line of [doc.employer, doc.employerLocation].filter(Boolean) as string[]) {
    children.push(
      new Paragraph({
        spacing: { after: tw(2) },
        children: [new TextRun({ text: line, font: FONT, size: hp(10.5), color: INK })],
      })
    )
  }

  /* ---- Heading ----------------------------------------------------------- */
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: tw(18), after: tw(12) },
      children: [
        new TextRun({
          text: 'COVER LETTER',
          font: FONT,
          size: hp(10.5),
          bold: true,
          color: INK,
          characterSpacing: 22,
        }),
      ],
    })
  )

  /* ---- Body --------------------------------------------------------------
     Justified with a first-line indent, matching the PDF. */
  for (const para of doc.paragraphs) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: tw(14) },
        spacing: { after: tw(10), line: 300 },
        children: [new TextRun({ text: para, font: FONT, size: hp(11), color: INK })],
      })
    )
  }

  /* ---- Sign off ---------------------------------------------------------- */
  children.push(
    new Paragraph({
      spacing: { before: tw(14), after: tw(30) },
      children: [new TextRun({ text: doc.signOff, font: FONT, size: hp(11), color: INK })],
    })
  )
  if (doc.signature) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: doc.signature, font: FONT, size: hp(11), bold: true, color: INK }),
        ],
      })
    )
  }

  const document = new Document({
    creator: 'Esquirely',
    title: `${doc.name} cover letter`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: tw(MARGIN),
              bottom: tw(MARGIN),
              left: tw(MARGIN),
              right: tw(MARGIN),
            },
          },
        },
        children,
      },
    ],
  })

  return Packer.toBuffer(document)
}
