/**
 * Olajide Oyewole LLP's mark, replaced with the DLA Piper Africa lockup.
 *
 * WHAT WAS THERE BEFORE, AND WHY IT HAD TO GO. /firm-logos/olajide-oyewole.png
 * was a 152x152 crop of a blue-violet crescent — the counter of the DLA Piper
 * "C" and nothing else, in a hue (#333391) the firm does not use. It read as a
 * deliberate abstract mark rather than as a broken crop, which is exactly why it
 * survived: the card rendered, the build passed, and nothing reported that one
 * firm in sixty seven was wearing a fragment of somebody's logo. Same failure
 * mode bloomfield-law had, documented in LOCAL_ONLY_LOGO.
 *
 * WHICH OF THE TWO MARKS THIS IS. The firm's own site header carries both: the
 * DLA Piper Africa navy lockup on the left, and an "OLAJIDE OYEWOLE LLP"
 * wordmark on the right. The wordmark is the wrong choice here for the reason
 * the World Bank and Ovie Obobolo entries in firms-data.ts both give — a mark
 * gets about 37px of height on the board and around 90px in the ball pit, and a
 * 301x86 (3.5:1) wordmark clamps to roughly a fifth of a ball's height and
 * becomes a smear. The DLA Piper Africa lockup is 56.46x47.12, near enough
 * square to fill the space it is given, and it is the mark a Nigerian lawyer
 * actually recognises the firm by. Both surfaces already print the employer's
 * name in text beside the mark, so the mark does not have to carry the name.
 *
 * THE ARTWORK IS SINGLE-COLOUR NAVY ON TRANSPARENCY, and the "AFRICA" band is a
 * knockout rather than white ink — the letters are holes in a navy bar. That is
 * why this is rasterised straight from the SVG with no white keying: keyWhite
 * would find nothing to key, and there is no white in the file to punch through.
 * It also means the band's letters take the colour of whatever the mark is laid
 * on, which is correct on cream, on the white ticker plate and on a pit ball
 * alike.
 *
 * 600dpi then trim, matching the bloomfield-law treatment: the SVG carries no
 * padding worth speaking of, but trim() costs nothing and guarantees the PNG's
 * box is the mark's own ink, which is what BallMark measures its aspect from.
 *
 * Run: node scripts/fetch-dla-piper-logo.mjs
 * Idempotent — overwrites the PNG with the same bytes on a re-run.
 */

import sharp from 'sharp'

const SRC =
  'https://www.dlapiperafrica.com/export/system/modules/com.dlapiper.africa/resources/img/logos/dla-piper-africa-navy.svg'
const OUT = 'public/firm-logos/olajide-oyewole.png'

/* A browser User-Agent. The site answers a bare fetch, but every other asset
   fetch in this repo carries one and an inconsistent script is the one that
   breaks the day the CDN tightens up. */
const res = await fetch(SRC, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
if (!res.ok) {
  console.error(`Could not fetch the lockup: ${res.status} ${res.statusText}`)
  process.exit(1)
}
const svg = Buffer.from(await res.arrayBuffer())

/* Sanity check before rasterising. If the site ever swaps this path for the
   reversed (white) variant the render would come out invisible on cream, and a
   silent invisible logo is the exact bug this file exists to fix. The navy is
   #16253f and it is the only fill in the artwork. */
const text = svg.toString('utf8')
if (!/fill="#16253f"/i.test(text)) {
  console.error('The fetched SVG does not carry the expected navy fill (#16253f).')
  console.error('The site may have changed the artwork. Look at it before shipping it.')
  process.exit(1)
}

await sharp(svg, { density: 600 }).png({ compressionLevel: 9 }).toFile(OUT + '.tmp')
await sharp(OUT + '.tmp').trim().png({ compressionLevel: 9 }).toFile(OUT)
await sharp(OUT).metadata() // forces the write to land before the unlink below
const { rmSync } = await import('node:fs')
rmSync(OUT + '.tmp', { force: true })

/* The same readout fetch-new-firm-logos.mjs and extract-ovie-logo.mjs print,
   for the same reason: it is the guard against shipping reversed art that is
   invisible on a light ground. */
const { data, info } = await sharp(OUT).raw().toBuffer({ resolveWithObject: true })
let sum = 0
let n = 0
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] > 128) {
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    n++
  }
}

console.log(`${OUT}  ${info.width}x${info.height}  aspect ${(info.width / info.height).toFixed(2)}`)
console.log(`  opaque pixels: ${n} (${((100 * n) / (info.width * info.height)).toFixed(1)}%)`)
console.log(
  `  mean luminance: ${(sum / n).toFixed(1)} ${sum / n > 170 ? 'LIGHT — reject, find another source' : 'DARK — good on cream and on white'}`
)
