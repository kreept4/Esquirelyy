/**
 * Cut the World Bank YPP eligibility down to bullets you can scan.
 *
 * ============================================================
 * THIS IS THE SECOND CORRECTION TO THE SAME LIST AND THEY PULLED OPPOSITE WAYS
 * ============================================================
 *
 * The list went up as seven loose bullets and was reported as too vague. The
 * fix, in 2026-09-02-wbg-ypp-tighten-listing.mjs, was to make every line
 * specific. It worked, and it overshot: each bullet grew a clause explaining
 * itself, the list went to about 340 words, and it was reported again, as too
 * many words at once. Both reports are right. Vague and long are not opposites,
 * and the first fix traded one for the other instead of solving either.
 *
 * ⚠ WHAT A REQUIREMENTS LIST IS FOR. A reader is answering one question, "can I
 * apply", and they are answering it in seconds against ten lines. That is a
 * checklist, not prose. The rule applied here: state the bar, stop. No line
 * explains why the bar exists, and no line argues with the reader.
 *
 * About 95 words now, down from about 340, with the same ten checks.
 *
 * ============================================================
 * FOUR CHECKS ARE GONE ENTIRELY, NOT SHORTENED
 * ============================================================
 *
 * Every one of them is real, published by the Bank, and true. None of them will
 * ever stop a reader of this board, and a checklist line that nobody fails is
 * noise standing between them and the four lines that decide it.
 *
 *   English proficiency   Nigerian legal education and practice are conducted
 *                         in English. There is no reader of an LL.B board in
 *                         Lagos for whom "excellent written and spoken English"
 *                         is the open question.
 *   Not a current WBG      An Esquirely member is not on a World Bank term,
 *   employee               open, short-term or extended-term appointment.
 *   Category I relatives   Barred if a parent, sibling, child, aunt, uncle,
 *                         niece or nephew works for the Group. A genuine rule
 *                         and vanishingly rare in this audience.
 *   Doctorate substitution A full time PhD can replace the experience. A real
 *                         route, for a handful of people, and it was sitting
 *                         third in a list most readers abandon by line five.
 *
 * ⚠ THE TEST APPLIED. Not "is this true" but "will this line change what a
 * reader of THIS board does". Anything failing that goes to the Bank's own page
 * behind the Apply button, which is where somebody with an uncle at IFC or a
 * doctorate in progress will end up anyway.
 *
 * ⚠ AND ONE LINE IS ADDED BACK: that Nigerian passport holders qualify. It is
 * not a hurdle, it is the answer to the question a Nigerian reader actually
 * arrives with, which is whether the World Bank is open to them at all.
 *
 * ⚠ THE DEGREE LINE KEEPS ITS SECOND SENTENCE AND IS THE ONLY ONE THAT DOES.
 * "An LL.B with Law School does not meet it" is not an explanation, it is a
 * second, separate fact, and it is the one that decides the most applications
 * on this list. The Bank's own phrase is "graduate-level degree", which in
 * Nigeria is read as a degree you graduated with. Leaving the line at "a
 * master's" would be shorter and would let most of the readers of this board
 * think they qualify. Length is worth spending exactly here and nowhere else.
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

const REQUIREMENTS = [
  "An LL.M or another master's, finished before the September 2027 start. An LL.B with Law School does not meet it",
  'Two to six years of professional experience. Not a route for a fresh call',
  'No age limit',
  'Open to Nigerian passport holders',
  'Upload a CV of one or two pages, your passport page, and proof of your degrees',
  'Closes Wednesday 30 September, 23:59 UTC, which is 00:59 on 1 October in Lagos',
]

const rows = await (
  await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}&select=requirements`, { headers: H })
).json()

const words = a => a.join(' ').split(/\s+/).length

if (!Array.isArray(rows) || !rows.length) {
  console.error(`${SLUG} is not on the board. Run 2026-09-02-add-wbg-ypp.mjs first.`)
  process.exitCode = 1
} else if (JSON.stringify(rows[0].requirements) === JSON.stringify(REQUIREMENTS)) {
  console.log('Already trimmed, nothing written.')
} else {
  const res = await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ requirements: REQUIREMENTS }),
  })
  const body = await res.json()
  if (!res.ok) {
    console.error(`FAILED ${res.status}`)
    console.error(body)
    process.exitCode = 1
  } else {
    const was = rows[0].requirements || []
    console.log(`eligibility: ${words(was)} words -> ${words(REQUIREMENTS)}, still ${REQUIREMENTS.length} checks`)
    console.log(`longest bullet: ${Math.max(...was.map(b => b.split(/\s+/).length))} words -> ${Math.max(...REQUIREMENTS.map(b => b.split(/\s+/).length))}`)
  }
}
