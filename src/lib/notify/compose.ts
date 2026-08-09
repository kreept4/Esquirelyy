/**
 * The house voice for anything an agent sends.
 *
 * The brief was specific and it is worth keeping in one place rather than
 * scattered across two agents: professional, warm, formal, addresses Bolu as
 * Boss, short paragraphs, bullets where they earn their place, and the tone of
 * an experienced project manager rather than a status webhook.
 *
 * WHY A BUILDER RATHER THAN A TEMPLATE STRING PER AGENT. Two agents writing
 * their own greetings drift within a month, and the drift is the tell: one
 * says "Good morning Boss," the other says "Hi Boss", and the whole thing
 * starts reading like software again. The greeting, the sign-off, the bullet
 * character and the ordering are decided here once.
 *
 * ⚠ NO EM DASHES ANYWHERE IN THE OUTPUT. It is the single clearest signal that
 * a message was written by a model rather than by a person, and these messages
 * are meant to read as a colleague reporting in. Commas, colons and full stops
 * do the same work. This is enforced below rather than left to whoever writes
 * the next agent.
 */

/** Bullet character. WhatsApp renders no markdown lists, so this is literal. */
const BULLET = '•'

/** WhatsApp caps a single message body at 4096 characters. */
export const MAX_BODY = 4096

export interface BriefInput {
  /** Opening line, without the greeting. "The news sweep is done." */
  headline: string
  /** Optional short paragraphs. Each is one idea. Kept to three or fewer. */
  paragraphs?: string[]
  /** Optional bulleted facts. Short noun phrases, not sentences. */
  bullets?: string[]
  /** What Bolu has to do, if anything. Rendered last and set apart. */
  ask?: string
  /** Optional link, usually the Vercel preview awaiting a promote. */
  url?: string
}

/**
 * Time-of-day greeting in Lagos, because that is where the reader is and the
 * agents run on a server whose clock is not.
 */
function greeting(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-NG', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      hour12: false,
    }).format(now)
  )
  if (hour < 12) return 'Good morning, Boss.'
  if (hour < 17) return 'Good afternoon, Boss.'
  return 'Good evening, Boss.'
}

/**
 * Strip the tells.
 *
 * Em dashes and en dashes become commas or full stops depending on what sits
 * around them, because a dash standing in for a comma and a dash standing in
 * for a colon are different repairs. Runs of whitespace collapse, since a
 * message assembled from optional parts otherwise ships with blank gaps where
 * a section was empty.
 */
function clean(s: string): string {
  return s
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/[ \t]+/g, ' ')
    .replace(/ +\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Fit the body to one WhatsApp message.
 *
 * Truncating mid-sentence reads as a bug, so this cuts at the last paragraph
 * break that fits and says plainly that there is more. The full text is always
 * in the run log, which is where anything long belongs anyway.
 */
function fit(body: string): string {
  if (body.length <= MAX_BODY) return body
  const note = '\n\n(Trimmed to fit. The full run log has the rest.)'
  const room = MAX_BODY - note.length
  const cut = body.slice(0, room)
  const lastBreak = cut.lastIndexOf('\n\n')
  return (lastBreak > room * 0.5 ? cut.slice(0, lastBreak) : cut.trimEnd()) + note
}

/**
 * Assemble a message.
 *
 * Order is fixed and it is the order a busy reader wants: what happened, then
 * the detail, then the facts as bullets, then the one thing being asked of
 * them, then the link. The ask sits near the end because a reader who skims
 * the top and stops should still have got the headline, and a reader who
 * scrolls is looking for what to do.
 */
export function brief(input: BriefInput, now = new Date()): string {
  const parts: string[] = [greeting(now), input.headline]

  for (const p of (input.paragraphs ?? []).slice(0, 3)) {
    if (p.trim()) parts.push(p.trim())
  }

  const bullets = (input.bullets ?? []).filter(b => b.trim())
  if (bullets.length) parts.push(bullets.map(b => `${BULLET} ${b.trim()}`).join('\n'))

  if (input.ask?.trim()) parts.push(input.ask.trim())
  if (input.url) parts.push(input.url)

  return fit(clean(parts.join('\n\n')))
}
