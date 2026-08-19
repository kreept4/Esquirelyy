/**
 * LBVIP 5.0, the Lekan Bamidele Virtual Internship Programme.
 *
 * Source: the firm's own Instagram announcement and the Google Form it links
 * to. Applications close 23 August 2026, which is why this is Phase 0 of the
 * ship plan rather than sequenced behind the pagination fix.
 *
 * ⚠ THE FIRST ROW IN `opportunities`, AND THE REASON THAT TABLE IS USED AT ALL.
 * A jobs row has one action: write to an address, or open an apply_url. This has
 * three, they are ordered, and the second cannot be started until the first is
 * finished. Flattening that into a paragraph of how_to_apply is what produces an
 * applicant who records the video, uploads it, and never tags the firm — which
 * is a disqualification, not a formatting problem.
 *
 * ============================================================
 * WHAT IS QUOTED RATHER THAN SUMMARISED, AND WHY
 * ============================================================
 *
 * THE ESSAY TOPIC IS REPRODUCED EXACTLY. It is the actual prompt applicants are
 * judged on, so a paraphrase would change what somebody submits. If it ever
 * looks too long for a card, the card wraps; the string does not get shortened.
 *
 * ELIGIBILITY IS QUOTED, INCLUDING "NEW WIGS". The firm opened this to law
 * students, law graduates AND new wigs, and the plan is explicit that it must
 * not be narrowed to students. A new wig is a newly called lawyer, which is
 * neither of the other two, and dropping the third group would quietly tell the
 * people it was most clearly aimed at that it is not for them.
 *
 * ============================================================
 * THE TRACKING PARAMETERS ARE STRIPPED
 * ============================================================
 *
 * The link as published carries ?utm_source=ig&utm_medium=social&
 * utm_content=link_in_bio. Those attribute the click to the firm's own
 * Instagram campaign. Carrying them over would file every Esquirely referral
 * as Instagram traffic in the firm's analytics, which is both wrong and
 * self-defeating: the one number that shows this platform sent them candidates
 * would read as zero. Stored bare, and verified to answer 200 with no redirect.
 *
 * ============================================================
 * WHY logo_url IS SET EXPLICITLY, WHEN THE MARK IS ALREADY IN THE REPOSITORY
 * ============================================================
 *
 * public/firm-logos/lekan-bamidele.png exists and the firm is in ALL_FIRMS, so
 * the plan's instruction to reuse the directory mark rather than upload it
 * again is satisfiable. It does NOT resolve automatically, and the reason is
 * worth writing down because it will catch the next opportunity too:
 *
 *   norm('Lekan Bamidele & Co')                     -> lekanbamideleandco
 *   norm('Lekan Bamidele & Co (The Bohemian Firm)')  -> lekanbamideleandcothebohemianfirm
 *
 * logoForEmployer() matches on exact normalised equality — deliberately, since
 * a prefix fallback once matched a filename to a firm — so the parenthetical
 * trading name defeats it. The organisation string keeps the trading name
 * because that is what the firm announces itself as and what an applicant will
 * recognise, and logo_url carries the path directly so the mark still renders.
 *
 * The alternative, dropping "(The Bohemian Firm)" to make the lookup work, puts
 * the database's convenience ahead of the reader's recognition. This way round
 * costs one column and no ambiguity.
 *
 * ============================================================
 * IDEMPOTENT VIA A FIXED ID
 * ============================================================
 *
 * `opportunities` has no slug column, so there is no natural key to upsert on.
 * The id below is a fixed UUID rather than a generated one, which makes
 * re-running this script an update of the same row instead of a second copy —
 * the rollback-safety rule the ship plan sets out. Do not regenerate it.
 *
 * Run: node scripts/seed-lbvip-opportunity.mjs
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

/** Fixed. See the note above. */
const LBVIP_ID = '1b7d3c9e-4f52-4a18-9c6d-2e8a5b0f7d41'

const TOPIC =
  'Can Social Media Influence Justice? Exploring the Impact of Social Media Activism on ' +
  'Public Opinion, Accountability and the Justice System in Nigeria.'

