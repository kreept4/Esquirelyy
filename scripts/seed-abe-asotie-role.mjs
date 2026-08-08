/**
 * Add the Abe & Asotie LP lawyer vacancy.
 *
 * Source: the firm's own recruitment flier, which carries three marks — Abe &
 * Asotie LP, Gen for IMAGE and the Build the Next Africa Initiative — and reads,
 * in full:
 *
 *   "We're Hiring a Lawyer. Within 0-2 years post-call experience to provide
 *    legal support to an NGO focused on Legal Aid and Prison Decongestion.
 *    Apply by sending your CV and Cover Letter to: info@abeandasotie.com"
 *
 * That is the whole of the posting, and this row says no more than it does.
 *
 * WHAT IS NOT HERE, AND WHY
 *
 *   apply_url    null. There is no posting URL — the flier gives an address and
 *                nothing else — and the firm publishes no careers page. A link
 *                to abeandasotie.com would look like an apply link and lead to
 *                a homepage with no vacancy on it, which is worse than no link.
 *   deadline     null, is_rolling true. The flier states no closing date. That
 *                is genuinely open-ended, not a date we failed to read.
 *   requirements One line, because the flier lists one. The obvious extras —
 *                LL.B, called to the Bar — are implied by "post-call" and
 *                padding the list out would be writing the firm's advert for
 *                them.
 *
 * `level` is 'junior'. The board's bands are student / junior / mid / senior,
 * and 0-2 years post-call is the junior band exactly; NYSC and pre-call
 * candidates map to 'student' and are not eligible for this one.
 *
 * Run: node scripts/seed-abe-asotie-role.mjs
 * Idempotent — re-running updates the row rather than adding a second.
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
if (!KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env.local')

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const row = {
  id: 'abe-asotie-lawyer-ngo',
  slug: 'abe-asotie-lawyer-legal-aid',
  title: 'Lawyer (Legal Aid and Prison Decongestion)',
  employer: 'Abe & Asotie LP',
  sector: 'law_firm',
  // Matches the directory record. The firm is in its second year and is banded
  // Boutique there; the two must agree or the board and the profile disagree
  // about the same firm.
  tier: 'Boutique',
  type: 'job',
  level: 'junior',
  // Not stated on the flier, but the firm has one office and it is in Lagos.
  // This is the only field here that is inferred rather than read, and it is
  // inferred from the firm's own published address.
  location: 'Lagos',
  deadline: null,
  is_rolling: true,
  // Verified in the strong sense: read off the employer's own recruitment
  // material, not an aggregator's repost.
  is_verified: true,
  is_closing_soon: false,
  practice_areas: ['Public Law & Regulatory', 'Dispute Resolution'],
  about:
    'A full-service Lagos firm working across corporate and commercial practice, dispute resolution, banking and finance, energy, aviation, shipping, tax and ESG, for individuals, companies and not-for-profits. Founded in 2025 and growing quickly, from an office in the Lagos Court of Arbitration building at Lekki.',
  role_desc:
    'Legal support to an NGO working on legal aid and prison decongestion, placed through the firm. Pre-trial detention is the largest part of Nigeria’s prison population, and the work behind that figure is case file review, bail applications and moving matters that have stopped moving. Open to 0-2 years post-call, so it is one of the few routes into public interest work that does not ask for experience first.',
  requirements: ['0-2 years post-call experience'],
  apply_url: null,
  apply_email: 'info@abeandasotie.com',
  source: 'Abe & Asotie LP recruitment flier',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
console.log('wrote:', body[0].slug, '—', body[0].title)
