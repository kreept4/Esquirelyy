/**
 * Turn up logo candidates for the twelve firms added on 2026-08-05.
 *
 * Deliberately a lister, not a downloader. The last pass at automatic scoring
 * (find-firm-logos.mjs) confidently nominated searchicon.svg, close.svg and a
 * cookie-banner asset as firm marks, so this prints what it finds and a human
 * picks. Candidates are ordered by how logo-ish the URL looks, but the ranking
 * is a hint, not a decision.
 *
 * Run: node scripts/find-new-firm-logos.mjs
 */

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

const SITES = {
  'alliance-law-firm': 'https://alliancelawfirm.ng/',
  'dd-dodo': 'https://dddodo.com/',
  'doa-law': 'https://www.doa-law.com/',
  'giwa-osagie': 'https://www.giwa-osagie.com/',
  'ikeyi-shittu': 'https://isc.ng/',
  'lekan-bamidele': 'https://lbandcolaw.com/',
  'odujinrin-adefulu': 'https://odujinrinadefulu.com/',
  omaplex: 'https://omaplex.com.ng/',
  'paul-usoro': 'https://paulusoro.com/',
  pavestones: 'https://pavestoneslegal.com/',
  'sofunde-osakwe': 'https://sooblaw.com/',
  'the-new-practice': 'https://tnp.com.ng/',
}

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

for (const [slug, site] of Object.entries(SITES)) {
  process.stdout.write(`\n=== ${slug}  (${site})\n`)
  let html
  try {
    const res = await fetch(site, { headers: { 'User-Agent': UA }, redirect: 'follow' })
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
    const abs = absolutise(m[1], site)
    if (abs) found.add(abs)
  }
  // Inline <svg> can't be downloaded, but <use href> and CSS backgrounds can.
  for (const m of html.matchAll(/url\(["']?([^"')]+\.(?:png|svg|jpe?g|webp))["']?\)/gi)) {
    const abs = absolutise(m[1], site)
    if (abs) found.add(abs)
  }
  // og:image is often the best single asset a site exposes.
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) {
    const abs = absolutise(m[1], site)
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
