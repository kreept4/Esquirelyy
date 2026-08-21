/**
 * The Esquirely mark as raster PNGs, for the two consumers that cannot take an
 * SVG and the one that can but should not have to.
 *
 * ============================================================
 * WHY THIS EXISTS
 * ============================================================
 *
 * The site shipped exactly one icon: src/app/icon.svg, through Next's file
 * convention. That produces `<link rel="icon" href="/icon.svg?icon.<hash>.svg">`
 * and nothing else, which fails Google's favicon rules in two places at once.
 *
 *   THE URL IS NOT STABLE. Google's requirement is literally "The favicon URL
 *   must be stable (don't change the URL frequently)". Next appends a content
 *   hash, so every edit to the mark moves the URL, and Google recrawls favicons
 *   on its own schedule of days to weeks. A file in /public has no hash.
 *
 *   SVG IS NOT LISTED AS SUPPORTED. Google's documented set is "any valid
 *   favicon format", and its own examples are raster. It may well work; it is
 *   not worth being the site that finds out, when a PNG costs nothing.
 *
 * And `Organization.logo` in layout.tsx had no image at all, which is the
 * property the site logo in search is actually built from. Its requirement is
 * 112x112 minimum, crawlable, and legible on a white background.
 *
 * ============================================================
 * WHY THE MARK IS ENCODED RATHER THAN RASTERISED
 * ============================================================
 *
 * sharp is not installed and this does not need it. The mark is four
 * axis-aligned rectangles on a solid ground, so sampling at pixel centres gives
 * an exact result at any size: every edge lands on a pixel boundary and there is
 * no partial coverage to average. A rasteriser would produce the same image with
 * a dependency and a build step attached.
 *
 * ⚠ THE GEOMETRY AND THE COLOURS ARE COPIED FROM src/app/icon.svg AND MUST
 * TRACK IT. That file's own comment records where they came from: the numbers
 * were read off the supplied logo by scanning its ink mask rather than redrawn
 * by eye, and the colours were sampled from the file (#FCB712 ground, #1D1910
 * ink) rather than taken from the design tokens, which are close but not equal.
 * If the SVG changes, re-run this. They are not imported from it because
 * parsing an SVG to avoid retyping four rects is the more fragile of the two.
 *
 * ============================================================
 * THE FOUR OUTPUTS
 * ============================================================
 *
 *   logo.png             512. Organization.logo, well past the 112 minimum,
 *                        and big enough that a consumer scaling it down never
 *                        has to invent detail.
 *   icon-192.png         192. rel="icon". A multiple of 48, which is the size
 *                        Google's favicon guidance is written around.
 *   apple-touch-icon.png 180. The iOS convention size, and one of the three rel
 *                        values Google accepts as a favicon source.
 *   favicon.ico          16, 32 and 48 in one file. Nothing in the HTML points
 *                        at it, and that is the point: crawlers and feed
 *                        readers request /favicon.ico by convention whether or
 *                        not it is declared, and ours answered 404. A 404 is a
 *                        signal in its own right, and it costs nothing to
 *                        remove that variable while waiting on a favicon crawl
 *                        that already takes days to weeks.
 *
 * All four are opaque. A favicon sits on unknown chrome and the ground is part
 * of the mark, so transparency would only let a dark toolbar eat the amber.
 *
 * Run: node scripts/make-logo-pngs.mjs
 * Deterministic. Re-running writes byte-identical files.
 */

import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

/* Read off src/app/icon.svg. See the warning above before editing. */
const GROUND = [0xfc, 0xb7, 0x12]
const INK = [0x1d, 0x19, 0x10]
/* x, y, width, height, in the SVG's 100x100 user space. Stem, then the three
   arms, which really are three different lengths in the supplied file. */
const BARS = [
  [28, 21, 12, 59],
  [28, 21, 43, 11],
  [28, 44, 34, 12],
  [28, 68, 46, 12],
]

/** CRC-32, as PNG defines it. Table built once rather than per chunk. */
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/** A PNG chunk: length, type, data, CRC over type and data. */
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

/**
 * The mark at `size`, as an 8-bit RGB PNG.
 *
 * Colour type 2, not 6: the image is opaque by design, so an alpha channel
 * would be a fourth byte per pixel that is 255 every time.
 */
