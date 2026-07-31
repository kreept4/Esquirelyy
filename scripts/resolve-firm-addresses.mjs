/**
 * Resolve real office addresses for every firm in the directory using the Google
 * Places API, and report what would change.
 *
 *   node scripts/resolve-firm-addresses.mjs            # dry run, prints a diff
 *   node scripts/resolve-firm-addresses.mjs --write    # rewrites firms-data.ts
 *
 * Requires GOOGLE_MAPS_API_KEY in .env.local, from a Google Cloud project with
 * the Places API enabled and billing turned on.
 *
 * Why Text Search rather than Geocoding: geocoding resolves an address string you
 * already have. We mostly do NOT have one — 7 firms record only "Lagos, Nigeria"
 * — so we search by business name and take the address Google holds for it.
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA = path.join(ROOT, 'src/lib/firms-data.ts')
const WRITE = process.argv.includes('--write')

// -- key ---------------------------------------------------------------------
for (const line of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
const KEY = process.env.GOOGLE_MAPS_API_KEY
if (!KEY) {
  console.error(
    'GOOGLE_MAPS_API_KEY is not set.\n\n' +
    '  1. console.cloud.google.com -> create/select a project\n' +
    '  2. Enable "Places API (New)" and attach a billing account\n' +
    '  3. Credentials -> Create credentials -> API key\n' +
    '  4. Restrict it to the Places API\n' +
    '  5. Add to .env.local:  GOOGLE_MAPS_API_KEY=your_key\n\n' +
    'Then re-run. Nothing was changed.'
  )
  process.exit(1)
}

// -- read the firms ----------------------------------------------------------
const src = fs.readFileSync(DATA, 'utf8')
const names = [...src.matchAll(/name: '([^']+)'/g)].map(m => m[1])
const officeBlocks = [...src.matchAll(/offices: \[([^\]]*)\]/g)]

const firms = names.map((name, i) => {
  const raw = officeBlocks[i]?.[1] ?? ''
  const cities = [...raw.matchAll(/city: '([^']*)'/g)].map(m => m[1])
  const addresses = [...raw.matchAll(/address: '([^']*)'/g)].map(m => m[1])
  return { name, cities, addresses, index: i }
})

// -- resolve -----------------------------------------------------------------
async function search(query) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location',
    },
    body: JSON.stringify({ textQuery: query, regionCode: 'NG' }),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  const json = await res.json()
  return json.places ?? []
}

const results = []
for (const firm of firms) {
  // One query per city the firm already claims, so multi-office firms resolve
  // each branch rather than collapsing to the head office.
  const cities = firm.cities.length ? firm.cities : ['Lagos', 'Abuja', 'Port Harcourt']
  const found = []
  for (const city of cities) {
    try {
      const places = await search(`${firm.name} law firm ${city} Nigeria`)
      const hit = places[0]
      if (hit) found.push({ city, address: hit.formattedAddress, matched: hit.displayName?.text })
    } catch (err) {
      console.error(`  ! ${firm.name} (${city}): ${err.message}`)
    }
    await new Promise(r => setTimeout(r, 120)) // stay well under the QPS limit
  }
  results.push({ ...firm, found })

  const before = firm.addresses.join(' | ') || '(none)'
  const after = found.map(f => `${f.city}: ${f.address}`).join(' | ') || '(no match)'
  const changed = before !== found.map(f => f.address).join(' | ')
  console.log(`${changed ? 'CHANGE' : 'same  '}  ${firm.name}`)
  if (changed) {
    console.log(`         was: ${before}`)
    console.log(`         now: ${after}`)
  }
}

fs.writeFileSync(
  path.join(ROOT, 'firm-addresses.json'),
  JSON.stringify(results, null, 2),
  'utf8'
)
console.log(`\nWrote firm-addresses.json (${results.length} firms).`)

if (!WRITE) {
  console.log('Dry run — firms-data.ts untouched. Re-run with --write to apply.')
  process.exit(0)
}

// -- write back --------------------------------------------------------------
// Replaces only the offices array of each firm, in file order, leaving every
// other field alone.
let out = src
let cursor = 0
let applied = 0
for (const firm of results) {
  if (!firm.found.length) continue
  const block = src.match(/offices: \[[^\]]*\]/g)?.[firm.index]
  if (!block) continue
  const idx = out.indexOf(block, cursor)
  if (idx === -1) continue
  const rebuilt =
    'offices: [' +
    firm.found
      .map(f => `{ city: '${f.city.replace(/'/g, "\\'")}', address: '${f.address.replace(/'/g, "\\'")}' }`)
      .join(', ') +
    ']'
  out = out.slice(0, idx) + rebuilt + out.slice(idx + block.length)
  cursor = idx + rebuilt.length
  applied++
}
fs.writeFileSync(DATA, out, 'utf8')
console.log(`Applied ${applied} firms to firms-data.ts. Review with: git diff src/lib/firms-data.ts`)
