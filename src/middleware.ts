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
 * ⚠ Everything else — the jobs board, the firms directory, scholarships, the
 * news page and the tools — is now private, and that has a cost worth being
 * explicit about: those pages were statically generated and indexable, and
 * they were how a student searching for "Nigerian law firm internship" would
 * ever have found this site. Behind a login they are invisible to search
 * engines. If the goal is reach, the usual shape is to leave the listings
 * public and gate the actions on them.
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
]

function isPublic(pathname: string) {
  if (pathname === '/') return true
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Never gate the API, the metadata files, or the dev preview harness.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/device-preview') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
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
