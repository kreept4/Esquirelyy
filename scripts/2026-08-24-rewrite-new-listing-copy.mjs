/**
 * Rewrite the copy on the three listings added on 23 and 24 August.
 *
 * Reported by Kreept while vetting the preview, and there were four faults:
 *
 *   too long        The descriptions read like a brief, not like a listing.
 *   not human       Written at the reader rather than to them.
 *   em dashes       House style has none. They are the tell.
 *   a dead link     The Heirs fallback URL sat in the middle of a paragraph as
 *                   plain text, so a reader on a phone had to retype a Google
 *                   Forms path by hand. Nobody does that.
 *
 * ============================================================
 * THE NOTE PARAGRAPH, AND WHY IT IS A SEPARATE ONE
 * ============================================================
 *
 * The Heirs description now ends with a blank line and a paragraph beginning
 * "Note:". That is a convention read by RoleProse in jobs/[slug]/page.tsx,
 * which splits the description on blank lines, sets a Note paragraph as an
 * italic footnote under a rule, and turns bare URLs into real links.
 *
 * WHY IT HAD TO LEAVE THE BODY. It is not part of the job. It is what to do
 * when the employer's own link will not open, which is a different kind of
 * sentence from "here is the work", and running the two together is how a
 * reader misses the one that rescues them.
 *
 * IT IS ONLY EVER SHOWN TO A SIGNED-IN READER, and that is the part worth
 * understanding before editing this string. The product's split is that the
 * DESCRIPTION is public and the APPLICATION ROUTE is what the account is for.
 * This listing is in OPEN_JOB_SLUGS, so a signed-out reader renders the role
 * section; a working application URL sitting in that prose would walk straight
 * through the gate that jobs/[slug]/page.tsx takes such care over, and would sit
 * in the HTML for anyone who pressed View Source while the Apply button below
 * still said "sign in to apply". RoleProse drops the whole paragraph for a
 * signed-out reader. So: application routes go in Note paragraphs, never in the
 * body.
 *
 * ============================================================
 * PRACTICE AREAS ON HEIRS, WHICH REVERSES AN EARLIER DECISION
 * ============================================================
 *
 * seed-heirs-holdings-graduate-trainee.mjs set `practice_areas` to null and
 * argued for it at length: a graduate trainee rotating through a conglomerate
 * has no practice area, and inventing one puts the listing in front of somebody
 * filtering for corporate work on the strength of nothing.
 *
 * That reasoning was half right and the half it missed is what shipped. Null
 * areas means ClosingSoon's card has nothing for its middle line but the
 * location, so the card read "Nigeria." and nothing else, which Kreept
 * correctly called bland. It also means the practice filter can never surface
 * the listing at all.
 *
 * The honest position is that the rotation is not arealess, it is BROAD: a
 * lawyer inside this group does corporate and commercial work, regulatory
 * compliance and company secretarial work, which is what role_desc already
 * said in prose while the column said nothing. Three areas that are actually
 * true beat a null that renders as a shrug. ClosingSoon's fallback was fixed
 * too, so the worst card on the board is still a sentence.
 *
 * ============================================================
 * ONE EM DASH SURVIVES, ON PURPOSE
 * ============================================================
 *
 * U&P Law require the subject line "Job Application – [Position/Area of
 * Interest] – [Your Name]". That punctuation is theirs, it is an instruction to
 * the applicant rather than our copy, and an application titled differently
 * from what the firm asked for is the kind of thing that gets filed wrong. It
 * is quoted exactly. Everything in this file that IS our voice has none.
 *
 * Run: node scripts/2026-08-24-rewrite-new-listing-copy.mjs
 * Idempotent. Re-running writes the same strings and reports no change.
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

const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSf0wrZCyybeptLdG8EKSyVbBhMemEBKJQlFIaJVmR28dNJO_Q/viewform'

const PATCHES = {
  'heirs-holdings-graduate-trainee-programme-2026': {
    /* The last em dash in any live listing was in this array, on the line that
       tells a lawyer they are eligible. Rewritten as two clauses. */
    requirements: [
      "Minimum of a Bachelor's degree at Second Class Lower (2:2) from an accredited Nigerian or international university",
      'Open to any discipline, law included. An LL.B and call to the Bar qualify',
      'Completed the NYSC programme',
      'NYSC discharge certificate, or an exemption certificate if you were exempt, in hand at the point of applying',
      'No more than two years of post-NYSC professional experience',
      '27 years old or younger at the time of application',
    ],
    /* ⚠ EVERY ONE OF THESE IS IN lib/practice-areas.ts, AND THE FIRST DRAFT OF
       THIS LINE WAS NOT. It read 'Company Secretarial', which is real work and
       is not a canonical area, so it would have added a filter option with a
       single listing behind it — the precise failure seed-jee-grdp-role.mjs
       warns about when it explains why the firm's employment and real estate
       practices were left off that row. Check the constant, not your instinct.
       Energy replaces it and is not a substitute chosen to fill the slot: the
       group's businesses are power, energy, financial services, hospitality,
       technology and healthcare, so it is the truer of the two anyway. */
    practice_areas: ['Corporate & Commercial', 'Public Law & Regulatory', 'Energy & Natural Resources'],
    role_desc:
      'Six months at the holding company, split between classroom training with Heirs Academy and real work across the group, so you are on live business rather than shadowing someone who is.\n\n' +
      'Lawyers can apply. It is open to any degree at a 2:2 or better, so an LL.B counts, and there is legal, compliance and company secretarial work across the businesses. Three bars are strict and all three are below: NYSC finished with the certificate in hand, under two years since, and 27 or under on the day you apply.\n\n' +
      `Note: apply through the link on the company's own posting. If it will not open, because you have no LinkedIn account or your network blocks it, the form is at ${FORM}`,
  },

  'principle-legal-consult-junior-associate': {
    role_desc:
      'A litigation seat in Abuja for someone 2 to 3 years past NYSC, ideally out of an established firm. You will be on your own feet in court, tracking cases and keeping the status reports honest, running legal and regulatory research, and drafting opinions, correspondence and agreements.\n\n' +
      'The firm handles matters across Abuja and London. They are looking for someone commercially aware, proactive and organised, with strong drafting and research. No closing date was published.',
  },

  'uandp-law-multiple-practice-areas': {
    /* The em dash is gone from OUR title. This string is printed as the listing
       name on the board, in the bell and in the email. */
    title: 'Legal Professionals, Multiple Practice Areas',
    role_desc:
      'An open call rather than one named seat, across corporate governance, commercial transactions, regulatory compliance, energy, technology, investment and business structuring.\n\n' +
      'The firm is looking for commercially minded, detail-oriented lawyers. Send a CV and a cover letter answering three questions: why you want to join U&P Law, what you would contribute, and where you see your career in three to five years. Title the email "Job Application – [Position/Area of Interest] – [Your Name]", as the firm asks. No closing date.',
  },
}

