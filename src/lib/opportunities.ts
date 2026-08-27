import { createClient } from '@supabase/supabase-js'
import { daysUntilDay, hasPassed } from './day'

/**
 * Opportunities, and how they reach the board.
 *
 * ⚠ WHY THIS FILE EXISTS RATHER THAN THE BOARD JUST READING A SECOND TABLE.
 *
 * The ship plan's Phase 0 surfaces opportunities as a "Featured Opportunities
 * section" on /jobs. That alone would have been a bug: a section is a block on
 * the page, and the board's search box and type filter read `jobs`. Somebody
 * typing "internship" — which is the single most likely thing a law student
 * types into a legal careers site — would have got every internship EXCEPT the
 * one with days left on it, because LBVIP is not a jobs row.
 *
 * So an opportunity is adapted into the shape a board row already has, and the
 * board filters it without knowing it came from anywhere else. Nothing in
 * JobsClient's filter had to change to make this work, which is the test of
 * whether an adapter is the right shape: if the consumer needs a special case,
 * the adapter has not finished its job.
 *
 * ============================================================
 * `type` IS DELIBERATELY FLATTENED TO 'internship'
 * ============================================================
 *
 * LBVIP's own type is 'virtual_internship'. The board's type filter offers two
 * options, Full-time and Internship, and matches with exact equality. A row
 * typed 'virtual_internship' would therefore be invisible under the Internship
 * filter — present in the list, filtered out the moment somebody narrows to the
 * category it belongs to, which is the worst of both.
 *
 * The precise kind is not lost: it is kept on `opportunity_type` and is what the
 * detail page prints. The board gets the coarse bucket it filters on, the
 * reader gets the specific word. A webinar or a workshop is NOT an internship
 * and maps to 'job' rather than being forced into the internship bucket — see
 * BOARD_TYPE below.
 *
 * ============================================================
 * SLUGS ARE DERIVED, AND THAT IS A KNOWN COMPROMISE
 * ============================================================
 *
 * The table has no slug column. Rather than another migration round trip, the
 * slug is derived from the title, which is deterministic and gives a readable
 * URL. The cost is that renaming an opportunity changes its URL, and the
 * benefit of a real column is that it would not.
 *
 * That trade is acceptable at one row and would not be at fifty. WHEN A SECOND
 * OPPORTUNITY GOES IN, add a `slug text unique` column and read it here instead
 * — the rest of this file does not change, because everything downstream
 * already goes through `opportunitySlug`.
 */

/** The kinds that genuinely are internships for filtering purposes. */
const INTERNSHIP_KINDS = new Set(['internship', 'virtual_internship'])

/** What the board's type filter should match this on. */
function boardType(opportunityType: string): 'internship' | 'job' {
  return INTERNSHIP_KINDS.has(opportunityType) ? 'internship' : 'job'
}

/** How the specific kind is printed once there is room for it. */
export const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  internship: 'Internship',
  virtual_internship: 'Virtual internship',
  webinar: 'Webinar',
  workshop: 'Workshop',
  event: 'Event',
  job: 'Full-time',
  scholarship: 'Scholarship',
}

export type ApplicationStep = {
  step: number
  title: string
  detail: string
  off_platform?: boolean
}

export type Opportunity = {
  id: string
  title: string
  organization: string
  type: string
  target: string | null
  location: string | null
  deadline: string | null
  link: string
  description: string | null
  status: string
  eligibility: string | null
  application_steps: ApplicationStep[] | null
  /**
   * Both shapes are valid, and the union is not laziness.
   *
   * The original rows stored a bare handle string. That is only enough when the
   * profile URL is https://<host>/<handle>, which holds for Instagram and X and
   * does NOT hold for LinkedIn, whose vanity URL is unrelated to the @name.
   * Templating a URL from the handle therefore produced a 404 for exactly one
   * platform, which is the kind of bug that ships. The object form carries a
   * checked URL alongside the handle; the string form is still read so an older
   * row renders as text rather than blank.
   */
  firm_handles: Record<string, string | { handle: string; url?: string }> | null
  logo_url: string | null
  practice_areas: string[] | null
  source_url: string | null
  created_at: string
}

/**
 * A URL-safe slug for an opportunity.
 *
 * Punctuation is stripped rather than transliterated, so "LBVIP 5.0, Lekan
 * Bamidele Virtual Internship Programme" becomes
 * lbvip-5-0-lekan-bamidele-virtual-internship-programme. Long, and that is
 * correct for a URL somebody will see in an announcement email: it says what it
 * is without being opened.
 */
