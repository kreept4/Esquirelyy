/**
 * The cover letter as a PDF.
 *
 * ============================================================
 * THE LAYOUT IS COPIED FROM A REAL LETTER, NOT DESIGNED HERE
 * ============================================================
 *
 * Measured off "Boluwatife Ogunleye (Cover Letter) ANDI DAZE LEGAL.pdf", which
 * is the format actually being sent to Nigerian firms. Every number below came
 * off that file rather than out of a style guide:
 *
 *   page          A4, 596 x 842pt
 *   name          27pt, flush left at the top
 *   contacts      9 to 10pt, right aligned on the same band as the name
 *   recipient     10pt, flush left, a clear gap under the letterhead
 *   heading       "COVER LETTER", centred, small
 *   body          11pt, justified, first line of each paragraph indented
 *   sign off      11pt, flush left, room above it for a signature
 *
 * ⚠ THE MARGINS ARE WIDENED FROM THE SOURCE ON PURPOSE. That file sets its body
 * at x=24pt, which is 8.5mm and narrower than most printers will take without
 * clipping; it also puts the name at x=36 and the body at 24, so the letterhead
 * and the text do not share a left edge. Both are almost certainly artefacts of
 * whatever produced it. This uses a single 56pt (about 20mm) margin for
 * everything, which is a normal business letter margin, prints safely, and
 * lines the letterhead up with the body.
 *
 * ⚠ CARLITO, NOT CALIBRI, and the reasoning in lib/cv/pdf.ts applies unchanged:
 * Calibri cannot be redistributed, Carlito is SIL OFL and was drawn to Calibri's
 * metrics, so a letter set in it lands on a Nigerian firm's screen looking like
 * the Word document they expect. The font files are shared with the CV
 * renderer rather than duplicated.
 */

import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'
import type { LetterDoc } from './letter-doc'
import { normaliseLinkedIn } from './letter-doc'

/* Shared with the CV renderer. See lib/cv/pdf.ts. */
const FONT_DIR = path.join(process.cwd(), 'src', 'lib', 'cv', 'fonts')
const REGULAR = path.join(FONT_DIR, 'Carlito-Regular.ttf')
const BOLD = path.join(FONT_DIR, 'Carlito-Bold.ttf')

const PAGE = { width: 595.28, height: 841.89 }
const MARGIN = 56

/** Point sizes, off the source letter. */
const SIZE = {
  name: 24,
  contact: 9.5,
  recipient: 10.5,
  heading: 10.5,
  body: 11,
}

const INK = '#1A1A1A'

