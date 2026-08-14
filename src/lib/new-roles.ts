/**
 * The current roles drop, named in one place.
 *
 * Four surfaces announce the same openings: the notification bell, the news
 * carousel, the modal behind the bell and the email. Each of them would
 * otherwise carry its own copy of the slugs, the count and the wording, and the
 * failure mode of that is not a crash. It is a carousel slide promising three
 * roles while the board filters to four, weeks after anybody remembers which
 * file is right.
 *
 * WHY SLUGS AND NOT A DATE WINDOW. "Everything added in the last seven days"
 * looks tidier and quietly changes meaning every day it is left alone: the
 * email says two roles, the reader opens it on Friday, and the link now shows
 * four or none. A named list says the same thing forever, which is what an
 * announcement has to do.
 *
 * ⚠ THE PROSE LIVES WITH THE SLUG IT DESCRIBES. This used to be three parallel
 * lists, `slugs` and `employers` here and a hand-written summary sentence in
 * NotificationBell, and they drifted exactly as you would expect: Ovie Obobolo
 * was on the board and in the ball pit from 10 August but was never added here,
 * so every surface counted three roles while four had gone up, and the bell's
 * summary described three seats that did not include theirs. One entry per role
 * now, with its own line, and `slugs`, `employers` and the count all derived. A
 * role cannot be added to the drop without its own sentence coming with it.
 *
 * Replacing the `roles` array is the whole of announcing the next drop. Bump
 * `id`, since that is what decides whether somebody has already dismissed it.
 */

/**
 * One entry per role.
 *
 * `line` is FACTS, IN THE ORDER SOMEBODY DECIDES BY: where, what level, what
 * work, how to apply, when it closes. An earlier version of these editorialised
 * instead, on the theory that a description should sell the role. It said a seat
 * meant "running matters rather than supporting them", which is a flourish, and
 * it took the space where the reader was looking for a location and a deadline.
 *
 * `short` is the same role in a clause, for the bell, where four full lines
 * would not fit. Both are written out rather than one being trimmed from the
 * other, because a truncated sentence loses the deadline first.
 *
 * The test for anything on this list: could a reader act on it without opening
 * the board.
 */
export const ROLE_ENTRIES = [
  {
    slug: 'olajide-oyewole-associate-dispute-resolution-abuja',
    /* The firm signs its own vacancies "Olajide Oyewole LLP" and the network it
       belongs to is named in the same breath because most readers know it by
       the second name. Not "DLA Piper Africa" alone: the member firms are
       separate legal persons from DLA Piper, so naming only the network would
       tell somebody they were applying to a firm they are not applying to. */
    employer: 'Olajide Oyewole LLP (DLA Piper Africa)',
    /* The same firm without the network in brackets, for the bell's detail
       line. That row is one line of small type under the title and the full
       string pushed it to three; the bracket is worth its space in an email and
       is not worth it there. */
    employerShort: 'Olajide Oyewole LLP',
    title: 'Associate, Dispute Resolution',
    line: 'Abuja, at three to five years post-qualification experience. Commercial litigation, arbitration, mediation, employment disputes and debt recovery. Apply by email to careers@oo.dlapiperafrica.com. Closes 13 November.',
    short: 'an Abuja dispute resolution seat at three to five years PQE',
    /* Two sentences, not one with the network in an appositive. It read
       "Olajide Oyewole LLP, the DLA Piper Africa firm in Nigeria, want a
       dispute resolution associate" — and a singular appositive ("firm")
       wedged between a plural subject and "want" is the kind of sentence you
       have to read twice. The house voice takes a firm as plural throughout
       ("Zyph Legal are hiring", "Babalakin & Co want"), so the fix is to move
       the network out to its own clause rather than to switch number midway. */
    blurb:
      'Olajide Oyewole LLP, the DLA Piper Africa member firm in Nigeria, are hiring a dispute resolution associate in Abuja at three to five years PQE. It closes on 13 November.',
  },
  {
    slug: 'kbo-junior-associate-yaba',
    employer: 'Kehinde Babatola Olofinmoyo LP',
    employerShort: 'Kehinde Babatola Olofinmoyo LP',
    title: 'Junior Associate (Post-NYSC)',
    /* "Post-NYSC" is quoted, not converted to "post call". They are different
       claims — you can finish service without having been called — and the
       flier does not say which the firm means. */
    line: 'Yaba, Lagos, full time, open to candidates who have finished NYSC. Litigation and corporate practice. Send an application to kbolegalpractitioners@gmail.com. No closing date stated.',
    short: 'a Yaba junior associate seat open post-NYSC',
    blurb:
      'Kehinde Babatola Olofinmoyo LP are hiring a junior associate in Yaba, Lagos, open to anyone who has finished NYSC.',
  },
] as const

