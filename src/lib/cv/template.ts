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
 * Observed layout, for anyone changing these. Sizes below are the ones now in
 * force, not the ones measured — see FONT_SIZE for why every run of text is
 * capped at 9.5pt where the source ran 10 and 10.5.
 *
 *   ADAEZE NWACHUKWU                     16pt bold, centred
 *   +234 ... | Abuja, Nigeria | ... |        9pt regular, centred
 *   PROFESSIONAL SUMMARY                    9.5pt bold, caps, flush left
 *   Lawyer called to the Nigerian Bar...    9.5pt regular, justified to margin
 *   EDUCATION
 *   Nigerian Law School        Abuja, Nigeria   9.5pt bold, left + right tab
 *   Barrister-at-Law (B.L)   April - Dec 2025   9.5pt italic, left + right tab
 *   Called to the Nigerian Bar, July 2026       9.5pt regular
 *   PROFESSIONAL CERTIFICATIONS
 *   Nigerian Bar Certificate            July 2026   9.5pt bold, left + right tab
 *   Barrister and Solicitor of the Supreme Court of Nigeria   9.5pt italic
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

/**
 * 9.5pt is the ceiling for every run of text on the page.
 *
 * The measured source ran 10.5 for headings and entry titles and 10 for
 * everything else. That is a comfortable size and it costs a line here and
 * there, which on a document with a two-page ceiling is the difference between
 * a role keeping its bullets and losing them. Dropping to 9.5 buys back roughly
 * a line in every twenty without reaching the size where a partner squints.
 *
 * The hierarchy survives the flattening because it was never carried by size.
 * Half a point is invisible; what separates a heading from a title from a body
 * line is caps, weight and italic, and all three are untouched.
 *
 * `name` is exempt and deliberately so. It is the one display element on the
 * page rather than a run of text, and shrinking it to 9.5 would leave the
 * candidate's name the same size as their bullets. `contact` is already below
 * the ceiling and stays where it was measured.
 */
export const MAX_TEXT_SIZE = 9.5

