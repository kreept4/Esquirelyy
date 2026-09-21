/**
 * What is the bell actually showing right now?
 *
 * WHY THIS EXISTS. The bell has been reported twice as misbehaving and both
 * times the first instinct was to reason about the code. The first cause was
 * found by testing (closing rows re-dating themselves to the present, fixed in
 * 3dd6936); the second round of reasoning produced a confident guess that was
 * never checked. So this builds the real feed from the real tables and prints
 * every row with its stamp, rather than arguing about what the feed ought to
 * contain.
 *
 * buildFeed is pure and takes `now`, jobs, applications, prefs and
 * opportunities as arguments, so the whole thing can be assembled out here with
 * nothing mocked except the reader.
 *
 * ⚠ IT SHOWS DUPLICATES BY LISTING, which is the thing worth looking at. The
 * comment in notifications.ts says a 'role' row and a 'deadline' row for the
 * same listing are deliberately not deduped, because "a 'role' row and a
 * 'deadline' row for the same listing say different things". That is a
 * reasonable position and it is also exactly what a reader would describe as
 * the bell telling them about something twice, so the count is printed and the
 * judgement is left to a person.
 *
 * Run: node scripts/inspect-notification-feed.mjs
 * Reads only. Writes nothing.
 */

import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` }
const get = async p => (await fetch(`${BASE}/rest/v1/${p}`, { headers: H })).json()

const dir = mkdtempSync(join(tmpdir(), 'feed-'))
const out = join(dir, 'n.mjs')
execSync(
  `npx --yes esbuild "src/lib/notifications.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${out}"`,
  { stdio: 'inherit' },
)
const oppOut = join(dir, 'o.mjs')
execSync(
  `npx --yes esbuild "src/lib/opportunities.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${oppOut}"`,
  { stdio: 'inherit' },
)
const { buildFeed, isUnread } = await import('file://' + out.replace(/\\/g, '/'))
const { toBoardRow, hasClosed } = await import('file://' + oppOut.replace(/\\/g, '/'))

const now = new Date()
const jobs = await get('jobs?select=*&is_active=eq.true&order=created_at.desc&limit=100')
const opps = (await get('opportunities?select=*&status=eq.published'))
  .filter(o => !hasClosed(o.deadline))
  .map(toBoardRow)

/* The default preferences, i.e. what a reader who has never opened settings
   has. Anything narrower only removes rows. */
const prefs = { roles: true, deadlines: true, tracker: true }

const feed = buildFeed(jobs, [], prefs, '', now, new Set(), opps)

console.log(`\nnow: ${now.toISOString()}`)
console.log(`jobs: ${jobs.length} active   opportunities: ${opps.length} open`)
console.log(`\nfeed has ${feed.length} row(s):\n`)

for (const n of feed) {
  const age = Math.round((now - Date.parse(n.at)) / 36e5)
  const future = Date.parse(n.at) > now.getTime()
  console.log(
    `  ${n.kind.padEnd(9)} ${n.at}  ${String(age).padStart(5)}h old${future ? '  <== STAMPED IN THE FUTURE' : ''}`,
  )
  console.log(`  ${''.padEnd(9)} ${n.title.slice(0, 68)}`)
  console.log(`  ${''.padEnd(9)} id=${n.id}`)
  console.log('')
}

/* Would a reader who opened the bell an hour ago see any of these as new? */
const seenAnHourAgo = now.getTime() - 36e5
const stillNew = feed.filter(n => isUnread(n, seenAnHourAgo, new Set(), new Set()))
console.log(`Unread for somebody who opened the panel an hour ago: ${stillNew.length}`)
for (const n of stillNew) console.log(`  ${n.kind}  ${n.title.slice(0, 60)}`)

/* Same listing appearing more than once. */
const byTitle = {}
for (const n of feed) (byTitle[n.title] ||= []).push(n.kind)
const dupes = Object.entries(byTitle).filter(([, kinds]) => kinds.length > 1)
if (dupes.length) {
  console.log(`\n⚠ ${dupes.length} listing(s) produce more than one row:`)
  for (const [title, kinds] of dupes) console.log(`  ${kinds.join(' + ')}  ${title.slice(0, 58)}`)
} else {
  console.log('\nNo listing produces more than one row.')
}
