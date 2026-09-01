/**
 * Put Greenberg Traurig's 2029 London training contract on the board.
 *
 * ============================================================
 * THIS REVERSES AN EARLIER DECISION, DELIBERATELY
 * ============================================================
 *
 * It went up this morning as a carousel slide and NOT as a listing, and
 * lib/news-data.ts still carries the argument for that: a London training
 * contract gated on A-levels and the SQE is not something most readers of this
 * board can apply for, and mixing it in with roles they can take was said to
 * make the board mean less.
 *
 * That call has been reversed on instruction, and the reasoning that replaces
 * it is sound: the application route is a real Workday posting with a real
 * deadline, which is exactly what every other row here is, and a reader who
 * DOES clear the bar was previously being sent off-site to find out. Being
 * listed is what lets the board's own filters, the tracker and the deadline
 * machinery treat it like the opportunity it is.
 *
 * ⚠ SO THE ELIGIBILITY HAS TO CARRY THE WEIGHT INSTEAD, and it is the first
 * thing in `requirements` rather than buried at the end. The reader who cannot
 * apply should work that out from the card, in seconds, without opening
 * anything. That was the whole point of keeping it off the board, and it is now
 * the requirements list's job.
 *
 * ⚠ THE APPLY ROUTE IS THE WORKDAY POSTING, NOT THE CAREERS PAGE.
 * gtlaw.wd1.myworkdayjobs.com/GTLAW/job/London/XMLNAME-2029-Training-Contract_JR202601534
 * is where the application is actually made. The careers page it used to point
 * at is a description with the form one more click away, and a listing whose
 * apply button lands on marketing copy wastes the click the account exists to
 * earn.
 *
 * WHY sector IS 'law_firm'. Greenberg Traurig is a law firm, unlike Heirs
 * Holdings, Andersen and Tangerine, which sit in 'other' because the sector
 * filter describes what the employer IS.
 *
 * WHY level IS 'junior'. A training contract is the entry route to
 * qualification. It is the London equivalent of the graduate programmes already
 * carried at this level.
 *
 * WHY THERE IS NO logo_url. Left null so the mark resolves through
 * EMPLOYER_LOGOS on the normalised employer string, which is what gives the
 * board, the pit and the carousel the same art. See the note beside the
 * greenbergtraurig key in lib/firms-data.ts for why that file holds the
 * monogram rather than the full lockup.
 *
 * Run: node scripts/2026-09-01-add-greenberg-traurig.mjs
 * Idempotent. Re-running reports the row exists and writes nothing.
 */

import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env.local')

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const SLUG = 'greenberg-traurig-2029-training-contract'

const ROW = {
  id: SLUG,
  slug: SLUG,
  title: '2029 Training Contract',
  employer: 'Greenberg Traurig',
  sector: 'law_firm',
  type: 'job',
  level: 'junior',
  location: 'London, United Kingdom',
  deadline: '2026-11-30',
  is_verified: true,
  is_rolling: false,
  is_active: true,
  practice_areas: [
    'Corporate & Commercial',
    'Real Estate',
    'Dispute Resolution',
    'Banking & Finance',
    'Employment',
    'Tax',
    'Public Law & Regulatory',
  ],
  about:
    'The London office of Greenberg Traurig, an international firm with more than forty offices. It takes twelve trainees a year, raised from eight for this cycle, and runs no vacation scheme: applications for the training contract are direct.',
  role_desc:
    'A two year training contract starting in 2029, made up of four six month rotations across the Corporate, Real Estate, Litigation, Banking and Finance, Employment, Funds, Tax and Regulatory practices, with the option of a client secondment in the second year. Trainees start on 55,000 pounds, rising to 60,000 in the second year. Selection runs in stages after the application closes: shareholder interviews in February 2027, assessment days in March, and offers in early April.',
  /* ⚠ ELIGIBILITY FIRST. See the header: the reader who cannot apply has to be
     able to tell from the card rather than from the portal.

     ⚠ AND IT STATES THE REQUIREMENT WITHOUT GLOSSING IT. The first line read
     "A-levels at ABB or above, which most Nigerian LL.B holders will not have",
     and the second half of that was ours, not the firm's, sitting inside a list
     a reader takes as the employer's own words. It was also doing the reader's
     thinking for them: somebody who holds A-levels, or IB, or schooled abroad,
     was being told in passing that this is probably not for them. The bare
     requirement carries the same information and lets them decide. */
  requirements: [
    'A-levels at ABB or above',
    'On track for a 2:1 degree classification',
    'Open to law and non-law graduates',
    'Non-law graduates complete the PGDL before the SQE',
    'Applications close Monday 30 November 2026 at 23:59',
  ],
  apply_email: null,
  apply_url:
    'https://gtlaw.wd1.myworkdayjobs.com/GTLAW/job/London/XMLNAME-2029-Training-Contract_JR202601534',
  source:
    "Greenberg Traurig's London trainee recruiting page at gtlaw.com, read 1 September 2026, which gives the intake year, the seat structure, the salary, the entry requirements and the 30 November 2026 deadline, and states that the firm runs no vacation schemes. Applications are made through the firm's Workday posting, JR202601534.",
  logo_url: null,
}

const existing = await (
  await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}&select=id,title,employer,deadline,is_active`, { headers: H })
).json()

if (Array.isArray(existing) && existing.length) {
  console.log('Already on the board, nothing written:')
  console.log(existing[0])
} else {
  const res = await fetch(`${BASE}/rest/v1/jobs`, {
    method: 'POST',
    headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify(ROW),
  })
  const body = await res.json()
  if (!res.ok) {
    console.error(`FAILED ${res.status}`)
    console.error(body)
    process.exit(1)
  }
  console.log(`added: ${ROW.employer} / ${ROW.title}  (${SLUG})`)
  console.log(`  closes  ${ROW.deadline}`)
  console.log(`  apply   ${ROW.apply_url}`)
}
