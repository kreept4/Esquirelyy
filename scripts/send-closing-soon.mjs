/**
 * Announce LBVIP 5.0 to every member. Closes 23 August 2026.
 *
 * DRY RUN BY DEFAULT. Run it with no flags and it lists exactly who would be
 * written to and stops. Sending requires --send, typed on purpose.
 *
 *   node --experimental-strip-types scripts/send-closing-soon.mjs
 *   node --experimental-strip-types scripts/send-closing-soon.mjs --only you@example.com --send
 *   node --experimental-strip-types scripts/send-closing-soon.mjs --send
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
 * this morning is exactly who this is for.
 *
 * ⚠ ONE SEND, NOT A CAMPAIGN. The ship plan is explicit that this is a single
 * announcement and that no recurring opportunity-email system is being built
 * here. If a future opportunity wants the same treatment, that is its own
 * decision and its own script, not a schedule attached to this one.
 *
 * ⚠ IT READS THE new_listings PREFERENCE, WHICH IS ARGUABLY THE WRONG FLAG.
 * That preference was written for the roles drop, and this is an opportunity
 * rather than a listing. Reusing it is the conservative reading: somebody who
 * switched off mail about new openings did not thereby ask for mail about a
 * different kind of new opening. Inventing a second preference they never set,
 * and defaulting it to on, would be the way to get a spam complaint from a
 * person who thought they had already opted out.
 *
 * ⚠ NINETY ACCOUNTS AGAINST A 300/DAY FREE TIER, so the whole send fits in one
 * pass with room to spare. Check that is still true before reusing this script
 * on a larger list; past 300 the API simply refuses and the tail is dropped.
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
const bundle = join(tmpdir(), `esq-closing-${process.pid}.mjs`)
/* shell: true because npx is a .cmd on Windows and spawnSync cannot execute
   one directly. Every path is quoted: this repository lives under a directory
   with a space and a full stop in it, which is exactly the shape that breaks an
   unquoted shell command. */
execSync(
  `npx --yes esbuild "src/lib/email/templates/closing-soon.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${bundle}"`,
  { stdio: 'inherit' }
)
const { closingSoonEmail } = await import(pathToFileURL(bundle).href)

/**
 * The items, fetched once and shared by every recipient.
 *
 * ⚠ THE SAME RULE THE BOARD USES, imported rather than reimplemented. An email
 * naming two things while /jobs shows three is a disagreement nobody catches
 * until a member does.
 */
const closingBundle = join(tmpdir(), `esq-closing-rule-${process.pid}.mjs`)
execSync(
  `npx --yes esbuild "src/lib/opportunities.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${closingBundle}"`,
  { stdio: 'inherit' }
)
const { toBoardRow } = await import(pathToFileURL(closingBundle).href)
rmSync(closingBundle, { force: true })

/**
 * ⚠ SEVEN DAYS HERE, FOURTEEN ON THE BOARD, AND THE DIFFERENCE IS DELIBERATE.
 *
 * ClosingSoon on /jobs shows a fortnight. That is right for a page: the reader
 * went looking, and a thing closing in twelve days is worth knowing about while
 * they are already there.
 *
 * An email is not that. It arrives uninvited and spends attention the reader did
 * not offer, so it should only carry what is actually urgent. The first draft of
 * this used the board's fourteen and the greeting read "3 things close this
 * week" while one of the three closed on 31 August, which is not this week and
 * was simply untrue. Seven days makes the sentence accurate rather than making
 * the sentence vaguer, which was the other way to fix it and the worse one.
 *
 * The consequence is real and accepted: something at eight days out is on the
 * board and not in this email. It is still on the board, and this send is a
 * one-off rather than a weekly digest, so nothing is promising otherwise.
 */
const WINDOW_DAYS = 7

/* ⚠ THE SAME CALENDAR ARITHMETIC THE SITE USES, BUNDLED FROM lib/day.ts RATHER
   THAN REWRITTEN HERE.

   This line used to be its own one-liner:

       Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)

   which is the exact expression lib/day.ts was written to delete, still living
   here because these scripts are .mjs and could not import the TypeScript. It
   subtracts two INSTANTS in UTC. A deadline column holds a plain date, read as
   midnight UTC, and the reader is in Lagos at UTC+1, so between 23:00 and
   midnight UTC every count it produced was a day too high.

   On an email that is worse than it is on the page. The page recomputes itself
   the next time somebody loads it; a send is final. An email that went out in
   that hour would tell a member a deadline was two days away when the site,
   read a minute later, said one, and the whole reason closingSoon() is shared
   between the two surfaces is so they cannot disagree.

   So the rule is bundled the way the template and the board row already are.
   Three esbuild steps rather than two, and no second implementation of the one
   piece of arithmetic in this codebase that has already been got wrong once. */
