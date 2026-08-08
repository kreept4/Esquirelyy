/**
 * Key a white background out of opaque logo art.
 *
 * WHY THIS IS SEPARATE FROM normalise-logos.mjs
 *
 * That script has an older, larger copy of this: it also detects a coloured
 * ground off the corners, because the bucket originals include marks set on
 * navy and grey. Nothing here needs that. Every source this is called on is a
 * plain JPEG of dark artwork on white, and the extra machinery is what made the
 * original risky enough to be left off by default. When somebody next has
 * reason to touch normalise-logos.mjs, its copy should be replaced by an import
 * of this file plus the colour-ground branch, and this comment deleted.
 *
 * WHAT IT CANNOT DO
 *
 * It cannot tell background white from artwork white. Run it on a mark with
 * white lettering, a white highlight, or a knocked-out counter and it will
 * punch holes in the design. Only point it at art you have looked at.
 */

import sharp from 'sharp'

/** Above this channel-minimum a pixel is treated as pure background. */
const WHITE = 247
/** Below this it is treated as pure ink. Between the two, alpha ramps. */
const INK = 225
/** Below this alpha, leave colour untouched rather than trying to recover it. */
const UNPREMULT_FLOOR = 96
/** Ceiling on the un-premultiply factor, so no channel can be flung to an
 *  extreme by a near-transparent pixel. */
const UNPREMULT_CAP = 1.8

const clamp255 = v => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v))

/**
 * @param {Buffer} input  any image sharp can read
 * @returns {Promise<Buffer>} PNG with the white ground turned transparent
 */
export async function keyWhite(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const out = Buffer.alloc(width * height * 4)

  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const srcAlpha = data[i + 3]

    // Key off the darkest channel rather than luminance: a saturated colour
    // keeps a low minimum even when one channel is blown out, so the maroon in
    // Babalakin's monogram survives where a luminance test would erode it.
    const m = Math.min(r, g, b)
    let a = m >= WHITE ? 0 : m <= INK ? 255 : Math.round(255 * ((WHITE - m) / (WHITE - INK)))
    a = Math.round((a * srcAlpha) / 255)

    if (a === 0) {
      out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0
      continue
    }

    // Un-premultiply against white to strip the pale fringe. An anti-aliased
    // edge pixel is ink blended with the ground: observed = ink*a + 255*(1-a),
    // so solving back for ink is what stops the mark wearing a halo on a
    // non-white card. Capped and floored, because 255/a explodes as alpha
    // approaches zero and throws faint pixels into false colour.
    if (a >= UNPREMULT_FLOOR) {
      const f = Math.min(255 / a, UNPREMULT_CAP)
      out[o] = clamp255((r - 255) * f + 255)
      out[o + 1] = clamp255((g - 255) * f + 255)
      out[o + 2] = clamp255((b - 255) * f + 255)
    } else {
      out[o] = r
      out[o + 1] = g
      out[o + 2] = b
    }
    out[o + 3] = a
  }

  return sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
}
