/**
 * The shape of a cover letter as a document, and the parser that gets there
 * from the flat string the model returns.
 *
 * WHY A MODEL AND NOT JUST THE STRING
 *
 * The PDF and the DOCX renderers both need to know which line is the
 * salutation, which block is the body, and where the sign off starts, because
 * all three are set differently: the salutation and the recipient block sit
 * flush left with no indent, the body paragraphs are justified with a first
 * line indent, and the sign off is flush left again with the space above it
 * that a signature needs. Handing each renderer the raw string would mean
 * writing that parsing twice and having them disagree the first time somebody
 * changed the prompt.
 *
 * ⚠ THE PARSER IS DELIBERATELY FORGIVING. It is reading model output, which is
 * shaped by a prompt rather than by a schema, and a letter that fails to export
 * because the model wrote "Dear Sir or Madam" instead of "Dear Hiring Manager"
 * would be a worse bug than a slightly wrong indent. Every branch below has a
 * fallback that still produces a usable document.
 *
 * THE LAYOUT IS TAKEN FROM A REAL LETTER, not invented. See lib/cover-letter/
 * pdf.ts for the measurements and where they came from.
 */

export type LetterDoc = {
  /** Letterhead. Name is the only one that is really required. */
  name: string
  email?: string
  phone?: string
  location?: string
  /** Rendered as a real hyperlink in both formats, not as raw URL text. */
  linkedin?: string

  /** Recipient block under the salutation. Both optional. */
  employer?: string
  employerLocation?: string

  /** "Dear Hiring Manager," including the comma. */
  salutation: string
  /** Body paragraphs, already split, no blank entries. */
  paragraphs: string[]
  /** "Yours faithfully," or "Yours sincerely,". */
  signOff: string
  /** The name as typed under the sign off, which may carry a suffix. */
  signature: string
}

const SALUTATION = /^\s*(dear\b|to whom it may concern)/i
const SIGN_OFF = /^\s*(yours (faithfully|sincerely|truly)|sincerely|kind regards|best regards|regards|respectfully)\s*,?\s*$/i

/**
 * Split the model's letter into its parts.
 *
 * `fallbackName` is used when the letter has no signature line of its own,
 * which happens when the candidate gave no name: the prompt then writes the
 * letter without one rather than inventing it, and the letterhead is the only
 * place a name appears.
 */
export function parseLetter(
  letter: string,
  fallbackName = ''
): { salutation: string; paragraphs: string[]; signOff: string; signature: string } {
  const lines = letter.replace(/\r\n/g, '\n').split('\n')

  let salutation = ''
  let signOff = ''
  let signature = ''

  /* The salutation is the first non-empty line that looks like one. Scanning
     rather than taking line zero because models occasionally emit a subject
     line above it despite being told not to, and swallowing that into the body
     is tidier than printing "Subject: ..." as the greeting. */
  let start = 0
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    if (SALUTATION.test(lines[i])) {
      salutation = lines[i].trim()
      start = i + 1
      break
    }
    /* First real line and it is not a salutation: treat everything as body and
       supply a neutral greeting rather than dropping the reader straight into
       prose. */
    if (i > 2) break
  }
  if (!salutation) salutation = 'Dear Hiring Manager,'

  /* The sign off is the LAST matching line, searched from the end. Searched
     backwards because "Regards" can legitimately appear inside a sentence and
     the closing one is the one that matters. */
  let end = lines.length
  for (let i = lines.length - 1; i >= start; i--) {
    if (!lines[i].trim()) continue
    if (SIGN_OFF.test(lines[i])) {
      signOff = lines[i].trim()
      /* Whatever non-empty lines follow the sign off are the signature. */
      signature = lines.slice(i + 1).map(l => l.trim()).filter(Boolean).join(' ')
      end = i
      break
    }
  }
  if (!signOff) signOff = /dear (sir|madam|hiring manager)/i.test(salutation)
    ? 'Yours faithfully,'
    : 'Yours sincerely,'
  if (!signature) signature = fallbackName

  const paragraphs = lines
    .slice(start, end)
    .map(l => l.trim())
    .filter(Boolean)

  return { salutation, paragraphs, signOff, signature }
}

/**
 * Normalise whatever the candidate typed into the LinkedIn box.
 *
 * People paste all of these: a full https URL, a bare linkedin.com/in/slug, a
 * www. prefix, or just their handle. All four need to become a working href,
 * because a letterhead link that 404s is worse than no link. Returns the href
 * and the short label to print, which is never the raw URL: "linkedin.com/in/
 * boluwatife-ogunleye" reads as a letterhead, the full https string does not.
 */
export function normaliseLinkedIn(raw?: string): { href: string; label: string } | null {
  const v = (raw || '').trim()
  if (!v) return null

  let slug = v
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^[a-z]{2,3}\.linkedin\.com\//i, 'linkedin.com/')
    .replace(/^linkedin\.com\//i, '')
    .replace(/^in\//i, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '')
    .trim()

  if (!slug) return null
  /* A pasted company or post URL keeps its path; a bare handle gets /in/. */
  const path = /^(company|school|showcase)\//i.test(slug) ? slug : `in/${slug}`
  return {
    href: `https://www.linkedin.com/${path}`,
    label: `linkedin.com/${path}`,
  }
}

/** Build the full document from the tool's own state. */
export function buildLetterDoc(input: {
  letter: string
  name?: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  employer?: string
  employerLocation?: string
}): LetterDoc {
  const name = (input.name || '').trim()
  const parsed = parseLetter(input.letter, name)
  return {
    name: name || parsed.signature || 'Cover letter',
    email: (input.email || '').trim() || undefined,
    phone: (input.phone || '').trim() || undefined,
    location: (input.location || '').trim() || undefined,
    linkedin: (input.linkedin || '').trim() || undefined,
    employer: (input.employer || '').trim() || undefined,
    employerLocation: (input.employerLocation || '').trim() || undefined,
    ...parsed,
  }
}

/**
 * The download filename, without extension.
 *
 * Modelled on the file this template came from, "Boluwatife Ogunleye (Cover
 * Letter) ANDI DAZE LEGAL", because that name sorts and searches well in a
 * downloads folder full of applications: the candidate first, what it is
 * second, who it is for last.
 */
export function letterFileStem(doc: LetterDoc): string {
  const clean = (s: string) => s.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim()
  const who = clean(doc.name) || 'Cover Letter'
  const firm = doc.employer ? clean(doc.employer).toUpperCase() : ''
  return firm ? `${who} (Cover Letter) ${firm}` : `${who} (Cover Letter)`
}
