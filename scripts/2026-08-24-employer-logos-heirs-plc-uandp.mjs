/**
 * Marks for the three employers added on 23 and 24 August.
 *
 * All three rendered as INITIALS on the board, because nothing resolved them:
 * none is in ALL_FIRMS, none had a row in EMPLOYER_LOGOS, and `logo_url` on a
 * jobs row is null for almost everything (a job's mark is looked up from the
 * employer name, not stored on the listing). The fallback is deliberate and it
 * is still a fallback — a card with initials beside two cards with marks reads
 * as a failed image.
 *
 * ⚠ THREE EMPLOYERS, THREE DIFFERENT TREATMENTS, AND THE DIFFERENCES ARE THE
 * WHOLE CONTENT OF THIS FILE. Each one is decided by what the source actually
 * is, not by a house preference:
 *
 *   Heirs Holdings           the official lockup, already transparent
 *   Principle Legal Consult  the official monogram, already transparent
 *   U&P Law                  gold on a solid maroon ground, needs keying
 *
 * ============================================================
 * HEIRS HOLDINGS — THE FULL LOCKUP, NOT THE GLOBE
 * ============================================================
 *
 * Straight off heirsholdings.com: HH-Logo-Africa-Centred.png, 1829x315, already
 * RGBA on transparency. No keying, no inversion, no reconstruction — the one
 * source here that needed nothing done to it.
 *
 * ⚠ IT IS 5.8:1 AND THE WORLD BANK NOTE IN firms-data.ts SAYS TO CUT A MARK
 * THAT WIDE DOWN TO ITS EMBLEM. That note is about BallMark, which clamps
 * anything past about 5:1 to 14% of the ball's height and turns a wordmark into
 * a smear. It does not apply here, and following it would be the wrong call for
 * a second reason.
 *
 * The Bank's globe is one of the most recognisable marks in the world, so
 * dropping the words costs nothing. Heirs Holdings' globe is a red and grey
 * sphere that means nothing to a Nigerian law student who has not met the
 * company — and a graduate programme at an unfamiliar employer is exactly the
 * listing where the NAME is doing the identifying. The B.F.A. entry made the
 * same call for the same reason: a horizontal mark loses width rather than
 * legibility as it scales, so the lockup survives the board row.
 *
 * ============================================================
 * PRINCIPLE LEGAL CONSULT — THE MONOGRAM, NOT THE LOCKUP
 * ============================================================
 *
 * And here the call goes the other way, which is the point. The firm's site is
 * on Wix and serves the monogram alone as its icon asset at 303x303, RGBA: the
 * pillar device with the P, L and C built into it. Their full lockup sets that
 * device ABOVE the words "PRINCIPLE LEGAL CONSULT" over a rule over "CONSULT" —
 * a three-tier stack, which is the shape Ovie Obobolo and KBO were both cut
 * down for. A mark gets about 37px of height on the board; a third of that is
 * not a wordmark, it is a grey line.
 *
 * So: stacked lockup, take the monogram. Horizontal lockup, keep it whole. That
 * is the rule the three entries here are consistent with, not "always monogram"
 * or "always lockup".
 *
 * Navy on cream needs no treatment. It is the same weight as the Olajide
 * Oyewole navy already on the board.
 *
 * ⚠ THE SOURCE IS THE FAVICON ASSET, WHICH IS USUALLY A WARNING SIGN. The
 * bloomfield-law note in firms-data.ts is about exactly this: a bucket held a
 * favicon and it rendered as a plausible-looking mark rather than as a broken
 * one, so nobody reported it. The difference is size. That was a 152px crop of
 * a fragment; this is the complete monogram at 303px, which is above the 188px
 * the U&P avatar gives and is more than the board asks for. Wix serves the
 * original by dropping the /v1/fill/... transform from the URL, which is how
 * 303x303 was had rather than the 192x192 the <link> tag asks for.
 *
 * ============================================================
 * ⚠ U&P LAW — KEYED OFF A DARK GROUND, AND THE COLOUR IS REGISTERED
 * ============================================================
 *
 * The only source that exists. Uduakabasi & Partners have no website — their
 * application route is a Gmail address, which is what a firm this new looks
 * like — so there is no asset to fetch. What there is: their LinkedIn avatar,
 * 188x180, a gold monogram on a near-black maroon ground. Same position as
 * abdulai-taiwo and lekan-bamidele, both of which are marks supplied by hand
 * because the firm publishes nothing an automated fetch can reach.
 *
 * TWO THINGS ARE WRONG WITH IT AS SUPPLIED, and both are handled here:
 *
 * The bottom of the frame is not the logo. The last twenty-odd rows are
 * rgb(29,33,39), the dark grey of the LinkedIn post it was captured from, not
 * the mark's own rgb(37,3,1) maroon. Left in, the mark ships with a grey band
 * across its foot. The maroon rows are found by measurement rather than by a
 * hardcoded crop, so a differently-cropped capture of the same avatar still
 * works.
 *
 * And the ground is opaque. Every mark on this site floats on cream, so a
 * near-black square would be the only rectangle on the board.
 *
 * ⚠ KEYED ON LUMINANCE, NOT ON COLOUR DISTANCE, and NOT with lib/key-white.mjs.
 * That helper keys the BRIGHTEST pixels out, which is the exact inverse of what
 * is needed here and would erase the gold and keep the ground. The separation
 * is enormous — ground luma about 13, gold about 124 — so a simple ramp between
 * 30 and 70 is safe with a lot of room on both sides. A colour-distance key
 * would be more precise and there is nothing here that needs the precision.
 *
 * ⚠ AND THEN THE MAROON IS PUT BACK, AS A REGISTERED BRAND GROUND rather than
 * as pixels. Gold on cream is a low-contrast mess: the monogram is rgb(155,116,
 * 82), a muted bronze, and the board's cream is rgb(255,248,229). Keying the
 * ground out and stopping there would produce a mark you cannot see, which is
 * a worse outcome than the square.
 *
 * EMPLOYER_BALL_BG is the mechanism that already exists for this, and it is
 * what First Bank, Union Bank and Castlefield use: transparent artwork plus a
 * registered brand colour, which EmployerMark paints behind the mark with an
 * 8px radius. The result is gold on maroon in a rounded tile — the firm's own
 * colours, in the shape the board draws everything else in, instead of a hard
 * square somebody pasted in.
 *
 * ⚠ IT WILL NOT GET THAT TILE IN THE Closing soon CARDS. ClosingSoon.tsx's
 * CardMark deliberately does not read ballBgForEmployer — see its own note.
 * That is fine TODAY because U&P Law is a rolling listing with no deadline, so
 * it never enters that section. IF A U&P ROLE EVER CARRIES A CLOSING DATE, this
 * is the comment that says why its card looks different, and the fix is in
 * CardMark rather than here.
 *
 * Run: node scripts/2026-08-24-employer-logos-heirs-plc-uandp.mjs
 * Sources are read from the paths below and are not fetched, so this is
 * reproducible only where those files exist; every URL is recorded above.
 * Idempotent — it overwrites its three outputs and touches nothing else.
 */

import { existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(here, '..', 'public', 'employer-logos')
mkdirSync(OUT_DIR, { recursive: true })

/* Where the three sources were left. Passed as argv when they are somewhere
   else, in that order. */
const SCRATCH =
  process.argv[2] ||
  'C:/Users/BARR~1.TOB/AppData/Local/Temp/claude/C--Users-Barr--Tobi-Ogunleye/7c796be4-496c-482c-b0b1-038f8a00b790/scratchpad'

const SOURCES = {
  heirs: join(SCRATCH, 'logos', 'heirs-raw.png'),
  plc: join(SCRATCH, 'logos', 'plc-raw.png'),
  uandp: join(SCRATCH, 'imgs', 'IMG_1934.jpeg'),
}

for (const [k, p] of Object.entries(SOURCES)) {
  if (!existsSync(p)) {
    console.error(`missing source for ${k}: ${p}`)
    console.error('See the header for where each one came from.')
    process.exit(1)
  }
}

const report = async (name, buf) => {
  const m = await sharp(buf).metadata()
  console.log(`  ${name.padEnd(22)} ${m.width}x${m.height}  ${(buf.length / 1024).toFixed(1)}kB  alpha=${m.hasAlpha}`)
}

/* ---------------------------------------------------------------- Heirs */
{
  const out = await sharp(SOURCES.heirs)
    .trim({ threshold: 1 })
    /* Width-capped, height follows. The lockup is wide and the board slot sizes
       on width; forcing a height would letterbox it. */
    .resize({ width: 720, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer()
  await sharp(out).toFile(join(OUT_DIR, 'heirs-holdings.png'))
  await report('heirs-holdings.png', out)
}

/* ------------------------------------------------ Principle Legal Consult */
{
  const out = await sharp(SOURCES.plc)
    .trim({ threshold: 1 })
    /* Square, so it is capped on the long edge and `fit: inside` keeps it
       square rather than padding it to a box. */
    .resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer()
  await sharp(out).toFile(join(OUT_DIR, 'principle-legal-consult.png'))
  await report('principle-legal.png', out)
}

/* ------------------------------------------------------------- U&P Law */
{
  const { data, info } = await sharp(SOURCES.uandp).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const at = (x, y) => {
    const i = (y * width + x) * channels
    return [data[i], data[i + 1], data[i + 2]]
  }

  /* The mark's own ground, read off the top-left rather than assumed, so a
     recapture at a different size still keys correctly. */
  const [gr, gg, gb] = at(2, 2)

  /* Walk up from the bottom until the row stops being the LinkedIn grey and
     starts being the mark's maroon again. Sampled at three x positions so a
     stray dark pixel in the grey band cannot end the walk early. */
  const isGround = (x, y) => {
    const [r, g, b] = at(x, y)
    return Math.abs(r - gr) < 14 && Math.abs(g - gg) < 14 && Math.abs(b - gb) < 14
  }
  let bottom = height
  while (bottom > 1) {
    const y = bottom - 1
    if (isGround(1, y) && isGround(width >> 1, y) && isGround(width - 2, y)) break
    bottom--
  }
  const cropped = Math.max(1, bottom)
  console.log(`  u&p: ground rgb(${gr},${gg},${gb}), ${height - cropped} non-mark rows trimmed off the foot`)

  /* Key on luminance. See the header for why this is not lib/key-white.mjs and
     why a plain ramp is safe at this separation. */
  const DARK = 30
  const LIGHT = 70
  const out = Buffer.alloc(width * cropped * 4)
  for (let y = 0; y < cropped; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = at(x, y)
      const luma = 0.299 * r + 0.587 * g + 0.114 * b
      const a = luma <= DARK ? 0 : luma >= LIGHT ? 255 : Math.round((255 * (luma - DARK)) / (LIGHT - DARK))
      const o = (y * width + x) * 4
      out[o] = r
      out[o + 1] = g
      out[o + 2] = b
      out[o + 3] = a
    }
  }

  const png = await sharp(out, { raw: { width, height: cropped, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer()
  await sharp(png).toFile(join(OUT_DIR, 'uandp-law.png'))
  await report('uandp-law.png', png)

  const hex = '#' + [gr, gg, gb].map(v => v.toString(16).padStart(2, '0')).join('')
  console.log(`\n  \u26a0 register this in EMPLOYER_BALL_BG for U&P Law: ${hex}`)
}

console.log('\nLook at all three before trusting them. On U&P specifically: that')
console.log('the gold survived the key rather than being eaten by it, and that no')
console.log('grey band from the LinkedIn capture is left along the bottom.')
