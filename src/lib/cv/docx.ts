import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from 'docx'
import type { CVEntry, CVSection, GeneratedCV } from './types'
import {
  BULLET,
  CONTACT_SEPARATOR,
  FONT_SIZE,
  PAGE,
  RIGHT_TAB,
  SPACE_BEFORE,
  sortSections,
} from './template'

/**
 * DOCX output.
 *
 * Written against the measured template rather than against Word's defaults,
 * because Word's defaults are Calibri 11 on 1 inch margins with 8pt after every
 * paragraph, and the source document is none of those things.
 *
 * Three decisions worth keeping.
 *
 * Right-aligned dates are a right tab stop at the text edge, not a table and
 * not a run of spaces. Tables are the usual way this is done and they are the
 * single most common reason a CV parses into nonsense; a tab is invisible to a
 * parser, which reads the line as one line, which is what it is.
 *
 * Bullets are a literal bullet character with a hanging indent rather than a
 * Word numbering definition. Numbering definitions carry their own indent and
 * font, live in a separate part of the package, and are the thing that goes
 * wrong when a document is opened in Google Docs or LibreOffice. A bullet
 * glyph and a tab survive everything.
 *
 * Spacing is space-before only, never space-after, matching template.ts.
 */

/** DOCX sizes are half-points; positions and spacing are twips. */
const hp = (pt: number) => Math.round(pt * 2)
const tw = (pt: number) => Math.round(pt * 20)

const FONT = 'Calibri'

/**
 * `line` is exact rather than "single" so that a reader with a different
 * default font substitution still gets the source document's 12.2pt rhythm.
 * `lineRule: 'exact'` would clip a run that overflows, so `atLeast` is used.
 */
function spacing(size: number, before: number) {
  return {
    before: tw(before),
    after: 0,
    line: tw(size * 1.22),
    lineRule: 'atLeast' as const,
  }
}

function run(text: string, opts: { size: number; bold?: boolean; italics?: boolean }) {
  return new TextRun({
    text,
    font: FONT,
    size: hp(opts.size),
    bold: opts.bold,
    italics: opts.italics,
  })
}

/** A left run and a right run on one line, separated by a tab to the margin. */
function twoColumn(
  left: string,
  right: string | undefined,
  opts: { size: number; bold?: boolean; italics?: boolean; before: number }
) {
  const children = [run(left, opts)]
  if (right) {
    children.push(new TextRun({ text: '\t', font: FONT, size: hp(opts.size) }))
    children.push(run(right, opts))
  }
  return new Paragraph({
    children,
    spacing: spacing(opts.size, opts.before),
    tabStops: right ? [{ type: TabStopType.RIGHT, position: tw(RIGHT_TAB) }] : undefined,
  })
}

function bullet(text: string, before: number) {
  return new Paragraph({
    children: [
      run(BULLET.glyph, { size: FONT_SIZE.body }),
      new TextRun({ text: '\t', font: FONT, size: hp(FONT_SIZE.body) }),
      run(text, { size: FONT_SIZE.body }),
    ],
    spacing: spacing(FONT_SIZE.body, before),
    // Hanging indent: the glyph sits at 3pt, the text and every wrapped line at
    // 13pt. The tab stop is what carries the glyph across to the text column.
    indent: { left: tw(BULLET.textIndent), hanging: tw(BULLET.textIndent - BULLET.glyphIndent) },
    tabStops: [{ type: TabStopType.LEFT, position: tw(BULLET.textIndent) }],
  })
}

function entryParagraphs(entry: CVEntry, isFirst: boolean): Paragraph[] {
  const out: Paragraph[] = []

  out.push(
    twoColumn(entry.title, entry.titleRight, {
      size: FONT_SIZE.entryTitle,
      bold: true,
      before: isFirst ? SPACE_BEFORE.firstUnderHeading : SPACE_BEFORE.entry,
    })
  )

  if (entry.subtitle) {
    out.push(
      twoColumn(entry.subtitle, entry.subtitleRight, {
        size: FONT_SIZE.entrySubtitle,
        italics: true,
        before: SPACE_BEFORE.entrySubtitle,
      })
    )
  }

  if (entry.detail) {
    out.push(
      new Paragraph({
        children: [run(entry.detail, { size: FONT_SIZE.body })],
        spacing: spacing(FONT_SIZE.body, SPACE_BEFORE.entryDetail),
      })
    )
  }

  for (const b of entry.bullets ?? []) {
    out.push(bullet(b, SPACE_BEFORE.bullet))
  }

  return out
}

