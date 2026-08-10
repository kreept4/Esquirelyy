/**
 * Send the "change your password" nudge to every account.
 *
 * DRY RUN BY DEFAULT, AND THAT IS NOT A CONVENIENCE. This is the only script in
 * the repository that talks to real people, one message each, with no undo. Run
 * it with no flags and it lists exactly who would be written to and stops.
 * Sending requires --send, typed on purpose.
 *
 * Node 24 strips the types, so the template is imported straight from source
 * rather than duplicated here. One copy of the copy.
 *
 *   node --experimental-strip-types scripts/send-password-prompt.mjs
 *   node --experimental-strip-types scripts/send-password-prompt.mjs --only you@example.com --send
 *   node --experimental-strip-types scripts/send-password-prompt.mjs --send
 *
 * ALWAYS SEND ONE TO YOURSELF FIRST. Use --only your@address with --send. An
 * email is the one artefact here that cannot be corrected after the fact: a
 * broken layout, a wrong link or a typo is simply out there, in a few hundred
 * inboxes, permanently.
 *
 * Brevo's free tier delivers 300 messages a day. Past that the API starts
 * refusing, so the run reports failures per address rather than stopping, and
 * the addresses it could not reach are printed at the end to be retried
 * tomorrow with --only.
 *
 * Accounts on a break are skipped. Someone who told us to stop emailing them
 * meant it, and a security nudge is still an email.
 *
 * EXISTING ACCOUNTS ONLY. Anyone who signed up on or after FEATURE_DATE chose
 * their password knowing the reuse rule and has not had time to grow tired of
 * it, so telling them to change something they set last week reads as a system
 * that is not paying attention. --all overrides the cutoff if there is ever a
 * reason to write to everybody, which a routine nudge is not.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// The app reads .env.local through Next. A plain node script does not, so it is
// parsed here rather than adding dotenv for one file.
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const { passwordPromptEmail } = await import('../src/lib/email/templates/password-prompt.ts')

const args = process.argv.slice(2)
const flag = n => args.includes(n)
const value = n => {
  const i = args.indexOf(n)
  return i === -1 ? null : args[i + 1]
}

const SEND = flag('--send')
const LIMIT = value('--limit') ? Number(value('--limit')) : null
const ONLY = value('--only')
const ALL = flag('--all')
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esquirely.com.ng'

/** The day the change-password flow and the reuse rule shipped. Accounts made
 *  from here on already chose a password under the new rule. */
const FEATURE_DATE = new Date('2026-08-10T00:00:00Z')

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
  .select('id, full_name, break_until')
const byId = new Map((profiles ?? []).map(p => [p.id, p]))

const now = Date.now()
let recipients = users
  .filter(u => u.email)
  .filter(u => u.email_confirmed_at || u.confirmed_at)
  // Existing accounts only. See FEATURE_DATE.
  .filter(u => ALL || new Date(u.created_at) < FEATURE_DATE)
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
  const { subject, text, html } = passwordPromptEmail({ name, siteUrl: SITE_URL })

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
