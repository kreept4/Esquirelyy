/**
 * Cut the AVA Law Practice mark out of the firm's recruitment flier.
 *
 * The flier is the only artwork we have. AVA has no logo file published
 * anywhere we can point at, so the mark comes off the top-left corner of the
 * "WE'RE HIRING" graphic the firm put out, which is 1024x1280 and carries the
 * mark at roughly 50,60 in a 400x150 box.
 *
 * ============================================================
 * WHY THIS KEYS THE BACKGROUND OUT INSTEAD OF JUST TRIMMING
 * ============================================================
 *
 * extract-bfa-logo.mjs gets away with `sharp().trim()` because it is cutting
 * from artwork that is already a mark on a plate. This is a crop out of the
 * middle of a designed poster, and its background is cream, not white: the
 * corner pixel is 247,246,244. Trim alone would return a cream rectangle with a
 * logo printed on it, which is precisely the bug key-opaque-logos.mjs was
 * written to fix for eighteen other marks. LogoFrame's header states the
 * premise the whole logo system rests on, that the marks are transparent PNGs
 * cropped to their own ink, and a cream plate is visible against the carton
 * card and glaring against the black ticker band.
 *
 * ⚠ THE KEY IS UNPREMULTIPLIED, WHICH IS THE STEP THAT IS USUALLY SKIPPED.
 * Setting alpha from how far a pixel sits from the background is the easy half.
 * If you stop there, every antialiased edge pixel keeps the cream blended into
 * its RGB and the mark gets a pale halo that only shows up on the dark band,
 * which is the one surface nobody checks. So each pixel's colour is solved back
 * out of the blend: given px = ink*a + bg*(1-a), recover ink = (px - bg*(1-a))/a.
 *
 * The threshold is deliberately loose at the bottom end. The serif wordmark has
 * thin strokes and an aggressive cut eats them, so anything within 10 of the
 * background goes fully transparent and everything above 45 goes fully opaque,
 * with a ramp between. Those two numbers were read off the histogram of this
 * specific crop, not carried in from another file.
 *
 * Run: node scripts/2026-09-01-extract-ava-logo.mjs
 * Idempotent. Re-running overwrites the same file with the same bytes.
 */

import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = 'C:/Users/Barr. Tobi Ogunleye/Downloads/5871D527-0D48-4561-9391-EA60A955AAA7.png'
const OUT = path.join(HERE, '..', 'public', 'employer-logos', 'ava-law-practice.png')

const CROP = { left: 50, top: 60, width: 400, height: 150 }

/** Read off the crop's own corner rather than assumed. */
const BG = [247, 246, 244]

const { data, info } = await sharp(SRC)
  .extract(CROP)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const px = info.width * info.height

/* Distance from the plate on its furthest channel, per pixel. The mark is a
   burnt orange, so the blue channel moves most, and taking the max rather than
   the luminance keeps the thin serifs that a luminance test loses. */
const dist = new Float64Array(px)
let maxD = 0
for (let i = 0; i < px; i++) {
  const d = Math.max(BG[0] - data[i * 4], BG[1] - data[i * 4 + 1], BG[2] - data[i * 4 + 2])
  dist[i] = d
  if (d > maxD) maxD = d
}

/* ⚠ THE RAMP IS DERIVED FROM THE ARTWORK, NOT PICKED.
   The first version hardcoded LO 10 and HI 45, and 45 was wrong by a factor of
   four. Solid ink on this flier sits about 200 from the plate, so "fully opaque
   above 45" declared every pixel with a quarter coverage to be interior. Two
   things went wrong at once: the edges quantised into a hard chunky outline
   instead of a ramp, and the ink colour measured below averaged all those
   part-covered pixels in and came out as rgb(191,125,81), a washed pink-orange
   nothing like the burnt orange on the poster.
   Both numbers now come off the crop's own maximum, so the ramp spans the real
   coverage range and re-running on different artwork cannot inherit a constant
   that was only ever true for one image. */
const LO = maxD * 0.06
const HI = maxD * 0.92

/** Alpha per pixel, computed once and reused by both passes below. */
const alpha = new Float64Array(px)
for (let i = 0; i < px; i++) {
  const a = (dist[i] - LO) / (HI - LO)
  alpha[i] = a < 0 ? 0 : a > 1 ? 1 : a
}

/* ⚠ FIRST ATTEMPT UNPREMULTIPLIED EVERY PIXEL AND IT PUT A DARK RIM ON THE
   MARK, visible on the black ticker band and invisible on cream, which is the
   worst way round to get it wrong. The arithmetic is right and the problem is
   numerical: ink = (px - bg*(1-a))/a divides by a, so at the edge of a stroke
   where a is 0.05 it amplifies sensor noise by twenty and the clamp to 0..255
   resolves the overshoot downwards, toward black. Every antialiased edge picked
   up an outline.

   This mark does not need the general solution. It is one ink, a burnt orange,
   so the colour is measured once from the pixels that are certainly interior
   and every pixel is then given that colour with only its alpha varying. Edges
   come out clean by construction because there is no per-pixel colour left to
   get wrong. A two-colour mark would need the unpremultiply back. */
let ir = 0, ig = 0, ib = 0, n = 0
for (let i = 0; i < px; i++) {
  /* Measured off distance rather than off alpha, and only the pixels within a
     tenth of full ink. Sampling on alpha would sample whatever the ramp
     happened to saturate, which is the mistake that produced the washed colour
     described above. */
  if (dist[i] > maxD * 0.9) { ir += data[i * 4]; ig += data[i * 4 + 1]; ib += data[i * 4 + 2]; n++ }
}
if (!n) throw new Error('no interior pixels found, check CROP and the LO/HI ramp')
const INK = [Math.round(ir / n), Math.round(ig / n), Math.round(ib / n)]

const out = Buffer.alloc(px * 4)
for (let i = 0; i < px; i++) {
  const a = alpha[i]
  if (a === 0) continue
  out[i * 4] = INK[0]
  out[i * 4 + 1] = INK[1]
  out[i * 4 + 2] = INK[2]
  out[i * 4 + 3] = Math.round(a * 255)
}

/* trim() after keying, not before: now that the plate is alpha 0 it trims to
   the ink rather than to the edge of the crop box. */
const png = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ threshold: 1 })
  .png({ compressionLevel: 9 })
  .toBuffer()

const after = await sharp(png).metadata()
await sharp(png).toFile(OUT)

console.log('AVA Law Practice mark')
console.log(`  cropped  ${info.width}x${info.height} from the flier`)
console.log(`  trimmed  ${after.width}x${after.height}  ${png.length} bytes  alpha:${after.hasAlpha}`)
console.log(`  ink      rgb(${INK.join(", ")})`)
console.log(`  wrote    public/employer-logos/ava-law-practice.png`)