function sectionParagraphs(section: CVSection): Paragraph[] {
  const out: Paragraph[] = [
    new Paragraph({
      children: [run(section.heading.toUpperCase(), { size: FONT_SIZE.heading, bold: true })],
      spacing: spacing(FONT_SIZE.heading, SPACE_BEFORE.heading),
      // Tells Word not to leave a heading stranded at the foot of a page.
      keepNext: true,
      // Real heading levels, so the document has an outline an ATS can follow.
      heading: HeadingLevel.HEADING_1,
    }),
  ]

  if (section.kind === 'prose') {
    out.push(
      new Paragraph({
        children: [run(section.body, { size: FONT_SIZE.body })],
        spacing: spacing(FONT_SIZE.body, SPACE_BEFORE.firstUnderHeading),
      })
    )
    return out
  }

  if (section.kind === 'grouped') {
    section.groups.forEach((g, i) => {
      out.push(
        new Paragraph({
          children: [
            run(`${g.label}: `, { size: FONT_SIZE.body, bold: true }),
            run(g.items, { size: FONT_SIZE.body }),
          ],
          spacing: spacing(
            FONT_SIZE.body,
            i === 0 ? SPACE_BEFORE.firstUnderHeading : SPACE_BEFORE.skillGroup
          ),
        })
      )
    })
    return out
  }

  section.entries.forEach((e, i) => out.push(...entryParagraphs(e, i === 0)))
  return out
}

export async function renderDocx(cv: GeneratedCV): Promise<Buffer> {
  const children: Paragraph[] = []

  children.push(
    new Paragraph({
      children: [run(cv.name.toUpperCase(), { size: FONT_SIZE.name, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: spacing(FONT_SIZE.name, 0),
    })
  )

  // The contact line is one paragraph, so a parser reads it as one field rather
  // than as four orphaned lines. Only genuine URLs become hyperlinks.
  const contactChildren: (TextRun | ExternalHyperlink)[] = []
  cv.contact.forEach((c, i) => {
    if (i > 0) {
      contactChildren.push(
        new TextRun({ text: CONTACT_SEPARATOR, font: FONT, size: hp(FONT_SIZE.contact) })
      )
    }
    if (c.href) {
      contactChildren.push(
        new ExternalHyperlink({
          link: c.href,
          children: [
            new TextRun({
              text: c.text,
              font: FONT,
              size: hp(FONT_SIZE.contact),
              style: 'Hyperlink',
            }),
          ],
        })
      )
    } else {
      contactChildren.push(run(c.text, { size: FONT_SIZE.contact }))
    }
  })

  children.push(
    new Paragraph({
      children: contactChildren,
      alignment: AlignmentType.CENTER,
      spacing: spacing(FONT_SIZE.contact, SPACE_BEFORE.contact),
    })
  )

  for (const section of sortSections(cv.sections)) {
    children.push(...sectionParagraphs(section))
  }

  const doc = new Document({
    // Word substitutes silently and badly when a font is missing, so the whole
    // document declares Calibri once here rather than relying on the theme.
    styles: {
      default: {
        document: { run: { font: FONT, size: hp(FONT_SIZE.body), color: '000000' } },
        /**
         * Heading 1, forced back to black.
         *
         * Section headings are tagged HeadingLevel.HEADING_1 so the document has
         * a real outline an ATS can follow — that is worth keeping. What comes
         * with it is Word's built-in Heading 1 style, which is blue (and Calibri
         * Light) by default. The run properties on each heading paragraph set
         * size and weight but said nothing about colour, so Word applied its
         * own, and every section title on the exported .docx came out blue while
         * the PDF renderer — which never touches Word styles — drew them black.
         * The same document in two formats did not match.
         *
         * Overriding the style itself rather than colouring each run keeps the
         * outline intact and fixes every heading at once, including any added
         * later. The font is restated here too because Word's Heading 1 also
         * substitutes Calibri Light, which is a different weight from the body.
         */
        heading1: {
          run: { font: FONT, size: hp(FONT_SIZE.heading), bold: true, color: '000000' },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: tw(PAGE.width), height: tw(PAGE.height) },
            margin: {
              top: tw(PAGE.marginTop),
              bottom: tw(PAGE.marginBottom),
              left: tw(PAGE.marginLeft),
              right: tw(PAGE.marginRight),
            },
          },
        },
        children,
      },
    ],
  })

  return Packer.toBuffer(doc)
}
