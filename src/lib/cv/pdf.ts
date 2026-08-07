import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'
import type { CVEntry, CVSection, GeneratedCV } from './types'
import {
  BULLET,
  CONTACT_SEPARATOR,
  CONTENT_WIDTH,
  FONT_SIZE,
  PAGE,
  RIGHT_EDGE,
  SPACE_BEFORE,
  lineHeight,
  sortSections,
} from './template'

/**
 * PDF output.
 *
 * The document is drawn rather than flowed, which is the only way to make it
 * land on the same coordinates as the DOCX. pdfkit's own layout engine has its
 * own opinions about leading and paragraph spacing, so it is used purely as a
 * drawing surface: this module tracks the cursor itself, measures every string,
 * and decides where each line goes from the numbers in template.ts.
 *
 * The fonts are Carlito, not Calibri. Calibri is a Microsoft font and cannot be
 * redistributed; Carlito is SIL OFL and was drawn to Calibri's metrics, so
 * every glyph has the same advance width. That is what makes this worth doing:
 * the PDF and the DOCX break their lines at the same words and break their
 * pages at the same entries, so the two downloads are one document. Swapping in
 * a font that is merely similar, Helvetica say, silently gives up that property
 * while still looking fine on the first page.
 *
 * The output has a real text layer and no images, tables or columns, so it
 * parses.
 */

const FONT_DIR = path.join(process.cwd(), 'src', 'lib', 'cv', 'fonts')

type Weight = 'regular' | 'bold' | 'italic'

const FONT_FILES: Record<Weight, string> = {
  regular: 'Carlito-Regular.ttf',
  bold: 'Carlito-Bold.ttf',
  italic: 'Carlito-Italic.ttf',
}

/**
 * Read once per process rather than per request. These are ~2MB together and a
 * serverless instance handles many requests, so re-reading them off disk on
 * every export is pure waste.
 */
let fontCache: Record<Weight, Buffer> | null = null

function loadFonts(): Record<Weight, Buffer> {
  if (fontCache) return fontCache
  const loaded = {} as Record<Weight, Buffer>
  for (const [weight, file] of Object.entries(FONT_FILES) as [Weight, string][]) {
    const full = path.join(FONT_DIR, file)
    if (!fs.existsSync(full)) {
      // Worth failing loudly. The usual cause is the file tracing config in
      // next.config.js not carrying the fonts into the deployed bundle, which
      // works locally and fails only in production.
      throw new Error(`Missing CV font: ${file}. Check outputFileTracingIncludes in next.config.js.`)
    }
    loaded[weight] = fs.readFileSync(full)
  }
  fontCache = loaded
  return loaded
}

/** A cursor that knows how to break a page. */
class Cursor {
  y: number
  private doc: PDFKit.PDFDocument
  constructor(doc: PDFKit.PDFDocument) {
    this.doc = doc
    this.y = PAGE.marginTop
  }

  get bottom() {
    return PAGE.height - PAGE.marginBottom
  }

  /**
   * Make room for `height`, starting a new page if it will not fit.
   * Returns the y to draw at.
   */
  take(height: number, spaceBefore = 0): number {
    const y = this.y + spaceBefore
    if (y + height > this.bottom) {
      this.doc.addPage()
      this.y = PAGE.marginTop + height
      return PAGE.marginTop
    }
    this.y = y + height
    return y
  }

  /** Would `height` of content fit without breaking? Used for widow control. */
  fits(height: number, spaceBefore = 0): boolean {
    return this.y + spaceBefore + height <= this.bottom
  }

  breakPage() {
    this.doc.addPage()
    this.y = PAGE.marginTop
  }
}

function setFont(doc: PDFKit.PDFDocument, weight: Weight, size: number) {
  doc.font(weight).fontSize(size)
}

