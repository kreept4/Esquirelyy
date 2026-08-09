import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Auth gate.
 *
 * Everything is behind sign-in except an explicit allowlist. That is the
 * inverse of the previous rule, which named the four protected paths and let
 * everything else through, and it is the safer default: a new page added next
 * month is private until someone decides it should not be.
 *
 * The allowlist is not a matter of taste. Three groups have to stay open:
 *
 * The auth routes themselves, or the redirect loops.
 *
 * The legal pages. You cannot require an account to read the terms that govern
 * the account, or the privacy notice that explains what signing up does with
 * your data. Under the Nigeria Data Protection Act 2023 the notice has to be
 * available to a data subject before collection, and collection starts at the
 * signup form.
 *
 * The pages a stranger uses to decide whether to trust us at all: the home
 * page, about, contact, the FAQ, the ambassador terms and the page telling
 * employers how to list a role. An employer will not create an account to find
 * out whether listing is free.
 *
 * And the firms directory, which is the exception this comment used to warn
 * about. Gating it made the most researched thing on the site invisible to
 * search engines: a student searching "Aluko & Oyebode training contract" found
 * a login page or nothing. /firms is now open at this layer, and the decision
 * about how much of a given firm a signed-out reader sees is made in the page
 * itself, by tier. Tier 1 profiles are public and indexed; the rest show the
 * firm's shape and ask the reader to sign in for the contact details. That
 * needs the firm record to answer, which is why it cannot live here.
 *
 * ⚠ Everything else — the jobs board, scholarships, the news page and the
 * tools — is still private, and still carries the same cost.
 */
const PUBLIC_PATHS = [
  '/auth',
  '/privacy',
  '/terms',
  '/about',
  '/contact',
  '/faq',
  '/ambassador',
  '/advertise',
  '/firms',
]

function isPublic(pathname: string) {
  if (pathname === '/') return true
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

/**
 * Generated metadata routes, which must never be gated.
 *
 * ⚠ THE MATCHER BELOW DOES NOT COVER THESE, AND THE REASON IS SUBTLE ENOUGH TO
 * BE WORTH WRITING DOWN. It exempts anything ending in an image extension, which
 * is the right rule for a file in /public. But Next's file-based metadata
 * conventions are ROUTES, not files: an opengraph-image.tsx compiles to
 * `/opengraph-image` with no extension at all. So the site share card sailed
 * straight into the auth gate and answered a 307 to /auth/login.
 *
 * That failure is invisible from inside the app. Nothing on the site requests
 * these URLs. The only consumers are Facebook's, WhatsApp's, LinkedIn's and X's
 * scrapers, none of which carry a session, all of which would have been handed a
 * redirect to a login page instead of an image, and none of which report back.
 * The card would simply never appear, and the obvious place to look for the
 * cause is the image route, which is working perfectly.
 *
 * Suffix match rather than a prefix, because these sit at whatever depth their
 * segment does: /opengraph-image at the root, /firms/templars/opengraph-image
 * three levels down.
 */
const METADATA_ROUTES = ['/opengraph-image', '/twitter-image', '/icon', '/apple-icon']

function isMetadataRoute(pathname: string) {
  return METADATA_ROUTES.some(r => pathname === r || pathname.endsWith(r))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Never gate the API, the metadata files, or the dev preview harness.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/device-preview') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    isMetadataRoute(pathname)
  ) {
    return NextResponse.next()
  }

  if (isPublic(pathname)) return NextResponse.next()

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    // Carry the query string too, so a visitor sent to the login page from
    // /jobs?type=internship lands back on that filter and not on a bare board.
    url.searchParams.set('redirect', pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
