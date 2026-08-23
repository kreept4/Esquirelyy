/**
 * Take the Zyph Legal associate seat off the board.
 *
 * Reported expired by Bolu on 23 August 2026. lib/open-jobs.ts already carried
 * a long-standing warning that this exact row's `is_closing_soon` flag had
 * gone stale (see JobsClient.tsx's comment naming Zyph as "the case in
 * point"); this closes the row itself rather than just its badge.
 *
 * ⚠ is_active = false, NOT DELETE — the house rule from
 * scripts/2026-08-15-agent-schema.sql, same as
 * scripts/2026-08-17-delist-ovie-obobolo.mjs: a mistaken DELETE is
 * unrecoverable, a mistaken delist is one UPDATE away from being undone.
 *
 * WHAT THIS DOES TO THE PAGE. Every read path filters is_active, so the board
 * drops it (jobs/page.tsx), the listing 404s (jobs/[slug]/page.tsx), and the
 * sitemap stops advertising the URL (sitemap.ts).
 *
 * ⚠ THE SLUG COMES OUT OF OPEN_JOB_SLUGS TOO, and that is the one case the
 * file's own header calls out as correct: "if this list ever genuinely needs
 * to shrink, it should shrink because a role closed, not because a newer one
 * arrived." That edit is made directly in lib/open-jobs.ts alongside this
 * script, not left for a separate pass — a closed role staying in the open set
 * would keep answering a clean 404 either way, but there is no reason to keep
 * naming it there once it is gone.
 *
 * Run: node scripts/2026-08-23-delist-zyph-legal.mjs
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
const SLUG = 'zyph-legal-legal-associate'

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
    delisted_reason: 'Reported expired, 23 August 2026. Removed from the board and from lib/open-jobs.ts.',
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
