/**
 * Put the 6th Professor J.O. Fabunmi Internship Competition on the board.
 *
 * Read off the firm's own flier, which is the whole source. Every field below
 * is on that graphic and nothing else is.
 *
 * ============================================================
 * WHY THIS IS AN OPPORTUNITY ROW AND NOT A JOBS ROW
 * ============================================================
 *
 * It is not a seat. Nobody is hired at the end of it by right, there is no
 * employer address to apply to, and the whole thing runs on a form with a
 * window. That is the shape lib/opportunities.ts was written for, and LBVIP is
 * the precedent.
 *
 * ⚠ `type` IS 'internship' AND IT WANTS TO BE 'competition'. The table carries
 * opportunities_type_check, a seven value vocabulary set in
 * 2026-08-17-opportunities-phase0-fix.sql, and 'competition' is not in it. The
 * insert fails outright against the live constraint, which is the constraint
 * doing its job.
 *
 * So this ships as 'internship', which is true rather than merely convenient:
 * the prize is an internship, and Internship is the bucket a student narrowing
 * the board's type filter is looking in. What is lost is only the precise word
 * on the detail page, which reads "Internship" instead of "Competition".
 *
 * lib/opportunities.ts already carries 'competition' in INTERNSHIP_KINDS and in
 * OPPORTUNITY_TYPE_LABELS, so the code half is done and is forward compatible.
 * Run scripts/2026-09-21-opportunity-type-competition.sql, then change the one
 * line below, and the detail page starts printing the right word. Nothing else
 * moves.
 *
 * ⚠ IT IS ALSO THE SECOND OPPORTUNITY, which that file has a note about: it
 * says to add a `slug text unique` column when this happens, because slugs are
 * derived from the title and renaming a row silently changes its URL. That is
 * still the right call and it is NOT done here, because it is a migration and
 * this is an insert. The two derived slugs are unique, so the site is correct
 * today. Left as the next thing to do rather than pretended away.
 *
 * ============================================================
 * WHAT WAS CHECKED BEFORE WRITING ANY OF IT
 * ============================================================
 *
 * The firm is real and the flier is theirs. jofsolicitors.ng resolves and
 * serves the firm's own site, which names J.O. FABUNMI & CO., founded 1991,
 * Prof. J.O Fabunmi as founding partner and Mr Olukayode Fabunmi as managing
 * partner. The enquiry address on the flier is on that same domain, and the
 * domain holds an MX record at mail.jofsolicitors.ng, so lgic@jofsolicitors.ng
 * is deliverable. That MX check is what caught two undeliverable firm addresses
 * in the September audit and it is worth doing every time.
 *
 * ⚠ THE COMPETITION IS NOT ON THE FIRM'S WEBSITE. The flier is the only
 * published source, so `source_url` is the firm's site rather than a page about
 * the competition, and step 3 below sends the reader to the firm's own address
 * to confirm. The registration form is on forms.gle rather than the firm's
 * domain, which is ordinary for Nigerian firms running these and is still the
 * one thing on the flier a reader cannot check for themselves.
 *
 * ============================================================
 * WHAT IS DELIBERATELY NULL
 * ============================================================
 *
 * `location`: not stated anywhere on the flier. The firm is in Lagos on its own
 * site, but the competition is not said to be, and putting Lagos on the card
 * would be us saying something the employer did not.
 *
 * `practice_areas`: not stated. The competition is general.
 *
 * `firm_handles`: no handles on the flier, and none verified elsewhere.
 *
 * TWO THINGS ARE PRINTED WITH ERRORS ON THE GRAPHIC: "Must be awaiting for law
 * school admission", and "or aboard" for abroad. Both are written out in
 * correct English below, because this is our copy describing their criteria
 * rather than a quotation of an instruction to applicants. The prize figure,
 * the dates, the address and the form link are reproduced exactly.
 *
 * ⚠ NEITHER THE FORM URL NOR THE ENQUIRY ADDRESS IS WRITTEN INTO THESE STEPS,
 * AND THE FIRST VERSION OF THIS FILE PUT BOTH THERE. jobs/[slug] nulls
 * `applyHref` for a signed-out reader on purpose, and its own note says why:
 * the account exists for the application route, and hiding an address in the
 * markup "is not a gate", so it is nulled at the source and there is nothing to
 * find. Printing the same form link and mailbox in the description handed both
 * straight back to every signed-out reader and to Googlebot, on the one listing
 * that is deliberately public. The gate held; the copy walked around it.
 *
 * LBVIP's steps were right about this from the start: "Complete the application
 * form", no URL. Same here now.
 *
 * ⚠ AND IT LEAVES A REAL GAP: toBoardRow sets `apply_email` to null for every
 * opportunity, so unlike a job, an opportunity has no gated mailbox line to put
 * an enquiry address in. A signed-in reader cannot see it either. Worth fixing
 * in the adapter rather than by putting the address back in prose.
 *
 * ⚠ THE WINDOW IS 14 TO 28 SEPTEMBER 2026 AND TODAY IS THE 21ST. Seven days.
 * `deadline` is the 28th, which is what the countdown and the closing-soon flag
 * read, and hasPassed treats the 28th itself as still open.
 *
 * Run: node scripts/2026-09-21-add-lgic.mjs
 * Idempotent: updates the row if the title is already there.
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
if (!BASE || !KEY) throw new Error('Supabase env missing from .env.local')
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const TITLE = '6th Annual Professor J.O. Fabunmi Internship Competition (LGIC)'

const row = {
  title: TITLE,
  organization: 'J.O Fabunmi & Co',
  /* See the note above before changing this. */
  type: 'internship',
  target: 'all',
  location: null,
  deadline: '2026-09-28',
  link: 'https://forms.gle/x5r7FNuGLns2FUNc7',
  status: 'published',
  logo_url: '/employer-logos/jo-fabunmi.png',
  practice_areas: null,
  firm_handles: null,
  source_url: 'https://jofsolicitors.ng/',
  description:
    'The sixth edition of the internship competition run by J.O Fabunmi & Co, a ' +
    'full-service firm founded in 1991 and named for its founding partner, ' +
    'Professor J.O. Fabunmi. It is open to Nigerians waiting to enter the ' +
    'Nigerian Law School. The prize money is 3 million naira. ' +
    'Registration is by form and the window is two weeks.',
  eligibility:
    'Nigerian. Awaiting admission to the Nigerian Law School. A minimum of ' +
    'Second Class Upper Division from an accredited university in Nigeria or ' +
    'abroad.',
  application_steps: [
    {
      step: 1,
      title: 'Check you are inside the window',
      detail:
        'Registration runs from 14 to 28 September 2026. There is no extension ' +
        'and no rolling intake, so the 28th is the end of it.',
    },
    {
      step: 2,
      title: 'Register on the form',
      detail:
        "Apply opens the firm's registration form. Have your class of degree and " +
        'your university to hand.',
      off_platform: true,
    },
    {
      step: 3,
      title: 'Send questions to the firm, not to the form',
      detail:
        "The firm publishes an enquiry address on its own domain, and that is the " +
        'right place to settle anything not answered here: what the prize money ' +
        'covers, and when the internship itself runs. Ask there rather than in ' +
        'the form.',
      off_platform: true,
    },
  ],
}

const found = await fetch(
  `${BASE}/rest/v1/opportunities?select=id&title=eq.${encodeURIComponent(TITLE)}`,
  { headers: H },
).then(r => r.json())

if (found.length) {
  const res = await fetch(`${BASE}/rest/v1/opportunities?id=eq.${found[0].id}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error(`update failed: ${res.status} ${await res.text()}`)
  console.log('updated existing row', found[0].id)
} else {
  const res = await fetch(`${BASE}/rest/v1/opportunities`, {
    method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error(`insert failed: ${res.status} ${await res.text()}`)
  console.log('inserted', (await res.json())[0].id)
}

const all = await fetch(
  `${BASE}/rest/v1/opportunities?select=title,type,deadline,status&order=created_at`,
  { headers: H },
).then(r => r.json())
console.log('\nopportunities on the board:')
for (const o of all) {
  console.log(`  [${o.status}] ${o.type.padEnd(19)} ${o.deadline ?? 'rolling'}  ${o.title}`)
}
