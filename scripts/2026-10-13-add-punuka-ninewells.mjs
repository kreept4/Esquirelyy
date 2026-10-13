/**
 * Add four vacancies: one at Punuka Attorneys & Solicitors, three at Ninewells.
 *
 * Sources, both the firms' own:
 *   Punuka     the firm's "NOW HIRING" flier (@punukaattorneys, punuka.com).
 *   Ninewells  the firm's LinkedIn post of early October 2026, signed "Ninewells
 *              Legal", which lists three associate seats on one flier.
 *
 * WHY THE EMPLOYER STRINGS ARE THE DIRECTORY NAMES. "Punuka Attorneys &
 * Solicitors" and "Ninewells Law Practice" are the `name` fields in
 * lib/firms-data.ts. firmForEmployer matches on name, shortName and slug, so
 * these strings are what puts the right mark on the board row, in the ball pit
 * and in the email, and what links the row to the firm's directory page. The
 * Ninewells flier says "Ninewells Legal"; the LinkedIn page it was posted from
 * says Ninewells Law Practice, which is the name the directory already carries.
 *
 * WHAT IS READ AND WHAT IS INFERRED
 *
 *   Punuka
 *     deadline      2026-10-30, stated ("Deadline: 30th October, 2026").
 *     level         'senior'. The flier asks for 7-9 years post-call. The board's
 *                   bands are student / junior / mid / senior, and 7-9 years is
 *                   past the 3-5 that the mid band is for.
 *     practice      Capital Markets, Media & Entertainment, Real Estate. The
 *                   flier's "Role" line reads "Capital Market, Media and
 *                   Entertainment, Property". Capital Markets is the board's
 *                   existing value. "Property" is stored as Real Estate, the
 *                   value the Greenberg Traurig row already uses, so one filter
 *                   finds both. Media & Entertainment is new to the board and is
 *                   added to lib/practice-areas.ts in the same change, or the
 *                   select would never offer it.
 *     apply         careers@punuka.com, "stating the position applied for". That
 *                   is also the address on the firm's directory record.
 *
 *   Ninewells
 *     deadline      none stated, so null and is_rolling true.
 *     level         'mid'. The flier asks for 3-5 years post-call for all three
 *                   seats, which is the mid band (the same call the Olajide
 *                   Oyewole row makes on the same wording).
 *     practice      one per seat: Energy & Natural Resources, Corporate &
 *                   Commercial, and Dispute Resolution for "Litigation".
 *     apply         careers@ninewellslegal.com, CV only. Not the info@ address on
 *                   the directory record: the flier names careers@.
 *
 *   Both
 *     location      'Lagos'. Both fliers say Lagos, and Ninewells' Abuja office
 *                   is not where these seats are.
 *     apply_url     null. Neither firm published a posting page. A link to
 *                   punuka.com would look like an apply link and land on a
 *                   homepage with no vacancy on it, and Ninewells' own domain
 *                   serves an error stub (see its directory record).
 *     tier          'Established', matching each directory record. The two must
 *                   agree or the board and the profile disagree about the firm.
 *
 * Run: node scripts/2026-10-13-add-punuka-ninewells.mjs           (writes, via .env.local)
 *      node scripts/2026-10-13-add-punuka-ninewells.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the rows rather than adding a second set.
 */
import { readFileSync } from 'node:fs'

const NINEWELLS_ABOUT =
  'A multidisciplinary practice organised as a partnership, working across capital markets, energy and extractives, financial services and technology from Victoria Island and Maitama. Led by Professor Bayo Adaralegbe. It recruits in its own name as Ninewells Legal.'

const NINEWELLS_SHARED_REQS = [
  'Nigerian-qualified lawyer',
  "3-5 years' post-call experience",
]

const NINEWELLS_COMMERCIAL_SKILLS = [
  'Strong legal drafting and research skills',
  'Excellent analytical and problem-solving abilities',
  'Strong negotiation and commercial awareness',
  'Clear, practical and well-reasoned legal advice',
]

