/**
 * Turn up logo candidates for every firm that still has no mark.
 *
 * Deliberately a lister, not a downloader. The last pass at automatic scoring
 * (find-firm-logos.mjs) confidently nominated searchicon.svg, close.svg and a
 * cookie-banner asset as firm marks, so this prints what it finds and a human
 * picks. Candidates are ordered by how logo-ish the URL looks, but the ranking
 * is a hint, not a decision.
 *
 * The target list used to be typed in beside each batch of new firms, which
 * meant editing this file every time the directory grew and, worse, meant the
 * list could quietly disagree with the data. It now reads firms-data.ts and
 * takes every firm with no bucket file, no local PNG and no entry in
 * LOCAL_ONLY_LOGO, so the script always aims at exactly the gap.
 *
 * Run: node scripts/find-new-firm-logos.mjs
 *      node scripts/find-new-firm-logos.mjs babalakin solola-akpana   # subset
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA = path.join(ROOT, 'src/lib/firms-data.ts')
const LOGOS = path.join(ROOT, 'public/firm-logos')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

// -- who still needs a mark ---------------------------------------------------
// Read with regexes rather than by importing the module: firms-data.ts is
// TypeScript and this script runs on bare node. The fields wanted are all
// single-quoted literals on their own line, so this is reliable enough for a
// developer tool, and a miss shows up immediately as a firm that is not listed.
const src = fs.readFileSync(DATA, 'utf8')

const localOnly = new Set(
  [...(src.match(/const LOCAL_ONLY_LOGO = new Set\(\[[\s\S]*?\]\)/)?.[0] ?? '')
    .matchAll(/^\s*'([a-z0-9-]+)',/gm)].map(m => m[1])
)
const onDisk = new Set(
  fs.existsSync(LOGOS) ? fs.readdirSync(LOGOS).map(f => f.replace(/\.png$/i, '')) : []
)

const records = [...src.matchAll(
  /slug: '([^']+)',\s*\n\s*logoFile: (null|'[^']*'),[\s\S]*?website: '([^']+)'/g
)].map(m => ({ slug: m[1], logoFile: m[2], website: m[3] }))

const wanted = process.argv.slice(2)
const targets = records.filter(
  r =>
    r.logoFile === 'null' &&
    !localOnly.has(r.slug) &&
    !onDisk.has(r.slug) &&
    (!wanted.length || wanted.includes(r.slug))
)

if (!targets.length) {
  console.log('Every firm already has a mark. Nothing to look for.')
  process.exit(0)
}
console.log(`${targets.length} firm(s) with no logo: ${targets.map(t => t.slug).join(', ')}`)

/** Higher is more likely to be the firm's mark. */
function score(url) {
  const u = url.toLowerCase()
  let s = 0
  if (/logo/.test(u)) s += 10
  if (/\.svg($|\?)/.test(u)) s += 3
  if (/\.png($|\?)/.test(u)) s += 2
  // Things that look like a logo but are not.
  if (/icon|favicon|sprite|search|close|menu|arrow|cookie|avatar|flag/.test(u)) s -= 12
  if (/header|brand|site[-_]?logo|main[-_]?logo/.test(u)) s += 4
  // WordPress thumbnails are downscaled copies; prefer the original.
  if (/-\d{2,4}x\d{2,4}\./.test(u)) s -= 4
  return s
}

function absolutise(src, base) {
  try {
    return new URL(src, base).href
  } catch {
    return null
  }
}

for (const { slug, website } of targets) {
  process.stdout.write(`\n=== ${slug}  (${website})\n`)
  let html
  try {
    const res = await fetch(website, {
      headers: { 'User-Agent': UA },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
      console.log(`    HTTP ${res.status} — site blocks automated fetches, source by hand`)
      continue
    }
    html = await res.text()
  } catch (e) {
    console.log(`    FETCH FAILED: ${e.message}`)
    continue
  }

  const found = new Set()

  // <img src>, including lazy-loading variants that park the real URL elsewhere.
  for (const m of html.matchAll(/<img[^>]+?(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi)) {
    const abs = absolutise(m[1], website)
    if (abs) found.add(abs)
  }
  // Inline <svg> can't be downloaded, but <use href> and CSS backgrounds can.
  for (const m of html.matchAll(/url\(["']?([^"')]+\.(?:png|svg|jpe?g|webp))["']?\)/gi)) {
    const abs = absolutise(m[1], website)
    if (abs) found.add(abs)
  }
  // og:image is often the best single asset a site exposes.
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) {
    const abs = absolutise(m[1], website)
    if (abs) found.add(`${abs}   [og:image]`)
  }

  const ranked = [...found]
    .map(u => ({ u, s: score(u) }))
    .filter(x => x.s > -5)
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)

  if (!ranked.length) {
    console.log('    no candidates found in HTML (likely a JS-rendered site)')
    continue
  }
  for (const { u, s } of ranked) console.log(`    [${String(s).padStart(3)}] ${u}`)
}
