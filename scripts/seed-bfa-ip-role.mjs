/**
 * B.F.A & Co. Legal's Intellectual Property Lawyer vacancy.
 *
 * Source: the firm's own recruitment flier, supplied by Kreept.
 *
 * ⚠ A JOBS ROW, NOT AN OPPORTUNITY, and the distinction is the one the
 * opportunities table was added to draw. This is a single action: send a CV to
 * an address with a set subject line. LBVIP is three ordered actions, two of
 * them off-platform. A listing goes in `jobs` unless the applying itself has
 * steps, and this one does not.
 *
 * ============================================================
 * THE APPLY ADDRESS IS A GMAIL, AND IT SHIPS ANYWAY
 * ============================================================
 *
 * recruitment.tux@gmail.com is a personal mailbox for a firm that owns
 * bfaandcolegal.com. The ship plan flagged it for a check before publishing,
 * that check was made, and the answer was that it is what the firm's own flier
 * prints. So it is published as written rather than corrected to a domain
 * address we would be guessing at.
 *
 * This is not unprecedented on the board: Kehinde Babatola Olofinmoyo LP's
 * junior associate seat applies to kbolegalpractitioners@gmail.com, from the
 * same kind of flier. Reproducing what the employer published is the rule, and
 * inventing recruitment@bfaandcolegal.com would send applications into a
 * mailbox nobody has said exists.
 *
 * THE SUBJECT LINE IS PART OF THE INSTRUCTION, not decoration. The flier asks
 * for "Intellectual Property Lawyer" as the subject, and a firm sorting a
 * recruitment inbox by subject will not find an application that ignored it.
 * There is no how_to_apply column on this table, so it is stated in role_desc
 * where the reader will actually meet it.
 *
 * ============================================================
 * level IS 'mid', WHICH THE TITLE ALONE WOULD NOT HAVE TOLD US
 * ============================================================
 *
 * scripts/fix-role-levels.mjs exists because levels were once inferred from
 * titles, which filed a seven-year role as entry level. Its banding is applied
 * to the MINIMUM stated years:
 *
 *   under 3 -> junior     3 to 6 -> mid     7 and up -> senior
 *
 * This posting says five to seven, so the minimum is five and the band is mid.
 * Not senior, even though seven years appears in the range: banding on the top
 * of a range would hide the role from the five-year candidates it is open to.
 *
 * ============================================================
 * WHERE `location` COMES FROM
 * ============================================================
 *
 * The flier says only "Onsite", which is a working arrangement rather than a
 * place, and "Onsite" alone in a column headed Location is no use to somebody
 * deciding whether they can take the job. The city is read off the firm's own
 * site, which places them in Victoria Island, Lagos. The arrangement is not
 * lost — it is stated in role_desc, sourced to the flier, so both facts are on
 * the page and neither is presented as the other.
 *
 * practice_areas uses the board's existing vocabulary. Entertainment and media
 * are the firm's actual centre of gravity and there is no tag for them yet;
 * per the ship plan that is Phase 3's decision, not this row's.
 *
 * The mark resolves through EMPLOYER_LOGOS in lib/firms-data.ts, so logo_url
 * stays null — see scripts/extract-bfa-logo.mjs.
 *
 * Run: node scripts/seed-bfa-ip-role.mjs
 * Idempotent — re-running updates the row rather than adding a second.
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
  id: 'bfa-intellectual-property-lawyer',
  slug: 'bfa-intellectual-property-lawyer',
  title: 'Intellectual Property Lawyer',
  employer: 'B.F.A. & Co Legal',
  sector: 'law_firm',
  tier: 'Boutique',
  type: 'job',
  level: 'mid',
  location: 'Victoria Island, Lagos',

  deadline: null,
  is_rolling: true,
  is_closing_soon: false,
  /* Read off the employer's own recruitment material rather than an
     aggregator's repost. */
  is_verified: true,

  practice_areas: ['Intellectual Property', 'Corporate & Commercial'],

  about:
    'A full service Lagos firm founded by Bobo F. Ajudua, working in media and entertainment, ' +
    'intellectual property, commercial arbitration, corporate and commercial, regulatory ' +
    'compliance and real estate. Its entertainment practice acts for Nigerian artists and rights ' +
    'holders.',

  role_desc:
    'An intellectual property seat in a firm whose practice is built around entertainment and ' +
    'media. The work is drafting and negotiating entertainment contracts across talent, ' +
    'licensing and endorsements; managing intellectual property filings and resolving trademark, ' +
    'copyright and patent disputes, litigation included; and advising the firm’s clients ' +
    'internally while liaising with external counsel on intellectual property matters. ' +
    'Full time. The flier states the role is onsite; the firm’s offices are in Victoria Island. ' +
    /* No em dash here. The site's copy standard does not allow them, and this
       string is listing copy rather than a comment. */
    'To apply, send your CV to recruitment.tux@gmail.com with the subject line ' +
    '"Intellectual Property Lawyer". The firm asks for that subject specifically, so use it as ' +
    'written.',

  requirements: [
    'LL.B and B.L., with a current licence to practise law in Nigeria',
    'Five to seven years post-call experience in entertainment, media, intellectual property and commercial law',
    'Contract drafting, negotiation, legal research and advisory skills',
    'Sound knowledge of Nigerian entertainment and intellectual property law',
    'An advantage: experience acting for artists, labels, production companies or talent agencies',
  ],

  apply_email: 'recruitment.tux@gmail.com',
  apply_url: null,

  source: 'B.F.A. & Co Legal recruitment flier',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
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
console.log('wrote job:', w.slug)
console.log('  title    ', w.title)
console.log('  employer ', w.employer)
console.log('  level    ', w.level, '(minimum stated years is 5)')
console.log('  location ', w.location)
console.log('  apply    ', w.apply_email)
console.log('  active   ', w.is_active)
