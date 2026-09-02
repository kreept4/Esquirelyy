/**
 * The World Bank Group Young Professionals Program deadline email.
 *
 * DRY RUN BY DEFAULT. Run it with no flags and it lists exactly who would be
 * written to and stops. Sending requires --send, typed on purpose.
 *
 *   node scripts/send-wbg-ypp.mjs
 *   node scripts/send-wbg-ypp.mjs --test you@example.com --as-of 2026-09-28 --send
 *   node scripts/send-wbg-ypp.mjs --send
 *
 * ALWAYS SEND ONE TO YOURSELF FIRST, with --test. An email is the one artefact
 * here that cannot be corrected after the fact.
 *
 * ============================================================
 * --as-of, AND WHY THIS SCRIPT HAS ONE WHEN send-wbg-reminder.mjs DOES NOT
 * ============================================================
 *
 * The countdown in this email is computed from the deadline rather than typed,
 * so the words change with the day it is sent. That is the correct behaviour and
 * it makes the proof send useless by default: a test run on 2 September renders
 * "28 days left", which is not the email anybody is going to receive.
 *
 * --as-of pins the date the template renders against, so you can read the exact
 * message that will go out on the day it goes out. It moves ONLY the rendered
 * copy. It does not change who is written to and it does not schedule anything.
 *
 * ⚠ IT IS DELIBERATELY NOT ALLOWED ON A REAL BROADCAST. Pinning the date on a
 * send to every member would post a countdown that disagrees with the board, the
 * bell and the calendar, and would do it to ninety inboxes at once. The guard
 * below refuses --as-of unless --test is also present.
 *
 * ============================================================
 * WHO IS SKIPPED
 * ============================================================
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
 * NO CAREER STAGE FILTER, and here the reasoning is the opposite of the
 * internship reminder's. That one could not filter because eligibility turned on
 * enrolment, which `career_stage` cannot answer. This one COULD filter, since
 * the Bank wants two to six years and `career_stage` is roughly about that. It
 * still does not, because the field records what somebody entered when they
 * signed up and is not maintained: a member who has since finished NYSC and
 * worked two years is still whatever they picked in August. Filtering on a stale
 * self-description would silently drop exactly the readers this is for. The
 * email states the experience floor in its second block instead.
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

/* Bundled on the fly rather than imported: the template is TypeScript, imports
   through the @/ alias, and plain node wants file extensions TypeScript
   forbids. esbuild settles all of it and keeps ONE copy of the copy, which is
   the thing that actually matters. Every path is quoted because this repository
   lives under a directory with a space and a full stop in it. */
const bundle = join(tmpdir(), `esq-wbg-ypp-${process.pid}.mjs`)
execSync(
  `npx --yes esbuild "src/lib/email/templates/wbg-ypp.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${bundle}"`,
  { stdio: 'inherit' }
)
const { wbgYppEmail, wbgYppDaysLeft, WBG_YPP } = await import(pathToFileURL(bundle).href)
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
const AS_OF = value('--as-of')
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esquirely.com.ng'

if (AS_OF && !TEST) {
  console.error('--as-of is only allowed with --test. See the header: pinning the date on a real')
  console.error('broadcast would send a countdown that disagrees with the board and the bell.')
  process.exit(1)
}

let NOW = new Date()
if (AS_OF) {
  const parsed = new Date(`${AS_OF}T12:00:00Z`)
  if (Number.isNaN(parsed.getTime())) {
    console.error(`--as-of ${AS_OF} is not a date. Use YYYY-MM-DD.`)
    process.exit(1)
  }
  NOW = parsed
}

/* Refuses once the application has shut, rather than sending a countdown for a
   form that stopped accepting entries. The template throws on the same
   condition; this is the friendlier version of the same guard. */
const daysLeft = wbgYppDaysLeft(NOW)
if (daysLeft === null) {
  console.error(`The WBG YPP closed on ${WBG_YPP.deadline}. Nothing sent.`)
  process.exit(1)
}

/**
 * One message. Returns null on success, the error text on failure.
 *
 * ⚠ A PINNED RENDER LABELS ITSELF IN THE SUBJECT, AND THIS WAS ADDED AFTER IT
 * CAUSED EXACTLY THE CONFUSION IT NOW PREVENTS.
 *
 * A proof send pinned to 28 September arrives saying "2 days left: World Bank
 * Group Young Professionals", with nothing anywhere in it to say that is a
 * render of a future day. It landed in an inbox next to the roles broadcast,
 * which correctly says Heirs Holdings closes in 2 days, and the reasonable
 * reading of the pair is that the World Bank shuts on Friday too. It does not;
 * it shuts on 30 September. Reported, and fair.
 *
 * The prefix only ever appears when --as-of is passed, and --as-of is refused
 * unless --test is passed too, so a real broadcast can never carry it.
 */
async function deliver({ email, name }) {
  const rendered = wbgYppEmail({ name, siteUrl: SITE_URL, now: NOW })
  const { text, html } = rendered
  const subject = AS_OF
    ? `[Preview of ${NOW.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}] ${rendered.subject}`
    : rendered.subject
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

console.log(`rendering as at ${NOW.toISOString().slice(0, 10)}: ${daysLeft} days left`)
if (AS_OF) console.log('  (date pinned by --as-of, copy only)')

/* The proof copy. Short-circuits before any Supabase call, so it works whether
   or not the address belongs to a member. */
if (TEST) {
  /* Echoes the subject as DELIVERED, preview prefix and all, so what the
     console reports and what arrives cannot differ. */
  const { subject } = wbgYppEmail({ name: '', siteUrl: SITE_URL, now: NOW })
  const shown = AS_OF
    ? `[Preview of ${NOW.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}] ${subject}`
    : subject
  console.log(`test send to ${TEST}`)
  console.log(`subject: ${shown}`)
  if (!SEND) {
    console.log('\nDry run. Nothing was sent. Add --send to actually send.')
  } else {
    requireKey()
    const err = await deliver({ email: TEST, name: '' })
    if (err) {
      console.error(`  FAILED ${TEST}  ${err}`)
      process.exitCode = 1
    } else {
      console.log(`  sent  ${TEST}`)
    }
  }
} else {
  await broadcast()
}

/*
 * ⚠ NOTHING BELOW OR ABOVE CALLS process.exit() ONCE A REQUEST HAS BEEN MADE,
 * and that is not tidiness.
 *
 * The first version of this script ended the test branch with process.exit(0)
 * straight after the Brevo call, copied from send-wbg-reminder.mjs. On Windows
 * that aborts the process while undici still holds the socket open, and node
 * dies in libuv teardown:
 *
 *   Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), src\win\async.c
 *
 * The mail had already been accepted. The send worked and the script reported
 * 127. That is the worst possible pairing for this particular program: a
 * successful broadcast that looks like a failed one invites somebody to run it
 * again, and the second run writes to all ninety confirmed accounts a second
 * time. There is no unsend.
 *
 * So control flow returns instead of exiting, and the exit status is set with
 * process.exitCode, which lets node close its handles and finish on its own.
 * The process.exit(1) calls that remain are all in argument validation, before
 * any network handle exists.
 *
 * send-wbg-reminder.mjs still has the original pattern and the same latent bug.
 * It is left alone here rather than fixed in passing: that script is for a
 * listing that closed on 12 August and it should be looked at on its own.
 */

async function broadcast() {
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
}
