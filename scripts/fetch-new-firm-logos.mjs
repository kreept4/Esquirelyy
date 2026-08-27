/**
 * Download logo art for firms that do not have a mark yet.
 *
 * URLs hand-picked from the output of find-new-firm-logos.mjs. The scoring
 * there is a hint; these were checked by eye against what each site actually
 * shows in its header, and the usual traps were skipped: client logos on the
 * "our clients" strip (Chapel Hill on Odujinrin, Chambers and IFLR award marks
 * on TNP), membership badges (TerraLex on F. R. A. Williams), mobile burger
 * icons (Ikeyi Shittu), and WordPress thumbnails where the full-size original
 * exists.
 *
 * Trim only, by default. No background keying: on opaque art it cannot tell
 * background white from artwork white, and it eats white lettering and
 * letterform counters. That is what made an earlier pass look dead.
 *
 * The brightness readout at the end is the guard against reversed art. Several
 * of these firms publish a white-on-transparent variant for use on their dark
 * hero, and it is invisible on our cream cards. Anything flagged LIGHT needs a
 * different source, not a different background.
 *
 * THREE THINGS THE 2026-08-08 BATCH NEEDED, hence the option objects below:
 *
 *   referer   femiatoyebi.com.ng answers 406 to a request with no Referer. That
 *             is a security plugin refusing hotlinks, not a broken URL, so the
 *             fix is to send the header a browser would send.
 *
 *   insecure  idowusofola.com is serving an EXPIRED certificate. Every client
 *             refuses it, this script included. The art is fetched with
 *             verification off because a stale cert on a WordPress site is a
 *             neglected renewal rather than an interception risk, and the file
 *             is a logo that gets checked by eye. Do not copy this flag onto
 *             anything whose contents are trusted.
 *
 *   recolour  Femi Atoyebi publish exactly one mark and it is pure white for
 *             their dark header, so it lands at lum 255 and vanishes on cream.
 *             It is an SVG, so rather than invert the pixels afterwards the
 *             fill is swapped before rasterising: same paths, same mark, ink
 *             instead of white. Cleaner than the channel inversion
 *             repair-firm-logos.mjs had to use on Ikeyi Shittu's PNG.
 *
 * AND TWO MORE ADDED AFTER LOOKING AT WHAT THE FIRST RUN PRODUCED:
 *
 *   key       Babalakin and Kola Awodein publish JPEGs, which cannot hold
 *             alpha, so both arrived as good dark marks sitting on a white
 *             rectangle. They tripped the LIGHT flag at lum 203 and 210, and
 *             that reading was wrong: the art is dark, the PLATE is white, and
 *             most pixels are plate. Keying the white out fixes both the flag
 *             and the visible box on the cream card. Only ever set this on art
 *             you have looked at, for the reason in lib/key-white.mjs.
 *
 *   resolveTo O. A. Omonuwa's host does not resolve through every DNS server.
 *             The address is supplied by hand so the fetch can proceed; see the
 *             entry itself for why this is a resolver problem and not a dead
 *             domain, and for when to take it back out.
 *
 *   plate     F.O. Akinrele's only mark is white lettering printed on a flat
 *             brown header ground that reaches every edge of the file. It is
 *             neither a white plate to key nor a mark to invert, so the ground
 *             colour is named and the lettering lifted off it as a matte, then
 *             redrawn in ink. See lib/key-plate.mjs for why a matte and not a
 *             threshold.
 *
 *   negate    F. R. A. Williams's header mark measured lum 255, flat white,
 *             and unlike the others there is no second file to fall back to:
 *             the only other logo-shaped assets on that site are a TerraLex
 *             membership badge and the WordPress theme's own demo art, which
 *             still says "DIACARA WP THEME". So the white mark is inverted, the
 *             same repair Ikeyi Shittu needed.
 *
 * Run: node scripts/fetch-new-firm-logos.mjs
 */

import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'
import { keyWhite } from './lib/key-white.mjs'
import { keyPlate } from './lib/key-plate.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public', 'firm-logos')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

/** Brand ink. Matches --ink in globals.css and the email signature. */
const INK = '#241F16'

