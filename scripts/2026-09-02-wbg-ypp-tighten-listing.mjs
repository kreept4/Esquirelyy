/**
 * Tighten the World Bank YPP listing: shorter description, concrete eligibility.
 *
 * Supersedes 2026-09-02-wbg-ypp-lagos-deadline.mjs, which rewrote one line of
 * `requirements`. That line is carried into the new array below, so the earlier
 * script has nothing left to match and will exit 1 if anybody re-runs it. It is
 * left in the repository as the record of a change that did happen, which is the
 * same reason the other dated scripts are still here.
 *
 * ============================================================
 * 1. THE DESCRIPTION WAS ONE PARAGRAPH OF 150 WORDS
 * ============================================================
 *
 * Reported as looking weird and being too long to read, which it was. RoleProse
 * in jobs/[slug]/page.tsx splits `role_desc` on blank lines and renders a
 * paragraph each; the seeded text had no blank line in it, so all of it arrived
 * as one block. Three short paragraphs now, in the order somebody decides in:
 * what the job is, what the legal work is, what to do about the two streams.
 *
 * The YP Academy sentence is gone rather than shortened. Training programmes,
 * coaching and mentors are what every graduate scheme says about itself and
 * none of it changes whether a reader applies.
 *
 * ============================================================
 * 2. THE ICSID LINK WAS NOT A LINK
 * ============================================================
 *
 * It was written bare, worldbankgroup.csod.com/ux/ats/... with no scheme.
 * URL_IN_PROSE in RoleProse matches https:// URLs, plus docs.google.com and
 * forms.gle by name, and nothing else. So it matched nothing, rendered as plain
 * characters, and left a reader on a phone retyping a Cornerstone path by hand.
 * That is the exact failure the note above RoleProse records from the Heirs
 * Holdings listing.
 *
 * ⚠ FIXED BY REMOVING IT, NOT BY ADDING THE SCHEME. A working link there would
 * be worse than a broken one. The product's split is that the DESCRIPTION is
 * public and the APPLICATION ROUTE is what an account is for: `applyHref` goes
 * null for a signed-out reader so there is nothing in the markup to find. This
 * listing is in OPEN_JOB_SLUGS, so a signed-out reader renders the description
 * in full, and a live application URL in it would walk straight through the
 * gate the Apply button two sections down is enforcing. ICSID is still named.
 *
 * ============================================================
 * 3. THE ELIGIBILITY WAS VAGUE, AND ONE LINE OF IT WAS MISLEADING
 * ============================================================
 *
 * ⚠ THE IMPORTANT FIX IS THE DEGREE BULLET. It read "A graduate degree or
 * higher", which is the Bank's own phrase and is read differently in Nigeria
 * than the Bank means it. The Bank's floor is a MASTER'S. A Nigerian LL.B plus
 * Law School and call to the Bar is an undergraduate degree plus a professional
 * qualification, and it does not clear that bar on its own.
 *
 * So the largest group of readers who would look at this listing and think they
 * qualify are the ones who do not, and the old wording did nothing to tell
 * them. It now says so in as many words, and names the LL.M as the route.
 * Getting this wrong costs a reader an afternoon on an application that is
 * screened out; saying it costs us nothing.
 *
 * Everything else is the Bank's own wording made specific rather than
 * paraphrased loosely: the doctorate substitution and its conditions, what
 * "member country" is proved with, the two relative categories and how they
 * differ, and the three documents the form accepts. All read off
 * worldbank.org/en/about/careers/programs-and-internships/young-professionals-program
 * on 2 September 2026.
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
  'A two year term at GF level in Washington DC, and a five year contract after it if you perform. You do three eight month rotations: one in your own specialism, one in another part of the Group, and at least one in a country office.',
  "The Bank advertised 33 streams for the 2027 intake. This one is the Legal Vice Presidency, which is legal practice rather than policy: drafting and negotiating the project legal agreements behind the Bank's lending, advising country teams on legal and policy risk, and working on negotiations with government officials under a Chief Counsel.",
  'ICSID is the other legal stream, investment treaty arbitration and conciliation. You do not have to choose between them now, because the form lets you name two alternative streams on a single application.',
].join('\n\n')

/* ⚠ NO SELECTION TIMETABLE HERE, AND IT WAS DRAFTED AND CUT.
   The Bank publishes one: longlist 1 to 15 October, assessments to the end of
   October, panel interviews in Washington DC and Nairobi in December or Paris
   and Bangkok in January, offers late January to early February 2027. It is
   accurate and it made the description LONGER than the wall of text this
   change exists to shorten, which is the whole complaint arriving again in a
   better shape. It is also not a fact anybody decides on: nobody declines to
   apply because the panel is in December. Cut. */

const REQUIREMENTS = [
  "A master's degree or higher in a relevant field, finished before the September 2027 start. An LL.B and Law School will not do it on its own: the Bank's floor is a graduate degree, so in practice you need an LL.M or another master's",
  'Two to six years of professional experience in a related area. Under two is too few and over six is too many, so this is not a route for a fresh call',
  'A doctorate can stand in for the experience if it is full time, at an accredited institution, in a relevant field, and substantially complete with all written work submitted before the September start',
  'Nationality of a World Bank Group member country, proved with an official passport. Nigeria is a member',
  'Excellent spoken and written English, which the Bank calls mandatory. Other languages strengthen an application but are not required',
  'You cannot be a current World Bank Group employee when you apply, including term, open, short-term and extended-term appointments',
  'Barred outright if a parent, sibling, child, aunt, uncle, niece or nephew works for the Group, by blood or adoption. In-laws, grandparents, grandchildren, cousins and step relations are allowed, provided you would not be in the same unit, in a supervisory line either way, or in routine professional contact',
  'Three uploads and the Bank asks for nothing else: a CV of one page, two at the most, angled at the stream you pick; the passport page showing your date of birth and nationality; and proof of your degrees, or an enrolment letter giving expected completion dates',
  'No age limit. The Bank has removed it, though most write-ups of this programme still print the old rule',
  'Applications close Wednesday 30 September 2026 at 23:59 UTC, which is 00:59 on 1 October in Lagos. Late applications, applications by email, and changes after the deadline are all refused',
]

const rows = await (
  await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}&select=role_desc,requirements`, { headers: H })
).json()

if (!Array.isArray(rows) || !rows.length) {
  console.error(`${SLUG} is not on the board. Run 2026-09-02-add-wbg-ypp.mjs first.`)
  process.exitCode = 1
} else {
  const same =
    rows[0].role_desc === ROLE_DESC &&
    JSON.stringify(rows[0].requirements) === JSON.stringify(REQUIREMENTS)
  if (same) {
    console.log('Already tightened, nothing written.')
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
      const wasWords = (rows[0].role_desc || '').split(/\s+/).length
      const wasParas = (rows[0].role_desc || '').split(/\n\s*\n/).length
      console.log(
        `description: ${wasWords} words in ${wasParas} paragraph(s) -> ${ROLE_DESC.split(/\s+/).length} words in ${ROLE_DESC.split(/\n\s*\n/).length}`
      )
      console.log(`bare csod URL removed: ${/csod\.com/.test(rows[0].role_desc || '') ? 'yes' : 'none was present'}`)
      console.log(`eligibility: ${(rows[0].requirements || []).length} bullets -> ${REQUIREMENTS.length}`)
    }
  }
}
