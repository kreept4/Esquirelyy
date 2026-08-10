/**
 * The current roles drop, named in one place.
 *
 * Three surfaces announce the same two openings: the notification bell, the
 * news carousel and the email. Each of them previously would have carried its
 * own copy of the slugs, the count and the wording, and the failure mode of
 * that is not a crash. It is a carousel slide promising three roles while the
 * board filters to two, weeks after anybody remembers which file is right.
 *
 * WHY SLUGS AND NOT A DATE WINDOW. "Everything added in the last seven days"
 * looks tidier and quietly changes meaning every day it is left alone: the
 * email says two roles, the reader opens it on Friday, and the link now shows
 * four or none. A named list says the same thing forever, which is what an
 * announcement has to do.
 *
 * Replacing this constant is the whole of announcing the next drop. Bump
 * `id`, since that is what decides whether somebody has already dismissed it.
 */

export const NEW_ROLES = {
  /** Changing this makes the notification unread again for everybody, which is
   *  correct when the drop itself changes: Greenberg Traurig London joined
   *  after the first four, so somebody who read the old note has not seen
   *  this one. */
  id: 'roles-2026-08-10d',
  /** ISO. Sorts the notification and dates the carousel slide. */
  at: '2026-08-10T17:00:00.000Z',
  slugs: [
    'babalakin-senior-associate-energy',
    'zyph-legal-legal-associate',
    'pentagon-partners-associate-grc',
    'ovie-obobolo-associate',
    'gt-london-training-contract-2029',
  ],
  employers: ['Babalakin & Co', 'Zyph Legal', 'Pentagon Partners', 'Ovie Obobolo & Co', 'Greenberg Traurig London'],
} as const

/* THE ANNOUNCEMENT EMAIL IS NOT RETROACTIVE, and that is fine. It went out
   naming two roles, and its button carries those two slugs in the URL it was
   sent with, so a recipient clicking it still sees exactly what they were
   promised. The site moves on to three; the email stays a record of what was
   true when it was sent. Editing this constant does not and cannot rewrite a
   message already in somebody's inbox. */

export const NEW_ROLES_COUNT = NEW_ROLES.slugs.length

/** The board, filtered to exactly these listings. Read by JobsClient. */
export const NEW_ROLES_HREF = `/jobs?roles=${NEW_ROLES.slugs.join(',')}`
