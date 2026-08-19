/**
 * Send the LBVIP announcement to one address, on demand.
 *
 * Sibling of send-test-welcome.mjs, and it exists for a reason that only became
 * obvious the first time somebody tried to test a broadcast: send-lbvip.mjs
 * takes its recipients from the accounts table, so `--only you@example.com`
 * silently sends to nobody unless that address is already a confirmed member
 * with new-role emails switched on. That is correct for the broadcast — it must
 * not be able to write to a stranger — and useless for a proof, because the
 * person checking the layout is very often not on the list.
 *
 * So this points the SAME template at any address, exactly as the welcome test
 * does. Renders the template rather than a copy of it: a test that goes through
 * a second rendering path proves nothing about the first.
 *
 * ⚠ THE NAME IS LOOKED UP, NOT TYPED. This took a name as its second argument
 * and greeted the recipient with whatever was passed, which produced a test
 * addressed to "Tobi" landing in the inbox of an account registered as
 * Boluwatife. That is not a cosmetic difference: the entire point of a test send
 * is to see what a member will see, and a greeting assembled by hand is the one
 * line on the page that the real broadcast does not assemble that way.
 * send-lbvip.mjs reads `profiles.full_name`, so this reads
 * `profiles.full_name`, and a mismatch between the two is now impossible rather
 * than merely unlikely. An address with no profile gets the no-name greeting,
 * which is exactly what the broadcast would do with it.
 *
 * Usage:  node scripts/send-test-lbvip.mjs you@example.com
 */

import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const to = process.argv[2]
if (!to) {
  console.error('usage: node scripts/send-test-lbvip.mjs you@example.com')
  process.exit(1)
}
if (process.argv[3]) {
  console.error('This script no longer takes a name — it reads the registered name from Supabase.')
  console.error('See the note at the top of the file.')
  process.exit(1)
}

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

/* Bundled with esbuild rather than imported through the ts-resolve hook the
   welcome test uses. This template is self-contained but is bundled the same way, because '@/' alias
   and that hook does not resolve it; send-lbvip.mjs already solved this the
   same way, and using the identical step here means the test and the broadcast
   are rendering through the same pipeline as well as the same file. */
const bundle = join(tmpdir(), `esq-test-lbvip-${process.pid}.mjs`)
execSync(
  `npx --yes esbuild "src/lib/email/templates/lbvip.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${bundle}"`,
  { stdio: 'inherit' }
)
const { lbvipEmail } = await import(pathToFileURL(bundle).href)
rmSync(bundle, { force: true })

/* The registered name, from the same column the broadcast reads. Paged the same
   way too, because listUsers caps at 1000 and a lookup that quietly missed the
   1001st account would reintroduce exactly the bug this replaced. */
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let account = null
for (let page = 1; ; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
  if (error) throw new Error(error.message)
  account = data.users.find(u => (u.email || '').toLowerCase() === to.toLowerCase())
  if (account || data.users.length < 1000) break
}

let name = ''
if (account) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', account.id)
    .maybeSingle()
  name = profile?.full_name || ''
}

const siteUrl = (env.NEXT_PUBLIC_SITE_URL || 'https://esquirely.com.ng').replace(/\/$/, '')
const { subject, html, text } = lbvipEmail({ name, siteUrl })

console.log('sender  :', `${env.BREVO_SENDER_NAME} <${env.BREVO_SENDER_EMAIL}>`)
console.log('to      :', to)
console.log('account :', account ? 'found' : 'NOT A MEMBER — sending with no name, as the broadcast would')
console.log('name    :', name || '(none on file)')
/* Printed because it is the line the name actually lands in, and it is the one
   thing a test send exists to check. */
console.log('greeting:', text.split('\n')[0])
console.log('subject :', subject)

if (!env.BREVO_API_KEY) {
  console.error('BREVO_API_KEY is not set. Nothing sent.')
  process.exit(1)
}

const res = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'api-key': env.BREVO_API_KEY,
    'content-type': 'application/json',
    accept: 'application/json',
  },
  body: JSON.stringify({
    sender: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME || 'Esquirely' },
    to: [{ email: to, name: name || undefined }], // same shape send-lbvip.mjs uses
    subject,
    htmlContent: html,
    textContent: text,
  }),
})

const body = await res.text()
if (!res.ok) {
  console.error('\nFAILED', res.status, body)
  process.exit(1)
}
console.log('\nsent:', body)
