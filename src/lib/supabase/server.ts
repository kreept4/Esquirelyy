import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * The session-aware Supabase client, for Server Components.
 *
 * ⚠ setAll SWALLOWS ITS ERROR, AND NOT DOING SO WAS RETURNING 500s TO EVERY
 * SIGNED-IN MEMBER ON /jobs AND /jobs/[slug].
 *
 * Next only allows cookies to be written from a Server Action or a Route
 * Handler. A Server Component renders after the response headers are settled,
 * so `cookieStore.set` throws there. supabase-js calls setAll from
 * `_notifyAllSubscribers` whenever it refreshes an access token, which happens
 * on any render where the token is close to expiry: it awaits the handler
 * inside a Promise.all, so the throw became an unhandled rejection and took the
 * whole lambda down with `exit status: 128` rather than degrading.
 *
 * The failure mode is what made this expensive to find. A signed-out reader has
 * no session to refresh, so the page is a clean 200 to curl, to a crawler and
 * to anybody testing while logged out. It only breaks for members, and only
 * when their token happens to be due for refresh, which is why it read as
 * intermittent. It was live from 12 August and was found on 19 August because
 * an announcement email drove eighty five members at the two routes it affects.
 *
 * SWALLOWING IS THE CORRECT BEHAVIOUR HERE, NOT A WORKAROUND, and it is what
 * Supabase's own SSR guidance says to do. The refreshed token is not lost: the
 * middleware runs createServerClient on every matching request and calls
 * getUser() there, where writing cookies IS allowed, so the session is renewed
 * on the same request by the one layer entitled to renew it. This handler is a
 * second, illegal attempt at a job already done. Dropping it costs nothing.
 *
 * ⚠ DO NOT "FIX" THIS BY REMOVING THE TRY. If a future refactor takes session
 * refresh out of middleware.ts, this catch becomes a real silent failure and
 * the answer then is to restore the middleware, not to write cookies from a
 * render.
 */
export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies()
          return cookieStore.getAll()
        },
        async setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            const cookieStore = await cookies()
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            /* Called from a Server Component, where cookies cannot be written.
               The middleware has already refreshed the session for this
               request. See the note above before changing this. */
          }
        },
      },
    }
  )
}