/** slug -> url, or slug -> { url, referer, insecure, recolour, key, negate, plate } */
const PICKS = {
  // ---- added 2026-08-05 -----------------------------------------------------
  'alliance-law-firm':
    'https://alliancelawfirm.ng/wp-content/uploads/2022/10/cropped-ALF-LOGO-alternative-e1731752809274.png',
  'dd-dodo': 'https://dddodo.com/wp-content/uploads/2021/10/logo-2021-updated.png',
  'doa-law': 'https://www.doa-law.com/wp-content/themes/doa/images/doa-logo.png',
  'odujinrin-adefulu': 'https://odujinrinadefulu.com/wp-content/uploads/2023/06/Logo_png-1.png',
  // "dark" is the dark-artwork variant, for light grounds. The "light" and
  // "white" files are the reversed pair and would vanish on cream.
  omaplex: 'https://omaplex.com.ng/wp-content/uploads/2024/08/omaplex-dark.png',
  // Next.js serves this through an image proxy on the page; the asset itself
  // sits at a plain path.
  'paul-usoro': 'https://paulusoro.com/assets/img/puc-logo.webp',
  pavestones: 'https://pavestoneslegal.com/wp-content/uploads/2018/08/newlogo-small.png',
  // Not SOOB-Logo_1i.png: the trailing "i" is the inverted pair, pure white
  // ink for their dark header, and it measured lum 221 against 76 for this one.
  'sofunde-osakwe': 'https://sooblaw.com/wp-content/uploads/2026/02/SOOB-Logo_1.png',
  'the-new-practice': 'https://tnp.com.ng/wp-content/uploads/2025/04/tnp_logo.png',

  // ---- added 2026-08-08 -----------------------------------------------------
  babalakin: { url: 'https://www.babalakinandco.com/assets/img/logo/logo.jpg', key: 'white' },
  // Their .com is a one-line JS redirect to the .ng, which is where the site
  // and the art actually live.
  'solola-akpana': 'https://sololaakpana.ng/wp-content/uploads/2024/02/sololalogo-2.png',
  // The 2024 rebrand mark. The _footer file beside it is the same lockup
  // reversed for their dark footer.
  advocaat: 'https://advocaat-law.com/wp-content/uploads/2024/11/cropped-advocaat-new-log_web_201.png',
  'kola-awodein': { url: 'https://kolaawodeinandco.com/img/logo.jpg', key: 'white' },
  // Not logo_terralex.png, which is the badge of a network they belong to, and
  // not fotter-logo.png, which is the theme's demo art rather than anything of
  // theirs. This is their own mark, published white for a dark header.
  'fra-law': { url: 'https://www.frawilliams.com/wp-content/uploads/2018/08/logo.png', negate: true },
  // The 2x asset from the same srcset. Same mark at 155px rather than 79px,
  // which is the difference between a legible device and a smudge. It reads
  // light (lum 186) but it is a genuinely pale blue mark, not reversed art, so
  // the LIGHT flag is a false positive here and it stays as the firm draws it.
  'chris-ogunbanjo': 'https://chrisogunbanjo.com/wp-content/uploads/2021/01/Logo@2x-1.png',
  'idowu-sofola': {
    url: 'https://idowusofola.com/wp-content/uploads/2019/06/Idowu-Sofola-logo.png',
    insecure: true,
  },
  'femi-atoyebi': {
    url: 'https://femiatoyebi.com.ng/wp-content/uploads/2025/06/faco-white.svg',
    referer: 'https://femiatoyebi.com.ng/',
    recolour: { from: '#FFFFFF', to: INK },
  },

  // ---- third batch, also 2026-08-08 ----------------------------------------
  // The full-size upload, not the 166x69 thumbnail the header actually renders.
  'olisa-agbakoba':
    'https://oal.law/wp-content/uploads/2025/10/imgi_2_Olisa-Agbakoba-Legal-OAL-Logo.png',
  // The official PNG rather than AO2LAW-FULL-LOGO-WHITE.png, which is the
  // reversed pair for their dark sections.
  'ao2-law': 'https://ao2law.com/wp-content/uploads/2024/02/AO2LAW-Official-Logo-PNG.png',
  // yoa-logo.png, not yoa-logo-light.png: same artwork, but the "light" file is
  // opaque and measured lum 193 against 105 for this one.
  'yusuf-ali': 'https://www.yusufali.net/assets/img/yoa-logo.png',

  // ---- fourth batch, 2026-08-08 ---------------------------------------------
  // The "cropped-" prefix is WordPress's site-icon crop, but here it and the
  // uncropped AB_siteLogo-v3.png are byte-identical at 290x31, so there is no
  // better original to prefer.
  'afe-babalola': 'https://afebabalola.com/wp-content/uploads/2024/03/cropped-AB_siteLogo-v3.png',
  // Not oakelegallogo-removebg-preview.png. The name is the warning: somebody
  // ran it through a background remover, and it measured lum 196 against 33 for
  // this one, which is the firm's actual file.
  'oake-legal': 'https://oakelegal.com/wp-content/uploads/2022/04/logo.d9401ed7.png',
  // Reversed, and there is no dark pair. Both files the site serves are the
  // same white mark, at lum 225 and 231.
  'law-crest': {
    url: 'https://thelawcrest.com/wp-content/uploads/2022/03/logo-1.png',
    negate: true,
  },
  // The filename says it: this is the white footer mark, lum 255, and it is the
  // only logo anywhere in the served HTML.
  'matrix-solicitors': {
    url: 'https://matrixsolicitors.com/wp-content/uploads/2019/08/Matrix-logo-white-footer.png',
    negate: true,
  },
  // The device on its own, not plplogo.png. That file is the full lockup, and
  // its wordmark is white for the site's dark header: the swirl came through
  // and "PINHEIRO LP" beside it was invisible on cream. Negating was not an
  // option either, since it would have thrown the orange in the device to blue.
  // The device alone is the whole mark and it stands up unaided.
  'pinheiro': 'https://pinheirolp.com/images/logo-.png',
  // The Brizy upload at 237x167, not the 122x90 JPEG beside it: twice the size
  // and it carries alpha, where the JPEG is an opaque plate at lum 216.
  'enr-advisory':
    'https://enradvisory.com/wp-content/uploads/brizy/imgs/ENR-Advisory-Logo-290x200-1-e1722355815247-305x243x0x19x305x203x1722355815.png',
  'mj-numa': 'https://www.mjnuma.com/assets1/logo.png',
  // The og:image, not the header file. Both are the same mark, but the header
  // one is 139x61 and stops after the "AS" plate, so the firm's name is missing
  // from it entirely; this is 538x233 and carries the full lockup. It is an
  // opaque JPEG, hence the key. Safe here despite the pale letters inside the
  // navy plate: keying reads the darkest channel, so the plate stays opaque and
  // takes the lettering sitting on it with it.
  'aekley': {
    url: 'https://aekleysolicitors.com/wp-content/uploads/2023/02/Aekley-logo-rev.jpg',
    key: 'white',
  },

  // ---- fifth batch, 2026-08-27, the seven firms that took the directory to 75 -
  // F.O. Akinrele publish exactly one mark and it is white lettering baked onto
  // a flat brown header plate, rgb(132,85,58) across 51% of the file and out to
  // every corner. Neither existing repair fits: keyWhite would eat the
  // lettering, which IS the white here, and negate would turn the brown to a
  // pale blue nobody at that firm has ever used. `plate` is the third case, and
  // it is the cleanest of the three because the art is genuinely monochrome:
  // the mark is lifted off the ground as a matte and redrawn in ink.
  'fo-akinrele': {
    url: 'https://foakinrele.com/wp-content/themes/foa/images/logo.png',
    plate: '#845538',
  },
  // Their only mark is the reversed one for the dark header, at lum 246. Same
  // treatment as fra-law, law-crest and matrix-solicitors.
  'jk-gadzama': {
    url: 'https://j-kgadzamallp.com/assets/logo-white-1tRDbXJ7.png',
    negate: true,
  },
  // The full-size upload, not the 231x70 cropped copy the header renders. Note
  // there is no "-scaled" variant despite WordPress's usual pattern: that URL
  // 404s and the plain name is the original.
  'dikko-mahmoud':
    'https://dikkoandmahmoud.com/wp-content/uploads/2019/11/High-Resolution-Logo-DM.png',
  // An SVG, so it rasterises to whatever width the script asks for. Comes down
  // dark on transparent and needs nothing doing to it.
  'ninewells': 'https://ninewellsweb.vercel.app/assets/ninewells-logo-CXJ23_N4.svg',
  // logo-footer.png, NOT img/resources/logo.png. The header file is the
  // reversed pair for their dark hero and measured lum 255, flat white; the
  // footer file is the same lockup in the firm's actual green and gold, already
  // carrying alpha. The word "footer" in the filename is the only thing
  // distinguishing them and it points at the right one here.
  //
  // resolveTo IS NOT A HACK AROUND A DEAD SITE. The host is up and serving; it
  // is DNS for this one domain that fails, and only from some resolvers: a
  // query to 8.8.8.8 answers 165.140.69.238 immediately while the local
  // resolver times out, which is what fetch reports as a bare "fetch failed".
  // Try the plain download first if you are re-running this. If it works,
  // delete this line rather than keeping a pinned address that can go stale.
  'oa-omonuwa': {
    url: 'https://www.oaomonuwaandco.com/img/resources/logo-footer.png',
    resolveTo: '165.140.69.238',
  },
  // Their site serves this through an Optimole CDN rewrite that re-encodes to
  // AVIF. The origin path underneath it is the plain WordPress upload and is
  // what is fetched, so the art arrives as the firm uploaded it.
  'chukwunyere-chambers':
    'https://chukwunyere-chambers.org/wp-content/uploads/2020/01/logo.png',
  // Dark on transparent on the first attempt. It also settles the founding
  // year: the lockup carries EST. 1994 under the wordmark, which is the only
  // place on the site that date appears.
  'akaraiwe': 'https://www.akaraiweandassociates.com/images/logo.png',
}