/**
 * Draw a paragraph of wrapped text at `x` with width `width`.
 *
 * pdfkit's own `text` would do this, but it applies its own line gap and moves
 * its own cursor, so the result drifts from the DOCX by a fraction of a point
 * per line and by several points per page. Lines are measured and placed here
 * instead.
 */
function drawWrapped(
  doc: PDFKit.PDFDocument,
  cursor: Cursor,
  text: string,
  opts: { x: number; width: number; weight: Weight; size: number; spaceBefore: number }
): void {
  setFont(doc, opts.weight, opts.size)
  const lh = lineHeight(opts.size)
  const lines = wrap(doc, text, opts.width)

  lines.forEach((line, i) => {
    const y = cursor.take(lh, i === 0 ? opts.spaceBefore : 0)
    // pdfkit positions text by its top edge when given a y, and `lineBreak:
    // false` stops it re-wrapping something already wrapped.
    doc.text(line, opts.x, y + (lh - opts.size) / 2, { lineBreak: false, width: opts.width })
  })
}

/** Greedy wrap on the font currently set. */
function wrap(doc: PDFKit.PDFDocument, text: string, width: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines: string[] = []
  let line = words[0]
  for (let i = 1; i < words.length; i++) {
    const candidate = `${line} ${words[i]}`
    if (doc.widthOfString(candidate) <= width) {
      line = candidate
    } else {
      lines.push(line)
      line = words[i]
    }
  }
  lines.push(line)
  return lines
}

/** One line, left run flush left and right run flush right. */
function drawTwoColumn(
  doc: PDFKit.PDFDocument,
  cursor: Cursor,
  left: string,
  right: string | undefined,
  opts: { weight: Weight; size: number; spaceBefore: number }
) {
  setFont(doc, opts.weight, opts.size)
  const lh = lineHeight(opts.size)
  const rightWidth = right ? doc.widthOfString(right) : 0
  // Leave a gap so a long title never collides with the date.
  const leftWidth = CONTENT_WIDTH - (right ? rightWidth + 12 : 0)
  const lines = wrap(doc, left, leftWidth)

  lines.forEach((line, i) => {
    const y = cursor.take(lh, i === 0 ? opts.spaceBefore : 0)
    const baseline = y + (lh - opts.size) / 2
    doc.text(line, PAGE.marginLeft, baseline, { lineBreak: false, width: leftWidth })
    if (right && i === 0) {
      doc.text(right, RIGHT_EDGE - rightWidth, baseline, { lineBreak: false, width: rightWidth + 1 })
    }
  })
}

function drawBullet(doc: PDFKit.PDFDocument, cursor: Cursor, text: string) {
  const size = FONT_SIZE.body
  const lh = lineHeight(size)
  setFont(doc, 'regular', size)
  const width = CONTENT_WIDTH - BULLET.textIndent
  const lines = wrap(doc, text, width)

  lines.forEach((line, i) => {
    const y = cursor.take(lh, i === 0 ? SPACE_BEFORE.bullet : 0)
    const baseline = y + (lh - size) / 2
    if (i === 0) {
      doc.text(BULLET.glyph, PAGE.marginLeft + BULLET.glyphIndent, baseline, { lineBreak: false })
    }
    // Wrapped lines return to the text column, not to the margin.
    doc.text(line, PAGE.marginLeft + BULLET.textIndent, baseline, { lineBreak: false, width })
  })
}

/** Height of a block, used to decide whether it may be split across a page. */
function measureLines(doc: PDFKit.PDFDocument, text: string, width: number, weight: Weight, size: number) {
  setFont(doc, weight, size)
  return wrap(doc, text, width).length * lineHeight(size)
}

