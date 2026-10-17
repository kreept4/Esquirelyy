/**
 * Add two associate seats: KS Legal in Ikoyi, and a Lekki firm recruiting
 * through Sigma Consulting Group. They replace the three Ninewells seats in the
 * 13 October drop, which were delisted on 16 October (reported closed; the rows
 * are kept with is_active false and a delisted_reason, not deleted).
 *
 * Sources:
 *   KS Legal  the firm's "We Are Hiring!" flier, signed KS Legal | Kayode
 *             Sofola & Associates, October 2026.
 *   Sigma     Sigma's own posting on its careers page,
 *             mysigma.careers-page.com/jobs/e0d64798-..., read 17 October 2026,
 *             which LinkedIn also carries. The careers page has the full text;
 *             the LinkedIn card has only the title, pay and the fact it is on-site.
 *
 * WHY THE EMPLOYER STRINGS READ AS THEY DO. Neither firm is in the directory, so
 * these strings only have to match EMPLOYER_LOGOS in lib/firms-data.ts, which
 * is keyed on norm() of them. "KS Legal" leads because that is how the firm
 * signs the flier and how its site and email domain are named; the full name is
 * there in brackets because a reader searching "Sofola" should find it too.
 *
 * ⚠ SIGMA IS THE RECRUITER, NOT THE EMPLOYER, AND THE ROW SAYS SO. The posting
 * reads "Our client, a reputable and fast-growing law firm in Lekki", and never
 * names the firm. Filing it under Sigma is the only honest option, since it is
 * the only name published, but a reader who sees "Sigma Consulting Group" and
 * "Legal Associate" side by side will assume the seat is at a consultancy. So
 * the title carries the fact ("at a Lekki law firm"), the role description
 * opens with it, and the sector is law_firm, because that is where the work is
 * and that is the filter somebody looking for this seat will use.
 *
 * WHAT IS READ AND WHAT IS INFERRED
 *
 *   KS Legal
 *     deadline      none stated, so null and is_rolling true.
 *     level         'mid'. The flier asks for 3-7 years post-qualification
 *                   experience. That starts where the mid band starts and runs
 *                   two years past it; the board's senior rows begin at 7, so
 *                   the bulk of the range is mid.
 *     practice      Dispute Resolution and Corporate & Commercial. ⚠ INFERRED:
 *                   the flier names no practice for the seat. Its own line on
 *                   the firm is "critical and complex commercial disputes and
 *                   transactions", and those are the board's values for exactly
 *                   that. Without any, the row would not answer a practice
 *                   filter at all.
 *     tier          'Established'. The flier says the firm has practised for
 *                   over 70 years.
 *     apply         admin@kslegal.org, with the subject "Application for the
 *                   post of an Associate", as the flier says.
 *
 *   Sigma (for the client firm)
 *     deadline      none stated in the posting text, so null and is_rolling
 *                   true. ⚠ The page's structured data carries a validThrough
 *                   of 16 November 2026. That is the job board's own expiry
 *                   for the listing, set by the software rather than written by
 *                   anybody, and it is not presented to a reader anywhere on the
 *                   page, so it is not stored as a deadline here. If the page
 *                   comes down on that date the row should be delisted then.
 *     level         'junior'. 2-4 years post-call. The board's Entry-level band
 *                   is 0-3 years and the mid band starts at 3, so the floor of
 *                   the range puts it in the band somebody two years called
 *                   will be filtering on.
 *     practice      Dispute Resolution and Corporate & Commercial, both stated:
 *                   the posting asks for litigation, corporate and commercial
 *                   law, and dispute resolution.
 *     pay           ₦300,000 to ₦400,000 a month, net. Stated, and in the role
 *                   description, because there is no pay column and it is the
 *                   one fact most postings leave out.
 *     apply         hiring@mysigma.io with the subject "Legal Associate –
 *                   Lekki", as the posting says. The careers page also has an
 *                   Apply button, so apply_url is that page with the LinkedIn
 *                   tracking parameters stripped.
 *     tier          null. The firm is not named, so there is nothing to grade.
 *
 *   Both
 *     location      'Lagos'. Ikoyi and Lekki are in the role descriptions.
 *
 * Run: node scripts/2026-10-17-add-ks-legal-sigma.mjs           (writes, via .env.local)
 *      node scripts/2026-10-17-add-ks-legal-sigma.mjs --sql     (prints the same upsert as SQL)
 * Idempotent. Re-running updates the rows rather than adding a second set.
 */
