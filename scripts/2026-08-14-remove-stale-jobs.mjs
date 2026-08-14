/**
 * Remove five spent listings. Written 2026-08-14.
 *
 * Successor to scripts/2026-08-05-remove-stale-jobs.sql, and run as a script
 * rather than pasted SQL for one reason: it prints the rows before it touches
 * them and refuses to delete a slug it cannot find, so a typo produces nothing
 * instead of a silent no-op you assume worked.
 *
 * DRY RUN BY DEFAULT. Add --delete to actually remove them.
 *
 * EACH ONE WAS CHECKED, NOT ASSUMED
 *
 *   world-bank-pioneers-legal-internship-2026
 *     Deadline 2026-08-12, two days ago. See the note below about the 69 people
 *     who were emailed this URL.
 *
 *   firstbank-pan-african-graduate-trainee-2026
 *     Requisition 1768 is gone from First Bank's Oracle careers site. Their
 *     current openings feed returns exactly one role, requisition 1726 (Product
 *     Control Officer, posted 4 August), and 1768 is not in it. The programme
 *     has closed.
 *
 *   union-bank-graduate-trainee-2026
 *     From the unverified 6 June seed: source 'manual', no deadline, an email
 *     application route nobody checked. Union Bank IS running a 2026 Management
 *     Trainee Programme and Tech Bootcamp closing 28 August, but that is a
 *     different, later posting with a different name and a real deadline — it is
 *     not this row, and leaving this row up would point people at a stale
 *     mailbox instead of the live application. If that programme is worth
 *     carrying it should be seeded properly, with its date on it.
 *
 *   bridgegap-legal-officer-lekki
 *   castlefield-attorneys-associate-lagos
 *     Both from the same 6 June seed. source 'manual', no deadline, no posting
 *     URL, an email address and nothing else, and ten weeks old. There is no
 *     source to re-check them against, which is itself the finding: a listing we
 *     cannot verify is one we should not be asking students to act on.
 *
 * WHY THE WORLD BANK ROW IS DELETED RATHER THAN HIDDEN, and it is worth writing
 * down because it looks unkind. lib/open-jobs.ts holds that slug and says the
 * public set must not shrink, because 69 members were emailed that URL on the
 * morning of the 12th. That rule is about the SLUG LIST, not about the row, and
 * the same file says what to do here in as many words: "If a role genuinely has
 * to come down, delete the listing so the page 404s honestly — a 404 is a clean
 * signal and a gate is not." So the row goes and the slug stays. openJobs()
 * filters against rows that actually exist, so a slug left behind produces
 * nothing rather than a sitemap entry pointing at a 404.
 *
 * Run: node scripts/2026-08-14-remove-stale-jobs.mjs
 *      node scripts/2026-08-14-remove-stale-jobs.mjs --delete
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
const DELETE = process.argv.includes('--delete')

const SLUGS = [
  'world-bank-pioneers-legal-internship-2026',
  'firstbank-pan-african-graduate-trainee-2026',
  'union-bank-graduate-trainee-2026',
  'bridgegap-legal-officer-lekki',
  'castlefield-attorneys-associate-lagos',
]

const list = `(${SLUGS.join(',')})`
const found = await (
  await fetch(`${URL_BASE}/rest/v1/jobs?select=id,slug,employer,title,deadline&slug=in.${list}`, { headers: H })
).json()

console.log(`${found.length} of ${SLUGS.length} named slugs are on the board:\n`)
for (const j of found) {
  console.log(`  ${j.slug}`)
  console.log(`    ${j.employer} — ${j.title}  (deadline ${j.deadline ?? 'none'})`)
}

const missing = SLUGS.filter(s => !found.some(j => j.slug === s))
if (missing.length) {
  console.log(`\nNot found (already removed, or the slug is wrong):`)
  for (const s of missing) console.log('  ' + s)
}

if (!DELETE) {
  console.log('\nDry run. Nothing was deleted. Add --delete to remove these rows.')
  process.exit(0)
}

if (!found.length) {
  console.log('\nNothing to delete.')
  process.exit(0)
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?slug=in.${list}`, {
  method: 'DELETE',
  headers: { ...H, Prefer: 'return=representation' },
})
const gone = await res.json()
if (!res.ok) { console.error('delete failed', res.status, gone); process.exit(1) }
console.log(`\nDeleted ${gone.length} rows.`)
for (const j of gone) console.log('  ' + j.slug)