function drawEntry(doc: PDFKit.PDFDocument, cursor: Cursor, entry: CVEntry, isFirst: boolean) {
  const spaceBefore = isFirst ? SPACE_BEFORE.firstUnderHeading : SPACE_BEFORE.entry

  /**
   * Widow control. An entry whose title lands at the foot of a page with its
   * bullets overleaf reads as two different jobs. If the title, the subtitle
   * and the first bullet will not fit together, the whole entry moves.
   */
  let head = measureLines(doc, entry.title, CONTENT_WIDTH, 'bold', FONT_SIZE.entryTitle)
  if (entry.subtitle) {
    head += measureLines(doc, entry.subtitle, CONTENT_WIDTH, 'italic', FONT_SIZE.entrySubtitle)
  }
  if (entry.detail) {
    head += measureLines(doc, entry.detail, CONTENT_WIDTH, 'regular', FONT_SIZE.body)
  }
  const firstBullet = entry.bullets?.[0]
  if (firstBullet) {
    head +=
      SPACE_BEFORE.bullet +
      measureLines(doc, firstBullet, CONTENT_WIDTH - BULLET.textIndent, 'regular', FONT_SIZE.body)
  }
  if (!cursor.fits(head, spaceBefore)) cursor.breakPage()

  drawTwoColumn(doc, cursor, entry.title, entry.titleRight, {
    weight: 'bold',
    size: FONT_SIZE.entryTitle,
    spaceBefore,
  })

  if (entry.subtitle) {
    drawTwoColumn(doc, cursor, entry.subtitle, entry.subtitleRight, {
      weight: 'italic',
      size: FONT_SIZE.entrySubtitle,
      spaceBefore: SPACE_BEFORE.entrySubtitle,
    })
  }

  if (entry.detail) {
    drawWrapped(doc, cursor, entry.detail, {
      x: PAGE.marginLeft,
      width: CONTENT_WIDTH,
      weight: 'regular',
      size: FONT_SIZE.body,
      spaceBefore: SPACE_BEFORE.entryDetail,
    })
  }

  for (const b of entry.bullets ?? []) drawBullet(doc, cursor, b)
}

function drawSection(doc: PDFKit.PDFDocument, cursor: Cursor, section: CVSection) {
  const headingHeight = lineHeight(FONT_SIZE.heading)
  // A heading alone at the foot of a page is the same widow problem, so it is
  // held back unless something can follow it.
  if (!cursor.fits(headingHeight + lineHeight(FONT_SIZE.body) * 2, SPACE_BEFORE.heading)) {
    cursor.breakPage()
  }

  drawWrapped(doc, cursor, section.heading.toUpperCase(), {
    x: PAGE.marginLeft,
    width: CONTENT_WIDTH,
    weight: 'bold',
    size: FONT_SIZE.heading,
    spaceBefore: SPACE_BEFORE.heading,
  })

  if (section.kind === 'prose') {
    drawWrapped(doc, cursor, section.body, {
      x: PAGE.marginLeft,
      width: CONTENT_WIDTH,
      weight: 'regular',
      size: FONT_SIZE.body,
      spaceBefore: SPACE_BEFORE.firstUnderHeading,
    })
    return
  }

  if (section.kind === 'grouped') {
    section.groups.forEach((g, i) => {
      const size = FONT_SIZE.body
      const lh = lineHeight(size)
      const label = `${g.label}: `
      setFont(doc, 'bold', size)
      const labelWidth = doc.widthOfString(label)

      // The label is bold and the list is not, on the same line, with the list
      // wrapping back to the margin underneath.
      setFont(doc, 'regular', size)
      const firstLineWidth = CONTENT_WIDTH - labelWidth
      const words = g.items.split(/\s+/).filter(Boolean)
      const lines: string[] = []
      let line = ''
      let available = firstLineWidth
      for (const w of words) {
        const candidate = line ? `${line} ${w}` : w
        if (doc.widthOfString(candidate) <= available) {
          line = candidate
        } else {
          lines.push(line)
          line = w
          available = CONTENT_WIDTH
        }
      }
      if (line) lines.push(line)

      lines.forEach((l, li) => {
        const y = cursor.take(
          lh,
          li === 0 ? (i === 0 ? SPACE_BEFORE.firstUnderHeading : SPACE_BEFORE.skillGroup) : 0
        )
        const baseline = y + (lh - size) / 2
        if (li === 0) {
          setFont(doc, 'bold', size)
          doc.text(label, PAGE.marginLeft, baseline, { lineBreak: false })
          setFont(doc, 'regular', size)
          doc.text(l, PAGE.marginLeft + labelWidth, baseline, { lineBreak: false })
        } else {
          setFont(doc, 'regular', size)
          doc.text(l, PAGE.marginLeft, baseline, { lineBreak: false })
        }
      })
    })
    return
  }

  section.entries.forEach((e, i) => drawEntry(doc, cursor, e, i === 0))
}

