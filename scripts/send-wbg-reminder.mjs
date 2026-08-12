/**
 * The World Bank Group internship deadline reminder.
 *
 * DRY RUN BY DEFAULT. Run it with no flags and it lists exactly who would be
 * written to and stops. Sending requires --send, typed on purpose.
 *
 *   node scripts/send-wbg-reminder.mjs
 *   node scripts/send-wbg-reminder.mjs --test you@example.com --send
 *   node scripts/send-wbg-reminder.mjs --send
 *
 * ALWAYS SEND ONE TO YOURSELF FIRST, with --test. An email is the one artefact
 * here that cannot be corrected after the fact.
 *
 * --test DIFFERS FROM --only, AND THAT IS THE POINT. send-new-roles.mjs filters
 * the member list down to one address, so it can only reach somebody who
 * already has a confirmed account. A proof is worth more when it does not
 * depend on the sender happening to be a member, so --test skips the member
 * query entirely and writes to the address given.
 *
 * WHO IS SKIPPED.
 *
 *   deadlines off      This is a deadline reminder and that is the preference
 *   new_listings off   governing it. It is also a role email, so somebody who
 *                      turned those off did not ask for this either. Both are
 *                      honoured, because the account page promises both and the
 *                      cost of honouring the wider of the two is a few readers,
 *                      while the cost of ignoring one is a spam complaint.
 *   on a break         Somebody who asked us to stop emailing them meant it.
 *   unconfirmed        An address that never proved itself is a bounce.
 *
 * --all overrides the two preferences. It exists for a genuine emergency.
 *
 * NO CAREER STAGE FILTER, deliberately. The role is open to final-year LLB
 * students and to anyone enrolled in an LL.M, JD or PhD, which is a question
 * about enrolment and not about seniority: a senior lawyer doing an LL.M
 * qualifies and a junior who has left university does not. `career_stage` on
 * profiles cannot answer that, so filtering on it would drop eligible readers
 * to spare ineligible ones an email they can delete. The message states who it
 * is for in its first two lines instead.
 *
 * Brevo's free tier delivers 300 messages a day. Past that the API refuses, so
 * failures are reported per address and printed at the end to retry.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// The app reads .env.local through Next. A plain node script does not, so it is
// parsed here rather than adding dotenv for one file.
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

/* Bundled on the fly rather than imported: the template is TypeScript and plain
   node wants file extensions TypeScript forbids. esbuild settles it and keeps
   ONE copy of the copy, which is the thing that actually matters. Every path is
   quoted because this repository lives under a directory with a space and a
   full stop in it. */
const bundle = join(tmpdir(), `esq-wbg-${process.pid}.mjs`)
execSync(
  `npx --yes esbuild "src/lib/email/templates/wbg-deadline.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${bundle}"`,
  { stdio: 'inherit' }
)
const { wbgDeadlineEmail } = await import(pathToFileURL(bundle).href)
rmSync(bundle, { force: true })

const args = process.argv.slice(2)
const flag = n => args.includes(n)
const value = n => {
  const i = args.indexOf(n)
  return i === -1 ? null : args[i + 1]
}

const SEND = flag('--send')
const LIMIT = value('--limit') ? Number(value('--limit')) : null
const TEST = value('--test')
const ALL = flag('--all')
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esquirely.com.ng'

/** One message. Returns null on success, the error text on failure. */
async function deliver({ email, name }) {
  const { subject, text, html } = wbgDeadlineEmail({ name, siteUrl: SITE_URL })
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || 'Esquirely',
      },
      to: [{ email, name: name || undefined }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  })
  return res.ok ? null : `${res.status} ${await res.text()}`
}

function requireKey() {
  if (!process.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not set. Nothing sent.')
    process.exit(1)
  }
}

/* The proof copy. Short-circuits before any Supabase call, so it works whether
   or not the address belongs to a member. */
if (TEST) {
  const { subject } = wbgDeadlineEmail({ name: '', siteUrl: SITE_URL })
  console.log(`test send to ${TEST}`)
  console.log(`subject: ${subject}`)
  if (!SEND) {
    console.log('\nDry run. Nothing was sent. Add --send to actually send.')
    process.exit(0)
  }
  requireKey()
  const err = await deliver({ email: TEST, name: '' })
  if (err) {
    console.error(`  FAILED ${TEST}  ${err}`)
    process.exit(1)
  }
  console.log(`  sent  ${TEST}`)
  process.exit(0)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/** Every confirmed account, paged, because listUsers caps at 1000 per call. */
async function allUsers() {
  const out = []
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(error.message)
    out.push(...data.users)
    if (data.users.length < 1000) break
  }
  return out
}

const users = await allUsers()

// Names and break state live on profiles, not on the auth user.
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, full_name, break_until, notification_preferences')
const byId = new Map((profiles ?? []).map(p => [p.id, p]))

const now = Date.now()
const confirmed = users.filter(u => u.email).filter(u => u.email_confirmed_at || u.confirmed_at)

const optedOut = confirmed.filter(u => {
  const prefs = byId.get(u.id)?.notification_preferences
  return prefs?.deadlines === false || prefs?.new_listings === false
})
const onBreak = confirmed.filter(u => {
  const until = byId.get(u.id)?.break_until
  return until && new Date(until).getTime() > now
})

let recipients = confirmed
  .filter(u => ALL || !optedOut.includes(u))
  .filter(u => !onBreak.includes(u))

if (LIMIT) recipients = recipients.slice(0, LIMIT)

console.log(`${users.length} accounts, ${confirmed.length} confirmed`)
console.log(`  ${optedOut.length} have deadline or new-role emails off${ALL ? ' (overridden by --all)' : ''}`)
console.log(`  ${onBreak.length} on a break`)
console.log(`${recipients.length} to write to`)

if (!SEND) {
  for (const u of recipients) console.log('  would send to ' + u.email)
  console.log('\nDry run. Nothing was sent. Add --send to actually send.')
  process.exit(0)
}

requireKey()

const failed = []
let sent = 0

for (const u of recipients) {
  const name = byId.get(u.id)?.full_name || ''
  const err = await deliver({ email: u.email, name })
  if (err) {
    failed.push(u.email)
    console.log(`  FAILED ${u.email}  ${err}`)
  } else {
    sent++
    console.log(`  sent  ${u.email}`)
  }
  // Gentle on the API, and it keeps a mistake slow enough to interrupt.
  await new Promise(r => setTimeout(r, 250))
}

console.log(`\n${sent} sent, ${failed.length} failed`)
if (failed.length) {
  console.log('Retry these with --test <address> --send:')
  for (const e of failed) console.log('  ' + e)
}
