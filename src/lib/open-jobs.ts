/**
 * The roles a signed-out reader — and therefore a crawler — can actually read.
 *
 * This is the jobs board's answer to `isPubliclyReadable` in firms-data.ts, and
 * it exists for the same reason that one does. The gate in middleware.ts is a
 * path-level yes or no, and "most of the board is private but these five are
 * not" is not a question a path can answer. So /jobs and /jobs/[slug] are open
 * at the middleware layer and the decision about what a stranger sees is made
 * in the pages themselves, reading this file.
 *
 * WHY A NAMED LIST AND NOT "THE FIVE MOST RECENT". Same argument as
 * lib/new-roles.ts, and it matters more here. A rolling window silently changes
 * which URLs are public every time a role is added, so a page Google crawled on
 * Tuesday answers its crawler a 307 to /auth/login on Friday. That is the exact
 * pattern that teaches a search engine to stop trusting a host, and nothing in
 * the app would report it. A named list changes only when somebody edits this
 * file.
 *
 * ⚠ THE WINDOW IS A NAMED HANDFUL OF THE MOST RECENT LISTINGS. Everything else
 * on the board asks for an account.
 *
 * IT WAS "THE SEVEN MOST RECENTLY ADDED" AND THAT SENTENCE STOPPED BEING TRUE
 * WITHOUT ANYBODY EDITING IT, which is worth more than the tidiness it bought.
 * Two rows went onto the board after it was written and neither was reflected
 * here: the B.F.A. & Co intellectual property seat on 17 August and the
 * Jackson, Etti & Edu graduate programme on 21 August. Both are listed now. A
 * count in a comment is a fact about one afternoon; the rule is not.
 *
 * ⚠ NOTHING ROLLED OFF TO MAKE ROOM FOR THE 21 AUGUST ENTRY, deliberately.
 * The "next one on, oldest one off" habit reads as housekeeping and is not:
 * every slug it drops is a URL that stops being publicly readable, which is the
 * thing the paragraphs below spend their length warning about. There is no
 * ceiling here that adding a ninth breaches, and the cost of keeping the eighth
 * public is nil. If this list ever genuinely needs to shrink, it should shrink
 * because a role closed, not because a newer one arrived.
 *
 * This file used to say the opposite — "THIS LIST GROWS, IT MUST NOT SHRINK" —
 * on the reasoning that removing a slug un-publishes a URL already sitting in
 * Google's index and hands the searcher who clicks it a login page. That
 * reasoning is still correct and it is the reason the rule below exists. The
 * decision it was serving is what changed: the board is a members' product, and
 * the seven newest roles are the shop window rather than the shop.
 *
 * SO THE ONE RULE THAT SURVIVES IS ABOUT WHAT A REMOVED URL DOES NEXT. A slug
 * taken out of this set must not start answering a crawler with a redirect to
 * /auth/login, because that is the pattern that teaches a search engine to stop
 * trusting a host. When a listing rolls out of the seven it stops being
 * indexable — jobs/[slug]/page.tsx sets robots noindex for anything not in this
 * set — so it leaves the index by the front door instead of turning into a
 * redirect. Check that behaviour before changing this list, not after.
 *
 * Nothing has been un-published to get here. Of the thirteen slugs removed on
 * 14 August, twelve had never been public at all, and the thirteenth is the
 * World Bank internship whose row is deleted, so its URL was already gone.
 *
 * ⚠ WHAT A CRAWLER SEES ON THESE SEVEN IS THE DESCRIPTION, NOT THE WAY IN.
 * The role, the firm, the location and the requirements are readable by anyone.
 * The apply route — the URL or the address the application actually goes to —
 * is behind the account. See the note on `canApply` below.
 *
 * This is deliberately NOT derived from NEW_ROLES.slugs, even though the drop's
 * two roles are the top two of the seven today. The drop is an announcement and
 * is meant to be replaced wholesale next time; this is a publishing window and
 * turns over on its own schedule. Wiring one to the other would mean announcing
 * two roles silently un-published the five under them.
 */

/**
 * The seven, newest first, as `created_at` orders them on the board.
 *
 * KEPT IN THAT ORDER ON PURPOSE, even though a Set does not care. This list is
 * a window over a sorted board, so the next role added goes on the top and the
 * bottom one comes off. Written in any other order that operation stops being
 * obvious and the window quietly stops being the newest seven.
 *
 * Verified against the board on 14 August 2026: these are exactly the seven
 * most recent rows by `created_at`, and there are twenty rows in total, so
 * thirteen listings ask for an account.
 */
const OPEN_JOB_SLUGS = new Set<string>([
  /* 21 August, and the current drop.
     ⚠ OPEN FOR THE SAME REASON LBVIP IS, WHICH IS THE ANNOUNCEMENT EMAIL. The
     new-roles broadcast points every recipient at /jobs?roles=<this slug>, and
     that URL renders openJobs() for anybody without a session. A slug outside
     this set would therefore send ninety members to an empty board, or to
     /auth/login if they tapped through to the role, and a good number of them
     open mail on a phone they have never signed in on. Seven days before the
     deadline is not the week to make somebody remember a password.
     Also the least gated thing on the board on its own merits: the firm put the
     flier out publicly with a QR code on it. */
  'jee-graduate-recruitment-development-program-2026',

  /* 17 August. Added 21 August, later than it should have been.
     It went onto the board on the 17th and was never listed here, so for four
     days it was newer than six of the slugs below and was the only recent role
     a stranger could not read. Nothing decided that; it was simply missed, which
     is the failure mode a named list has instead of a rolling window. The
     window's own header now says so rather than claiming a count. */
  'bfa-intellectual-property-lawyer',

  // 14 August.
  'kbo-junior-associate-yaba',
  'olajide-oyewole-associate-dispute-resolution-abuja',
  // 10 August.
  'ovie-obobolo-associate',
  'pentagon-partners-associate-grc',
  'babalakin-senior-associate-energy',
  'zyph-legal-legal-associate',
  // 8 August.
  'abe-asotie-lawyer-legal-aid',

  /* 17 August, and the first opportunity rather than a job.
     ⚠ OPEN DELIBERATELY, AND IT HAS TO BE. The announcement email sent to
     members links here rather than straight to the firm's Google Form, so that
     the full details and the three steps are read on the platform first. A slug
     outside this set redirects a signed-out reader to /auth/login, which would
     turn that email into a login wall days before the deadline, and it
     goes to ninety people, some of whom will open it on a device they have
     never signed in on.
     It is also the one listing here that is genuinely a public announcement:
     the firm published it on Instagram to anyone who cared to look, so gating
     it would be withholding something that is not ours to withhold. */
  'lbvip-5-0-lekan-bamidele-virtual-internship-programme',
])

/** Whether a signed-out reader may read this listing in full. */
export function isOpenJob(slug?: string | null): boolean {
  return !!slug && OPEN_JOB_SLUGS.has(slug)
}

/**
 * The open listings, in the order the board holds them.
 *
 * Takes the rows rather than returning slugs so that callers cannot invent a
 * listing that is named here but no longer in the database. A slug left behind
 * after a role is deleted produces nothing, rather than a sitemap entry
 * pointing at a 404.
 */
export function openJobs<T extends { slug: string }>(jobs: T[]): T[] {
  return jobs.filter(j => isOpenJob(j.slug))
}

/** The board, pinned to the open set. This is where "Browse Opportunities"
 *  sends a signed-out visitor, and what the sitemap lists as the board URL. */
export const OPEN_JOBS_HREF = '/jobs'
