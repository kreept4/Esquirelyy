/**
 * Add Adeola Oyinlade & Co's commercial lawyer seats in Yaba.
 *
 * Sources, both the firm's own: its LinkedIn post "WE ARE HIRING: COMMERCIAL
 * LAWYERS", which carries the requirements, the application route and the
 * deadline; and the "we're hiring" notice posted with it, which states the same
 * qualifications in shorter form and names the documents to send.
 *
 * Their second opening on the board, beside the senior litigation seat added
 * on 5 November (scripts/2026-11-05-add-adeola-oyinlade-litigation.mjs). Same
 * office, same mailbox, same closing date; a different seat at a different
 * level, so it is its own row rather than a note on that one.
 *
 * WHAT IS READ AND WHAT IS INFERRED
 *
 *   title         'Commercial Lawyer', the post's "Role:" line. "Lawyers"
 *                 plural in the heading, so the description says seats.
 *   deadline      2026-11-20, stated in both ("no later than 20th November
 *                 2026", "Closing Date: 20th November, 2026").
 *   level         'mid'. 3 to 6 years of cognate post-call experience is the
 *                 board's mid band exactly.
 *   location      'Yaba, Lagos', stated ("Alagomeji, Yaba, Lagos").
 *   practice      Corporate & Commercial: commercial transactions and company
 *                 secretarial services are the whole of the seat. The list of
 *                 additional fields (tax, employment, energy and so on) is a
 *                 requirement on the candidate, not a description of the
 *                 work, so it is in `requirements` and not here.
 *
 * ⚠ THE TWO SOURCES DIFFER IN TWO PLACES, AND THE ROW TAKES THE MORE SPECIFIC.
 *
 *   Class of degree. The post says "First-Class or Second-Class Upper/2.1";
 *   the notice shortens it to "first-class or second-class degree", which read
 *   alone would admit a 2:2. The post is the fuller statement and the notice
 *   is a summary of it, so the requirement is a First or a 2:1.
 *
 *   What to send. The post says CVs, with the job role as the subject; the
 *   notice says "Send CV and Cover Letter". Sending both is never wrong and
 *   leaving out a letter the firm asked for can be, so the row asks for both,
 *   with "Commercial Lawyer" as the subject.
 *
 * Run: node scripts/2026-11-06-add-adeola-oyinlade-commercial.mjs           (writes, via .env.local)
 *      node scripts/2026-11-06-add-adeola-oyinlade-commercial.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the row rather than adding a second one.
 */
import { readFileSync } from 'node:fs'

const rows = [
  {
    id: 'adeola-oyinlade-commercial-lawyer-2026-11',
    slug: 'adeola-oyinlade-commercial-lawyer-yaba',
    title: 'Commercial Lawyer',
    employer: 'Adeola Oyinlade & Co',
    sector: 'law_firm',
    tier: null,
    type: 'job',
    level: 'mid',
    location: 'Yaba, Lagos',
    deadline: '2026-11-20',
    is_rolling: false,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Corporate & Commercial'],
    about:
      'Barristers, solicitors and legal consultants based in Alagomeji, Yaba, Lagos.',
    role_desc:
      'Adeola Oyinlade & Co are hiring commercial lawyers for their office in Alagomeji, Yaba. The work is commercial transactions and company secretarial services, and the seats are full-time. They want 3 to 6 years of cognate post-call experience, excellent knowledge of company and commercial law, and expertise in at least one further field: taxation, labour and employment, energy, maritime, secured transactions, privacy, IT, or engineering and construction law. Apply by sending your CV and a cover letter to hr@adeolaoyinlade.com with "Commercial Lawyer" as the subject. Applications close on 20 November 2026, and only shortlisted candidates will be contacted.',
    requirements: [
      'An LL.B at First Class or Second Class Upper (2:1)',
      'Called to the Nigerian Bar and a member of the Nigerian Bar Association',
      '3 to 6 years of cognate post-call experience in commercial transactions and company secretarial services',
      'Excellent knowledge of company and commercial law',
      'Expertise in at least one of taxation, labour and employment, energy, maritime, secured transactions, privacy, IT, or engineering and construction law',
    ],
    apply_url: null,
    apply_email: 'hr@adeolaoyinlade.com',
    source: 'Adeola Oyinlade & Co LinkedIn post "WE ARE HIRING: COMMERCIAL LAWYERS" and the notice posted with it, November 2026',
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
