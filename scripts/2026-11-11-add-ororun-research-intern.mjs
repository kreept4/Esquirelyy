/**
 * Add Órọrùn's remote Research Intern seat.
 *
 * Sources, both Órọrùn's own: the posting on their careers platform
 * (careers.ororun.co/jobs/65d4a2e5-98a5-4b37-8f06-e312e61d613d, read through
 * the API the page renders from, api.careers.ororun.co/api/v1/jobs/<id>), and
 * the "Research Intern Needed" poster, which the user sent. Read 11 November
 * 2026.
 *
 * WHAT IS READ AND WHAT IS DECIDED
 *
 *   deadline      2026-11-30. ⚠ THE TWO SOURCES DISAGREE. The poster says
 *                 "Deadline: 20th Dec., 2026"; the posting says the
 *                 application deadline is 30 November 2026, 12:00 UTC, and
 *                 the posting was edited on 11 November, after the poster
 *                 went out. The board takes the posting's date: it is where
 *                 applications are actually made, and it is the earlier of
 *                 the two, so nobody who goes by it misses the round. If
 *                 Órọrùn move it to 20 December, change it here and re-run.
 *   employer      'Órọrùn', with the accents, as the company writes it.
 *   type, level   'internship', 'junior': the posting's experience level is
 *                 "Intern", and it is for LL.B graduates before Law School.
 *   sector        'other': a legal research platform, not a law firm.
 *   location      'Remote', the posting's location and the poster's "Remote
 *                 role".
 *   practice      Arbitration and Dispute Resolution: the platform is
 *                 arbitration case law and arbitrator profiles, and the work
 *                 is researching and uploading those cases. The posting also
 *                 tags Technology Law, which describes the company rather
 *                 than the work, so it is left off.
 *   pay           Left out of the listing at the user's request (11 November).
 *   apply_url     The posting itself. Applications are made on the page
 *                 ("INTERNAL"), with a CV and a cover letter, both required.
 *                 info@ororun.co is the posting's hiring contact, not an
 *                 application route, so apply_email stays null.
 *   about         From the company profile on the same platform.
 *
 * Run: node scripts/2026-11-11-add-ororun-research-intern.mjs           (writes, via .env.local)
 *      node scripts/2026-11-11-add-ororun-research-intern.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the row rather than adding a second one.
 */
import { readFileSync } from 'node:fs'

const rows = [
  {
    id: 'ororun-research-intern-remote',
    slug: 'ororun-research-intern-remote',
    title: 'Research Intern',
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
      "A paid, remote internship for law graduates in the gap year before Law School. The work is Órọrùn's own research: finding cases, uploading them to the platform, and editing what is already there so it stays accurate. You also help run the team of research volunteers, setting their schedules, tracking what they deliver and leading the regular report meetings. Órọrùn's poster calls the seat Assistant Head of Research. Apply on Órọrùn's careers page with a CV and a cover letter by 30 November 2026.",
    requirements: [
      'An LL.B',
      'Taking a gap year while you wait to start Law School',
      'Strong legal research and drafting',
      'Organised enough to run a team of volunteers',
    ],
    apply_url: 'https://careers.ororun.co/jobs/65d4a2e5-98a5-4b37-8f06-e312e61d613d',
    apply_email: null,
    source:
      "Órọrùn's careers platform posting (careers.ororun.co/jobs/65d4a2e5-98a5-4b37-8f06-e312e61d613d) and their Research Intern poster, read 11 November 2026",
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
