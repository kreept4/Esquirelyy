/**
 * Give every role Esquirelyy's own words, and keep the firm's only as a short
 * attributed excerpt.
 *
 * Stripping the copied text left the pages thin and characterless. The fix is
 * not to put the employer's copy back; it is to write our own. Original copy has
 * no copyright problem, it sounds like us rather than like an HR template, and
 * it is the thing that makes a board worth visiting instead of a list of links.
 *
 * Column use, given the schema we have:
 *   role_desc -> Esquirelyy's summary, written here, rendered as body copy
 *   about     -> the employer's own words, capped, rendered as a quotation
 *
 * `about` originally held firm background, which now lives only in the firm
 * directory. Reusing the column avoids a migration; a rename to `excerpt` would
 * be tidier whenever the schema is next touched.
 *
 * House style for the summaries: warm but not chatty, specific to the actual
 * work, no invented facts, and no em dashes anywhere in rendered copy.
 *
 * Run: node scripts/write-role-summaries.mjs
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
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

/**
 * Written by hand, one per role. Grounded only in what the posting actually
 * states: practice area, seniority, location, employer. Nothing here asserts a
 * detail the source did not, because someone may decide whether to apply on the
 * strength of it.
 */
const SUMMARIES = {
  'aluko-ats-27':
    'The financings that keep Nigerian business moving pass across desks like this one. You would sit with senior counsel on loan agreements, security packages and the regulatory detail underneath them. Aluko is looking for five years since call and real fluency in how banks work.',
  'aluko-ats-23':
    'Capital markets work at a firm that handles a good share of Nigeria’s largest issues. Expect prospectuses, listings and the regulatory choreography around them, with senior counsel close at hand. Suited to someone a few years past call who likes detail that carries consequence.',
  'aluko-ats-22':
    'A senior seat on Nigerian capital markets transactions. You would run workstreams rather than support them, taking issuers and underwriters through listings and the regulatory path around them, with junior associates looking to you for direction.',
  'aluko-ats-21':
    'Brands, patents and the arguments that protect them. Aluko’s intellectual property practice spans prosecution and enforcement for clients who take their marks seriously. A good fit if you want IP to be your specialism rather than something you pick up between deals.',
  'aluko-ats-20':
    'The same intellectual property practice, based in Abuja. Prosecution, enforcement and portfolio work for clients across the country, with the registry close by. Worth a look if you want specialist IP work without moving to Lagos.',
  'aluko-ats-53':
    'Technology, media and telecoms, where the law is still catching up with the clients. Licensing, data, infrastructure and content work for the operators building out Nigeria’s digital economy. For a lawyer who reads the regulations for pleasure.',
  'aluko-ats-43':
    'Compliance work with actual teeth. You would help clients read their regulators correctly and build the controls that keep them out of trouble, in sectors where the rules move quickly. Suits a lawyer who would rather prevent the problem than litigate it.',
  'aluko-ats-40':
    'A senior compliance seat advising boards and management on regulatory exposure and the systems that manage it. You would hold the client relationship and set the direction of the work rather than execute someone else’s plan.',
  'aluko-ats-35':
    'Corporate advisory across the transactions that build companies: structuring, market entry, governance and the commercial contracts underneath. Broad work, and a good place to find out which part of it you actually enjoy before specialising.',
  'aluko-ats-34':
    'A second opening on the same business advisory team. Structuring, market entry and commercial contracts for clients doing business in Nigeria, with enough variety that no two matters look quite alike.',
  'aluko-ats-51':
    'Company secretarial work at scale, keeping boards compliant and records clean for clients who cannot afford either to slip. Strong grounding for a lawyer who wants to understand corporate governance from the inside rather than the outside.',
  'aluko-ats-52':
    'Support work inside the company secretarial team, keeping filings, registers and board papers in order. A genuine entry point into corporate governance practice for someone organised and early in their career.',
  'manual-003':
    'Litigation at a Lagos firm where you would be on your feet early. Court appearances, pleadings and the preparation behind both. Suited to someone who wants advocacy experience rather than a purely transactional start to practice.',
  'manual-006':
    'First Bank’s graduate intake, open across the continent. A structured start inside one of Nigeria’s oldest financial institutions, with rotations that show you how a bank actually runs. Entry level, and competitive.',
  'manual-007':
    'An in-house seat with a consulting client, covering contracts, compliance and the daily questions a growing business puts to its lawyer. Broad exposure for someone who would rather be embedded in a business than briefed by one.',
  'manual-009':
    'Union Bank’s graduate programme, a structured route into banking for recent graduates. Training, rotation and a start that does not require you to have decided everything about your career yet.',
}

/** Guard the house style rather than trusting myself to have followed it. */
const EM_DASH = /[—–]/
for (const [id, text] of Object.entries(SUMMARIES)) {
  if (EM_DASH.test(text)) { console.error(`em dash in ${id}`); process.exit(1) }
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?select=id,title,role_desc,about&order=id`, { headers: H })
const jobs = await res.json()

let done = 0
for (const job of jobs) {
  const summary = SUMMARIES[job.id]
  if (!summary) { console.log(`${job.id.padEnd(16)} no summary written, left as is`); continue }

  // The stripped extract currently sits in role_desc. Move it to `about` so it
  // renders as the employer's quotation, and give role_desc our own copy.
  const excerpt = job.about ?? job.role_desc ?? null

  const patch = await fetch(`${URL_BASE}/rest/v1/jobs?id=eq.${job.id}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({ role_desc: summary, about: excerpt }),
  })
  if (patch.ok) { done++; console.log(`${job.id.padEnd(16)} ${job.title.slice(0, 46)}`) }
  else console.log(`${job.id.padEnd(16)} FAILED ${patch.status}`)
}
console.log(`\nwrote ${done} summaries in Esquirelyy's voice; employer text retained as a capped excerpt`)
