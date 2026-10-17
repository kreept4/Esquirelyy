import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, emailConfigured } from '@/lib/email/send'
import { newRolesEmail } from '@/lib/email/templates/new-roles'
import { NEW_ROLES } from '@/lib/new-roles'

/**
 * The roles broadcast, run from the deployment instead of from a laptop.
 *
 * scripts/send-new-roles.mjs is still the reference for WHO gets the email and
 * this route follows it line for line: confirmed addresses only, new_listings
 * not switched off, not on a break. What changed is where it runs. The Brevo key
 * is a sensitive Vercel variable, readable by the deployed app and by nobody
 * else, so with the laptop out of reach the send has to happen here.
 *
 * ============================================================
 * ⚠ NOTHING HAPPENS WITHOUT A ROW IN broadcast_runs
 * ============================================================
 *
 * GET /api/admin/broadcast-roles?run=<id>
 *
 * The id is the approval, and scripts/2026-10-17-broadcast-runs.sql explains
 * the shape. In short: a long random id, inserted by hand with the service role
 * for one specific send, claimed here by a single conditional UPDATE so it can
 * run once and only once, and refused outright if the drop it was approved for
 * is not the drop this deployment would send. There is no way to start a send
 * from the outside without database access.
 *
 * A run with only_email set is a test: one message to that address, member or
 * not, exactly like scripts/send-test-new-roles.mjs. A run without it is the
 * broadcast.
 *
 * ⚠ IDEMPOTENT ACROSS RUNS. Every attempt is written to broadcast_sends as it
 * happens, and the broadcast skips anybody a previous broadcast for the same
 * drop already reached. If this times out half way, a second approved run
 * finishes the list instead of writing to the first half twice.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

/* Four at a time. Sequential, 150 sends at Brevo's usual latency is most of a
   minute; four in flight is a quarter of that and nowhere near the rate limit. */
const CONCURRENCY = 4

type Recipient = { email: string; name: string }

export async function GET(req: Request) {
  const runId = new URL(req.url).searchParams.get('run') || ''
  if (runId.length < 32) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (!emailConfigured()) {
    return NextResponse.json({ error: 'email is not configured on this deployment' }, { status: 503 })
  }

  const db = createAdminClient()

  /* Claim first, check second, so two requests racing on the same id cannot
     both get past this line. Only the one whose UPDATE matched owns the run. */
  const { data: claimed, error: claimError } = await db
    .from('broadcast_runs')
    .update({ started_at: new Date().toISOString() })
    .eq('id', runId)
    .is('started_at', null)
    .select('id, drop_id, only_email, display_name')
    .maybeSingle()
  if (claimError) return NextResponse.json({ error: claimError.message }, { status: 500 })
  if (!claimed) return NextResponse.json({ error: 'not found or already used' }, { status: 404 })

  const finish = (patch: Record<string, unknown>) =>
    db.from('broadcast_runs').update({ finished_at: new Date().toISOString(), ...patch }).eq('id', runId)

  if (claimed.drop_id !== NEW_ROLES.id) {
    await finish({ sent: 0, failed: 0, skipped: 0 })
    return NextResponse.json(
      { error: `approved for ${claimed.drop_id}, but this deployment would send ${NEW_ROLES.id}` },
      { status: 409 }
    )
  }

  const kind: 'test' | 'broadcast' = claimed.only_email ? 'test' : 'broadcast'
  let recipients: Recipient[]
  let skipped = 0

  if (claimed.only_email) {
    const { data: profile } = await db
      .from('profiles')
      .select('full_name')
      .ilike('email', claimed.only_email)
      .maybeSingle()
    recipients = [{ email: claimed.only_email, name: claimed.display_name || profile?.full_name || '' }]
  } else {
    const all = await members(db)
    /* Anybody a previous broadcast of this same drop already reached. Tests do
       not count: the person checking the layout is also a member. */
    const { data: done } = await db
      .from('broadcast_sends')
      .select('email')
      .eq('drop_id', NEW_ROLES.id)
      .eq('kind', 'broadcast')
      .eq('ok', true)
    const reached = new Set((done ?? []).map(r => r.email.toLowerCase()))
    recipients = all.filter(r => !reached.has(r.email.toLowerCase()))
    skipped = all.length - recipients.length
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://esquirely.com.ng').replace(/\/$/, '')
  const failures: { email: string; error: string }[] = []
  let sent = 0

  const queue = [...recipients]
  async function worker() {
    for (let r = queue.shift(); r; r = queue.shift()) {
      const { subject, html, text } = newRolesEmail({ name: r.name, siteUrl })
      const result = await sendEmail({ to: r.email, toName: r.name || undefined, subject, html, text })
      const ok = result.ok && !result.skipped
      const error = !result.ok ? result.error : result.skipped ? result.reason : null
      if (ok) sent++
      else failures.push({ email: r.email, error: error || 'unknown' })
      await db.from('broadcast_sends').insert({
        run_id: runId,
        drop_id: NEW_ROLES.id,
        kind,
        email: r.email,
        ok,
        error,
      })
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  await finish({ sent, failed: failures.length, skipped })
  return NextResponse.json({
    kind,
    drop: NEW_ROLES.id,
    recipients: recipients.length,
    sent,
    skipped,
    failed: failures,
  })
}

/** The broadcast list, filtered exactly as scripts/send-new-roles.mjs does. */
async function members(db: ReturnType<typeof createAdminClient>): Promise<Recipient[]> {
  const users = []
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(error.message)
    users.push(...data.users)
    if (data.users.length < 1000) break
  }

  const { data: profiles } = await db
    .from('profiles')
    .select('id, full_name, break_until, notification_preferences')
  const byId = new Map((profiles ?? []).map(p => [p.id, p]))
  const now = Date.now()

  return users
    .filter(u => u.email)
    .filter(u => u.email_confirmed_at || u.confirmed_at)
    .filter(u => byId.get(u.id)?.notification_preferences?.new_listings !== false)
    .filter(u => {
      const until = byId.get(u.id)?.break_until
      return !until || new Date(until).getTime() <= now
    })
    .map(u => ({ email: u.email!, name: byId.get(u.id)?.full_name || '' }))
}
