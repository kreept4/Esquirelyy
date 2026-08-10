import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * The service role client. Bypasses RLS. Server only, always.
 *
 * WHY THIS EXISTS, WHEN server.ts DID EVERYTHING UNTIL NOW. Every other write
 * in this app is the signed-in user editing their own row, which the anon key
 * plus RLS handles correctly and safely. Two things here cannot work that way:
 *
 *   password_history  has RLS on and no policy at all, so it is unreachable
 *                     from the browser by design. Only this key can read or
 *                     write it, which is the whole point of storing hashes
 *                     there rather than anywhere a stolen session can reach.
 *
 *   setting a password  auth.admin.updateUserById is the only way to change a
 *                     password from the server. Doing it client side with
 *                     updateUser() would work, but then the reuse check would
 *                     live in the browser beside the call it is meant to gate,
 *                     and a rule that the caller can skip is not a rule.
 *
 * NO COOKIES, NO SESSION PERSISTENCE. This client must never pick up or write
 * the caller's auth cookies: it is not acting as them, and a service-role
 * session accidentally persisted into a response would be a total compromise.
 * The flags below are what keep it stateless.
 *
 * NEVER IMPORT THIS FROM A CLIENT COMPONENT. The key has no NEXT_PUBLIC_ prefix,
 * so a client bundle would fail to find it, which is the intended failure.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
}
