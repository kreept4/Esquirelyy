/**
 * The template.
 *
 * These numbers are not invented. They were measured off a real CV that had
 * been through the review, by reading the text layer out of the PDF and
 * recording the position, size and font of every run on the page. What follows
 * is that document's geometry. The worked example below is fictional; this
 * repository is public and the layout is the only part that needed keeping.
 *
 * Both renderers read from here, which is the whole point. A DOCX and a PDF
 * built from the same numbers, in metrically identical fonts, break their lines
 * in the same places and paginate the same way, so the two downloads are the
 * same document rather than two documents that resemble each other.
 *
 * Units are points throughout. DOCX wants twips (1pt = 20) and half-points
 * (1pt = 2) in places, so the conversions live at the point of use rather than
 * being baked in here.
 *
 * Observed layout, for anyone changing these:
 *
 *   ADAEZE NWACHUKWU                     16pt bold, centred
 *   +234 ... | Abuja, Nigeria | ... |        9pt regular, centred
 *   PROFESSIONAL SUMMARY                    10.5pt bold, caps, flush left
 *   Lawyer called to the Nigerian Bar...    10pt regular, justified to margin
 *   EDUCATION
 *   Nigerian Law School        Abuja, Nigeria   10.5pt bold, left + right tab
 *   Barrister-at-Law (B.L)   April - Dec 2025   10pt italic, left + right tab
 *   Called to the Nigerian Bar, July 2026       10pt regular
 *   WORK EXPERIENCE
 *   Governance and Standards Advisor  Jan 2026 - Present
 *   Meridian Health Partners LLC | Connecticut, USA
 *     • Designed and implemented over 15 governance frameworks...
 */

/** US Letter, which is what the source document is. */
export const PAGE = {
  width: 612,
  height: 792,
  marginLeft: 39.5,
  marginRight: 39.5,
  // Not a round number because it was not chosen, it was measured. The source
  // document puts the name's baseline 54.8pt below the top of the page; this is
  // the margin that reproduces that once the 16pt line box is accounted for.
  marginTop: 37.8,
  marginBottom: 39.5,
} as const

/** Width of the text column: 533pt. Right-aligned runs hang off the far end. */
export const CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight
export const RIGHT_EDGE = PAGE.width - PAGE.marginRight

export const FONT_SIZE = {
  name: 16,
  contact: 9,
  heading: 10.5,
  entryTitle: 10.5,
  entrySubtitle: 10,
  body: 10,
} as const

/**
 * Calibri's line box is about 1.22em, which is why a 10pt bullet advances 12.2pt
 * and a 10.5pt heading advances 12.8pt. Carlito inherits the same metrics, so
 * this factor holds for both outputs.
 */
export const LINE_HEIGHT_FACTOR = 1.22

export function lineHeight(size: number): number {
  return size * LINE_HEIGHT_FACTOR
}

/**
 * Space before each kind of paragraph.
 *
 * Only space-before is used, never space-after. Word adds the two together
 * where paragraphs meet while CSS collapses them to the larger, so a template
 * that sets both drifts between renderers for no benefit. One knob per gap
 * keeps the DOCX and the PDF honest.
 *
 * Derived from the baseline deltas in the source: 21.8pt from the last body
 * line to the next heading against a 12.2pt line box gives 9.6pt; 19.3pt from a
 * heading to the summary against 12.2pt gives 7.1pt; 17.8pt between entries
 * gives 5.6pt; 14.3pt from a subtitle to the first bullet gives 2.1pt.
 */
export const SPACE_BEFORE = {
  contact: 0,
  heading: 9.5,
  /** First entry or paragraph under a heading. */
  firstUnderHeading: 7,
  /** Every subsequent entry in the same section. */
  entry: 5.5,
  entrySubtitle: 0,
  entryDetail: 0,
  bullet: 2,
  skillGroup: 5,
} as const

/**
 * Bullets. The glyph sits 3pt inside the margin and the text 13pt inside it,
 * with wrapped lines returning to 13pt rather than to the margin. In DOCX that
 * is indent 13 / hanging 10; in PDF it is an explicit x offset for both the
 * glyph and the wrapped block.
 */
export const BULLET = {
  glyph: '•',
  glyphIndent: 3,
  textIndent: 13,
} as const

/** Right-aligned dates and locations sit on a tab stop at the right margin. */
export const RIGHT_TAB = CONTENT_WIDTH

/** Contact details are joined with this, exactly as in the source document. */
export const CONTACT_SEPARATOR = ' | '

/**
 * Section order.
 *
 * The source runs summary, education, certifications, work, projects,
 * leadership, volunteering, skills. That ordering is deliberate for an early
 * career Nigerian lawyer, where the call to bar and the Law School result are
 * the first thing a firm looks for, so it is preserved rather than replaced
 * with the experience-first order that suits a lateral hire.
 *
 * The model may omit any of these, and may return a heading of its own where a
 * candidate genuinely has one. Anything matching a name here is sorted into
 * this order.
 */
