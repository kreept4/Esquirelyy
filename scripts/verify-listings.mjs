/**
 * Ask every listing's own application route whether it is still open.
 *
 * ============================================================
 * WHY THIS EXISTS RATHER THAN AN AGE CUTOFF
 * ============================================================
 *
 * The obvious fix for a board where 21 of 24 rows are rolling is a rule: delist
 * anything older than N days. That was proposed, and checking the actual
 * sources killed it. Aluko's ATS lists seventeen open postings and all twelve
 * of ours are in it, forty-eight days after they went up. A 45-day cutoff would
 * have deleted twelve roles a reader could still apply for today.
 *
 * Age is not evidence. It is a proxy that happens to be free, and the thing it
 * proxies for is "has anyone checked", which is a question with a real answer.
 * This asks it.
 *
 * ============================================================
 * ⚠ THREE OUTCOMES, AND "UNKNOWN" IS A RESULT RATHER THAN A FAILURE
 * ============================================================
 *
 *   open      the source positively says so, or the posting is still listed
 *   closed    the source positively says so: a 404, a gone page, a form that
 *             has stopped accepting responses
 *   unknown   we could not tell, which includes every 200 we cannot read
 *
 * That third one is the whole discipline. An earlier audit script used
 * node:dns, which is refused in this environment, and reported every mail
 * domain on the board as dead, gmail.com included. It was not finding faults,
 * it was failing closed and calling everything a fault. A check that cannot
 * distinguish "dead" from "could not ask" is worse than no check: every flag is
 * wrong, and a real one hides among them.
 *
 * So only `closed` ever delists anything, and it takes a positive signal.
 *
 * ============================================================
 * PER SOURCE, BECAUSE "IS IT LIVE" HAS NO GENERIC ANSWER
 * ============================================================
 *
 *   hrsmart     Aluko's ATS. Its own viewAll page lists every open posting, so
 *               membership of that list is authoritative and costs ONE request
 *               for all twelve rows rather than twelve.
 *   Google form a closed form serves "no longer accepting responses" in the
 *               body. An open one does not.
 *   anything    HTTP status only. 404 and 410 are closed. A 200 is UNKNOWN,
 *   else        not open: an ATS that serves a "this position has been filled"
 *               page also returns 200, and guessing from the body across
 *               Zoho, Workday, Cornerstone and half a dozen firm sites is how
 *               a checker starts lying.
 *
 * Listings that apply by email have no route to check at all and are reported
 * as such. They need a human or a note to the firm, not a rule.
 *
 * ============================================================
 * RUNNING IT
 * ============================================================
 *
 * DRY RUN BY DEFAULT. It writes nothing and prints what it found.
 *   node scripts/verify-listings.mjs
 *
 * --apply writes `last_checked_at` on everything it could reach, and delists
 * only the rows that came back positively closed.
 *   node scripts/verify-listings.mjs --apply
 */

import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!BASE || !KEY) throw new Error('Supabase env missing from .env.local')
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const APPLY = process.argv.includes('--apply')

const jobs = await fetch(
  `${BASE}/rest/v1/jobs?select=slug,title,employer,apply_url,apply_email,created_at,deadline,is_rolling&is_active=eq.true&order=created_at`,
  { headers: H },
).then(r => r.json())

const get = async (url, ms = 25000) => {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), ms)
  try {
    const r = await fetch(url, { redirect: 'follow', signal: c.signal })
    return { status: r.status, body: r.ok ? await r.text() : '' }
  } catch {
    return { status: 0, body: '' }
  } finally {
    clearTimeout(t)
  }
}

/* One request for every hrsmart row on the board. Cached by host so a second
   firm on the same ATS costs one more, not one per listing. */
const atsCache = new Map()
async function hrsmartOpenIds(host) {
  if (atsCache.has(host)) return atsCache.get(host)
  const { body } = await get(`https://${host}/hr/ats/JobSearch/viewAll`)
  const ids = new Set([...body.matchAll(/Posting\/view\/(\d+)/g)].map(m => m[1]))
  atsCache.set(host, ids.size ? ids : null)
  return atsCache.get(host)
}

