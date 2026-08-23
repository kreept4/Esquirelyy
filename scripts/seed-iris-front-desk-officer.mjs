/**
 * Add the Iris Attorneys LP Front Desk Officer vacancy.
 *
 * Source: the firm's own recruitment flier, which carries the Iris Attorneys
 * LP mark (a column monogram) and reads, in full:
 *
 *   "WE ARE HIRING. Front Desk Officer.
 *    Job Responsibilities: Serve as the first point of contact for clients and
 *    visitors. Welcome guests and maintain a professional reception
 *    environment. Respond to inquiries and direct visitors appropriately.
 *    Ensure the smooth day to day operation of the reception area. Deliver
 *    exceptional customer service while upholding the firm's professional
 *    standards.
 *    Requirements: Excellent Communication Skills. Strong Organizational
 *    abilities and a professional demeanor. Proficiency with basic computer
 *    software. Ability to multitask and work under minimal supervision.
 *    Benefits: Competitive salary. Career growth opportunities. Friendly and
 *    supportive work environment.
 *    Send your CV & Cover Letter to: Careers@irisattorneyslp.com, use
 *    "secretary" as subject."
 *
 * WHAT IS NOT HERE, AND WHY
 *
 *   apply_url     null. The flier gives an address and nothing else.
 *   deadline      null, is_rolling true. The flier states no closing date.
 *   apply_subject "secretary" is not a jobs-table column, so it is not lost —
 *                 it is folded into role_desc instead, since that is the only
 *                 place a reader assembling their own email will see it before
 *                 sending.
 *
 * `level` is 'junior' for lack of a better bucket: the board's bands are
 * student / junior / mid / senior and none of them describe a non-legal
 * front-of-house role, but leaving level null would drop the row out of level
 * filters entirely rather than just being an imperfect fit.
 *
 * `sector` is 'law_firm'; `tier` is 'Boutique'. The firm is not in ALL_FIRMS —
 * see the EMPLOYER_LOGOS note in firms-data.ts for why being on the board does
 * not put a firm in the directory.
 *
 * Run: node scripts/seed-iris-front-desk-officer.mjs
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
  id: 'iris-attorneys-lp-front-desk-officer',
  slug: 'iris-attorneys-lp-front-desk-officer',
  title: 'Front Desk Officer',
  employer: 'Iris Attorneys LP',
  sector: 'law_firm',
  tier: 'Boutique',
  type: 'job',
  level: 'junior',
  // Not stated on the flier. Iris Attorneys LP is a Lagos practice; this is
  // the only field here inferred rather than read.
  location: 'Lagos',
  deadline: null,
  is_rolling: true,
  is_verified: true,
  is_closing_soon: false,
  practice_areas: [],
  about:
    'Iris Attorneys LP is a Lagos law firm building out its front-office team to support clients and visitors with a professional, well-organised reception.',
  role_desc:
    'The Front Desk Officer is the first point of contact for clients and visitors: welcoming guests, maintaining a professional reception environment, responding to inquiries and directing visitors appropriately, and keeping the day-to-day operation of the reception area running smoothly. Send a CV and cover letter to the address below with the subject line "secretary".',
  requirements: [
    'Excellent communication skills',
    'Strong organizational abilities and a professional demeanor',
    'Proficiency with basic computer software',
    'Ability to multitask and work under minimal supervision',
  ],
  apply_url: null,
  apply_email: 'Careers@irisattorneyslp.com',
  source: 'Iris Attorneys LP recruitment flier',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
console.log('wrote:', body[0].slug, '—', body[0].title)
