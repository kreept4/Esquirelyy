import { ADDRESS, esc, type Button } from './telegram'
import type { Candidate, Proposal, ScholarshipCandidate, Source } from './types'

/**
 * What a proposal looks like in the chat.
 *
 * ⚠ THE CARD IS THE PRODUCT. Everything else in lib/agent exists so that this
 * message can be read in about ten seconds and answered with one tap. If a card
 * cannot be judged without opening a browser, the agent has failed at its
 * actual job and has merely moved the work from finding to checking.
 *
 * Three rules follow from that, and they are why the layout is the shape it is:
 *
 *   The deciding facts go first. Employer, role, where, when it closes, how you
 *   apply. Not a headline and a summary — the things a listing is judged on.
 *
 *   Every claim is followed by its source. The links are the reason a tap is
 *   safe. A card without them is a notification, and a notification you have to
 *   verify yourself is one you stop reading.
 *
 *   What the agent is unsure of is stated, not buried. The caveat line is the
 *   most valuable line on the card, because it is the one that tells you when
 *   to look properly rather than tap.
 */

/** Telegram rejects a sendMessage over 4096 characters outright. */
const LIMIT = 3900

function clip(s: string): string {
  return s.length > LIMIT ? s.slice(0, LIMIT - 20) + '\n…(truncated)' : s
}

function sourceLines(sources: Source[]): string[] {
  if (!sources?.length) return ['', '<i>No sources recorded — treat this with suspicion.</i>']

  const out = ['', '<b>Sources</b>']
  for (const s of sources.slice(0, 4)) {
    out.push(`• <a href="${esc(s.url)}">${esc(s.title || s.url)}</a>`)
    if (s.quote) out.push(`  <i>“${esc(s.quote.slice(0, 180))}”</i>`)
  }
  return out
}

function confidenceLine(p: Proposal): string[] {
  const out: string[] = []
  if (p.confidence != null) {
    const pct = Math.round(p.confidence * 100)
    /* A bar rather than a number alone. Scanning a run of cards, the eye
       catches a short bar far faster than it reads "0.45", and the marginal
       ones are the whole reason you are reading. */
    const filled = Math.round(pct / 10)
    out.push(`\n${'▰'.repeat(filled)}${'▱'.repeat(10 - filled)} ${pct}% confident`)
  }
  if (p.caveats) out.push(`⚠ <i>${esc(p.caveats)}</i>`)
  return out
}

function listingCard(p: Proposal): string {
  const c = p.payload as Candidate & { logo_url?: string | null }

  const lines = [
    `🆕 <b>New listing</b>`,
    '',
    `<b>${esc(c.title)}</b>`,
    `${esc(c.employer)} — ${esc(c.location)}`,
    '',
    `Closes: ${c.deadline ? esc(c.deadline) : '<i>no date given (rolling)</i>'}`,
    `Level: ${esc(c.level)} · Type: ${esc(c.type)}`,
  ]

  if (c.practice_areas?.length) lines.push(`Practice: ${esc(c.practice_areas.join(', '))}`)

  /* The application route, spelled out. A listing nobody can apply to is the
     one failure that makes the board actively worse than empty, so it is shown
     on the card rather than left to be discovered after approval. */
  if (c.apply_url) lines.push(`Apply: <a href="${esc(c.apply_url)}">${esc(c.apply_url.slice(0, 60))}</a>`)
  else if (c.apply_email) lines.push(`Apply: ${esc(c.apply_email)}`)
  else lines.push('Apply: <b>⚠ no route found</b>')

  if (c.role_desc) lines.push('', esc(c.role_desc.slice(0, 400)))

  lines.push('', `<i>Provenance: ${esc(c.source)}</i>`)
  lines.push(...confidenceLine(p))
  lines.push(...sourceLines(p.evidence?.sources ?? []))

  return clip(lines.join('\n'))
}

