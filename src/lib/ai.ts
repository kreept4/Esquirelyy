import Anthropic from '@anthropic-ai/sdk'

/**
 * Shared plumbing for the four AI tool routes.
 *
 * All four were failing intermittently for the same three reasons, each of which
 * looked to a user like "the tool is broken".
 *
 * The calls are slow. A cover letter takes about thirteen seconds and a CV
 * review considerably longer, and they were issued non-streaming. A long
 * non-streaming POST is the classic way to collect an HTTP timeout somewhere
 * between the browser, the platform and the API, so every request is now
 * streamed. Nothing consumes the individual deltas, we just want the connection
 * producing bytes the whole time instead of going silent for half a minute.
 *
 * The connection is not reliable. Observed in one sitting: a genuine 500 from
 * the API, and a dropped connection, on consecutive requests that were fine
 * moments later. Transient faults are normal and the fix is to retry rather
 * than to surface them.
 *
 * And when something did fail, the route handed the raw error straight to the
 * page. Users were shown the string
 *   500 {"type":"error","error":{"type":"api_error", ...}}
 * which is not a message, it is a stack trace wearing a coat. Errors are now
 * translated into something a person can act on.
 */

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  /**
   * ⚠ THIS WAS 4, AND IT MULTIPLIED WITH STREAM_ATTEMPTS BELOW.
   *
   * The original note said "the extra attempt is cheap next to making someone
   * upload their CV again", and for a connection that never opened that is
   * true — a request refused before it starts costs nothing. The mistake was
   * that this number does not stand alone. Four SDK retries inside three stream
   * attempts is up to twelve billed attempts for one click, on a route asking
   * for 16,000 Opus tokens.
   *
   * The expensive case is not the request that fails to connect. It is the one
   * that streams half an answer and then dies: those tokens are billed, and the
   * retry starts again from nothing. Two is enough to ride out a blip.
   */
  maxRetries: 2,
})

/**
 * Per-request ceiling, in milliseconds.
 *
 * This is the number that was actually breaking CV review. A deliberately short
 * one page test CV took fifty seconds to review, against a route ceiling of
 * sixty, so any real two page CV ran out of time and the user got a failure
 * after a minute of waiting. The routes now allow the platform maximum of five
 * minutes, and this sits just inside it so that a genuine overrun comes back as
 * our own sentence rather than as a dead connection.
 */
const REQUEST_TIMEOUT_MS = 290_000

/** Thrown when the model was reached but its answer could not be used. */
export class AIFormatError extends Error {}

/** Thrown when the tools have been switched off deliberately. */
export class AIDisabledError extends Error {}

/**
 * The off switch.
 *
 * ⚠ AN ENV VAR RATHER THAN A CODE CHANGE, BECAUSE THE MOMENT YOU NEED THIS IS
 * THE MOMENT A DEPLOY IS TOO SLOW. Set AI_TOOLS_DISABLED to 1 in Vercel and the
 * five tools stop calling Claude on the next request, with no build and no
 * promote. Clear it and they resume.
 *
 * The alternative people reach for is revoking the Anthropic key, which does
 * stop the spend but produces a different failure: every tool throws an
 * authentication error, users are told the service is unavailable with no
 * indication it was on purpose, and the agent sweep breaks alongside them. This
 * stops the five interactive tools and nothing else, and says so plainly.
 */
export function aiToolsDisabled(): boolean {
  const flag = (process.env.AI_TOOLS_DISABLED || '').trim().toLowerCase()
  return flag === '1' || flag === 'true'
}

/** One wording, used by the quota gate and by askClaude, so they agree. */
export const AI_DISABLED_MESSAGE =
  'This tool is switched off for maintenance and will be back shortly. Your daily allowance has not been used.'

type AskOptions = {
  system: string
  prompt: string
  maxTokens: number
  model?: string
}

/**
 * One streamed request, returning the assembled text.
 *
 * Sonnet 4.6 is deliberate. These are interactive tools where the user is
 * watching a spinner, and it turns a cover letter around in about thirteen
 * seconds against roughly twenty four for Opus 5. Opus 5 is the better writer
 * and worth revisiting, but not before the CV review path is measured against
 * the sixty second ceiling, since that one sends a whole CV and asks for four
 * times as many tokens back.
 */
/**
 * Does this look like the network rather than the request?
 *
 * The SDK's own retries only cover failures it sees before the response starts.
 * Once bytes are flowing, a dropped connection surfaces as a bare undici error
 * whose entire message is "terminated", which is not an Anthropic error class
 * and so escapes every instanceof check. That exact failure was observed here
 * on an otherwise valid request, so it is caught by name.
 */
