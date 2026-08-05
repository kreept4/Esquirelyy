/**
 * Turn the firm logos into transparent PNGs so they can float on any ground.
 *
 * Why this exists: 29 of the 30 source files carry an opaque background. 24 are
 * JPEG/ICO, which cannot store alpha at all; of the five PNGs only SimmonsCooper
 * is genuinely RGBA (Jackson Etti and Punuka are palette PNGs with no
 * transparency chunk, Stren & Blan is RGB, and kenna-partners.png is a JPEG with
 * the wrong extension). So the marks could never sit directly on the black band
 * without dragging a white rectangle behind them.
 *
 * What it does, per logo:
 *   1. trim the uniform border, so the mark is cropped to its own ink and the
 *      wildly varying baked-in padding stops distorting relative sizes
 *   2. key the white background to transparent on a soft threshold
 *   3. un-premultiply the edge pixels, which is what stops the white halo
 *   4. write a PNG with alpha
 *
 * Step 3 is the one that matters visually. An anti-aliased edge pixel is a blend
 * of ink and white: observed = ink*a + 255*(1-a). If you only set alpha and
 * leave the colour, every edge keeps the white it was blended with and the mark
 * wears a pale fringe on a dark ground. Solving back for ink recovers the
 * original colour: ink = (observed - 255*(1-a)) / a.
 *
 * What it CANNOT do is invent resolution. Several sources are thumbnail-grade
 * (aelex.jpg is 1718 bytes) and no amount of processing makes them crisp. The
 * report at the end flags anything under MIN_ACCEPTABLE so those can be
 * re-sourced from the firm's own site by hand.
 *
 * Run: node scripts/normalise-logos.mjs
 */

import sharp from 'sharp'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public', 'firm-logos')
const BUCKET = 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/'

/** Above this channel-minimum a pixel is treated as pure background. */
const WHITE = 247
/** Below this it is treated as pure ink. Between the two, alpha ramps. */
const INK = 225
/** On a coloured ground, RGB distance below this is background, above is ink. */
const COLOUR_BG = 26
const COLOUR_INK = 78
/** Below this alpha, leave colour untouched rather than trying to recover it. */
const UNPREMULT_FLOOR = 96
/** Ceiling on the un-premultiply factor, so no channel can be flung to an
 *  extreme by a near-transparent pixel. */
const UNPREMULT_CAP = 1.8
/** Anything whose longest edge is under this needs re-sourcing by hand. */
const MIN_ACCEPTABLE = 600

/** slug -> source filename in the bucket. Mirrors logoFile in firms-data.ts. */
const LOGOS = {
  'acas-law': 'ACAS.jpg',
  aelex: 'aelex.jpg',
  'aina-blankson': 'aina blankson.jpg',
  'ajumogobia-okeke': 'ajumogbia.jpg',
  'aluko-oyebode': 'aluko-oyebode.jpg',
  'banwo-ighodalo': 'banwo-ighodalo.jpg',
  'blackfriars-law': 'blackfriars-law.jpg',
  'bloomfield-law': 'bloomfield-law.ico',
  'dealhq-partners': 'Deal Hq.jpg',
  'detail-solicitors': 'Detail solicitors.jpg',
  'famsville-solicitors': 'Famsville.jpg',
  'g-elias': 'Elias.jpeg',
  'george-etomi': 'george-etomi.jpg',
  'jackson-etti-edu': 'Jackson etti.png',
  'kenna-partners': 'kenna-partners.png',
  'mike-igbokwe': 'mike-igbokwe.jpg',
  'olajide-oyewole': 'olajide oyewole.jpg',
  'olaniwun-ajayi': 'olaniwun-ajayi.jpg',
  'perchstone-graeys': 'perchstone.jpg',
  'primera-africa': 'Primera.jpg',
  punuka: 'punuka.png',
  'resolution-law': 'resolution.jpg',
  'simmons-cooper': 'simmons-cooper.png',
  'spa-ajibade': 'SPA ajibade.jpg',
  'stren-blan-partners': 'StrenBlanPartners.png',
  'streamsowers-kohn': 'streamsowers.jpg',
  'tayo-oyetibo': 'TayoOyetibo.jpg',
  templars: 'templars.jpg',
  'udo-udoma-bello-osagie': 'udo-udoma.webp',
  'wole-olanipekun': 'wole olanipekun.jpg',
}

/** Already has real alpha, so keying it would be destructive. */
const ALREADY_TRANSPARENT = new Set(['simmons-cooper'])

/**
 * Whether to key the background out to transparency.
 *
 * OFF by default, and that is deliberate. Keying white out of an opaque JPEG
 * cannot tell background-white from artwork-white, so it also erases white
 * text, the counters inside letterforms and any white highlight. The marks came
 * back as thin skeletons with the life gone. Until the real transparent art is
 * re-sourced from each firm, we only TRIM: the padding that made logos render
 * at wildly different sizes is removed, and every pixel of the artwork stays.
 *
 * Run with KEY=1 to re-enable keying once sources actually carry alpha.
 */
const KEY_BACKGROUND = process.env.KEY === '1'

