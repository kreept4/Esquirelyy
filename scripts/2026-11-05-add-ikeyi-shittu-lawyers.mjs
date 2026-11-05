/**
 * Add Ikeyi Shittu & Co's hiring post: lawyers for litigation and commercial
 * transactions, in Lagos, Abuja or Enugu.
 *
 * Source: the firm's own LinkedIn post, "We're hiring", about a week before 5
 * November 2026, read off a screenshot of it.
 *
 * WHY THE EMPLOYER STRING IS "Ikeyi Shittu & Co". It is the `name` on the
 * firm's directory record, so the board row, the ball pit and the email card
 * resolve the firm's mark (served locally, see LOCAL_ONLY_LOGO) and link to its
 * profile. Tier 'Established' matches that record.
 *
 * WHAT IS READ AND WHAT IS INFERRED
 *
 *   deadline      2026-11-13, stated ("The deadline is 13 November 2026").
 *   level         'mid'. The post asks for at least five years of cognate
 *                 post-call experience. The board's bands put mid-level at 3 to
 *                 6 years and senior at 6+, so five years is mid; somebody at
 *                 seven will still find it under no level filter.
 *   location      'Lagos, Abuja or Enugu', stated, and the firm's three
 *                 offices. Hybrid, which the description says.
 *   practice      Dispute Resolution and Corporate & Commercial for the two
 *                 named in the role ("litigation and commercial
 *                 transactions"), plus Tax, Energy & Natural Resources and
 *                 Technology from the post's list of areas it wants knowledge
 *                 of. Labour and employment, maritime, administrative, secured
 *                 transactions, privacy and construction law are in the
 *                 description; the board has no filter value for them.
 *   apply         careers@ikeyishittuco.com, with the job role and the job
 *                 location as the subject, as the post says. Not the info@
 *                 address on the directory record.
 *   apply_url     null. The post links nowhere but the address.
 *
 * Run: node scripts/2026-11-05-add-ikeyi-shittu-lawyers.mjs           (writes, via .env.local)
 *      node scripts/2026-11-05-add-ikeyi-shittu-lawyers.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the row rather than adding a second one.
 */
import { readFileSync } from 'node:fs'

const rows = [
  {
    id: 'ikeyi-shittu-lawyer-litigation-commercial-2026-11',
    slug: 'ikeyi-shittu-lawyer-litigation-commercial-transactions',
    title: 'Lawyer, Litigation and Commercial Transactions',
    employer: 'Ikeyi Shittu & Co',
    sector: 'law_firm',
    tier: 'Established',
    type: 'job',
    level: 'mid',
    location: 'Lagos, Abuja or Enugu',
    deadline: '2026-11-13',
    is_rolling: false,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Dispute Resolution', 'Corporate & Commercial', 'Tax', 'Energy & Natural Resources', 'Technology'],
    about:
      'A corporate and commercial firm with offices in Lagos, Abuja and Enugu, known for tax, infrastructure and employment work for Nigerian conglomerates, multinationals and several of the largest banks.',
    role_desc:
      'Ikeyi Shittu & Co are hiring lawyers with at least five years of post-call experience in litigation and commercial transactions, in Lagos, Abuja or Enugu. The work is hybrid and the salary competitive. The firm wants excellent knowledge of at least one of taxation, labour and employment, energy, maritime, administrative law, secured transactions, privacy, technology, or engineering and construction law. Apply by sending your CV to careers@ikeyishittuco.com with the job role and your preferred location as the subject. Applications close on 13 November 2026.',
    requirements: [
      'An LL.B from an accredited university at First Class or Second Class Upper',
      'An LL.M or other advanced degree is a plus',
      'At least 5 years of cognate experience as a practising lawyer, with significant experience in litigation and commercial transactions',
      'Strong analytical, research and writing skills',
      'Excellent communication and interpersonal skills',
    ],
    apply_url: null,
    apply_email: 'careers@ikeyishittuco.com',
    source: 'Ikeyi Shittu & Co LinkedIn hiring post, late October 2026',
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