const rows = [
  {
    id: 'punuka-senior-associate-lagos-2026-10',
    slug: 'punuka-senior-associate-capital-markets-media-property-lagos',
    title: 'Senior Associate, Capital Markets, Media & Entertainment and Property',
    employer: 'Punuka Attorneys & Solicitors',
    sector: 'law_firm',
    tier: 'Established',
    type: 'job',
    level: 'senior',
    location: 'Lagos',
    deadline: '2026-10-30',
    is_rolling: false,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Capital Markets', 'Media & Entertainment', 'Real Estate'],
    about:
      'A commercial law firm with offices in Lagos, Abuja and Asaba, known for corporate transactions, dispute resolution and energy work.',
    role_desc:
      'A senior associate seat in Lagos covering three practices: capital markets, media and entertainment, and property. Apply by email to careers@punuka.com, and state the position you are applying for in the message. Applications close on 30 October 2026.',
    requirements: [
      'LL.B and B.L, both at Second Class Upper (2:1)',
      '7-9 years post-call experience',
      'An LL.M is an added advantage',
    ],
    apply_url: null,
    apply_email: 'careers@punuka.com',
    source: 'Punuka Attorneys & Solicitors recruitment flier, October 2026',
  },
  {
    id: 'ninewells-energy-associate-lagos-2026-10',
    slug: 'ninewells-energy-associate-lagos',
    title: 'Energy Associate',
    employer: 'Ninewells Law Practice',
    sector: 'law_firm',
    tier: 'Established',
    type: 'job',
    level: 'mid',
    location: 'Lagos',
    deadline: null,
    is_rolling: true,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Energy & Natural Resources'],
    about: NINEWELLS_ABOUT,
    role_desc:
      'One of three associate seats Ninewells is filling in Lagos, in its energy practice. The firm is looking for drafting, research, negotiation and commercial judgement, and for advice that is clear and practical. Apply by sending your CV to careers@ninewellslegal.com. No closing date is published.',
    requirements: [...NINEWELLS_SHARED_REQS, ...NINEWELLS_COMMERCIAL_SKILLS],
    apply_url: null,
    apply_email: 'careers@ninewellslegal.com',
    source: 'Ninewells Law Practice LinkedIn post (Ninewells Legal recruitment flier), October 2026',
  },
  {
    id: 'ninewells-corporate-commercial-associate-lagos-2026-10',
    slug: 'ninewells-corporate-commercial-associate-lagos',
    title: 'Corporate & Commercial Associate',
    employer: 'Ninewells Law Practice',
    sector: 'law_firm',
    tier: 'Established',
    type: 'job',
    level: 'mid',
    location: 'Lagos',
    deadline: null,
    is_rolling: true,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Corporate & Commercial'],
    about: NINEWELLS_ABOUT,
    role_desc:
      'One of three associate seats Ninewells is filling in Lagos, in its corporate and commercial practice. The firm is looking for drafting, research, negotiation and commercial judgement, and for advice that is clear and practical. Apply by sending your CV to careers@ninewellslegal.com. No closing date is published.',
    requirements: [...NINEWELLS_SHARED_REQS, ...NINEWELLS_COMMERCIAL_SKILLS],
    apply_url: null,
    apply_email: 'careers@ninewellslegal.com',
    source: 'Ninewells Law Practice LinkedIn post (Ninewells Legal recruitment flier), October 2026',
  },
  {
    id: 'ninewells-litigation-associate-lagos-2026-10',
    slug: 'ninewells-litigation-associate-lagos',
    title: 'Litigation Associate',
    employer: 'Ninewells Law Practice',
    sector: 'law_firm',
    tier: 'Established',
    type: 'job',
    level: 'mid',
    location: 'Lagos',
    deadline: null,
    is_rolling: true,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Dispute Resolution'],
    about: NINEWELLS_ABOUT,
    role_desc:
      'One of three associate seats Ninewells is filling in Lagos, in litigation. The firm wants advocates: courtroom skill, quick thinking under pressure, persuasive speaking, and a sound grasp of litigation strategy. Apply by sending your CV to careers@ninewellslegal.com. No closing date is published.',
    requirements: [
      ...NINEWELLS_SHARED_REQS,
      'Strong advocacy and courtroom skills',
      'The ability to think quickly and respond effectively under pressure',
      'Excellent verbal communication and persuasive skills',
      'Sound judgement and a strong understanding of litigation strategy',
    ],
    apply_url: null,
    apply_email: 'careers@ninewellslegal.com',
    source: 'Ninewells Law Practice LinkedIn post (Ninewells Legal recruitment flier), October 2026',
  },
]

if (process.argv.includes('--sql')) {
  const q = v =>
    v === null ? 'null'
    : typeof v === 'boolean' ? String(v)
    : Array.isArray(v) ? `array[${v.map(q).join(', ')}]::text[]`
    : `'${String(v).replace(/'/g, "''")}'`
  const cols = Object.keys(rows[0])
  const values = rows.map(r => `(${cols.map(c => q(r[c])).join(', ')})`).join(',\n')
  const update = cols.filter(c => c !== 'id').map(c => `${c} = excluded.${c}`).join(', ')
  console.log(`insert into jobs (${cols.join(', ')}) values\n${values}\non conflict (id) do update set ${update}, updated_at = now();`)
  process.exit(0)
}

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

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify(rows),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
for (const r of body) console.log('wrote:', r.slug, '-', r.title)
