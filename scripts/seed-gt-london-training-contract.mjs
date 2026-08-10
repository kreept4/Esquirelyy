/**
 * Add the Greenberg Traurig London Training Contract (2029 intake) opening.
 *
 * Source: Greenberg Traurig London's own LinkedIn post ("Training Contract
 * Applications for 2029 — Visit our graduate recruitment webpage"). The post
 * carries no bullet requirements and no stated closing date, only the firm's
 * name, the intake year and a pointer to gtlaw.com.
 *
 * WHAT IS NOT HERE, AND WHY
 *
 *   apply_url / apply_email   Both null. The post names no direct posting link
 *                             and no contact address, only "gtlaw.com" — a
 *                             homepage, not an apply link. Guessing a graduate
 *                             recruitment URL from the domain would risk
 *                             sending a reader to a dead or wrong page.
 *   requirements               null. Nothing is listed on the source post.
 *   practice_areas              []. UK training contracts rotate trainees
 *                             across seats; the post does not say which, and
 *                             this firm is not in ALL_FIRMS for a description
 *                             to draw on.
 *   deadline                  null, is_rolling true. No closing date is
 *                             published on the post itself.
 *
 * First non-Nigerian employer on this board. `location` is 'London, UK',
 * which the Nigeria-states filter in JobsClient will not match against any
 * option — the row still shows under "All locations", it just is not
 * reachable through the state dropdown. Worth knowing if that filter is ever
 * tightened to reject unrecognised values.
 *
 * `level` is 'student': UK training contract applications run two to three
 * years ahead of the start date, aimed at students and penultimate/final-year
 * candidates, not qualified lawyers.
 *
 * Run: node scripts/seed-gt-london-training-contract.mjs
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
  id: 'gt-london-training-contract-2029',
  slug: 'gt-london-training-contract-2029',
  title: 'Training Contract (2029 Intake)',
  employer: 'Greenberg Traurig London',
  sector: 'law_firm',
  tier: 'Leading',
  type: 'job',
  level: 'student',
  location: 'London, UK',
  deadline: null,
  is_rolling: true,
  is_verified: true,
  is_closing_soon: false,
  practice_areas: [],
  about:
    'Greenberg Traurig is a global law firm operating from offices worldwide, including London.',
  role_desc:
    'Applications are open for the 2029 training contract intake at the London office. Full details and the application form are on the firm’s graduate recruitment page at gtlaw.com.',
  requirements: null,
  apply_url: null,
  apply_email: null,
  source: 'Greenberg Traurig London, LinkedIn (graduate recruitment)',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
console.log('wrote:', body[0].slug, '—', body[0].title)
