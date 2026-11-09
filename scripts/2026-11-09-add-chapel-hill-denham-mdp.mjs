/**
 * Add Chapel Hill Denham's 2027 Management Development Programme.
 *
 * Sources, all the firm's own: the programme page at
 * chapelhilldenham.com/careers/management-development-programme (where the
 * poster's bit.ly link lands), the posting on their recruitment portal that
 * page's Apply button opens, the contact page for the offices, and the 2027
 * MDP poster. Read 9 November 2026.
 *
 * WHY A FINANCE PROGRAMME IS ON A LEGAL CAREERS BOARD
 *
 * The same reason Heirs Holdings' and Andersen's graduate intakes are: it takes
 * law graduates. The requirement is a bachelor's degree at 2:1 with no subject
 * named, so an LL.B qualifies. But it is a finance career, investment banking
 * and investment management, with no legal or compliance track, and the
 * description says so in its second sentence so nobody reads it as a legal
 * seat. sector is 'other' for the reason set out in the Andersen script: the
 * filter is about what the employer is.
 *
 * WHAT IS READ AND WHAT IS INFERRED
 *
 *   deadline      2026-11-30. The poster says "Monday, 30 November 2026"; the
 *                 portal read "Expires 3 weeks from now" on 9 November, which
 *                 agrees.
 *   location      'Lagos', the portal's location. The firm also has an Abuja
 *                 office (Mabon Place, 46 Gana Street, Maitama, per its
 *                 contact page), but neither the programme page nor the
 *                 posting mentions it, so the description says the programme
 *                 is in Lagos and that applying is online from anywhere.
 *   "any subject" Inferred from the requirement naming no subject. Not stated.
 *   practice      Capital Markets and Banking & Finance: the nearest of the
 *                 board's areas to the firm's own description of itself
 *                 ("investment banking, securities trading and investment
 *                 management"), so the listing reaches members filtering for
 *                 finance-side work.
 *   apply_url     The portal posting exactly as the programme page links it.
 *
 * Run: node scripts/2026-11-09-add-chapel-hill-denham-mdp.mjs           (writes, via .env.local)
 *      node scripts/2026-11-09-add-chapel-hill-denham-mdp.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the row rather than adding a second one.
 */
import { readFileSync } from 'node:fs'

const rows = [
  {
    id: 'chapel-hill-denham-2027-management-development-programme',
    slug: 'chapel-hill-denham-2027-management-development-programme',
    title: '2027 Management Development Programme',
    employer: 'Chapel Hill Denham',
    sector: 'other',
    tier: null,
    type: 'job',
    level: 'junior',
    location: 'Lagos',
    deadline: '2026-11-30',
    is_rolling: false,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Capital Markets', 'Banking & Finance'],
    about:
      'An independent investment banking, securities trading and investment management firm, with offices in Lagos, Abuja and Accra.',
    role_desc:
      'Chapel Hill Denham, an investment bank in Lagos, are taking graduates onto their 2027 Management Development Programme. Trainees work across investment banking, securities trading and investment management, and are trained in class and on the job. Law graduates can apply, as any degree at 2:1 or above is accepted. The programme is full-time in Lagos. Apply online by 30 November 2026.',
    /* Written for the reader this board has, a law graduate: the firm's
       "bachelor's degree" becomes an LL.B, which is the degree they hold. */
    requirements: [
      'An LL.B with a Second Class Upper or First Class',
      'Fresh graduate, or no more than 3 years of work experience',
      'Completed NYSC',
      'A finance qualification such as ACA, ACCA, CFA or CIS is a plus, but not required',
    ],
    apply_url: 'https://recruitment.chapelhilldenham.com/job/view/11051?application_source=Direct',
    apply_email: null,
    source:
      "Chapel Hill Denham's programme page (chapelhilldenham.com/careers/management-development-programme), its recruitment portal posting (recruitment.chapelhilldenham.com/job/view/11051), its contact page and the 2027 MDP poster, read 9 November 2026",
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
