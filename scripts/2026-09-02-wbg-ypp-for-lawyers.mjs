/**
 * Point the World Bank YPP listing at lawyers rather than at applicants.
 *
 * ============================================================
 * THE LISTING WAS ACCURATE AND WRITTEN FOR NOBODY IN PARTICULAR
 * ============================================================
 *
 * Every fact on it came off the Bank's own pages, which is why it read like the
 * Bank's own pages: a programme description that happens to mention a legal
 * stream. Esquirely is a Nigerian legal careers board. Every reader of this row
 * is a lawyer, most of them called in Nigeria, and the copy should assume that
 * rather than explain around it.
 *
 * TWO CHANGES, AND NEITHER ADDS A WORD.
 *
 * 1. THE LEGAL WORK GOES FIRST. The description opened on the contract terms,
 *    GF level and rotation structure, and reached the Legal Vice Presidency in
 *    the second paragraph. A lawyer scanning this needs to know it is a legal
 *    seat before they need to know the grade. Paragraphs one and two are
 *    swapped, with the joins rewritten so it still reads as prose.
 *
 * 2. THE EXPERIENCE BAR IS IN POST-CALL YEARS. It said "two to six years of
 *    professional experience", which is the Bank's phrase and makes a Nigerian
 *    lawyer do a conversion. They count from call. It now says post-call, which
 *    is the same bar in the unit the reader already keeps it in, and it pairs
 *    with "not a route for a fresh call" in the same line.
 *
 *    ⚠ POST-CALL, NOT "IN PRACTICE". Deliberate. "In practice" reads as private
 *    practice and would quietly exclude the in-house, regulatory and NGO
 *    lawyers the Bank counts perfectly happily. Post-call covers all of it and
 *    excludes nothing the Bank includes.
 *
 * The degree bullet, the uploads, the age note, the nationality line and the
 * deadline are unchanged. They were trimmed in
 * 2026-09-02-wbg-ypp-trim-eligibility.mjs and that trim holds.
 */

import { readFileSync } from 'node:fs'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env.local')

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const SLUG = 'world-bank-group-young-professionals-programme-2027'

/* Blank lines are deliberate: RoleProse splits on them. */
const ROLE_DESC = [
  "The Bank advertised 33 streams for the 2027 intake and two of them are legal work. This listing is the Legal Vice Presidency, which is practice rather than policy: drafting and negotiating the project legal agreements behind the Bank's lending, advising country teams on legal and policy risk, and working on negotiations with government officials, under a Chief Counsel.",
  'It is a two year term at GF level in Washington DC, and a five year contract after it if you perform. Three eight month rotations: one in your own specialism, one elsewhere in the Group, and at least one in a country office.',
  'ICSID is the other legal stream, investment treaty arbitration and conciliation. You do not have to choose between them now, because the form lets you name two alternative streams on a single application.',
].join('\n\n')

const REQUIREMENTS = [
  /* "finished before September 2027", not "before the September 2027 start".
     The Bank's phrase is "completed before September start date" and carrying
     it over gave "the September 2027 start", which reads as a stumble: three
     stacked modifiers in front of a noun the sentence never needed. The month
     alone says it. */
  "An LL.M or another master's, finished before September 2027. An LL.B with Law School does not meet it",
  'Two to six years post-call. Not a route for a fresh call',
  'No age limit',
  'Open to Nigerian passport holders',
  'Upload a CV of one or two pages, your passport page, and proof of your degrees',
  'Closes Wednesday 30 September, 23:59 UTC, which is 00:59 on 1 October in Lagos',
]

const rows = await (
  await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}&select=role_desc,requirements`, { headers: H })
).json()

if (!Array.isArray(rows) || !rows.length) {
  console.error(`${SLUG} is not on the board. Run 2026-09-02-add-wbg-ypp.mjs first.`)
  process.exitCode = 1
} else if (
  rows[0].role_desc === ROLE_DESC &&
  JSON.stringify(rows[0].requirements) === JSON.stringify(REQUIREMENTS)
) {
  console.log('Already written for lawyers, nothing changed.')
} else {
  const res = await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ role_desc: ROLE_DESC, requirements: REQUIREMENTS }),
  })
  const body = await res.json()
  if (!res.ok) {
    console.error(`FAILED ${res.status}`)
    console.error(body)
    process.exitCode = 1
  } else {
    console.log('updated.')
    console.log(`  opens on: "${ROLE_DESC.split(/\n\s*\n/)[0].slice(0, 72)}..."`)
    console.log(`  experience bullet: ${REQUIREMENTS[1]}`)
    console.log(`  ${ROLE_DESC.split(/\s+/).length} words of description, ${REQUIREMENTS.join(' ').split(/\s+/).length} of eligibility`)
  }
}
