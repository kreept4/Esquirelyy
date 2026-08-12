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
 * ⚠ THIS LIST GROWS. IT MUST NOT SHRINK.
 *
 * Removing a slug from here un-publishes a URL that is by then sitting in
 * Google's and Bing's indexes, in the sitemap, and in whatever links people
 * have shared. The searcher who clicks it lands on a login page, which is worse
 * for us than never having ranked at all. If a role genuinely has to come down,
 * delete the listing so the page 404s honestly — a 404 is a clean signal and a
 * gate is not.
 *
 * That is also why this is deliberately NOT derived from NEW_ROLES.slugs even
 * though the two hold the same five today. The drop is an announcement and is
 * meant to be replaced wholesale next time; this is a publishing commitment and
 * is meant to accumulate. Wiring one to the other would mean the next drop
 * quietly revoked the last one's SEO.
 */

const OPEN_JOB_SLUGS = new Set<string>([
  /* Opened 2026-08-12: the five most recent roles on the board at that date.
     The four from 10 August, plus Abe & Asotie from the 8th, which had never
     been announced and is the one genuine public-interest entry point here. */
  'ovie-obobolo-associate',
  'pentagon-partners-associate-grc',
  'zyph-legal-legal-associate',
  'babalakin-senior-associate-energy',
  'abe-asotie-lawyer-legal-aid',
  /* Opened 2026-08-12 for a different reason from the five above, and it is
     worth writing down because it is not an SEO decision.

     The deadline reminder went to all 69 members that morning. Its main button
     goes straight to the World Bank's own requisition, so the application does
     not depend on us. But the message also links here for the full eligibility
     list, and a member opening that on a phone they are not signed in on would
     have been handed a login page on the day the thing closed. You do not send
     somebody a link and then ask them to prove who they are to read it.

     The role closes today, so this earns nothing in search. It stays on the
     list anyway: the rule above is that this set does not shrink, and 69 people
     hold the URL. */
  'world-bank-pioneers-legal-internship-2026',
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