const row = {
  id: LBVIP_ID,
  title: 'LBVIP 5.0, Lekan Bamidele Virtual Internship Programme',
  organization: 'Lekan Bamidele & Co (The Bohemian Firm)',
  type: 'virtual_internship',

  /* The coarse audience bucket the table already had. The exact wording lives
     in `eligibility` below; this exists so a future filter can group by it. */
  target: 'all',
  location: 'Virtual',

  deadline: '2026-08-23',
  status: 'published',

  /* Bare. The utm parameters are stripped — see the note above. */
  link: 'https://docs.google.com/forms/d/e/1FAIpQLSdaEQftxL5ML_RLX_wtYyOFUdaxugdqkaKIoRyrnWKcotRo-w/viewform',

  description:
    'The fifth edition of the Lekan Bamidele virtual internship, run by the boutique practice ' +
    'trading as The Bohemian Firm, whose work is in entertainment, intellectual property and tax ' +
    'for creators, start-ups and rights holders. Applying means recording a short video on a set ' +
    'topic, posting it publicly, and completing the firm’s form. It is done entirely online.',

  /* Quoted, not narrowed. See the note above on new wigs. */
  eligibility: 'Law Students, Law Graduates, and New Wigs.',

  application_steps: [
    {
      step: 1,
      title: 'Record a two minute video on the set topic',
      detail:
        'Introduce yourself and speak on the topic: “' + TOPIC + '” ' +
        'Two minutes is the stated length. The topic is the firm’s own wording and is what ' +
        'the entry is judged on, so address it as written rather than a version of it.',
      off_platform: false,
    },
    {
      step: 2,
      title: 'Post it publicly and tag the firm',
      detail:
        'Upload the video to Instagram or LinkedIn, tag the firm at thebohemianlawyers, and ' +
        'include the hashtag LBVIP26. Then copy the link to the post, because the form asks for ' +
        'it. A video posted to a private account cannot be opened by the firm and cannot be ' +
        'marked.',
      off_platform: true,
    },
    {
      step: 3,
      title: 'Complete the application form',
      detail:
        'Fill in the firm’s form and paste the link to your video in the space provided. ' +
        'The form is hosted on Google Forms rather than on Esquirely, so anything entered there ' +
        'is handled under Google’s and the firm’s own policies rather than ours.',
      off_platform: true,
    },
  ],

  /**
   * Shown so an applicant can check the opportunity against the source before
   * recording anything, and linked so they can do it in one tap. Step 2 asks
   * them to tag the firm publicly, so a wrong handle is a wasted entry rather
   * than a cosmetic error.
   *
   * ⚠ EVERY URL HERE WAS REQUESTED AND CHECKED FOR A 200, and doing that caught
   * a mistake in the ship plan. The plan states "LinkedIn and Instagram at
   * thebohemianlawyers, X at thebohemianlaw". Instagram and X are right.
   * LINKEDIN IS NOT: linkedin.com/company/thebohemianlawyers answers 404. The
   * firm's actual company page is
   * linkedin.com/company/lekan-bamidele-co-the-bohemian-firm.
   *
   * WHY THE URL IS STORED RATHER THAN BUILT FROM THE HANDLE. Instagram and X
   * both resolve https://<host>/<handle>, so a template would have worked for
   * two of the three and produced a dead link for the third — and a dead link
   * on the one step that requires tagging the firm is the worst place on the
   * page for one. LinkedIn vanity URLs simply are not the @handle, so the shape
   * has to carry both.
   *
   * The `handle` is what an applicant types into the tag box; the `url` is
   * where the link goes. For LinkedIn those genuinely differ, which is exactly
   * why both fields exist.
   */
  firm_handles: {
    instagram: {
      handle: 'thebohemianlawyers',
      url: 'https://www.instagram.com/thebohemianlawyers/',
    },
    x: {
      handle: 'thebohemianlaw',
      url: 'https://x.com/thebohemianlaw',
    },
    linkedin: {
      handle: 'Lekan Bamidele & Co (The Bohemian Firm)',
      url: 'https://www.linkedin.com/company/lekan-bamidele-co-the-bohemian-firm',
    },
  },

  /* Explicit because the trading name defeats logoForEmployer(). See above. */
  logo_url: '/firm-logos/lekan-bamidele.png',

  source_url: 'https://www.instagram.com/thebohemianlawyers/',

  /* Left null deliberately. Phase 3 backfills practice areas across jobs,
     internships and opportunities in one pass, and tagging this row early would
     mean the one row that is tagged differently from every other. */
  /* Tagged from the firm's own practice, which firms-data.ts records as
     entertainment, intellectual property and tax for creators, start-ups and
     rights holders. Both values exist in lib/practice-areas.ts and are already
     in use on jobs.practice_areas, so the board's filter can match them.
     Media and entertainment is the firm's real centre of gravity and there is
     no tag for it yet; adding one would mean a filter option with a single
     listing behind it, which is Phase 3's decision rather than this row's. */
  practice_areas: ['Intellectual Property', 'Tax'],
}

const res = await fetch(`${URL_BASE}/rest/v1/opportunities?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) {
  console.error('seed failed', res.status, JSON.stringify(body, null, 1))
  process.exit(1)
}

const w = body[0]
console.log('wrote opportunity:', w.title)
console.log('  type      ', w.type)
console.log('  deadline  ', w.deadline)
console.log('  status    ', w.status)
console.log('  steps     ', (w.application_steps || []).length)
console.log('  logo      ', w.logo_url)
console.log('  link      ', w.link)
