/**
 * Download the replacement logo art picked out of firm-logo-candidates.json.
 *
 * The URLs below were chosen by hand, not by the scoring in find-firm-logos.mjs.
 * That scoring over-weighted SVG and happily nominated searchicon.svg,
 * close.svg, revisit.svg and a cookie-banner asset as firm logos. The real
 * marks were further down the candidate lists.
 *
 * Only TRIM is applied. No background keying: on opaque art it cannot separate
 * background-white from artwork-white and it strips white text and letterform
 * counters, which is what made an earlier pass look dead.
 *
 * Writes to public/firm-logos/<slug>.png, replacing the assets built from the
 * old bucket files.
 *
 * Run: node scripts/fetch-firm-logos.mjs
 */

import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public', 'firm-logos')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

/** Hand-picked. `svg: true` renders at high density so the raster stays crisp. */
const PICKS = {
  'aina-blankson': 'https://ainablankson.com/wp-content/uploads/2024/06/ainablankson-logo.png',
  'ajumogobia-okeke': 'https://www.ajumogobiaokeke.com/wp-content/uploads/2018/03/aologo.png',
  'banwo-ighodalo': 'https://www.banwo-ighodalo.com/media-files/2023/04/logo-1w-1.png',
  'blackfriars-law': 'https://blackfriars-law.com/img/blackfriars-logo.png',
  'bloomfield-law': 'https://www.bloomfield-law.com/themes/custom/bloomfield/assets/images/logos/logo-new.svg',
  'dealhq-partners': 'https://dealhqpartners.com/wp-content/uploads/2018/11/LOGO.png',
  'detail-solicitors': 'https://www.detailsolicitors.com/wp-content/uploads/2026/07/Detail_Logo_Website-1.png',
  'g-elias': 'https://www.gelias.com/images/G_Elias_Logo_-_July_-_2026_-_Black.png',
  'george-etomi': 'https://geplaw.com/wp-content/uploads/2022/05/cropped-logo.jpg',
  'kenna-partners': 'https://kennapartners.com/home/kenna-wordmark-header-compact.svg',
  'mike-igbokwe': 'https://mikeigbokwe.com/wp-content/uploads/2021/05/Mike-Igbokwe-SAN-1024x401.jpg',
  'olaniwun-ajayi': 'https://www.olaniwunajayi.net/wp-content/uploads/2024/04/oalp-logo-white-large.svg',
  'perchstone-graeys': 'https://perchstoneandgraeys.com/wp-content/uploads/2024/01/Perchstone-Graeys-Logo-1024x288.png',
  'primera-africa': 'https://primeraal.com/wp-content/uploads/2024/04/PAL_Logo-1.png',
  punuka: 'https://punuka.com/wp-content/uploads/2024/09/Punuka_logo_whitebg-1024x367.png',
  'spa-ajibade': 'https://spaajibade.com/wp-content/uploads/2026/07/OFFICIAL-SPA-AJIBADE-LOGO-02-1024x191-1.png',
  'stren-blan-partners': 'https://strenandblan.com/storage/2022/09/SB-logo-2.jpg',
  'streamsowers-kohn': 'https://sskohn.com/wp-content/uploads/2024/03/SSK_Logo_Main_web2_1.png',
  'wole-olanipekun': 'https://www.woleolanipekun.com/wp-content/themes/law_firm/assets/img/logo.svg',
}

/** Marks drawn light-on-dark. Trimming keys off the top-left pixel, which is
 *  correct either way, but these are worth flagging: they will need a dark
 *  ground or an inverted variant on cream surfaces. */
const LIGHT_ON_DARK = new Set(['olaniwun-ajayi'])

await mkdir(OUT, { recursive: true })

const report = []

for (const [slug, url] of Object.entries(PICKS)) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())

    const isSvg = url.toLowerCase().endsWith('.svg')
    // Render vectors big: this is the whole reason an SVG source is preferred.
    let img = isSvg
      ? sharp(buf, { density: 600 }).resize({ width: 1600, fit: 'inside', withoutEnlargement: false })
      : sharp(buf)

    let out = await img.png({ compressionLevel: 9 }).toBuffer()
    try {
      out = await sharp(out).trim({ threshold: 12 }).png({ compressionLevel: 9 }).toBuffer()
    } catch {
      /* uniform image: trim throws, keep untrimmed */
    }

    const m = await sharp(out).metadata()
    await writeFile(path.join(OUT, `${slug}.png`), out)
    report.push({ slug, w: m.width, h: m.height, svg: isSvg, bytes: out.length })
  } catch (err) {
    report.push({ slug, error: err.message })
  }
}

console.log('--- replaced ---')
for (const r of report.filter(r => !r.error).sort((a, b) => b.w * b.h - a.w * a.h)) {
  const flag = r.svg ? 'from SVG' : ''
  const light = LIGHT_ON_DARK.has(r.slug) ? ' [light-on-dark]' : ''
  console.log(`${r.slug.padEnd(24)} ${(r.w + 'x' + r.h).padEnd(12)} ${flag}${light}`)
}
const failed = report.filter(r => r.error)
if (failed.length) {
  console.log('\n--- failed ---')
  for (const r of failed) console.log(`${r.slug.padEnd(24)} ${r.error}`)
}
console.log(`\n${report.length - failed.length}/${Object.keys(PICKS).length} replaced.`)
