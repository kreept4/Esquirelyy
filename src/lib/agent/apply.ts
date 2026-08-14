import { createAdminClient } from '@/lib/supabase/admin'
import { markApplied, markFailed } from './proposals'
import type { Candidate, Proposal, ScholarshipCandidate, Source } from './types'

/**
 * Carrying out a decision.
 *
 * The only file in lib/agent that writes to the jobs table, and it runs only
 * after a person has tapped Approve. Nothing calls into here from a sweep.
 *
 * ⚠ EVERY EXISTING ROW ON THE BOARD WAS PUT THERE BY HAND. Checked against
 * production on 15 August 2026: all twenty listings carry a hand-written
 * provenance line — "Ovie Obobolo & Co recruitment flier", "Aluko & Oyebode
 * careers portal" — and not one came from the Adzuna crawler that has been
 * running daily since June. So this file is not adding a second automated
 * source next to a working one; it is automating the thing that has actually
 * been producing the board, and it should therefore write rows that look like
 * the ones already there rather than inventing a machine format beside them.
 */

/**
 * "Verified" is a claim made to readers, and it is not ours to make loosely.
 *
 * The board's own metadata says its listings are "checked against each
 * employer's own notice", and every row currently on it is is_verified: true
 * because a person went and looked. Approving a Telegram card is not the same
 * act — it is a glance at a summary, which is exactly the point of the agent
 * but is not the same as reading the employer's notice.
 *
 * So the flag is earned rather than assumed: true only when the agent read a
 * page on the EMPLOYER'S OWN DOMAIN. A role known only from MyJobMag or a
 * LinkedIn repost goes up as unverified, which is honest — the aggregator is
 * genuinely the only thing standing behind it — and it can be promoted later by
 * hand.
 */
function earnedVerified(c: Candidate, sources: Source[]): boolean {
  const employerHost = (() => {
    try {
      return c.apply_url ? new URL(c.apply_url).hostname.replace(/^www\./, '') : null
    } catch {
      return null
    }
  })()

  if (!employerHost) return false

  const AGGREGATORS = [
    'myjobmag.com', 'jobberman.com', 'hotnigerianjobs.com', 'ngcareers.com',
    'linkedin.com', 'indeed.com', 'glassdoor.com', 'adzuna.com', 'jobgurus.com.ng',
  ]
  if (AGGREGATORS.some(d => employerHost.endsWith(d))) return false

  return sources.some(s => {
    try {
      return new URL(s.url).hostname.replace(/^www\./, '').endsWith(employerHost)
    } catch {
      return false
    }
  })
}

/**
 * Insert an approved listing.
 *
 * The id is the slug. Three of the six rows sampled from production already do
 * exactly this — 'kbo-junior-associate-yaba', 'abe-asotie-lawyer-ngo' — and the
 * column is text rather than a uuid with a default, so something has to supply
 * one. Reusing the slug means the id is meaningful, is unique for the same
 * reason the slug is, and needs no second uniqueness argument.
 */
