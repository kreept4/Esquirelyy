/**
 * Cut the copied posting text back to something defensible.
 *
 * The enrichment pass lifted employers' postings essentially whole: full
 * summary, every responsibility bullet, every qualification. Reproducing all of
 * a copyrightable work verbatim, as a substitute for visiting the source, is the
 * weakest possible position, and Nigeria has fair DEALING (a closed list of
 * purposes: research, private use, criticism, review, news reporting) rather
 * than the open US fair use balancing test. Republishing a posting so candidates
 * can read it here is none of those purposes.
 *
 * What survives, and why:
 *
 *   FACTS are not protected by copyright. Title, employer, location, level,
 *   type, deadline, practice areas, apply URL: all kept in full.
 *
 *   ELIGIBILITY is restated as fact in our own words. "Minimum 5 years post-call
 *   experience" is information about the job, not the employer's prose, so the
 *   criteria are derived and rewritten rather than copied.
 *
 *   ONE SHORT EXTRACT of the summary is kept, capped at EXTRACT_WORDS, shown as
 *   a quotation with attribution and a link to the source. Short, attributed,
 *   non-substitutive.
 *
 *   RESPONSIBILITY BULLETS are dropped entirely. They were the bulk of the
 *   copied expression and the least defensible part.
 *
 * The trade-off is real and worth stating plainly: a candidate now has to open
 * the employer's posting to read the full duties. That is the cost of not
 * republishing someone else's copy.
 *
 * Run: node scripts/strip-copied-descriptions.mjs
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

/** Short enough to be plainly an extract rather than the work. */
const EXTRACT_WORDS = 42

function extractOf(text) {
  if (!text) return null
  const words = String(text).replace(/\s+/g, ' ').trim().split(' ')
  if (words.length <= EXTRACT_WORDS) return words.join(' ')
  // Prefer to stop on a sentence end near the cap so the extract reads cleanly.
  const capped = words.slice(0, EXTRACT_WORDS).join(' ')
  const lastStop = capped.lastIndexOf('. ')
  return lastStop > capped.length * 0.5 ? capped.slice(0, lastStop + 1) : capped + '…'
}

/**
 * Derive eligibility as facts, in our own words.
 *
 * Deliberately conservative: it only emits a criterion when the source states
 * it unambiguously. A missing bullet is better than an invented requirement,
 * because someone may self-select out of a job on the strength of it.
 */
function deriveCriteria(bullets) {
  const text = (bullets || []).join(' \n ').toLowerCase()
  const out = []

  if (/\bllb\b|\bj\.?d\.?\b|degree in law|law degree|bachelor.{0,3}s degree in law/.test(text)) {
    out.push('Law degree (LLB or equivalent)')
  }
  if (/call(ed)? to the (nigerian )?bar|bar membership|bar admission|enrolled.{0,20}supreme court/.test(text)) {
    out.push('Called to the Nigerian Bar')
  }
  const years = text.match(/minimum of (\d+)\s*(?:\+)?\s*years|(\d+)\s*(?:\+)?\s*years?\s*(?:of\s*)?post[- ]?(?:call|qualification)/)
  if (years) {
    const n = years[1] || years[2]
    if (n) out.push(`Minimum ${n} years post-call experience`)
  }
  if (/master.{0,3}s|advanced degree|llm/.test(text)) {
    out.push('Advanced degree an advantage')
  }
  return out
}

const res = await fetch(
  `${URL_BASE}/rest/v1/jobs?select=id,title,employer,role_desc,requirements,apply_url&order=id`,
  { headers: H }
)
const jobs = await res.json()

let changed = 0
for (const job of jobs) {
  const extract = extractOf(job.role_desc)
  const criteria = deriveCriteria(job.requirements)

  // Nothing copied on this row, so nothing to strip.
  if (!job.role_desc && !(job.requirements || []).length) continue

  const before = (job.role_desc || '').split(/\s+/).filter(Boolean).length + (job.requirements || []).join(' ').split(/\s+/).filter(Boolean).length
  const after = (extract || '').split(/\s+/).filter(Boolean).length + criteria.join(' ').split(/\s+/).filter(Boolean).length

  const patch = await fetch(`${URL_BASE}/rest/v1/jobs?id=eq.${job.id}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({
      role_desc: extract,
      requirements: criteria.length ? criteria : null,
      // The firm blurb was ours to begin with, but it belongs in the directory,
      // not on a role page.
      about: null,
    }),
  })
  if (patch.ok) {
    changed++
    console.log(`${job.id.padEnd(16)} ${String(before).padStart(4)} -> ${String(after).padStart(3)} words   ${job.title.slice(0, 44)}`)
  } else {
    console.log(`${job.id.padEnd(16)} FAILED ${patch.status} ${(await patch.text()).slice(0, 120)}`)
  }
}

console.log(`\nstripped ${changed} rows`)
console.log(`extracts capped at ${EXTRACT_WORDS} words, attributed and linked on the page`)
console.log('responsibility bullets dropped; eligibility restated as fact')
