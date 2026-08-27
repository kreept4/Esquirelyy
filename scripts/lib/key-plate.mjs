/**
 * Lift a monochrome mark off a flat coloured plate and redraw it in ink.
 *
 * WHY THIS EXISTS ALONGSIDE key-white.mjs
 *
 * keyWhite answers "the artwork is dark and the ground is white". This answers
 * the inverse that F.O. Akinrele publish: the artwork is WHITE and the ground is
 * a flat brand colour reaching every edge of the file. Neither of the two
 * repairs already in fetch-new-firm-logos.mjs works on that. keyWhite keys off
 * the darkest channel and would erase the lettering, which is the white here.
 * negate would keep the plate and merely recolour it, turning a brown a firm has
 * used since 1959 into a pale blue it has never used.
 *
 * WHY A MATTE AND NOT A THRESHOLD
 *
 * A threshold ("brown out, everything else in") is one line shorter and looks
 * fine until you zoom in. Every edge in this mark is anti-aliased: the pixels
 * along a letter stroke are white blended with brown in every proportion, and a
 * threshold has to assign each of them wholly to the mark or wholly to the
 * ground. The result is a serif wordmark with visibly ragged stems, which on a
 * directory card at 40px is the difference between a logo and a smudge.
 *
 * Solving for coverage instead keeps that gradient. The pixel is known to be
 * white composited over the plate at some unknown coverage a:
 *
 *     observed = 255 * a + plate * (1 - a)
 *
 * so a = (observed - plate) / (255 - plate), read on the channel where the two
 * are furthest apart, since that is where the ratio is least sensitive to the
 * source's own compression noise. That coverage becomes alpha, and the colour is
 * replaced outright with `ink` rather than recovered, because the artwork is
 * monochrome and there is nothing in it to preserve.
 *
 * WHAT IT CANNOT DO
 *
 * It assumes ONE flat ground colour and a mark drawn in a single light tone.
 * Point it at art with a gradient behind it, or with genuine colour in the mark,
 * and it will flatten both. Like keyWhite, only ever run it on art you have
 * looked at.
 */

import sharp from 'sharp'

/** Coverage below this is treated as clean ground. Just above the noise floor of
 *  a re-encoded PNG, which otherwise leaves a faint haze over the whole tile. */
const FLOOR = 0.06
/** ...and above this as solid mark, so the middle of a stroke reaches full
 *  opacity instead of stopping a few counts short of it. */
const CEIL = 0.94

const clamp255 = v => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v))

const parseHex = hex => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * @param {Buffer} input  any image sharp can read
 * @param {string} plateHex  the flat ground colour, e.g. '#845538'
 * @param {string} inkHex  what to redraw the mark in
 * @returns {Promise<Buffer>} PNG, mark in ink on transparency
 */
export async function keyPlate(input, plateHex, inkHex) {
  const plate = parseHex(plateHex)
  const ink = parseHex(inkHex)

  // The channel where plate and white are furthest apart. For a brown ground
  // that is blue, which sits at 58 against 255; red would give 132 against 255
  // and roughly half the precision for the same source noise.
  let ch = 0
  for (let c = 1; c < 3; c++) if (255 - plate[c] > 255 - plate[ch]) ch = c
  const span = 255 - plate[ch]
  if (span < 24) throw new Error(`plate ${plateHex} is too close to white to key against`)

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const out = Buffer.alloc(width * height * 4)

  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    const srcAlpha = data[i + 3]

    let cov = (data[i + ch] - plate[ch]) / span
    cov = cov <= FLOOR ? 0 : cov >= CEIL ? 1 : cov

    // Anything already transparent in the source stays transparent. The plate
    // is opaque, so this only ever affects art that arrived with a surround.
    const a = Math.round(cov * 255 * (srcAlpha / 255))
    if (a === 0) {
      out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0
      continue
    }

    out[o] = clamp255(ink[0])
    out[o + 1] = clamp255(ink[1])
    out[o + 2] = clamp255(ink[2])
    out[o + 3] = a
  }

  return sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
}
