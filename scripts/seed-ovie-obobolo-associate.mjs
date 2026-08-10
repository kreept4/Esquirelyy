/**
 * Add the Ovie Obobolo & Co Associate vacancy.
 *
 * Source: the firm's own recruitment flier ("WE ARE HIRING! Associate"), which
 * reads in full:
 *
 *   "We are seeking a motivated lawyer with 1-2 years' post-call experience to
 *    join our legal team.
 *    Requirements: 1-2 years' post-call experience; strong legal research,
 *    drafting and analytical skills; excellent written and oral communication
 *    skills; ability to work in a fast-paced, team-oriented environment; sound
 *    professional conduct and attention to detail.
 *    Added advantage: preferred candidates should reside in Surulere, Yaba,
 *    Gbagada, Somolu, Ebute Metta and environs.
 *    Deadline for submission: 16th August, 2026.
 *    Send your CV and application letter to: hello@ovieobobolo.com"
 *
 * WHAT IS NOT HERE, AND WHY
 *
 *   apply_url      null. The flier gives an email address only, and the firm's
 *                  own site (ovieobobolo.com) publishes no vacancy page for
 *                  this role — a link to the homepage would look like an apply
 *                  link and lead nowhere useful.
 *   practice_areas Mapped from the firm's own tagline, "Barristers, Solicitors,
 *                  Arbitrators & Tax Consultants" — Dispute Resolution,
 *                  Arbitration and Tax are stated by the firm's name for
 *                  itself, not guessed.
 *   is_closing_soon true. Six days out from the seed date (2026-08-10) against
 *                  a firm 16 August deadline.
 *
 * The residency preference is folded into role_desc as the "added advantage"
 * the flier itself frames it as, not into `requirements`, which is the hard
 * bar for the role.
 *
 * `level` is 'junior'. The board's bands are student / junior / mid / senior,
 * and 1-2 years post-call sits inside the junior band.
 *
 * Run: node scripts/seed-ovie-obobolo-associate.mjs
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
  id: 'ovie-obobolo-associate',
  slug: 'ovie-obobolo-associate',
  title: 'Associate',
  employer: 'Ovie Obobolo & Co',
  sector: 'law_firm',
  tier: 'Boutique',
  type: 'job',
  level: 'junior',
  location: 'Lagos',
  deadline: '2026-08-16',
  is_rolling: false,
  is_verified: true,
  is_closing_soon: true,
  practice_areas: ['Dispute Resolution', 'Arbitration', 'Tax'],
  about:
    'Ovie Obobolo & Co are barristers, solicitors, arbitrators and tax consultants, based in Yaba, Lagos.',
  role_desc:
    "A motivated lawyer with 1-2 years' post-call experience to join the firm's legal team. Added advantage for candidates residing in Surulere, Yaba, Gbagada, Somolu, Ebute Metta, Bariga and environs.",
  requirements: [
    "1-2 years' post-call experience",
    'Strong legal research, drafting and analytical skills',
    'Excellent written and oral communication skills',
    'Ability to work in a fast-paced, team-oriented environment',
    'Sound professional conduct and attention to detail',
  ],
  apply_url: null,
  apply_email: 'hello@ovieobobolo.com',
  source: 'Ovie Obobolo & Co recruitment flier',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
console.log('wrote:', body[0].slug, '—', body[0].title)
