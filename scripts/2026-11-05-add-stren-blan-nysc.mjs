/**
 * Add Stren & Blan Partners' 2027 NYSC trainee associate recruitment.
 *
 * Source: the firm's "Join Our Team" flier, "2027 NYSC Recruitment, Trainee
 * Associates", signed with the firm's mark and www.strenandblan.com.
 *
 * WHY THE EMPLOYER STRING IS "Stren & Blan Partners". It is the `name` on the
 * firm's record in lib/firms-data.ts, so firmForEmployer resolves it, and that
 * is what puts the firm's mark on the board row, in the ball pit and on the
 * email card, and links the row to its directory page. The tier, 'Established',
 * matches that record for the same reason the Punuka script gives: the board and
 * the profile must not disagree about the firm.
 *
 * WHAT IS READ AND WHAT IS INFERRED
 *
 *   deadline      2026-11-13, stated ("Friday, November 13th, 2026").
 *   level         'junior'. These are seats for corps members in the 2027 NYSC
 *                 year, so the newly called. The schema has an 'nysc' level but
 *                 the board's filter does not offer it, and a row filed under a
 *                 value nobody can select is a row the Entry-level filter cannot
 *                 find. 'junior' is what the board calls entry level.
 *   location      'Lagos, Abuja or Enugu'. ⚠ INFERRED: the flier names no
 *                 office. Those are the firm's three offices on its directory
 *                 record. matchesState() is a substring test, so each city's
 *                 filter finds the row, and the description says plainly that
 *                 the flier does not say which.
 *   practice      none. A trainee seat is not a practice seat, and guessing one
 *                 would put it in front of readers filtering for that work under
 *                 false pretences. It still answers search, type and level.
 *   apply         the flier's link, bit.ly/2027SBPTARECRUITMENT, which redirects
 *                 to a Microsoft Form. apply_url is the form itself, so the
 *                 board does not send readers through a shortener.
 *
 * Run: node scripts/2026-11-05-add-stren-blan-nysc.mjs           (writes, via .env.local)
 *      node scripts/2026-11-05-add-stren-blan-nysc.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the row rather than adding a second one.
 */
import { readFileSync } from 'node:fs'

const rows = [
  {
    id: 'stren-blan-trainee-associate-nysc-2027',
    slug: 'stren-blan-trainee-associate-2027-nysc',
    title: 'Trainee Associate, 2027 NYSC',
    employer: 'Stren & Blan Partners',
    sector: 'law_firm',
    tier: 'Established',
    type: 'job',
    level: 'junior',
    location: 'Lagos, Abuja or Enugu',
    deadline: '2026-11-13',
    is_rolling: false,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: [],
    about:
      'A full-service commercial law firm with offices in Lagos, Abuja and Enugu, working across transactions, disputes and regulatory matters.',
    role_desc:
      'Stren & Blan Partners are recruiting trainee associates from the 2027 NYSC batch, for a service year at the firm. The flier does not say which office the seats are in; the firm has offices in Lagos, Abuja and Enugu. Apply through the firm\'s application form. Applications close on Friday 13 November 2026.',
    requirements: [
      'An LL.B with at least Second Class Honours, Upper Division (2:1)',
      'Due to serve in the 2027 NYSC year',
    ],
    apply_url: 'https://forms.cloud.microsoft/r/vspzb9xNpt',
    apply_email: null,
    source: 'Stren & Blan Partners "Join Our Team" 2027 NYSC recruitment flier (bit.ly/2027SBPTARECRUITMENT), November 2026',
  },
]

if (process.argv.includes('--sql')) {
  const q = v =>
    v === null ? 'null'
    : typeof v === 'boolean' ? String(v)
    : Array.isArray(v) ? (v.length ? `array[${v.map(q).join(', ')}]::text[]` : `'{}'::text[]`)
    : `'${String(v).replace(/'/g, "''")}'`
  const cols = Object.keys(rows[0])
  const values = rows.map(r => `(${cols.map(c => q(r[c])).join(', ')})`).join(',\n')
  const update = cols.filter(c => c !== 'id').map(c => `${c} = excluded.${c}`).join(', ')
  console.log(`insert into jobs (${cols.join(', ')}) values\n${values}\non conflict (id) do update set ${update}, updated_at = now();`)
  process.exit(0)
}

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

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify(rows),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
for (const r of body) console.log('wrote:', r.slug, '-', r.title)
