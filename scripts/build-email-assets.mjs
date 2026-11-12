/**
 * The images the roles email draws its cards with: one linen texture for the
 * card ground, and one logo plate per employer.
 *
 * ============================================================
 * WHY THESE ARE IMAGES AND NOT CSS
 * ============================================================
 *
 * The brief was a card that looks the same whatever the reader's phone is set
 * to, with the firm's mark on it. Colour declared in HTML is the thing mail
 * clients rewrite in dark mode: the Gmail apps darken light backgrounds and
 * lighten dark type whatever the email asks for, and the style-block locks in
 * the template only reach the clients that read style blocks. Pixels inside an
 * image are the one thing no client recolours, so the logo plates are pixels,
 * white plate and all, and hold everywhere. The ground is a colour plus a
 * weave image, held by the template's locks; buildLinen() says why it cannot
 * simply be pixels too.
 *
 * ⚠ THE PLATE IS BAKED, NOT BUILT FROM A WHITE CELL AROUND AN <img>. Logos come
 * in every shape: Adeola Oyinlade's is a round seal, Olaniwun Ajayi's is a
 * wordmark four and a half times wider than it is tall. An <img> in a fixed box
 * either stretches the wordmark or shrinks it to a sliver, and `object-fit` is
 * not supported by enough mail clients to lean on. Fitting each mark once, here,
 * at a height chosen for its shape, gives every card a plate the same height
 * with the mark at a size that reads, and the template only has to know the
 * plate's width, which the manifest records.
 *
 * Plates are drawn at twice their display size so they are sharp on a phone.
 *
 * ============================================================
 * THE TEXTURE
 * ============================================================
 *
 * A linen weave laid over a warm stone ground: every row and every column
 * carries a small shade of its own, which is what reads as thread, with fine
 * grain over the top. Rows and columns run the full width of the tile, so it
 * repeats without a seam. The generator is seeded, so running this again
 * produces the same file and does not show up as a change in git. Why it is a
 * transparent overlay rather than a picture of linen is set out at
 * buildLinen() below, and it matters.
 *
 * Run: node scripts/build-email-assets.mjs /firm-logos/a.png /employer-logos/b.png ...
 *      (paths as logoForEmployer returns them; the texture is rebuilt every run)
 * Writes: public/email/card-linen.png, public/email/logos/*.png,
 *         src/lib/email/logo-plates.json (merged, so earlier plates are kept)
 */

import sharp from 'sharp'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const PUBLIC = join(ROOT, 'public')

/* ---------- the linen ---------- */

/** The card ground the weave is laid over. Must match CARD in
 *  templates/new-roles.ts, which carries it as the cell's bgcolor. */
const CARD = [0xf5, 0xf0, 0xe7]
const TILE = 240

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * ⚠ THE WEAVE IS A TRANSPARENT OVERLAY, NOT AN OPAQUE PICTURE OF LINEN, and
 * the first version was the opaque one. It looked right and it was a trap.
 * The Gmail apps recolour an email in dark mode whatever it declares: the
 * cell's background goes dark and the ink type goes light, while a background
 * IMAGE is left exactly as it was. An opaque light tile would have kept the
 * card light under type Gmail had just turned light: pale on pale, unreadable,
 * on the app most of this list reads mail in.
 *
 * As an overlay the colour lives in the bgcolor, where every client that
 * honours the template's locks keeps it as designed, and the weave is only
 * shadow: black at a few percent, darkening the threads. Over the linen ground
 * that reads as cloth. Over whatever ground Gmail substitutes it reads as the
 * same cloth in a darker dye, and the type on it stays legible either way.
 */
