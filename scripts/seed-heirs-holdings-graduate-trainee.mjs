/**
 * Heirs Holdings, 2026 Graduate Trainee Programme.
 *
 * Source: the company's own LinkedIn post, 24 August 2026, from the verified
 * Heirs Holdings page. It reads:
 *
 *   "Applications are now open for the 2026 Heirs Holdings Graduate Trainee
 *    Programme, a six-month experience combining learning through Heirs Academy
 *    with hands-on exposure to real business experience and professional
 *    exposure. We want to hear from you if you: Hold a minimum of a Bachelor's
 *    degree with a Second Class Lower (2:2) from an accredited Nigerian or
 *    international university. Have completed the NYSC programme. Have no more
 *    than two years of post-NYSC professional experience. Are 27 years old or
 *    younger at the time of application. Applications close September 4, 2026."
 *
 * ============================================================
 * ⚠ NOT A LAW FIRM, AND THAT IS A DECISION RATHER THAN AN OVERSIGHT
 * ============================================================
 *
 * Heirs Holdings is an investment holding company, not a practice, and this
 * programme is open to any Bachelor's degree rather than to lawyers. It is on
 * the board for the same reason the ECOWAS Young Graduates Immersion Programme
 * is: a Nigerian law graduate inside the eligibility bar can apply to it today,
 * and a legal careers platform that only ever showed law firms would be hiding
 * half of what its members actually take.
 *
 * `sector` is therefore 'other' — "Multinationals & other" in the board's own
 * filter — which is exactly what ECOWAS carries, so the two sit together under
 * the one filter a reader would use to find either.
 *
 * ⚠ AND `practice_areas` IS NULL RATHER THAN GUESSED. Every other row on the
 * board carries areas because the work has a shape. A graduate trainee rotating
 * through a conglomerate does not, and tagging this with, say, Corporate &
 * Commercial to fill the field would put it in front of somebody filtering for
 * corporate work on the strength of nothing. Null means the practice filter
 * skips it, which is the honest answer to a question this listing cannot
 * answer. JobsClient handles a null areas list already.
 *
 * ============================================================
 * THE DEADLINE
 * ============================================================
 *
 * 4 September 2026, eleven days out at the time of writing, so `is_rolling` is
 * false and `deadline` carries the date. That one field is the whole of the
 * deadline treatment, exactly as in seed-jee-grdp-role.mjs: the board's badge is
 * derived from the date rather than from `is_closing_soon`, ClosingSoon.tsx
 * takes anything inside fourteen days, and buildFeed's closing notification
 * takes anything inside seven.
 *
 * So this appears in the Closing soon section straight away, and its bell
 * notification arrives on its own on 28 August without anybody running
 * anything. The stopwatch mark, which ClosingSoon sets at seven days or fewer,
 * appears on the same day.
 *
 * `is_closing_soon` is false, matching every other seed. It is a stored flag
 * with no clock behind it: Ovie Obobolo sat at true for days after its date had
 * passed, which is why the board stopped reading it.
 *
 * ============================================================
 * ⚠ THE PRIMARY LINK IS THE lnkd.in ONE ON THE POST. THE FORM IS SECONDARY.
 * ============================================================
 *
 * THIS IS THE OPPOSITE OF WHAT seed-jee-grdp-role.mjs DOES, AND THE REVERSAL IS
 * DELIBERATE RATHER THAN AN INCONSISTENCY. That seed resolves
 * bit.ly/JEEGRDP2026 to the firm's own portal and stores the resolved address,
 * on the reasoning that a shortener is a third party standing between a member
 * and an application: lnkd.in and bit.ly links get rate-limited, get blocked on
 * corporate networks, and interstitial away from anyone not signed in.
 *
 * That reasoning is still correct and it is overridden here on Kreept's
 * instruction, for a reason it does not cover. The JEE short link resolves to
 * the FIRM'S OWN PORTAL — a page the firm controls, that carries the full
 * posting, and that a candidate can read before deciding. This one resolves to a
 * bare Google Form: no posting, no context, straight into questions. Sending a
 * member to the form first means sending them past the advertisement they were
 * meant to read, and past the four eligibility bars printed on it.
 *
 * So `apply_url` is the link as published, which lands on the LinkedIn post,
 * and the form address is written into `role_desc` as the route to use if the
 * short link will not open. A reader who cannot get past lnkd.in — no LinkedIn
 * account, a blocked network — can still see the form URL and type it.
 *
 * ⚠ THE FORM URL IS IN PROSE BECAUSE THERE IS NOWHERE ELSE FOR IT. The jobs
 * table has `apply_url`, `apply_email` and `source`, and `source` is never
 * rendered — it is internal provenance, so a secondary route stored there
 * would be invisible to the person who needs it. role_desc renders as plain
 * text and is not linkified, so the URL is readable and copyable rather than
 * clickable. That is the honest limit of the schema as it stands. WHEN A SECOND
 * LISTING NEEDS A FALLBACK ROUTE, add an `apply_url_alt` column and move it
 * there; one row does not earn a migration.
 *
 * ⚠ EITHER ROUTE LEAVES THE PLATFORM, and the form is a Google Form, so
 * anything a member types into it is handled under Google's and Heirs Holdings'
 * policies rather than ours. Same footing as the LBVIP form; see the
 * `off_platform` flags on that opportunity's application steps.
 *
 * ============================================================
 * WHAT IS RESTATED RATHER THAN COPIED
 * ============================================================
 *
 * Same rule as strip-copied-descriptions.mjs. The four eligibility lines are
 * facts about who may apply, so they are rewritten as criteria; the post's
 * opening pitch — "Are you driven, curious and ready for an exceptional
 * opportunity? This could be where your journey begins." — is the company's own
 * marketing prose and is not reproduced. `role_desc` says what the programme
 * consists of, in our words.
 *
 * ⚠ THE AGE BAR AND THE POST-NYSC CAP ARE BOTH IN `requirements`, AND NEITHER
 * IS SOFTENED. They are the two lines that disqualify most readers, and a
 * listing that leaves them to be discovered on the form has wasted somebody's
 * afternoon. Twenty-seven or younger AT THE TIME OF APPLICATION is the
 * company's own wording and is kept as written, because "27 or younger" alone
 * invites the reader to wonder which date it is measured from.
 *
 * ⚠ TWO LINES IN `requirements` ARE NOT ON THE POST AT ALL, and both are
 * there on Kreept's instruction because the post's silence on them is what
 * costs a reader the application:
 *
 *   the discipline line   The post says "a Bachelor's degree" and names no
 *                         subject, which on a legal careers board reads as an
 *                         open question rather than a yes. Lawyers can apply.
 *                         Saying so is the difference between a member acting
 *                         on this listing and scrolling past it.
 *   the certificate line  "Have completed the NYSC programme" is a statement
 *                         about the past; what the application needs is the
 *                         DOCUMENT — the discharge certificate, or an exemption
 *                         certificate for anyone who was exempt — and needs it
 *                         in hand now. See the note at the field itself.
 *
 * Run: node scripts/seed-heirs-holdings-graduate-trainee.mjs
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
  id: 'heirs-holdings-graduate-trainee-programme-2026',
  slug: 'heirs-holdings-graduate-trainee-programme-2026',
  title: '2026 Graduate Trainee Programme',
  employer: 'Heirs Holdings',
  /* 'other' is the board's "Multinationals & other". See the long note above
     for why this is not law_firm and why that is the point. */
  sector: 'other',
  /* Null, not a tier. `tier` on this board means a Nigerian law firm's standing
     in the Chambers and Legal 500 tables, which is not a thing a holding
     company has. Inventing one would put a ranking claim on a row that no
     ranking body has ever assessed. */
  tier: null,
  /* 'job' rather than 'internship'. It is six months and it is called a
     traineeship, which reads as an internship — but the board's type filter
     offers Full-time and Internship only, and this is a full-time salaried
     graduate intake with an age bar and an experience cap, i.e. the thing a
     graduate programme is. ECOWAS is typed 'internship' because it genuinely is
     an immersion placement; this is not the same animal. */
  type: 'job',
  level: 'junior',
  /* The post names no city. Heirs Holdings is headquartered in Lagos, and the
     row does NOT say Lagos on the strength of that: the programme rotates
     across a group with businesses in several states, and a location we
     inferred would be a location a reader plans around. */
  location: 'Nigeria',
  deadline: '2026-09-04',
  is_rolling: false,
  /* The company's own verified page, and the application form itself. */
  is_verified: true,
  /* Derived by the board from the date. See the long note above. */
  is_closing_soon: false,
  /* Null on purpose. See the note above — a rotating graduate intake has no
     practice area, and filling the field would be a guess a reader filters on. */
  practice_areas: null,
  about:
    'A Nigerian-founded investment holding company with interests across power, energy, financial services, hospitality, technology and healthcare. Heirs Academy is its in-house learning arm and delivers the taught half of this programme.',
  role_desc:
    'A six-month graduate traineeship that pairs structured learning through Heirs Academy with placement on live business work across the group, so the time is split between classroom training and real commercial exposure rather than spent shadowing. Lawyers can and do apply: the programme is open to any discipline at a 2:2 or better, so an LL.B and a call to the Bar qualify you the same as any other degree, and Heirs Holdings has legal, compliance and company secretarial work across its businesses. There is an age limit, a cap on post-NYSC experience, and a document you must already hold — all three are in the eligibility list and all three are strict. Applications close on 4 September 2026. Apply through the link on the company’s own posting. If that link will not open for you — no LinkedIn account, or a network that blocks it — the application form is at docs.google.com/forms/d/e/1FAIpQLSf0wrZCyybeptLdG8EKSyVbBhMemEBKJQlFIaJVmR28dNJO_Q/viewform',
  /* ⚠ THE NYSC LINE IS TWO LINES, AND THE SECOND ONE IS THE ONE THAT BITES.
     The post says only "Have completed the NYSC programme". Completing it and
     being able to PROVE you completed it are different states, and the gap
     between them is where a law graduate loses this application: the discharge
     certificate, or the exemption certificate for anyone who was exempt, has to
     be in hand at the point of applying. Somebody whose certificate has not been
     collected, or was lost and never replaced, cannot complete the form no
     matter how eligible they are on every other line. Requesting a replacement
     is not a same-week job.
     Split out rather than folded into the line above, because a reader scanning
     an eligibility list reads each line as one thing to check, and "completed
     the NYSC programme" is checked off from memory in about a second. */
  requirements: [
    "Minimum of a Bachelor's degree at Second Class Lower (2:2) from an accredited Nigerian or international university",
    'Open to any discipline, law included — an LL.B and call to the Bar qualify',
    'Completed the NYSC programme',
    'NYSC discharge certificate, or an exemption certificate if you were exempt, in hand at the point of applying',
    'No more than two years of post-NYSC professional experience',
    '27 years old or younger at the time of application',
  ],
  /* The link as the company published it, which lands on the LinkedIn post
     rather than on the form. The form is the secondary route and is written
     into role_desc above. See the long note on why this seed does the opposite
     of seed-jee-grdp-role.mjs. */
  apply_url: 'https://lnkd.in/eEFhWZud',
  apply_email: null,
  source: 'Heirs Holdings LinkedIn post, 24 August 2026 (lnkd.in/eEFhWZud), and the Google Form it links to, supplied directly by Kreept',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, JSON.stringify(body, null, 1)); process.exit(1) }

const w = body[0]
const days = Math.ceil((new Date(w.deadline).getTime() - Date.now()) / 86_400_000)
console.log('wrote:', w.slug, '-', w.title)
console.log('  employer  ', w.employer)
console.log('  sector    ', w.sector, '/', w.type, '/', w.level)
console.log('  deadline  ', w.deadline, `(${days} days out, rolling ${w.is_rolling})`)
console.log('  apply     ', w.apply_url)
console.log('')
console.log(`  ${days} days out, so it is in the fourteen-day Closing soon section now`)
console.log('  and gets its own bell notification when it reaches seven days.')
