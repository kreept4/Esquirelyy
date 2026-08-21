/**
 * Give an opaque firm mark the alpha channel LogoFrame assumes it already has.
 *
 * ============================================================
 * THE BUG THIS FIXES
 * ============================================================
 *
 * LogoFrame's header states the premise the whole logo system rests on:
 * "Floating at all is only possible because the marks are transparent PNGs
 * cropped to their own ink". Eighteen of the sixty-eight marks in
 * public/firm-logos are RGB with no alpha and no tRNS, so they are not floating.
 * They are a white rectangle with a logo printed on it, and the rectangle is
 * visible against the cream card and glaring against the black ticker band.
 *
 * Jackson, Etti & Edu is the one that got reported, because it went to the top
 * of the board on 21 August and sat in a Closing soon card next to Olajide
 * Oyewole, which IS RGBA. Side by side the difference is not subtle.
 *
 * normalise-logos.mjs was supposed to have done this and its own header even
 * names this file as a known problem case: "Jackson Etti and Punuka are palette
 * PNGs with no transparency chunk". Whatever it wrote for this mark did not
 * survive. It cannot simply be re-run, because it imports sharp and sharp is not
 * installed here.
 *
 * ============================================================
 * WHY THIS IS PURE NODE
 * ============================================================
 *
 * Installing sharp to key eighteen small PNGs means a native build on a Windows
 * box for a job that is arithmetic on a pixel buffer. zlib is in the standard
 * library and PNG's format is a header, a deflate stream and five filter types.
 * The decoder below handles 8-bit greyscale, RGB, palette, grey+alpha and RGBA,
 * non-interlaced, which covers every file in the directory.
 *
 * ============================================================
 * THE KEY, AND THE STEP EVERYONE FORGETS
 * ============================================================
 *
 * Alpha comes from how far a pixel is from white: `a = 1 - min(r,g,b)/255`.
 * Taking the MINIMUM channel rather than luminance is what keeps saturated ink
 * opaque. Pure red is (255,0,0): its luminance is high enough that a luminance
 * key would make it half transparent, while its minimum channel is 0, so it
 * stays solid. JEE's mark has red in it, so this is not hypothetical.
 *
 * Then the un-premultiply, which is step 3 in normalise-logos.mjs and the one
 * that actually decides whether this looks right:
 *
 *   observed = ink*a + 255*(1-a)   =>   ink = (observed - 255*(1-a)) / a
 *
 * An anti-aliased edge pixel is a blend of ink and the white it sat on. Set
 * alpha and stop there and every edge keeps that white, so the mark wears a pale
 * fringe on any dark ground. Solving back recovers the ink it was mixed from.
 *
 * ============================================================
 * ⚠ THE GUARD, WHICH IS WHY THIS IS SAFE TO POINT AT THE OTHER SEVENTEEN
 * ============================================================
 *
 * Keying white out of a mark that is WHITE ARTWORK ON A COLOURED GROUND deletes
 * the artwork and keeps the ground. LogoFrame's `plate` prop exists because
 * exactly that happened before: "the keyed marks came back as thin skeletons
 * with the life gone out of them".
 *
 * So this refuses to touch a file whose border is not already near-white. The
 * border is the one region guaranteed to be background on a trimmed or untrimmed
 * logo alike, and if it is dark, white is not the background colour and keying
 * it is wrong. Refusing loudly beats writing a ruined mark.
 *
 * It also refuses if keying would erase most of the image, which catches the
 * near-white-artwork case the border test alone would miss.
 *
 * ============================================================
 * WHAT IT DOES NOT DO
 * ============================================================
 *
 * It cannot invent resolution, same caveat normalise-logos.mjs carries.
 * jackson-etti-edu.png is 195x167 and that is what there is; keying it makes it
 * behave like its neighbours, not become sharper. Re-sourcing the mark from the
 * firm's own site is a separate job.
 *
 * Usage:
 *   node scripts/key-opaque-logos.mjs --list              what lacks alpha
 *   node scripts/key-opaque-logos.mjs jackson-etti-edu    key one, by slug
 *   node scripts/key-opaque-logos.mjs a b c               key several
 *
 * Writes in place. Files are in git, so `git checkout` is the undo.
 */

