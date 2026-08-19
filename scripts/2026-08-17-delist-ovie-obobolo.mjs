/**
 * Take the Ovie Obobolo & Co associate seat off the board.
 *
 * Reported closed by Kreept on 17 August 2026. The row's own deadline was
 * 16 August, so it had already passed when this ran, which corroborates it.
 *
 * ⚠ is_active = false, NOT DELETE, and that is the house rule rather than a
 * preference. scripts/2026-08-15-agent-schema.sql sets it out at length: a
 * mistaken DELETE is unrecoverable and leaves no trace of what was removed or
 * why, while a mistaken delist is one UPDATE away from being undone and the row
 * still says who closed it and on what basis. Deleting is reserved for the case
 * where a URL must 404 for a reason of its own, like the World Bank internship
 * whose link had gone to sixty nine inboxes, and that is a human decision made
 * with the reasoning written down.
 *
 * WHAT THIS DOES TO THE PAGE. Every read path filters is_active, so the effect
 * is immediate and total: the board drops it (jobs/page.tsx), the listing 404s
 * (jobs/[slug]/page.tsx), and the sitemap stops advertising the URL
 * (sitemap.ts). That is the same outcome as a delete from a reader's side.
 *
 * ⚠ THE SLUG STAYS IN OPEN_JOB_SLUGS, AND REMOVING IT WOULD BE THE BUG.
 * lib/open-jobs.ts is explicit that a slug taken out of that set must not start
 * answering a crawler with a redirect to /auth/login, because that is the
 * pattern that teaches a search engine to stop trusting a host. Left in the
 * set, isOpenJob() stays true and a signed-out reader gets a clean 404 — the
 * honest signal. Taken out, the same reader gets bounced to a login page for a
 * role that no longer exists. openJobs() filters real rows rather than slugs,
 * so the stale entry produces nothing anywhere else.
 *
 * Run: node scripts/2026-08-17-delist-ovie-obobolo.mjs
 * Idempotent. Re-running reports it was already closed and changes nothing.
 */

import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env.local')

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const SLUG = 'ovie-obobolo-associate'

const before = await (await fetch(
  `${URL_BASE}/rest/v1/jobs?select=slug,title,employer,is_active,deadline&slug=eq.${SLUG}`, { headers: H }
)).json()

if (!before.length) {
  console.error(`No row with slug ${SLUG}. Nothing to do.`)
  process.exit(1)
}
if (!before[0].is_active) {
  console.log(`${SLUG} is already closed. Nothing to do.`)
  process.exit(0)
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?slug=eq.${SLUG}`, {
  method: 'PATCH',
  headers: { ...H, Prefer: 'return=representation' },
  body: JSON.stringify({
    is_active: false,
    delisted_at: new Date().toISOString(),
    /* Free text, per the schema note: the reason is the most useful thing in
       the table when somebody asks in six weeks why the role went. */
    delisted_reason: 'Reported closed by the firm, 17 August 2026. The listed deadline of 16 August 2026 had also passed.',
  }),
})
const body = await res.json()
if (!res.ok) { console.error('delist failed', res.status, body); process.exit(1) }

console.log('closed:', body[0].slug, '—', body[0].employer)
console.log('  is_active      ', body[0].is_active)
console.log('  delisted_at    ', body[0].delisted_at)
console.log('  reason         ', body[0].delisted_reason)
console.log('\nThe board, the listing page and the sitemap all filter is_active,')
console.log('so /jobs/' + SLUG + ' now 404s rather than redirecting.')
