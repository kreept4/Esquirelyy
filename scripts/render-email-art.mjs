/**
 * Rasterise the email signature artwork.
 *
 * Email clients do not render SVG. Gmail strips <svg> and refuses SVG in
 * <img src>, Outlook's Word engine cannot draw it, and Yahoo blocks it as
 * active content — so anything that goes in a message has to be a PNG whatever
 * it looks like in the repo.
 *
 * Only the ARTWORK is rasterised, never the type. Outlook and Gmail both block
 * remote images by default, so a signature that is one flat PNG arrives blank
 * for a large share of readers, and an all-image signature is a spam-filter
 * signal besides. It also sidesteps a practical problem: Hanken and Schibsted
 * are loaded from Google Fonts by a <link> and exist nowhere on disk, so
 * anything rendered here would silently fall back to Arial and the wordmark
 * would come out in the wrong face.
 *
 * Run after changing public/illustrations/welcome.svg:
 *   node scripts/render-email-art.mjs
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const SRC = 'public/illustrations/welcome.svg'
const OUT_DIR = 'public/email'
const DISPLAY_W = 110

fs.mkdirSync(OUT_DIR, { recursive: true })

/* density, not just resize: librsvg rasterises at the SVG's own user units
   first, so scaling up afterwards would resample a small bitmap. Rendering at
   high density produces the detail before the resize rather than after it. */
const out = path.join(OUT_DIR, 'welcome-art.png')
await sharp(fs.readFileSync(SRC), { density: 600 })
  .resize(DISPLAY_W * 2, DISPLAY_W * 2, { fit: 'inside' })
  /* Flattened onto the panel's amber. PNG alpha is fine in modern clients, but
     Outlook 2016 and some Windows Mail builds composite transparency against
     black, which would put a dark box in the middle of a yellow panel. */
  .flatten({ background: '#FBBF24' })
  .png({ compressionLevel: 9 })
  .toFile(out)

const meta = await sharp(out).metadata()
console.log(`${out}  ${meta.width}x${meta.height}  ${(fs.statSync(out).size / 1024).toFixed(1)}kB`)
