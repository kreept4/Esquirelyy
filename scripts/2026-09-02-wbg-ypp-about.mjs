/**
 * Make the World Bank `about` describe the World Bank.
 *
 * ============================================================
 * IT WAS TALKING TO THE READER FROM INSIDE A BLOCKQUOTE
 * ============================================================
 *
 * `about` renders in jobs/[slug]/page.tsx under the heading "In their words",
 * inside a <blockquote>, with a citation link beneath it. The seeded text read:
 *
 *   "...Nigeria is a member of all of them, which is what makes a Nigerian
 *    passport holder eligible for this programme."
 *
 * The facts are right and the second clause is ours. The World Bank has never
 * said anything about Nigerian passport holders; we inferred it, correctly, from
 * their member-country rule. Putting our inference inside a quotation block
 * attributed to them is the same fault the Greenberg Traurig script records
 * about its requirements list: "the second half of that was ours, not the
 * firm's, sitting inside a list a reader takes as the employer's own words".
 *
 * Nothing is lost by cutting it. "Open to Nigerian passport holders" is already
 * an eligibility bullet, in our voice, where it belongs.
 *
 * ============================================================
 * ⚠ THE HEADING IS A WIDER PROBLEM AND IS DELIBERATELY NOT TOUCHED HERE
 * ============================================================
 *
 * Checked against the six most recent listings: Greenberg Traurig, Tangerine,
 * AVA, Heirs Holdings and U&P all carry an `about` that WE wrote describing the
 * employer, not a quotation from them. So "In their words" over a blockquote is
 * already a claim the data does not support, on every row on the board, and it
 * predates this listing.
 *
 * That is a call about the whole board and a one-word change in a shared
 * component, so it is not made in passing inside a script for one row. Raised
 * with Bolu instead. What this script does is bring the World Bank row into
 * line with how the other five are written, which is the right move whichever
 * way the heading question goes.
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

/* Employer, not reader. Every clause is about the institution and every one of
   them is on the Bank's own pages. */
const ABOUT =
  'A multilateral development institution owned by its member countries and made up of four arms: the World Bank, IFC, MIGA and ICSID. Between them they lend to governments, invest in the private sector, insure against political risk and settle investment disputes. The Young Professionals Program has run for more than 60 years and is the institution\'s main entry route for early-career specialists.'

const rows = await (
  await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}&select=about`, { headers: H })
).json()

if (!Array.isArray(rows) || !rows.length) {
  console.error(`${SLUG} is not on the board. Run 2026-09-02-add-wbg-ypp.mjs first.`)
  process.exitCode = 1
} else if (rows[0].about === ABOUT) {
  console.log('Already rewritten, nothing changed.')
} else {
  const res = await fetch(`${BASE}/rest/v1/jobs?id=eq.${SLUG}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ about: ABOUT }),
  })
  const body = await res.json()
  if (!res.ok) {
    console.error(`FAILED ${res.status}`)
    console.error(body)
    process.exitCode = 1
  } else {
    console.log('rewritten. reader-facing clause removed:')
    console.log(`  was: ...${/which is what makes[^.]*\./.exec(rows[0].about || '')?.[0] ?? '(not found)'}`)
    console.log(`  now: every clause is about the institution`)
  }
}
