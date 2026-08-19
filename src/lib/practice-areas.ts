/**
 * The practice areas the board and the home page questionnaire agree on.
 *
 * ⚠ ONE LIST, BECAUSE THE QUIZ WRITES WHAT THE BOARD READS. The questionnaire
 * pushes to /jobs?practice=…, and the board matches that value against
 * `practice_areas` with exact string equality. If the two files kept their own
 * lists, a rename in one would send every reader who answered that question to
 * an empty board, and nothing would report it: the URL is valid, the filter
 * applies, and the result is zero rows. FirmsClient already keeps a separate
 * PRACTICE_OPTIONS for the directory, which is a different dataset with
 * different tags, and merging the two would be wrong for the same reason.
 *
 * The strings are the ones already stored on `jobs.practice_areas`. They are
 * data, not labels: changing one here without migrating the rows silently
 * empties that filter.
 */

/** Everything currently tagged on a listing. Order is the board's select. */
export const PRACTICE_AREAS = [
  'Corporate & Commercial',
  'Dispute Resolution',
  'Intellectual Property',
  'Banking & Finance',
  'Energy & Natural Resources',
  'Capital Markets',
  'Tax',
  'Arbitration',
  'Technology',
  'Telecommunications',
  'International Law',
  'Policy & Governance',
  'Public Law & Regulatory',
] as const

/**
 * The shortlist the home page questionnaire offers.
 *
 * ⚠ DELIBERATELY NOT THE FULL LIST. The quiz is four taps on a phone before
 * anybody has seen a listing, and thirteen options at that point is a wall
 * rather than a question. These six carry the large majority of what is on the
 * board, and "Any" is first so the reader who does not yet know, which is most
 * law students, is not forced into a choice that narrows their results.
 *
 * Every value here must also appear in PRACTICE_AREAS above, or the quiz will
 * write a filter the board cannot match. The type annotation enforces that at
 * build time rather than leaving it to a comment.
 */
export const QUIZ_PRACTICE_AREAS: readonly (typeof PRACTICE_AREAS)[number][] = [
  'Corporate & Commercial',
  'Dispute Resolution',
  'Intellectual Property',
  'Banking & Finance',
  'Energy & Natural Resources',
  'Tax',
]

/**
 * The options a board select should show, given what is actually listed.
 *
 * Derived rather than fixed, on the same reasoning as the ranking filter in
 * FirmsClient: a select whose options return an empty board reads as a broken
 * filter rather than as an unpopulated one. An area nobody is hiring in simply
 * does not appear until somebody is.
 *
 * The incoming `active` value is always kept even when nothing matches it, so a
 * shared link like /jobs?practice=Tax still shows Tax in the select and can be
 * cleared, instead of the control silently disagreeing with the URL.
 */
export function practiceOptionsFor(
  listings: Array<{ practice_areas?: string[] | null }>,
  active?: string
): string[] {
  const present = new Set<string>()
  for (const l of listings) {
    for (const a of l.practice_areas || []) present.add(a)
  }
  if (active) present.add(active)
  return PRACTICE_AREAS.filter(a => present.has(a))
}