export const SECTION_ORDER = [
  'PROFESSIONAL SUMMARY',
  'EDUCATION',
  'PROFESSIONAL CERTIFICATIONS',
  'WORK EXPERIENCE',
  'INDEPENDENT PROJECTS',
  'LEADERSHIP EXPERIENCE',
  'VOLUNTEER EXPERIENCE',
  'PUBLICATIONS',
  'MEMBERSHIPS',
  'LANGUAGES',
  'SKILLS & INTERESTS',
] as const

/**
 * Where a heading we do not recognise belongs.
 *
 * Not at the end, which is the obvious implementation and is wrong. A run on
 * the real CV returned ADDITIONAL EXPERIENCE, a perfectly good section the list
 * above does not name, and ranking unknowns last put it below SKILLS &
 * INTERESTS, which no CV does. Skills and languages are the tail of a CV;
 * anything substantive belongs above them.
 *
 * So unknown headings sort just before the tail, keeping their order relative
 * to each other.
 */
const TAIL_SECTIONS = ['LANGUAGES', 'SKILLS & INTERESTS']

const UNKNOWN_RANK = SECTION_ORDER.length - TAIL_SECTIONS.length - 0.5

/**
 * Headings that mean PROFESSIONAL CERTIFICATIONS.
 *
 * There is no longer an ADMISSIONS section. A call to the Nigerian Bar is a
 * professional qualification, and on a two-page CV giving it a heading of its
 * own spends a whole section — heading, spacing, one entry — on a single line
 * that sits perfectly well beside the Law School result and any other
 * certificate.
 *
 * This map is enforcement, not documentation. The prompt asks the model for the
 * right heading, but the model is free text and will sometimes return
 * CERTIFICATIONS or BAR ADMISSIONS anyway; a rename that lived only in the
 * prompt would fail silently and leave the old heading on the page. Renaming
 * here means the document is correct whatever comes back.
 */
const CERTIFICATIONS_HEADING = 'PROFESSIONAL CERTIFICATIONS'

const HEADING_ALIASES: Record<string, string> = {
  'CERTIFICATIONS': CERTIFICATIONS_HEADING,
  'CERTIFICATIONS & ADMISSIONS': CERTIFICATIONS_HEADING,
  'CERTIFICATIONS AND ADMISSIONS': CERTIFICATIONS_HEADING,
  'ADMISSIONS': CERTIFICATIONS_HEADING,
  'ADMISSION': CERTIFICATIONS_HEADING,
  'BAR ADMISSIONS': CERTIFICATIONS_HEADING,
  'BAR ADMISSION': CERTIFICATIONS_HEADING,
  'CALL TO BAR': CERTIFICATIONS_HEADING,
  'PROFESSIONAL QUALIFICATIONS': CERTIFICATIONS_HEADING,
  'LICENCES & CERTIFICATIONS': CERTIFICATIONS_HEADING,
  'LICENSES & CERTIFICATIONS': CERTIFICATIONS_HEADING,
}

function canonicalHeading(heading: string): string {
  const key = heading.trim().toUpperCase().replace(/\s+/g, ' ')
  return HEADING_ALIASES[key] ?? key
}

/**
 * Canonicalise headings, fold duplicates together, then order.
 *
 * The fold matters as much as the rename. Once ADMISSIONS and CERTIFICATIONS
 * both canonicalise to one name, a model that returned both would otherwise put
 * two identical headings on the page, one under the other. Merging is only
 * attempted for 'entries' sections, which is the only kind these headings ever
 * produce and the only kind where concatenating is meaningful — a prose body
 * and an entry list cannot be joined, so anything else keeps its own section
 * and simply sorts to the same place.
 */
export function sortSections<T extends { heading: string }>(sections: T[]): T[] {
  const merged: T[] = []
  const byHeading = new Map<string, T>()

  for (const section of sections) {
    const heading = canonicalHeading(section.heading)
    const renamed = { ...section, heading } as T

    const existing = byHeading.get(heading)
    const bothEntries =
      existing &&
      (existing as any).kind === 'entries' &&
      (renamed as any).kind === 'entries'

    if (bothEntries) {
      // Order within the merged section follows the order the model produced,
      // which puts the call to bar beside the Law School entry it belongs with.
      ;(existing as any).entries = [
        ...(existing as any).entries,
        ...(renamed as any).entries,
      ]
      continue
    }

    if (!existing) byHeading.set(heading, renamed)
    merged.push(renamed)
  }

  const rank = (h: string) => {
    const i = SECTION_ORDER.indexOf(h.trim().toUpperCase() as any)
    return i === -1 ? UNKNOWN_RANK : i
  }
  // Stable, so unrecognised headings keep the order the model produced them in.
  return merged
    .map((s, i) => ({ s, i }))
    .sort((a, b) => rank(a.s.heading) - rank(b.s.heading) || a.i - b.i)
    .map(x => x.s)
}
