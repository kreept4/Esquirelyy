import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { aiToolsDisabled, AI_DISABLED_MESSAGE } from '@/lib/ai'

/**
 * The per-user daily quota on the AI routes.
 *
 * api-auth.ts named this as the missing piece and said so in its own header:
 * authentication "does NOT stop a signed-in user looping the expensive routes.
 * A per-user quota on the AI endpoints is the next piece of this and is not in
 * here." This is it.
 *
 * ⚠ WHAT THIS IS FOR. It is a COST CONTROL, not a security boundary. It stops a
 * member — or a script behind a free account — turning a $0.45 endpoint into a
 * four-figure month. It is not trying to stop a determined attacker, who can
 * make more accounts; that is what the spend limit on the Anthropic account is
 * for, and no amount of application code substitutes for it.
 */

/**
 * Calls per user per day.
 *
 * Set from what the route costs and what honest use looks like, not from a
 * round number. A member polishing a CV genuinely runs the reviewer three or
 * four times in an evening; nobody legitimately runs it fifty times.
 *
 * ⚠ cv-generate IS THE TIGHTEST BECAUSE IT IS THE DEAREST. Opus 5 at 16,000
 * output tokens is roughly $0.45 a call, ten times what the cover letter costs.
 * Three a day is enough to generate, read it, and regenerate once — and it caps
 * that route's worst case at about $1.35 per member per day rather than
 * unbounded.
 */
export const AI_LIMITS = {
  'cv-generate': 3,
  'cv-review': 5,
  'cover-letter': 10,
  'interview-prep': 10,
  /* Higher, and not an inconsistency: this one fires once per answer inside a
     practice session, so a single legitimate sitting is a dozen calls. It is
     also the cheapest route on the list at 1,024 tokens. */
  'interview-feedback': 40,
} as const

export type AiRoute = keyof typeof AI_LIMITS

/**
 * ============================================================
 * THE PLATFORM-WIDE CEILING
 * ============================================================
 *
 * ⚠ THE PER-USER QUOTA ABOVE DOES NOT BOUND THE BILL, AND THE HEADER OF THIS
 * FILE ALREADY SAYS WHY: an attacker "can make more accounts". Signup is free,
 * takes an email, and has no captcha in front of it, so the real daily maximum
 * is not 3 CV generations, it is 3 multiplied by however many accounts somebody
 * cares to create. With 99 accounts today the honest worst case is already into
 * three figures a day; with a script pointed at signup it is unbounded.
 *
 * That header then says the backstop is "the spend limit on the Anthropic
 * account", and it is right that no application code substitutes for it. But
 * that limit fails hard: when it trips, every AI route on the platform starts
 * returning provider errors to real members with no warning and no wording of
 * our own. This ceiling sits below it and fails soft, in our voice, at a number
 * we choose.
 *
 * ⚠ SET IT FROM WHAT A NORMAL DAY LOOKS LIKE, NOT FROM WHAT LOOKS SAFE. Too
 * high and it never fires. Too low and a genuinely busy day, the morning after
 * a broadcast to ninety people, reads as an outage. The default below is about
 * five times the busiest legitimate day the ledger has recorded, which leaves
 * room to grow and still catches abuse an order of magnitude before the invoice
 * does.
 *
 * Tunable without a deploy through AI_GLOBAL_DAILY_LIMIT, because the number
 * you want during an incident is not the number you want on a Tuesday.
 */
const GLOBAL_DAILY_DEFAULT = 400

function globalDailyLimit(): number {
  const raw = Number((process.env.AI_GLOBAL_DAILY_LIMIT || '').trim())
  return Number.isFinite(raw) && raw > 0 ? raw : GLOBAL_DAILY_DEFAULT
}

/**
 * The smallest gap between two calls by the same user on the same route.
 *
 * ⚠ A DAILY COUNT IS NOT A RATE. The quota above says a member may run the
 * cover letter ten times today; it says nothing about whether they may run it
 * ten times in four seconds. They can, and a browser tab left looping does
 * exactly that: ten concurrent requests, ten Anthropic calls in flight, ten
 * functions billed at once, and the count query races itself so the eleventh
 * often gets through too.
 *
 * The interval is per route because the routes are not alike. Nobody reads a CV
 * review in under half a minute, so thirty seconds there costs an honest user
 * nothing. interview-feedback fires once per answer in a live practice session
 * and a fast typist genuinely submits two answers inside a minute, so it gets
 * the shortest gap on the list.
 *
 * ⚠ THIS IS NOT A SECURITY CONTROL EITHER. It is measured from the ledger, so
 * two requests arriving in the same instant can both read the same empty window
 * and both pass. It cuts sustained looping, which is the actual failure mode,
 * and it does not pretend to be a mutex.
 */