export const FONT_SIZE = {
  name: 16,
  contact: 9,
  heading: MAX_TEXT_SIZE,
  entryTitle: MAX_TEXT_SIZE,
  entrySubtitle: MAX_TEXT_SIZE,
  body: MAX_TEXT_SIZE,
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
 * The call to bar, as a certificate.
 *
 * The wording is fixed because it is not a description, it is what the
 * certificate says. Every lawyer called in Nigeria gets the same one, so
 * letting the model phrase it produces "Called to the Nigerian Bar", "Barrister
 * & Solicitor, Supreme Court of Nigeria" and half a dozen other near misses
 * across otherwise identical documents.
 */
const BAR_ENTRY_TITLE = 'Nigerian Bar Certificate'
const BAR_ENTRY_SUBTITLE = 'Barrister and Solicitor of the Supreme Court of Nigeria'

/** An entry that is already the call to bar, under whatever name it came back as. */
const BAR_ENTRY_PATTERN =
  /\b(bar certificate|called to the (nigerian )?bar|call to (the )?(nigerian )?bar|nigerian bar\b|enrol(l)?ed as a barrister)/i

/** "Called to the Nigerian Bar, July 2026" / "called to the Bar in July 2026". */
const CALL_DATE_PATTERN =
  /call(?:ed)? to the (?:nigerian )?bar\b[^A-Za-z0-9]*(?:in|on)?\s*([A-Za-z]+\s+\d{4}|\d{4})/i

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

/**
 * Sortable key for a date like "July 2026", "2026" or "May 2026 - Present".
 *
 * Only the START of a range is read, which is what a certificate line carries
 * anyway. Anything unparseable returns -1 so it sorts to the bottom of the
 * section rather than jumping to the top on a missing month.
 */
function dateKey(value: string | undefined): number {
  if (!value) return -1
  const m = /([A-Za-z]+)?\s*(\d{4})/.exec(value.trim())
  if (!m) return -1
  const year = Number(m[2])
  const month = m[1] ? MONTHS.indexOf(m[1].toLowerCase()) : -1
  // Undated within a year sorts above that year's dated entries rather than
  // below all of them, which is the less wrong of the two guesses.
  return year * 12 + (month === -1 ? 11 : month)
}

/** Every string on an entry, for scanning. */
function entryText(entry: any): string {
  return [entry?.title, entry?.titleRight, entry?.subtitle, entry?.subtitleRight, entry?.detail]
    .filter(Boolean)
    .join(' ')
}

/**
 * Find when the candidate was called, from anywhere it is stated.
 *
 * Deliberately a search rather than a field. The date turns up on the Law
 * School entry's detail line, inside the professional summary, or on a
 * certification entry the model already wrote, depending on the run — and the
 * whole point is that all three should agree. Returning null is a real answer:
 * a candidate who has not been called does not get a certificate invented for
 * them.
 */
function findCallDate(sections: any[]): string | null {
  for (const section of sections) {
    if (section?.kind === 'entries') {
      for (const entry of section.entries ?? []) {
        // An entry that IS the bar line carries its date on the right.
        if (BAR_ENTRY_PATTERN.test(String(entry?.title ?? '')) && entry?.titleRight) {
          return String(entry.titleRight).trim()
        }
        const found = CALL_DATE_PATTERN.exec(entryText(entry))
        if (found) return found[1].trim()
      }
    }
    if (section?.kind === 'prose') {
      const found = CALL_DATE_PATTERN.exec(String(section.body ?? ''))
      if (found) return found[1].trim()
    }
  }
  return null
}

/**
 * Put the call to bar in PROFESSIONAL CERTIFICATIONS, in the house wording, and
 * order the section newest first.
 *
 * Enforcement rather than documentation, for the same reason HEADING_ALIASES is:
 * the prompt asks for this and the model mostly complies, but "mostly" leaves
 * the occasional document with the qualification a candidate spent five years
 * earning sitting in the wrong place or worded three different ways. The date
 * is taken from wherever the call is stated so the certificate and the Law
 * School entry cannot disagree, which was the other half of the problem.
 *
 * Nothing here invents a qualification. If no call date can be found anywhere in
 * the document, the section is left exactly as the model returned it.
 */
function withBarCertificate<T extends { heading: string }>(sections: T[]): T[] {
  const callDate = findCallDate(sections)
  if (!callDate) return sections

  const barEntry = {
    title: BAR_ENTRY_TITLE,
    titleRight: callDate,
    subtitle: BAR_ENTRY_SUBTITLE,
  }

  const index = sections.findIndex(s => s.heading === CERTIFICATIONS_HEADING)

  if (index === -1) {
    // The model gave the call as a line on the Law School entry and no
    // certifications section at all. That line stays where it is — it reads
    // correctly there — and the certificate gets its own entry as well, exactly
    // as the reference document has it.
    const created = { kind: 'entries', heading: CERTIFICATIONS_HEADING, entries: [barEntry] } as unknown as T
    return [...sections, created]
  }

  const section: any = sections[index]
  if (section.kind !== 'entries') return sections

  const existing = (section.entries ?? []).findIndex((e: any) =>
    BAR_ENTRY_PATTERN.test(String(e?.title ?? ''))
  )

  const entries =
    existing === -1
      ? [...(section.entries ?? []), barEntry]
      : (section.entries ?? []).map((e: any, i: number) =>
          i === existing
            ? { ...e, title: BAR_ENTRY_TITLE, titleRight: e.titleRight || callDate, subtitle: BAR_ENTRY_SUBTITLE }
            : e
        )

  // Most recent first, the pattern the rest of the document already follows.
  // Stable within an equal date, so anything undated keeps the model's order.
  const ordered = entries
    .map((e: any, i: number) => ({ e, i }))
    .sort((a: any, b: any) => dateKey(b.e.titleRight) - dateKey(a.e.titleRight) || a.i - b.i)
    .map((x: any) => x.e)

  const next = [...sections]
  next[index] = { ...section, entries: ordered }
  return next
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
  // After the fold, so it sees one certifications section rather than the two
  // a model occasionally returns, and before the sort, so a section it creates
  // is ordered with the rest.
  const normalised = withBarCertificate(merged)

  // Stable, so unrecognised headings keep the order the model produced them in.
  return normalised
    .map((s, i) => ({ s, i }))
    .sort((a, b) => rank(a.s.heading) - rank(b.s.heading) || a.i - b.i)
    .map(x => x.s)
}
