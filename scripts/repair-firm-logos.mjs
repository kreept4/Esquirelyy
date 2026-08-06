/**
 * Three logo repairs that could not be solved by downloading a better file.
 *
 * AJUMOGOBIA. The asset their site serves is a social avatar: a 225x225 navy
 * square with the wordmark small in the middle and decorative navy filling the
 * rest. Scaled into a directory frame the wordmark ends up a few pixels tall and
 * the card reads as a plain dark tile. Their site is currently unreachable, so
 * there is nothing better to fetch. Cropping to the wordmark's own bounding box
 * turns the same file into a legible white-on-navy strip.
 *
 * IKEYI SHITTU. isc.ng publishes exactly one mark and it is pure white for
 * their dark header. White artwork on a cream card is an invisible card. The
 * mark is monochrome, so inverting the colour channels while leaving alpha
 * alone reconstructs the dark version of the same logo rather than inventing
 * anything: it is the file the firm would hand you for use on light stock.
 *
 * GIWA-OSAGIE. Their header mark is not in the served HTML, but the site does
 * carry the logo as an uploaded image. Small, so it is upscaled on a clean
 * background.
 *
 * Run: node scripts/repair-firm-logos.mjs
 */

import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public', 'firm-logos')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

/** Mean luminance of the non-transparent pixels. */
async function inkBrightness(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let sum = 0
  let n = 0
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] < 32) continue
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    n++
  }
  return n ? sum / n : 0
}

/**
 * Bounding box of pixels brighter than `threshold`.
 *
 * Used to find white lettering sitting on a dark field, which is the one thing
 * sharp's own trim cannot do: trim keys off the border colour and would happily
 * return the whole navy square.
 */
async function lightInkBounds(buf, threshold = 170) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels
      if (data[i + 3] < 32) continue
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
      if (lum < threshold) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  if (maxX < 0) return null
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
}

const report = []

/* ---------- Ajumogobia: crop to the wordmark ---------- */
try {
  const src = path.join(OUT, 'ajumogobia-okeke.png')
  const before = await sharp(src).metadata()
  const box = await lightInkBounds(await sharp(src).png().toBuffer())
  if (!box) throw new Error('no light lettering found')

  // Breathing room around the letterforms so the crop does not look shaved,
  // clamped to the source so extract() cannot run off the edge.
  const padX = Math.round(box.width * 0.08)
  const padY = Math.round(box.height * 0.35)
  const left = Math.max(0, box.left - padX)
  const top = Math.max(0, box.top - padY)
  const width = Math.min(before.width - left, box.width + padX * 2)
  const height = Math.min(before.height - top, box.height + padY * 2)

  const out = await sharp(src)
    .extract({ left, top, width, height })
    // Upscale: the source is only 225px square, so the cropped strip is small.
    .resize({ width: Math.max(900, width * 4), fit: 'inside', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer()

  const m = await sharp(out).metadata()
  await writeFile(src, out)
  report.push(`ajumogobia-okeke   ${before.width}x${before.height} -> ${m.width}x${m.height}  (cropped to wordmark)`)
} catch (e) {
  report.push(`ajumogobia-okeke   FAILED: ${e.message}`)
}

/* ---------- Ikeyi Shittu: invert the white mark ---------- */
try {
  const res = await fetch('https://isc.ng/wp-content/uploads/2019/01/Logo.png', {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  let buf = Buffer.from(await res.arrayBuffer())

  buf = await sharp(buf).png().toBuffer()
  try { buf = await sharp(buf).trim({ threshold: 12 }).png().toBuffer() } catch {}

  // negate the colour channels, leave alpha untouched so the mark keeps its
  // transparent surround.
  const out = await sharp(buf).negate({ alpha: false }).png({ compressionLevel: 9 }).toBuffer()

  const m = await sharp(out).metadata()
  const lum = await inkBrightness(out)
  await writeFile(path.join(OUT, 'ikeyi-shittu.png'), out)
  report.push(`ikeyi-shittu       ${m.width}x${m.height}  lum ${lum.toFixed(0)}  (inverted from the white variant)`)
} catch (e) {
  report.push(`ikeyi-shittu       FAILED: ${e.message}`)
}

/* ---------- Giwa-Osagie ---------- */
try {
  const res = await fetch(
    'https://www.giwa-osagie.com/wp-content/uploads/2019/10/Screen-Shot-2019-10-24-at-16.31.51.png',
    { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) }
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  let buf = Buffer.from(await res.arrayBuffer())

  buf = await sharp(buf).png().toBuffer()
  try { buf = await sharp(buf).trim({ threshold: 18 }).png().toBuffer() } catch {}

  const pre = await sharp(buf).metadata()
  const out = await sharp(buf)
    .resize({ width: Math.max(600, pre.width * 5), fit: 'inside', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer()

  const m = await sharp(out).metadata()
  const lum = await inkBrightness(out)
  await writeFile(path.join(OUT, 'giwa-osagie.png'), out)
  report.push(`giwa-osagie        ${pre.width}x${pre.height} -> ${m.width}x${m.height}  lum ${lum.toFixed(0)}`)
} catch (e) {
  report.push(`giwa-osagie        FAILED: ${e.message}`)
}

/* ---------- Blackfriars: upscale ---------- */
try {
  /* Their site serves exactly one logo file, at 537x125, and there is no
   * higher-resolution version to fetch. At that size the browser is doing the
   * resampling on a mark that contains a very fine tagline, which is what reads
   * as blurry. Resampling once here with lanczos3 gives the browser a source it
   * only ever has to reduce, which is the sharper direction to scale in. It
   * cannot invent detail the original never had. */
  const src = path.join(OUT, 'blackfriars-law.png')
  const pre = await sharp(src).metadata()
  if (pre.width >= 1400) {
    report.push(`blackfriars-law    already ${pre.width}x${pre.height}, left alone`)
  } else {
    const out = await sharp(src)
      .resize({ width: 1600, fit: 'inside', kernel: 'lanczos3' })
      .png({ compressionLevel: 9 })
      .toBuffer()
    const m = await sharp(out).metadata()
    await writeFile(src, out)
    report.push(`blackfriars-law    ${pre.width}x${pre.height} -> ${m.width}x${m.height}  (upscaled, no better source exists)`)
  }
} catch (e) {
  report.push(`blackfriars-law    FAILED: ${e.message}`)
}

console.log(report.join('\n'))
console.log('\nStill unresolved: lekan-bamidele (lbandcolaw.com returns 403 to any')
console.log('automated request; the art needs saving by hand from a browser).')
