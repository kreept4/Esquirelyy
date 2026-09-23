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
  // Publish-article-cuate, a fifth. One tone only: cuate shades a face with
  // line work rather than with a second fill.
  '#AD6359': '#A76D45',
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

/**
 * Colours that belong to the cuate style rather than to Storyset generally.
 *
 * ⚠ KEPT OUT OF PALETTE, AND THAT IS THE WHOLE POINT OF THE SEPARATION. These
 * greys were briefly in the shared map, and running the script then rewrote 45
 * fills in new-entries.svg, an illustration nobody had asked to change. A map
 * named for one style and applied to every file will keep doing that. Anything
 * only one drawing ships goes here and is listed per target.
 */
const CUATE = {
  '#FFC727': '#FBBF24', // its accent -> our amber
  /* Cuate ships flat cold greys where rafiki and amico ship white. Left alone
     they are the only cold surfaces in a set that is otherwise warm, which
     reads as a screenshot pasted into a drawing. */
  '#EBEBEB': '#F0EBE3',
  '#DBDBDB': '#E8E0D5',
  '#C7C7C7': '#E8E0D5',
  '#A6A6A6': '#D6D6D6',
}

/**
 * Colours replaced only inside one group of an illustration, by its id.
 *
 * ⚠ THIS EXISTS BECAUSE ONE SHAPE HAD TO DIVERGE FROM ITS OWN COLOUR. In
 * publish-article, Storyset paints the writer's shirt in the same accent as the
 * page header, the Publish button and the flowers. Bolu asked for the shirt in
 * black, and a global swap cannot say that: it would take the shirt and the
 * furniture together, or neither. Scoping by group id says the one thing meant
 * here, "this garment, not that accent", and leaves the rest of the artwork on
 * the accent it was drawn with.
 *
 * Applied BEFORE the global maps, so the shirt is already black by the time
 * #FFC727 -> amber runs and is not caught by it.
 */
const SCOPED = {
  'public/illustrations/publish-article.svg': [
    { group: 'freepik--Character--inject-4', map: { '#FFC727': '#1A1A1A' } },
    /* The ruled lines standing in for body text. The global grey map sends
       them to cream-border, which is right for the frames behind the character
       and too faint for type: at the size this renders, the article stops
       looking like it has anything written on it. */
    { group: 'freepik--Article--inject-4', map: { '#C7C7C7': '#D6D6D6' } },
  ],
}

const TARGETS = [
  { file: 'public/illustrations/file-searching.svg', maps: [SKIN, PALETTE] },
  { file: 'public/illustrations/404-illustration.svg', maps: [SKIN] },
  { file: 'public/illustrations/ambassador.svg', maps: [SKIN, PALETTE] },
  { file: 'public/illustrations/writing-letter.svg', maps: [SKIN, PALETTE] },
  /* The listings carousel slide. Ships in the same rafiki ramp as
     writing-letter, so both maps already cover every colour in it and nothing
     new had to be added to run it through. */
  { file: 'public/illustrations/new-entries.svg', maps: [SKIN, PALETTE] },
  /* The articles empty state. Cuate style rather than rafiki, so it brings its
     own greys and its own accent; both are handled above. */
  { file: 'public/illustrations/publish-article.svg', maps: [SKIN, PALETTE, CUATE] },
]

for (const { file, maps } of TARGETS) {
  if (!existsSync(file)) { console.log(`${file}  MISSING`); continue }
  let svg = readFileSync(file, 'utf8')
  const changes = []

  /* Group-scoped rules first. See the note on SCOPED for why the order is not
     arbitrary: these deliberately take a colour out of the reach of the global
     map that would otherwise claim it. */
  for (const { group, map } of SCOPED[file] || []) {
    const start = svg.indexOf(`id="` + group + `"`)
    if (start < 0) { changes.push(`group ` + group + ` NOT FOUND`); continue }
    /* To the next group at this level, or the end of the file. These exports
       are one flat list of <g id="freepik--..."> siblings, so the next id is
       the boundary. */
    const nextIdx = svg.slice(start + 1).search(/id="freepik--/)
    const end = nextIdx < 0 ? svg.length : start + 1 + nextIdx
    let seg = svg.slice(start, end)
    for (const [from, to] of Object.entries(map)) {
      const re = new RegExp(from, 'gi')
      const hits = (seg.match(re) || []).length
      if (hits) {
        seg = seg.replace(re, to)
        changes.push(`[` + group + `] ` + from + ` -> ` + to + `  x` + hits)
      }
    }
    svg = svg.slice(0, start) + seg + svg.slice(end)
  }

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
