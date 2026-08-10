/**
 * The open call to join the team, named in one place.
 *
 * The notification and the About page both say this, and they have to say the
 * same thing. The About block was written as "We are hiring" before anybody
 * said the positions were unpaid, which is the single most important fact about
 * them and the one most easily lost by having the copy in two files.
 *
 * IT SAYS VOLUNTEER, IN THE FIRST SENTENCE, IN BOTH PLACES, and it does not say
 * "unpaid" anywhere. Volunteer is the plain word for this and every reader
 * already knows what it means; adding "unpaid" beside it, which this copy did
 * for a while, reads as bracing for an objection rather than stating the terms.
 * What earns the reader's time is where the word sits, not how many ways it is
 * put. The ambassador page makes the same move with "Paid: No" at the top of
 * the page rather than repeated down it.
 *
 * Bump `id` to make the note unread again after a real change to what is being
 * asked for.
 */

export const TEAM_CALL = {
  id: 'team-call-2026-08-10',
  /** ISO. Sorts the notification. */
  at: '2026-08-10T17:00:00.000Z',
  email: 'careers@esquirely.com.ng',
} as const

/**
 * The mailto, with the subject AND the questions already in the body.
 *
 * A bare mailto opens an empty message, and an empty message to a company
 * address is the point most people close the draft: they came in willing and
 * are now being asked to compose a cover letter from nothing. Pre-filling the
 * three questions turns it into filling in blanks, and it also means the
 * replies arrive in a shape that can be read quickly rather than fifty
 * different essays.
 *
 * The reader can delete every line of it, which is the difference between a
 * prompt and a form.
 */
/* THIS IS AN APPLICATION, NOT A FEEDBACK FORM.
   An earlier version asked what the writer would criticise or throw out. That
   is the firms directory's job, it has its own address for it, and asking here
   turned a job application into a critique with a job attached. Somebody
   writing in wants to join; the questions should be about them. */
const BODY = [
  'Hello Bolu and Ipinu,',
  '',
  'What I do:',
  '',
  'What I would want to build at Esquirely:',
  '',
  'Anything else worth knowing:',
  '',
].join('\n')

export const TEAM_CALL_MAILTO =
  `mailto:${TEAM_CALL.email}` +
  `?subject=${encodeURIComponent('Joining the team')}` +
  `&body=${encodeURIComponent(BODY)}`
