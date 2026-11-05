/**
 * Put Olaniwun Ajayi's Blue Experience 2.0 open day on the board.
 *
 * Read off the firm's own flier: "Blue Experience 2.0, Open Day 2026. Beyond
 * the classroom. Inside legal practice." For law undergraduates, at The
 * Adunola, 401 Close, Banana Island, Lagos, on Wednesday 25 November 2026.
 *
 * ============================================================
 * WHAT WAS CHECKED
 * ============================================================
 *
 * The apply link on the flier is a bit.ly, so it was followed rather than
 * trusted: bit.ly/BlueExperience2026 redirects to a live Microsoft Form,
 * forms.cloud.microsoft/r/VrtX7F0QyC, with no closed notice on it. `link` is
 * the form itself. The venue is the firm's own Lagos office as it appears on
 * its directory record, so this is the firm's event in its own building.
 *
 * ============================================================
 * ⚠ TWO DATES, AND THE DEADLINE IS THE EARLIER ONE
 * ============================================================
 *
 * Unlike the Law Crest day, this flier publishes a registration cutoff:
 * "Applications close: 13th November 2026". The event itself is on the 25th.
 * `deadline` is the 13th, because that is the date a reader can miss; the 25th
 * is in the description and the steps, where a reader planning travel needs it.
 *
 * ============================================================
 * ⚠ UNDERGRADUATES ONLY, AND IN THE ROOM
 * ============================================================
 *
 * "For law undergraduates" is the whole of the flier's eligibility, so target
 * is 'undergraduate' and the eligibility text says so first. It is in person
 * on Banana Island; the second sentence of the eligibility says that, for the
 * reason the Law Crest script gives: readers spread across the country who
 * have met virtual programmes on this board need to hit it before applying.
 *
 * type 'event'. It is not an internship and nobody is placed anywhere at the
 * end of it; the flier offers meeting the firm's lawyers, asking questions and
 * seeing the firm from inside.
 *
 * Run: node scripts/2026-11-05-add-oalp-blue-experience.mjs          (writes, via .env.local)
 *      node scripts/2026-11-05-add-oalp-blue-experience.mjs --sql    (prints the insert as SQL)
 * Idempotent: updates the row if the title is already there.
 */

import { readFileSync } from 'node:fs'

const TITLE = 'Blue Experience 2.0, Olaniwun Ajayi Open Day 2026'

const row = {
  title: TITLE,
  /* The directory name, so the board, the ball pit and the email resolve the
     firm's mark and link the row to its profile. */
  organization: 'Olaniwun Ajayi LP',
  type: 'event',
  target: 'undergraduate',
  location: 'Banana Island, Lagos',
  deadline: '2026-11-13',
  link: 'https://forms.cloud.microsoft/r/VrtX7F0QyC',
  status: 'published',
  logo_url: '/firm-logos/olaniwun-ajayi.png',
  source_url: 'https://olaniwunajayi.net',
  practice_areas: null,
  firm_handles: {
    linkedin: { handle: 'olaniwun-ajayi-lp', url: 'https://www.linkedin.com/company/olaniwun-ajayi-lp' },
  },
  description:
    'Olaniwun Ajayi\'s open day for law undergraduates, the second edition of ' +
    'its Blue Experience: a day at the firm\'s Lagos office on Banana Island to ' +
    'meet its lawyers, ask them questions and see how the firm works from the ' +
    'inside. It takes place on Wednesday 25 November 2026 at The Adunola, 401 ' +
    'Close. Applications close on 13 November, twelve days before the day itself.',
  eligibility:
    'For law undergraduates. It is in person at the firm\'s office on Banana ' +
    'Island, Lagos, on 25 November, so you need to be able to get there on the day.',
  application_steps: [
    {
      step: 1,
      title: 'Check you can be there on the 25th',
      detail:
        'This is a day at the firm\'s office on Banana Island, not a virtual ' +
        'session. Settle that before you apply.',
    },
    {
      step: 2,
      title: 'Apply on the form by 13 November',
      detail:
        'Apply opens the firm\'s application form. Applications close on 13 ' +
        'November, well before the day itself.',
      off_platform: true,
    },
    {
      step: 3,
      title: 'Come with questions',
      detail:
        'The day is built around meeting the firm\'s lawyers and asking them ' +
        'things. The flier publishes no agenda, so what you get out of it ' +
        'depends on what you bring.',
      off_platform: true,
    },
  ],
}

if (process.argv.includes('--sql')) {
  const q = v => `'${String(v).replace(/'/g, "''")}'`
  const cols = Object.keys(row)
  const val = c => {
    const v = row[c]
    if (v === null) return 'null'
    if (c === 'firm_handles' || c === 'application_steps') return `${q(JSON.stringify(v))}::jsonb`
    return q(v)
  }
  console.log(`insert into opportunities (${cols.join(', ')}) values (${cols.map(val).join(', ')}) returning id, title;`)
  process.exit(0)
}

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
