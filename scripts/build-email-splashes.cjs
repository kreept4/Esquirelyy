/**
 * Paint-splash logo plates for the emails, in the fliers' construction.
 *
 * The roles email first drew every mark on a flat white rounded plate
 * (scripts/build-email-assets.mjs). The fliers draw them on a paint splash:
 * an asymmetric eight-value radius so the blob never settles into an ellipse,
 * light from the top left, a lip of highlight on the upper edge, a contact
 * shadow, a long soft cast shadow, and a slight tilt with the mark held level.
 * The brief is that the emails carry the same object, so this renders the
 * fliers' own CSS in a browser and saves the result as a transparent PNG.
 * Pixels, for the reason build-email-assets.mjs gives: no mail client
 * recolours an image.
 *
 * Same rules as the flier:
 *   - one outline for every mark; WIDE WORDMARKS GET A WIDER SPLAT rather than
 *     a smaller mark, which is where a fixed plate loses them;
 *   - the mark is sized by optical area, so a seal and a wordmark carry the
 *     same weight;
 *   - the tilt alternates, -4 then +4 degrees, in the order the logos are
 *     given; the mark is counter-rotated so it stays level.
 *
 * A mark drawn in white needs its own ground: GROUND below gives it one, taken
 * from the brand, as PLATE_FILL does in build-email-assets.mjs.
 *
 * Run (needs Playwright, which this environment has; it is not a dependency):
 *   node scripts/build-email-splashes.cjs /employer-logos/a.png /firm-logos/b.png ...
 * Writes public/email/splash/*.png at 2x and merges src/lib/email/splash-plates.json,
 * which templates/new-roles.ts prefers over the flat plates.
 */

const { chromium } = require('playwright')
const sharp = require('sharp')
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('node:fs')
const { join, basename } = require('node:path')

const ROOT = join(__dirname, '..')
const PUBLIC = join(ROOT, 'public')
const OUT_DIR = join(PUBLIC, 'email', 'splash')
const MANIFEST = join(ROOT, 'src', 'lib', 'email', 'splash-plates.json')

/** Grounds for marks that are white. Keyed by logo path. */
const GROUND = {
  /* Órọrùn's own green, from their logo's ground (rgb 1,37,35), lit the same
     way as the white splash: lighter where the light falls, the brand colour
     at the rim. */
  '/employer-logos/ororun.png': {
    fill: 'radial-gradient(120% 120% at 30% 22%, #0C4A44 0%, #04342F 50%, #012523 100%)',
    lip: 'rgba(255,255,255,.22)',
  },
}
const WHITE = {
  fill: 'radial-gradient(120% 120% at 30% 22%, #FFFFFF 0%, #FFFFFF 50%, #F2ECE2 100%)',
  lip: 'rgba(255,255,255,.95)',
}

/* Display sizes, in CSS pixels; rendered at 2x. The splash is 124 by 80 at
   rest, which is the flier's 212 by 136 brought down to an email card. */
const BASE_W = 124
const SPLASH_H = 80
const AREA = 3400 // the optical area a mark is fitted to
const MAX_MARK_W = 190
const MIN_MARK_H = 15
const MAX_MARK_H = 52
const PAD_X = 30 // room either side for the mark, inside the splash

function fit(aspect) {
  let h = Math.sqrt(AREA / aspect)
  h = Math.min(MAX_MARK_H, Math.max(MIN_MARK_H, h))
  let w = h * aspect
  if (w > MAX_MARK_W) { w = MAX_MARK_W; h = Math.max(MIN_MARK_H, w / aspect); w = h * aspect }
  return { w: Math.round(w), h: Math.round(h) }
}

;(async () => {
  const paths = process.argv.slice(2)
  if (!paths.length) throw new Error('give one or more logo paths, as logoForEmployer returns them')
  mkdirSync(OUT_DIR, { recursive: true })
  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
  const browser = await chromium.launch()
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 600, height: 300 } })

  for (const [i, logoPath] of paths.entries()) {
    const src = join(PUBLIC, logoPath.replace(/^\//, ''))
    if (!existsSync(src)) throw new Error(`no logo at ${src}`)
    const trimmed = await sharp(src).trim({ threshold: 8 }).png().toBuffer({ resolveWithObject: true })
    const aspect = trimmed.info.width / trimmed.info.height
    const mark = fit(aspect)
    const splashW = Math.max(BASE_W, mark.w + PAD_X * 2)
    const tilt = i % 2 === 0 ? -4 : 4
    const ground = GROUND[logoPath] || WHITE
    const dataUri = `data:image/png;base64,${trimmed.data.toString('base64')}`

    await page.setContent(`<!doctype html><html><head><style>
      html, body { margin: 0; background: transparent; }
      .wrap { display: inline-block; padding: 8px 16px 30px 16px; }
      .splash { width: ${splashW}px; height: ${SPLASH_H}px; display: flex; align-items: center; justify-content: center;
        border-radius: 58% 42% 48% 52% / 60% 46% 54% 40%;
        background: ${ground.fill};
        box-shadow:
          inset 0 3px 0 ${ground.lip},
          inset 0 -8px 14px rgba(36,31,22,.07),
          0 1px 1px rgba(36,31,22,.14),
          0 8px 14px -4px rgba(36,31,22,.26),
          0 18px 24px -12px rgba(36,31,22,.30);
        transform: rotate(${tilt}deg); }
      .splash img { display: block; width: ${mark.w}px; height: ${mark.h}px; transform: rotate(${-tilt}deg); }
    </style></head><body><div class="wrap"><div class="splash"><img src="${dataUri}" alt=""></div></div></body></html>`)
    await page.waitForTimeout(50)
    const el = await page.$('.wrap')
    const box = await el.boundingBox()
    const name = basename(logoPath).replace(/\.\w+$/, '.png')
    const out = join(OUT_DIR, name)
    const shot = await el.screenshot({ omitBackground: true })
    await sharp(shot).png({ compressionLevel: 9, palette: true, quality: 90, colours: 256 }).toFile(out)
    manifest[logoPath] = { src: `/email/splash/${name}`, width: Math.round(box.width), height: Math.round(box.height) }
    console.log(`splash ${logoPath} -> /email/splash/${name} ${Math.round(box.width)}x${Math.round(box.height)} (mark ${mark.w}x${mark.h}, tilt ${tilt})`)
  }

  await browser.close()
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
  console.log('manifest', MANIFEST)
})().catch(e => { console.error(e); process.exit(1) })
