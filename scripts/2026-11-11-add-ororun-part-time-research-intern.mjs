/**
 * Add Órọrùn's second seat: the remote Part-Time Research Intern.
 *
 * Sources, both Órọrùn's own: the posting on their careers platform
 * (careers.ororun.co/jobs/a915db31-361e-41fc-afdd-2622ee743b88, read through
 * the API the page renders from), found by listing the company's open jobs
 * there, and the "Part-Time Research Intern Needed" poster, which the user
 * sent. Read 11 November 2026.
 *
 * Same decisions as the full-time seat (2026-11-11-add-ororun-research-intern.mjs):
 *
 *   deadline      2026-11-30, the posting's date. The poster says 20 December
 *                 here too; the posting is where applications are made and
 *                 the earlier date is the safe one.
 *   pay           Left out of the listing, as the user asked for the first
 *                 seat. The listing says it is paid.
 *   who           Law students as well as graduates waiting on Law School,
 *                 which is the difference from the full-time seat. Still
 *                 'internship' and 'junior'.
 *   the work      Research and upload cases, edit case records, and write
 *                 case summaries. No volunteer supervision in this one.
 *   apply_url     The posting itself: applications are made on the page,
 *                 with a CV and a cover letter, both required.
 *
 * Run: node scripts/2026-11-11-add-ororun-part-time-research-intern.mjs           (writes, via .env.local)
 *      node scripts/2026-11-11-add-ororun-part-time-research-intern.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the row rather than adding a second one.
 */
import { readFileSync } from 'node:fs'

const rows = [
  {
    id: 'ororun-part-time-research-intern-remote',
    slug: 'ororun-part-time-research-intern-remote',
    title: 'Part-Time Research Intern',
    employer: 'Órọrùn',
    sector: 'other',
    tier: null,
    type: 'internship',
    level: 'junior',
    location: 'Remote',
    deadline: '2026-11-30',
    is_rolling: false,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Arbitration', 'Dispute Resolution'],
    about:
      "A legal research platform for arbitration, with case law from around the world and verified profiles of arbitrators, built to cut the time dispute resolution research takes. Founded in 2025, with a team of under ten. The name is the Yoruba word for 'easy'.",
    role_desc:
      "A paid, part-time, remote internship for law students, and for law graduates in the gap year before Law School. The work is keeping Órọrùn's research platform up to date: finding cases and uploading them, editing the case records already there, and writing short, clear summaries of the judgments. Apply on Órọrùn's careers page with a CV and a cover letter by 30 November 2026.",
    requirements: [
      'A law student, or an LL.B graduate waiting to start Law School',
      'Strong legal writing, analysis and editing',
      'Careful with detail',
      'Able to work on your own',
    ],
    apply_url: 'https://careers.ororun.co/jobs/a915db31-361e-41fc-afdd-2622ee743b88',
    apply_email: null,
    source:
      "Órọrùn's careers platform posting (careers.ororun.co/jobs/a915db31-361e-41fc-afdd-2622ee743b88) and their Part-Time Research Intern poster, read 11 November 2026",
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
