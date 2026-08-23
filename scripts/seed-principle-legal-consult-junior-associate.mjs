/**
 * Add the Principle Legal Consult Junior Associate vacancy.
 *
 * Source: the firm's own recruitment flier ("Call for Junior Associate"),
 * which reads, in full:
 *
 *   "Principle Legal Consult is seeking a driven and commercially minded
 *    Junior Associate with 2-3 years' post-NYSC experience to join our
 *    growing practice.
 *    Who We're Looking For: 2-3 years' post-NYSC experience, preferably
 *    within an established law firm. Practical litigation experience and
 *    confidence attending court independently. Strong legal research,
 *    drafting and analytical skills. Commercially aware, proactive and
 *    solution-oriented. Excellent communication, organisation and attention
 *    to detail.
 *    What You'll Do: Attend court proceedings and support the management of
 *    litigation matters. Track ongoing cases and maintain accurate case
 *    status reports. Conduct legal, regulatory and industry research relevant
 *    to the firm and its clients. Draft legal opinions, correspondence,
 *    agreements and other legal documents. Support client engagements, legal
 *    insights and business-development initiatives that contribute to the
 *    firm's growth.
 *    What You'll Find at PLC: An intentional and collaborative work
 *    environment. Competitive compensation. Exposure to matters across Abuja
 *    and London. A practice built on strategy, prevention, and long-term
 *    client protection.
 *    How to Apply: Send your CV and cover letter to
 *    hr@principlelegalconsult.com."
 *
 * WHAT IS NOT HERE, AND WHY
 *
 *   apply_url  null. The flier gives an address and nothing else.
 *   deadline   null, is_rolling true. The flier states no closing date.
 *
 * `level` is 'mid' rather than 'junior'. The board's junior band reads as
 * entry-level elsewhere on the site (LEVEL_LABELS maps junior to
 * "Entry-level"), and 2-3 years post-NYSC with independent court experience
 * is past that, even though the firm calls the title "Junior Associate".
 *
 * `sector` is 'law_firm'; `tier` is 'Boutique'. The firm is not in ALL_FIRMS —
 * see the EMPLOYER_LOGOS note in firms-data.ts for why being on the board does
 * not put a firm in the directory. Location is stated as Abuja on the strength
 * of "Exposure to matters across Abuja and London"; the flier does not give a
 * street address.
 *
 * Run: node scripts/seed-principle-legal-consult-junior-associate.mjs
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
  id: 'principle-legal-consult-junior-associate',
  slug: 'principle-legal-consult-junior-associate',
  title: 'Junior Associate',
  employer: 'Principle Legal Consult',
  sector: 'law_firm',
  tier: 'Boutique',
  type: 'job',
  level: 'mid',
  location: 'Abuja',
  deadline: null,
  is_rolling: true,
  is_verified: true,
  is_closing_soon: false,
  practice_areas: ['Dispute Resolution', 'Corporate & Commercial'],
  about:
    'Principle Legal Consult is a private legal and strategic advisory practice built on strategy, prevention and long-term client protection, with matters across Abuja and London.',
  role_desc:
    'A litigation-facing associate seat: attending court proceedings and supporting the management of litigation matters, tracking ongoing cases and case status reports, conducting legal, regulatory and industry research, drafting legal opinions, correspondence and agreements, and supporting client engagements and business-development work. The firm is looking for someone commercially aware, proactive and solution-oriented, with 2-3 years post-NYSC experience and confidence attending court independently.',
  requirements: [
    "2-3 years' post-NYSC experience, preferably within an established law firm",
    'Practical litigation experience and confidence attending court independently',
    'Strong legal research, drafting and analytical skills',
    'Commercially aware, proactive and solution-oriented',
    'Excellent communication, organisation and attention to detail',
  ],
  apply_url: null,
  apply_email: 'hr@principlelegalconsult.com',
  source: 'Principle Legal Consult recruitment flier',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
console.log('wrote:', body[0].slug, '—', body[0].title)
