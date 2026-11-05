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
  /* THE 5 NOVEMBER DROP: STREN & BLAN'S 2027 NYSC TRAINEE ASSOCIATES AND
     OLANIWUN AJAYI'S BLUE EXPERIENCE OPEN DAY. Both close on 13 November.

     ⚠ AN OPEN DAY IS NOT A ROLE, so DROP_NOUN is 'opportunity' and DROP_ACTION
     'are taking applications' below, for the reason those constants give: the
     subject line must not tell undergraduates that Olaniwun Ajayi are hiring
     them. Stren & Blan's round is a recruitment, and "taking applications" is
     still true of it.

     Stren & Blan leads: it went up first, and both share a closing date.

     STREN & BLAN is one listing, though it is a recruitment round rather than a single seat: the
     flier says "Trainee Associates", plural, and gives no number. It is filed
     as one row because it is one form and one deadline, and the line below says
     seats rather than "a seat" so nobody reads it as a single opening.

     ⚠ IT CLOSES ON 13 NOVEMBER, EIGHT DAYS AFTER THE SEND. The line ends on the
     date for that reason: a reader deciding whether to open the form tonight or
     next week needs it more than anything else on the card.

     Same day the board was cleared of seven rolling fliers from August and early
     September (KBO, B.F.A., Principle, U&P, AVA, Tangerine, Abe & Asotie): none
     carried a closing date and none had a live posting to check, so each is
     delisted with that reason on its row, not deleted. */
  {
    slug: 'stren-blan-trainee-associate-2027-nysc',
    employer: 'Stren & Blan Partners',
    employerShort: 'Stren & Blan',
    title: 'Trainee Associate, 2027 NYSC',
    line: 'Trainee associate seats for the 2027 NYSC year. You need an LL.B at Second Class Upper (2:1) or better. The flier does not name an office; the firm is in Lagos, Abuja and Enugu. Apply through the firm\'s online form. Closes Friday 13 November.',
    short: 'trainee associate seats at Stren & Blan for the 2027 NYSC year',
    blurb:
      'Stren & Blan Partners are recruiting trainee associates for the 2027 NYSC year. They want a 2:1 LL.B, and applications close on 13 November.',
  },
  {
    /* An opportunity, not a jobs row: the slug is opportunitySlug(title) from
       lib/opportunities.ts, which is what /jobs?roles= matches against. */
    slug: 'blue-experience-2-0-olaniwun-ajayi-open-day-2026',
    employer: 'Olaniwun Ajayi LP',
    employerShort: 'Olaniwun Ajayi',
    title: 'Blue Experience 2.0, Open Day 2026',
    line: 'For law undergraduates: a day at the firm\'s Lagos office on Banana Island to meet its lawyers, ask questions and see the firm from the inside. It is in person on Wednesday 25 November. Apply on the firm\'s online form. Applications close 13 November.',
    /* The shorts are written to be joined: roleSummary() lists them in one
       sentence, and this last one closes it. */
    short: 'Olaniwun Ajayi\'s open day for law undergraduates on 25 November, both closing on 13 November',
    blurb:
      'And Olaniwun Ajayi are opening their Banana Island office to law undergraduates for a day on 25 November. Applications for that also close on 13 November.',
  },
] as const

export const NEW_ROLES = {
  /** Changing this makes the notification unread again for everybody, which is
   *  correct when the drop itself changes: this is a new drop entirely, so
   *  somebody who read the 1 September note has not seen this one. */
  id: 'roles-2026-11-05',
  /** ISO. Sorts the notification and dates the carousel slide. */
  at: '2026-11-05T09:00:00.000Z',
  slugs: ROLE_ENTRIES.map(r => r.slug),
  /* ⚠ ONE NAME PER FIRM, NOT PER ROLE. Every consumer of these two joins them
     into a sentence or a row of names, and a drop where one firm posts several
     seats would otherwise print that firm once per seat: the 13 October drop
     would have read "Punuka, Ninewells, Ninewells and Ninewells are hiring".
     First appearance wins, so the order still follows ROLE_ENTRIES. The role
     count does not read these; it reads ROLE_ENTRIES, so four seats at two
     firms are still four. */
  employers: [...new Set<string>(ROLE_ENTRIES.map(r => r.employer))],
  /** The same firms without the parenthetical network names. Read by the bell. */
  employersShort: [...new Set<string>(ROLE_ENTRIES.map(r => r.employerShort))],
} as const

/* THE ANNOUNCEMENT EMAIL IS NOT RETROACTIVE, and that is fine. Each send bakes
   the slugs of its own drop into the button's URL, so a recipient opening a
   message from a fortnight ago still lands on exactly the roles they were
   promised rather than on whatever is current. Editing this constant does not
   and cannot rewrite a message already in somebody's inbox — which is the
   argument for getting it right before pressing send, not after. */