const dayBundle = join(tmpdir(), `esq-day-${process.pid}.mjs`)
execSync(
  `npx --yes esbuild "src/lib/day.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${dayBundle}"`,
  { stdio: 'inherit' }
)
const { daysUntilDay } = await import(pathToFileURL(dayBundle).href)
rmSync(dayBundle, { force: true })

const daysTo = d => daysUntilDay(d)

async function fetchClosingItems(sb) {
  const [{ data: jobs }, { data: opps }] = await Promise.all([
    sb.from('jobs').select('*').eq('is_active', true),
    sb.from('opportunities').select('*').eq('status', 'published'),
  ])
  const rows = [...(opps || []).map(toBoardRow), ...(jobs || [])]
  return rows
    .filter(r => r.deadline && !r.is_rolling)
    .filter(r => { const d = daysTo(r.deadline); return d >= 0 && d <= WINDOW_DAYS })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .map(r => ({
      slug: r.slug,
      title: r.title,
      employer: r.employer,
      deadline: r.deadline,
      eligibility: r.eligibility ?? null,
      application_steps: r.application_steps ?? null,
    }))
}
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

const CLOSING_ITEMS = await fetchClosingItems(supabase)
if (!CLOSING_ITEMS.length) {
  console.error('Nothing is closing inside the window. There is no email to send.')
  process.exit(1)
}
console.log(`closing inside ${WINDOW_DAYS} days: ${CLOSING_ITEMS.length}`)
for (const it of CLOSING_ITEMS) {
  console.log(`  ${String(daysTo(it.deadline)).padStart(2)}d  ${it.employer}: ${it.title}`)
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
  const { subject, text, html } = closingSoonEmail({ name, siteUrl: SITE_URL, items: CLOSING_ITEMS, daysAhead: WINDOW_DAYS })

  /* ⚠ THE SEND IS WRAPPED, AND IT WAS NOT, AND THAT COST A WHOLE BROADCAST.
     On 27 August 2026 the first request to api.brevo.com hit a ten second
     connect timeout. fetch rejects on a network failure rather than returning a
     response, there was no catch, and the rejection reached the top level and
     killed the process on recipient one of eighty eight. None of them were
     written to, the `failed` list below never printed, and the only way to
     learn any of that was to go and ask Brevo what it had actually accepted.

     A transient network error is the most ordinary thing that can happen in the
     middle of a loop that makes eighty eight sequential HTTP calls, and it must
     cost one recipient rather than all of them. Three attempts with a widening
     pause, then the address goes on the failed list and the run continues.

     ⚠ RETRY ONLY ON A THROWN ERROR OR A 5xx, NEVER ON A 4xx. A rejected
     recipient, a malformed address or a rejected key will fail identically
     three times, and retrying a 429 without honouring its window makes the rate
     limit worse. Those go straight to `failed`, which is the list a human then
     reruns deliberately with --only. */
  let res = null
  let lastErr = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      res = await fetch('https://api.brevo.com/v3/smtp/email', {
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
        signal: AbortSignal.timeout(30000),
      })
      lastErr = null
      if (res.status < 500) break
      lastErr = new Error(`HTTP ${res.status}`)
    } catch (err) {
      res = null
      lastErr = err
    }
    if (attempt < 3) {
      console.log(`  retry ${attempt} ${u.email}  ${lastErr?.message ?? ''}`)
      await new Promise(r => setTimeout(r, attempt * 2000))
    }
  }

  if (res && res.ok) {
    sent++
    console.log(`  sent  ${u.email}`)
  } else if (res) {
    failed.push(u.email)
    console.log(`  FAILED ${u.email}  ${res.status} ${await res.text()}`)
  } else {
    failed.push(u.email)
    console.log(`  FAILED ${u.email}  ${lastErr?.message ?? 'network error'}`)
  }

  // Gentle on the API, and it keeps a mistake slow enough to interrupt.
  await new Promise(r => setTimeout(r, 250))
}

console.log(`\n${sent} sent, ${failed.length} failed`)
if (failed.length) {
  console.log('Retry these with --only <address> --send:')
  for (const e of failed) console.log('  ' + e)
}
