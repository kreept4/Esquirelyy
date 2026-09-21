/**
 * What we already know about the employer, handed to the model as facts.
 *
 * WHY THIS FILE EXISTS
 *
 * The letter is now required to answer "why this firm" and "why this team".
 * Those are the two questions that produced every rhetorical sentence the
 * prompt file complains about, and the reason is not that the model writes
 * badly. It is that the question was being asked of a model that knew nothing
 * about the firm. Asked why a firm appeals, with no facts about it, the only
 * moves available are flattery and strain: "your firm's reputation for
 * excellence", or a contorted sentence reaching for a reason that was never
 * there. Both are template tells, and a recruiter spots them in a second.
 *
 * We have the facts. src/lib/firms-data.ts is a researched directory with
 * offices, practice areas, directory bands and the practice areas those bands
 * were earned in. The directory page renders it; the letter tool never read it.
 * So the fix for the AI-slop complaint is not another ban list. It is giving the
 * model something true to say, and then insisting it says only that.
 *
 * THE FACTS ARE ALSO WHAT MAKES 200 WORDS POSSIBLE. A letter that has to
 * argue its way to a reason spends forty words doing it. A letter that has the
 * band, the practice area and the office spends nine, and the nine are the ones
 * a partner actually reads.
 *
 * ⚠ EVERYTHING IN THE BLOCK BELOW IS CHECKABLE BY THE RECRUITER READING IT.
 * That is the whole standard. A band and its edition year, an office city, a
 * practice area the firm publishes. Nothing inferred, nothing softened into an
 * impression. If a fact is not in the record it does not reach the prompt, and
 * the prompt tells the model plainly that the absence of a fact is not an
 * invitation to supply one.
 */

import { ALL_FIRMS, RANKING_SOURCES, type Firm } from '@/lib/firms-data'

/* Same normaliser firms-data uses for the logo lookup, and it has to stay the
   same: "Aluko & Oyebode", "Aluko and Oyebode" and "aluko-oyebode" are one
   employer, and a student typing the second of those is the common case. */
const norm = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '')

/**
 * Find the directory record for whatever the candidate typed in the employer box.
 *
 * ⚠ EXACT MATCH ONLY, for the reason logoForEmployer records: a prefix or
 * contains match is too loose and silently resolves to the wrong firm. The cost
 * of missing a firm here is a letter written without firm facts, which is the
 * behaviour the tool had all along. The cost of matching the wrong firm is a
 * letter that tells a recruiter at one firm about another firm's Chambers band,
 * which is unrecoverable for the candidate who sent it.
 *
 * formerName and alsoKnownAs are matched as well as name and shortName, because
 * both are live routes to the same firm: somebody told about "CLP Legal" by a
 * lecturer types that, and Raji Chambers trades under two names today.
 */
export function findEmployerFirm(employer?: string | null): Firm | null {
  if (!employer) return null
  const target = norm(employer)
  if (!target) return null

  return (
    ALL_FIRMS.find(f =>
      norm(f.name) === target ||
      norm(f.shortName) === target ||
      norm(f.slug) === target ||
      (f.formerName ? norm(f.formerName) === target : false) ||
      (f.alsoKnownAs ? norm(f.alsoKnownAs) === target : false)
    ) || null
  )
}

/**
 * Does the division the candidate named correspond to something the firm
 * actually publishes as a practice?
 *
 * Loose on purpose, and this is the one place looseness is right: a candidate
 * types "banking", the firm publishes "Banking & Finance", and they mean the
 * same team. A false positive here is mild, because the matched string reaches
 * the model as the firm's own label rather than as an assertion about anything.
 * A false negative tells the model the division is not on the firm's published
 * list when it is, which is the worse of the two.
 */
function matchPracticeArea(firm: Firm, division: string): string | null {
  const d = norm(division)
  if (!d) return null
  return (
    firm.practiceAreas.find(area => {
      const a = norm(area)
      return a === d || a.includes(d) || d.includes(a)
    }) || null
  )
}

/**
 * The facts block.
 *
 * Returns null where we have no record, which is the normal case for banks,
 * fintechs, regulators and the handful of firms that are on the job board
 * without being in the directory. Null is handled in the prompt, and it is
 * handled by writing a shorter letter rather than a vaguer one.
 *
 * ⚠ THE DIVISION IS PASSED IN BECAUSE IT CHANGES WHICH FACTS MATTER. A
 * candidate applying to the dispute resolution team needs the dispute
 * resolution band, not the firm's highest band in anything. Printing the whole
 * ranking row and leaving the model to choose invites it to reach for the most
 * impressive number, which is how a letter ends up telling a litigation
 * recruiter about a corporate ranking.
 */
