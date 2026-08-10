/**
 * Issue an ambassador an invite code, and read the standings.
 *
 *   node scripts/ambassador-code.mjs new "Tomi Adeleke" unilag
 *   node scripts/ambassador-code.mjs standings
 *
 * WHY THE CODE IS READABLE AND NOT RANDOM. An ambassador says this out loud in
 * a lecture room and writes it on a slide. "unilag-tomi" survives being heard
 * across a room and typed from memory; "a7f3c2" does not, and every character
 * mistyped is a signup credited to nobody. The trade is that codes are
 * guessable, which matters only if a code were a secret. It is a campaign tag.
 *
 * There is no ambassadors table. A code is agreed with a person by email, and
 * the count is a group-by over profiles, so the whole scheme is one column.
 * Build the table when there are enough ambassadors that a spreadsheet stops
 * working, not before.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://esquirely.com.ng').trim().replace(/\/+$/, '')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/** Same shape the browser and the trigger both enforce. */
function toCode(name, campus) {
  const first = String(name).trim().split(/\s+/)[0] ?? ''
  const parts = [campus, first]
    .map(p => String(p ?? '').toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(Boolean)
  const code = parts.join('-').slice(0, 32)
  if (!/^[a-z0-9][a-z0-9-]{1,31}$/.test(code)) {
    throw new Error(`Could not build a valid code from "${name}" / "${campus}"`)
  }
  return code
}

const [command, ...rest] = process.argv.slice(2)

if (command === 'new') {
  const [name, campus] = rest
  if (!name) {
    console.error('Usage: node scripts/ambassador-code.mjs new "Full Name" campus')
    process.exit(1)
  }
  const code = toCode(name, campus)

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', code)

  console.log(`\nAmbassador : ${name}`)
  console.log(`Code       : ${code}`)
  console.log(`Link       : ${SITE}/?ref=${code}`)
  if (count) console.log(`\n⚠ ${count} signup(s) already carry this code. Pick a different campus or use a surname.`)
  console.log('\nThe link works on any page. Sharing a firm profile or a single opening')
  console.log(`is usually better than the front door: ${SITE}/firms?ref=${code}`)
  process.exit(0)
}

if (command === 'standings') {
  const { data, error } = await supabase
    .from('profiles')
    .select('referred_by, created_at')
    .not('referred_by', 'is', null)
  if (error) { console.error(error.message); process.exit(1) }

  const tally = new Map()
  for (const row of data) {
    const t = tally.get(row.referred_by) ?? { n: 0, latest: null }
    t.n++
    if (!t.latest || row.created_at > t.latest) t.latest = row.created_at
    tally.set(row.referred_by, t)
  }

  const rows = [...tally.entries()].sort((a, b) => b[1].n - a[1].n)
  if (!rows.length) { console.log('No referred signups yet.'); process.exit(0) }

  console.log('\ncode'.padEnd(26) + 'signups'.padEnd(10) + 'latest')
  console.log('-'.repeat(60))
  for (const [code, t] of rows) {
    console.log(code.padEnd(26) + String(t.n).padEnd(10) + new Date(t.latest).toISOString().slice(0, 10))
  }
  console.log(`\n${rows.length} ambassadors, ${data.length} referred signups`)
  process.exit(0)
}

console.error('Usage:\n  node scripts/ambassador-code.mjs new "Full Name" campus\n  node scripts/ambassador-code.mjs standings')
process.exit(1)
