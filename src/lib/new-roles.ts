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
    /* ⚠ FIRST BECAUSE IT IS THE ONLY ONE WITH A CLOCK ON IT, not because it
       is the biggest name. The two below are rolling: they close when the firms
       fill them, and a reader who leaves it a fortnight has lost nothing they
       can measure. This one shuts on 4 September, and a reader who leaves it a
       fortnight has lost it outright. The email prints these in array order, so
       array order is a claim about what to read first. */
    slug: 'heirs-holdings-graduate-trainee-programme-2026',
    employer: 'Heirs Holdings',
    employerShort: 'Heirs Holdings',
    title: '2026 Graduate Trainee Programme',
    /* ⚠ THE BARS ARE IN THE LINE, and they are why this one is the longest of
       the three. They are what disqualifies most readers, none of them is
       obvious from the title, and an announcement that omits them sends people
       to a form they were never eligible for.
       "Lawyers can apply" leads because on a legal careers board the first
       question a conglomerate raises is whether it is meant for the reader at
       all, and the post itself never answers it — it says "a Bachelor's degree"
       and names no subject, which reads as a maybe. It is a yes.
       ⚠ AND THE CERTIFICATE IS NAMED, not just the NYSC year. Having finished
       service and being able to produce the discharge or exemption certificate
       are different states, and the second is what the application actually
       needs. Somebody who has to request a replacement will not do it inside
       eleven days, which is exactly why it belongs in an announcement rather
       than at the top of a form. */
    line: 'Lawyers can apply — it is open to any discipline at a 2:2 or better, and an LL.B counts. A six-month graduate traineeship at the investment holding company, pairing Heirs Academy training with live work across the group. Strict bars: NYSC completed WITH the discharge or exemption certificate in hand, no more than two years post-NYSC experience, and 27 or younger at the time of applying. Apply through the link on their posting. Closes 4 September.',
    short: 'a six-month graduate traineeship at Heirs Holdings, open to lawyers',
    blurb:
      'Heirs Holdings are taking applications for their 2026 graduate trainee programme, six months of Heirs Academy training alongside live work across the group. It is open to any discipline at a 2:2 or better, so lawyers can apply. You need your NYSC discharge or exemption certificate in hand, no more than two years post-NYSC experience, and to be 27 or younger. It closes on 4 September.',
  },
  {
    slug: 'principle-legal-consult-junior-associate',
    employer: 'Principle Legal Consult',
    /* Identical. employerShort exists to drop a parenthetical network name and
       this firm has none to drop. */
    employerShort: 'Principle Legal Consult',
    title: 'Junior Associate',
    /* ⚠ "PRINCIPLE", NOT "PRINCIPAL". It is the firm's own spelling of its own
       name, it looks like a typo to every reader who meets it, and it will be
       "corrected" by somebody eventually. It is right as written. */
    /* The experience bar leads, because it is the fact that decides whether the
       reader can apply at all. Rolling: the flier prints no closing date, and
       inventing one to fill the field would be the worst kind of tidy. */
    line: 'Abuja, full time, 2–3 years post-NYSC and preferably from an established firm. Litigation-facing: attending court independently, tracking cases, drafting opinions and agreements, with exposure to matters across Abuja and London. Apply by email to hr@principlelegalconsult.com. No closing date given, so it is open until they fill it.',
    short: 'an Abuja junior associate seat at 2–3 years post-NYSC',
    blurb:
      'Principle Legal Consult are taking a junior associate in Abuja, at 2–3 years post-NYSC, on a litigation-facing seat with work across Abuja and London. No closing date was published.',
  },
  {
    slug: 'uandp-law-multiple-practice-areas',
    /* The full registered name with the trading name after it, because that is
       how the firm signs the post and how a reader will recognise it. "U&P Law"
       alone names nobody outside the firm. */
    employer: 'Uduakabasi & Partners (U&P Law)',
    /* Here the parenthetical IS the recognisable half, so the short form keeps
       it and drops the registered name rather than the other way round. A
       subject line reading "2 new roles: Principle Legal Consult and Uduakabasi
       & Partners" is 68 characters before the parenthetical. */
    employerShort: 'U&P Law',
    title: 'Legal Professionals — Multiple Practice Areas',
    /* ⚠ THE THREE QUESTIONS ARE IN THE LINE, and they are the only reason this
       entry is longer than its sibling. This is an open call with no named
       vacancy, so "what is the job" cannot be answered; what a reader can act on
       instead is exactly what the email has to contain and how to title it.
       An applicant who sends a bare CV to this address has wasted the send. */
    line: 'Nigeria, full time, across corporate governance, commercial transactions, regulatory compliance, energy, technology, investment and business structuring. An open call rather than one named seat. Send a CV and a cover letter to UandPlawfirm@gmail.com saying why you want to join, what you would contribute, and where you see your career in 3–5 years, with the subject “Job Application – [Position/Area of Interest] – [Your Name]”. No closing date given.',
    short: 'an open call across U&P Law’s practice areas, Nigeria-wide',
    blurb:
      'Uduakabasi & Partners (U&P Law) are hiring across multiple practice areas, from corporate governance and commercial transactions to energy and technology. It is an open call rather than one seat, and there is no published closing date.',
  },
] as const

export const NEW_ROLES = {
  /** Changing this makes the notification unread again for everybody, which is
   *  correct when the drop itself changes: this is a new drop entirely, so
   *  somebody who read the 10 August note has not seen this one. */
  id: 'roles-2026-08-24',
  /** ISO. Sorts the notification and dates the carousel slide. */
  at: '2026-08-24T09:00:00.000Z',
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

/**
 * "the closing date and the application route" / "the closing dates and the
 * application routes".
 *
 * The provenance sentence in the announcement email had both nouns welded to
 * the plural while its own subject came from dropSubject(), so a drop of one
 * rendered "It was read off the employer's own notice, so the closing dates and
 * the application routes above are the ones they published" — a singular
 * subject governing two plural objects that describe a single role. Exactly the
 * failure dropSubject, dropVerb and noticePhrase were each written to prevent,
 * one clause further along the same sentence.
 */
export function publishedNouns(): string {
  return NEW_ROLES_COUNT === 1
    ? 'the closing date and the application route'
    : 'the closing dates and the application routes'
}

/** "it" / "them", for a sentence that has already named the drop. */
export function dropPronoun(): string {
  return NEW_ROLES_COUNT === 1 ? 'it' : 'them'
}

/**
 * The button on the announcement email.
 *
 * Hardcoded as "Show me the new roles", which is the one line of the email a
 * reader is most likely to act on and was the last plural left welded on. A
 * drop of one is not a hypothetical: this is what the 21 August drop is.
 */
export function newRolesCta(): string {
  return `Show me the new role${NEW_ROLES_COUNT === 1 ? '' : 's'}`
}
