import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword, isReused, HISTORY_DEPTH } from '@/lib/password-history'
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

type Action =
  | 'save-profile'
  | 'start-break'
  | 'end-break'
  | 'request-deletion'
  | 'cancel-deletion'
  | 'change-password'

const BREAK_MAX_DAYS = 90
const MIN_PASSWORD_LENGTH = 8

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

    /**
     * Change the password, refusing any the account has used before.
     *
     * ALL OF THIS IS SERVER SIDE ON PURPOSE. The browser could do the whole
     * thing with supabase.auth.updateUser({ password }), and that is what the
     * reset-password page does, because there the user arrived holding a
     * recovery token and there is no old password to check. Here there is a
     * rule to enforce, and a rule enforced next to the call it gates, in code
     * the caller controls, is a suggestion. The reuse check, the history and
     * the write all happen behind the service role where they cannot be
     * skipped by editing a request.
     *
     * THE CURRENT PASSWORD IS REQUIRED, even though Supabase does not ask for
     * it. Without it, anyone holding a stolen session cookie could set a new
     * password and take the account permanently, which turns a session
     * compromise into an account loss. Proving the old one first is what keeps
     * those two separate.
     */
    case 'change-password': {
      const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
      const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''

      if (!currentPassword || !newPassword) return bad('Fill in both password fields.')
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return bad(`Use at least ${MIN_PASSWORD_LENGTH} characters.`)
      }
      if (newPassword === currentPassword) {
        return bad('That is the password you are already using. Choose a different one.')
      }
      if (!user.email) return bad('This account has no email address on it.', 409)

      /* A SEPARATE, STATELESS CLIENT, NOT THE ONE ABOVE. The request-scoped
         client is wired to the caller's cookies, so signing in through it
         would write a fresh session onto this response as a side effect of a
         password check. This one holds no cookies and persists nothing, so a
         wrong password costs a failed call and nothing else. */
      const check = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }
      )
      const { error: wrongPassword } = await check.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (wrongPassword) return bad('That is not your current password.', 403)

      const admin = createAdminClient()

      const { data: history, error: historyError } = await admin
        .from('password_history')
        .select('id, hash')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(HISTORY_DEPTH)
      if (historyError) return bad(historyError.message, 500)

      const hashes = (history ?? []).map(r => r.hash as string)
      if (await isReused(newPassword, hashes)) {
        return bad('You have used that password before. Please choose one that is new to this account.')
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      })
      if (updateError) return bad(updateError.message, 500)

      /* Both hashes go in, not just the new one. The password being replaced
         has never been recorded before this moment — Supabase kept only its own
         copy and has now overwritten it — so without this line the very first
         password a user ever chose would be free to come back at the next
         change. Skipped when it is already known, which is the case from the
         second change onward. */
      const rows: { user_id: string; hash: string }[] = []
      if (!(await isReused(currentPassword, hashes))) {
        rows.push({ user_id: user.id, hash: await hashPassword(currentPassword) })
      }
      rows.push({ user_id: user.id, hash: await hashPassword(newPassword) })

      const { error: writeError } = await admin.from('password_history').insert(rows)
      /* Deliberately not fatal. The password HAS changed by this point, and
         telling someone their change failed when it did not would send them
         back to sign in with the old one. The reuse window is shorter than
         intended until the next change, which is the smaller harm. */
      if (writeError) console.error('password_history insert failed', writeError.message)

      /* Trim to depth. Left alone, the table grows for the life of the account
         and every future change pays scrypt on rows nothing will ever consult,
         since the reuse check only ever reads the newest HISTORY_DEPTH. */
      const { data: keep } = await admin
        .from('password_history')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(HISTORY_DEPTH)
      if (keep && keep.length === HISTORY_DEPTH) {
        await admin
          .from('password_history')
          .delete()
          .eq('user_id', user.id)
          .not('id', 'in', `(${keep.map(r => r.id).join(',')})`)
      }

      /* Every OTHER session is ended, and this one is kept. Someone changing a
         password because they think an old one leaked needs the leaked
         session gone; signing THEM out as well would only make them prove the
         new password immediately, which is friction that protects nobody. */
      await supabase.auth.signOut({ scope: 'others' })

      return NextResponse.json({ ok: true })
    }

    default:
      return bad('Unknown action.')
  }
}
