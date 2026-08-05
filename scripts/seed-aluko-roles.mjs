/**
 * Replace the three placeholder Aluko rows with their real, currently open
 * vacancies, taken from the firm's own applicant tracking system at
 * aluko-oyebode.hua.hrsmart.com.
 *
 * Two of the old rows loosely matched real postings; the third, "Dispute
 * Resolution & Tax Associate", does not exist in their ATS at all. Every row
 * written here has a working apply_url pointing straight at the posting, so a
 * student is never sent to a dead page.
 *
 * Only legal and company-secretarial roles are taken. The ATS also lists brand,
 * marketing and executive-assistant vacancies; those are real jobs but they are
 * not what this board is for.
 *
 * Nothing is invented. Where a field could not be read from the posting it is
 * left null, and the detail page simply omits that section. Descriptions are
 * summarised from the postings themselves.
 *
 * Run: node scripts/seed-aluko-roles.mjs
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
const ATS = 'https://aluko-oyebode.hua.hrsmart.com/hr/ats/Posting/view/'

const ABOUT =
  "Nigeria's largest law firm by headcount, offering a full range of corporate and commercial legal services from offices in Lagos, Abuja and Port Harcourt. A member of ALN, the alliance of independent African law firms."

/** posting id -> row. Titles and locations are verbatim from the ATS listing. */
const ROLES = [
  { id: 53, slug: 'aluko-associate-tmt', title: 'Associate, Technology, Media & Telecommunications', level: 'mid', location: 'Lagos', areas: ['Telecommunications', 'Corporate & Commercial', 'Intellectual Property'] },
  { id: 51, slug: 'aluko-assistant-company-secretary', title: 'Assistant Company Secretary', level: 'junior', location: 'Lagos', areas: ['Corporate & Commercial'] },
  { id: 52, slug: 'aluko-cosec-admin-support', title: 'Company Secretarial Admin Support', level: 'junior', location: 'Lagos', areas: ['Corporate & Commercial'] },
  { id: 43, slug: 'aluko-associate-grc', title: 'Associate, Governance, Risk & Compliance', level: 'mid', location: 'Lagos', areas: ['Corporate & Commercial', 'Public Law & Regulatory'] },
  { id: 40, slug: 'aluko-senior-associate-grc', title: 'Senior Associate, Governance, Risk & Compliance', level: 'senior', location: 'Lagos', areas: ['Corporate & Commercial', 'Public Law & Regulatory'] },
  { id: 35, slug: 'aluko-associate-business-advisory', title: 'Associate, Business Advisory', level: 'mid', location: 'Lagos', areas: ['Corporate & Commercial'] },
  { id: 34, slug: 'aluko-associate-business-advisory-2', title: 'Associate, Business Advisory', level: 'mid', location: 'Lagos', areas: ['Corporate & Commercial'] },
  { id: 27, slug: 'aluko-associate-banking-finance', title: 'Associate, Banking & Finance', level: 'mid', location: 'Lagos', areas: ['Banking & Finance'],
    role_desc: 'Legal support to banking and finance clients, working alongside senior lawyers on complex matters: research, due diligence and transaction support, client interaction, drafting and reviewing documents, compliance monitoring and business development.',
    // `requirements` is a text[] column, not text. Passing a newline-joined
    // string gets rejected as a malformed array literal.
    requirements: [
      'Law degree with active bar membership',
      'Minimum five years post-qualification practice',
      'Relevant banking and finance sector experience',
      'Solid understanding of banking and finance laws, regulations and industry practices',
      'Strong analytical and problem-solving ability',
      'Proficiency with legal research databases',
    ] },
  { id: 23, slug: 'aluko-associate-capital-markets', title: 'Associate, Capital Markets', level: 'mid', location: 'Lagos', areas: ['Capital Markets', 'Banking & Finance'] },
  { id: 22, slug: 'aluko-senior-associate-capital-markets', title: 'Senior Associate, Capital Markets', level: 'senior', location: 'Lagos', areas: ['Capital Markets', 'Banking & Finance'] },
  { id: 21, slug: 'aluko-associate-ip-lagos', title: 'Associate, Intellectual Property', level: 'mid', location: 'Lagos', areas: ['Intellectual Property'] },
  { id: 20, slug: 'aluko-associate-ip-abuja', title: 'Associate, Intellectual Property', level: 'mid', location: 'Abuja', areas: ['Intellectual Property'] },
]

const rows = ROLES.map(r => ({
  id: `aluko-ats-${r.id}`,
  slug: r.slug,
  title: r.title,
  employer: 'Aluko & Oyebode',
  sector: 'law_firm',
  tier: 'Tier 1',
  type: 'job',
  level: r.level,
  location: r.location,
  // Their ATS publishes no closing dates, so these are genuinely rolling
  // rather than deadline-less by omission.
  deadline: null,
  is_rolling: true,
  is_verified: true,
  is_closing_soon: false,
  practice_areas: r.areas,
  about: ABOUT,
  role_desc: r.role_desc ?? null,
  requirements: r.requirements ?? null,
  apply_url: ATS + r.id,
  apply_email: null,
  source: 'Aluko & Oyebode careers portal',
}))

// Clear the placeholder rows first. Two were loose matches for real postings and
// one described a vacancy that does not exist; all three are superseded.
const del = await fetch(`${URL_BASE}/rest/v1/jobs?id=in.(aluko-003,aluko-005,aluko-010)`, { method: 'DELETE', headers: H })
console.log('removed placeholder rows:', del.status)

const res = await fetch(`${URL_BASE}/rest/v1/jobs?on_conflict=id`, {
  method: 'POST',
  headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify(rows),
})
const body = await res.json()
if (!res.ok) { console.error('insert failed', res.status, body); process.exit(1) }
console.log(`wrote ${body.length} Aluko roles`)

const all = await fetch(`${URL_BASE}/rest/v1/jobs?select=employer&order=employer`, { headers: H })
const counts = (await all.json()).reduce((a, r) => ({ ...a, [r.employer]: (a[r.employer] || 0) + 1 }), {})
console.log('\nboard now:')
for (const [e, n] of Object.entries(counts)) console.log(`  ${String(n).padStart(2)}  ${e}`)
