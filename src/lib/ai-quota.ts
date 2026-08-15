import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

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
export async function requireUserWithQuota(
  route: AiRoute
): Promise<{ user: { id: string; email?: string }; error: null } | { user: null; error: NextResponse }> {
  const auth = await requireUser()
  if (auth.error) return auth

  const limit = AI_LIMITS[route]
  const db = createAdminClient()

  /* Midnight UTC. Not the user's local midnight — the quota is a spending
     control and the bill is denominated in UTC days, so anything else means the
     window and the invoice disagree. */
  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)

  const { count, error } = await db
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.user.id)
    .eq('route', route)
    .gte('created_at', since.toISOString())

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
