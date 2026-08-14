import { NextResponse } from 'next/server'
import { runSweep } from '@/lib/agent/sweep'

/**
 * The scheduled sweep.
 *
 * Driven by Vercel Cron — see the schedule in vercel.json. The same work
 * `/sweep` does in Telegram, on a timer, reporting into the same chat.
 *
 * ⚠ A CRON ROUTE IS A PUBLIC URL. middleware.ts does not gate /api, so without
 * the check below anyone who guesses this path can make the agent spend money on
 * web searches, repeatedly. Vercel sends `Authorization: Bearer $CRON_SECRET` on
 * every scheduled invocation; that header is the only thing separating a
 * scheduled run from a stranger's curl.
 */

export const maxDuration = 300

/* Never cached, never prerendered. A cached cron route is a cron route that
   runs once and then serves yesterday's answer forever. */
export const dynamic = 'force-dynamic'

function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  /* Fails closed. An unset secret means nobody can trigger this rather than
     everybody — the same choice isAuthorised makes in telegram.ts, for the same
     reason: a forgotten env var should disable the agent, not expose it. */
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

async function handle(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  }

  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!chatId) {
    return NextResponse.json(
      { ok: false, error: 'TELEGRAM_CHAT_ID is not set — the sweep has nowhere to report' },
      { status: 500 }
    )
  }

  /**
   * Scholarships on Mondays only.
   *
   * A funding call stays open for weeks, so searching daily re-finds the same
   * handful, spends the search budget and produces duplicates the fingerprint
   * then discards. Weekly is roughly the rate at which the answer changes. See
   * the note in sweep.ts.
   */
  const isMonday = new Date().getUTCDay() === 1

  try {
    const result = await runSweep({ chatId, includeScholarships: isMonday })
    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    /* Reported to the caller AND to the chat, because a cron failure that only
       exists in a Vercel log is a failure nobody will see. runSweep already
       messages on partial failures; this is the case where it could not even
       start. */
    console.error('sweep failed:', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}

/* Vercel Cron issues GET. POST is here so the same URL can be triggered by
   hand with curl without pretending to be the scheduler. */
export async function GET(req: Request) {
  return handle(req)
}

export async function POST(req: Request) {
  return handle(req)
}
