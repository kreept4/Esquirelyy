/**
 * Run the cover letter prompt against real cases and print what comes back.
 *
 * WHY THIS EXISTS. The prompt was rewritten because the letters read as
 * machine written, and that is not a property you can check by reading a
 * prompt. It has to be run. This bundles lib/cover-letter/prompt.ts the same
 * way scripts/send-new-roles.mjs bundles the email template, calls the same
 * model the route calls, and prints the letters with a word count and a scan
 * for the tells that HOUSE_STYLE and BANS between them are supposed to have
 * removed.
 *
 * The three cases are the three the tool actually sees, chosen because they
 * fail differently:
 *
 *   thin      Role and employer only, no background at all. This was the worst
 *             case in the old prompt: nothing to be specific about, so the
 *             model reached for register instead of fact.
 *   student   A final year student with a short typed summary. Tests whether
 *             the letter stays a student's letter.
 *   switcher  Mid-level changing practice area. Tests whether the change is
 *             named honestly rather than papered over.
 *
 * Run: node scripts/test-cover-letter.mjs
 * Costs three API calls.
 */

import { readFileSync, mkdtempSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const KEY = env.ANTHROPIC_API_KEY
if (!KEY) throw new Error('ANTHROPIC_API_KEY missing from .env.local')

/* Bundle the TS prompt module so this script reads the same source the route
   does. Testing a copy of the prompt would defeat the point. */
const out = join(mkdtempSync(join(tmpdir(), 'cl-')), 'prompt.mjs')
execSync(
  `npx --yes esbuild "src/lib/cover-letter/prompt.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${out}"`,
  { stdio: 'inherit' }
)
const { buildSystemPrompt, buildUserPrompt } = await import('file://' + out.replace(/\\/g, '/'))

const CASES = [
  {
    name: 'thin (no background at all)',
    input: {
      firstName: 'Tobi',
      targetRole: 'Associate, Dispute Resolution',
      employer: 'Olajide Oyewole LLP',
      careerStage: '1-3 years post-call',
      tone: 'formal and confident',
    },
  },
  {
    name: 'student (typed summary)',
    input: {
      firstName: 'Amaka',
      targetRole: 'Associate (Entry-Level)',
      employer: 'AVA Law Practice',
      careerStage: 'Final year law student',
      tone: 'warm and professional',
      cvSummary:
        'Final year LL.B at the University of Benin, 2:1 so far. Six week internship at a small Benin City firm doing land matters, mostly filing and note taking. Secretary of the law students society. Long essay on electronic evidence under the Evidence Act.',
      highlights: 'the long essay on electronic evidence',
    },
  },
  {
    name: 'switcher (practice area change)',
    input: {
      firstName: 'Segun',
      targetRole: 'Legal and Compliance Officer',
      employer: 'Tangerine Africa',
      careerStage: '3-6 years post-call',
      tone: 'direct and concise',
      cvSummary:
        'Five years at a Lagos litigation firm, mostly debt recovery and employment disputes at the National Industrial Court. Ran about fifteen matters of my own in the last two years. No in-house or insurance experience. Want to move in-house.',
    },
  },
]

/* The tells worth grepping for. Two groups, because they fail differently: the
   first are words the model should never emit, the second are constructions
   that survive a word ban because they are built from ordinary words. */
const BANNED_WORDS = [
  'delve', 'tapestry', 'testament', 'showcase', 'elevate', 'unlock', 'robust',
  'seamless', 'spearhead', 'foster', 'leverage', 'adept', 'meticulous',
  'comprehensive', 'honed', 'instrumental', 'pivotal', 'well versed',
  'keen eye', 'keen interest', 'strong foundation', 'wealth of experience',
  'deep understanding', 'passionate about', 'highly motivated', 'dynamic',
  'fast-paced', 'proven track record', 'thrilled', 'perfect fit',
  'ideal candidate', 'unique opportunity', 'meaningful impact',
  'valuable asset', 'hit the ground running', 'esteemed', 'prestigious',
  'renowned', 'align with', 'I am confident that',
]
const BANNED_OPENERS = [
  'i am writing to express', 'i am writing to apply', 'it is with great',
  'i was excited to see', 'i am excited to',
]

function scan(letter) {
  const low = letter.toLowerCase()
  const hits = []
  for (const w of BANNED_WORDS) if (low.includes(w.toLowerCase())) hits.push(w)
  for (const o of BANNED_OPENERS) if (low.includes(o)) hits.push('OPENER: ' + o)
  if (letter.includes('—') || letter.includes('–')) hits.push('DASH')
  if (/[‘’“”…]/.test(letter)) hits.push('SMART PUNCTUATION')
  if (/\?/.test(letter)) hits.push('QUESTION MARK')
  return hits
}

/** The body only: salutation and sign off do not count against the ceiling. */
function bodyWords(letter) {
  return letter
    .split(/\r?\n/)
    .filter(l => !/^\s*(dear|yours|sincerely|faithfully|regards)/i.test(l.trim()))
    .filter(l => l.trim() && l.trim().split(/\s+/).length > 3)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
}

for (const c of CASES) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: buildUserPrompt(c.input) }],
    }),
  })

  const body = await res.json()
  if (!res.ok) {
    console.log(`\n### ${c.name}\nAPI ERROR ${res.status}: ${JSON.stringify(body).slice(0, 400)}`)
    continue
  }

  const raw = body.content?.[0]?.text ?? ''
  let parsed
  try {
    parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim())
  } catch {
    console.log(`\n### ${c.name}\nUNPARSEABLE:\n${raw.slice(0, 800)}`)
    continue
  }

  const letter = parsed.coverLetter || ''
  const hits = scan(letter)
  const words = bodyWords(letter)

  console.log('\n' + '='.repeat(74))
  console.log('### ' + c.name)
  console.log('='.repeat(74))
  console.log(letter.trim())
  console.log('-'.repeat(74))
  console.log('subject : ' + (parsed.subjectLine || '(none)'))
  console.log('tips    :')
  for (const t of parsed.tipsForSending || []) console.log('   - ' + t)
  console.log('-'.repeat(74))
  console.log(`body words : ${words} ${words > 250 ? '  <== OVER THE 250 CEILING' : '(within ceiling)'}`)
  console.log(`tells      : ${hits.length ? hits.join(', ') : 'none'}`)
}
