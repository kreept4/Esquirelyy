/**
 * Put The Law Crest LLP's one-day legal internship on the board.
 *
 * Read off the firm's own LinkedIn post and the flier attached to it.
 *
 * ============================================================
 * WHAT WAS CHECKED
 * ============================================================
 *
 * The registration link on the flier is a tinyurl, which is exactly the kind of
 * thing that should not be taken on trust, so it was followed: it resolves 200
 * to a live Google form at docs.google.com/forms/d/e/1FAIpQLSc22ES0v3F08fq...
 * The firm is already in the directory as `law-crest`, so the mark is the one
 * we already serve and nothing had to be cut out of the graphic.
 *
 * ============================================================
 * ⚠ THE DEADLINE IS THE EVENT, AND THAT IS A JUDGEMENT
 * ============================================================
 *
 * The flier publishes no registration cutoff. It publishes a date, a time and a
 * room: 7 October 2026, 10:00 to 16:00, at the Continental Re Centre on Olosa
 * Street. So `deadline` is the 7th, not because the firm said so but because
 * registering for a one-day event after the day has passed is not a thing a
 * reader can do, and a row with no deadline would sit on the board as "rolling"
 * for ever afterwards.
 *
 * That is the one invented field on this row and it is invented conservatively:
 * it can only ever be too generous, never too strict, and hasPassed treats the
 * day itself as still open, so the listing survives right up to the morning of.
 *
 * ============================================================
 * ⚠ IT IS IN THE ROOM OR IT IS NOTHING
 * ============================================================
 *
 * "Must be physically available to attend" is on the flier and it leads the
 * eligibility here, because it is the fact that disqualifies most of this
 * audience. Esquirely's readers are spread across the country and the two
 * internships already on the board are both virtual; somebody who has learned
 * from those that these things are remote needs to hit this sentence before
 * they spend anything on it.
 *
 * The other criterion is narrow in the other direction: law graduates who have
 * NOT yet been called. Not students, not lawyers. That is the pre-call window,
 * which is the same group the Fabunmi competition is for.
 *
 * ⚠ THE FORM LINK IS NOT IN THE STEPS. It lives in `link`, which jobs/[slug]
 * nulls for a signed-out reader. See the note in 2026-09-21-add-lgic.mjs for
 * what happens when it is written into the prose instead.
 *
 * Run: node scripts/2026-09-23-add-law-crest-internship.mjs
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

const TITLE = 'The Law Crest One-Day Legal Internship Program 2026'

const row = {
  title: TITLE,
  organization: 'The Law Crest LLP',
  type: 'internship',
  target: 'all',
  location: 'Lagos',
  deadline: '2026-10-07',
  link: 'https://tinyurl.com/5n9beu7b',
  status: 'published',
  logo_url: '/firm-logos/law-crest.png',
  source_url: 'https://www.thelawcrest.com',
  practice_areas: null,
  firm_handles: {
    linkedin: { handle: 'thelawcrestllp' },
    instagram: { handle: 'thelawcrestllp', url: 'https://www.instagram.com/thelawcrestllp/' },
    x: { handle: 'thelawcrestllp', url: 'https://x.com/thelawcrestllp' },
  },
  description:
    'A single day inside The Law Crest LLP, a Lagos firm, built for law ' +
    'graduates who have finished their degree and have not yet been called to ' +
    'the Bar. It runs from 10am to 4pm on 7 October at the Continental Re ' +
    'Centre on Olosa Street, Victoria Island, and the firm describes it as an ' +
    'immersive day rather than a placement: practice as it is actually run, ' +
    'and the people who run it. Unlike the other two internships on the board ' +
    'it is not virtual, so you have to be in Lagos on the day.',
  eligibility:
    'You must be able to attend in person in Lagos on 7 October. Open to law ' +
    'graduates who have not yet been called to the Bar, so not current ' +
    'students and not lawyers already in practice.',
  application_steps: [
    {
      step: 1,
      title: 'Check you can be in the room',
      detail:
        'This is one day in Victoria Island, not a remote programme, and the ' +
        'firm asks for physical attendance outright. Settle that before ' +
        'anything else.',
    },
    {
      step: 2,
      title: 'Register on the form',
      detail:
        'Apply opens the firm’s registration form. No closing date is published, ' +
        'and a one-day event fills, so earlier is better than the day before.',
      off_platform: true,
    },
    {
      step: 3,
      title: 'Ask what is not answered here',
      detail:
        'There is no published agenda, nothing about whether anything is provided ' +
        'on the day, and nothing about whether the day leads anywhere ' +
        'afterwards. The firm gives contact details on thelawcrest.com and ' +
        'posts as @thelawcrestllp.',
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
  `${BASE}/rest/v1/opportunities?select=title,type,deadline,status&order=deadline`,
  { headers: H },
).then(r => r.json())
console.log('\nopportunities on the board:')
for (const o of all) {
  console.log(`  [${o.status}] ${o.type.padEnd(19)} ${o.deadline ?? 'rolling'}  ${o.title}`)
}
