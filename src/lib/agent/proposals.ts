import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Candidate, Proposal, ProposalKind, ScholarshipCandidate, Source } from './types'

/**
 * The proposal store.
 *
 * Every write the agent wants to make passes through here first as a request,
 * and nothing in this file touches the jobs table. Applying an approved
 * proposal is apply.ts; this is only the record of what was asked and answered.
 *
 * SERVICE ROLE, ALWAYS. agent_proposals has RLS on with no policy, so the anon
 * key cannot see it — see the note in the 15 August migration about why an
 * unapproved listing must not be readable from the front end.
 */

/**
 * ⚠ THE FINGERPRINT IS WHAT STOPS THE AGENT BECOMING UNUSABLE, so it is worth
 * being careful about what goes into it.
 *
 * A sweep runs daily and searches the open web. The same role will be found
 * again tomorrow, and the day after, and on a different site each time. Without
 * a stable identity, a role rejected on Monday is proposed again on Tuesday,
 * and within a week the chat is unreadable and the buttons stop meaning
 * anything. The unique constraint on the column is doing the suppressing: a
 * second proposal for the same subject simply fails to insert.
 *
 * WHY EMPLOYER + TITLE + LOCATION RATHER THAN THE URL. The URL is the obvious
 * choice and it is wrong, because the same vacancy has a different URL on the
 * firm's own careers page, on MyJobMag, and on LinkedIn — three URLs, three
 * fingerprints, three proposals for one job. Normalising the human facts
 * collapses those into one. It is less precise than a URL and that is the
 * point.
 *
 * The cost of this choice, stated plainly: a firm that runs the same role twice
 * in a year — "Associate, Dispute Resolution, Lagos" every graduate season —
 * produces the same fingerprint the second time and the new intake is silently
 * suppressed. That is a real failure mode. It is survivable because
 * `/forget <fingerprint>` deletes the row and lets it through, and because the
 * alternative failure — the same job proposed nightly forever — makes the whole
 * agent useless rather than occasionally wrong.
 */
export function fingerprintJob(c: Pick<Candidate, 'employer' | 'title' | 'location'>): string {
  return hash(['job', norm(c.employer), norm(c.title), norm(c.location)].join('|'))
}

export function fingerprintScholarship(s: Pick<ScholarshipCandidate, 'provider' | 'title'>): string {
  return hash(['sch', norm(s.provider), norm(s.title)].join('|'))
}

/**
 * A delisting is fingerprinted by slug AND day.
 *
 * Unlike a listing, this one SHOULD be able to recur. If you reject "close the
 * Zyph Legal role" today because you know something the agent does not, and in
 * three weeks the posting genuinely does come down, the agent has to be able to
 * raise it again. Scoping the fingerprint to the day means one proposal per
 * listing per sweep, and a fresh chance tomorrow.
 */