async function fetchLogo(file) {
  const res = await fetch(BUCKET + encodeURIComponent(file))
  if (!res.ok) throw new Error(`${res.status} fetching ${file}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Read the background colour off the corners rather than assuming white.
 *  Templars and Tayo Oyetibo are set on navy and SPA Ajibade on grey, so a
 *  white-only key left them wearing exactly the box we are trying to remove.
 *  Trim has already run by this point, so the corners are background unless the
 *  mark is a full-bleed rectangle, which the agreement check below catches. */
function detectBackground(data, info) {
  const { width, height, channels } = info
  const at = (x, y) => {
    const i = (y * width + x) * channels
    return [data[i], data[i + 1], data[i + 2]]
  }
  const inset = Math.max(1, Math.floor(Math.min(width, height) * 0.02))
  const corners = [
    at(inset, inset),
    at(width - 1 - inset, inset),
    at(inset, height - 1 - inset),
    at(width - 1 - inset, height - 1 - inset),
  ]
  const avg = [0, 1, 2].map(c => corners.reduce((s, p) => s + p[c], 0) / 4)
  // If the corners disagree the image has no flat ground to key; bail to white
  // so a busy edge cannot make us punch a hole through the middle of the mark.
  // Tight on purpose. A loose tolerance let this mis-detect the ground on
  // busy marks (Resolution, Stren & Blan, Primera) and key against a colour
  // that was never the background, which wrecked their palettes. Only a
  // genuinely flat ground earns colour keying; anything else falls back to
  // white, and if that leaves a box the logo needs re-sourcing by hand.
  const spread = Math.max(...corners.map(p => dist(p, avg)))
  return spread > 14 ? [255, 255, 255] : avg.map(Math.round)
}

function dist(p, q) {
  return Math.sqrt((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2)
}

function keyOutBackground(data, info, bg) {
  const { width, height, channels } = info
  const out = Buffer.alloc(width * height * 4)
  const isWhiteBg = bg[0] >= WHITE && bg[1] >= WHITE && bg[2] >= WHITE

  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const srcAlpha = channels === 4 ? data[i + 3] : 255

    let a
    if (isWhiteBg) {
      // On white, key off the darkest channel: a saturated colour keeps a low
      // minimum even when one channel is blown out, so a red mark survives
      // where a plain luminance test would erode it.
      const m = Math.min(r, g, b)
      a = m >= WHITE ? 0 : m <= INK ? 255 : Math.round(255 * ((WHITE - m) / (WHITE - INK)))
    } else {
      // On a coloured ground, distance from that colour is the signal.
      const d = dist([r, g, b], bg)
      a = d >= COLOUR_INK ? 255 : d <= COLOUR_BG ? 0 : Math.round(255 * ((d - COLOUR_BG) / (COLOUR_INK - COLOUR_BG)))
    }
    a = Math.round((a * srcAlpha) / 255)

    if (a === 0) { out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0; continue }

    // Un-premultiply against the detected ground to strip the halo, so an edge
    // pixel blended with navy stops carrying navy onto a black section.
    //
    // Capped, and skipped entirely at low alpha. Unbounded, 255/a explodes as
    // alpha approaches zero: channels overshoot, clamp at 0 or 255, and the
    // mark comes back in garish false colour. That is what turned Resolution
    // and Stren & Blan into rainbow blocks. A faint pixel carries almost no
    // colour information worth recovering, so leave it alone.
    if (a >= UNPREMULT_FLOOR) {
      const f = Math.min(255 / a, UNPREMULT_CAP)
      out[o] = clamp255((r - bg[0]) * f + bg[0])
      out[o + 1] = clamp255((g - bg[1]) * f + bg[1])
      out[o + 2] = clamp255((b - bg[2]) * f + bg[2])
    } else {
      out[o] = r
      out[o + 1] = g
      out[o + 2] = b
    }
    out[o + 3] = a
  }
  return out
}

function clamp255(v) {
  return Math.max(0, Math.min(255, Math.round(v)))
}

await mkdir(OUT_DIR, { recursive: true })

const report = []

for (const [slug, file] of Object.entries(LOGOS)) {
  try {
    const src = await fetchLogo(file)
    let img = sharp(src, { animated: false })
    const meta = await img.metadata()

    // Trim the uniform border first so the mark is cropped to its own ink.
    // Wrapped because trim throws when an image is entirely one colour.
    let trimmed = src
    try {
      trimmed = await sharp(src).trim({ threshold: 12 }).toBuffer()
    } catch {
      report.push({ slug, note: 'trim skipped' })
    }

    let pipeline = sharp(trimmed)

    if (KEY_BACKGROUND && !ALREADY_TRANSPARENT.has(slug)) {
      const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true })
      const bg = detectBackground(data, info)
      const keyed = keyOutBackground(data, info, bg)
      pipeline = sharp(keyed, { raw: { width: info.width, height: info.height, channels: 4 } })
    }

    const finalBuf = await pipeline.png({ compressionLevel: 9 }).toBuffer()
    const finalMeta = await sharp(finalBuf).metadata()
    await writeFile(path.join(OUT_DIR, `${slug}.png`), finalBuf)

    report.push({
      slug,
      source: `${meta.width}x${meta.height} ${meta.format}`,
      output: `${finalMeta.width}x${finalMeta.height}`,
      longest: Math.max(finalMeta.width, finalMeta.height),
      keyed: !ALREADY_TRANSPARENT.has(slug),
    })
  } catch (err) {
    report.push({ slug, error: err.message })
  }
}

console.log('\n--- processed ---')
for (const r of report.filter(r => !r.error && r.source)) {
  console.log(`${r.slug.padEnd(26)} ${String(r.source).padEnd(18)} -> ${r.output}`)
}

const failed = report.filter(r => r.error)
if (failed.length) {
  console.log('\n--- failed ---')
  for (const r of failed) console.log(`${r.slug.padEnd(26)} ${r.error}`)
}

const poor = report.filter(r => r.longest && r.longest < MIN_ACCEPTABLE)
console.log(`\n--- too small, re-source by hand (longest edge < ${MIN_ACCEPTABLE}px) ---`)
for (const r of poor.sort((a, b) => a.longest - b.longest)) {
  console.log(`${r.slug.padEnd(26)} ${r.output}`)
}
console.log(`\n${report.length - failed.length}/${report.length} written to public/firm-logos/`)
console.log(`${poor.length} need better source art.`)
