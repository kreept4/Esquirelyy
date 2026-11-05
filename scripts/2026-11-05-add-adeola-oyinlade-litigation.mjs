/**
 * Add Adeola Oyinlade & Co's senior associate (litigation) seat in Yaba.
 *
 * Sources, both the firm's own: its LinkedIn post "JOB OPENING: LITIGATION
 * LAWYER", a day before 5 November 2026, which carries the responsibilities,
 * the application route and the deadline; and the "We are HIRING" flier
 * posted with it, which names the seat Senior Associate.
 *
 * WHY THE EMPLOYER STRING IS "Adeola Oyinlade & Co". It is how the firm signs
 * the post and the flier. The firm is not in the directory, so the string only
 * has to match its key in EMPLOYER_LOGOS (lib/firms-data.ts), added with this.
 *
 * WHAT IS READ AND WHAT IS INFERRED
 *
 *   deadline      2026-11-20, stated ("Application Deadline: 20th November
 *                 2026").
 *   level         'senior'. The flier's title is Senior Associate and the
 *                 range is 5 to 10 years post-call; the board's senior band is
 *                 6+, which covers most of that range and the title outright.
 *   location      'Yaba, Lagos', stated ("Alagomeji, Yaba, Lagos").
 *   practice      Dispute Resolution, the whole of the seat.
 *   apply         hr@adeolaoyinlade.com, CV and cover letter, subject
 *                 "Litigation Lawyer", as the post says. Only shortlisted
 *                 candidates are contacted, which the description repeats.
 *   tier          null. Not in the directory, so there is nothing to agree
 *                 with and no basis for a grade.
 *
 * Run: node scripts/2026-11-05-add-adeola-oyinlade-litigation.mjs           (writes, via .env.local)
 *      node scripts/2026-11-05-add-adeola-oyinlade-litigation.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the row rather than adding a second one.
 */
import { readFileSync } from 'node:fs'

const rows = [
  {
    id: 'adeola-oyinlade-senior-associate-litigation-2026-11',
    slug: 'adeola-oyinlade-senior-associate-litigation-yaba',
    title: 'Senior Associate, Litigation',
    employer: 'Adeola Oyinlade & Co',
    sector: 'law_firm',
    tier: null,
    type: 'job',
    level: 'senior',
    location: 'Yaba, Lagos',
    deadline: '2026-11-20',
    is_rolling: false,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Dispute Resolution'],
    about:
      'Barristers, solicitors and legal consultants based in Alagomeji, Yaba, Lagos.',
    role_desc:
      'Adeola Oyinlade & Co are hiring a senior associate to lead litigation from their office in Alagomeji, Yaba. The seat is full-time and the pay competitive and set by experience. The work is court representation and advocacy, drafting pleadings, briefs, agreements and opinions, legal research and advice, and managing clients and cases with the partners, plus contributing to the firm\'s articles. Apply by sending your CV and a cover letter to hr@adeolaoyinlade.com with "Litigation Lawyer" as the subject. Applications close on 20 November 2026, and only shortlisted candidates will be contacted.',
    requirements: [
      'An LL.B, and called to the Nigerian Bar',
      '5-10 years post-call, with a strong emphasis on litigation',
      'A proven trial advocate with a solid grasp of procedural law',
      'Excellent drafting, analytical and research skills',
      'Comfortable with legal research software and general digital tools',
      'Able to manage cases independently with minimal supervision',
    ],
    apply_url: null,
    apply_email: 'hr@adeolaoyinlade.com',
    source: 'Adeola Oyinlade & Co LinkedIn post "JOB OPENING: LITIGATION LAWYER" and the "We are HIRING" flier with it, November 2026',
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