async function verify(job) {
  const url = job.apply_url
  if (!url) return { state: 'no-route', why: job.apply_email ? 'applies by email' : 'no route at all' }

  let u
  try { u = new URL(url) } catch { return { state: 'unknown', why: 'unparseable url' } }

  if (u.hostname.endsWith('hrsmart.com')) {
    const id = (u.pathname.match(/Posting\/view\/(\d+)/) || [])[1]
    const open = await hrsmartOpenIds(u.hostname)
    if (!open) return { state: 'unknown', why: 'ats list unreadable' }
    if (!id) return { state: 'unknown', why: 'no posting id in url' }
    return open.has(id)
      ? { state: 'open', why: `listed on the ATS (posting ${id})` }
      : { state: 'closed', why: `posting ${id} is no longer on the ATS list` }
  }

  const { status, body } = await get(url)
  if (status === 404 || status === 410) return { state: 'closed', why: `HTTP ${status}` }
  if (status === 0) return { state: 'unknown', why: 'request failed or timed out' }

  if (/docs\.google\.com|forms\.gle/.test(u.hostname + u.pathname) || /forms\.gle/.test(url)) {
    if (/no longer accepting responses/i.test(body)) {
      return { state: 'closed', why: 'form has stopped accepting responses' }
    }
    return { state: 'open', why: 'form still accepting' }
  }

  return { state: 'unknown', why: `HTTP ${status}, body not interpreted for this source` }
}

const results = []
for (const j of jobs) {
  const r = await verify(j)
  results.push({ ...j, ...r })
  const age = Math.round((Date.now() - new Date(j.created_at)) / 864e5)
  console.log(
    `  ${r.state.toUpperCase().padEnd(9)} ${String(age).padStart(3)}d  ` +
    `${(j.employer || '').slice(0, 22).padEnd(22)} ${j.title.slice(0, 34).padEnd(34)} ${r.why}`,
  )
}

const by = k => results.filter(r => r.state === k)
console.log(
  `\nopen ${by('open').length}   closed ${by('closed').length}   ` +
  `unknown ${by('unknown').length}   no route ${by('no-route').length}   of ${results.length}`,
)

if (by('closed').length) {
  console.log('\nPositively closed, and the only rows --apply would delist:')
  for (const r of by('closed')) console.log(`  ${r.employer} — ${r.title}\n     ${r.why}`)
}
if (by('no-route').length) {
  console.log('\nNo route to check. These need a person, not a rule:')
  for (const r of by('no-route')) console.log(`  ${r.employer} — ${r.title} (${r.why})`)
}

if (!APPLY) {
  console.log('\nDry run. Nothing written. Add --apply to record checks and delist the closed rows.')
  process.exit(0)
}

const stamp = new Date().toISOString()
let checked = 0
for (const r of results) {
  if (r.state === 'no-route') continue
  await fetch(`${BASE}/rest/v1/jobs?slug=eq.${encodeURIComponent(r.slug)}`, {
    method: 'PATCH', headers: H, body: JSON.stringify({ last_checked_at: stamp }),
  })
  checked++
}
console.log(`\nlast_checked_at written on ${checked} row(s).`)

for (const r of by('closed')) {
  await fetch(`${BASE}/rest/v1/jobs?slug=eq.${encodeURIComponent(r.slug)}`, {
    method: 'PATCH', headers: H,
    body: JSON.stringify({
      is_active: false,
      delisted_at: stamp,
      /* Same three columns a human delisting writes, and the same shape the
         expire cron writes, so an automatic removal is as reversible and as
         legible as a considered one. */
      delisted_reason: `Verified closed at source: ${r.why}`,
    }),
  })
  console.log(`  delisted ${r.slug}`)
}
