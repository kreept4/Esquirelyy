/**
 * Add the Olajide Oyewole LLP (DLA Piper Africa) dispute resolution vacancy.
 *
 * Source: the firm's own posting at
 * dlapiperafrica.com/en/nigeria/careers/2026/associate_dispute-resolution_abuja
 * Posted 13 August 2026, closing 13 November 2026.
 *
 * WHY THE EMPLOYER STRING IS "Olajide Oyewole LLP" AND NOT "DLA Piper Africa".
 * The posting is signed by Olajide Oyewole LLP, the footer of every page on that
 * site says Olajide Oyewole LLP is a member of DLA Piper Africa and is not part
 * of DLA Piper, and the Swiss Verein structure means the two are genuinely
 * different legal persons. Storing the employer as "DLA Piper Africa" would name
 * the network rather than the firm you would actually be employed by, and it
 * would also miss ALL_FIRMS on the logo lookup, which matches on name,
 * shortName and slug. The DLA Piper Africa identity is carried by `alsoKnownAs`
 * on the firm record and by the mark itself, which IS the DLA Piper Africa
 * lockup — so the board shows the name a contract would carry and the logo a
 * reader recognises, which is the honest pairing of the two.
 *
 * WHAT IS READ AND WHAT IS INFERRED
 *
 *   deadline     2026-11-13, stated on the posting as the application closing
 *                date. is_rolling false: this one has a real date on it.
 *   level        'mid'. The board's bands are student / junior / mid / senior.
 *                The posting asks for a minimum of 3-5 years PQE and is typed
 *                "Experienced" by the firm's own careers system, which is the
 *                mid band. Calling it senior would hide it from exactly the
 *                associates it is aimed at.
 *   location     'Abuja', stated. Not "Lagos and Abuja" — the firm has both
 *                offices but this seat is posted to one of them.
 *   apply_email  careers@oo.dlapiperafrica.com, read out of the Apply button's
 *                mailto on the posting. The address is obfuscated in the served
 *                HTML, which is why it is written down here.
 *   apply_url    the posting itself. Unlike Abe & Asotie there IS a real URL
 *                here, and clause 2 of our terms promises every listing links to
 *                the employer's own notice.
 *
 * `tier` is 'Established', matching the directory record. The two must agree or
 * the board and the profile disagree about the same firm.
 *
 * Run: node scripts/seed-dla-piper-role.mjs
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
  id: 'olajide-oyewole-associate-dispute-abuja',
  slug: 'olajide-oyewole-associate-dispute-resolution-abuja',
  title: 'Associate, Dispute Resolution',
  employer: 'Olajide Oyewole LLP',
  sector: 'law_firm',
  tier: 'Established',
  type: 'job',
  level: 'mid',
  location: 'Abuja',
  deadline: '2026-11-13',
  is_rolling: false,
  // Verified in the strong sense: read off the firm's own careers page, not an
  // aggregator's repost.
  is_verified: true,
  // Three months out. is_closing_soon is for the last stretch, not for anything
  // with a date on it at all.
  is_closing_soon: false,
  practice_areas: ['Dispute Resolution', 'Arbitration'],
  about:
    'The DLA Piper Africa member firm in Nigeria, and one of sub-Saharan Africa’s largest commercial practices. Over forty lawyers across Lagos and Abuja, working in banking and finance, tax, corporate and commercial, capital markets, real estate and dispute resolution. The practice grew out of the firm Chief Olajide Oyewole founded in 1965.',
  role_desc:
    'A seat in the Dispute Resolution Practice Group in Abuja, supporting senior lawyers across commercial litigation, arbitration, mediation, regulatory and employment disputes and debt recovery. The work is dispute strategy, legal research, drafting court and arbitration documents, case management and client advisory, with appearances before courts, tribunals and alternative dispute resolution forums. The firm states the package includes health insurance covering dependants, a pension contribution, 21 days of paid leave, a thirteenth-month salary, and data, transport and leave allowances.',
  requirements: [
    'LL.B and call to the Nigerian Bar',
    'Minimum of 3-5 years post-qualification experience in a law firm',
    'Significant exposure to commercial litigation, arbitration, mediation, debt recovery and employment disputes',
    'Experience drafting pleadings, court processes, legal opinions and settlement agreements',
    'Experience managing disputes end to end, including court attendance and dealings with regulators',
    'LL.M optional',
  ],
  apply_url:
    'https://www.dlapiperafrica.com/en/nigeria/careers/2026/associate_dispute-resolution_abuja',
  apply_email: 'careers@oo.dlapiperafrica.com',
  source: 'Olajide Oyewole LLP (DLA Piper Africa) careers page, posted 13 August 2026',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
console.log('wrote:', body[0].slug, '—', body[0].title)
