/**
 * Put the AVA Law Practice associate seat and the Tangerine Africa legal and
 * compliance seat on the board.
 *
 * Two rows, one script, because they arrived together and neither is large
 * enough to earn its own file.
 *
 * ============================================================
 * AVA LAW PRACTICE
 * ============================================================
 *
 * Read off the firm's own recruitment flier, which is the whole source. Every
 * field below is on the graphic: Lagos State, hybrid described as "Remote +
 * Court/Regulatory Visits", LL.B and BL, called to the Nigerian Bar, 0 to 3
 * years post-call with NYSC members able to apply, and the four focus areas.
 * The application address and the required subject line are printed on it too.
 *
 * ⚠ THE SUBJECT LINE IS THE FIRM'S, NOT OURS. The flier says to title the mail
 * "Application for Associate – [Your Name]", dash included. Same call as the
 * U&P Law row: it is an instruction from the employer rather than our copy, and
 * an application titled differently from what was asked for is what gets filed
 * wrong. It is reproduced verbatim in `source` so the detail page can show it.
 *
 * ⚠ NO DEADLINE ON THE FLIER, so `is_rolling` is true and `deadline` is null.
 * Not an omission. Inventing one would put a countdown on a card the firm never
 * published, and hasClosed() would then delist a seat that is still open.
 *
 * WHY level IS 'junior'. "Associate (Entry-Level)" with 0 to 3 years post-call
 * is the board's junior band. NYSC members being invited is the tell that the
 * bottom of that range is genuinely zero.
 *
 * ============================================================
 * TANGERINE AFRICA
 * ============================================================
 *
 * ⚠ THIS ROW IS DELIBERATELY THIN, AND THE THINNESS IS ACCURATE.
 * The LinkedIn post is four lines: "Tangerine Life is hiring", the role, and an
 * address to send credentials to. It carries no responsibilities, no
 * requirements and no deadline. Their listing on MyJobMag adds the office
 * address and one sentence of duties and nothing more.
 *
 * So `requirements` is null rather than a plausible list. Everything on this
 * board is meant to be checkable against the employer's own words, and a
 * requirements list assembled from what an insurance compliance role usually
 * asks for would read exactly like one that had been verified. A student who
 * fails to apply because of an invented requirement is a real cost; an empty
 * section on a detail page is not.
 *
 * WHY sector IS 'other'. Tangerine is an insurance and financial services
 * group, not a law firm. Same call as Heirs Holdings and Andersen: the sector
 * filter describes what the employer IS, and the practice areas describe the
 * work.
 *
 * WHY THE EMPLOYER IS 'Tangerine Africa' AND NOT 'Tangerine Life'.
 * The post signs off as Tangerine Life and the careers address is
 * @tangerine.africa. Tangerine Africa is the group and Tangerine Life is the
 * insurance business inside it; the mark in public/employer-logos is the group
 * wordmark, and EMPLOYER_LOGOS is keyed on the normalised employer string, so
 * the group name is the one that resolves the logo. Both spellings are keyed in
 * firms-data.ts so this cannot silently lose its mark either way.
 *
 * ============================================================
 *
 * Run: node scripts/2026-09-01-add-ava-and-tangerine.mjs
 * Idempotent. Re-running reports each row exists and writes nothing.
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

const AVA_SLUG = 'ava-law-practice-associate-entry-level'
const TANGERINE_SLUG = 'tangerine-africa-legal-and-compliance-officer'

const ROWS = [
  {
    id: AVA_SLUG,
    slug: AVA_SLUG,
    title: 'Associate (Entry-Level)',
    employer: 'AVA Law Practice',
    sector: 'law_firm',
    type: 'job',
    level: 'junior',
    location: 'Lagos',
    deadline: null,
    is_verified: true,
    is_rolling: true,
    is_active: true,
    practice_areas: ['Dispute Resolution', 'Corporate & Commercial', 'Public Law & Regulatory'],
    about:
      'A Lagos law practice taking its next associate at entry level. The seat is hybrid, splitting remote work with court and regulatory visits.',
    role_desc:
      'An entry-level associate seat for a lawyer at the start of practice. The work is legal research, legal drafting, court filings and regulatory compliance, and the role is hybrid: remote, with court and regulatory visits in person. The firm is explicit that NYSC members may apply, so the bottom of the range is genuinely zero years post-call.',
    requirements: [
      'LL.B and BL',
      'Called to the Nigerian Bar',
      '0 to 3 years post-call, and NYSC members may apply',
      'Based in or able to work from Lagos State',
    ],
    apply_email: 'recruitments@avalawpractice.com',
    apply_url: null,
    source:
      'AVA Law Practice\'s own recruitment flier, read 1 September 2026, which sets out the location, qualification, eligibility, experience range and key focus areas. Applications go by email to recruitments@avalawpractice.com, and the firm asks that the mail be titled "Application for Associate – [Your Name]". No closing date is published on the flier.',
    logo_url: null,
  },
  {
    id: TANGERINE_SLUG,
    slug: TANGERINE_SLUG,
    title: 'Legal and Compliance Officer',
    employer: 'Tangerine Africa',
    sector: 'other',
    type: 'job',
    level: 'mid',
    location: 'Lagos',
    deadline: null,
    is_verified: true,
    is_rolling: true,
    is_active: true,
    practice_areas: ['Public Law & Regulatory', 'Corporate & Commercial'],
    about:
      'An insurance and financial services group operating in Nigeria, with Tangerine Life as its insurance business. Its head office is on Funso Williams Avenue in Surulere, Lagos.',
    role_desc:
      'Supporting the Legal and Compliance Manager in keeping the company within its regulatory and statutory obligations and its internal governance rules. The published posting does not go further than that, so neither does this.',
    /* Null, not an invented list. See the header. */
    requirements: null,
    apply_email: 'careers@tangerine.africa',
    apply_url: null,
    source:
      'Tangerine Africa\'s LinkedIn post, read 1 September 2026, which announces the role and asks candidates to send their credentials to careers@tangerine.africa. The office address is from the group\'s listing for the same role on MyJobMag, posted 31 August 2026. Neither source publishes a requirements list, a closing date, or a fuller description.',
    logo_url: null,
  },
]

for (const row of ROWS) {
  const existing = await (
    await fetch(`${BASE}/rest/v1/jobs?id=eq.${row.id}&select=id,title,employer,is_active`, { headers: H })
  ).json()

  if (Array.isArray(existing) && existing.length) {
    console.log(`already on the board, nothing written: ${row.employer} / ${row.title}`)
    continue
  }

  const res = await fetch(`${BASE}/rest/v1/jobs`, {
    method: 'POST',
    headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify(row),
  })
  const body = await res.json()

  if (!res.ok) {
    console.error(`FAILED ${row.employer}: ${res.status}`)
    console.error(body)
    process.exitCode = 1
    continue
  }

  console.log(`added: ${row.employer} / ${row.title}  (${row.slug})`)
}