/* Annotated `number` on purpose. ROLE_ENTRIES is `as const`, so without this
   TypeScript narrows the length to a literal and then rejects every branch
   below that compares against a different one, as a comparison with no
   overlap. It bit at 2, where `count === 1` was the dead branch; this drop is
   1, so it is now every `!== 1` branch that would go. The literal type
   describes this week's data, not the shape of the constant, and the whole
   point of these helpers is that the count changes when the array is replaced. */
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
/**
 * ⚠ THE NOUN IS PART OF THE DROP, AND IT USED TO BE WELDED TO "role".
 *
 * Every drop until now was law firm seats, so "2 new roles" was simply true and
 * the word was hardcoded in two places. This drop is a competition and a
 * virtual internship. Neither is a role, and a competition especially is not:
 * nobody is employed at the end of it by right.
 *
 * Getting that wrong would have been wrong in four places at once, which is the
 * exact failure this file exists to prevent, so the noun is named here beside
 * the slugs rather than assumed downstream. Drops that are genuinely seats set
 * it back to 'role' and every surface follows.
 */
export const DROP_NOUN: string = 'opportunity'

/**
 * The noun, counted. "1 role", "2 roles", "2 opportunities".
 *
 * ⚠ THE PLURAL WAS `${DROP_NOUN}s`, WHICH HOLDS FOR 'role' AND NOTHING ELSE
 * THIS FILE HAS USED. The 5 November drop is the first of two that is not all
 * seats, and the welded-on "s" rendered "2 new opportunitys" in the subject
 * line of the test render. Consonant-y takes -ies; everything else takes -s,
 * which covers every noun a drop has needed so far.
 */
function dropNoun(count: number): string {
  if (count === 1) return DROP_NOUN
  return /[^aeiou]y$/.test(DROP_NOUN) ? `${DROP_NOUN.slice(0, -1)}ies` : `${DROP_NOUN}s`
}

export function roleCountLabel(): string {
  return `${NEW_ROLES_COUNT} new ${dropNoun(NEW_ROLES_COUNT)}`
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
  /* ⚠ ASCII APOSTROPHES, NOT TYPOGRAPHIC ONES. These two strings were the only
     non-ASCII characters in the whole rendered announcement email, and they were
     in the TEXT branch, where there is no entity to hide behind: the HTML branch
     writes &rsquo; and renders correctly everywhere. A U+2019 in a plain text
     part survives a well-behaved client and turns into a black diamond, or into
     the three-character mess a UTF-8 apostrophe makes when it is read back as
     Latin-1, the moment anything in the chain re-encodes it. That is the
     "garbled words" failure lib/house-style.ts bans in its last paragraph.
     Straight quotes cannot garble.

     The rendered email is now clean ASCII in all three of subject, text and
     html, and it is worth keeping it that way: this was the only offender. */
  return NEW_ROLES_COUNT === 1 ? "the employer's own notice" : "the employers' own notices"
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
 * ⚠ WHAT THE DROP IS ACTUALLY DOING, AND IT WAS HARDCODED TO "are hiring".
 *
 * Every drop until now was firm seats, so that was true and the words sat in
 * three places: this sentence, the email headline and the email subject. This
 * drop is a competition and a virtual internship. Neither employer is hiring.
 * Nobody gets a job at the end of the competition by right, and an internship
 * is not a seat either, so telling a hundred and seven people that two firms
 * are hiring would be telling them something that is not true, in the subject
 * line, where it cannot be taken back.
 *
 * "taking applications" is what both are actually doing, and it stays true of
 * real seats, so a drop of firm vacancies can set this back to 'are hiring'
 * for the sharper line or leave it alone and still be correct. Named here
 * beside DROP_NOUN, because a drop should describe itself in one place.
 */
export const DROP_ACTION: string = 'are taking applications'

/**
 * "X and Y are taking applications."
 *
 * ⚠ RENAMED FROM hiringSentence, and the rename is the point rather than
 * tidiness. A function called hiringSentence invites the next person to reach
 * for it on a drop that has nothing to do with hiring, which is exactly how
 * the word survived into a competition announcement in the first place.
 *
 * Always plural, including when the drop holds one firm. That is the house
 * voice and it is consistent across the site, and British usage takes an
 * organisation as a collective.
 */
export function dropSentence(): string {
  return `${employerSentence()} ${DROP_ACTION}.`
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
 * "the application route and any closing date" / "the application routes and
 * any closing date".
 *
 * The provenance sentence in the announcement email had both nouns welded to
 * the plural while its own subject came from dropSubject(), so a drop of one
 * rendered "It was read off the employer's own notice, so the closing dates and
 * the application routes above are the ones they published" — a singular
 * subject governing two plural objects that describe a single role. Exactly the
 * failure dropSubject, dropVerb and noticePhrase were each written to prevent,
 * one clause further along the same sentence.
 *
 * ⚠ "ANY CLOSING DATE", NOT "THE CLOSING DATES". The 13 October drop had four
 * roles and one date: three Ninewells seats each say "No closing date is
 * published" two lines above a sentence that then vouched for their closing
 * dates. The route is always there; the date is not, so the date is the one
 * that gets the hedge.
 */
export function publishedNouns(): string {
  return NEW_ROLES_COUNT === 1
    ? 'the application route and any closing date'
    : 'the application routes and any closing date'
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
  return `Show me the new ${dropNoun(NEW_ROLES_COUNT)}`
}