/* Left on the monogram placeholder:
 *   lekan-bamidele  lbandcolaw.com returns 403 to any automated request. Not
 *                   worked around; the art needs saving by hand from a browser.
 *   giwa-osagie     the header mark is not in the served HTML (inline SVG or
 *                   injected), so nothing to point at yet.
 *   ikeyi-shittu    isc.ng publishes exactly one mark, Logo.png, and it is pure
 *                   white for their dark header (lum 255). There is no dark
 *                   variant anywhere on the site. A white logo on our cream
 *                   card is an invisible logo, so the monogram is the honest
 *                   result until someone supplies the art.
 *   abdulai-taiwo   RESOLVED 2026-08-09 by hand, so this script no longer has
 *                   anything to do for it. Nothing on abdulaitaiwo.com could
 *                   have been fetched: the header sets the name as text in
 *                   <a class="navbar-brand">, favicon.ico is a zero byte file,
 *                   and every image on the site is stock photography. The
 *                   wordmark came from elsewhere and was processed by hand. */

/** GET through node's https rather than fetch, for the two hosts that need
 *  something fetch will not give them: a relaxed certificate check, or an
 *  address supplied by hand because DNS will not produce one. */
function getViaHttps(url, headers, { insecure, resolveTo } = {}) {
  return new Promise((resolve, reject) => {
    const opts = { headers, timeout: 30000 }
    if (insecure) opts.rejectUnauthorized = false
    // Hands the socket an address directly instead of asking the resolver for
    // one. Everything else about the request, TLS and SNI included, still goes
    // through the hostname in the URL, so the server sees a normal request.
    // Node calls a custom lookup either as (host, options, cb) or as
    // (host, cb), and asks for an ARRAY when options.all is set. Answering the
    // wrong shape is what produces "Invalid IP address: undefined".
    if (resolveTo) {
      opts.lookup = (_hostname, a, b) => {
        const cb = typeof a === 'function' ? a : b
        const all = typeof a === 'object' && a !== null && a.all
        return all
          ? cb(null, [{ address: resolveTo, family: 4 }])
          : cb(null, resolveTo, 4)
      }
    }
    https
      .get(url, opts, res => {
        if (res.statusCode !== 200) {
          res.resume()
          return reject(new Error(`HTTP ${res.statusCode}`))
        }
        const chunks = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', reject)
      .on('timeout', function () {
        this.destroy(new Error('timeout'))
      })
  })
}

async function download(pick) {
  const { url, referer, insecure, resolveTo } = pick
  const headers = { 'User-Agent': UA, ...(referer ? { Referer: referer } : {}) }

  if (insecure || resolveTo) return getViaHttps(url, headers, { insecure, resolveTo })

  const res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Mean luminance of the non-transparent pixels. Reversed art is nearly all
 *  white ink, so it lands high; normal dark-on-white art lands low. */
async function inkBrightness(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  let sum = 0
  let n = 0
  for (let i = 0; i < data.length; i += info.channels) {
    const a = data[i + 3]
    if (a < 32) continue // ignore transparent padding
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    n++
  }
  return n ? sum / n : 0
}

await mkdir(OUT, { recursive: true })

const report = []

for (const [slug, raw] of Object.entries(PICKS)) {
  const pick = typeof raw === 'string' ? { url: raw } : raw
  try {
    let buf = await download(pick)

    const isSvg = pick.url.toLowerCase().endsWith('.svg')

    // Swap the fill before rasterising, so the mark is drawn in ink rather than
    // painted over afterwards. Only touches the exact colour named.
    if (pick.recolour && isSvg) {
      const { from, to } = pick.recolour
      const text = buf.toString('utf8')
      const swapped = text.replace(new RegExp(from, 'gi'), to)
      if (swapped === text) throw new Error(`recolour found no ${from} to replace`)
      buf = Buffer.from(swapped, 'utf8')
    }

    const img = isSvg
      ? sharp(buf, { density: 600 }).resize({ width: 1600, fit: 'inside', withoutEnlargement: false })
      : sharp(buf)

    let out = await img.png({ compressionLevel: 9 }).toBuffer()
    try {
      out = await sharp(out).trim({ threshold: 12 }).png({ compressionLevel: 9 }).toBuffer()
    } catch {
      /* uniform image: trim throws, keep untrimmed */
    }

    // Trim first, key second. Keying turns the border transparent, and trim
    // reads the border colour, so the other order leaves the plate behind.
    // The same ordering argument applies to `plate`, and more strongly: trim
    // reads the uniform brown border and crops straight to the lettering, so
    // the matte runs over the mark rather than over a field of empty ground.
    if (pick.plate) out = await keyPlate(out, pick.plate, INK)
    if (pick.key === 'white') out = await keyWhite(out)

    // Colour channels only. Alpha is left alone so the mark keeps the
    // transparent surround it arrived with.
    if (pick.negate) out = await sharp(out).negate({ alpha: false }).png({ compressionLevel: 9 }).toBuffer()

    const m = await sharp(out).metadata()
    const lum = await inkBrightness(out)
    await writeFile(path.join(OUT, `${slug}.png`), out)
    report.push({ slug, w: m.width, h: m.height, lum, bytes: out.length })
  } catch (err) {
    report.push({ slug, error: err.message })
  }
}

console.log('--- written ---')
for (const r of report.filter(r => !r.error).sort((a, b) => b.w * b.h - a.w * a.h)) {
  // Above ~170 the art is predominantly light and will disappear on cream.
  const flag = r.lum > 170 ? '  <-- LIGHT, re-source' : ''
  console.log(
    `${r.slug.padEnd(20)} ${(r.w + 'x' + r.h).padEnd(11)} lum ${r.lum.toFixed(0).padStart(3)}${flag}`
  )
}
const failed = report.filter(r => r.error)
if (failed.length) {
  console.log('\n--- failed ---')
  for (const r of failed) console.log(`${r.slug.padEnd(20)} ${r.error}`)
}
console.log(`\n${report.length - failed.length}/${Object.keys(PICKS).length} written.`)
