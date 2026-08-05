/**
 * Download logo art for the twelve firms added on 2026-08-05.
 *
 * URLs hand-picked from the output of find-new-firm-logos.mjs. The scoring
 * there is a hint; these were checked by eye against what each site actually
 * shows in its header, and the usual traps were skipped: client logos on the
 * "our clients" strip (Chapel Hill on Odujinrin, Chambers and IFLR award marks
 * on TNP), mobile burger icons (Ikeyi Shittu), and WordPress thumbnails where
 * the full-size original exists.
 *
 * Trim only. No background keying: on opaque art it cannot tell background
 * white from artwork white, and it eats white lettering and letterform
 * counters. That is what made an earlier pass look dead.
 *
 * The brightness readout at the end is the guard against reversed art. Several
 * of these firms publish a white-on-transparent variant for use on their dark
 * hero, and it is invisible on our cream cards. Anything flagged LIGHT needs a
 * different source, not a different background.
 *
 * Run: node scripts/fetch-new-firm-logos.mjs
 */

import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public', 'firm-logos')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

const PICKS = {
  'alliance-law-firm':
    'https://alliancelawfirm.ng/wp-content/uploads/2022/10/cropped-ALF-LOGO-alternative-e1731752809274.png',
  'dd-dodo': 'https://dddodo.com/wp-content/uploads/2021/10/logo-2021-updated.png',
  'doa-law': 'https://www.doa-law.com/wp-content/themes/doa/images/doa-logo.png',
  'odujinrin-adefulu': 'https://odujinrinadefulu.com/wp-content/uploads/2023/06/Logo_png-1.png',
  // "dark" is the dark-artwork variant, for light grounds. The "light" and
  // "white" files are the reversed pair and would vanish on cream.
  omaplex: 'https://omaplex.com.ng/wp-content/uploads/2024/08/omaplex-dark.png',
  // Next.js serves this through an image proxy on the page; the asset itself
  // sits at a plain path.
  'paul-usoro': 'https://paulusoro.com/assets/img/puc-logo.webp',
  pavestones: 'https://pavestoneslegal.com/wp-content/uploads/2018/08/newlogo-small.png',
  // Not SOOB-Logo_1i.png: the trailing "i" is the inverted pair, pure white
  // ink for their dark header, and it measured lum 221 against 76 for this one.
  'sofunde-osakwe': 'https://sooblaw.com/wp-content/uploads/2026/02/SOOB-Logo_1.png',
  'the-new-practice': 'https://tnp.com.ng/wp-content/uploads/2025/04/tnp_logo.png',
}

/* Left on the monogram placeholder:
 *   lekan-bamidele  lbandcolaw.com returns 403 to any automated request. Not
 *                   worked around; the art needs saving by hand from a browser.
 *   giwa-osagie     the header mark is not in the served HTML (inline SVG or
 *                   injected), so nothing to point at yet.
 *   ikeyi-shittu    isc.ng publishes exactly one mark, Logo.png, and it is pure
 *                   white for their dark header (lum 255). There is no dark
 *                   variant anywhere on the site. A white logo on our cream
 *                   card is an invisible logo, so the monogram is the honest
 *                   result until someone supplies the art. */

/** Mean luminance of the non-transparent pixels. Reversed art is nearly all
 *  white ink, so it lands high; normal dark-on-white art lands low. */
async function inkBrightness(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  let sum = 0
  let n = 0
  for (let i = 0; i < data.length; i += info.channels) {
    const a = data[i + 3]
    if (a < 32) continue // ignore transparent padding
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    n++
  }
  return n ? sum / n : 0
}

await mkdir(OUT, { recursive: true })

const report = []

for (const [slug, url] of Object.entries(PICKS)) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())

    const isSvg = url.toLowerCase().endsWith('.svg')
    const img = isSvg
      ? sharp(buf, { density: 600 }).resize({ width: 1600, fit: 'inside', withoutEnlargement: false })
      : sharp(buf)

    let out = await img.png({ compressionLevel: 9 }).toBuffer()
    try {
      out = await sharp(out).trim({ threshold: 12 }).png({ compressionLevel: 9 }).toBuffer()
    } catch {
      /* uniform image: trim throws, keep untrimmed */
    }

    const m = await sharp(out).metadata()
    const lum = await inkBrightness(out)
    await writeFile(path.join(OUT, `${slug}.png`), out)
    report.push({ slug, w: m.width, h: m.height, lum, bytes: out.length })
  } catch (err) {
    report.push({ slug, error: err.message })
  }
}

console.log('--- written ---')
for (const r of report.filter(r => !r.error).sort((a, b) => b.w * b.h - a.w * a.h)) {
  // Above ~170 the art is predominantly light and will disappear on cream.
  const flag = r.lum > 170 ? '  <-- LIGHT, re-source' : ''
  console.log(
    `${r.slug.padEnd(20)} ${(r.w + 'x' + r.h).padEnd(11)} lum ${r.lum.toFixed(0).padStart(3)}${flag}`
  )
}
const failed = report.filter(r => r.error)
if (failed.length) {
  console.log('\n--- failed ---')
  for (const r of failed) console.log(`${r.slug.padEnd(20)} ${r.error}`)
}
console.log(`\n${report.length - failed.length}/${Object.keys(PICKS).length} written.`)
