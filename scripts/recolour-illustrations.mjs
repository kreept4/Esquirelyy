/**
 * Recolour the Storyset illustrations so the people in them look like the people
 * using the site, and so the artwork sits in Esquirelyy's palette.
 *
 * Two separate jobs.
 *
 * SKIN. Storyset ships one light skin ramp across its whole library. On a
 * platform built for the Nigerian bar that is the wrong default, and it is the
 * kind of thing users notice immediately even when they do not comment on it.
 * The replacement ramp keeps the same light-to-dark ordering, so every highlight
 * and shadow the illustrator drew still reads correctly; only the hue moves.
 *
 * PALETTE. The searching illustration is drawn in Storyset's blue-greys
 * (#263238, #455A64), which are close enough to the site's ink to look like a
 * mistake rather than a choice. Mapping them onto the real ink values makes the
 * artwork look commissioned rather than downloaded.
 *
 * Run: node scripts/recolour-illustrations.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'

/** Light to dark. Order matters more than the exact values: shading only reads
 *  correctly if the relative lightness of each step is preserved. */
const SKIN = {
  // Storyset defaults, used by file-searching.
  '#FFBE9D': '#A76D45',
  '#EB996E': '#8B5733',
  '#D89377': '#7C4E2E',
  '#BF7A62': '#653C24',
  // The 404 illustration was already recoloured once into the cream palette,
  // so it carries a different ramp.
  '#EDC4B8': '#A76D45',
  '#E0A99C': '#8B5733',
  '#B07A6E': '#653C24',
  // Ambassador-amico ships a third ramp again.
  '#C8856A': '#A76D45',
  '#AF6152': '#653C24',
  // Writing-a-letter-rafiki, a fourth.
  '#EBB376': '#A76D45',
  '#D58745': '#8B5733',
}

/** Storyset's blue-greys onto our ink. */
const PALETTE = {
  '#263238': '#1A1A1A',
  '#455A64': '#4A4A4A',
  '#37474F': '#3A3A3A',
  '#FF725E': '#EF4444', // accent, onto the one already in the design system
  // Storyset picks a different signature colour per illustration. Mapping them
  // onto stops the site already uses keeps a set of artwork drawn by different
  // hands looking like one commission.
  '#BA68C8': '#8B5CF6', // purple -> our violet
  '#407BFF': '#38BDF8', // blue   -> our sky
}

const TARGETS = [
  { file: 'public/illustrations/file-searching.svg', maps: [SKIN, PALETTE] },
  { file: 'public/illustrations/404-illustration.svg', maps: [SKIN] },
  { file: 'public/illustrations/ambassador.svg', maps: [SKIN, PALETTE] },
  { file: 'public/illustrations/writing-letter.svg', maps: [SKIN, PALETTE] },
]

for (const { file, maps } of TARGETS) {
  if (!existsSync(file)) { console.log(`${file}  MISSING`); continue }
  let svg = readFileSync(file, 'utf8')
  const changes = []

  for (const map of maps) {
    for (const [from, to] of Object.entries(map)) {
      // Case-insensitive: SVG exporters are inconsistent about hex casing.
      const re = new RegExp(from.replace('#', '#'), 'gi')
      const hits = (svg.match(re) || []).length
      if (hits) {
        svg = svg.replace(re, to)
        changes.push(`${from} -> ${to}  x${hits}`)
      }
    }
  }

  writeFileSync(file, svg)
  console.log(`\n${file}`)
  if (changes.length) changes.forEach(c => console.log('   ' + c))
  else console.log('   no matching colours found')
}
