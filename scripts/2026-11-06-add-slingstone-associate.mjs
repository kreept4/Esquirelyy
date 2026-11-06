/**
 * Add Slingstone LP's associate seat in Lekki.
 *
 * Source: the firm's own "We're Hiring! Associate" notice, November 2026,
 * which carries the requirements, the mailbox and the deadline.
 *
 * WHAT IS READ AND WHAT IS INFERRED
 *
 *   title         'Associate', as the notice names it.
 *   deadline      2026-11-16, stated ("Deadline: November 16, 2026").
 *   level         'mid'. 4+ years' post-call sits in the board's 3 to 6 band,
 *                 and the seat is an associate's, not a senior associate's.
 *   location      'Lekki, Lagos', INFERRED. The notice names no office. The
 *                 firm's site (slingstonelaw.com) gives one address, 22 Dr.
 *                 Omon Ebhomenye Street, off Admiralty Way, Lekki Phase I,
 *                 and no other, so the seat is filed there. Revisit if they
 *                 say otherwise.
 *   practice      Dispute Resolution and Corporate & Commercial: the notice
 *                 takes either, "litigation; or corporate and commercial
 *                 transactions", so a reader filtering by either should find it.
 *   apply         CV to hello@slingstonelaw.com, as the notice says. It names
 *                 no subject line, so the description invents none.
 *   about         From the firm's own site: its office, and the subjects of
 *                 the reports it publishes (fintech, digital assets, tax and
 *                 regulation). Nothing graded.
 *
 * Run: node scripts/2026-11-06-add-slingstone-associate.mjs           (writes, via .env.local)
 *      node scripts/2026-11-06-add-slingstone-associate.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the row rather than adding a second one.
 */
import { readFileSync } from 'node:fs'

const rows = [
  {
    id: 'slingstone-associate-2026-11',
    slug: 'slingstone-associate-lekki',
    title: 'Associate',
    employer: 'Slingstone LP',
    sector: 'law_firm',
    tier: null,
    type: 'job',
    level: 'mid',
    location: 'Lekki, Lagos',
    deadline: '2026-11-16',
    is_rolling: false,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Dispute Resolution', 'Corporate & Commercial'],
    about:
      'A Lagos law firm based in Lekki Phase I, whose published reports cover fintech, digital assets, tax and regulation.',
    role_desc:
      'Slingstone LP are hiring an associate with four or more years of post-call experience in either litigation or corporate and commercial transactions. They want strong analytical and commercial judgement, a good sense of personal responsibility and the ability to work collaboratively, and they are plain about the rest: no difficult genius energy, because they value brilliance but kindness is non-negotiable. Apply by sending your CV to hello@slingstonelaw.com. Applications close on 16 November 2026.',
    requirements: [
      "4+ years' post-call experience in litigation, or in corporate and commercial transactions",
      'Strong analytical and commercial judgement',
      'A good sense of personal responsibility and the ability to work collaboratively',
      'Kindness as well as brilliance: the firm says it has no room for difficult genius energy',
    ],
    apply_url: null,
    apply_email: 'hello@slingstonelaw.com',
    source: 'Slingstone LP "We\'re Hiring! Associate" notice, November 2026',
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