export function buildFirmFacts(
  employer: string,
  division?: string | null
): string | null {
  const firm = findEmployerFirm(employer)
  if (!firm) return null

  const lines: string[] = []

  lines.push(`FACTS ON FILE FOR ${firm.name.toUpperCase()}`)
  lines.push('')
  lines.push(
    "These come from Esquirely's own researched directory. They are true and a" +
    ' recruiter can check every one of them. They are also the ONLY facts about' +
    ' this employer you have. Do not add to them from memory, and do not soften' +
    ' any of them into an impression. You will use one or two of these, not all' +
    ' of them: the letter has 200 words and a list of facts about the firm is as' +
    ' much a template as a paragraph of praise is.'
  )
  lines.push('')

  lines.push(`What the firm is: ${firm.description}`)

  if (firm.foundedYear) lines.push(`Founded: ${firm.foundedYear}.`)

  const cities = firm.offices.map(o => o.city)
  if (cities.length) {
    lines.push(
      `Offices: ${cities.join(', ')}.` +
      (cities.length > 1
        ? ' A candidate who is in one of these cities, or who has worked in one, may say so plainly. Do not make more of it than that.'
        : '')
    )
  }

  lines.push(`Practice areas the firm publishes: ${firm.practiceAreas.join(', ')}.`)

  /* The directory bands, each with the practice areas it was earned in and the
     edition it was read from. The year is printed because a band without one
     reads as a permanent state of the world, and because a candidate who writes
     "your Band 1 banking practice" is quoting a particular guide and should be
     able to say which if a partner asks at interview. */
  const bands = RANKING_SOURCES.flatMap(source => {
    const entry = firm.rankings?.[source.key]
    if (!entry) return []
    const areas = entry.areas?.length ? ` for ${entry.areas.join(', ')}` : ''
    return [`${source.full}: ${entry.band}${areas} (${entry.year} edition)`]
  })

  if (bands.length) {
    lines.push('')
    lines.push('Independent directory rankings, which the firm cannot award itself:')
    bands.forEach(b => lines.push(`  ${b}`))
  }

  if (firm.rankedIndividuals?.length) {
    lines.push('')
    lines.push(
      'Ranked lawyers at the firm. ⚠ THESE ARE RANKINGS HELD BY A PERSON, NOT BY' +
      ' THE FIRM. Never write that the firm holds a band on the strength of one' +
      ' of these:'
    )
    firm.rankedIndividuals.forEach(p => {
      const src = RANKING_SOURCES.find(s => s.key === p.source)?.label || p.source
      const band = p.band ? `, ${p.band}` : ''
      const area = p.area ? ` for ${p.area}` : ''
      const year = p.year ? ` (${p.year})` : ''
      lines.push(`  ${p.name}: ranked by ${src}${band}${area}${year}`)
    })
  }

  if (firm.memberships?.length) {
    lines.push('')
    lines.push('Trade body memberships, which are not rankings:')
    firm.memberships.forEach(m => lines.push(`  ${m.body} (${m.full}): ${m.note}`))
  }

  /* The division check. Three outcomes, and each tells the model something
     different about what it is allowed to write. */
  if (division) {
    lines.push('')
    const matched = matchPracticeArea(firm, division)
    if (matched) {
      const rankedHere = RANKING_SOURCES.flatMap(source => {
        const entry = firm.rankings?.[source.key]
        if (!entry?.areas?.length) return []
        const hit = entry.areas.some(
          a => norm(a).includes(norm(division)) || norm(division).includes(norm(a))
        )
        return hit ? [`${source.full} ${entry.band} (${entry.year})`] : []
      })

      lines.push(
        `THE DIVISION APPLIED TO: ${division}. The firm publishes this as "${matched}",` +
        ' so it is a real team here and you may name it as one.'
      )
      if (rankedHere.length) {
        lines.push(
          `That practice specifically holds: ${rankedHere.join('; ')}.` +
          ' ⚠ THIS IS A SELECTION SIGNAL AND NOT A SENTENCE. It tells you the' +
          ' team is serious about this work, so lead with whatever the candidate' +
          ' has done that sits closest to it and let the match speak for itself.' +
          ' Do NOT write the band into the letter. The recruiter works there and' +
          ' knows their own ranking, so quoting it back spends a line of 200' +
          ' telling the reader something they already knew, and it is the' +
          ' clearest single sign that a tool assembled the letter rather than a' +
          ' candidate writing one.'
        )
      } else {
        lines.push(
          'No directory band is recorded for this practice specifically. Do not' +
          " borrow the firm's band in another area and attach it to this one."
        )
      }
    } else {
      lines.push(
        `THE DIVISION APPLIED TO: ${division}. ⚠ This does not match any practice` +
        ' area the firm publishes. That may be because the firm labels it' +
        ' differently, or because the candidate typed it loosely, so do NOT tell' +
        ' the employer they do not have such a team. Write about the work itself' +
        " and leave the firm's published list out of that sentence."
      )
    }
  }

  return lines.join('\n')
}
