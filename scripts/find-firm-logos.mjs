/**
 * Hunt for better logo art on each firm's own website.
 *
 * The bucket assets are unusable: only 3 of 30 exceed 600px, two are 32x32
 * favicons, and several have their background baked into the artwork. Nothing
 * downstream can fix that, so the art has to be replaced at source.
 *
 * This script only FINDS candidates; it does not overwrite anything. It fetches
 * each firm's homepage, pulls out every plausible logo URL, and scores them.
 * SVG wins outright because it is resolution-independent, which is the entire
 * problem we are solving. Otherwise bigger is better.
 *
 * Output is scripts/firm-logo-candidates.json, for review before downloading.
 *
 * Expect a meaningful failure rate. Several of these sites are JS-rendered
 * (kennapartners, unionbankng), one has an expired certificate (acas-law), and
 * a few block non-browser agents. Those get flagged for manual collection
 * rather than guessed at.
 *
 * Run: node scripts/find-firm-logos.mjs
 */

import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))

/** slug -> site to search. Corrected where firms-data had a dead domain:
 *  jee.africa (not jee.com.ng), ajumogobiaokeke.com (not ajumogobia-okeke.com),
 *  and the Dentons/DLA hosts for ACAS-Law and Olajide Oyewole. */
const SITES = {
  'acas-law': 'https://www.dentonsacaslaw.com/',
  aelex: 'https://aelex.com/',
  'aina-blankson': 'https://ainablankson.com/',
  'ajumogobia-okeke': 'https://www.ajumogobiaokeke.com/',
  'aluko-oyebode': 'https://www.aluko-oyebode.com/',
  'banwo-ighodalo': 'https://www.banwo-ighodalo.com/',
  'blackfriars-law': 'https://blackfriars-law.com/',
  'bloomfield-law': 'https://www.bloomfield-law.com/',
  'dealhq-partners': 'https://dealhqpartners.com/',
  'detail-solicitors': 'https://www.detailsolicitors.com/',
  'famsville-solicitors': 'https://famsvillesolicitors.com/',
  'g-elias': 'https://www.gelias.com/',
  'george-etomi': 'https://geplaw.com/',
  'jackson-etti-edu': 'https://jee.africa/',
  'kenna-partners': 'https://kennapartners.com/',
  'mike-igbokwe': 'https://mikeigbokwe.com/',
  'olajide-oyewole': 'https://www.dlapiperafrica.com/en/nigeria/',
  'olaniwun-ajayi': 'https://www.olaniwunajayi.net/',
  'perchstone-graeys': 'https://www.perchstoneandgraeys.com/',
  'primera-africa': 'https://primeraal.com/',
  punuka: 'https://punuka.com/',
  'resolution-law': 'https://resolutionlawng.com/',
  'simmons-cooper': 'https://www.scp-law.com/',
  'spa-ajibade': 'https://spaajibade.com/',
  'stren-blan-partners': 'https://strenandblan.com/',
  'streamsowers-kohn': 'https://sskohn.com/',
  'tayo-oyetibo': 'https://tayooyetibolaw.com/',
  templars: 'https://www.templars-law.com/',
  'udo-udoma-bello-osagie': 'https://www.uubo.org/',
  'wole-olanipekun': 'https://www.woleolanipekun.com/',
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

/** Score a candidate URL. Higher is better. */
function score(url) {
  const u = url.toLowerCase()
  let s = 0
  if (u.endsWith('.svg')) s += 100          // resolution-independent: the goal
  if (/logo/.test(u)) s += 30
  if (/header|brand|identity/.test(u)) s += 10
  if (/favicon|icon-|apple-touch|sprite/.test(u)) s -= 60   // favicons are the disease
  if (/footer/.test(u)) s -= 5
  const dim = u.match(/(\d{3,4})x(\d{3,4})/)
  if (dim) s += Math.min(40, Math.max(+dim[1], +dim[2]) / 25)
  if (/-\d{2,3}x\d{2,3}\./.test(u)) s -= 25  // WordPress downscaled variant
  return s
}

function absolutise(href, base) {
  try { return new URL(href, base).href } catch { return null }
}

async function scan(slug, site) {
  const res = await fetch(site, {
    headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  const found = new Set()

  // src=, href=, srcset= and data-src= on anything image-shaped
  for (const m of html.matchAll(/(?:src|href|data-src|data-lazy-src)\s*=\s*["']([^"']+\.(?:svg|png|webp|jpe?g))["']/gi)) {
    const abs = absolutise(m[1], site)
    if (abs) found.add(abs)
  }
  for (const m of html.matchAll(/srcset\s*=\s*["']([^"']+)["']/gi)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0]
      if (/\.(svg|png|webp|jpe?g)$/i.test(u)) {
        const abs = absolutise(u, site)
        if (abs) found.add(abs)
      }
    }
  }

  const ranked = [...found]
    .map(u => ({ url: u, score: score(u) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  // An inline <svg> in the header is common and cannot be downloaded as a file;
  // worth flagging so it gets collected by hand rather than silently missed.
  const inlineSvg = /<svg[^>]*(class|id)="[^"]*logo/i.test(html)

  return { ranked, inlineSvg }
}

const results = {}
const entries = Object.entries(SITES)

for (const [slug, site] of entries) {
  try {
    const { ranked, inlineSvg } = await scan(slug, site)
    results[slug] = { site, candidates: ranked, inlineSvg }
    const best = ranked[0]
    const tag = best?.url.endsWith('.svg') ? 'SVG ' : best ? 'img ' : '--- '
    console.log(
      `${tag}${slug.padEnd(24)} ${best ? best.url.slice(0, 92) : 'no candidate' + (inlineSvg ? ' (inline <svg> in header)' : '')}`
    )
  } catch (err) {
    results[slug] = { site, error: err.message, candidates: [] }
    console.log(`ERR ${slug.padEnd(24)} ${err.message}`)
  }
}

await writeFile(path.join(HERE, 'firm-logo-candidates.json'), JSON.stringify(results, null, 2))

const withSvg = Object.values(results).filter(r => r.candidates?.[0]?.url.endsWith('.svg')).length
const withAny = Object.values(results).filter(r => r.candidates?.length).length
console.log(`\n${withSvg} firms have an SVG candidate.`)
console.log(`${withAny}/${entries.length} have any candidate. ${entries.length - withAny} need collecting by hand.`)
console.log('Written to scripts/firm-logo-candidates.json')
