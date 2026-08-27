/**
 * Put Andersen's 2027 graduate intake on the board.
 *
 * ⚠ IT CLOSES TODAY. The posting at andersen.seamlesshiring.com/job/view/10472
 * read "Expires 12 hours from now" when it was checked at 10:28 Lagos on
 * 27 August 2026, which puts the cut-off late the same evening. The deadline is
 * therefore today's date, not tomorrow's, and that single field is what makes
 * this listing behave the way it needs to:
 *
 *   Closing soon      sorts on the deadline, soonest first, so it opens the row
 *   the board         renders "Closes today" through closingLabel()
 *   the stopwatch     ClosingSoon sets data-urgent at seven days or fewer
 *   the bell          buildFeed's window is seven days, so it raises a 'deadline'
 *
 * None of that needs a flag. Every surface reads the column, which is the point
 * of lib/day.ts. Getting the date wrong by one day here would be the whole
 * difference between a student applying and a student reading about something
 * that shut last night, so it is worth restating: LAGOS DATE, not UTC.
 *
 * ⚠ AND IT WILL DROP OFF TOMORROW, BY ITSELF. hasClosed() takes a past deadline
 * off the board in jobs/page.tsx before the row is ever rendered. Nothing needs
 * to be run to retire this. Do not "fix" its disappearance by moving the date.
 *
 * ⚠ THE EMPLOYER IS 'Andersen', NOT 'Andersen Tax LP'.
 *
 * The portal posts under the registered name, and carrying it onto the board
 * was wrong twice over. It reads as a law firm to a reader scanning a legal
 * careers board, which Andersen is not, and the "LP" is the part doing that
 * work. And it is not what the firm calls itself: the site is ng.andersen.com,
 * the mark is the ANDERSEN wordmark, and Andersen Global is the network behind
 * it. The short name is both the accurate one and the one a reader recognises.
 *
 * EMPLOYER_LOGOS in lib/firms-data.ts is keyed on the normalised employer
 * string and already carries 'andersen' alongside 'andersentaxlp', so the mark
 * resolves either way and the rename cannot silently drop the logo.
 *
 * WHY sector IS 'other' AND NOT 'law_firm'
 *
 * Andersen Tax LP is a tax and business advisory firm, not a law firm, and the
 * board's sector filter is about what the employer IS rather than who it hires.
 * It takes law graduates into Regulatory and Dispute Resolution work, which is
 * why it belongs on this board at all, and the practice areas below say so; the
 * sector would still be wrong. The same reasoning put Heirs Holdings in 'other'.
 *
 * WHY THERE IS NO logo_url
 *
 * Left null on purpose. The mark resolves through EMPLOYER_LOGOS in
 * lib/firms-data.ts, keyed on the normalised employer string, which is what
 * gives the pit and the cards the same trimmed, transparent art. Setting a URL
 * here would bypass that and serve a different file on one surface.
 *
 * Run: node scripts/2026-08-27-add-andersen-graduate-2027.mjs
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
const SLUG = 'andersen-2027-graduate-recruitment'

const ROW = {
  id: SLUG,
  slug: SLUG,
  title: '2027 Graduate Recruitment',
  employer: 'Andersen',
  sector: 'other',
  type: 'job',
  level: 'junior',
  location: 'Lagos',
  deadline: '2026-08-27',
  is_verified: true,
  is_rolling: false,
  is_active: true,
  /* Read off the service lines an applicant chooses between on the form, not
     inferred from what a tax firm probably does. */
  practice_areas: ['Tax', 'Corporate & Commercial', 'Dispute Resolution', 'Public Law & Regulatory'],
  about:
    'The Nigerian member firm of Andersen Global, working in tax, transfer pricing, regulatory and business advisory from Lagos. It takes a graduate intake each year into an Analyst role and is one of the larger non-law-firm employers of Nigerian law graduates.',
  role_desc:
    'A graduate Analyst position, entered by choosing one of five service lines: Tax, Corporate and Commercial Advisory, Regulatory and Dispute Resolution Services, Transfer Pricing, or Business Advisory Services. Analysts are assigned a mentor and supported through professional qualification. Selection runs in stages: a data validation review, an aptitude test covering analytical, numerical and problem solving questions, an assessment centre with a group exercise, a panel interview and a written essay, and a final one to one interview with a Partner.',
  requirements: [
    'Minimum of five credits at one sitting, including Mathematics and English Language',
    'A university degree in any discipline at Second Class Upper or above',
    'Law graduates additionally need at least a Second Class Lower from the Nigerian Law School',
    'NYSC completed by December 2026',
    'Not more than 26 years old at the date of application',
    'International graduates must supply academic transcripts',
  ],
  apply_email: null,
  apply_url: 'https://andersen.seamlesshiring.com/job/view/10472',
  source:
    "Andersen's own recruitment portal, andersen.seamlesshiring.com/job/view/10472, read 27 August 2026, where the posting is titled \"2027 ANDERSEN GRADUATE RECRUITMENT\" and showed twelve hours remaining. Applications are taken only through that portal.",
  logo_url: null,
}

const existing = await (
  await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}&select=id,title,deadline,is_active`, { headers: H })
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
    console.error('FAILED', res.status)
    console.error(body)
    process.exit(1)
  }
  const [wrote] = body
  console.log('Added:', wrote.employer, '/', wrote.title)
  console.log('closes', wrote.deadline, '| sector', wrote.sector, '| level', wrote.level)
  console.log('apply  ', wrote.apply_url)
}
