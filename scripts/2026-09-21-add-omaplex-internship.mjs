/**
 * Put the 2026 Omaplex Virtual Internship on the board.
 *
 * Read off the firm's own flier, which is the whole source.
 *
 * ============================================================
 * THE REGISTRATION LINK CAME OUT OF THE QR CODE
 * ============================================================
 *
 * The flier prints no URL at all. It says "Scan the QR code to register" and
 * the code is the only route, which is fine on a phone and useless to a listing
 * that has to store a link. The code decodes to
 * https://forms.gle/TsMqGBDkvzrkoJ5q8, which redirects to a live Google form
 * at docs.google.com/forms/d/e/1FAIpQLSdtIuhzGN3uBKJdOyvMwCiIOZwBZo_bfmknWJzna15Vx40XBA.
 *
 * ⚠ THAT REDIRECT WAS FOLLOWED AND CHECKED rather than assumed, because a
 * decoded string is not evidence of anything on its own. It resolves to a real
 * forms.gle target. It answers 401 to an anonymous request, which is ordinary
 * for a form set to require a Google sign-in and is not a sign the link is
 * wrong; a candidate opening it in a browser they are signed into will get the
 * form.
 *
 * ============================================================
 * OMAPLEX IS IN THE DIRECTORY, WHICH CHANGES TWO THINGS
 * ============================================================
 *
 * Unlike J.O Fabunmi & Co, this firm has a researched entry in ALL_FIRMS, so
 * `logo_url` points at /firm-logos/omaplex.png, the mark the directory already
 * serves, rather than at a crop cut out of the flier for the occasion. Nothing
 * had to be extracted.
 *
 * `type` is 'virtual_internship', which is both accurate and already in the
 * opportunities_type_check vocabulary, so this one needs no migration. It is
 * the same value LBVIP carries and it files under Internship on the board
 * through INTERNSHIP_KINDS.
 *
 * ============================================================
 * ⚠ THE FORM LINK IS NOT WRITTEN INTO THE STEPS, AND THAT IS NOT AN OVERSIGHT
 * ============================================================
 *
 * The first version of the LGIC listing printed its form URL and the firm's
 * mailbox in `application_steps`, and a security review of that commit found
 * both sitting in the HTML of a page deliberately readable by signed-out
 * visitors and by crawlers. jobs/[slug] nulls `applyHref` for exactly those
 * readers, and its own note says hiding an address in markup "is not a gate".
 * Publishing the same address in prose walked straight around the gate.
 *
 * So the link lives in `link`, which the Apply button reads and which is nulled
 * for a signed-out reader, and the steps describe the route without printing
 * it. LBVIP has always done it this way.
 *
 * ============================================================
 * WHAT IS AND IS NOT CARRIED OVER
 * ============================================================
 *
 * `practice_areas` maps the flier's seven subject areas onto the vocabulary the
 * board's "Area of law" filter actually offers, because a value outside that
 * list is invisible the moment a reader narrows by it:
 *
 *   Technology & Data Protection  -> Technology
 *   Intellectual Property         -> Intellectual Property
 *   Dispute Resolution            -> Dispute Resolution
 *   Regulatory Compliance         -> Public Law & Regulatory
 *   Corporate Governance          -> Policy & Governance
 *   Sport Arbitration             -> Arbitration
 *
 * ⚠ ENTERTAINMENT & FASHION LAW HAS NO EQUIVALENT in that vocabulary and is
 * therefore NOT in the array. It is named in the description instead, so the
 * subject is not lost to a reader even though it cannot be filtered on. The
 * alternative was inventing a category for one listing.
 *
 * `location` is 'Virtual', which the flier states outright in its title, unlike
 * the Fabunmi listing where it had to be left null.
 *
 * `firm_handles` carries only Instagram and X. The flier shows four social
 * icons against the single handle @omaplexlawfirm, and for those two the
 * profile URL is host plus handle. It is not for LinkedIn, whose vanity URL is
 * unrelated to the @name, and the note on that field in lib/opportunities.ts
 * records that templating one produced a 404 for exactly that platform. An
 * unverified LinkedIn URL is left out rather than guessed.
 *
 * Deadline is 5 October 2026, fourteen days out at the time of writing, so this
 * sits outside CLOSING_WINDOW_DAYS and produces no bell row yet.
 *
 * Run: node scripts/2026-09-21-add-omaplex-internship.mjs
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

const TITLE = 'Omaplex Virtual Internship 2026'

const row = {
  title: TITLE,
  organization: 'Omaplex Law Firm',
  type: 'virtual_internship',
  target: 'all',
  location: 'Virtual',
  deadline: '2026-10-05',
  link: 'https://forms.gle/TsMqGBDkvzrkoJ5q8',
  status: 'published',
  logo_url: '/firm-logos/omaplex.png',
  source_url: 'https://www.omaplex.com.ng',
  practice_areas: [
    'Technology',
    'Intellectual Property',
    'Dispute Resolution',
    'Public Law & Regulatory',
    'Policy & Governance',
    'Arbitration',
  ],
  firm_handles: {
    instagram: { handle: 'omaplexlawfirm', url: 'https://www.instagram.com/omaplexlawfirm/' },
    x: { handle: 'omaplexlawfirm', url: 'https://x.com/omaplexlawfirm' },
  },
  description:
    'The 2026 edition of the virtual internship run by Omaplex Law Firm, a ' +
    'full-service practice with its head office in Abuja. It is aimed at law ' +
    'students and aspiring lawyers who want to see practice outside the ' +
    'classroom, and it runs remotely. The firm names seven subjects it will ' +
    'cover: technology and data protection, intellectual property, ' +
    'entertainment and fashion, dispute resolution, regulatory compliance, ' +
    'corporate governance, and sport arbitration. Sponsored by O.M D’Law.',
  eligibility:
    'Law students and aspiring lawyers. The firm sets no class of degree, no ' +
    'year of study and no call requirement on the flier.',
  application_steps: [
    {
      step: 1,
      title: 'Check you are inside the window',
      detail:
        'Applications close on 5 October 2026. The flier gives one date and no ' +
        'rolling intake, so that is the end of it.',
    },
    {
      step: 2,
      title: 'Register on the form',
      detail:
        'Apply opens the firm’s registration form, the same one the QR code on ' +
        'the flier points at. It may ask you to be signed in to a Google ' +
        'account before it will accept an entry.',
      off_platform: true,
    },
    {
      step: 3,
      title: 'Ask the firm what the flier does not say',
      detail:
        'The flier does not give the dates the internship itself runs, the time ' +
        'commitment expected each week, or whether anything is paid. Omaplex ' +
        'publishes contact details on its own website and posts as ' +
        '@omaplexlawfirm. Worth settling before you commit.',
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
