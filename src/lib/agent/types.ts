/**
 * What the agent passes around.
 *
 * These types are the contract between the four halves of the agent — research,
 * obsolescence checking, the proposal store, and Telegram — and they are
 * deliberately narrow. Everything that reaches the database has been through
 * `Candidate`, and everything a person taps a button on has been through
 * `Proposal`.
 */

/** The kinds of thing the agent can ask permission to do. */
export type ProposalKind = 'list' | 'delist' | 'scholarship' | 'email'

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'applied' | 'failed'

/**
 * One page the agent read, and what it took from it.
 *
 * ⚠ EVERY CLAIM IN A PROPOSAL HAS TO POINT AT ONE OF THESE. That rule is the
 * difference between a proposal you can act on in ten seconds and a notification
 * you have to go and verify yourself, which you would not use twice. It is
 * enforced in the research prompt rather than the type system — the model is
 * told that a field it cannot source must be left null — but this is the shape
 * that carries the proof back.
 */
export type Source = {
  url: string
  /** The page title, or the employer's name for it. For the Telegram summary. */
  title: string
  /** When the agent read it. Not when the page was published — it rarely says. */
  readAt: string
  /** The sentence or two the agent actually relied on. Quoted, not paraphrased. */
  quote: string | null
}

/**
 * A role the agent thinks belongs on the board.
 *
 * Field names match the live `jobs` table exactly, so applying an approved
 * proposal is an insert and not a mapping. Verified against production on
 * 15 August 2026: id, slug, title, employer, sector, tier, type, level,
 * location, deadline, is_verified, is_closing_soon, is_rolling, practice_areas,
 * about, role_desc, requirements, apply_email, apply_url, source, created_at,
 * updated_at — plus is_active and friends, added by the 15 August migration.
 */
export type Candidate = {
  slug: string
  title: string
  employer: string
  location: string
  /** ISO date, or null for a rolling or undated posting. */
  deadline: string | null
  type: 'job' | 'internship' | 'clerkship' | 'fellowship' | 'pupillage'
  level: 'student' | 'nysc' | 'junior' | 'mid' | 'senior' | 'partner'
  sector: string | null
  practice_areas: string[]
  about: string | null
  role_desc: string | null
  requirements: string[]
  apply_url: string | null
  apply_email: string | null

  /**
   * Where this came from, as a sentence.
   *
   * ⚠ NOT A MACHINE TAG, because the column is not used as one. Read off
   * production on 15 August, jobs.source holds things like "Olajide Oyewole LLP
   * (DLA Piper Africa) careers page, posted 13 August 2026" and "Kehinde
   * Babatola Olofinmoyo LP recruitment flier". It is a provenance note written
   * for whoever asks, six weeks later, where a listing came from — and it is the
   * field that made the 14 August cull possible, because each row said what
   * could be re-checked.
   *
   * The one exception is the Adzuna crawler, which writes the bare string
   * 'adzuna'. That is the older convention and the reason the delisting checks
   * do not branch on this column.
   */
  source: string
}

/** A scholarship or funding call. Shaped for src/lib/scholarships-data.ts. */
export type ScholarshipCandidate = {
  slug: string
  title: string
  provider: string
  provider_url: string | null
  type: 'full' | 'partial' | 'bursary' | 'prize' | 'grant'
  level: 'undergraduate' | 'postgraduate' | 'llm' | 'phd' | 'bar_course' | 'all'
  location: string | null
  is_international: boolean
  amount_description: string | null
  description: string
  eligibility: string | null
  apply_url: string | null
  deadline: string | null
}

/**
 * The agent's verdict on a listing already on the board.
 *
 * `stillOpen: null` is a real and common answer, and the reason this is not a
 * boolean. A firm that takes its careers page down for a redesign, a posting URL
 * that starts timing out, an employer who never published a deadline — none of
 * those mean the role is closed, and treating "I could not tell" as "closed"
 * would quietly delist half the board the first time a site went down.
 */
export type ObsolescenceVerdict = {
  slug: string
  stillOpen: boolean | null
  /** Written for a person, not a log. This is what the Telegram card shows. */
  reason: string
  confidence: number
  sources: Source[]
}

/** A proposal as stored, with the id the Telegram buttons carry. */
export type Proposal = {
  id: string
  kind: ProposalKind
  status: ProposalStatus
  payload: any
  evidence: { sources?: Source[]; [k: string]: any }
  confidence: number | null
  caveats: string | null
  fingerprint: string
  created_at: string
  telegram_chat_id: number | null
  telegram_message_id: number | null
  error: string | null
}
