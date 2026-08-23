/**
 * Crop marks for the three new employers (Iris Attorneys LP, Principle Legal
 * Consult, Uduakabasi & Partners / U&P Law) straight from their own
 * recruitment material, same treatment as scripts/extract-ovie-logo.mjs and
 * scripts/extract-kbo-logo.mjs: a tight crop plus sharp's trim, no background
 * keying. Iris and Principle Legal Consult sit on white/near-white grounds and
 * come out transparent-on-trim; U&P's mark is already isolated on its own
 * maroon tile, so it is kept as an opaque plate like the other dark-ground
 * marks in EMPLOYER_LOGOS.
 *
 * Run: node scripts/extract-new-employer-logos.mjs
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const OUT = fileURLToPath(new URL('../public/employer-logos/', import.meta.url))
mkdirSync(OUT, { recursive: true })

async function crop(src, box, out, { keyWhite = false } = {}) {
  let img = box ? sharp(src).extract(box) : sharp(src)
  if (keyWhite) {
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      if (r > 235 && g > 235 && b > 235) data[i + 3] = 0
    }
    img = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  }
  await img.trim({ threshold: 12 }).png().toFile(OUT + out)
  console.log('wrote', out)
}

await crop(
  '/root/.claude/uploads/26d41ca4-240d-5ebb-b301-c2705cb6a05a/10ad1fa4-IMG_1813.jpeg',
  { left: 30, top: 35, width: 280, height: 145 },
  'iris-attorneys-lp.png',
  { keyWhite: true }
)

await crop(
  '/root/.claude/uploads/26d41ca4-240d-5ebb-b301-c2705cb6a05a/ba399e9f-image.jpg',
  { left: 155, top: 45, width: 310, height: 250 },
  'principle-legal-consult.png'
)

await crop(
  '/root/.claude/uploads/26d41ca4-240d-5ebb-b301-c2705cb6a05a/4e96ff9a-image.jpg',
  null,
  'uandp-law.png'
)
