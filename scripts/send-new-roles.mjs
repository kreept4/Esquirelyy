/**
 * Announce the current roles drop to every member.
 *
 * DRY RUN BY DEFAULT. Run it with no flags and it lists exactly who would be
 * written to and stops. Sending requires --send, typed on purpose.
 *
 *   node --experimental-strip-types scripts/send-new-roles.mjs
 *   node --experimental-strip-types scripts/send-new-roles.mjs --only you@example.com --send
 *   node --experimental-strip-types scripts/send-new-roles.mjs --send
 *
 * ALWAYS SEND ONE TO YOURSELF FIRST, with --only. An email is the one artefact
 * here that cannot be corrected after the fact: a broken layout, a wrong link
 * or a typo is simply out there, in every inbox, permanently.
 *
 * WHO IS SKIPPED, AND WHY IT IS NOT EVERYONE.
 *
 *   new_listings off   This is precisely the email that preference exists to
 *                      govern, and the footer tells the reader they can turn it
 *                      off. Ignoring it here would make that sentence a lie and
 *                      would be the fastest route to a spam complaint.
 *   on a break         Somebody who asked us to stop emailing them meant it.
 *   unconfirmed        An address that never proved itself is a bounce.
 *
 * Unlike the password nudge there is no signup-date cutoff. A member who joined
 * this morning is exactly who a new opening is for.
 *
 * Brevo's free tier delivers 300 messages a day. Past that the API refuses, so
 * failures are reported per address and printed at the end to retry with --only.
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

/* The template is bundled on the fly rather than imported directly.
   It imports lib/new-roles through the '@/' alias, which Next resolves and
   plain node does not, and node's type stripping also wants file extensions
   TypeScript forbids. esbuild settles both in one step and keeps ONE copy of
   the copy, which is the thing that actually matters: an announcement whose
   wording lives in two files is an announcement that will disagree with
   itself. */
const bundle = join(tmpdir(), `esq-new-roles-${process.pid}.mjs`)
/* shell: true because npx is a .cmd on Windows and spawnSync cannot execute
   one directly. Every path is quoted: this repository lives under a directory
   with a space and a full stop in it, which is exactly the shape that breaks an
   unquoted shell command. */
execSync(
  `npx --yes esbuild "src/lib/email/templates/new-roles.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${bundle}"`,
  { stdio: 'inherit' }
)
const { newRolesEmail } = await import(pathToFileURL(bundle).href)
rmSync(bundle, { force: true })

const args = process.argv.slice(2)
const flag = n => args.includes(n)
const value = n => {
  const i = args.indexOf(n)
  return i === -1 ? null : args[i + 1]
}

const SEND = flag('--send')
const LIMIT = value('--limit') ? Number(value('--limit')) : null
const ONLY = value('--only')
/* --all ignores the new_listings opt-out. It exists for a genuine emergency
   and should essentially never be used for an announcement like this. */
const ALL = flag('--all')
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esquirely.com.ng'

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
let recipients = users
  .filter(u => u.email)
  .filter(u => u.email_confirmed_at || u.confirmed_at)
  // Opted out of new-role emails. See the note at the top.
  .filter(u => {
    const prefs = byId.get(u.id)?.notification_preferences
    return ALL || prefs?.new_listings !== false
  })
  .filter(u => {
    const until = byId.get(u.id)?.break_until
    return !until || new Date(until).getTime() <= now
  })

if (ONLY) recipients = recipients.filter(u => u.email.toLowerCase() === ONLY.toLowerCase())
if (LIMIT) recipients = recipients.slice(0, LIMIT)

console.log(`${users.length} accounts, ${recipients.length} to write to`)
if (!SEND) {
  for (const u of recipients) console.log('  would send to ' + u.email)
  console.log('\nDry run. Nothing was sent. Add --send to actually send.')
  process.exit(0)
}

if (!process.env.BREVO_API_KEY) {
  console.error('BREVO_API_KEY is not set. Nothing sent.')
  process.exit(1)
}

const failed = []
let sent = 0

for (const u of recipients) {
  const name = byId.get(u.id)?.full_name || ''
  const { subject, text, html } = newRolesEmail({ name, siteUrl: SITE_URL })

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
      to: [{ email: u.email, name: name || undefined }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  })

  if (res.ok) {
    sent++
    console.log(`  sent  ${u.email}`)
  } else {
    failed.push(u.email)
    console.log(`  FAILED ${u.email}  ${res.status} ${await res.text()}`)
  }

  // Gentle on the API, and it keeps a mistake slow enough to interrupt.
  await new Promise(r => setTimeout(r, 250))
}

console.log(`\n${sent} sent, ${failed.length} failed`)
if (failed.length) {
  console.log('Retry these with --only <address> --send:')
  for (const e of failed) console.log('  ' + e)
}
