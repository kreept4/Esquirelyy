/**
 * Put LBVIP 5.0 back on the board, closing 30 August instead of 23 August.
 *
 * The firm extended it. Lekan Bamidele & Co posted "Application has been
 * EXTENDED to 30th of August" on 24 August 2026, on the same Instagram and
 * LinkedIn accounts the row already cites as its source, with a second post
 * saying the same thing in words: "Applications for the Lekan Bamidele Virtual
 * Internship Programme (LBVIP) 5.0 have now been extended to 30th August."
 *
 * ⚠ THIS IS A RESURRECTION, NOT A TIDY-UP, and that is the whole reason it
 * needs a script rather than a hand edit in the dashboard.
 *
 * The old deadline was yesterday. lib/opportunities.ts drops a closed
 * opportunity from the board entirely — `hasClosed` is checked in
 * jobs/page.tsx before the row is ever adapted — so at the moment this runs,
 * LBVIP is invisible to every reader. Moving the date does not just change a
 * number on a card; it brings a listing back that a member could reasonably
 * have concluded was over. Everything downstream follows the date on its own:
 *
 *   the board            hasClosed() goes false, so the row is rendered again
 *   Closing soon         six days out is inside the fourteen-day window, and it
 *                        sorts above the ECOWAS and JEE deadlines behind it
 *   the notification     buildFeed's CLOSING_WINDOW_DAYS is seven, so a
 *                        'deadline' row appears in the bell dated to today
 *   the stopwatch mark   ClosingSoon sets data-urgent at seven days or fewer
 *
 * None of those need editing. They read the column.
 *
 * ⚠ THE DESCRIPTION AND THE STEPS ARE NOT TOUCHED. An extension moves the
 * closing date and nothing else: the topic is the same topic, the video is the
 * same two minutes, the form is the same form. Rewriting the prose to mention
 * the extension would date the row to this week and leave it saying something
 * odd for the rest of its life. What the reader needs — how long is left — is
 * computed from `deadline` on every surface that shows it.
 *
 * Run: node scripts/2026-08-24-extend-lbvip-deadline.mjs
 * Idempotent. Re-running reports the date is already 30 August and writes
 * nothing.
 */

import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env.local')

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const ID = '1b7d3c9e-4f52-4a18-9c6d-2e8a5b0f7d41'
const NEW_DEADLINE = '2026-08-30'

const [before] = await (
  await fetch(`${BASE}/rest/v1/opportunities?id=eq.${ID}&select=title,deadline,status`, { headers: H })
).json()

if (!before) throw new Error(`No opportunity with id ${ID}. Has the row been replaced?`)

console.log('title    :', before.title)
console.log('deadline :', before.deadline, '->', NEW_DEADLINE)
console.log('status   :', before.status)

if (before.deadline === NEW_DEADLINE) {
  console.log('\nAlready extended. Nothing written.')
  process.exit(0)
}

const res = await fetch(`${BASE}/rest/v1/opportunities?id=eq.${ID}`, {
  method: 'PATCH',
  headers: { ...H, Prefer: 'return=representation' },
  body: JSON.stringify({ deadline: NEW_DEADLINE }),
})

if (!res.ok) {
  console.error('FAILED', res.status, await res.text())
  process.exit(1)
}

const [after] = await res.json()
console.log('\nwritten. deadline is now', after.deadline)

const days = Math.ceil((new Date(after.deadline).getTime() - Date.now()) / 86_400_000)
console.log(`${days} days left, so it is back on the board and inside both the`)
console.log('fourteen-day Closing soon window and the seven-day bell window.')
