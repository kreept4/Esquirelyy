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
  /** Changing this makes the notification unread again for everybody. */
  id: 'roles-2026-08-10',
  /** ISO. Sorts the notification and dates the carousel slide. */
  at: '2026-08-10T12:00:00.000Z',
  slugs: ['babalakin-senior-associate-energy', 'zyph-legal-legal-associate'],
  employers: ['Babalakin & Co', 'Zyph Legal'],
} as const

export const NEW_ROLES_COUNT = NEW_ROLES.slugs.length

/** The board, filtered to exactly these listings. Read by JobsClient. */
export const NEW_ROLES_HREF = `/jobs?roles=${NEW_ROLES.slugs.join(',')}`
