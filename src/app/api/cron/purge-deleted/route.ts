import { NextResponse } from 'next/server'
import { bearerMatches } from '@/lib/agent/telegram'
import { createAdminClient } from '@/lib/supabase/admin'
import { DELETION_GRACE_DAYS } from '@/lib/account'

/**
 * Finish the account deletions the dashboard only ever started.
 *
 * ============================================================
 * WHY THIS EXISTS
 * ============================================================
 *
 * The request half was already built and works: a member asks from the
 * dashboard, `deletion_requested_at` is stamped, a 30 day grace period runs,
 * and signing in cancels it. Nothing ever finished the job. The column was
 * written and read and never acted on, so an account scheduled for deletion
 * stayed exactly where it was, indefinitely.
 *
 * That is not only a missing feature. The privacy policy tells the member, by
 * name and date, that everything goes for good on that day, and clause 6 says
 * so plainly. Under the Nigeria Data Protection Act 2023 an erasure request is
 * a right rather than a courtesy, and a promise to erase that nothing carries
 * out is worse than never having offered the button.
 *
 * ============================================================
 * ⚠ THIS ONE REALLY DELETES, AND THAT IS THE POINT
 * ============================================================
 *
 * expire-listings sets `is_active = false` and keeps the row, because a
 * mistaken delisting should be one UPDATE away from undone. The house rule
 * against DELETE does not apply here and cannot: the member asked to be gone,
 * and a soft delete would leave the data sitting in the table that the policy
 * says no longer holds it.
 *
 * So the guards are on the selection instead, not on the write:
 *
 *   The grace period is applied in SQL, not in JS. Only rows already older than
 *   the cutoff are ever fetched, so a bug further down cannot reach a row that
 *   is still inside its 30 days.
 *
 *   Only rows with a non-null `deletion_requested_at` are considered at all. An
 *   account that never asked is not selectable by this route by construction.
 *
 *   MAX_PER_RUN caps the blast radius. If the cutoff were ever computed wrong,
 *   the damage is bounded at a handful of accounts and shows up in the response
 *   rather than emptying the table in one sweep. The backlog clears over the
 *   following days, which for a queue that should normally be empty is fine.
 *
 * ============================================================
 * DELETING THE AUTH USER IS THE WHOLE DELETION
 * ============================================================
 *
 * `profiles.id` references `auth.users(id) ON DELETE CASCADE`, and every table
 * holding member data hangs off one or the other the same way: saved jobs,
 * applications, cover letters, CV generations, password history, ai_usage.
 * Removing the auth user therefore removes all of it in one transaction the
 * database owns. Deleting the profile row first would be the wrong order, and
 * deleting each table by hand would be a list that silently goes stale the next
 * time somebody adds a table.
 *
 * ============================================================
 * RUNNING IT
 * ============================================================
 *
 * Vercel calls this daily from `crons` in vercel.json with
 * `Authorization: Bearer $CRON_SECRET`, at 05:45 UTC, a quarter hour after
 * expire-listings so the two never contend.
 *
 * ⚠ RUN IT DRY FIRST. `?dry=1` reports exactly which accounts it would delete
 * and touches nothing. Do that once before the first live run, so the first
 * thing this route ever does is not an irreversible write you have not seen.
 *
 * ⚠ AND IT DOES NOTHING UNTIL CRON_SECRET IS SET, failing closed like the other
 * scheduled routes. Vercel only sends the header when that variable exists, so
 * an unset secret means the cron fires, gets a 401, and reports success at the
 * platform level. That is the quiet failure to watch for.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** See the blast radius note above. */
const MAX_PER_RUN = 25

function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return bearerMatches(req.headers.get('authorization'), secret)
}

async function handle(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  }

  const dry = new URL(req.url).searchParams.get('dry') === '1'
  const db = createAdminClient()

  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - DELETION_GRACE_DAYS)

  const { data: due, error } = await db
    .from('profiles')
    .select('id, email, deletion_requested_at')
    .not('deletion_requested_at', 'is', null)
    .lt('deletion_requested_at', cutoff.toISOString())
    .order('deletion_requested_at', { ascending: true })
    .limit(MAX_PER_RUN)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const queue = due || []

  if (dry) {
    return NextResponse.json({
      ok: true,
      dry: true,
      cutoff: cutoff.toISOString(),
      wouldDelete: queue.length,
      accounts: queue.map(p => ({ id: p.id, requestedAt: p.deletion_requested_at })),
    })
  }

  const deleted: string[] = []
  const failed: { id: string; error: string }[] = []

  for (const profile of queue) {
    /* One at a time, and a failure on one account does not abandon the rest.
       A row that fails stays selected for tomorrow's run rather than being
       marked done, which is the right way round: retrying a deletion is safe,
       forgetting one is not. */
    const { error: delError } = await db.auth.admin.deleteUser(profile.id)

    if (delError) {
      console.error('[purge-deleted] could not delete', profile.id, delError.message)
      failed.push({ id: profile.id, error: delError.message })
    } else {
      deleted.push(profile.id)
    }
  }

  if (deleted.length) {
    console.log(`[purge-deleted] deleted ${deleted.length} account(s) past the ${DELETION_GRACE_DAYS} day grace period`)
  }

  return NextResponse.json({
    ok: failed.length === 0,
    cutoff: cutoff.toISOString(),
    deleted: deleted.length,
    failed,
    /* Truthful about the cap: a full batch means there is more waiting, and the
       operator should know that rather than assume the queue is empty. */
    more: queue.length === MAX_PER_RUN,
  })
}

export const GET = handle
export const POST = handle
