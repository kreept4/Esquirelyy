/**
 * Ovie Obobolo & Co's mark, cut out of their recruitment flier.
 *
 * The board and the ball pit both rendered this employer with an initials
 * fallback, because logoForEmployer found nothing: the firm is not in ALL_FIRMS
 * and had no entry in EMPLOYER_LOGOS.
 *
 * WHY THE FLIER AND NOT THE FIRM'S OWN SITE. ovieobobolo.com does publish a
 * mark, at /assets/images/logo.png, and it is the right artwork: dark art with
 * real alpha, mean luminance 108, so it would sit correctly on cream. It is also
 * 137x84 for the entire stacked lockup, which puts the wordmark at roughly six
 * pixels of cap height and the tagline below legibility. Upscaling that is just
 * inventing detail. The flier carries the same lockup at 803px wide, so the
 * monogram alone comes out at 209x153.
 *
 * (The site also answers 403 to a plain request and needs a browser User-Agent,
 * which is why fetch-new-firm-logos.mjs would not have picked it up either.)
 *
 * ⚠ THE MONOGRAM ONLY, NOT THE FULL LOCKUP, and this is the same decision the
 * World Bank entry in firms-data.ts documents. .job-mark is 4.5rem by 3rem with
 * `max-height: 78%`, so a mark on the board gets about 37px of height, and a
 * ball in the pit is around 90px. The lockup is three tiers: monogram, wordmark,
 * then a tagline in small caps. At 37px all three are mush. The monogram is
 * close to square, so it fills the space it is given, and both surfaces already
 * print the employer's name in text beside the mark, so the mark does not need
 * to carry the name.
 *
 * BOUNDS WERE MEASURED, NOT EYEBALLED. Keying first and then reading ink extent
 * per row puts the monogram at y 31-183 and the wordmark starting at y 184, with
 * no blank row between them: the two touch, so trim() on a generous crop would
 * have taken the wordmark's ascenders with it. Hence the explicit box, with a
 * few pixels of margin, and trim() only tightening what is left.
 *
 * The flier ground is 253,253,251 and keyWhite's threshold is 247, so the ground
 * keys cleanly. Do not widen the crop to the flier's outer edge: the border
 * pixels there measure 245 and would survive as a faint frame.
 *
 * Run: node scripts/extract-ovie-logo.mjs
 */

import sharp from 'sharp'
import { existsSync } from 'node:fs'
import { keyWhite } from './lib/key-white.mjs'

const FLIER = process.argv[2] || 'C:/Users/Barr. Tobi Ogunleye/Downloads/IMG_1796.jpeg'
const OUT = 'public/employer-logos/ovie-obobolo.png'

/** Measured off the keyed flier. See the header. */
const BOX = { left: 288, top: 26, width: 220, height: 163 }

if (!existsSync(FLIER)) {
  console.error(`Flier not found: ${FLIER}`)
  console.error('Pass the path as the first argument.')
  process.exit(1)
}

const cropped = await sharp(FLIER).extract(BOX).png().toBuffer()
const keyed = await keyWhite(cropped)

await sharp(keyed).trim().png({ compressionLevel: 9 }).toFile(OUT)

/* The same readout fetch-new-firm-logos.mjs prints, for the same reason: it is
   the guard against shipping reversed art that is invisible on a light ground.
   Anything above about 170 here needs a different source, not a different
   background. */
const { data, info } = await sharp(OUT).raw().toBuffer({ resolveWithObject: true })
let sum = 0
let n = 0
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] > 128) {
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    n++
  }
}

console.log(`${OUT}  ${info.width}x${info.height}`)
console.log(`  opaque pixels: ${n} (${((100 * n) / (info.width * info.height)).toFixed(1)}%)`)
console.log(`  mean luminance: ${(sum / n).toFixed(1)} ${sum / n > 170 ? 'LIGHT — reject, find another source' : 'DARK — good on cream and on white'}`)
