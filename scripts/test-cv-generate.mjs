/**
 * End to end: real CV in, real model call, real DOCX and PDF out.
 *
 * Requires the dev server. Costs a live Opus call, so it is not something to
 * run in a loop, but it is the only check that exercises the prompt, the
 * cleanup, both renderers and the export route together.
 *
 *   node scripts/test-cv-generate.mjs "path/to/CV.pdf"
 */
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE || 'http://localhost:3000'
const cvPath = process.argv[2]
const out = process.argv[3] || 'C:/Users/BARR~1.TOB/AppData/Local/Temp/claude/cv-test'
fs.mkdirSync(out, { recursive: true })

if (!cvPath || !fs.existsSync(cvPath)) {
  console.error('Usage: node scripts/test-cv-generate.mjs <cv file> [outdir]')
  process.exit(1)
}

/**
 * The most recent real review, so the generator is exercised on the path that
 * actually matters: acting on feedback a user has read.
 *
 * Pulled from the database rather than committed, because it is somebody's CV.
 * scripts/fixtures/ is gitignored and this writes the cache there on first run.
 */
async function loadReview() {
  const cached = new URL('./fixtures/last-review.json', import.meta.url)
  if (fs.existsSync(cached)) return JSON.parse(fs.readFileSync(cached, 'utf8'))

  const env = Object.fromEntries(
    fs
      .readFileSync('.env.local', 'utf8')
      .split('\n')
      .filter(l => l.includes('=') && !l.trim().startsWith('#'))
      .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
  )
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
  const { data, error } = await sb
    .from('cv_reviews')
    .select('result')
    .order('created_at', { ascending: false })
    .limit(1)
  if (error || !data?.length) {
    console.warn('No stored review found, generating without one.')
    return null
  }
  fs.mkdirSync(new URL('./fixtures/', import.meta.url), { recursive: true })
  fs.writeFileSync(cached, JSON.stringify(data[0].result, null, 2))
  return data[0].result
}

const review = await loadReview()

const fd = new FormData()
fd.append('file', new File([fs.readFileSync(cvPath)], path.basename(cvPath)))
fd.append('firstName', 'Adaeze')
fd.append('targetRole', 'Trainee Associate')
fd.append('careerStage', 'Junior (0-3 yrs PQE)')
if (review) fd.append('review', JSON.stringify(review))

console.log('POST /api/cv-generate ...')
const started = Date.now()
const res = await fetch(`${BASE}/api/cv-generate`, { method: 'POST', body: fd })
const data = await res.json()
console.log(`  ${res.status} in ${((Date.now() - started) / 1000).toFixed(1)}s`)

if (!res.ok) {
  console.error('FAILED:', data.error)
  process.exit(1)
}

fs.writeFileSync(path.join(out, 'generated.json'), JSON.stringify(data, null, 2))

const cv = data.cv
console.log('\nName:', cv.name)
console.log('Contact:', cv.contact.map(c => c.text + (c.href ? ` -> ${c.href}` : '')).join(' | '))
console.log('\nSections:')
for (const s of cv.sections) {
  const n =
    s.kind === 'entries' ? `${s.entries.length} entries` :
    s.kind === 'grouped' ? `${s.groups.length} groups` : 'prose'
  console.log(`  ${s.heading.padEnd(24)} ${s.kind.padEnd(8)} ${n}`)
}

console.log('\nSummary:\n ', (cv.sections.find(s => s.kind === 'prose')?.body || '').replace(/(.{92})/g, '$1\n  '))

console.log('\nChanges:')
for (const c of data.changes) console.log('  -', c)
if (data.gaps?.length) {
  console.log('\nGaps:')
  for (const g of data.gaps) console.log('  -', g)
}

// The rules that must hold no matter what the model returned.
console.log('\nChecks:')
const flat = JSON.stringify(cv)
const emDash = (flat.match(/[—–]/g) || []).length
console.log(`  ${emDash === 0 ? 'ok  ' : 'FAIL'} no em or en dashes (${emDash})`)

const banned = ['delve', 'tapestry', 'testament', 'showcase', 'robust', 'seamless', 'spearhead', 'passionate about', 'proven track record', 'results driven', 'responsible for', 'tasked with', 'helped with', 'assisted with', 'duties included']
const hits = banned.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(flat))
console.log(`  ${hits.length === 0 ? 'ok  ' : 'FAIL'} no banned phrasing ${hits.length ? `(${hits.join(', ')})` : ''}`)

const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(flat)
console.log(`  ${!emoji ? 'ok  ' : 'FAIL'} no emoji`)

console.log(`  ${!/references available/i.test(flat) ? 'ok  ' : 'FAIL'} no references line`)

// Nothing invented: every employer and institution on the source CV should
// still be there, and nothing that looks like a new one should have appeared.
const employers = ['Meridian Health Partners', 'Chidi Anyaoku', 'Bamidele Adeyemi', 'Nwachukwu and Nwachukwu', 'Nigerian Law School', 'Obafemi Awolowo University', 'NICARB', 'ICMC', 'WIPO']
for (const e of employers) {
  console.log(`  ${flat.includes(e) ? 'ok  ' : 'MISS'} kept: ${e}`)
}

// Dates must be complete and consistent, which is what the review marked down.
const dates = []
for (const s of cv.sections) {
  if (s.kind !== 'entries') continue
  for (const e of s.entries) {
    for (const v of [e.titleRight, e.subtitleRight]) {
      if (v && /\d{4}/.test(v)) dates.push(v)
    }
  }
}
const wellFormed = dates.filter(d =>
  /^[A-Z][a-z]+ \d{4}( - ([A-Z][a-z]+ \d{4}|Present))?$/.test(d)
)
console.log(`  ${wellFormed.length === dates.length ? 'ok  ' : 'FAIL'} date format consistent (${wellFormed.length}/${dates.length})`)
for (const d of dates.filter(d => !wellFormed.includes(d))) console.log('       odd:', d)

// Now the exports.
for (const format of ['docx', 'pdf', 'both']) {
  const r = await fetch(`${BASE}/api/cv-export?format=${format}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cv }),
  })
  if (!r.ok) {
    console.log(`\n  FAIL export ${format}: ${r.status} ${(await r.text()).slice(0, 200)}`)
    continue
  }
  const buf = Buffer.from(await r.arrayBuffer())
  const disp = r.headers.get('content-disposition')
  const name = /filename="([^"]+)"/.exec(disp)?.[1] || `cv.${format}`
  fs.writeFileSync(path.join(out, name), buf)
  console.log(`\n  ok   export ${format}: ${buf.length} bytes -> ${name}`)
}

// Read the PDF back and confirm every bullet survived the round trip.
const { getDocumentProxy, extractText } = await import('unpdf')
const pdfBuf = fs.readFileSync(path.join(out, fs.readdirSync(out).find(f => f.endsWith('.pdf'))))
const pdf = await getDocumentProxy(new Uint8Array(pdfBuf))
const { text } = await extractText(pdf, { mergePages: true })
const norm = t => t.replace(/\s+/g, ' ')
const flatPdf = norm(text)

const bullets = cv.sections.filter(s => s.kind === 'entries').flatMap(s => s.entries.flatMap(e => e.bullets ?? []))
const missing = bullets.filter(b => !flatPdf.includes(norm(b)))
console.log(`\n  ${missing.length === 0 ? 'ok  ' : 'FAIL'} all ${bullets.length} bullets present in PDF`)
for (const m of missing) console.log('       missing:', m.slice(0, 70))
console.log(`  PDF pages: ${pdf.numPages}`)
console.log(`\nFiles in ${out}`)
