/**
 * B.F.A & Co. Legal's mark, taken from the firm's own site.
 *
 * The firm is on the board because it is hiring — an Intellectual Property
 * Lawyer role — and it is NOT in ALL_FIRMS. Same reasoning as Zyph, Pentagon
 * Partners and Ovie Obobolo: the directory is a researched list with offices,
 * practice areas and directory standing behind every entry, and inventing a
 * profile to satisfy a logo lookup would put an unresearched firm in a
 * directory whose whole value is that everything in it was checked. So the mark
 * lives in public/employer-logos and is keyed from EMPLOYER_LOGOS.
 *
 * ⚠ THE FULL LOCKUP, NOT THE MONOGRAM, and that is a deliberate departure from
 * extract-kbo-logo.mjs and extract-ovie-logo.mjs. Both of those cut the
 * monogram out because their lockups are STACKED — monogram over wordmark over
 * tagline — so the wordmark tier lands under 4px at board size and the tagline
 * disappears. This lockup is HORIZONTAL: the monogram sits to the left of the
 * wordmark, divided by a rule, so scaling to a 37px height costs the wordmark
 * proportionally rather than crushing it into a strip. The two cases are not
 * the same shape and do not get the same treatment.
 *
 * ⚠ THE SOURCE IS 237x65 AND THERE IS NOTHING BIGGER. This is under
 * MIN_ACCEPTABLE in normalise-logos.mjs, which flags anything below 600px on
 * its longest edge for re-sourcing by hand, and the flag is correct here. What
 * was checked, so nobody repeats it:
 *
 *   /images/logo.png            237x65, the only logo on their site
 *   /images/fav.png             64x64, the monogram alone
 *   logo@2x, logo.svg, and the other usual variants   404
 *   the site carries no og:image
 *   web.archive.org's only capture (2021-03-03)       237x65, identical
 *   logo.clearbit.com                                 the API was retired
 *
 * So 237x65 IS the artwork, not a thumbnail of it, and no processing here can
 * change that — see the note in normalise-logos.mjs about inventing resolution.
 * At a 37px board height the mark is served at roughly half its native size and
 * holds; on a 2x display it is very slightly soft. The only real fix is vector
 * art from the firm, which is worth asking for alongside the query about their
 * apply address. Until then this is the best that exists.
 *
 * NO KEYING. The source is already a genuine RGBA PNG with a clean alpha
 * channel, so keyWhite() would be destructive rather than helpful — the mark's
 * own ink includes near-black at #0B0C10 and #231F20, and the brand yellow is
 * #F8C301. Trim only, which is the same default normalise-logos.mjs runs under.
 *
 * Run: node scripts/extract-bfa-logo.mjs
 * Idempotent — re-running overwrites the PNG.
 */

import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public', 'employer-logos')
const OUT = path.join(OUT_DIR, 'bfa-legal.png')

/** The firm's own site. A local path can be passed instead, which is what to do
 *  if they ever send vector art or a larger export. */
const SOURCE = 'https://bfaandcolegal.com/images/logo.png'

/** Under this on the longest edge, say so rather than shipping quietly. Same
 *  number normalise-logos.mjs uses, for the same reason. */
const MIN_ACCEPTABLE = 600

async function load(arg) {
  if (arg && existsSync(arg)) {
    console.log(`Reading ${arg}`)
    return readFile(arg)
  }
  console.log(`Fetching ${SOURCE}`)
  const res = await fetch(SOURCE, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; Esquirely asset fetch)' },
  })
  if (!res.ok) throw new Error(`${res.status} fetching ${SOURCE}`)
  return Buffer.from(await res.arrayBuffer())
}

const src = await load(process.argv[2])

const before = await sharp(src).metadata()
if (!before.hasAlpha) {
  /* Loud rather than silent. If the firm ever replaces the file with an opaque
     JPEG, trimming alone leaves a white plate behind the mark and it will look
     wrong only on the black band, which is exactly the surface nobody checks
     first. */
  console.warn('⚠ Source has no alpha channel. It will need keying, which this script does not do.')
}

/* threshold 1 rather than 0: the source's transparent margin is not perfectly
   uniform at the edges, and an exact-match trim leaves a stray row. */
const out = await sharp(src).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toBuffer()
const after = await sharp(out).metadata()

await mkdir(OUT_DIR, { recursive: true })
await writeFile(OUT, out)

const longest = Math.max(after.width, after.height)
console.log(`
  source   ${before.width}x${before.height}  ${before.format}  alpha:${before.hasAlpha}
  trimmed  ${after.width}x${after.height}  ${out.length} bytes
  written  public/employer-logos/bfa-legal.png
`)
if (longest < MIN_ACCEPTABLE) {
  console.log(`  ⚠ ${longest}px on the longest edge, under the ${MIN_ACCEPTABLE}px bar.`)
  console.log('    This is the largest artwork the firm publishes. See the header.')
}