export const NEW_ROLES = {
  /** Changing this makes the notification unread again for everybody, which is
   *  correct when the drop itself changes: this is a new drop entirely, so
   *  somebody who read the 10 August note has not seen this one. */
  id: 'roles-2026-08-14',
  /** ISO. Sorts the notification and dates the carousel slide. */
  at: '2026-08-14T09:00:00.000Z',
  slugs: ROLE_ENTRIES.map(r => r.slug),
  employers: ROLE_ENTRIES.map(r => r.employer),
  /** The same firms without the parenthetical network names. Read by the bell. */
  employersShort: ROLE_ENTRIES.map(r => r.employerShort),
} as const

/* THE ANNOUNCEMENT EMAIL IS NOT RETROACTIVE, and that is fine. Each send bakes
   the slugs of its own drop into the button's URL, so a recipient opening a
   message from a fortnight ago still lands on exactly the roles they were
   promised rather than on whatever is current. Editing this constant does not
   and cannot rewrite a message already in somebody's inbox — which is the
   argument for getting it right before pressing send, not after. */

/* Annotated `number` on purpose. ROLE_ENTRIES is `as const`, so without this
   TypeScript narrows the length to the literal 2 and then rejects every
   `count === 1` branch below as a comparison with no overlap — which is true of
   today's drop and false of the next one. The literal type describes this
   week's data, not the shape of the constant, and the whole point of these
   helpers is that the count changes when the array is replaced. */
export const NEW_ROLES_COUNT: number = ROLE_ENTRIES.length

/**
 * "2 new roles", "1 new role".
 *
 * Four surfaces printed `${NEW_ROLES_COUNT} new roles` with the plural welded
 * on, which is right for every drop that has actually gone out and wrong the
 * first time a single role goes up alone — and that failure would appear in the
 * bell, the modal, the carousel and the subject line of an email simultaneously,
 * which is not somewhere you want to discover a grammar bug. Derived once here
 * instead.
 */
export function roleCountLabel(): string {
  return `${NEW_ROLES_COUNT} new role${NEW_ROLES_COUNT === 1 ? '' : 's'}`
}

/** The board, filtered to exactly these listings. Read by JobsClient. */
export const NEW_ROLES_HREF = `/jobs?roles=${NEW_ROLES.slugs.join(',')}`

/**
 * The employers, as a sentence. "A, B, C and D".
 *
 * Written here rather than at each call site because two of them were building
 * it inline with slice(0, -1) and an index, which reads as an off-by-one waiting
 * to happen and produced "Zyph Legal and and Pentagon Partners" the first time
 * the list had one entry.
 */
