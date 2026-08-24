/**
 * Cut the new Ukpong & Omotoso lockup out of the firm's announcement card.
 *
 * CLP Legal restored the name it was registered under in 1990 and published a
 * "CLP Legal is now UKPONG & OMOTOSO" card to say so. The card sets the OLD
 * mark and the NEW mark side by side inside one white panel, divided by a
 * hairline rule — which is exactly the shape that makes it usable as a source
 * and exactly the shape that makes a naive crop wrong.
 *
 * ⚠ THE RIGHT HALF, NOT THE WHOLE PANEL. Half the panel is the retired maroon
 * CLP box. A mark that shipped with the old logo still in it would be worse
 * than no new art at all: every card on the site would show a firm advertising
 * a name it has just stopped using, and it would look deliberate rather than
 * broken, which is how the bloomfield-law and olajide-oyewole faults survived
 * for weeks (see the notes in lib/firms-data.ts).
 *
 * WHY A HAND-MEASURED CROP AND NOT THE FIRM'S OWN SITE. ukpongomotoso.com is
 * live and serves the lockup, and that would ordinarily be the better source —
 * it is what scripts/fetch-new-firm-logos.mjs exists to do. It is not used here
 * because the announcement card is a flat, high-contrast render of the same
 * lockup on a plain white ground at a usable size, and keying white out of that
 * is a solved problem in this repo. If the site's asset is ever wanted instead,
 * this file is the thing to replace, not to edit.
 *
 * ⚠ THE WHITE IS KEYED OUT, NOT LEFT IN. Every mark on the site is composited
 * onto cream. A mark on an opaque white plate renders as a white rectangle on
 * that cream, which is the babalakin and kola-awodein failure — both JPEGs,
 * both fixed the same way. scripts/lib/key-white.mjs is that fix and is used
 * here rather than copied.
 *
 * SAFE TO RUN AGAIN. It reads the source and overwrites the destination; it
 * does not consume anything. It writes only public/firm-logos/ukpong-omotoso.png
 * and touches no database row — the rename itself is a source edit in
 * lib/firms-data.ts and a redirect in next.config.js, both of which are already
 * in the tree.
 *
 * Run: node scripts/2026-08-24-rename-clp-to-ukpong-omotoso.mjs <path-to-card.jpeg>
 */

import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { keyWhite } from './lib/key-white.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '..', 'public', 'firm-logos', 'ukpong-omotoso.png')

const source = process.argv[2]
if (!source || !existsSync(source)) {
  console.error('usage: node scripts/2026-08-24-rename-clp-to-ukpong-omotoso.mjs <path-to-card.jpeg>')
  console.error('The card is the "CLP Legal is now UKPONG & OMOTOSO" announcement image.')
  process.exit(1)
}

const meta = await sharp(source).metadata()
console.log(`source: ${meta.width}x${meta.height}`)

/**
 * The panel, as fractions of the card rather than pixels.
 *
 * Fractions so the numbers survive being handed a different export of the same
 * card at a different size, which is the likeliest way this gets re-run. They
 * were measured off the 1179x636 version. The dividing rule sits at about 37%
 * of the card's width and the new lockup is everything to the right of it.
 *
 * ⚠ THESE CROP INSIDE THE WHITE PANEL, NOT TO ITS EDGES, and the first
 * attempt did the latter. Keying white and then trimming on alpha sounds like
 * it should make the exact bounds irrelevant. It does not, because the panel
 * sits on the card's BEIGE ground and beige is not white. Crop to the panel
 * edge and its rounded corners survive the key as two faint beige arcs, the
 * trim then treats them as ink and finds a bounding box larger than the
 * lettering, and the mark ships floating inside a box of nothing. Starting
 * inside the panel means everything in frame is either white or ink.
 *
 * There is still air on each side, just panel-white air rather than card
 * edge: the trim finds the real bounding box from the alpha channel and does
 * a better job of it than a measurement can.
 */
const LEFT = 0.405
const RIGHT = 0.845
const TOP = 0.505
const BOTTOM = 0.775

const left = Math.round(meta.width * LEFT)
const top = Math.round(meta.height * TOP)
const width = Math.round(meta.width * (RIGHT - LEFT))
const height = Math.round(meta.height * (BOTTOM - TOP))
console.log(`crop  : ${width}x${height} at ${left},${top}`)

const cropped = await sharp(source).extract({ left, top, width, height }).png().toBuffer()

/* White out, then trim to what is actually left. Trim AFTER keying, because
   trimming a white JPEG keys off the corner colour and finds nothing to remove;
   trimming an alpha channel finds the ink. */
const keyed = await keyWhite(cropped)
const out = await sharp(keyed)
  .trim({ threshold: 1 })
  /* Capped on width, height left to follow. A wordmark lockup is wide, and the
     card slot sizes on width; forcing a height would letterbox it. */
  .resize({ width: 600, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toBuffer()

const final = await sharp(out).metadata()
writeFileSync(OUT, out)
console.log(`\nwrote ${OUT}`)
console.log(`      ${final.width}x${final.height}, ${(out.length / 1024).toFixed(1)}kB, alpha=${final.hasAlpha}`)
console.log('\nLook at it before trusting it. Three things to check: that no part')
console.log('of the retired maroon CLP box is in frame, that no beige arc from')
console.log('the panel corners survived the key, and that the maroon serif')
console.log('lettering survived the keying rather than being eaten by it.')

/* public/firm-logos/clp-legal.png is left on disk deliberately. Nothing
   references it - lib/firms-data.ts now keys this firm as 'ukpong-omotoso' -
   so it is served to nobody, and deleting retired art is the one move in this
   repo that cannot be undone from the tree. If it is ever genuinely in the
   way, check EMPLOYER_LOGOS and the jobs table's logo_url column first. */