import { inflateSync, deflateSync } from 'node:zlib'
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'

const DIR = 'public/firm-logos'

/* ---------- PNG decode ---------- */

const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }

function readChunks(buf) {
  const out = { idat: [], plte: null, trns: null }
  let off = 8
  while (off < buf.length - 8) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('latin1', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 'IHDR') out.ihdr = data
    else if (type === 'IDAT') out.idat.push(data)
    else if (type === 'PLTE') out.plte = data
    else if (type === 'tRNS') out.trns = data
    else if (type === 'IEND') break
    off += 12 + len
  }
  return out
}

/** Undo PNG's per-scanline filters. bpp is bytes per pixel, rounded up. */
function unfilter(raw, width, height, bpp, stride) {
  const out = Buffer.alloc(height * stride)
  let pos = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++]
    const line = raw.subarray(pos, pos + stride)
    pos += stride
    const cur = out.subarray(y * stride, (y + 1) * stride)
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0
      const b = prev ? prev[i] : 0
      const c = prev && i >= bpp ? prev[i - bpp] : 0
      let v = line[i]
      switch (filter) {
        case 0: break
        case 1: v += a; break
        case 2: v += b; break
        case 3: v += (a + b) >> 1; break
        case 4: {
          const p = a + b - c
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
          v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
          break
        }
        default: throw new Error(`unknown filter ${filter}`)
      }
      cur[i] = v & 0xff
    }
  }
  return out
}

/** Decode to a flat RGBA Uint8Array. 8-bit, non-interlaced only. */
function decode(buf) {
  const { ihdr, idat, plte, trns } = readChunks(buf)
  const width = ihdr.readUInt32BE(0)
  const height = ihdr.readUInt32BE(4)
  const depth = ihdr[8]
  const colorType = ihdr[9]
  const interlace = ihdr[12]
  if (depth !== 8) throw new Error(`bit depth ${depth} not supported`)
  if (interlace !== 0) throw new Error('interlaced PNG not supported')

  const ch = CHANNELS[colorType]
  const stride = width * ch
  const raw = inflateSync(Buffer.concat(idat))
  const px = unfilter(raw, width, height, ch, stride)

  const rgba = new Uint8Array(width * height * 4)
  for (let i = 0, n = width * height; i < n; i++) {
    let r, g, b, a = 255
    if (colorType === 0) { r = g = b = px[i] }
    else if (colorType === 2) { r = px[i * 3]; g = px[i * 3 + 1]; b = px[i * 3 + 2] }
    else if (colorType === 3) {
      const idx = px[i]
      r = plte[idx * 3]; g = plte[idx * 3 + 1]; b = plte[idx * 3 + 2]
      if (trns && idx < trns.length) a = trns[idx]
    }
    else if (colorType === 4) { r = g = b = px[i * 2]; a = px[i * 2 + 1] }
    else { r = px[i * 4]; g = px[i * 4 + 1]; b = px[i * 4 + 2]; a = px[i * 4 + 3] }
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b; rgba[i * 4 + 3] = a
  }
  return { width, height, rgba, colorType }
}