export function opportunitySlug(o: Pick<Opportunity, 'title'>): string {
  return o.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Adapt an opportunity into the row shape the board renders.
 *
 * Every field the board reads is present, and `is_opportunity` marks the row so
 * the few places that must treat it differently — the apply route, which leaves
 * the platform — can ask rather than infer.
 */
export function toBoardRow(o: Opportunity) {
  return {
    id: o.id,
    slug: opportunitySlug(o),
    title: o.title,
    employer: o.organization,
    /* Every opportunity so far comes from a law firm. When one does not, this
       is the line to revisit; it is not worth a column until then. */
    sector: 'law_firm',
    tier: null,
    type: boardType(o.type),
    /* Null rather than a guess, which the board reads as "open to all levels".
       LBVIP is open to students, graduates and new wigs at once, so any single
       band would hide it from two of the three groups it names. See the note on
       the level filter in JobsClient. */
    level: null,
    location: o.location,
    deadline: o.deadline,
    is_rolling: !o.deadline,
    is_closing_soon: isClosingSoon(o.deadline),
    is_verified: true,
    is_active: true,
    practice_areas: o.practice_areas,
    about: null,
    role_desc: o.description,
    requirements: null,
    apply_email: null,
    apply_url: o.link,
    logo_url: o.logo_url,
    created_at: o.created_at,

    /* Carried through for the detail page and the card. */
    is_opportunity: true as const,
    opportunity_type: o.type,
    eligibility: o.eligibility,
    application_steps: o.application_steps,
    firm_handles: o.firm_handles,
    source_url: o.source_url,
  }
}

/** Within a fortnight, and not already past. */
function isClosingSoon(deadline: string | null): boolean {
  const days = daysUntilDay(deadline)
  return days !== null && days >= 0 && days <= 14
}

/** Whether the closing date has passed. */
export function hasClosed(deadline: string | null): boolean {
  return hasPassed(deadline)
}

/**
 * Whole days until a closing date, or null when there is not one.
 *
 * Lives here rather than on the jobs page because both surfaces need it and a
 * countdown that disagreed with itself between the board and the listing would
 * be worse than no countdown. Negative when the date has passed, so callers can
 * tell "closed" from "closes today" rather than both rendering as zero.
 */
export function daysUntil(deadline: string | null | undefined): number | null {
  /* ⚠ CALENDAR DAYS IN LAGOS, NOT ELAPSED MILLISECONDS. This subtracted two
     instants and ceil'd the result, which is one day too high for the hour
     between 23:00 UTC and midnight, because Nigeria has already turned over and
     UTC has not. Reported 25 August 2026 as Heirs showing eleven days when a
     reader in Lagos counted ten. The whole argument is in lib/day.ts. */
  return daysUntilDay(deadline)
}

/**
 * The words that go with the number.
 *
 * ⚠ THE COUNTDOWN AGREED AND THE COPY DID NOT, which is the same bug daysUntil
 * was written to prevent, one layer up. Three surfaces each phrased the answer
 * their own way, so a listing one day out read as "1 day left" on the board,
 * "Closes tomorrow" in Closing soon, and "1 day left" again on the listing page
 * whose zero case said "Today" rather than "Closes today". Reported 27 August
 * 2026 against JEE, which was showing "1 day left" and "Closes tomorrow" on the
 * same screen. Both were computed from the same integer and a reader has no way
 * to know that; two different sentences about one deadline read as two
 * different deadlines.
 *
 * So the phrasing moves next to the arithmetic and the surfaces stop deciding.
 *
 * "Closes tomorrow" is the one kept for 1, and "1 day left" is the one dropped,
 * because they are not equally clear. A deadline of tomorrow leaves you today
 * AND tomorrow to apply, so "1 day left" invites the reader to subtract a day
 * they still have. A named day cannot be miscounted.
 *
 * Returns null for a missing or past date rather than inventing a phrase for
 * it. Rolling and closed listings are labelled by their callers, which know
 * which of the two they are looking at; this does not.
 */
export function closingLabel(deadline: string | null | undefined): string | null {
  const d = daysUntilDay(deadline)
  if (d === null || d < 0) return null
  if (d === 0) return 'Closes today'
  if (d === 1) return 'Closes tomorrow'
  return `${d} days left`
}

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * The published opportunities, newest first.
 *
 * Reads with the anon key on purpose. The RLS policy on this table admits only
 * status = 'published' to anon, so the gate is enforced by the database rather
 * than by remembering to add a filter here — which is the failure mode the
 * `is_active` note in the agent schema warns about. The explicit .eq below is
 * belt and braces, not the mechanism.
 *
 * Returns [] rather than throwing. An opportunities table that is briefly
 * unreachable should cost the board its featured section, not the whole page.
 */
export async function fetchOpportunities(): Promise<Opportunity[]> {
  const supabase = db()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('status', 'published')
    .order('deadline', { ascending: true, nullsFirst: false })
  if (error) return []
  return (data || []) as Opportunity[]
}
