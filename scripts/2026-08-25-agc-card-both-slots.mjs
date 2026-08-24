/**
 * Rebuild the NBA AGC card so it survives BOTH photo slots uncropped.
 *
 * Reported on mobile: the Beyond Limits artwork looked cut off.
 *
 * ============================================================
 * WHY, AND WHY THE FIX IS NOT IN THE CSS
 * ============================================================
 *
 * `.news-photo` is `object-fit: cover` at two different aspect ratios:
 *
 *   desktop   4 / 3.4  = 1.176, object-position center 18%
 *   <=640px   3 / 2    = 1.500, object-position center 22%
 *
 * Both numbers were chosen for the Badejo-Okusanya slide, which is a PORTRAIT
 * OF A PERSON. The globals.css note says so in terms: 3:2 "keeps the face whole"
 * and the 22% pushes the crop up because a head sits near the top of a frame.
 *
 * The first version of this card was cut to 694x590, which is 1.176: an exact
 * match for the desktop slot and nothing like the mobile one. At 1.5 the browser
 * scales to fill the width and throws away the top and bottom, and then
 * object-position 22% slides what is left upward. The "Limits" wordmark went
 * over the bottom edge. Exactly the symptom reported.
 *
 * ⚠ THE OBVIOUS FIX IS TO CHANGE THE MOBILE RULE, AND IT IS THE WRONG ONE.
 * Those two values are load-bearing for the portrait, and the note above them
 * records that they were arrived at after a 2:1 letterbox cropped through the
 * top of the head and the chin at once. Retuning them for a graphic would break
 * the slide they were written for, and adding a second class to special-case
 * one card means the next card added has to know which class it is.
 *
 * So the ASSET is made to fit both slots instead, and the CSS is untouched.
 *
 * ============================================================
 * HOW: BUILD AT THE WIDEST RATIO, PAD WITH THE ART'S OWN GROUND
 * ============================================================
 *
 * The canvas is 3:2, the wider of the two slots, so the mobile slot matches it
 * exactly and crops nothing at all. The desktop slot is NARROWER at 1.176, so
 * `cover` there scales to fill the height and crops the SIDES.
 *
 * That is the whole trick: on this card the sides are padding and the middle is
 * the lockup, so a horizontal crop removes only what was added. A vertical crop
 * would have removed the artwork, which is what was happening before.
 *
 * ⚠ THE PADDING IS A BLURRED COPY OF THE ART, NOT A FLAT GREEN. The card's
 * ground is a gradient, so a solid fill sampled from one edge bands visibly
 * against it wherever the gradient has moved on. Scaling the same image up to
 * cover the canvas and blurring it gives a surround that agrees with the
 * artwork at every point along the seam, because it IS the artwork.
 *
 * Because the ratios are close (1.176 against 1.5) the padding is thin, and on
 * desktop most of it is cropped away again.
 *
 * Run: node scripts/2026-08-25-agc-card-both-slots.mjs <path-to-source.png>
 *
 * The source is the conference's own identity card, agc-favicon2.png from
 * https://agc.nigerianbar.org.ng/agc/assets/agc-favicon2.png (694x716, RGBA).
 * Re-download it if the scratchpad copy is gone.
 */

import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '..', 'public', 'news', 'nba-agc-2026-beyond-limits.jpg')

const source = process.argv[2]
if (!source || !existsSync(source)) {
  console.error('usage: node scripts/2026-08-25-agc-card-both-slots.mjs <path-to-agc-favicon2.png>')
  console.error('Source: https://agc.nigerianbar.org.ng/agc/assets/agc-favicon2.png')
  process.exit(1)
}

/* 3:2, the wider of the two slots. See the header. */
const W = 1200
const H = 800

const meta = await sharp(source).metadata()
console.log(`source : ${meta.width}x${meta.height}`)

/* The art, flattened onto its own dark ground first so the transparent PNG does
   not composite as black, then scaled to fill the canvas HEIGHT. Height rather
   than width, because the vertical is the axis that must never be cropped. */
const art = await sharp(source)
  .flatten({ background: '#0d2b16' })
  .resize({ height: H, fit: 'inside', withoutEnlargement: false })
  .toBuffer()
const artMeta = await sharp(art).metadata()
console.log(`art    : ${artMeta.width}x${artMeta.height} centred on a ${W}x${H} canvas`)
console.log(`padding: ${Math.round((W - artMeta.width) / 2)}px each side, blurred from the art itself`)

/* The surround. Same image, scaled to COVER the canvas so it has no edges of
   its own, then blurred past the point where any detail reads. */
const backdrop = await sharp(source)
  .flatten({ background: '#0d2b16' })
  .resize({ width: W, height: H, fit: 'cover', position: 'centre' })
  .blur(34)
  .toBuffer()

const out = await sharp(backdrop)
  .composite([{ input: art, gravity: 'centre' }])
  .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
  .toBuffer()

await sharp(out).toFile(OUT)
const final = await sharp(out).metadata()

console.log(`\nwrote ${OUT}`)
console.log(`      ${final.width}x${final.height}, ratio ${(final.width / final.height).toFixed(3)}, ${(out.length / 1024).toFixed(1)}kB`)
console.log('\nWhat each slot now does to it:')
console.log(`  mobile  3/2   = 1.500  exact match, nothing cropped`)
console.log(`  desktop 4/3.4 = 1.176  crops ${Math.round((W - H * (4 / 3.4)) / 2)}px off each side, all of it padding`)
console.log('\nCheck the lockup is whole at both widths, and that the blurred')
console.log('surround does not band against the card’s own gradient.')
