/**
 * Fill in the Tangerine row, which went up incomplete.
 *
 * ============================================================
 * WHAT WAS WRONG, AND WHY IT WAS NOT JUST A MISSING FIELD
 * ============================================================
 *
 * The row was seeded with `requirements: null`, deliberately, because the
 * LinkedIn post it was read off publishes none: it is four lines and an email
 * address. The reasoning recorded in the seed script was that a requirements
 * list assembled from what an insurance compliance role usually asks for would
 * read exactly like one that had been verified, and that a student who does not
 * apply because of an invented requirement is a real cost.
 *
 * That reasoning still holds. What it got wrong was stopping at the first
 * source instead of going to the second one.
 *
 * ⚠ AND THE NULL DID MORE DAMAGE THAN AN EMPTY SECTION.
 * jobs/[slug]/page.tsx renders the "full posting" link INSIDE the requirements
 * note, so a listing with no requirements loses the requirements section and
 * the route to the employer's own posting in the same stroke, and falls back to
 * the bare "Full details for this role are on the employer's own posting."
 * empty state. Next to every other listing on the board, which carries a
 * requirements list and a link, it read as broken rather than as sparse. That
 * is a coupling worth knowing about: `requirements` is load bearing for more
 * than the requirements.
 *
 * ============================================================
 * WHERE THESE CAME FROM
 * ============================================================
 *
 * Tangerine's own listing for the same role on MyJobMag, posted 31 August 2026,
 * which carries the qualifications the LinkedIn post omits. Read 1 September
 * 2026. Nothing below is inferred: the degree class, the call to the Bar, the
 * two to five year band and the regulatory knowledge line are all on that
 * posting. The posting still publishes no closing date, so `is_rolling` stays
 * true and `deadline` stays null.
 *
 * The MyJobMag copy carries several typographical errors of its own. They are
 * corrected here rather than reproduced, because they are transcription noise
 * rather than the employer's wording, and a requirement a reader cannot parse
 * is no better than a missing one.
 *
 * Run: node scripts/2026-09-01-complete-tangerine-listing.mjs
 * Idempotent. Safe to re-run; it writes the same values.
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
const SLUG = 'tangerine-africa-legal-and-compliance-officer'

const PATCH = {
  role_desc:
    'An in-house legal and compliance seat supporting the Legal and Compliance Manager. The work is keeping the company in full adherence with its regulatory and statutory obligations, and with its own internal corporate governance guidelines and framework. It sits inside an insurance and financial services group, so the regulatory environment is the substance of the job rather than an adjacent concern, and the posting asks for working knowledge of it up front.',
  requirements: [
    'Minimum of a Second Class Bachelor of Laws (LL.B) from an accredited university',
    'Called to the Nigerian Bar (B.L.)',
    'Two to five years of prior experience in a similar role',
    'Working knowledge of the regulatory environment',
  ],
  source:
    "Tangerine's LinkedIn post, read 1 September 2026, which announces the role and asks candidates to send their credentials to careers@tangerine.africa, together with the group's own listing for the same role on MyJobMag, posted 31 August 2026, which carries the qualifications the LinkedIn post omits and gives the office as Lagos. Neither source publishes a closing date.",
}

const res = await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}`, {
  method: 'PATCH',
  headers: { ...H, Prefer: 'return=representation' },
  body: JSON.stringify(PATCH),
})

const body = await res.json()

if (!res.ok) {
  console.error(`FAILED ${res.status}`)
  console.error(body)
  process.exit(1)
}

if (!Array.isArray(body) || !body.length) {
  console.error(`No row matched ${SLUG}. Nothing written.`)
  process.exit(1)
}

const row = body[0]
console.log(`updated ${row.employer} / ${row.title}`)
console.log(`  requirements : ${row.requirements?.length ?? 0} items`)
for (const r of row.requirements || []) console.log(`     - ${r}`)
console.log(`  role_desc    : ${String(row.role_desc || '').length} chars`)