async function applyListing(p: Proposal): Promise<string> {
  const c = p.payload as Candidate & { logo_url?: string | null }
  const sources: Source[] = p.evidence?.sources ?? []
  const db = createAdminClient()

  const { error } = await db.from('jobs').insert({
    id: c.slug.slice(0, 120),
    slug: c.slug,
    title: c.title,
    employer: c.employer,
    location: c.location,
    deadline: c.deadline,
    type: c.type,
    level: c.level,
    sector: c.sector,
    practice_areas: c.practice_areas ?? [],
    about: c.about,
    role_desc: c.role_desc,
    requirements: c.requirements ?? [],
    apply_url: c.apply_url,
    apply_email: c.apply_email,
    source: c.source,
    logo_url: c.logo_url ?? null,
    is_active: true,
    is_verified: earnedVerified(c, sources),
    /* A role with no deadline is rolling by definition — that is what the
       column means on every hand-written row. Derived rather than asked of the
       model, because it is the same fact twice and two sources for one fact is
       how they come to disagree. */
    is_rolling: !c.deadline,
    /* Left to the board's own logic rather than set here. is_closing_soon is a
       function of the deadline and today, and freezing it at insert time means
       a role inserted six weeks before its deadline is still not "closing soon"
       on the morning it closes. */
    is_closing_soon: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) throw new Error(`could not insert the listing: ${error.message}`)

  return `Added <b>${c.title}</b> at ${c.employer} to the board.`
}

/**
 * Close a listing.
 *
 * ⚠ AN UPDATE, NEVER A DELETE, and the difference is the reason the is_active
 * column was added. See the long note in scripts/2026-08-15-agent-schema.sql:
 * a mistaken delete is unrecoverable and leaves no record, and the agent does
 * not get to make unrecoverable changes. Deleting a row remains a human act,
 * done with the reasoning written down, through
 * scripts/2026-08-14-remove-stale-jobs.mjs.
 */
async function applyDelist(p: Proposal): Promise<string> {
  const { slug, reason } = p.payload as { slug: string; reason: string }
  const db = createAdminClient()

  const { data, error } = await db
    .from('jobs')
    .update({
      is_active: false,
      delisted_at: new Date().toISOString(),
      delisted_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)
    /* Only close something that is currently open. A double-tap, or Telegram
       redelivering the callback, must not overwrite the original closing reason
       and date with a second identical one. */
    .eq('is_active', true)
    .select('slug')

  if (error) throw new Error(`could not close the listing: ${error.message}`)
  if (!data?.length) return `<i>${slug}</i> was already closed. Nothing changed.`

  return `Closed <b>${slug}</b>. It is off the board but the row is intact — reopen it by setting is_active back to true.`
}

/**
 * A scholarship, which cannot be applied and instead comes back as something to
 * paste.
 *
 * Scholarships are TypeScript, in lib/scholarships-data.ts, and a serverless
 * function cannot edit a file in the repository. Rather than pretend otherwise,
 * approval produces the entry ready to paste and the proposal stays at
 * 'approved' — the record that you accepted it — until a deploy actually puts
 * it on the site. See the note at the foot of the 15 August migration.
 */
function scholarshipSnippet(p: Proposal): string {
  const s = p.payload as ScholarshipCandidate
  const q = (v: string | null) => (v === null ? 'null' : JSON.stringify(v))

  return [
    'Approved. Paste this into <code>src/lib/scholarships-data.ts</code> and deploy:',
    '',
    '<pre>{',
    `  slug: ${q(s.slug)},`,
    `  title: ${q(s.title)},`,
    `  provider: ${q(s.provider)},`,
    `  provider_url: ${q(s.provider_url)},`,
    `  type: ${q(s.type)},`,
    `  level: ${q(s.level)},`,
    `  location: ${q(s.location)},`,
    `  is_international: ${s.is_international},`,
    `  amount_description: ${q(s.amount_description)},`,
    `  description: ${q(s.description)},`,
    `  eligibility: ${q(s.eligibility)},`,
    `  apply_url: ${q(s.apply_url)},`,
    `  deadline: ${q(s.deadline)},`,
    '}</pre>',
  ].join('\n')
}

/**
 * Do what an approved proposal says.
 *
 * Failures are recorded on the row and returned as a sentence rather than
 * thrown. A proposal that could not be applied has to stay visible and
 * explicable — an exception escaping into a webhook handler becomes a 500 that
 * Telegram retries, and the person who tapped the button learns nothing.
 */
export async function applyProposal(p: Proposal): Promise<string> {
  try {
    switch (p.kind) {
      case 'list': {
        const msg = await applyListing(p)
        await markApplied(p.id)
        return msg
      }
      case 'delist': {
        const msg = await applyDelist(p)
        await markApplied(p.id)
        return msg
      }
      case 'scholarship':
        /* Deliberately NOT markApplied. It is approved; it is not on the site
           until somebody pastes and deploys, and saying otherwise would make
           the status column lie. */
        return scholarshipSnippet(p)
      case 'email':
        return [
          'Approved — but this one is not sent from here, and that is on purpose.',
          '',
          'The announcement is written in <code>src/lib/new-roles.ts</code> and sent with',
          '<code>node scripts/send-new-roles.mjs</code>, which is dry-run by default.',
          "That script's own header is the argument: an email is the one artefact",
          'that cannot be corrected after the fact. Send one to yourself with',
          '<code>--only</code> first.',
        ].join('\n')
      default:
        throw new Error(`unknown proposal kind: ${p.kind}`)
    }
  } catch (err: any) {
    const message = err?.message || String(err)
    await markFailed(p.id, message)
    return `Could not apply that: ${message}`
  }
}
