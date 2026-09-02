/**
 * Spell the World Bank YPP deadline out in Lagos time as well as UTC.
 *
 * ============================================================
 * WHY A SECOND SCRIPT RATHER THAN AN EDIT TO THE FIRST
 * ============================================================
 *
 * 2026-09-02-add-wbg-ypp.mjs has already run against production. Editing it
 * would leave a file in the repository that no longer describes what it did,
 * and it refuses to write twice by design, so re-running the edited version
 * would silently do nothing. The house pattern is one dated script per change:
 * see 2026-08-24-extend-lbvip-deadline.mjs and
 * 2026-09-01-complete-tangerine-listing.mjs.
 *
 * ============================================================
 * WHAT IS WRONG WITH "23:59 UTC" ON ITS OWN
 * ============================================================
 *
 * Nothing, factually. It is what the Bank publishes and the listing quoted it
 * correctly. The problem is who is reading it.
 *
 * Lagos is UTC+1, so 23:59 UTC on 30 September is 00:59 on 1 OCTOBER in Lagos.
 * A reader in Nigeria who sees "23:59 UTC" and does the conversion in their
 * head at speed is as likely to subtract an hour as add one, and the version
 * where they subtract has them believing the form shuts at 22:59 on the 30th.
 * That reader loses the last hour of the last day for no reason.
 *
 * ⚠ THE ERROR IS ONE-SIDED, WHICH IS WHY THIS IS WORTH A SCRIPT. Getting the
 * conversion wrong in the other direction costs nothing: somebody who thinks
 * they have until midnight Lagos on the 30th is right, with an hour to spare.
 * Every unit of confusion here falls on the side of applying too early or not
 * at all. Both times are stated now so there is nothing to convert.
 *
 * The stored `deadline` column is NOT touched. It stays 2026-09-30, which is
 * the Lagos calendar day the role is last open on, and that is what
 * lib/day.ts counts against for the board countdown, the bell and the expiry
 * sweep. Moving it to 1 October to "cover" the extra fifty nine minutes would
 * put a day that the form is shut on every countdown on the site.
 */

import { readFileSync } from 'node:fs'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env.local')

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const SLUG = 'world-bank-group-young-professionals-programme-2027'

const OLD = 'Applications close Wednesday 30 September 2026 at 23:59 UTC. Late ones are not accepted'
const NEW =
  'Applications close Wednesday 30 September 2026 at 23:59 UTC, which is 00:59 on 1 October in Lagos. Late ones are not accepted'

const rows = await (
  await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}&select=requirements,deadline`, { headers: H })
).json()

if (!Array.isArray(rows) || !rows.length) {
  console.error(`${SLUG} is not on the board. Run 2026-09-02-add-wbg-ypp.mjs first.`)
  process.exitCode = 1
} else {
  const current = rows[0].requirements || []
  if (current.includes(NEW)) {
    console.log('Already says it in both zones, nothing written.')
  } else if (!current.includes(OLD)) {
    /* Refuses rather than guessing. If the line has been edited by hand since
       the listing went up, a blind replace would either miss or clobber it. */
    console.error('The expected closing line is not present. Requirements now read:')
    for (const r of current) console.error('  ' + r)
    process.exitCode = 1
  } else {
    const next = current.map(r => (r === OLD ? NEW : r))
    const res = await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}`, {
      method: 'PATCH',
      headers: { ...H, Prefer: 'return=representation' },
      body: JSON.stringify({ requirements: next }),
    })
    const body = await res.json()
    if (!res.ok) {
      console.error(`FAILED ${res.status}`)
      console.error(body)
      process.exitCode = 1
    } else {
      console.log('updated the closing line:')
      console.log('  ' + NEW)
      console.log(`deadline column left at ${rows[0].deadline}, which is correct.`)
    }
  }
}