/* ---------- PNG encode (RGBA) ---------- */

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(b) {
  let c = 0xffffffff
  for (const x of b) c = CRC_TABLE[(c ^ x) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
function encodeRGBA(width, height, rgba) {
  const stride = width * 4
  const raw = Buffer.alloc(height * (1 + stride))
  for (let y = 0; y < height; y++) {
    /* Filter 1 (Sub) across the row. These are flat-colour marks with long runs,
       and Sub turns a run into zeroes, which deflate then collapses. */
    const o = y * (1 + stride)
    raw[o] = 1
    for (let i = 0; i < stride; i++) {
      const v = rgba[y * stride + i]
      const left = i >= 4 ? rgba[y * stride + i - 4] : 0
      raw[o + 1 + i] = (v - left) & 0xff
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ---------- the work ---------- */

function hasAlpha(buf) {
  const { ihdr, trns } = readChunks(buf)
  const ct = ihdr[9]
  return ct === 4 || ct === 6 || (ct === 3 && !!trns)
}

/** Mean minimum-channel value around the 1px border. 255 means pure white. */
function borderWhiteness(width, height, rgba) {
  let sum = 0, n = 0
  const at = (x, y) => {
    const i = (y * width + x) * 4
    sum += Math.min(rgba[i], rgba[i + 1], rgba[i + 2]); n++
  }
  for (let x = 0; x < width; x++) { at(x, 0); at(x, height - 1) }
  for (let y = 1; y < height - 1; y++) { at(0, y); at(width - 1, y) }
  return sum / n
}

const ALPHA_KEEP = 8 // out of 255, below which a pixel counts as background

function key(file) {
  const path = `${DIR}/${file}.png`
  if (!existsSync(path)) return console.error(`  ${file}: no such file`)
  const buf = readFileSync(path)
  if (hasAlpha(buf)) return console.log(`  ${file}: already has alpha, skipped`)

  const { width, height, rgba } = decode(buf)

  /* ⚠ The guard. See the header. */
  const bw = borderWhiteness(width, height, rgba)
  if (bw < 230) {
    return console.error(
      `  ${file}: REFUSED. Border averages ${bw.toFixed(0)}/255, so white is not ` +
      `the background. Keying it would delete the artwork, not the ground.`
    )
  }

  const out = new Uint8Array(width * height * 4)
  let inkPixels = 0
  for (let i = 0, n = width * height; i < n; i++) {
    const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2]
    const a = 255 - Math.min(r, g, b)
    if (a >= ALPHA_KEEP) inkPixels++
    if (a === 0) { out[i * 4 + 3] = 0; continue }
    /* Un-premultiply: recover the ink this pixel was blended from. */
    const f = a / 255
    out[i * 4] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - f)) / f)))
    out[i * 4 + 1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - f)) / f)))
    out[i * 4 + 2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - f)) / f)))
    out[i * 4 + 3] = a
  }

  if (inkPixels < width * height * 0.005) {
    return console.error(
      `  ${file}: REFUSED. Keying leaves only ${inkPixels} ink pixels, which means ` +
      `the artwork is itself near-white. See the guard note in the header.`
    )
  }

  /* Trim to the ink, which is step 1 of normalise-logos.mjs and what lets
     LogoFrame's cap height mean the same thing on every mark. */
  let minX = width, minY = height, maxX = -1, maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (out[(y * width + x) * 4 + 3] >= ALPHA_KEEP) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  const tw = maxX - minX + 1
  const th = maxY - minY + 1
  const trimmed = new Uint8Array(tw * th * 4)
  for (let y = 0; y < th; y++) {
    const src = ((y + minY) * width + minX) * 4
    trimmed.set(out.subarray(src, src + tw * 4), y * tw * 4)
  }

  const png = encodeRGBA(tw, th, trimmed)
  writeFileSync(path, png)
  console.log(
    `  ${file}: ${width}x${height} -> ${tw}x${th} RGBA, ` +
    `${(buf.length / 1024).toFixed(1)}KB -> ${(png.length / 1024).toFixed(1)}KB`
  )
}

const args = process.argv.slice(2)

if (args.includes('--list') || args.length === 0) {
  const missing = readdirSync(DIR)
    .filter(f => f.endsWith('.png'))
    .filter(f => !hasAlpha(readFileSync(`${DIR}/${f}`)))
  console.log(`${missing.length} marks without alpha:`)
  for (const f of missing) console.log('  ', f.replace(/\.png$/, ''))
  if (args.length === 0) console.log('\nPass slugs to key them.')
} else {
  console.log('keying:')
  for (const slug of args) key(slug.replace(/\.png$/, ''))
}
