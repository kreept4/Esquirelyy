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
  /* One call at the end of a mock interview, reviewing the whole transcript.
     The interview itself makes no calls: its follow-ups are written by the
     question generation that started the session. */
  'interview-debrief': 6,
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
 * a broadcast to ninety people, reads as an outage. The busiest legitimate day
 * the ledger has recorded is 15 calls (9 November 2026). 100 is over six times
 * that and caps the worst day at roughly $45 if every call were a CV generation.
 * It was 400, about $180 a day, which was a ceiling in name only.
 *
 * Overridden by AI_GLOBAL_DAILY_LIMIT, set to 100 in Vercel production on
 * 11 November 2026. The default matches it so that a missing or garbled env
 * value never loosens the cap.
 *
 * ⚠ CHANGING THE ENV VALUE NEEDS A REDEPLOY. This comment used to say "tunable
 * without a deploy", and on Vercel that is false: env values are fixed into a
 * deployment when it is built. Change it in Vercel, then redeploy production
 * (`vercel redeploy <production url> --target production --scope
 * kreepts-projects`). It is still quicker than a code change, as nothing is
 * rebuilt from source, but it is not instant.
 */
const GLOBAL_DAILY_DEFAULT = 100

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
 * Simultaneous requests are handled. All three checks run inside
 * claim_ai_quota in the database behind a lock, so twenty requests fired at
 * once queue up and only the first passes the gap. See the note on
 * requireUserWithQuota below.
 */
const MIN_SECONDS_BETWEEN: Record<AiRoute, number> = {
  'cv-generate': 45,
  'cv-review': 30,
  'cover-letter': 20,
  'interview-prep': 20,
  'interview-feedback': 5,
  'interview-debrief': 30,
}

/** Friendly name for the message the user actually sees. */
const ROUTE_NAMES: Record<AiRoute, string> = {
  'cv-generate': 'CV generations',
  'cv-review': 'CV reviews',
  'cover-letter': 'cover letters',
  'interview-prep': 'interview prep sessions',
  'interview-feedback': 'answer reviews',
  'interview-debrief': 'mock interview reviews',
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
 * ⚠ THE CHECK AND THE RECORD ARE ONE STEP, IN THE DATABASE. This used to count,
 * compare, then insert as three separate requests, and the note here called
 * the race "one extra call at the boundary". It was far worse than that. Every
 * request arriving before the first insert read the same count, so a burst got
 * through whole. Tested on 11 November 2026: 20 parallel requests against a
 * limit of 3, and all 20 passed.
 *
 * claim_ai_quota (scripts/2026-11-11-ai-usage-atomic-claim.sql) now runs the
 * gap, the daily limit and the platform ceiling inside one transaction behind
 * one lock. The same test lets exactly 3 through the limit, exactly 1 through
 * the gap and stops exactly at the ceiling. The function is callable only with
 * the service role, so the browser key cannot spend a member's allowance.
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

  /* One call does all three checks and records the call, atomically. The
     window (midnight UTC) is worked out inside the function, so the server and
     the ledger cannot disagree about what "today" means. */
  const { data, error } = await db.rpc('claim_ai_quota', {
    p_user: auth.user.id,
    p_route: route,
    p_limit: limit,
    p_min_gap_seconds: MIN_SECONDS_BETWEEN[route],
    p_global_cap: globalDailyLimit(),
  })

  /**
   * ⚠ A BROKEN LEDGER FAILS OPEN, ON PURPOSE, AND THIS IS THE ONE JUDGEMENT
   * HERE WORTH DISAGREEING WITH.
   *
   * If the claim fails (function missing, grant not applied, Supabase having a
   * moment), the choice is to block every AI request or to let them through
   * uncounted. Blocking turns a bookkeeping fault into a total outage of the
   * tools for every member at once. Letting them through means the quota
   * silently stops applying, which costs money.
   *
   * Fails open because the Anthropic spend limit is the real backstop and this
   * is the convenience layer in front of it. That reasoning only holds while
   * that limit is actually set. If it is not, flip this to fail closed.
   */
  if (error || !data) {
    console.error(`[ai-quota] could not claim ${route}, allowing through:`, error?.message ?? 'no result')
    return { user: auth.user, error: null }
  }

  const result = data as { ok: boolean; reason?: 'burst' | 'daily' | 'global'; wait?: number; count?: number }
  if (result.ok) return { user: auth.user, error: null }

  if (result.reason === 'burst') {
    const wait = Math.max(1, result.wait ?? MIN_SECONDS_BETWEEN[route])
    return {
      user: null,
      error: NextResponse.json(
        { error: `That was quick. Give it ${wait} more second${wait === 1 ? '' : 's'} and try again.` },
        /* Retry-After says the same thing to something that is not a person,
           and a well-behaved client backs off on it rather than hammering. */
        { status: 429, headers: { 'Retry-After': String(wait) } }
      ),
    }
  }

  if (result.reason === 'global') {
    console.error(`[ai-quota] GLOBAL DAILY CEILING HIT: ${result.count} calls today, cap ${globalDailyLimit()}`)
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
