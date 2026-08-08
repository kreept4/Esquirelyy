import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  DELETION_GRACE_DAYS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from '@/lib/account'

export const runtime = 'nodejs'

/**
 * Account settings.
 *
 * One route with an `action` rather than five routes, because every one of
 * these is the same shape: authenticate, write one or two columns on the
 * caller's own `profiles` row, hand back the new state. Splitting that into
 * /break, /delete, /notifications and so on would have been five copies of the
 * auth check and five chances for one of them to be forgotten.
 *
 * NOTHING HERE TAKES AN ID. Every write is scoped to the session's own user, so
 * there is no request shape that can address someone else's row — the row is
 * chosen by the cookie, never by the body. RLS would stop a cross-user write
 * anyway, but a route that cannot express the attack is better than one that
 * expresses it and is refused.
 */

type Action = 'save-profile' | 'start-break' | 'end-break' | 'request-deletion' | 'cancel-deletion'

const BREAK_MAX_DAYS = 90

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/** Only the three known keys, and only booleans. The column is JSONB, so
 *  whatever is sent is what gets stored — including keys nobody reads and
 *  values no consumer expects — unless it is rebuilt from a known shape. */
function cleanPreferences(raw: unknown): NotificationPreferences {
  const input = (raw ?? {}) as Record<string, unknown>
  const out = { ...DEFAULT_NOTIFICATION_PREFERENCES }
  for (const key of Object.keys(DEFAULT_NOTIFICATION_PREFERENCES) as (keyof NotificationPreferences)[]) {
    if (typeof input[key] === 'boolean') out[key] = input[key] as boolean
  }
  return out
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s.length ? s.slice(0, max) : null
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return bad('You need to be signed in.', 401)

  let body: any
  try {
    body = await req.json()
  } catch {
    return bad('Malformed request.')
  }

  const action = body?.action as Action
  const now = new Date()

  switch (action) {
    /* The editable half of the profile. `email` is deliberately not here: it is
       the account's identity and changing it is an auth operation with a
       verification step, not a settings field. */
    case 'save-profile': {
      const patch: Record<string, unknown> = {
        full_name: str(body.fullName, 120),
        career_stage: str(body.careerStage, 60),
        location: str(body.location, 120),
        linkedin_url: str(body.linkedinUrl, 300),
        notification_preferences: cleanPreferences(body.notifications),
        updated_at: now.toISOString(),
      }
      if (Array.isArray(body.practiceAreas)) {
        patch.practice_areas = body.practiceAreas
          .filter((a: unknown) => typeof a === 'string')
          .map((a: string) => a.trim())
          .filter(Boolean)
          .slice(0, 12)
      }

      const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
      if (error) return bad(error.message, 500)
      return NextResponse.json({ ok: true })
    }

    /* A break is stored as the moment it ends, so it expires without anything
       having to run. Clamped rather than trusted: the UI offers 7, 14 and 28,
       and a hand-made request asking for ten years should not be able to lock
       an account out of its own alerts indefinitely. */
    case 'start-break': {
      const days = Number(body.days)
      if (!Number.isFinite(days) || days < 1 || days > BREAK_MAX_DAYS) {
        return bad(`Choose a break between 1 and ${BREAK_MAX_DAYS} days.`)
      }
      const until = new Date(now)
      until.setUTCDate(until.getUTCDate() + Math.round(days))

      const { error } = await supabase
        .from('profiles')
        .update({ break_started_at: now.toISOString(), break_until: until.toISOString() })
        .eq('id', user.id)
      if (error) return bad(error.message, 500)
      return NextResponse.json({ ok: true, breakUntil: until.toISOString() })
    }

    case 'end-break': {
      const { error } = await supabase
        .from('profiles')
        .update({ break_started_at: null, break_until: null })
        .eq('id', user.id)
      if (error) return bad(error.message, 500)
      return NextResponse.json({ ok: true })
    }

    /**
     * Mark for deletion. Nothing is destroyed here.
     *
     * The stamp starts the clock and that is all it does; the erase happens
     * after the grace period, and signing in before then cancels it (see
     * cancelPendingDeletion in lib/account.ts). Writing the request is
     * reversible, which is the entire point of doing it this way for a job
     * board — the realistic moment someone presses delete is straight after a
     * rejection.
     */
    case 'request-deletion': {
      const { error } = await supabase
        .from('profiles')
        .update({ deletion_requested_at: now.toISOString() })
        .eq('id', user.id)
      if (error) return bad(error.message, 500)

      const on = new Date(now)
      on.setUTCDate(on.getUTCDate() + DELETION_GRACE_DAYS)
      return NextResponse.json({ ok: true, deletionOn: on.toISOString() })
    }

    case 'cancel-deletion': {
      const { error } = await supabase
        .from('profiles')
        .update({ deletion_requested_at: null })
        .eq('id', user.id)
      if (error) return bad(error.message, 500)
      return NextResponse.json({ ok: true })
    }

    default:
      return bad('Unknown action.')
  }
}
