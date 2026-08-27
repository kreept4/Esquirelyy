/**
 * Find each firm's LinkedIn page, from the firm's own website.
 *
 * ⚠ WHY NOT SEARCH LINKEDIN. Because the answer would not be checkable. Company
 * pages are behind an auth wall that answers automated requests with a 999, and
 * a Nigerian law firm's name is not unique enough to guess a slug from: there
 * are several "Alliance Law Firm" pages on LinkedIn and only one of them is
 * this one. A URL that cannot be verified is worse here than an absent field,
 * because the field renders as a link and a reader who follows it to the wrong
 * firm has been actively misled.
 *
 * A link in the firm's own footer has neither problem. The firm published it,
 * which makes it both correct and attributable, and finding it costs one
 * request to a site this repo already fetches logos from.
 *
 * WHAT IT WILL NOT FIND, and this is expected rather than a failure:
 *   - firms with no LinkedIn presence at all
 *   - firms whose social links are injected by script after load, since this
 *     reads served HTML and does not run a browser
 *   - firms whose site is down on the day it runs
 * All three come back in the "none found" list to be filled in by hand or left
 * absent. Absent is a perfectly good answer.
 *
 * Run: node scripts/harvest-firm-linkedin.mjs
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA = path.join(ROOT, 'src', 'lib', 'firms-data.ts')
const OUT = path.join(ROOT, 'scripts', 'firm-linkedin.json')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

/** Hosts the local resolver will not answer for. Same note as the logo script. */
const PINNED = { 'www.oaomonuwaandco.com': '165.140.69.238' }

/** Paths worth a second look when the home page carries no social links. Ordered
 *  by how often a Nigerian firm site puts its socials there. */
const FALLBACK_PATHS = ['/contact', '/contact-us', '/about', '/about-us']

const src = await readFile(DATA, 'utf8')

/* Read the records straight out of the source rather than importing it: the
   module is TypeScript and pulls in Supabase, and all that is wanted here is
   two strings per firm. */
const firms = []
for (const m of src.matchAll(/slug: '([^']+)',[\s\S]{0,1400}?name: '([^']+)',[\s\S]{0,1400}?website: '([^']+)'/g)) {
  firms.push({ slug: m[1], name: m[2], website: m[3] })
}