function render(size) {
  const scale = 100 / size
  /* One filter byte per scanline, then RGB triples. Filter 0 (None) throughout:
     the image is long runs of one colour, which deflate already handles, and a
     predictor would only make the stream harder to reason about. */
  const raw = Buffer.alloc(size * (1 + size * 3))

  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 3)
    raw[rowStart] = 0
    /* Pixel centres, which is what makes the edges exact. Sampling the corner
       would put every edge half a pixel out and the error would show at 16px. */
    const uy = (y + 0.5) * scale
    for (let x = 0; x < size; x++) {
      const ux = (x + 0.5) * scale
      const inInk = BARS.some(([bx, by, bw, bh]) => ux >= bx && ux < bx + bw && uy >= by && uy < by + bh)
      const [r, g, b] = inInk ? INK : GROUND
      const p = rowStart + 1 + x * 3
      raw[p] = r
      raw[p + 1] = g
      raw[p + 2] = b
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // colour type: truecolour, no alpha
  ihdr[10] = 0 // deflate
  ihdr[11] = 0 // adaptive filtering
  ihdr[12] = 0 // no interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const OUTPUTS = [
  ['public/logo.png', 512],
  ['public/icon-192.png', 192],
  ['public/apple-touch-icon.png', 180],
]

for (const [path, size] of OUTPUTS) {
  const png = render(size)
  writeFileSync(path, png)
  console.log(`${path.padEnd(28)} ${size}x${size}  ${png.length} bytes`)
}

/**
 * The mark as an .ico, at 16, 32 and 48.
 *
 * ⚠ BMP PAYLOADS, NOT PNG-IN-ICO. An .ico entry may legally hold either, and
 * PNG entries are smaller and understood by every current browser. They are
 * also the newer of the two conventions, and this file exists precisely for the
 * old, dumb clients that ask for /favicon.ico without being told to. Writing
 * the format those clients have always understood is the whole point of
 * bothering. It costs about 15KB against roughly 3KB for PNG entries, which is
 * not a number worth optimising for a file requested once per crawl.
 *
 * The BMP inside an .ico has two quirks that make it not quite a BMP file:
 * its declared height is DOUBLE the real height, because the structure carries
 * a colour image and a 1-bit AND mask stacked, and its rows run bottom-up. The
 * mark is fully opaque so the AND mask is all zeroes, but it still has to be
 * present and still has to be padded to a 4-byte row stride.
 */
function icoEntry(size) {
  const scale = 100 / size
  const header = Buffer.alloc(40)
  header.writeUInt32LE(40, 0)          // biSize
  header.writeInt32LE(size, 4)         // biWidth
  header.writeInt32LE(size * 2, 8)     // biHeight, doubled. See above.
  header.writeUInt16LE(1, 12)          // biPlanes
  header.writeUInt16LE(32, 14)         // biBitCount, BGRA
  header.writeUInt32LE(0, 16)          // biCompression, none

  const xor = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    const uy = (y + 0.5) * scale
    /* Bottom-up: row 0 of the buffer is the LAST row of the image. */
    const dest = (size - 1 - y) * size * 4
    for (let x = 0; x < size; x++) {
      const ux = (x + 0.5) * scale
      const inInk = BARS.some(([bx, by, bw, bh]) => ux >= bx && ux < bx + bw && uy >= by && uy < by + bh)
      const [r, g, b] = inInk ? INK : GROUND
      const p = dest + x * 4
      xor[p] = b; xor[p + 1] = g; xor[p + 2] = r; xor[p + 3] = 255
    }
  }

  /* All zero: every pixel opaque. Row stride padded to 4 bytes. */
  const maskStride = Math.ceil(size / 8 / 4) * 4
  const mask = Buffer.alloc(maskStride * size)

  return Buffer.concat([header, xor, mask])
}

const ICO_SIZES = [16, 32, 48]
const entries = ICO_SIZES.map(icoEntry)

const dir = Buffer.alloc(6 + 16 * entries.length)
dir.writeUInt16LE(0, 0)                 // reserved
dir.writeUInt16LE(1, 2)                 // type 1 = icon
dir.writeUInt16LE(entries.length, 4)
let offset = dir.length
entries.forEach((buf, i) => {
  const e = 6 + i * 16
  const size = ICO_SIZES[i]
  dir[e] = size === 256 ? 0 : size      // width
  dir[e + 1] = size === 256 ? 0 : size  // height
  dir[e + 2] = 0                        // palette count
  dir[e + 3] = 0                        // reserved
  dir.writeUInt16LE(1, e + 4)           // colour planes
  dir.writeUInt16LE(32, e + 6)          // bits per pixel
  dir.writeUInt32LE(buf.length, e + 8)
  dir.writeUInt32LE(offset, e + 12)
  offset += buf.length
})

const ico = Buffer.concat([dir, ...entries])
writeFileSync('public/favicon.ico', ico)
console.log(`${'public/favicon.ico'.padEnd(28)} ${ICO_SIZES.join('/')}  ${ico.length} bytes`)
