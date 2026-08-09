import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * The session check every AI route needs, in one place.
 *
 * ⚠ WHY THIS EXISTS RATHER THAN A LINE IN EACH ROUTE. middleware.ts skips
 * /api entirely, deliberately and correctly: an API that answers a browser
 * redirect to a login page instead of JSON is useless to a fetch caller. But
 * skipping the gate there means each route owns its own check, and six of the
 * eight did not have one. /api/account and /api/email/welcome checked; the five
 * Claude routes and the CV exporter did not.
 *
 * What that cost: /api/cv-review accepted a file upload from anyone on the
 * internet and called Claude at 8192 output tokens, /api/cv-generate at 16000,
 * both with maxDuration 300 and no limit of any kind. The endpoints are visible
 * in the network tab of a page anybody can load. A loop against either one bills
 * the Anthropic key until it is cut off, and nothing in the app would show it
 * happening.
 *
 * The guard returns the user OR a response, never both, so a caller that forgets
 * to handle the failure branch gets a type error rather than an open endpoint.
 *
 * ⚠ THIS IS AUTHENTICATION, NOT A RATE LIMIT. It means an attacker needs an
 * account, which turns an anonymous script into one that has to sign up, and
 * makes the abuse attributable to a row you can disable. It does NOT stop a
 * signed-in user looping the expensive routes. A per-user quota on the AI
 * endpoints is the next piece of this and is not in here.
 */
export async function requireUser(): Promise<
  { user: { id: string; email?: string }; error: null } | { user: null; error: NextResponse }
> {
  const { data, error } = await createClient().auth.getUser()

  if (error || !data.user) {
    return {
      user: null,
      /* JSON and a 401, not a redirect. The caller is fetch(), and the client
         code can act on a status; it cannot follow a login page usefully. */
      error: NextResponse.json(
        { error: 'Please sign in to use this tool.' },
        { status: 401 }
      ),
    }
  }

  return { user: { id: data.user.id, email: data.user.email }, error: null }
}
