/**
 * Add the Kehinde Babatola Olofinmoyo LP junior associate vacancy.
 *
 * Source: the firm's own recruitment flier, which carries the KBO monogram, the
 * name "KEHINDE BABATOLA OLOFINMOYO LP" and the line "Litigation & Corporate
 * Practice", and reads, in full:
 *
 *   "WE ARE HIRING! JUNIOR ASSOCIATE (POST-NYSC). We are looking for a bright,
 *    driven and detail-oriented Junior Associate to join our dynamic team.
 *    LOCATION: Yaba, Lagos State. APPLICATIONS SHOULD BE SENT TO:
 *    kbolegalpractitioners@gmail.com. EMPLOYMENT TYPE: Full-Time."
 *
 * That is the whole of the posting, and this row says no more than it does.
 *
 * WHAT IS NOT HERE, AND WHY
 *
 *   apply_url    null. The flier gives an address and nothing else, and the firm
 *                publishes no website we can find. Same call as Abe & Asotie: a
 *                link that led to a homepage with no vacancy on it would look
 *                like an apply link and be worse than no link.
 *   deadline     null, is_rolling true. The flier states no closing date. That
 *                is genuinely open-ended, not a date we failed to read.
 *   role_desc    The flier gives one sentence of description and it is a
 *                sentence about the person, not the work. Rather than invent
 *                duties for them, this states what the firm's own strapline says
 *                the practice is, and is explicit that the flier says no more.
 *   requirements One line, because the flier lists one.
 *
 * `level` is 'junior'. The board's bands are student / junior / mid / senior,
 * and "post-NYSC" is the junior band exactly. Note that post-NYSC is not the
 * same claim as post-call and is deliberately not restated as one: a candidate
 * can finish service without being called, and the flier does not say which the
 * firm means. It is quoted rather than interpreted.
 *
 * `sector` is 'law_firm'; `tier` is 'Boutique', which is the band the directory
 * uses for a small independent practice. The firm is not in ALL_FIRMS — see the
 * EMPLOYER_LOGOS note in firms-data.ts for why being on the board does not put a
 * firm in the directory.
 *
 * Run: node scripts/seed-kbo-role.mjs
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
  id: 'kbo-junior-associate-yaba',
  slug: 'kbo-junior-associate-yaba',
  title: 'Junior Associate (Post-NYSC)',
  // The full registered name. The flier leads with the KBO monogram, but the
  // board prints the employer as text beside the mark and "KBO" alone would not
  // tell a reader who they would be writing to.
  employer: 'Kehinde Babatola Olofinmoyo LP',
  sector: 'law_firm',
  tier: 'Boutique',
  type: 'job',
  level: 'junior',
  location: 'Yaba, Lagos',
  deadline: null,
  is_rolling: true,
  // Read off the employer's own recruitment material rather than an
  // aggregator's repost.
  is_verified: true,
  is_closing_soon: false,
  practice_areas: ['Dispute Resolution', 'Corporate & Commercial'],
  about:
    'A Lagos practice working in litigation and corporate law, from an office in Yaba. The firm sets out its values as integrity, excellence and impact.',
  role_desc:
    'A junior seat open to candidates who have completed NYSC, in a practice the firm describes as litigation and corporate. The flier asks for someone bright, driven and detail-oriented and does not set out the work in any more detail than that, so neither does this: write to the firm for the specifics. Full time, based in Yaba.',
  requirements: ['Post-NYSC'],
  apply_url: null,
  apply_email: 'kbolegalpractitioners@gmail.com',
  source: 'Kehinde Babatola Olofinmoyo LP recruitment flier',
}

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([row]),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
console.log('wrote:', body[0].slug, '—', body[0].title)
