/**
 * Send the welcome message to one address, on demand.
 *
 * This is the only way to see the real thing before a real person does. The
 * API route it mirrors takes its recipient from the session and cannot be
 * pointed anywhere — deliberately, see the note in
 * src/app/api/email/welcome/route.ts — so a test send needs its own entry point
 * rather than a parameter on the endpoint that would also be an open relay.
 *
 * Renders the SAME template the route renders, not a copy. A test that goes
 * through a second rendering path proves nothing about the first.
 *
 * Usage:  node scripts/send-test-welcome.mjs you@example.com ["Your Name"]
 */

import { readFileSync } from 'node:fs'
import { register } from 'node:module'

const to = process.argv[2]
const name = process.argv[3] || 'Bolu'
if (!to) {
  console.error('usage: node scripts/send-test-welcome.mjs you@example.com ["Your Name"]')
  process.exit(1)
}

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

// The template is TypeScript, so it needs the same resolve hook the other
// scripts here use to import from src/.
register(new URL('./ts-resolve-hook.mjs', import.meta.url))
const { welcomeEmail } = await import('../src/lib/email/templates/welcome.ts')

const siteUrl = (env.NEXT_PUBLIC_SITE_URL || 'https://esquirelyy.vercel.app').replace(/\/$/, '')
const { subject, html, text } = welcomeEmail({ name, siteUrl })

console.log('sender :', `${env.BREVO_SENDER_NAME} <${env.BREVO_SENDER_EMAIL}>`)
console.log('to     :', to)
console.log('subject:', subject)
console.log('links  :', siteUrl)

const res = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'api-key': env.BREVO_API_KEY,
    'content-type': 'application/json',
    accept: 'application/json',
  },
  body: JSON.stringify({
    sender: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME || 'Esquirely' },
    to: [{ email: to, name }],
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
