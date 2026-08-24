import { NextResponse } from 'next/server'
import { bearerMatches } from '@/lib/agent/telegram'
import { createAdminClient } from '@/lib/supabase/admin'
import { today, hasPassed } from '@/lib/day'

/**
 * Take listings off the board when their closing date has passed.
 *
 * ============================================================
 * WHY THIS EXISTS
 * ============================================================
 *
 * Nothing did it. A job came off the board when a person noticed and ran a
 * script: Zyph Legal was delisted on 23 August for a deadline that passed on
 * the 20th, and Ovie Obobolo on the 17th for one that passed on the 16th. In
 * both cases the board carried a closed role for days, and in both cases the
 * only reason it stopped was that somebody looked.
 *
 * That is the failure mode this route removes. It does not make the board more
 * correct than a human would; it makes it correct without waiting for one.
 *
 * ============================================================
 * ⚠ is_active = false, NOT DELETE, AND NOT A READ-TIME FILTER
 * ============================================================
 *
 * The house rule is set out at length in scripts/2026-08-15-agent-schema.sql: a
 * mistaken DELETE is unrecoverable and leaves no trace of what went or why,
 * while a mistaken delist is one UPDATE away from being undone and the row
 * still says who closed it and on what basis. This writes the same three
 * columns a human delisting writes — `is_active`, `delisted_at` and
 * `delisted_reason` — so an automatic removal is indistinguishable in shape
 * from a considered one, and just as easy to reverse.
 *
 * IT IS ALSO NOT A FILTER IN THE PAGE QUERY, which was the cheaper option and
 * the wrong one. Hiding expired rows at read time would make the board correct
 * and leave the database saying every one of them is still open, so the
 * sitemap, the agent, the bell and anything else reading `is_active` would each
 * need the same filter added, and the first one to forget it would be wrong
 * silently. One writer, one source of truth, every reader unchanged.
 *
 * ============================================================
 * ⚠ THE DAY OF THE DEADLINE IS NOT EXPIRED
 * ============================================================
 *
 * `hasPassed` treats a deadline of today as still open, because employers mean
 * end of day when they publish a date. A sweep that ran at 00:05 and closed
 * everything dated today would take the last day off every applicant, and the
 * last day is the one people use.
 *
 * And the comparison is a LAGOS calendar date, not a UTC instant. See
 * lib/day.ts: for the hour before midnight UTC, Nigeria is already on the next
 * day, and a sweep running in that hour would be judging deadlines against
 * yesterday.
 *
 * ============================================================
 * WHAT IT DELIBERATELY DOES NOT TOUCH
 * ============================================================
 *
 * Rolling listings, which have no deadline to pass. `is_rolling` rows are
 * excluded by the null check rather than by the flag, because a row with no
 * deadline cannot expire whatever the flag says.
 *
 * Opportunities. lib/opportunities.ts already drops a closed one at read time
 * through `hasClosed`, and unlike a job it has nothing left to offer once its
 * form stops accepting entries. If that ever changes, this is the route to
 * extend rather than a second job.
 *
 * Scholarships, which are a TypeScript file rather than a table and whose
 * `status` is an editorial judgement about a cycle, not a date.
 *
 * ============================================================
 * RUNNING IT
 * ============================================================
 *
 * Vercel calls this daily from the `crons` entry in vercel.json, with
 * `Authorization: Bearer $CRON_SECRET`.
 *
 * 30 5 * * * is 05:30 UTC, which is 06:30 in Lagos: the board is right before
 * anyone opens it, and it is safely past midnight everywhere the audience is.
 * The schedule lives in vercel.json with no note beside it because that file
 * rejects a `comment` key on a cron entry, so the reasoning is here instead.
 *
 * ⚠ IT DOES NOTHING UNTIL CRON_SECRET IS SET IN THE VERCEL PROJECT. The guard
 * fails closed by design, and Vercel only sends the Authorization header when
 * that variable exists. With it unset the cron fires, gets a 401 and reports
 * success at the platform level, which is the quiet failure to watch for. It is safe to call by hand at any time
 * and safe to call repeatedly: a row already inactive is not selected, so a
 * second run in the same minute reports nothing to do rather than rewriting
 * `delisted_at` and losing when it actually closed.
 *
 * GET and POST both work. Vercel Cron issues GET; a person testing with curl
 * reaches for POST.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  /* Fails closed, the same choice the agent sweep and the Telegram webhook
     make: a forgotten env var should disable this, not open it. */
  if (!secret) return false
  return bearerMatches(req.headers.get('authorization'), secret)
}

async function handle(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  }

  const db = createAdminClient()
  const now = new Date()

  /* Every live listing that has a closing date. The expiry test is applied in
     JS rather than as a `.lt('deadline', ...)` filter so that one function,
     hasPassed, decides what expired means everywhere — the board, the bell and
     this sweep cannot drift apart on the edge case that matters, which is the
     deadline day itself. The table is small enough that this costs nothing. */
  const { data: live, error } = await db
    .from('jobs')
    .select('slug, title, employer, deadline')
    .eq('is_active', true)
    .not('deadline', 'is', null)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const expired = (live || []).filter(j => hasPassed(j.deadline, now))

  if (!expired.length) {
    return NextResponse.json({
      ok: true,
      today: today(now),
      checked: live?.length ?? 0,
      delisted: 0,
      listings: [],
    })
  }

  const stamp = now.toISOString()
  const done: string[] = []
  const failed: { slug: string; error: string }[] = []

  for (const job of expired) {
    const { error: writeError } = await db
      .from('jobs')
      .update({
        is_active: false,
        delisted_at: stamp,
        /* Says what closed it and on what evidence, in the same shape a human
           delisting uses, so nobody reading this row later has to guess whether
           a person or a schedule decided. */
        delisted_reason: `Deadline of ${job.deadline} passed. Delisted automatically on ${today(now)} by the expiry sweep.`,
      })
      .eq('slug', job.slug)
      /* Guards against closing a row somebody reopened between the read above
         and this write. */
      .eq('is_active', true)

    if (writeError) failed.push({ slug: job.slug, error: writeError.message })
    else done.push(job.slug)
  }

  return NextResponse.json({
    ok: failed.length === 0,
    today: today(now),
    checked: live?.length ?? 0,
    delisted: done.length,
    listings: expired.map(j => ({ slug: j.slug, employer: j.employer, deadline: j.deadline })),
    ...(failed.length ? { failed } : {}),
  })
}

export const GET = handle
export const POST = handle