const MIN_SECONDS_BETWEEN: Record<AiRoute, number> = {
  'cv-generate': 45,
  'cv-review': 30,
  'cover-letter': 20,
  'interview-prep': 20,
  'interview-feedback': 5,
}

/** Friendly name for the message the user actually sees. */
const ROUTE_NAMES: Record<AiRoute, string> = {
  'cv-generate': 'CV generations',
  'cv-review': 'CV reviews',
  'cover-letter': 'cover letters',
  'interview-prep': 'interview prep sessions',
  'interview-feedback': 'answer reviews',
}

/**
 * Authenticate, check the quota, and record the call.
 *
 * Replaces the bare `requireUser()` at the top of each AI route, so adding the
 * quota is one line per route rather than a block copied five times and edited
 * four.
 *
 * ⚠ THE CALL IS RECORDED BEFORE CLAUDE RUNS, NOT AFTER, AND THAT IS DELIBERATE.
 * A request that fails partway is still billed for whatever streamed before it
 * died — that is precisely how a retry loop runs up a bill — so counting only
 * successes would leave the expensive failure mode uncounted. It costs an
 * honest user one slot on the rare occasion a route errors, which is the right
 * side to be wrong on.
 *
 * ⚠ COUNT-THEN-INSERT IS NOT ATOMIC. Two requests landing in the same
 * millisecond can both see the count below the limit and both proceed. That is
 * accepted: the failure is one extra call at the boundary, and the fix — a
 * database function and a transaction — is a lot of machinery to buy an
 * off-by-one on a budget guard.
 */
/**
 * Accounts the daily limit does not apply to.
 *
 * ⚠ THIS IS AN EXEMPTION FROM A SPENDING CONTROL, so it is deliberately not a
 * column on the user row that anything in the app can set. It is read from the
 * environment, which means adding somebody to it is a deploy, not a click, and
 * a compromised session cannot grant it to itself.
 *
 * Comma-separated, matched on the email, case-insensitively — an address is
 * what a person actually knows about their own account, and the id is not.
 *
 * ⚠ SET IT IN VERCEL TOO, NOT ONLY IN .env.local. The local file governs the
 * dev server and nothing else, so an exemption that exists only there will look
 * like it works right up until it is tried on the live site.
 */
