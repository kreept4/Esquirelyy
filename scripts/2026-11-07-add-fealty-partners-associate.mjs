/**
 * Add Fealty Partners LP's dispute resolution associate seat.
 *
 * Source: the firm's own "Join Our Team" notice, November 2026, which carries
 * the requirements and the mailbox. Checked against fealtypartners.ng.
 *
 * WHAT IS READ AND WHAT IS INFERRED
 *
 *   level      'mid'. "Minimum of 4 years post qualification experience",
 *              the board's 3 to 6 band, and the seat is an associate's.
 *   location   'Victoria Island, Lagos', INFERRED. The notice names no
 *              office; the firm's site gives one, Plot 1673 Oyin Jolayemi
 *              Street, Victoria Island.
 *   deadline   null, and not rolling. The notice sets no closing date and
 *              does not say applications are reviewed as they arrive, so
 *              neither is claimed. The description tells readers to apply
 *              early, which is true either way.
 *   apply      CV and cover letter to info@fealtypartner.com. The address
 *              looks like a typo against the fealtypartners.ng site, and is
 *              not: the site prints the same address, and fealtypartner.com
 *              has live Microsoft 365 mail records. Kept exactly as given.
 *
 * Run: node scripts/2026-11-07-add-fealty-partners-associate.mjs           (writes, via .env.local)
 *      node scripts/2026-11-07-add-fealty-partners-associate.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the row rather than adding a second one.
 */
import { readFileSync } from 'node:fs'

const rows = [
  {
    id: 'fealty-partners-dispute-resolution-associate-2026-11',
    slug: 'fealty-partners-dispute-resolution-associate',
    title: 'Dispute Resolution Associate',
    employer: 'Fealty Partners LP',
    sector: 'law_firm',
    tier: null,
    type: 'job',
    level: 'mid',
    location: 'Victoria Island, Lagos',
    deadline: null,
    is_rolling: false,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Dispute Resolution'],
    about: 'A law firm based in Victoria Island, Lagos.',
    role_desc:
      'Fealty Partners are hiring a dispute resolution associate with at least four years of post-qualification experience. The seat calls for strong research and drafting, real courtroom advocacy, sound judgement on litigation strategy, good client relationships, and the independence to run matters to deadline. Apply by sending your CV and a cover letter to info@fealtypartner.com. No closing date is set, so apply early.',
    requirements: [
      "At least 4 years' post-qualification experience",
      'Strong legal research and drafting skills',
      'Excellent advocacy and courtroom skills',
      'Sound judgement and a strong understanding of litigation strategy',
      'Strong client relationship management and communication skills',
      'Able to manage transactions, meet deadlines and work independently',
    ],
    apply_url: null,
    apply_email: 'info@fealtypartner.com',
    source: 'Fealty Partners LP "Join Our Team" notice, November 2026; office from fealtypartners.ng',
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
