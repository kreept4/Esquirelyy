/**
 * Words in the body of a letter.
 *
 * ⚠ ITS OWN FILE RATHER THAN A FUNCTION IN prompt.ts, AND THE REASON IS THE
 * CLIENT BUNDLE. The tool page shows the count next to the draft and the route
 * enforces it, so both need this. prompt.ts is about thirty kilobytes of
 * instruction strings; importing it from a 'use client' component would ship
 * every word of our prompt to the browser, where anyone can read it, to get one
 * five line counter.
 *
 * THE SALUTATION AND SIGN OFF ARE EXCLUDED because the ceiling is about what
 * the recruiter reads, and "Dear Hiring Manager" and "Yours faithfully, Adaeze
 * Nwosu" are fixed overhead a candidate cannot cut. Counting them would mean a
 * candidate with a long name gets a shorter letter.
 *
 * ⚠ MATCHED BY SHAPE, NOT BY EXACT STRING. The prompt asks for "Dear ..." and
 * one of two sign offs, but a draft occasionally opens "Dear Sir or Madam" or
 * closes with the name on the same line as "Yours sincerely". The patterns are
 * deliberately loose, and where they miss, the count comes out slightly high,
 * which fails safe: the route's trim threshold sits above the ceiling precisely
 * so a mismeasured letter is not cut for nothing.
 */

/** The ceiling, in words, on the body of the letter. Shown in the UI, enforced
 *  in the route, and stated in the prompt. One number, named once. */
export const WORD_CEILING = 200

export function countBodyWords(letter: string): number {
  const lines = letter.split('\n')

  const salutation = lines.findIndex(l => /^\s*dear\b/i.test(l))
  const signoff = lines.findIndex(l => /^\s*yours\s+(sincerely|faithfully)\b/i.test(l))

  const from = salutation >= 0 ? salutation + 1 : 0
  const to = signoff >= 0 ? signoff : lines.length

  return lines
    .slice(from, to)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}