export function employerSentence(): string {
  const names = [...NEW_ROLES.employers]
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/**
 * The same sentence, with the short firm names. "A, B, C and D".
 *
 * For the places where the full name's parenthetical network would not fit — an
 * email headline set at 26px, a subject line cut off at 70 characters. The
 * announcement email built this inline as `employersShort.join(' and ')`, which
 * is right for a drop of two and produces "A and B and C" for a drop of three,
 * i.e. the exact off-by-one the function above exists to prevent. It was the
 * same bug in the same file, avoided in one place and rewritten in the other.
 */
export function employerSentenceShort(): string {
  const names = [...NEW_ROLES.employersShort]
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/**
 * The roles as one clause list, for the bell.
 *
 * Oxford-comma-free and deliberately not ending in a full stop, so the caller
 * decides how the sentence finishes.
 */
export function roleSummary(): string {
  const parts = ROLE_ENTRIES.map(r => r.short)
  if (parts.length <= 1) return parts[0] ?? ''
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

/**
 * The whole carousel summary: one sentence per role, then the provenance line.
 *
 * WHY THE PROVENANCE LINE IS COUNTED RATHER THAN TYPED. It read "All three
 * checked against the employer's own notice" on a slide whose title said four,
 * because the number was written into the string. "Both" has the same problem
 * one drop later, and the failure is quiet: the sentence still parses, it is
 * just false. Counting it means the claim can only ever describe the roles
 * actually in the drop.
 */
export function carouselSummary(): string {
  return `${ROLE_ENTRIES.map(r => r.blurb).join(' ')} ${checkedSentence()}`
}

/**
 * The provenance line, as a complete sentence.
 *
 * It was "Both checked against the employer's own notice" — an elliptical
 * clause missing its verb, and a singular possessive describing two employers.
 * Both halves are counted now: the subject and verb come from dropSubject and
 * dropVerb, and the possessive is "each employer's" whenever there is more than
 * one firm in the drop, because two firms do not share one notice.
 */
export function checkedSentence(): string {
  return `${dropSubject()} ${dropVerb()} checked against ${noticePhrase()}.`
}

/**
 * "the employer’s own notice" / "the employers’ own notices".
 *
 * Plural possessive above one, not the distributive "each employer’s own
 * notice". Both are defensible in isolation, but the subject in front of this
 * is "Both" or "All three" — a plural — and pairing a plural subject with a
 * distributive singular gives you "Both were read off each employer's own
 * notice", which is the sort of sentence that is not quite wrong and reads like
 * it was assembled rather than written. Two firms have two notices, so say two.
 */
export function noticePhrase(): string {
  return NEW_ROLES_COUNT === 1 ? 'the employer’s own notice' : 'the employers’ own notices'
}

/**
 * The seats, as a complete sentence.
 *
 * roleSummary() returns a bare clause list — "an Abuja dispute resolution seat
 * ... and a Yaba junior associate seat ..." — which the drop modal printed with
 * a full stop on the end and nothing else. That is a fragment: no verb, and a
 * lower-case opening. It needs a lead-in, and "What is open:" is the one that
 * works at any count and does not repeat "board" from the title above it or
 * "seat" from the clauses after it.
 */
export function seatsSentence(): string {
  return `What is open: ${roleSummary()}.`
}

/**
 * "X and Y are hiring."
 *
 * Always plural, including when the drop holds one firm. That is the house
 * voice and it is consistent across the site — "Zyph Legal are hiring",
 * "Pentagon Partners are taking associates" — so this deliberately does NOT
 * branch on the count. British usage takes an organisation as a collective.
 */
export function hiringSentence(): string {
  return `${employerSentence()} are hiring.`
}

/**
 * The subject of a sentence about the whole drop: "It", "Both", "All three".
 *
 * Small, and it exists because the same hardcoded word was sitting in two
 * places — "All three checked against the employer's own notice" on the
 * carousel and "Both were read off the firms' own notices" in the email — and
 * the carousel's was already wrong by one when this was written. A number
 * spelled out in prose is still a number that has to be kept in step with the
 * array it describes.
 *
 * Spelled rather than numeric above two, because "All 4 were read off" reads as
 * a spreadsheet and this is a sentence.
 */
const SPELLED = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
export function dropSubject(): string {
  const n = NEW_ROLES_COUNT
  if (n === 1) return 'It'
  if (n === 2) return 'Both'
  return `All ${SPELLED[n] ?? n}`
}

/** The verb to follow dropSubject(). "was" for one, "were" for the rest. */
export function dropVerb(): string {
  return NEW_ROLES_COUNT === 1 ? 'was' : 'were'
}
