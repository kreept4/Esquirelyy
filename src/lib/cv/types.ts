/**
 * The shape of a generated CV.
 *
 * This is deliberately a description of the source document's layout rather
 * than a description of a career. The model fills in a title, a right-hand
 * title, a subtitle, a right-hand subtitle and some bullets, and the renderers
 * put each of those in the place the template puts them. Nothing downstream has
 * to know whether a given entry is a degree, a job or a certificate.
 *
 * That is what lets one entry type carry all of these:
 *
 *   title / titleRight       Nigerian Law School     Abuja, Nigeria
 *   subtitle / subtitleRight Barrister-at-Law (B.L)  April - December 2025
 *   detail                   Called to the Nigerian Bar, July 2026
 *
 *   title / titleRight       Legal Extern            September - October 2025
 *   subtitle                 Chidi Anyaoku (SAN) & Associates | Abuja, Nigeria
 *   bullets                  Conducted legal research across 2 active matters...
 */

/* Sizes below are FONT_SIZE in ./template.ts, which caps every run of text on
   the page at 9.5pt. Hierarchy is carried by weight, case and italic, not size. */
export type CVEntry = {
  /** Bold, flush left. The institution, employer or role. */
  title: string
  /** Bold, hard right. A location or a date range. */
  titleRight?: string
  /** Italic, flush left. The qualification, or "Employer | Location". */
  subtitle?: string
  /** Italic, hard right. Usually the date range when the bold line holds a place. */
  subtitleRight?: string
  /** Regular. A single trailing line, such as a call to bar or a thesis title. */
  detail?: string
  bullets?: string[]
}

export type CVSection =
  /** A run of prose with no entries. The professional summary. */
  | { kind: 'prose'; heading: string; body: string }
  /** The usual case: education, certifications, jobs, projects, leadership. */
  | { kind: 'entries'; heading: string; entries: CVEntry[] }
  /** Labelled comma lists. "Legal Skills:", "Technical:", "Soft Skills:". */
  | { kind: 'grouped'; heading: string; groups: { label: string; items: string }[] }

export type ContactItem = {
  text: string
  /** Present only where the source had a hyperlink, e.g. LinkedIn. */
  href?: string
}

export type GeneratedCV = {
  name: string
  contact: ContactItem[]
  sections: CVSection[]
}

/**
 * What the model returns alongside the document.
 *
 * `changes` exists because a user who has just read a review needs to see that
 * the generator acted on it. Without that, a regenerated CV is a black box and
 * the natural reaction is to distrust it and go back to the original.
 */
export type GenerateResponse = {
  cv: GeneratedCV
  changes: string[]
  /** Anything the model wanted to add but had no evidence for. */
  gaps: string[]
}

export function isGeneratedCV(v: any): v is GeneratedCV {
  return (
    !!v &&
    typeof v.name === 'string' &&
    v.name.trim().length > 0 &&
    Array.isArray(v.contact) &&
    Array.isArray(v.sections) &&
    v.sections.length > 0
  )
}