async function buildLinen() {
  const rand = rng(1105)
  const jitter = amp => (rand() + rand() + rand() - 1.5) * amp
  /* Each thread's offset leans a little into the next, which softens the weave
     from a grid into cloth. The lean wraps round the end of the array, so the
     last row meets the first without a seam. */
  const threads = amp => {
    const raw = Array.from({ length: TILE }, () => jitter(amp))
    return raw.map((v, i) => (v * 3 + raw[(i + 1) % TILE]) / 4)
  }
  const rows = threads(6)
  const cols = threads(5)
  const px = Buffer.alloc(TILE * TILE * 4)
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      /* Shadow only: 10 is the resting depth, so a thread brighter than the
         mean lifts back towards the bare ground and a darker one sinks. */
      const shade = 10 - (rows[y] + cols[x] + jitter(5))
      const i = (y * TILE + x) * 4
      px[i] = 0x24
      px[i + 1] = 0x1f
      px[i + 2] = 0x16
      px[i + 3] = Math.max(0, Math.min(60, Math.round((shade / 245) * 255)))
    }
  }
  mkdirSync(join(PUBLIC, 'email'), { recursive: true })
  const out = join(PUBLIC, 'email', 'card-linen.png')
  /* Quantised. Grain this fine does not compress as truecolour PNG and does
     not survive JPEG at all, which has no transparency anyway. */
  await sharp(px, { raw: { width: TILE, height: TILE, channels: 4 } })
    .png({ palette: true, colours: 32, dither: 0.5, compressionLevel: 9 })
    .toFile(out)
  return out
}

/* ---------- the plates ---------- */

const SCALE = 2
const PLATE_H = 60 * SCALE
const PAD_X = 14 * SCALE
const MIN_W = 60 * SCALE
const MAX_LOGO_W = 170 * SCALE

/** Taller for compact marks, shorter for long wordmarks, so they carry the
 *  same visual weight on the card rather than the same height. */
function logoHeightFor(aspect) {
  if (aspect < 1.6) return 46 * SCALE
  if (aspect < 3.2) return 34 * SCALE
  return 30 * SCALE
}

/** Plates that cannot be white. A mark drawn in white for a dark ground
 *  vanishes on the standard plate, so it gets its own ground here, taken from
 *  the brand, the same way EMPLOYER_BALL_BG in firms-data.ts gives the site's
 *  ball a ground. Keyed by the logo path, as logoForEmployer returns it. */
const PLATE_FILL = {
  /* Órọrùn's own green, sampled off their logo's ground (rgb 1,37,35). */
  '/employer-logos/ororun.png': '#012523',
}

async function buildPlate(logoPath) {
  const src = join(PUBLIC, logoPath.replace(/^\//, ''))
  if (!existsSync(src)) throw new Error(`no logo at ${src}`)
  /* Trim first: several marks in public/ carry padding of their own, and a
     plate fitted round padding draws the mark smaller than its neighbours. */
  const trimmed = await sharp(src).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true })
  const aspect = trimmed.info.width / trimmed.info.height
  let h = logoHeightFor(aspect)
  /* Even pixel counts at 2x, so the plate's display size is a whole number of
     pixels and the width attribute in the template is never fractional. */
  const even = n => 2 * Math.round(n / 2)
  let w = even(h * aspect)
  if (w > MAX_LOGO_W) {
    w = MAX_LOGO_W
    h = even(w / aspect)
  }
  const logo = await sharp(trimmed.data).resize(w, h, { fit: 'fill' }).png().toBuffer()
  const plateW = Math.max(MIN_W, w + PAD_X * 2)
  const r = 9 * SCALE
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${plateW}" height="${PLATE_H}">
    <rect x="1" y="1" width="${plateW - 2}" height="${PLATE_H - 2}" rx="${r}" ry="${r}"
      fill="${PLATE_FILL[logoPath] ?? '#FFFFFF'}" stroke="#D8D0C2" stroke-width="2"/>
  </svg>`
  const name = basename(logoPath)
  mkdirSync(join(PUBLIC, 'email', 'logos'), { recursive: true })
  const out = join(PUBLIC, 'email', 'logos', name.replace(/\.\w+$/, '.png'))
  await sharp(Buffer.from(svg))
    .composite([{ input: logo, left: Math.round((plateW - w) / 2), top: Math.round((PLATE_H - h) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(out)
  return {
    key: logoPath,
    plate: {
      src: `/email/logos/${basename(out)}`,
      width: plateW / SCALE,
      height: PLATE_H / SCALE,
    },
  }
}

const manifestPath = join(ROOT, 'src', 'lib', 'email', 'logo-plates.json')
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}

console.log('texture', await buildLinen())
for (const p of process.argv.slice(2)) {
  const { key, plate } = await buildPlate(p)
  manifest[key] = plate
  console.log('plate', key, '->', plate.src, `${plate.width}x${plate.height}`)
}
const sorted = Object.fromEntries(Object.keys(manifest).sort().map(k => [k, manifest[k]]))
writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + '\n')
console.log('manifest', manifestPath)
