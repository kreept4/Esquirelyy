/**
 * Put the International Bar Association's legal internship programme on the
 * board, for the London intake of 3 May to 27 August 2027.
 *
 * Source: the IBA's own pages, read 6 November 2026:
 *   ibanet.org/legal-internship-programme              who it is for
 *   ibanet.org/legal-internship-programme-applications intakes, deadlines,
 *                                                       documents, mailbox
 *   ibanet.org/legal-internship-programme-finance      grants
 *
 * WHAT IS READ AND WHAT IS CHOSEN
 *
 *   deadline   2026-12-11, the closing date the IBA gives for the May to
 *              August 2027 London intake. The other intakes on the page are
 *              closed (Washington DC, The Hague) or further out (London,
 *              30 August to 17 December 2027, closing 19 March 2027, which
 *              the description names in one line for anyone who misses this).
 *   location   'London or remote'. The IBA offers remote places to students
 *              at universities outside the UK, which is the route most of
 *              this board's readers can actually take; London in person
 *              needs the right to work in the UK, and eligibility says so.
 *   target     'all': undergraduate and postgraduate law students and newly
 *              qualified lawyers, as the IBA lists them.
 *   pay        The IBA states no pay. It states grants: up to GBP 3,000 for
 *              London, up to GBP 2,000 remote, priority to applicants from
 *              developing countries, not guaranteed. The copy gives the
 *              grants and does not characterise the rest.
 *   link       The applications page, because the forms for each office are
 *              downloaded there.
 *
 * Run: node scripts/2026-11-06-add-iba-internship.mjs          (writes, via .env.local)
 *      node scripts/2026-11-06-add-iba-internship.mjs --sql    (prints the insert as SQL)
 * Idempotent: updates the row if the title is already there.
 */

import { readFileSync } from 'node:fs'

const TITLE = 'IBA Legal Internship Programme, May to August 2027'

const row = {
  title: TITLE,
  organization: 'International Bar Association',
  type: 'internship',
  target: 'all',
  location: 'London or remote',
  deadline: '2026-12-11',
  link: 'https://www.ibanet.org/legal-internship-programme-applications',
  status: 'published',
  logo_url: '/employer-logos/iba.png',
  source_url: 'https://www.ibanet.org/legal-internship-programme',
  practice_areas: ['International Law', 'Policy & Governance'],
  firm_handles: {
    linkedin: { handle: 'international-bar-association', url: 'https://www.linkedin.com/company/international-bar-association' },
  },
  /* Rewritten the same evening for length: the first version carried the
     later intake, the unit-by-unit list and four steps, and read as a
     brief rather than a listing. */
  description:
    'Four months researching and writing for the International Bar Association, 3 May to 27 August 2027. ' +
    'Remote, or in London if you can work in the UK. Grants of up to £2,000 remote and £3,000 in London ' +
    'are there if you need one.',
  eligibility:
    'Law students and newly qualified lawyers. The remote option is for students at universities outside the UK.',
  application_steps: [
    {
      step: 1,
      title: 'Prepare five documents',
      detail:
        'A cover letter, your CV, the IBA application form, a writing sample of up to five pages, and a ' +
        'reference letter. Download the form from the IBA site using the Apply button.',
    },
    {
      step: 2,
      title: 'Email them by 11 December',
      detail: 'Send everything to internprogramme@int-bar.org.',
      off_platform: true,
    },
    {
      step: 3,
      title: 'Need funding? Apply for a grant too',
      detail: 'Send the IBA Educational Trust form with your application, and ask your referee to back it.',
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
    if (Array.isArray(v)) return `array[${v.map(q).join(', ')}]::text[]`
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
