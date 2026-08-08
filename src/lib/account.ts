import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Account state: breaks, deletion, notification preferences.
 *
 * One module because these three settings share a single row and one rule —
 * *signing in is evidence of intent* — and splitting them would mean three
 * places that each have to remember to apply it.
 */

export const BREAK_LENGTHS = [
  { days: 7,  label: 'A week' },
  { days: 14, label: 'Two weeks' },
  { days: 28, label: 'Four weeks' },
] as const

/** Days between pressing delete and the data actually going. Mirrored in the
 *  SQL comment and in the copy on the page; change all three together. */
export const DELETION_GRACE_DAYS = 30

export interface NotificationPreferences {
  deadlines: boolean
  new_listings: boolean
  weekly_digest: boolean
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  deadlines: true,
  new_listings: true,
  weekly_digest: true,
}

export interface AccountState {
  fullName: string | null
  email: string | null
  careerStage: string | null
  location: string | null
  practiceAreas: string[]
  linkedinUrl: string | null
  notifications: NotificationPreferences
  /** Non-null only while a break is actually running. A break whose end has
   *  passed reads as no break at all, with nothing needing to have run. */
  breakUntil: string | null
  breakStartedAt: string | null
  /** Non-null means a deletion is pending and `deletionOn` says when. */
  deletionRequestedAt: string | null
  deletionOn: string | null
}

/* The columns this module reads. Named explicitly rather than `*` so that a
   column added later cannot silently start travelling to the client. */
const PROFILE_COLUMNS =
  'full_name, email, career_stage, location, practice_areas, linkedin_url, ' +
  'notification_preferences, break_started_at, break_until, deletion_requested_at'

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString()
}

/** A break is over the moment its end time passes. Deriving that from the
 *  timestamp rather than storing a boolean means nothing has to run on a
 *  schedule to end one, and a break cannot get stuck on. */
export function isBreakActive(breakUntil: string | null | undefined): boolean {
  return !!breakUntil && new Date(breakUntil).getTime() > Date.now()
}

export function readAccountState(row: Record<string, any> | null): AccountState {
  const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(row?.notification_preferences ?? {}) }
  const active = isBreakActive(row?.break_until)
  const requested: string | null = row?.deletion_requested_at ?? null
  return {
    fullName: row?.full_name ?? null,
    email: row?.email ?? null,
    careerStage: row?.career_stage ?? null,
    location: row?.location ?? null,
    practiceAreas: row?.practice_areas ?? [],
    linkedinUrl: row?.linkedin_url ?? null,
    notifications: prefs,
    breakUntil: active ? row!.break_until : null,
    breakStartedAt: active ? (row?.break_started_at ?? null) : null,
    deletionRequestedAt: requested,
    deletionOn: requested ? addDays(requested, DELETION_GRACE_DAYS) : null,
  }
}

export async function getAccountState(
  supabase: SupabaseClient,
  userId: string
): Promise<{ state: AccountState | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  // maybeSingle, and a read error is reported rather than swallowed: a failed
  // read and a genuinely new user both produce null, and treating the first as
  // the second is the bug that sent returning Google users back through
  // onboarding on every sign-in (see app/auth/callback/route.ts).
  if (error) return { state: null, error: error.message }
  return { state: readAccountState(data), error: null }
}

/**
 * Signing in cancels a pending deletion.
 *
 * This is the whole reason the grace period is worth having. Someone who
 * deletes at 2am after a rejection and comes back on Tuesday should find their
 * account where they left it, without having to find a settings page and undo
 * something — coming back IS the undo, and asking for a second confirmation
 * would just be a way of losing people who did not see it.
 *
 * Deliberately does not touch a break. A break is a considered choice with an
 * end date already attached, and someone signing in mid-break to look something
 * up has not asked for their alerts back.
 *
 * Never throws. It runs on the sign-in path, and an account that is not being
 * deleted must not fail to sign in because of a write that was a no-op for it.
 */
export async function cancelPendingDeletion(
  supabase: SupabaseClient,
  userId: string
): Promise<{ cancelled: boolean }> {
  try {
    // `.not.is(null)` so this writes only for the rare row that has a deletion
    // pending, rather than issuing an UPDATE for every sign-in on the site.
    const { data, error } = await supabase
      .from('profiles')
      .update({ deletion_requested_at: null })
      .eq('id', userId)
      .not('deletion_requested_at', 'is', null)
      .select('id')

    if (error) {
      console.error('[account] could not cancel pending deletion', userId, error.message)
      return { cancelled: false }
    }
    return { cancelled: (data?.length ?? 0) > 0 }
  } catch (e) {
    console.error('[account] cancel deletion threw', userId, e)
    return { cancelled: false }
  }
}

/**
 * Every table holding rows keyed to a user, in the order they must be deleted.
 *
 * Order matters only to the extent that anything references anything else; the
 * profile goes last because the other tables are the ones a person would
 * recognise as "their data", and if a purge dies half way the remaining profile
 * row is what lets us see that it did.
 *
 * Kept as a list rather than relying on ON DELETE CASCADE from auth.users
 * because only some of these were created with that clause, and "it probably
 * cascades" is not a basis for telling someone their data is gone.
 */
export const USER_DATA_TABLES = [
  'applications',
  'cv_generations',
  'cv_reviews',
  'cover_letters',
  'interview_sessions',
  'rejection_log',
] as const