/* Our own copy must carry no em dash. The firm-supplied subject line above uses
   an EN dash (–), which is a different character and is deliberately not
   caught here. A guard rather than a comment, because a comment does not fail. */
for (const [slug, patch] of Object.entries(PATCHES)) {
  for (const [field, value] of Object.entries(patch)) {
    if (typeof value === 'string' && value.includes('—')) {
      console.error(`em dash in ${slug}.${field} — refusing to write.`)
      process.exit(1)
    }
  }
}

let changed = 0
for (const [slug, patch] of Object.entries(PATCHES)) {
  const [before] = await (
    await fetch(`${BASE}/rest/v1/jobs?slug=eq.${slug}&select=slug,title,role_desc,practice_areas`, { headers: H })
  ).json()
  if (!before) {
    console.error(`no row for ${slug}`)
    process.exit(1)
  }

  const same = Object.entries(patch).every(([k, v]) =>
    Array.isArray(v) ? JSON.stringify(before[k]) === JSON.stringify(v) : before[k] === v
  )
  if (same) {
    console.log(`${slug}\n  unchanged`)
    continue
  }

  const res = await fetch(`${BASE}/rest/v1/jobs?slug=eq.${slug}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    console.error('FAILED', slug, res.status, await res.text())
    process.exit(1)
  }
  const [after] = await res.json()
  changed++
  const paras = String(after.role_desc).split(/\n\s*\n/).length
  console.log(`${slug}`)
  console.log(`  title      ${after.title}`)
  console.log(`  role_desc  ${String(after.role_desc).length} chars, ${paras} paragraph${paras === 1 ? '' : 's'}`)
  if (patch.practice_areas) console.log(`  areas      ${after.practice_areas.join(', ')}`)
}

console.log(`\n${changed} row${changed === 1 ? '' : 's'} rewritten.`)
console.log('The Heirs Note paragraph renders as an italic footnote with a live')
console.log('link, and ONLY to a signed-in reader. Check it signed out too.')