function isTransient(err: any): boolean {
  if (err instanceof Anthropic.APIConnectionError) return true
  if (err instanceof Anthropic.RateLimitError) return true
  if (err instanceof Anthropic.APIError) return (err.status ?? 0) >= 500
  const msg = String(err?.message || '').toLowerCase()
  const cause = String(err?.cause?.message || err?.cause?.code || '').toLowerCase()
  return /terminated|socket|econnreset|etimedout|epipe|network|fetch failed/.test(msg + ' ' + cause)
}

/**
 * ⚠ EVERY ATTEMPT AFTER THE FIRST IS PAID FOR TWICE.
 *
 * A stream that dies halfway has already produced tokens, and those tokens are
 * billed whether or not anything usable came back. Restarting means paying for
 * the whole answer again — there is no resume. So this number is not "how hard
 * do we try", it is "how many times will we pay for the same CV review".
 *
 * Two, with maxRetries: 2 on the client, is a worst case of four billed
 * attempts. It was three with maxRetries: 4, which is twelve.
 */
const STREAM_ATTEMPTS = 2

export async function askClaude({ system, prompt, maxTokens, model }: AskOptions): Promise<string> {
  /* Belt and braces. The quota gate already turns the request away before it
     writes anything, so in the normal path this never fires. It stays because
     a future route could call askClaude without going through that gate, and
     an off switch that depends on every caller remembering is not one. */
  if (aiToolsDisabled()) throw new AIDisabledError(AI_DISABLED_MESSAGE)

  let lastErr: any

  // Retry the whole stream, not just the connect. A generation that dies
  // halfway has to be restarted from the top, because there is no way to
  // resume a partial one, and a partial answer is useless to a JSON parser.
  for (let attempt = 1; attempt <= STREAM_ATTEMPTS; attempt++) {
    try {
      const stream = anthropic.messages.stream(
        {
          model: model ?? 'claude-sonnet-4-6',
          max_tokens: maxTokens,
          system,
          messages: [{ role: 'user', content: prompt }],
        },
        { timeout: REQUEST_TIMEOUT_MS }
      )

      const message = await stream.finalMessage()

      // A truncated answer is never valid JSON, so say what actually happened
      // rather than letting it fail later as an unhelpful parse error.
      if (message.stop_reason === 'max_tokens') {
        throw new AIFormatError('The response was cut short before it finished.')
      }
      if (message.stop_reason === 'refusal') {
        throw new AIFormatError('That request could not be processed. Please rephrase and try again.')
      }

      return message.content.map(b => (b.type === 'text' ? b.text : '')).join('')
    } catch (err: any) {
      lastErr = err
      if (err instanceof AIFormatError || !isTransient(err) || attempt === STREAM_ATTEMPTS) throw err

      // Back off a little before retrying, so a brief outage has a moment to
      // clear rather than being hit three times in the same second.
      console.warn(`Claude stream attempt ${attempt} failed (${err?.message}), retrying`)
      await new Promise(r => setTimeout(r, attempt * 1500))
    }
  }

  throw lastErr
}

/**
 * Strip the typography that marks text as machine written.
 *
 * ⚠ WHY THIS IS CODE AND NOT ANOTHER LINE IN THE PROMPT. house-style.ts already
 * bans every character below, and the ban mostly works. Mostly is the problem.
 * A prompt is a request, and one em dash in a cover letter a student sends to a
 * firm is the whole tell. This runs on the way out, so the guarantee does not
 * depend on the model having complied.
 *
 * The prompt rule stays regardless. It produces better sentences, because a
 * model told to avoid a dash recasts the clause, whereas this can only swap a
 * character for the nearest honest substitute after the fact.
 */
