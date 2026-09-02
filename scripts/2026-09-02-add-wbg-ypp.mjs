/**
 * Put the World Bank Group's 2027 Young Professionals Program on the board.
 *
 * ============================================================
 * ONE ROW, AND THE BANK PUBLISHED THIRTY THREE
 * ============================================================
 *
 * careersite/17 carries 33 postings, every one of them titled "WBG Young
 * Professional", every one in Washington DC, every one opening 1 September and
 * closing 30 September. They are not 33 jobs. They are 33 streams of one
 * programme, and the application form lets you pick a stream and name two
 * alternatives, so a reader makes ONE application whichever they start from.
 *
 * Listing them individually would have put 33 identically titled rows on a
 * board that carries 24, buried every Nigerian firm on it, and filled the ball
 * pit with one employer. That is the exact failure the pit's own comment in
 * app/page.tsx describes from the Aluko rows: "it read as a crowd rather than
 * as a selection. Reported as overpopulated, and it was."
 *
 * So: one row, pointed at the stream a Nigerian lawyer would actually take.
 *
 * ============================================================
 * WHY THE APPLY URL IS REQUISITION 38204 AND NOT THE PROGRAMME PAGE
 * ============================================================
 *
 * 38204 is the Legal Vice Presidency stream, which is the only one of the 33
 * that is a lawyer's job in the ordinary sense: drafting and negotiating the
 * Bank's project legal agreements, advising operations on legal and policy
 * risk, and sitting under a Chief Counsel.
 *
 * ICSID (38188) is the other genuinely legal stream, investment treaty
 * arbitration and conciliation, and it is named in `role_desc` with its own
 * link rather than given a row of its own. Two rows for one application would
 * be the 33-row problem in miniature.
 *
 * The URL is the careersite/1 posting rather than the careersite/17 one. Both
 * exist and resolve to the same requisition; the API marks careersite/1
 * `isDefault: true`, and it is the form the previous World Bank listing used.
 *
 * ⚠ NOT THE PROGRAMME LANDING PAGE at worldbank.org. That page is a description
 * with the form another click away, and a listing whose apply button lands on
 * marketing copy wastes the click the account exists to earn. Same rule the
 * Greenberg Traurig script states.
 *
 * ============================================================
 * WHY sector IS 'other' AND level IS 'mid'
 * ============================================================
 *
 * The sector filter describes what the employer IS. The World Bank Group is a
 * multilateral development institution, not a law firm, so it sits with Heirs
 * Holdings, Andersen and Tangerine rather than with the firms.
 *
 * 'mid' because the Bank asks for 2 to 6 years of relevant experience. That
 * floor is the single most important fact in this listing for the share of the
 * board who finished Law School in July, and it is why the experience band is
 * the FIRST line of `requirements` rather than the last.
 *
 * ============================================================
 * WHAT THE 2026 CYCLE CHANGED, AND WHY IT IS STATED
 * ============================================================
 *
 * The YPP had an age ceiling for most of its history and no longer does. The
 * Bank's own FAQ now reads "There is no age requirement for the WBG YPP."
 * Nearly every Nigerian careers blog still repeats the old born-after rule, so
 * a reader who has seen this programme written up before is carrying a
 * disqualifier that stopped being true. `requirements` says so explicitly.
 *
 * Source: worldbank.org/en/about/careers/programs-and-internships/young-professionals-program
 * and the Cornerstone career site API, both read 2 September 2026.
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

const ROW = {
  id: SLUG,
  slug: SLUG,
  title: 'Young Professionals Program 2027',
  employer: 'World Bank Group',
  sector: 'other',
  type: 'job',
  level: 'mid',
  location: 'Washington, DC, United States',
  deadline: '2026-09-30',
  is_verified: true,
  is_rolling: false,
  is_active: true,
  practice_areas: [
    'International Law',
    'Arbitration',
    'Policy & Governance',
    'Public Law & Regulatory',
    'Banking & Finance',
  ],
  about:
    'The World Bank Group is made up of the World Bank, IFC, MIGA and ICSID. Nigeria is a member of all of them, which is what makes a Nigerian passport holder eligible for this programme. The Young Professionals Program has run for over 60 years and is the institution\'s main entry route for early-career specialists.',
  role_desc:
    'A two year term appointment at GF level, renewable, and on satisfactory performance it is followed by a five year contract. You complete three eight month rotations: one in your own area of expertise, one across institutions, and at least one based in a country office. The YP Academy runs alongside it, covering technical and operational training, language programmes, negotiation, and leadership, with one-to-one coaching and a mentor. The Bank advertised 33 streams for the 2027 intake and this listing points at the Legal Vice Presidency, which is the one that is legal practice: drafting, reviewing and negotiating project legal agreements, advising country teams on legal and policy risk across an operational portfolio, comparative legal research, and negotiations with government officials, reporting to a Chief Counsel. The other legal stream is ICSID, investment treaty arbitration and conciliation, at worldbankgroup.csod.com/ux/ats/careersite/1/home/requisition/38188?c=worldbankgroup. You do not need to choose now: the application lets you name up to two alternative streams, so one submission can cover both.',
  requirements: [
    'Two to six years of relevant professional experience. Doctoral research counts',
    'A graduate degree or higher, finished before the September 2027 start',
    'Nationality of a World Bank Group member country, shown by passport. Nigeria qualifies',
    'Excellent written and spoken English. Further languages help but are not required',
    'No age limit. The Bank removed it, though most write-ups of this programme still repeat the old one',
    'Not open to current World Bank Group staff, or to anyone with a parent, sibling, child, aunt, uncle, niece or nephew working there',
    'Applications close Wednesday 30 September 2026 at 23:59 UTC. Late ones are not accepted',
  ],
  apply_email: null,
  apply_url:
    'https://worldbankgroup.csod.com/ux/ats/careersite/1/home/requisition/38204?c=worldbankgroup',
  source:
    "The World Bank Group career site API and the programme's own page at worldbank.org, both read 2 September 2026. The API gives the 33 requisitions, the 1 to 30 September posting window and the departmental description behind each stream; the programme page gives the eligibility bar, the 30 September 23:59 UTC deadline, the removal of the age limit, and the selection timetable. Requisition 38204 is the Legal Vice Presidency stream and 38188 is ICSID.",
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