const EXEMPT_EMAILS = new Set(
  (process.env.AI_QUOTA_EXEMPT_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
)

export async function requireUserWithQuota(
  route: AiRoute
): Promise<{ user: { id: string; email?: string }; error: null } | { user: null; error: NextResponse }> {
  const auth = await requireUser()
  if (auth.error) return auth

  /* The off switch is checked here, before the ledger is written, so a tool
     switched off mid-incident does not quietly spend people's daily allowance
     on requests it was never going to answer. */
  if (aiToolsDisabled()) {
    return { user: null, error: NextResponse.json({ error: AI_DISABLED_MESSAGE }, { status: 503 }) }
  }

  /* Exempt accounts skip the ledger entirely rather than being counted and
     waved through. Counting them would leave the usage table implying a spend
     pattern for a user the limit never applied to. */
  if (auth.user.email && EXEMPT_EMAILS.has(auth.user.email.toLowerCase())) {
    return { user: auth.user, error: null }
  }

  const limit = AI_LIMITS[route]
  const db = createAdminClient()

  /* Midnight UTC. Not the user's local midnight — the quota is a spending
     control and the bill is denominated in UTC days, so anything else means the
     window and the invoice disagree. */
  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)

  /* ⚠ ROWS, NOT A HEAD COUNT, and the change is load bearing. This was
     `select('id', { head: true })`, which returns a number and nothing else.
     The burst check below needs the most recent timestamp, and asking for it
     separately would be a second round trip for data the first query is already
     standing on. The ceiling is 40 rows on the busiest route, so reading them
     costs less than the extra query would. */
  const { data: mine, error } = await db
    .from('ai_usage')
    .select('created_at')
    .eq('user_id', auth.user.id)
    .eq('route', route)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  const count = mine?.length ?? 0

  /**
   * ⚠ A BROKEN LEDGER FAILS OPEN, ON PURPOSE, AND THIS IS THE ONE JUDGEMENT
   * HERE WORTH DISAGREEING WITH.
   *
   * If the count query fails — table missing, grant not applied, Supabase
   * having a moment — the choice is to block every AI request or to let them
   * through uncounted. Blocking turns a bookkeeping fault into a total outage of
   * the paid-for features for every member at once. Letting them through means
   * the quota silently stops applying, which costs money.
   *
   * Fails open because the Anthropic spend limit is the real backstop and this
   * is the convenience layer in front of it. That reasoning only holds while
   * that limit is actually set. If it is not, flip this to fail closed.
   */
  if (error) {
    console.error(`[ai-quota] could not read usage for ${route}, allowing through:`, error.message)
    return { user: auth.user, error: null }
  }

  /* ---- Burst -------------------------------------------------------------
     Checked before the daily limit, because a user who is looping should be
     told to slow down rather than told they have spent an allowance that the
     loop is in the middle of spending for them. */
  const gap = MIN_SECONDS_BETWEEN[route]
  const lastAt = mine?.[0]?.created_at
  if (gap && lastAt) {
    const sinceLast = (Date.now() - new Date(lastAt).getTime()) / 1000
    if (sinceLast >= 0 && sinceLast < gap) {
      const wait = Math.max(1, Math.ceil(gap - sinceLast))
      return {
        user: null,
        error: NextResponse.json(
          {
            error: `That was quick. Give it ${wait} more second${wait === 1 ? '' : 's'} and try again.`,
          },
          /* Retry-After is the standard way to say the same thing to something
             that is not a person, and a well-behaved client backs off on it
             rather than hammering. */
          { status: 429, headers: { 'Retry-After': String(wait) } }
        ),
      }
    }
  }

  /* ---- The platform ceiling ----------------------------------------------
     Counted across every user and every route. See the note on
     GLOBAL_DAILY_DEFAULT: this is the backstop the per-user quota cannot be,
     because signup is free and unprotected.

     ⚠ CHECKED AFTER THE USER'S OWN LIMITS, ON PURPOSE. It is the rarest of the
     three and the most expensive to evaluate, and a member who is over their
     own allowance should be told that rather than told the platform is busy,
     which would be both less useful and less true. */
  const cap = globalDailyLimit()
  const { count: globalCount, error: globalError } = await db
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since.toISOString())

  if (globalError) {
    /* Fails open, consistent with the per-user read below and for the same
       reason recorded there. */
    console.error('[ai-quota] could not read the global count, allowing through:', globalError.message)
  } else if ((globalCount ?? 0) >= cap) {
    console.error(`[ai-quota] GLOBAL DAILY CEILING HIT: ${globalCount} calls today, cap ${cap}`)
    return {
      user: null,
      error: NextResponse.json(
        {
          /* Deliberately does not say "limit" or name a number. This is our
             ceiling, not the member's fault, and telling them the platform is
             unusually busy is both true and the only thing they can act on. */
          error:
            'Our writing tools are unusually busy today and have paused to keep up. ' +
            'Please try again later, or tomorrow. Your own daily allowance has not been used.',
        },
        { status: 503, headers: { 'Retry-After': '3600' } }
      ),
    }
  }

  if ((count ?? 0) >= limit) {
    return {
      user: null,
      error: NextResponse.json(
        {
          error:
            `You have used your ${limit} ${ROUTE_NAMES[route]} for today. ` +
            `The limit resets at midnight UTC.`,
        },
        { status: 429 }
      ),
    }
  }

  const { error: writeError } = await db
    .from('ai_usage')
    .insert({ user_id: auth.user.id, route })

  /* A failed write is logged and not fatal, for the same reason as above: the
     member asked for a CV review, not for a lecture about our ledger. */
  if (writeError) {
    console.error(`[ai-quota] could not record ${route} usage:`, writeError.message)
  }

  return { user: auth.user, error: null }
}
