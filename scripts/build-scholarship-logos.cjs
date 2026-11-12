/**
 * Scholarship providers' logos, from their source files to the PNGs the site
 * serves from public/employer-logos.
 *
 * The sources are the providers' own files (see SOURCES for each URL), saved
 * as they were served: SVG, PNG, JPEG and WebP at very different sizes. The
 * board wants one kind of file: a transparent PNG cropped to the mark, no
 * larger than it will ever be drawn.
 *
 * Per logo:
 *   1. rasterise (SVGs at a density high enough for 640px wide)
 *   2. for a file with no alpha channel, key its white ground to transparent
 *      and un-premultiply the edge pixels, as scripts/normalise-logos.mjs does
 *      for the firm logos, so the mark carries no white box or pale fringe
 *   3. trim to the mark, fit inside 640 by 320, write a PNG
 *
 * Run: node scripts/build-scholarship-logos.cjs <directory holding the sources>
 */

const sharp = require('sharp')
const { join } = require('node:path')
const { existsSync } = require('node:fs')

const OUT = join(__dirname, '..', 'public', 'employer-logos')

/** source file -> output name, and where the source came from. */
const SOURCES = [
  ['lse.svg', 'lse.png', 'https://www.lse.ac.uk/ (header logo, LSE_logo.svg)'],
  ['ox.svg', 'university-of-oxford.png', 'https://commons.wikimedia.org/wiki/File:Oxford-University-Circlet.svg (ox.ac.uk refuses automated requests)'],
  ['uu.svg', 'utrecht-university.png', 'https://www.uu.nl/en (header logo, uu-logo-en.svg)'],
  ['um.jpg', 'maastricht-university.png', 'https://www.maastrichtuniversity.nl/ (Logo UM.jpg)'],
  ['wht.webp', 'weidenfeld-hoffmann-trust.png', 'https://whtrust.org/ (whtrust-logo-2026.webp)'],
  ['gates-white.png', 'gates-cambridge.png', 'https://www.gatescambridge.org/ (header logo, the white version; drawn on their navy)'],
  ['csc.png', 'commonwealth-scholarship-commission.png', 'https://cscuk.fcdo.gov.uk/ (header logo, white; drawn on their ground)'],
  /* These three sites answer automated requests with a bot challenge, so the
     marks come from the files Wikipedia's articles on them use. */
  ['acu.svg', 'acu.png', 'https://en.wikipedia.org/wiki/File:Association_of_Commonwealth_Universities_logo.svg'],
  ['nddc.jpg', 'nddc.png', 'https://en.wikipedia.org/wiki/File:Logo-nddc.jpg (76px: the only copy available)'],
  /* nddc.png was then cut to its circle by hand: the source sits on a grey
     square, not white, so keyWhite leaves the corners. */
  ['chevening.png', 'chevening.png', 'https://en.wikipedia.org/wiki/File:Chevening_Scholarship_crest.png'],
  ['rhodes.svg', 'rhodes-trust.png', 'https://www.rhodeshouse.ox.ac.uk/ (header logo)'],
  ['rhodes.png', 'rhodes-trust.png', 'https://www.rhodeshouse.ox.ac.uk/ (header logo)'],
]

/** White ground to alpha, with the edge colour solved back to the ink. */
async function keyWhite(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const lightness = Math.min(r, g, b)
    // 255 is pure ground, anything under 215 is fully ink; between is an edge.
    const a = lightness >= 252 ? 0 : lightness <= 215 ? 1 : (252 - lightness) / (252 - 215)
    if (a === 0) { data[i + 3] = 0; continue }
    if (a < 1) {
      data[i] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - a)) / a)))
      data[i + 1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - a)) / a)))
      data[i + 2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - a)) / a)))
    }
    data[i + 3] = Math.round(a * 255)
  }
  return sharp(data, { raw: info }).png().toBuffer()
}

;(async () => {
  const dir = process.argv[2]
  if (!dir) throw new Error('give the directory holding the source files')
  for (const [src, out, from] of SOURCES) {
    const file = join(dir, src)
    if (!existsSync(file)) continue
    const meta = await sharp(file).metadata()
    const density = meta.format === 'svg' ? Math.ceil((72 * 1400) / (meta.width || 700)) : undefined
    let buf = await sharp(file, density ? { density } : {}).resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: !density }).png().toBuffer()
    if (!meta.hasAlpha) buf = await keyWhite(buf)
    const done = await sharp(buf).trim({ threshold: 4 }).resize({ width: 640, height: 320, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true })
    await sharp(done.data).toFile(join(OUT, out))
    console.log(`${src} -> /employer-logos/${out} ${done.info.width}x${done.info.height} ${done.data.length}b  [${from}]`)
  }
})().catch(e => { console.error(e); process.exit(1) })