function delistCard(p: Proposal): string {
  const d = p.payload as { slug: string; title?: string; employer?: string; reason: string }

  const lines = [
    `🗑 <b>Close this listing?</b>`,
    '',
    `<b>${esc(d.title || d.slug)}</b>`,
    d.employer ? esc(d.employer) : '',
    '',
    esc(d.reason),
    /* Said on every delist card, because the fear that stops somebody tapping
       is that it is irreversible. It is not, and the card should say so where
       the decision is made rather than in a file nobody reads. */
    '',
    '<i>This sets is_active = false. The row stays and can be reopened.</i>',
  ].filter(Boolean)

  lines.push(...confidenceLine(p))
  lines.push(...sourceLines(p.evidence?.sources ?? []))

  return clip(lines.join('\n'))
}

function scholarshipCard(p: Proposal): string {
  const s = p.payload as ScholarshipCandidate

  const lines = [
    `🎓 <b>New scholarship</b>`,
    '',
    `<b>${esc(s.title)}</b>`,
    esc(s.provider),
    '',
    `Deadline: ${esc(s.deadline)}`,
    `Level: ${esc(s.level)} · ${esc(s.type)}`,
    s.amount_description ? `Covers: ${esc(s.amount_description)}` : '',
    '',
    esc(s.description.slice(0, 400)),
    s.eligibility ? `\n<b>Who can apply:</b> ${esc(s.eligibility.slice(0, 300))}` : '',
    /* Set expectations on the card. Approving this does not put it on the site,
       and finding that out after tapping is how a control surface loses trust. */
    '',
    '<i>Approving returns a paste-ready block — scholarships live in TypeScript, so this one needs a deploy.</i>',
  ].filter(Boolean)

  lines.push(...confidenceLine(p))
  lines.push(...sourceLines(p.evidence?.sources ?? []))

  return clip(lines.join('\n'))
}

export function renderProposal(p: Proposal): string {
  switch (p.kind) {
    case 'list':
      return listingCard(p)
    case 'delist':
      return delistCard(p)
    case 'scholarship':
      return scholarshipCard(p)
    case 'email':
      return clip(`📣 <b>Announcement</b>\n\n${esc(JSON.stringify(p.payload).slice(0, 800))}`)
  }
}

/**
 * The buttons.
 *
 * ⚠ SIXTY-FOUR BYTES IS THE HARD CAP on callback_data, so the payload is a
 * verdict and an id and nothing else — 'ok:' plus a uuid is 39. The proposal
 * row is what says what will happen. See the note on sendMessage in telegram.ts
 * for why that is the safer arrangement as well as the only possible one.
 */
export function proposalButtons(p: Proposal): Button[][] {
  return [
    [
      { text: p.kind === 'delist' ? '✓ Close it' : '✓ Approve', data: `ok:${p.id}` },
      { text: '✕ Reject', data: `no:${p.id}` },
    ],
  ]
}

/**
 * The end-of-sweep summary.
 *
 * Sent even when nothing was found, and that is deliberate. A silent agent is
 * indistinguishable from a broken one, and the failure mode being guarded
 * against is the quiet one: a sweep erroring every morning for three weeks
 * while everything looks fine. "Nothing today" is information; silence is not.
 */
export function sweepSummary(s: {
  found: number
  proposed: number
  duplicates: number
  checked: number
  closing: number
  unreadable: number
  notes?: string
  errors: string[]
  ms: number
}): string {
  const lines = [
    `<b>Sweep finished, ${ADDRESS}</b> · ${Math.round(s.ms / 1000)}s`,
    '',
    `Found ${s.found} opportunit${s.found === 1 ? 'y' : 'ies'}, proposed ${s.proposed}` +
      (s.duplicates ? ` (${s.duplicates} already seen)` : ''),
    `Checked ${s.checked} existing listing${s.checked === 1 ? '' : 's'} — ${s.closing} look closed` +
      (s.unreadable ? `, ${s.unreadable} unreadable` : ''),
  ]

  if (s.notes) lines.push('', `<i>${esc(s.notes.slice(0, 600))}</i>`)

  if (s.errors.length) {
    lines.push('', '<b>Errors</b>')
    for (const e of s.errors.slice(0, 5)) lines.push(`• ${esc(e.slice(0, 200))}`)
  }

  if (!s.proposed && !s.closing) lines.push('', `Nothing needs you today, ${ADDRESS}.`)

  return clip(lines.join('\n'))
}
