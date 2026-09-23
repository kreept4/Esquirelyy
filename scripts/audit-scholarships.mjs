/**
 * What each scholarship resolves to today, and which ones cannot resolve at all.
 *
 * WHY THIS EXISTS. scholarships-data.ts derives a status from `opensOn` and
 * `closesOn` and falls back to the hand-typed `status` when an entry has
 * neither, which is the right design and leaves a real question open: which
 * entries are actually falling back? A hand-typed status is a snapshot of
 * whoever last edited the file, and the file's own header says to re-check it
 * each term rather than trust it. This prints who is trusting what.
 *
 * ⚠ THE FALLBACK ENTRIES ARE THE RISK, and they are the ones with no usable
 * date to print: awards whose deadline is "set by your course" or "two cycles
 * yearly". Those cannot be derived, so their status is only as fresh as the
 * last person to look, and nothing in the codebase will ever notice them going
 * stale.
 *
 * Read only.
 *
 * Run: node scripts/audit-scholarships.mjs
 */

import { execSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const dir = mkdtempSync(join(tmpdir(), 'sch-'))
const out = join(dir, 'sch.mjs')
execSync(
  `npx --yes esbuild "src/lib/scholarships-data.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${out}"`,
  { stdio: 'inherit' },
)
const m = await import(pathToFileURL(out).href)

const now = new Date()
const all = m.allScholarships(now)

console.log(`\n  today: ${now.toISOString().slice(0, 10)}`)
console.log(`  ${all.length} scholarships\n`)

const derived = []
const fallback = []

for (const s of all) {
  const hasDates = !!(s.opensOn || s.closesOn)
  const row =
    `  [${s.status.toUpperCase().padEnd(8)}] ${s.title.slice(0, 42).padEnd(42)} ` +
    `opens=${(s.opensOn || '-').padEnd(10)} closes=${(s.closesOn || '-').padEnd(10)}`
  ;(hasDates ? derived : fallback).push(row)
}

console.log('DERIVED from real dates, so these cannot go stale:')
derived.forEach(r => console.log(r))

console.log('\nFALLING BACK to the hand-typed status, because no usable date is published.')
console.log('These are only as fresh as the last person who checked:')
fallback.forEach(r => console.log(r))

const counts = all.reduce((a, s) => ((a[s.status] = (a[s.status] || 0) + 1), a), {})
console.log(`\n  ${JSON.stringify(counts)}`)

const openNow = all.filter(s => s.status === 'open')
console.log(`\n  Open right now (${openNow.length}):`)
for (const s of openNow) console.log(`    ${s.title}\n      ${s.deadline}`)

const upcoming = all.filter(s => s.status === 'upcoming')
console.log(`\n  Upcoming (${upcoming.length}):`)
for (const s of upcoming) console.log(`    ${s.title}\n      ${s.deadline}`)
