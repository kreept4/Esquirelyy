/**
 * Read-only report of active jobs whose stated deadline has already passed.
 *
 * Run before any delist script, to see what else needs closing beyond Zyph
 * Legal. Changes nothing — just prints slug, employer, deadline for review.
 *
 * Run: node scripts/2026-08-23-report-expired-jobs.mjs
 */

import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env.local')

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const today = new Date().toISOString().slice(0, 10)

const res = await fetch(
  `${URL_BASE}/rest/v1/jobs?select=slug,title,employer,deadline,is_rolling,is_active&is_active=eq.true&is_rolling=eq.false&deadline=lt.${today}&order=deadline.asc`,
  { headers: H }
)
const rows = await res.json()
if (!res.ok) { console.error('query failed', res.status, rows); process.exit(1) }

if (!rows.length) {
  console.log('No active, non-rolling jobs with a passed deadline.')
} else {
  console.log(`${rows.length} active job(s) past their deadline:\n`)
  for (const r of rows) {
    console.log(`  ${r.slug}  (${r.employer}) — deadline ${r.deadline}`)
  }
}
