/**
 * Set each role's level from the experience the posting actually states, not
 * from what its title sounds like.
 *
 * The seed script inferred level from the title: anything called "Associate"
 * became mid, "Senior Associate" senior, and "Assistant Company Secretary"
 * junior because "assistant" reads junior. That last one asks for seven years.
 * Filing it as entry level is the worst kind of wrong on a careers site: it puts
 * a senior role in front of graduates and hides it from the people who qualify.
 *
 * Banding, applied to the minimum years the posting states:
 *   under 3   -> junior   (entry level)
 *   3 to 6    -> mid
 *   7 and up  -> senior
 *
 * Where a posting states no minimum the existing level is left alone rather than
 * guessed at again, and the row is reported so it can be checked by hand.
 *
 * Run: node scripts/fix-role-levels.mjs
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
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const ATS = 'https://aluko-oyebode.hua.hrsmart.com/hr/ats/Posting/view/'
const IDS = [53, 52, 51, 43, 40, 35, 34, 27, 23, 22, 21, 20]

function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
}

/** Highest stated minimum wins: a posting may mention several spans, and the
 *  binding requirement is the largest one it asks for. */
function statedYears(text) {
  const t = text.toLowerCase()
  const found = []
  const patterns = [
    /minimum of (\d{1,2})\s*(?:\+)?\s*years?/g,
    /at least (\d{1,2})\s*(?:\+)?\s*years?/g,
    /(\d{1,2})\s*(?:\+|plus)?\s*years?\s*(?:of\s*)?(?:relevant\s*)?(?:post[- ]?(?:call|qualification)|pqe|experience)/g,
    /not less than (\d{1,2})\s*years?/g,
  ]
  for (const re of patterns) {
    for (const m of t.matchAll(re)) {
      const n = parseInt(m[1], 10)
      if (n >= 1 && n <= 30) found.push(n)
    }
  }
  return found.length ? Math.max(...found) : null
}

const levelFor = y => (y >= 7 ? 'senior' : y >= 3 ? 'mid' : 'junior')

const report = []

for (const id of IDS) {
  try {
    const res = await fetch(ATS + id, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) })
    const years = statedYears(toText(await res.text()))
    const rowId = `aluko-ats-${id}`

    const cur = await fetch(`${URL_BASE}/rest/v1/jobs?id=eq.${rowId}&select=title,level,requirements`, { headers: H })
    const [row] = await cur.json()
    if (!row) { console.log(`${rowId} not found`); continue }

    if (years === null) {
      report.push({ rowId, title: row.title, from: row.level, to: row.level, years: '-', note: 'no minimum stated, left as is' })
      continue
    }

    const to = levelFor(years)

    // Keep the eligibility line honest as well: it is derived from the same
    // number, so a wrong level usually means a wrong or missing bullet too.
    const reqs = (row.requirements || []).filter(r => !/^minimum \d+ years post-call/i.test(r))
    reqs.push(`Minimum ${years} years post-call experience`)

    await fetch(`${URL_BASE}/rest/v1/jobs?id=eq.${rowId}`, {
      method: 'PATCH',
      headers: H,
      body: JSON.stringify({ level: to, requirements: reqs }),
    })
    report.push({ rowId, title: row.title, from: row.level, to, years })
  } catch (err) {
    console.log(`${id} ERROR ${err.message}`)
  }
}

console.log('\n  years  level              title')
for (const r of report.sort((a, b) => String(b.years).localeCompare(String(a.years)))) {
  const moved = r.from !== r.to ? `${r.from} -> ${r.to}` : r.to
  console.log(`  ${String(r.years).padStart(4)}   ${moved.padEnd(18)} ${r.title.slice(0, 48)}${r.note ? '   (' + r.note + ')' : ''}`)
}
const changed = report.filter(r => r.from !== r.to)
console.log(`\n${changed.length} level(s) corrected`)
