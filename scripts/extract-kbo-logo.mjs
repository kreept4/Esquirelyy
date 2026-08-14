/**
 * Kehinde Babatola Olofinmoyo LP's mark, cut out of their recruitment flier.
 *
 * The firm publishes no website we can find, so the flier is the only artwork
 * that exists for them. Without this the board and the ball pit would both fall
 * back to initials — and the initials helper would produce "KO" from "Kehinde
 * Babatola Olofinmoyo", dropping the middle name it filters out as short, which
 * is not what the firm calls itself.
 *
 * ⚠ THE MONOGRAM ONLY, NOT THE FULL LOCKUP. Same decision as
 * extract-ovie-logo.mjs and the World Bank entry in firms-data.ts, and the
 * measurements say it louder here than in either of those. The lockup is four
 * tiers, and keying then reading ink extent per row puts them at:
 *
 *   y  51-133   the KBO monogram          83px tall
 *   y 151-164   KEHINDE BABATOLA OLOFINMOYO LP
 *   y 181-196   Litigation & Corporate Practice
 *   y 210-211   the rule under the lockup
 *
 * A mark gets about 37px of height on the board. The wordmark tier is already
 * only 14px of the 160px lockup, so at board size it lands under 4px and the
 * tagline under it disappears entirely. The monogram is the only tier that
 * survives, and both surfaces print the employer's name in text beside the mark
 * anyway.
 *
 * BOUNDS WERE MEASURED, NOT EYEBALLED. There are 17 blank rows between the
 * monogram and the wordmark, so unlike the Ovie flier the two do not touch and
 * the crop has room either side. The box below is the monogram's own ink extent
 * with a few pixels of margin; trim() only tightens what is left.
 *
 * WHY THIS DOES NOT USE keyWhite(). That helper treats anything above channel
 * 247 as background, and this flier's ground is 235 — it is a photograph of a
 * lit wall, not a flat white plate, so nothing in the crop would key at all and
 * the mark would ship on an opaque grey tile. The ramp is written here with the
 * measured values instead, and every output pixel is repainted in the firm's own
 * navy rather than carrying its sampled colour: the mark is single-colour, so
 * normalising it removes the JPEG chroma noise that would otherwise leave
 * coloured fringes on the letter edges at ball-pit size.
 *
 * Run: node scripts/extract-kbo-logo.mjs [path-to-flier]
 * Idempotent — re-running overwrites the PNG.
 */

import sharp from 'sharp'
import { existsSync } from 'node:fs'

const FLIER = process.argv[2] || 'C:/Users/Barr. Tobi Ogunleye/Downloads/IMG_1844.jpeg'
const OUT = 'public/employer-logos/kbo-legal.png'

/** Measured off the flier at its native 1125x1089. See the header. */
const BOX = { left: 52, top: 47, width: 212, height: 91 }

/** The flier ground inside the crop. Above this a pixel is fully transparent. */
const GROUND = 228
/** Below this a pixel is fully opaque. Between the two, alpha ramps linearly. */
const INK = 120
/** The firm's navy, averaged off the darkest pixels of the monogram. */
const NAVY = [15, 31, 61]

if (!existsSync(FLIER)) {
  console.error(`Flier not found: ${FLIER}`)
  console.error('Pass the path as the first argument.')
  process.exit(1)
}

const meta = await sharp(FLIER).metadata()
if (meta.width !== 1125 || meta.height !== 1089) {
  console.error(`Expected the 1125x1089 flier, got ${meta.width}x${meta.height}.`)
  console.error('BOX above is in that image\u2019s pixels. Re-measure before running this on a resized copy.')
  process.exit(1)
}

const { data, info } = await sharp(FLIER)
  .extract(BOX)
  .raw()
  .toBuffer({ resolveWithObject: true })

const out = Buffer.alloc(info.width * info.height * 4)
for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
  // Darkest channel, not luminance: the navy is blue-dominant, so luminance
  // reads it as lighter than it is and would thin the strokes.
  const m = Math.min(data[i], data[i + 1], data[i + 2])
  const a = m >= GROUND ? 0 : m <= INK ? 255 : Math.round((255 * (GROUND - m)) / (GROUND - INK))
  out[o] = NAVY[0]
  out[o + 1] = NAVY[1]
  out[o + 2] = NAVY[2]
  out[o + 3] = a
}

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim()
  .png({ compressionLevel: 9 })
  .toFile(OUT)

/* The same readout the other logo scripts print. Reversed artwork shipped by
   mistake is invisible on cream and nothing else reports it. */
const { data: o2, info: i2 } = await sharp(OUT).raw().toBuffer({ resolveWithObject: true })
let sum = 0
let n = 0
for (let i = 0; i < o2.length; i += 4) {
  if (o2[i + 3] > 128) {
    sum += 0.2126 * o2[i] + 0.7152 * o2[i + 1] + 0.0722 * o2[i + 2]
    n++
  }
}

console.log(`${OUT}  ${i2.width}x${i2.height}  aspect ${(i2.width / i2.height).toFixed(2)}`)
console.log(`  opaque pixels: ${n} (${((100 * n) / (i2.width * i2.height)).toFixed(1)}%)`)
console.log(
  `  mean luminance: ${(sum / n).toFixed(1)} ${sum / n > 170 ? 'LIGHT — reject, find another source' : 'DARK — good on cream and on white'}`
)