export async function renderPdf(cv: GeneratedCV): Promise<Buffer> {
  const fonts = loadFonts()

  const doc = new PDFDocument({
    size: [PAGE.width, PAGE.height],
    // pdfkit's own margins are set to zero and every position computed from
    // template.ts, so there is exactly one source of truth for the geometry.
    margin: 0,
    autoFirstPage: true,
    info: {
      Title: `${cv.name} CV`,
      Author: cv.name,
      Creator: 'Esquirely',
    },
    // Tagged output gives assistive tech and the stricter parsers a reading
    // order rather than leaving them to infer one from coordinates.
    pdfVersion: '1.7',
    lang: 'en-NG',
    displayTitle: true,
  })

  doc.registerFont('regular', fonts.regular)
  doc.registerFont('bold', fonts.bold)
  doc.registerFont('italic', fonts.italic)
  doc.fillColor('#000000')

  const chunks: Buffer[] = []
  doc.on('data', (c: Buffer) => chunks.push(c))
  const done = new Promise<Buffer>(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))))

  const cursor = new Cursor(doc)

  // Name, centred.
  setFont(doc, 'bold', FONT_SIZE.name)
  const nameText = cv.name.toUpperCase()
  const nameLh = lineHeight(FONT_SIZE.name)
  const nameY = cursor.take(nameLh)
  doc.text(nameText, PAGE.marginLeft, nameY + (nameLh - FONT_SIZE.name) / 2, {
    width: CONTENT_WIDTH,
    align: 'center',
    lineBreak: false,
  })

  // Contact line, centred, with links where there are links. Drawn as one
  // measured run so the hyperlink rectangles land on the right words.
  setFont(doc, 'regular', FONT_SIZE.contact)
  const parts = cv.contact.map(c => c.text)
  const joined = parts.join(CONTACT_SEPARATOR)
  const contactLh = lineHeight(FONT_SIZE.contact)
  const contactY = cursor.take(contactLh, SPACE_BEFORE.contact)
  const contactBaseline = contactY + (contactLh - FONT_SIZE.contact) / 2
  let x = PAGE.marginLeft + (CONTENT_WIDTH - doc.widthOfString(joined)) / 2

  cv.contact.forEach((c, i) => {
    if (i > 0) {
      doc.fillColor('#000000').text(CONTACT_SEPARATOR, x, contactBaseline, { lineBreak: false })
      x += doc.widthOfString(CONTACT_SEPARATOR)
    }
    const w = doc.widthOfString(c.text)
    if (c.href) {
      doc.fillColor('#0563C1').text(c.text, x, contactBaseline, { lineBreak: false })
      doc.fillColor('#000000')
      // The annotation rectangle is placed explicitly rather than via the
      // `link` option. That option derives its rectangle from pdfkit's own
      // line-wrapping state, which this renderer deliberately does not use, so
      // it computes NaN and the document fails to serialise.
      doc.link(x, contactBaseline, w, FONT_SIZE.contact, c.href)
    } else {
      doc.text(c.text, x, contactBaseline, { lineBreak: false })
    }
    x += w
  })

  for (const section of sortSections(cv.sections)) {
    drawSection(doc, cursor, section)
  }

  doc.end()
  return done
}
