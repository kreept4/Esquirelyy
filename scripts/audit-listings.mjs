/**
 * What is actually on the board, and how much of it can still be trusted.
 *
 * WHY THIS EXISTS. `last_checked_at` is a column on `jobs` and nothing has ever
 * written to it, so the honest answer to "is this listing still open" is that
 * nobody knows for any row on the board. Age is the only proxy available, and
 * age is exactly what the expire cron cannot see: it delists on a passed
 * deadline, and a rolling row has no deadline to pass, so rolling currently
 * means permanent.
 *
 * This prints the three things that decide whether a row should stay:
 *
 *   age           days since it went up. The only signal there is for a rolling
 *                 row, and the reason a cutoff is the whole of the fix.
 *   deadline      for dated rows, whether it is still in the future. The cron
 *                 handles these, so anything wrong here is a cron failure
 *                 rather than a policy gap.
 *   apply route   whether the address or URL a reader is sent to still exists.
 *                 A listing whose apply route is dead is worse than a stale
 *                 one: the reader spends the effort and it goes nowhere.
 *
 * ⚠ THE MX CHECK IS THE ONE THAT FINDS REAL FAULTS. The September audit found
 * two firm domains with no MX record at all, which means every application ever
 * sent to them bounced. That check costs one DNS lookup per domain and is the
 * cheapest verification on this list, so it runs on every row with an
 * apply_email rather than only on new ones.
 *
 * Read only. Changes nothing, delists nothing.
 *
 * Run: node scripts/audit-listings.mjs
 */

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` }

const jobs = await fetch(
  `${BASE}/rest/v1/jobs?select=slug,title,employer,created_at,deadline,is_rolling,is_active,apply_email,apply_url,last_checked_at&is_active=eq.true&order=created_at`,
  { headers: H },
).then(r => r.json())

const today = new Date()
const days = d => Math.round((today - new Date(d)) / 864e5)
const dayStr = today.toISOString().slice(0, 10)

/* One lookup per distinct domain, not per row: twelve Aluko listings share one
   mail domain and there is no sense asking the resolver twelve times. */
const mxCache = new Map()
async function mxOk(email) {
  if (!email || !email.includes('@')) return null
  const domain = email.split('@').pop().toLowerCase()
  if (mxCache.has(domain)) return mxCache.get(domain)
  /* ⚠ nslookup, NOT node:dns. The first version used dns.resolveMx and reported
     every domain on the board as having no MX, including gmail.com, which was
     the tell. Node's resolver is refused outright in this environment
     (ECONNREFUSED on every lookup), so the check was not finding dead domains,
     it was failing closed and calling everything dead. A verification step that
     cannot tell "no MX" from "could not ask" is worse than none: it produces a
     page of red flags that are all wrong, and the real one hides among them. */
  let ok
  try {
    const out = execFileSync('nslookup', ['-type=MX', domain], { encoding: 'utf8', timeout: 8000 })
    ok = /mail exchanger/i.test(out)
  } catch {
    ok = null   // could not ask. Reported as unknown, never as a failure.
  }
  mxCache.set(domain, ok)
  return ok
}

const rolling = jobs.filter(j => !j.deadline)
const dated = jobs.filter(j => j.deadline)

console.log(`\nACTIVE LISTINGS: ${jobs.length}   rolling: ${rolling.length}   dated: ${dated.length}`)
console.log(`last_checked_at set on ${jobs.filter(j => j.last_checked_at).length} of ${jobs.length}\n`)

console.log('ROLLING, oldest first. Age is the only signal these have:')
for (const j of rolling.sort((a, b) => a.created_at.localeCompare(b.created_at))) {
  const a = days(j.created_at)
  const flag = a >= 60 ? '  <== 60+' : a >= 45 ? '  <== 45+' : a >= 30 ? '  <== 30+' : ''
  console.log(`  ${String(a).padStart(3)}d  ${(j.employer || '').slice(0, 26).padEnd(26)} ${j.title.slice(0, 40)}${flag}`)
}

console.log('\nDATED:')
for (const j of dated.sort((a, b) => a.deadline.localeCompare(b.deadline))) {
  const left = Math.round((new Date(j.deadline) - today) / 864e5)
  const flag = j.deadline < dayStr ? '  <== PAST, THE CRON SHOULD HAVE TAKEN THIS' : ''
  console.log(`  closes ${j.deadline} (${left}d)  ${(j.employer || '').slice(0, 24).padEnd(24)} ${j.title.slice(0, 34)}${flag}`)
}

console.log('\nAPPLY ROUTES:')
const noRoute = []
for (const j of jobs) {
  if (!j.apply_email && !j.apply_url) { noRoute.push(j); continue }
}
for (const [domain] of [...new Set(jobs.filter(j => j.apply_email).map(j => j.apply_email.split('@').pop().toLowerCase()))].map(d => [d])) {
  const ok = await mxOk('x@' + domain)
  const users = jobs.filter(j => (j.apply_email || '').toLowerCase().endsWith('@' + domain)).length
  const label = ok === null ? 'UNKNOWN' : ok ? 'MX ok  ' : 'NO MX  '
  const flag = ok === false ? '   <== UNDELIVERABLE' : ok === null ? '   <== could not resolve, not a finding' : ''
  console.log(`  ${label} ${domain.padEnd(32)} ${users} listing(s)${flag}`)
}
if (noRoute.length) {
  console.log(`\n  ⚠ ${noRoute.length} listing(s) with NO apply route at all:`)
  for (const j of noRoute) console.log(`      ${j.employer} — ${j.title}`)
}

const buckets = [30, 45, 60]
console.log('\nWHAT A CUTOFF WOULD REMOVE:')
for (const b of buckets) {
  const hit = rolling.filter(j => days(j.created_at) >= b)
  const firms = [...new Set(hit.map(j => j.employer))]
  console.log(`  ${b} days: ${String(hit.length).padStart(2)} listing(s) across ${firms.length} employer(s) — board would go ${jobs.length} to ${jobs.length - hit.length}`)
}
