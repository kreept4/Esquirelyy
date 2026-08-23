/**
 * Add the Uduakabasi & Partners (U&P Law) open call.
 *
 * Source: the firm's own LinkedIn post ("WE'RE HIRING | U&P LAW") and the
 * application instructions posted alongside it, which read, in full:
 *
 *   "The future of African business requires lawyers who understand more than
 *    the law. At Uduakabasi & Partners (U&P Law), we are building a modern
 *    corporate law firm focused on corporate governance, commercial
 *    transactions, regulatory compliance, energy, technology, investment, and
 *    business structuring. We are looking for exceptional legal professionals
 *    who are commercially minded, intellectually curious, detail-oriented,
 *    and ready to work at the intersection of law, business, and emerging
 *    industries. We are hiring across multiple practice areas.
 *    All applicants are required to submit their applications via email.
 *    Kindly send your updated CV to UandPlawfirm@gmail.com, accompanied by a
 *    cover letter stating: 1. Why you would like to join U&P Law; 2. What you
 *    hope to contribute to the firm; and 3. Where you see your legal career
 *    in the next 3-5 years. Please use "Job Application –
 *    [Position/Area of Interest] – [Your Name]" as the subject of your
 *    email."
 *
 * NOT ONE ROLE. This is a general call across "multiple practice areas" with
 * no named seat, no level and no location given, so the row is titled to match
 * rather than inventing a specific position the firm never posted.
 *
 * WHAT IS NOT HERE, AND WHY
 *
 *   apply_url  null. The post gives an email address and nothing else.
 *   deadline   null, is_rolling true. No closing date is given.
 *   level      'junior' for lack of a better bucket — the post names no
 *              seniority at all, unlike Principle Legal Consult's flier, which
 *              at least specified a PQE range.
 *
 * `sector` is 'law_firm'; `tier` is 'Boutique' — a firm describing itself as
 * "building" a modern practice reads as newly established rather than an
 * incumbent. The firm is not in ALL_FIRMS — see the EMPLOYER_LOGOS note in
 * firms-data.ts for why being on the board does not put a firm in the
 * directory. No office address is published, so location is left as
 * 'Nigeria' rather than guessed at a city.
 *
 * Run: node scripts/seed-uandp-law-hiring.mjs
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
  id: 'uandp-law-multiple-practice-areas',
  slug: 'uandp-law-multiple-practice-areas',
  title: 'Legal Professionals — Multiple Practice Areas',
  employer: 'Uduakabasi & Partners (U&P Law)',
  sector: 'law_firm',
  tier: 'Boutique',
  type: 'job',
  level: 'junior',
  location: 'Nigeria',
  deadline: null,
  is_rolling: true,
  is_verified: true,
  is_closing_soon: false,
  practice_areas: ['Corporate & Commercial', 'Banking & Finance', 'Energy & Natural Resources'],
  about:
    'Uduakabasi & Partners (U&P Law) is a corporate law firm focused on corporate governance, commercial transactions, regulatory compliance, energy, technology, investment and business structuring.',
  role_desc:
    'An open call across multiple practice areas, for commercially minded, intellectually curious, detail-oriented legal professionals ready to work at the intersection of law, business and emerging industries. Apply by email with a CV and a cover letter answering three questions: why you would like to join U&P Law, what you hope to contribute to the firm, and where you see your legal career in the next 3-5 years. Use "Job Application – [Position/Area of Interest] – [Your Name]" as the subject line.',
  requirements: [
    'Commercially minded and intellectually curious',
    'Detail-oriented',
    'Ready to work at the intersection of law, business and emerging industries',
  ],
  apply_url: null,
  apply_email: 'UandPlawfirm@gmail.com',
  source: 'Uduakabasi & Partners (U&P Law) LinkedIn hiring post',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
console.log('wrote:', body[0].slug, '—', body[0].title)