export function toPlainText(value: string): string {
  return (
    value
      .replace(/ /g, ' ')
      /**
       * ⚠ RANGES ARE RESOLVED BEFORE THE COMMA RULE, AND GETTING THIS WRONG
       * CHANGES WHAT THE CV SAYS. A dash between two dates is a range, not a
       * dash doing a comma's job. Turning "April 2025 - December 2025" into
       * "April 2025, December 2025" silently converts one job lasting eight
       * months into two events, on the very line a recruiter reads to work out
       * how long somebody stayed anywhere.
       *
       * Matching a four digit year against a following month, year or open end
       * covers how dates are actually written on a CV, including the Nigerian
       * "till date". Spaced, because that is the convention the CV prompt's own
       * output examples already use.
       */
      .replace(
        /(\d{4})\s*[–—]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?(?:\s+\d{4})?|\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow|[Tt]ill\s+[Dd]ate|[Dd]ate)/g,
        '$1 - $2'
      )
      /* Numeric ranges written tight stay tight: "40-60 contracts", "pages 12-15". */
      .replace(/(\d)\s*[–—]\s*(\d)/g, '$1-$2')
      /* Everything left is a dash doing a comma's job, which is the usage the
         house style objects to. */
      .replace(/\s*[–—]\s*/g, ', ')
      .replace(/[‘’‚‛]/g, "'")
      .replace(/[“”„‟]/g, '"')
      .replace(/…/g, '...')
      .replace(/−/g, '-')
      /* Tidy the seams the substitution leaves: a comma inserted next to
         punctuation that was already there. */
      .replace(/\s+,/g, ',')
      .replace(/,\s*([,.;:!?])/g, '$1')
      .replace(/,\s*$/, '')
      .trim()
  )
}

/** Apply toPlainText to every string in a parsed response, at any depth. */
function clean<T>(value: T): T {
  if (typeof value === 'string') return toPlainText(value) as unknown as T
  if (Array.isArray(value)) return value.map(clean) as unknown as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = clean(v)
    return out as T
  }
  return value
}

/**
 * Parse the model's JSON.
 *
 * Every route asks for bare JSON and every route separately re-implemented the
 * same two fallbacks, because models occasionally wrap the object in a code
 * fence or prepend a line of commentary regardless of instructions. Both
 * recoveries live here once.
 *
 * ⚠ THE CLEANUP RUNS AFTER THE PARSE, NEVER BEFORE, and the order is not a
 * preference. Straightening a curly quote inside the raw JSON text would turn
 * {"a":"he said “hi”"} into a string containing a bare double quote,
 * which is no longer valid JSON. After the parse those characters are ordinary
 * content and safe to rewrite.
 */
export function parseJSON<T = any>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()

  try {
    return clean(JSON.parse(cleaned))
  } catch {
    // Salvage the outermost object if the model wrote anything around it.
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return clean(JSON.parse(match[0]))
      } catch {
        /* fall through to the throw below */
      }
    }
    console.error('Unparseable model response:', raw.slice(0, 2000))
    throw new AIFormatError('The response came back malformed.')
  }
}

/**
 * Turn whatever went wrong into a sentence worth showing someone.
 *
 * The status codes matter here because the advice genuinely differs: a 429 means
 * wait, a connection fault means try again now, and a 500 from the API is not
 * something the user can do anything about but should still be told plainly
 * rather than left staring at a spinner.
 */
export function friendlyError(err: any, noun: string): { error: string; status: number } {
  /* Deliberately off, so it is not an error to investigate and the message is
     already written for the person reading it. 503 with no "try again", which
     would be false: trying again in ten seconds will do nothing. */
  if (err instanceof AIDisabledError) {
    return { error: err.message, status: 503 }
  }

  if (err instanceof AIFormatError) {
    return { error: `${err.message} Please try again.`, status: 502 }
  }

  if (err instanceof Anthropic.APIConnectionTimeoutError) {
    return {
      error: `This is taking longer than expected. Your ${noun} may be unusually long, or the connection is slow. Please try again.`,
      status: 504,
    }
  }

  if (err instanceof Anthropic.APIConnectionError) {
    return {
      error: 'Could not reach the writing service. Check your connection and try again.',
      status: 503,
    }
  }

  if (err instanceof Anthropic.RateLimitError) {
    return { error: 'Too many requests right now. Please wait a moment and try again.', status: 429 }
  }

  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    // The user cannot fix this and should not see the API's wording for it.
    console.error('Anthropic credentials rejected:', err.message)
    return { error: 'The writing service is unavailable. Please try again later.', status: 503 }
  }

  if (err instanceof Anthropic.APIError) {
    console.error(`Anthropic API error ${err.status}:`, err.message)
    return { error: 'The writing service had a problem. Please try again in a moment.', status: 502 }
  }

  // A dropped connection that never became an SDK error class. Left to itself
  // this reaches the user as the single word "terminated".
  if (isTransient(err)) {
    console.error('Transient network failure after retries:', err?.message)
    return {
      error: 'The connection dropped while writing. Please try again.',
      status: 503,
    }
  }

  // Our own thrown errors (unsupported file type, unreadable upload) already
  // read as instructions, so they pass through as written.
  console.error('Unexpected tool error:', err)
  return { error: err?.message || 'Something went wrong. Please try again.', status: 500 }
}