export async function renderLetterPdf(doc: LetterDoc): Promise<Buffer> {
  const regular = fs.readFileSync(REGULAR)
  const bold = fs.readFileSync(BOLD)

  const pdf = new PDFDocument({
    size: [PAGE.width, PAGE.height],
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    info: {
      Title: `${doc.name} cover letter`,
      Author: doc.name,
      Creator: 'Esquirely',
    },
  })

  pdf.registerFont('regular', regular)
  pdf.registerFont('bold', bold)

  const chunks: Buffer[] = []
  pdf.on('data', (c: Buffer) => chunks.push(c))
  const done = new Promise<Buffer>(resolve => pdf.on('end', () => resolve(Buffer.concat(chunks))))

  const contentWidth = PAGE.width - MARGIN * 2

  /* ---- Letterhead --------------------------------------------------------
     The name and the contact stack share a horizontal band. The name is drawn
     first at the margin, then the contacts are drawn right aligned starting at
     the same y, so the block reads as one header however long the name is. */
  const headTop = pdf.y

  pdf.font('bold').fontSize(SIZE.name).fillColor(INK)
  pdf.text(doc.name, MARGIN, headTop, { width: contentWidth * 0.55, lineGap: 0 })
  const afterName = pdf.y

  /* The contact stack, right aligned beside the name.
     ⚠ LINKEDIN IS A REAL LINK, NOT PRINTED AS A URL. pdfkit's `link` option
     draws the annotation over the text it just set, so the label can read
     "linkedin.com/in/name" while the annotation carries the full https href. A
     letterhead that prints the whole URL wastes a line and reads as a form
     field; one that prints nothing clickable wastes the fact that most of these
     are read on a screen. */
  const link = normaliseLinkedIn(doc.linkedin)
  const contacts: { text: string; href?: string }[] = []
  if (doc.email) contacts.push({ text: doc.email, href: `mailto:${doc.email}` })
  if (doc.phone) contacts.push({ text: doc.phone })
  if (link) contacts.push({ text: link.label, href: link.href })
  if (doc.location) contacts.push({ text: doc.location })

  if (contacts.length) {
    pdf.fontSize(SIZE.contact)
    const colX = MARGIN + contentWidth * 0.45
    const colW = contentWidth * 0.55
    let y = headTop + 2
    for (const c of contacts) {
      pdf.font('regular').fillColor(c.href ? '#0B5FA5' : INK)
      pdf.text(c.text, colX, y, {
        width: colW,
        align: 'right',
        link: c.href,
        underline: !!c.href && c.text === link?.label,
      })
      y = pdf.y + 1
    }
    pdf.fillColor(INK)
  }

  /* Whichever column ran longer decides where the rule sits. */
  const headBottom = Math.max(afterName, pdf.y)

  pdf.moveTo(MARGIN, headBottom + 10)
    .lineTo(PAGE.width - MARGIN, headBottom + 10)
    .lineWidth(0.75)
    .strokeColor(INK)
    .stroke()

  pdf.y = headBottom + 28

  /* ---- Recipient ---------------------------------------------------------
     Salutation first, then the firm, matching the source letter's order. It
     reads oddly next to a formal English business letter, where the address
     comes above the greeting, but it is what the sampled letter does and it is
     what the firms receiving these are used to. */
  pdf.font('regular').fontSize(SIZE.recipient).fillColor(INK)
  pdf.text(doc.salutation, MARGIN, pdf.y, { width: contentWidth })

  if (doc.employer) {
    pdf.moveDown(0.35)
    pdf.text(doc.employer, MARGIN, pdf.y, { width: contentWidth })
  }
  if (doc.employerLocation) {
    pdf.moveDown(0.2)
    pdf.text(doc.employerLocation, MARGIN, pdf.y, { width: contentWidth })
  }

  /* ---- Heading -----------------------------------------------------------  */
  pdf.moveDown(1.4)
  pdf.font('bold').fontSize(SIZE.heading).fillColor(INK)
  pdf.text('COVER LETTER', MARGIN, pdf.y, {
    width: contentWidth,
    align: 'center',
    characterSpacing: 1.1,
  })

  /* ---- Body --------------------------------------------------------------
     Justified with a first line indent, both off the source. `indent` in
     pdfkit applies to the first line only, which is exactly the behaviour
     wanted and the reason the source letter's continuation lines start further
     left than its first lines. */
  pdf.moveDown(1.1)
  pdf.font('regular').fontSize(SIZE.body).fillColor(INK)

  for (const para of doc.paragraphs) {
    pdf.text(para, MARGIN, pdf.y, {
      width: contentWidth,
      align: 'justify',
      indent: 14,
      lineGap: 3.2,
    })
    pdf.moveDown(0.75)
  }

  /* ---- Sign off ----------------------------------------------------------
     A clear gap above it so a printed letter has room for a signature, and the
     name flush left under it. */
  pdf.moveDown(1.1)
  pdf.text(doc.signOff, MARGIN, pdf.y, { width: contentWidth, align: 'left' })
  if (doc.signature) {
    pdf.moveDown(1.6)
    pdf.font('bold').fontSize(SIZE.body)
    pdf.text(doc.signature, MARGIN, pdf.y, { width: contentWidth, align: 'left' })
  }

  pdf.end()
  return done
}
