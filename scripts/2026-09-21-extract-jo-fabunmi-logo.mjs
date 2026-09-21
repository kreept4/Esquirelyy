/**
 * Cut the J.O Fabunmi & Co mark out of the LGIC competition flier.
 *
 * The flier is the only artwork we have. The firm is not in the directory and
 * publishes no logo file we can point at, so the mark comes off the white panel
 * in the top-left corner of the 1179x2556 poster.
 *
 * ============================================================
 * THE MONOGRAM ALONE, NOT THE LOCKUP
 * ============================================================
 *
 * The panel carries a circular mark above "J.O Fabunmi & Co" above "LEGAL
 * PRACTITIONERS". Cutting all three gives a 2:1 lockup, and both places this
 * file feeds are square-ish and small:
 *
 *   the board card    about 37px of height, the size the Ovie Obobolo note in
 *                     firms-data.ts says turns a stacked lockup into mush
 *   the carousel      a 6.4rem paint splash with 1rem of padding, so roughly
 *                     70px square, which is the measurement that sent the
 *                     Greenberg Traurig slide back to its monogram
 *
 * Both were rendered as the lockup first. At 70px square the wordmark is four
 * pixels tall and "LEGAL PRACTITIONERS" is a grey smear. The circle alone fills
 * the same box at full height and stays legible, which is the same call and the
 * same reasoning as the two marks named above.
 *
 * ============================================================
 * ⚠ WHY THIS MASKS A CIRCLE INSTEAD OF KEYING THE WHITE OUT
 * ============================================================
 *
 * Every other extractor here keys the background colour to transparent, and
 * doing that to this mark destroys it. The circle is navy on the left and mid
 * blue on the right, and the figure inside it is NOT drawn in ink: it is white
 * negative space, the same white as the panel behind the mark. A colour key
 * cannot tell those two whites apart, so it punches the figure clean out of the
 * middle and leaves a blue ring with a hole in it. On the cream card nobody
 * notices; on the black ticker band the hole is the background.
 *
 * So the geometry does the work the colour cannot. The mark is a circle, its
 * bounds were measured off the artwork rather than guessed, and everything
 * outside the radius goes transparent while everything inside keeps exactly the
 * pixels it had. The white figure survives because it was never touched.
 *
 * HOW THE BOUNDS WERE MEASURED. Scanning for blue ink (blue channel more than
 * 60 above red) across the panel gives the circle's box as x 176..266,
 * y 458..544. The bottom edge is the number worth recording: row 545 is the one
 * row in that region with no blue pixel at all, and the wordmark starts again
 * at 546. That empty row is the gap between the mark and the type, and it is
 * what separates them. Eyeballing put the boundary four pixels higher and
 * clipped the circle.
 *
 * ⚠ THE EDGE IS RAMPED, NOT CUT. A hard radius test aliases the circumference
 * into a staircase that is obvious at card size against cream. Alpha ramps
 * across one and a half pixels at the edge instead, which is what the eye reads
 * as a drawn curve.
 *
 * Run: node scripts/2026-09-21-extract-jo-fabunmi-logo.mjs <path to the flier>
 * Idempotent. Re-running on the same flier writes the same bytes.
 */

import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = process.argv[2]
if (!SRC) throw new Error('pass the flier path as the first argument')
const OUT = path.join(HERE, '..', 'public', 'employer-logos', 'jo-fabunmi.png')

/* Measured, not guessed. See HOW THE BOUNDS WERE MEASURED above. */
const BOX = { left: 176, right: 266, top: 458, bottom: 544 }

const cx = (BOX.left + BOX.right) / 2
const cy = (BOX.top + BOX.bottom) / 2
/* The larger half-extent, so the ramp sits just outside the ink rather than
   shaving the circumference. The two differ by a pixel because antialiased
   edge pixels fail the blue test on the lighter half of the mark. */
const R = Math.max(BOX.right - BOX.left, BOX.bottom - BOX.top) / 2 + 1

const SIDE = Math.ceil(R * 2) + 2
const LEFT = Math.round(cx - SIDE / 2)
const TOP = Math.round(cy - SIDE / 2)

const { data, info } = await sharp(SRC)
  .extract({ left: LEFT, top: TOP, width: SIDE, height: SIDE })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

/** Half-width of the antialiasing ramp, in pixels. */
const FEATHER = 0.75

const out = Buffer.from(data)
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4
    /* Pixel centres, hence the half. Measuring from the corner biases the whole
       mask half a pixel up and left, which shows as a lopsided edge. */
    const dx = x + 0.5 - (cx - LEFT)
    const dy = y + 0.5 - (cy - TOP)
    const d = Math.sqrt(dx * dx + dy * dy)
    let a = (R - d) / (FEATHER * 2) + 0.5
    a = a < 0 ? 0 : a > 1 ? 1 : a
    out[i + 3] = Math.round(a * 255)
  }
}

const png = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toBuffer()

const after = await sharp(png).metadata()
await sharp(png).toFile(OUT)

console.log('J.O Fabunmi & Co monogram')
console.log(`  circle   centre ${cx},${cy}  radius ${R.toFixed(1)}`)
console.log(`  written  ${after.width}x${after.height}  ${png.length} bytes  alpha:${after.hasAlpha}`)
console.log(`  wrote    public/employer-logos/jo-fabunmi.png`)
