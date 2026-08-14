import { createAdminClient } from '@/lib/supabase/admin'
import { proposalButtons, renderProposal, sweepSummary } from './format'
import { checkListing, dueForCheck, markChecked, worthProposing } from './obsolete'
import { attachMessage, fingerprintDelist, fingerprintJob, fingerprintScholarship, propose } from './proposals'
import { clearbitLogo, researchJobs, researchScholarships } from './research'
import { sendMessage } from './telegram'

/**
 * One sweep.
 *
 * Delisting first, then research. The order is not arbitrary: closing a role
 * that has expired is the more urgent of the two jobs — a student applying to a
 * closed role has been actively misled, where a role we have not found yet is
 * merely absent — and if the run is going to exhaust its time budget, it should
 * do so having already dealt with the board it has.
 *
 * ⚠ NOTHING HERE CHANGES THE BOARD. Every finding becomes a proposal and waits
 * for a tap. The only writes a sweep performs are into agent_proposals and the
 * last_checked_at column, neither of which is visible to a reader.
 */

export type SweepOptions = {
  chatId: string | number
  /** Skip the research half. Used by `/check`, which only re-verifies the board. */
  listingsOnly?: boolean
  /** Skip the delisting half. Used by `/find`. */
  researchOnly?: boolean
  /** Scholarships are searched weekly rather than daily — see the note below. */
  includeScholarships?: boolean
}

export async function runSweep(opts: SweepOptions) {
  const started = Date.now()
  const errors: string[] = []

  let found = 0
  let proposed = 0
  let duplicates = 0
  let checked = 0
  let closing = 0
  let unreadable = 0
  let notes = ''

  /* ── Half one: is what we already have still real? ──────────────────── */
  if (!opts.researchOnly) {
    try {
      const due = await dueForCheck(12)
      checked = due.length

      for (const job of due) {
        try {
          const verdict = await checkListing(job)

          if (verdict.stillOpen === null) unreadable++
          if (!worthProposing(verdict)) continue

          closing++

          const p = await propose({
            kind: 'delist',
            payload: {
              slug: job.slug,
              title: job.title,
              employer: job.employer,
              reason: verdict.reason,
            },
            evidence: { sources: verdict.sources },
            confidence: verdict.confidence,
            caveats: null,
            fingerprint: fingerprintDelist(job.slug),
          })

          if (p) await sendProposal(opts.chatId, p)
        } catch (err: any) {
          errors.push(`checking ${job.slug}: ${err?.message || err}`)
        }
      }

      /* Marked as checked whether or not anything came of it, INCLUDING the
         ones that were unreadable. Otherwise a site that is down gets retried
         on every tick forever and starves the rest of the board of attention. */
      await markChecked(due.map(j => j.slug))
    } catch (err: any) {
      errors.push(`delisting pass: ${err?.message || err}`)
    }
  }

  /* ── Half two: what is out there that we do not have? ───────────────── */
  if (!opts.listingsOnly) {
    try {
      const db = createAdminClient()
      const { data: existing } = await db.from('jobs').select('slug, employer, title').eq('is_active', true)

      const result = await researchJobs({
        slugs: (existing ?? []).map(r => r.slug),
        roles: (existing ?? []).map(r => ({ employer: r.employer, title: r.title })),
      })

      found += result.candidates.length
      notes = result.notes

      for (const c of result.candidates) {
        try {
          /* No way in means no listing, enforced here as well as in the prompt.
             A model told a rule follows it almost always, and "almost always"
             is not a good enough guarantee for the one failure that makes the
             board worse than empty. */
          if (!c.apply_url && !c.apply_email) {
            errors.push(`skipped ${c.title} at ${c.employer}: no way to apply`)
            continue
          }

          const p = await propose({
            kind: 'list',
            payload: { ...c, logo_url: clearbitLogo(c) },
            evidence: { sources: c.sources ?? [] },
            confidence: c.confidence,
            caveats: c.caveats,
            fingerprint: fingerprintJob(c),
          })

          if (!p) {
            duplicates++
            continue
          }

          proposed++
          await sendProposal(opts.chatId, p)
        } catch (err: any) {
          errors.push(`proposing ${c.title}: ${err?.message || err}`)
        }
      }
    } catch (err: any) {
      errors.push(`research pass: ${err?.message || err}`)
    }

    /**
     * ⚠ SCHOLARSHIPS ARE NOT SEARCHED EVERY DAY, and the reason is that they do
     * not change every day. A funding call is open for weeks or months, so a
     * daily search re-finds the same handful, spends the search budget, and
     * produces nothing but duplicates the fingerprint then throws away. Weekly
     * is roughly the rate at which the answer actually changes.
     */
    if (opts.includeScholarships) {
      try {
        const result = await researchScholarships([])
        found += result.candidates.length

        for (const s of result.candidates) {
          try {
            /* A scholarship with no deadline is almost always an aggregator's
               copy of last year's call. Stated in the prompt and enforced here
               for the same reason as the apply route above. */
            if (!s.deadline) {
              errors.push(`skipped ${s.title}: no deadline`)
              continue
            }

            const p = await propose({
              kind: 'scholarship',
              payload: s,
              evidence: { sources: s.sources ?? [] },
              confidence: s.confidence,
              caveats: s.caveats,
              fingerprint: fingerprintScholarship(s),
            })

            if (!p) {
              duplicates++
              continue
            }

            proposed++
            await sendProposal(opts.chatId, p)
          } catch (err: any) {
            errors.push(`proposing ${s.title}: ${err?.message || err}`)
          }
        }
      } catch (err: any) {
        errors.push(`scholarship pass: ${err?.message || err}`)
      }
    }
  }

  const summary = sweepSummary({
    found,
    proposed,
    duplicates,
    checked,
    closing,
    unreadable,
    notes,
    errors,
    ms: Date.now() - started,
  })

  await sendMessage(opts.chatId, summary)

  return { found, proposed, duplicates, checked, closing, unreadable, errors }
}

/**
 * Send a card and remember which message it is.
 *
 * The message id is stored so the card can be edited in place when it is
 * decided — see editMessage in telegram.ts for why a chat full of live buttons
 * on settled questions is worse than useless.
 */
async function sendProposal(chatId: string | number, p: Parameters<typeof renderProposal>[0]) {
  const sent = await sendMessage(chatId, renderProposal(p), proposalButtons(p))
  if ('messageId' in sent && sent.ok) {
    await attachMessage(p.id, sent.chatId, sent.messageId)
  }
}