export function fingerprintDelist(slug: string, day = today()): string {
  return hash(['del', slug, day].join('|'))
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    /* Suffixes that vary between how a firm signs a vacancy and how an
       aggregator copies it. "Aluko & Oyebode" and "Aluko and Oyebode LLP" are
       one employer and must fingerprint identically. */
    .replace(/\b(llp|ltd|limited|plc|and|the|co|company|partners|associates)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hash(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 32)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export type NewProposal = {
  kind: ProposalKind
  payload: any
  evidence: { sources?: Source[]; [k: string]: any }
  confidence?: number | null
  caveats?: string | null
  fingerprint: string
}

/**
 * Record a proposal, unless its subject has been seen before.
 *
 * Returns null when the fingerprint already exists, which is the normal and
 * expected outcome for most of what a sweep finds — the board is mostly stable
 * and most of what the agent rediscovers each morning is already known. A null
 * here is not an error and the caller should not log it as one.
 */
export async function propose(p: NewProposal): Promise<Proposal | null> {
  const db = createAdminClient()

  const { data, error } = await db
    .from('agent_proposals')
    .insert({
      kind: p.kind,
      payload: p.payload,
      evidence: p.evidence,
      confidence: p.confidence ?? null,
      caveats: p.caveats ?? null,
      fingerprint: p.fingerprint,
    })
    .select('*')
    .single()

  if (error) {
    // 23505 is unique_violation: this subject already has a proposal, in
    // whatever state. That is the suppression working.
    if ((error as any).code === '23505') return null
    throw new Error(`could not record proposal: ${error.message}`)
  }

  return data as Proposal
}

/** Which fingerprints do we already know about? Lets a sweep skip work early. */
export async function knownFingerprints(): Promise<Set<string>> {
  const db = createAdminClient()
  const { data, error } = await db.from('agent_proposals').select('fingerprint')
  if (error) throw new Error(`could not read fingerprints: ${error.message}`)
  return new Set((data ?? []).map(r => r.fingerprint as string))
}

export async function getProposal(id: string): Promise<Proposal | null> {
  const db = createAdminClient()
  const { data } = await db.from('agent_proposals').select('*').eq('id', id).single()
  return (data as Proposal) ?? null
}

export async function listPending(limit = 20): Promise<Proposal[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('agent_proposals')
    .select('*')
    .eq('status', 'pending')
    /* Least confident first. The obvious ones need a glance; the marginal ones
       are the ones worth your attention, and burying them under a run of
       certainties is how they get approved unread. */
    .order('confidence', { ascending: true, nullsFirst: false })
    .limit(limit)

  if (error) throw new Error(`could not list proposals: ${error.message}`)
  return (data ?? []) as Proposal[]
}

/** Remember which message carries this proposal, so it can be edited on decision. */
export async function attachMessage(id: string, chatId: number, messageId: number): Promise<void> {
  const db = createAdminClient()
  await db
    .from('agent_proposals')
    .update({ telegram_chat_id: chatId, telegram_message_id: messageId })
    .eq('id', id)
}

/**
 * Record a decision.
 *
 * ⚠ THE `.eq('status', 'pending')` IS LOad-BEARING AND MUST NOT BE REMOVED. It
 * is what makes a decision idempotent. Telegram redelivers an update when the
 * webhook is slow to answer, and a person will double-tap a button that has not
 * visibly responded yet; both mean this function is called twice for the same
 * press. Without the guard, the second call re-approves an applied proposal and
 * the listing is inserted twice.
 *
 * Returns the row only if THIS call was the one that decided it. A null means
 * somebody — or some duplicate delivery — got there first, and the caller
 * should do nothing rather than act again.
 */
export async function decide(
  id: string,
  status: 'approved' | 'rejected'
): Promise<Proposal | null> {
  const db = createAdminClient()
  const { data } = await db
    .from('agent_proposals')
    .update({ status, decided_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
    .select('*')
    .single()

  return (data as Proposal) ?? null
}

export async function markApplied(id: string): Promise<void> {
  const db = createAdminClient()
  await db
    .from('agent_proposals')
    .update({ status: 'applied', applied_at: new Date().toISOString() })
    .eq('id', id)
}

export async function markFailed(id: string, error: string): Promise<void> {
  const db = createAdminClient()
  await db
    .from('agent_proposals')
    .update({ status: 'failed', error: error.slice(0, 1000) })
    .eq('id', id)
}

/**
 * Delete a proposal so its subject can be found again.
 *
 * The escape hatch for the fingerprint's known failure mode above: a role that
 * genuinely recurs, or one rejected by a mistaken tap. Exposed as `/forget` in
 * Telegram because the alternative is opening the Supabase console to un-reject
 * a job, which nobody will do.
 */
export async function forget(idOrFingerprint: string): Promise<number> {
  const db = createAdminClient()
  const column = /^[0-9a-f-]{36}$/i.test(idOrFingerprint) ? 'id' : 'fingerprint'
  const { data } = await db
    .from('agent_proposals')
    .delete()
    .eq(column, idOrFingerprint)
    .select('id')
  return (data ?? []).length
}