import { readFileSync } from 'node:fs'

const rows = [
  {
    id: 'ks-legal-associate-ikoyi-2026-10',
    slug: 'ks-legal-associate-ikoyi-lagos',
    title: 'Associate',
    employer: 'KS Legal (Kayode Sofola & Associates)',
    sector: 'law_firm',
    tier: 'Established',
    type: 'job',
    level: 'mid',
    location: 'Lagos',
    deadline: null,
    is_rolling: true,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Dispute Resolution', 'Corporate & Commercial'],
    about:
      'A Lagos firm in Ikoyi that has practised for over 70 years, advising on commercial disputes and transactions and on matters it describes as having shaped Nigerian jurisprudence.',
    role_desc:
      'An associate seat in Ikoyi, Lagos, with hands-on work, mentorship and a competitive salary. The firm asks for 3 to 7 years post-qualification experience, and makes exceptions for unusual alternative experience. Apply by sending your CV to admin@kslegal.org with the subject "Application for the post of an Associate". No closing date is published.',
    requirements: [
      'A 2:1 or higher in the LL.B or B.L, or an LL.M at Merit',
      '3-7 years post-qualification experience',
      'Exceptions made for unusual alternative experience',
    ],
    apply_url: null,
    apply_email: 'admin@kslegal.org',
    source: 'KS Legal (Kayode Sofola & Associates) "We Are Hiring!" flier, October 2026',
  },
  {
    id: 'sigma-legal-associate-lekki-2026-10',
    slug: 'sigma-legal-associate-lekki-lagos',
    title: 'Legal Associate at a Lekki law firm',
    employer: 'Sigma Consulting Group',
    sector: 'law_firm',
    tier: null,
    type: 'job',
    level: 'junior',
    location: 'Lagos',
    deadline: null,
    is_rolling: true,
    is_verified: true,
    is_closing_soon: false,
    practice_areas: ['Dispute Resolution', 'Corporate & Commercial'],
    about:
      'A recruitment consultancy. This seat is not at Sigma: it is with a client of theirs, a law firm in Lekki that Sigma describes as reputable and fast-growing and does not name.',
    role_desc:
      'Sigma Consulting Group is recruiting a legal associate for a law firm in Lekki, Lagos. It is full-time and on-site, and pays ₦300,000 to ₦400,000 a month, net. The work is litigation and dispute resolution alongside corporate and commercial practice: court processes and advocacy, contract drafting, due diligence, company secretarial and regulatory work, and legal research. Apply by sending your CV to hiring@mysigma.io with the subject "Legal Associate – Lekki", or through the Apply button on Sigma\'s careers page. Only shortlisted candidates will be contacted. No closing date is published.',
    requirements: [
      'LL.B and B.L, called to the Nigerian Bar',
      '2-4 years post-call experience in a reputable law firm',
      'Experience in litigation, corporate and commercial law, dispute resolution and contract drafting',
      'Experience before the superior courts of record is an advantage',
      'Exposure to company secretarial practice, regulatory compliance and corporate transactions is desirable',
    ],
    apply_url: 'https://mysigma.careers-page.com/jobs/e0d64798-f62e-4c4f-af07-ffb9492a4dde',
    apply_email: 'hiring@mysigma.io',
    source: 'Sigma Consulting Group careers page posting "Legal Associate - lekki", read 17 October 2026 (also on LinkedIn)',
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
