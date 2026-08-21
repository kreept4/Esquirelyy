/**
 * Jackson, Etti & Edu, 2026 Graduate Recruitment & Development Program.
 *
 * Source: the firm's own recruitment flier, which carries the JEE monogram and
 * the thirtieth-anniversary mark, the address www.jee.africa, the banner
 * "APPLICATIONS NOW OPEN", and reads:
 *
 *   "2026 Graduate Recruitment & Development Program. WHO CAN APPLY? Young
 *    Lawyers with 0-2 years post-call Experience. Minimum of a Second-Class
 *    Upper degree from a reputable University. Minimum of a Second-Class Lower
 *    degree from the Nigerian Law School. SCAN TO APPLY [QR]
 *    bit.ly/JEEGRDP2026. Application deadline: August 28, 2026."
 *
 * Checked against the firm's own applicant portal before writing, which is
 * where the QR code and the short link both land. The portal adds the facts the
 * flier leaves out and the row needs: full-time, Lagos, "Early Professional",
 * and a summary of what the programme actually is.
 *
 * ============================================================
 * THE DEADLINE, WHICH IS THE POINT OF THE ROW
 * ============================================================
 *
 * 28 August 2026, seven days out at the time of writing, so `is_rolling` is
 * false and `deadline` carries the date. That single field is the whole of the
 * deadline notice: the board's badge is derived from the date rather than from
 * `is_closing_soon` (see the note at JobsClient.tsx:607), and ClosingSoon.tsx
 * takes anything inside fourteen days, so this listing appears in the closing
 * section, carries a days-left badge on the board, and prints
 * "Closes 28 August 2026." on its own page without anything else being set.
 *
 * `is_closing_soon` is therefore false, matching every other seed and
 * lib/agent/apply.ts. It is a stored flag with no clock behind it: Ovie Obobolo
 * sat at true for days after its date passed, which is the exact reason the
 * board stopped reading it. Setting it true here would be accurate for a week
 * and wrong afterwards, with nothing to correct it.
 *
 * ============================================================
 * THE APPLY URL IS THE RESOLVED ONE, NOT THE SHORT LINK
 * ============================================================
 *
 * The flier publishes bit.ly/JEEGRDP2026. That answers 301 to
 *
 *   jeeafrica.seamlesshiring.com/job/view/10471?application_source=Direct
 *
 * and the stored URL is that address with the query stripped, verified to
 * answer 200 bare. Two reasons, and the first is the one from the LBVIP seed:
 * `application_source=Direct` is an attribution parameter, so carrying it over
 * would file every candidate this platform sends as having arrived on their
 * own. The one number that shows Esquirely delivered them applicants would read
 * as zero.
 *
 * The second is that a shortener is a third party between a member and the
 * application. bit.ly links expire, get rate-limited and get blocked on
 * corporate networks; the firm's own portal does none of those things. The
 * short link is recorded in `source` so the flier can still be traced back.
 *
 * ============================================================
 * WHAT IS RESTATED RATHER THAN COPIED
 * ============================================================
 *
 * Same rule as strip-copied-descriptions.mjs. The eligibility lines are facts
 * about who may apply, so they are rewritten as criteria rather than lifted;
 * the portal's summary paragraph and the firm's About Company text are the
 * firm's own prose and are not reproduced. `role_desc` says what the programme
 * consists of, in our words, and leaves the rest behind the apply link.
 *
 * "0-2 years post-call" is quoted as post-call, not converted to post-NYSC or
 * to PQE. The flier is specific that it means called to the Bar, and the
 * Nigerian Law School line beneath it is a separate requirement rather than a
 * restatement of the same one.
 *
 * ============================================================
 * FIELDS THAT ARE SET THE WAY THEY ARE
 * ============================================================
 *
 *   level        'junior'. The board's bands are student / junior / mid /
 *                senior and the select labels junior as "Entry-level", which is
 *                the portal's own "Early Professional" exactly. Nought to two
 *                years post-call is not a student intake and is not mid.
 *   type         'job'. The portal says full-time and this is a paid seat with
 *                a training programme attached, not an internship. A reader
 *                filtering to internships should not find it.
 *   tier         'Leading', as ALL_FIRMS already records for this firm.
 *   logo_url     Left null on purpose. norm('Jackson, Etti & Edu') matches
 *                norm(f.name) in ALL_FIRMS exactly, so logoForEmployer resolves
 *                the directory mark on its own. Setting it here would be a
 *                second copy of a path that already works, and the LBVIP row
 *                needed one only because its trading name defeated the lookup.
 *   apply_email  Null. The flier gives a QR code and a link and no address, and
 *                jee@jee.africa is the firm's general mailbox rather than a
 *                recruitment one. An application sent there is a lost one.
 *
 * `practice_areas` is the honest problem here, because the programme rotates
 * across departments rather than sitting in one. Tagged with the three of the
 * firm's practice areas that exist in lib/practice-areas.ts, so the board's
 * filter can match them: a reader filtering for intellectual property should
 * see this, since a rotation genuinely includes it. The firm's employment and
 * real estate practices are left off because those two strings are not in
 * PRACTICE_AREAS, and inventing them would add filter options with one listing
 * behind them.
 *
 * Run: node scripts/seed-jee-grdp-role.mjs
 * Idempotent, keyed on a fixed id, so re-running updates the row.
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
  id: 'jee-graduate-recruitment-development-program-2026',
  slug: 'jee-graduate-recruitment-development-program-2026',
  // The firm's own title, spelling included. They write "Program"; the house
  // spelling elsewhere is "Programme", and a listing is named by whoever is
  // hiring, not by us. A candidate searching the phrase they saw on the flier
  // finds it this way round.
  title: '2026 Graduate Recruitment & Development Program',
  // The registered name as ALL_FIRMS holds it, comma included. The flier leads
  // with the monogram and the portal signs itself the same way. This exact
  // string is what makes the logo resolve.
  employer: 'Jackson, Etti & Edu',
  sector: 'law_firm',
  tier: 'Leading',
  type: 'job',
  level: 'junior',
  location: 'Lagos',
  deadline: '2026-08-28',
  is_rolling: false,
  // Verified in the strong sense: the firm's own flier, and the firm's own
  // applicant portal at the end of the firm's own short link.
  is_verified: true,
  // Derived by the board from the date. See the long note above.
  is_closing_soon: false,
  practice_areas: ['Corporate & Commercial', 'Dispute Resolution', 'Intellectual Property'],
  about:
    'A full-service Nigerian firm in its thirtieth year, acting for Nigerian, pan-African and international clients across a range of sectors. Three offices in Nigeria, in Victoria Island, Ikeja and Abuja, with associate offices in Accra, Yaoundé and Harare. Chambers ranks the firm in Band 1 for intellectual property and TMT.',
  role_desc:
    'The firm’s structured graduate programme, known as the GRDP, for lawyers in their first two years at the Bar. Trainees rotate through departments on set work plans, sit with mentors and take classroom training across the firm’s practice areas, so the year is spent on live matters rather than in one seat. Full time, based in Lagos. Applications are open now and close on 28 August 2026.',
  requirements: [
    '0 to 2 years post-call experience',
    'Minimum of a Second Class Upper degree from a reputable university',
    'Minimum of a Second Class Lower from the Nigerian Law School',
  ],
  // The short link resolved and the attribution parameter stripped. See above.
  apply_url: 'https://jeeafrica.seamlesshiring.com/job/view/10471',
  apply_email: null,
  source: 'Jackson, Etti & Edu recruitment flier (bit.ly/JEEGRDP2026) and the firm’s applicant portal at jeeafrica.seamlesshiring.com',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, JSON.stringify(body, null, 1)); process.exit(1) }

const w = body[0]
console.log('wrote:', w.slug, '-', w.title)
console.log('  employer  ', w.employer)
console.log('  level     ', w.level, '/', w.type)
console.log('  deadline  ', w.deadline, '(rolling', w.is_rolling + ')')
console.log('  apply     ', w.apply_url)
