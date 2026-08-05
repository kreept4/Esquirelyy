/**
 * Lift the full text of each Aluko vacancy out of their ATS and into our own
 * rows, so a candidate reads the whole thing on Esquirelyy and only leaves to
 * actually apply.
 *
 * Their postings follow a consistent shape:
 *   JOB SUMMARY:        one or two paragraphs  -> role_desc
 *   KEY RESPONSIBILITIES: bulleted             -> responsibilities[]
 *   REQUIREMENTS / QUALIFICATIONS: bulleted    -> requirements[]
 *
 * Everything written is the employer's own wording, trimmed of markup only.
 * Nothing is summarised or invented; if a heading is absent the field is left
 * null rather than filled with a guess.
 *
 * Run: node scripts/enrich-aluko-roles.mjs
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

const ATS = 'https://aluko-oyebode.hua.hrsmart.com/hr/ats/Posting/view/'
const IDS = [53, 52, 51, 43, 40, 35, 34, 27, 23, 22, 21, 20]

/** Strip markup to clean lines, preserving list-item boundaries. */
function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&[a-z]+;/gi, ' ')
    .split('\n')
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

/**
 * A heading is any short, essentially all-caps line ending in a colon.
 *
 * Matching a fixed list of names failed: the real heading is
 * "QUALIFICATION / SKILLS REQUIRED:", which no exact name covered. Because it
 * was not recognised as a boundary, KEY RESPONSIBILITIES ran on and swallowed
 * the qualifications too (hence 27 responsibilities instead of ten), and
 * requirements fell through to the ATS sidebar, producing "Contract Type",
 * "Permanent" and "Location" as if they were things to bring to the job.
 * Matching the shape rather than the wording survives whatever the employer
 * chooses to call a section.
 */
const HEADING = /^[A-Z][A-Z0-9 &/,'()’-]{3,64}:$/
/** The ATS chrome that follows the posting body. */
const STOP = /^(apply to this job|send to a friend|v\d|last sync)/i

function sectionsOf(lines) {
  const out = {}
  let current = null
  for (const line of lines) {
    if (STOP.test(line)) break
    if (HEADING.test(line)) {
      current = line.replace(/[:\s]+$/, '').toUpperCase()
      out[current] = []
      continue
    }
    if (current) out[current].push(line)
  }
  return out
}

/** Pick the first section whose name matches, so wording can vary. */
function pick(sections, re) {
  const key = Object.keys(sections).find(k => re.test(k))
  return key ? sections[key] : []
}

const clean = s => s.replace(/^[•\-–]\s*/, '').trim()

/** Some postings run the label into the text ("Legal Advice: Assist ..."), which
 *  is the employer's own formatting and worth keeping. Only junk is dropped. */
const usable = s => s.length > 3 && !/^page \d|^apply\b|^back\b/i.test(s)

const results = []

for (const id of IDS) {
  try {
    const res = await fetch(ATS + id, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const sec = sectionsOf(toText(await res.text()))

    const summary = pick(sec, /^(JOB SUMMARY|SUMMARY|JOB DESCRIPTION|ROLE)/).filter(usable).map(clean)
    const resp = pick(sec, /RESPONSIBILIT|DUTIES|THE ROLE/).filter(usable).map(clean)
    const reqs = pick(sec, /QUALIFICATION|REQUIREMENT|SKILL|COMPETENC/).filter(usable).map(clean)

    results.push({
      id: `aluko-ats-${id}`,
      role_desc: summary.length ? summary.join('\n\n') : null,
      responsibilities: resp.length ? resp : null,
      requirements: reqs.length ? reqs : null,
      _found: Object.keys(sec).join(', '),
    })
    console.log(`${id}  summary:${summary.length ? 'y' : '-'}  resp:${String(resp.length).padStart(2)}  reqs:${String(reqs.length).padStart(2)}`)
  } catch (err) {
    console.log(`${id}  ERROR ${err.message}`)
  }
}

/** Does the table have a responsibilities column? If not, write the rest and
 *  say so, rather than failing the whole run on one missing column. */
const probe = await fetch(`${URL_BASE}/rest/v1/jobs?select=responsibilities&limit=1`, { headers: H })
const hasResp = probe.ok
if (!hasResp) console.log('\nNOTE: no `responsibilities` column; skipping that field.')

let ok = 0
for (const r of results) {
  const body = { role_desc: r.role_desc, requirements: r.requirements }
  if (hasResp) body.responsibilities = r.responsibilities
  const res = await fetch(`${URL_BASE}/rest/v1/jobs?id=eq.${r.id}`, { method: 'PATCH', headers: H, body: JSON.stringify(body) })
  if (res.ok) ok++
  else console.log('  patch failed', r.id, res.status, (await res.text()).slice(0, 160))
}
console.log(`\nupdated ${ok}/${results.length} rows`)
