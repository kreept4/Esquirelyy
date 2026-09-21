/**
 * Which of the pending migrations have actually been run?
 *
 * WHY THIS EXISTS. Both migrations are applied by hand in the Supabase SQL
 * editor, because nothing in this environment can issue DDL: there is no psql,
 * no Supabase CLI, no DATABASE_URL in .env.local, and no SQL-executing RPC on
 * the project. That is the right shape for schema changes and it does mean the
 * only record of whether one ran is the database itself.
 *
 * So this asks the database rather than the repo. Run it before pasting, to see
 * what is outstanding, and again after, to confirm the paste took. A migration
 * you did not watch land is a hypothesis.
 *
 * ⚠ IT PROBES, IT DOES NOT READ THE CATALOGUE. PostgREST will not expose
 * pg_constraint or information_schema, so each check does the smallest harmless
 * thing that only succeeds once the migration has run:
 *
 *   columns      select the three new columns. PostgREST answers 42703,
 *                "column does not exist", until they are there.
 *   constraint   attempt an insert with type 'competition' inside a request
 *                that is then NOT committed, because the row is deleted
 *                immediately. A 23514 check-constraint violation means the old
 *                vocabulary is still in force.
 *
 * The constraint probe writes and removes one row. It is the only way to ask a
 * CHECK constraint a question without reading the catalogue, and it cleans up
 * after itself in a finally block.
 *
 * Run: node scripts/check-migrations.mjs
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
if (!BASE || !KEY) throw new Error('Supabase env missing from .env.local')
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const line = (label, ok, detail) =>
  console.log(`  ${ok ? 'DONE   ' : 'PENDING'}  ${label.padEnd(46)} ${detail}`)

console.log('\nPending migrations, checked against the live database:\n')

/* ---- 1. 2026-09-12-cover-letter-application-fields.sql ---- */
const cols = ['division', 'advert', 'employer_knowledge']
const r1 = await fetch(`${BASE}/rest/v1/cover_letters?select=${cols.join(',')}&limit=1`, { headers: H })
const body1 = await r1.text()
const colsOk = r1.ok
line('cover_letters.division / advert / employer_knowledge', colsOk,
  colsOk ? 'all three present' : `missing (${(JSON.parse(body1).message || '').slice(0, 60)})`)

/* ---- 2. 2026-09-21-opportunity-type-competition.sql ---- */
let probeId = null
let typeOk = false
let typeDetail = ''
try {
  const r2 = await fetch(`${BASE}/rest/v1/opportunities`, {
    method: 'POST',
    headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({
      title: `zz-migration-probe-${Date.now()}`,
      organization: 'probe',
      type: 'competition',
      /* NOT NULL, and the first version of this probe left it out and got a
         23502 back, which reads like the constraint passing when it never got
         that far. A probe that can fail for a reason other than the one it is
         testing is not a probe. */
      target: 'all',
      link: 'https://example.invalid',
      status: 'draft',
    }),
  })
  if (r2.ok) {
    probeId = (await r2.json())[0].id
    typeOk = true
    typeDetail = "'competition' accepted"
  } else {
    const e = JSON.parse(await r2.text())
    typeDetail = e.code === '23514'
      ? "'competition' rejected by opportunities_type_check"
      : `unexpected: ${e.code} ${(e.message || '').slice(0, 50)}`
  }
} finally {
  if (probeId) {
    await fetch(`${BASE}/rest/v1/opportunities?id=eq.${probeId}`, { method: 'DELETE', headers: H })
  }
}
line('opportunities type vocabulary allows competition', typeOk, typeDetail)

/* ---- what the LGIC row currently carries ---- */
const lgic = await fetch(
  `${BASE}/rest/v1/opportunities?select=title,type&title=like.*Fabunmi*`, { headers: H },
).then(r => r.json())
if (lgic[0]) {
  console.log(`\n  LGIC row type is '${lgic[0].type}'.` +
    (typeOk && lgic[0].type !== 'competition'
      ? " The vocabulary allows 'competition' now, so this can be switched."
      : ''))
}

/* ---- leftover probes from an interrupted run ---- */
const strays = await fetch(
  `${BASE}/rest/v1/opportunities?select=id,title&title=like.zz-migration-probe-*`, { headers: H },
).then(r => r.json())
if (Array.isArray(strays) && strays.length) {
  console.log(`\n  ⚠ ${strays.length} leftover probe row(s) found. Removing.`)
  for (const s of strays) {
    await fetch(`${BASE}/rest/v1/opportunities?id=eq.${s.id}`, { method: 'DELETE', headers: H })
  }
}

console.log(colsOk && typeOk ? '\nBoth migrations are in.\n' : '\nSomething is still outstanding.\n')