function get(url, redirects = 4) {
  return new Promise(resolve => {
    let u
    try { u = new URL(url) } catch { return resolve(null) }
    const opts = {
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      timeout: 20000,
    }
    const pin = PINNED[u.hostname]
    if (pin) {
      opts.lookup = (_h, a, b) => {
        const cb = typeof a === 'function' ? a : b
        const all = typeof a === 'object' && a !== null && a.all
        return all ? cb(null, [{ address: pin, family: 4 }]) : cb(null, pin, 4)
      }
    }
    // Certificates are not the point of this script and several of these sites
    // have neglected renewals; a stale cert should not cost a firm its link.
    opts.rejectUnauthorized = false

    const req = https.get(url, opts, res => {
      const loc = res.headers.location
      if (res.statusCode >= 300 && res.statusCode < 400 && loc && redirects > 0) {
        res.resume()
        return resolve(get(new URL(loc, url).href, redirects - 1))
      }
      if (res.statusCode !== 200) { res.resume(); return resolve(null) }
      const chunks = []
      let size = 0
      res.on('data', c => {
        size += c.length
        // Enough to reach any footer. Some of these ship megabytes of inlined
        // base64 and none of it is a social link.
        if (size < 3_000_000) chunks.push(c)
      })
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
    req.on('error', () => resolve(null))
    req.on('timeout', () => { req.destroy(); resolve(null) })
  })
}

/** &amp; and &#038; back to &, so a slug is not cut in half by its own markup. */
const unescape = s =>
  s
    .replace(/&#0?38;|&amp;/gi, '&')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))

/** Words in a name that say nothing about which firm it is. */
const STOP = new Set([
  'and', 'co', 'llp', 'lp', 'law', 'legal', 'firm', 'the', 'partners', 'associates',
  'solicitors', 'attorneys', 'chambers', 'practice', 'advocates', 'barristers', 'nigeria',
])
const words = s => (s.toLowerCase().match(/[a-z]{3,}/g) ?? []).filter(w => !STOP.has(w))

/**
 * Pull company pages out of served HTML.
 *
 * ⚠ THE AMPERSAND IS THE WHOLE REASON THIS IS NOT A ONE-LINE REGEX.
 *
 * Half of these firms are "X & Y", their LinkedIn slug contains the ampersand,
 * and their own page writes it as `&#038;` or `&amp;` because that is what HTML
 * requires. Matching URL characters directly stops dead at the entity, so
 * `punuka-attorneys-&#038;-solicitors` came back as `punuka-attorneys-` — a slug
 * that looks plausible, resolves to nothing, and would have shipped as a link.
 * The markup is decoded first, and the ampersand is then percent-encoded, which
 * is the form LinkedIn itself serves: Banwo & Ighodalo's own footer carries both
 * spellings and the canonical one is `banwo%26ighodalo`.
 */
function findLinkedIn(html, firmName) {
  if (!html) return []
  const hits = new Set()
  const re = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(company|school|in)\/([A-Za-z0-9%._&-]{2,90})/gi
  for (const m of unescape(html).matchAll(re)) {
    const kind = m[1].toLowerCase()
    const slug = m[2]
      .replace(/[.]+$/, '')
      // A share widget's own URL, and the /posts/ or /about/ a copied address
      // carries. The page is the same page without them.
      .replace(/\/(posts|about|jobs|people).*$/i, '')
      .replace(/&/g, '%26')
    if (!slug || /^(linkedin|company-beta|shareArticle|sharing|feed)$/i.test(slug)) continue
    hits.add(`${kind}|${slug}`)
  }

  /* ⚠ MORE THAN ONE COMPANY PAGE MEANS ONE OF THEM IS NOT THIS FIRM, and taking
     whichever appeared first got that wrong in public. Stren & Blan's site
     links both `strenandblan` and `bridgeforte-attorneys`; the second is a
     different firm mentioned somewhere on the page, and it sorted first. So the
     candidates are scored on how much of the firm's own name is in the slug,
     and a tie falls back to document order. */
  const target = words(firmName)
  const score = h => {
    const slug = h.split('|')[1].toLowerCase()
    return target.filter(w => slug.includes(w)).length
  }
  return [...hits].sort((a, b) => {
    // A company page is the firm; a /in/ page is one partner's personal profile
    // and is only worth having when there is nothing else.
    const kind = (a.startsWith('in|') ? 1 : 0) - (b.startsWith('in|') ? 1 : 0)
    if (kind !== 0) return kind
    return score(b) - score(a)
  })
}

const results = {}
const none = []
const limit = 6
let i = 0

async function worker() {
  while (i < firms.length) {
    const { slug, name, website } = firms[i++]
    let found = findLinkedIn(await get(website), name)
    for (const p of FALLBACK_PATHS) {
      if (found.length) break
      found = findLinkedIn(await get(new URL(p, website).href), name)
    }
    if (found.length) {
      const [kind, id] = found[0].split('|')
      results[slug] = { url: `https://www.linkedin.com/${kind}/${id}`, kind, all: found.length }
      console.log(`${slug.padEnd(24)} ${kind.padEnd(8)} ${id}`)
    } else {
      none.push(slug)
      console.log(`${slug.padEnd(24)} -`)
    }
  }
}

await Promise.all(Array.from({ length: limit }, worker))
await writeFile(OUT, JSON.stringify({ results, none }, null, 2))

console.log(`\n${Object.keys(results).length}/${firms.length} found, ${none.length} without.`)
if (none.length) console.log('none found:', none.join(', '))
console.log(`\nwritten to ${path.relative(ROOT, OUT)}`)
