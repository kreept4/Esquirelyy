import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAccountState } from '@/lib/account'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

/**
 * The account page.
 *
 * There was a note here saying there should be no dashboard, and it was right
 * about what it was arguing against: a summary screen duplicating the tracker
 * and the notification bell. That is still not what this is. The tracker is
 * still the signed-in home, and nothing here repeats it.
 *
 * What this holds is the set of things that had nowhere to live — who you are,
 * what you want to hear about, how to step away, and how to leave. Every one of
 * those was unreachable before: a signed-in user could not edit their own name,
 * turn off an alert, or delete their account from anywhere in the product.
 *
 * Server component, so the account state is read once with the user's own
 * session and rendered already correct. Doing it in the client would flash an
 * empty form for one paint on every visit, and this page's whole job is telling
 * someone the truth about their account.
 */
export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Middleware already gates this path, so an unauthenticated request should
  // not arrive. Checked anyway rather than trusting one layer for the page that
  // can delete an account.
  if (!user) redirect('/auth/login?redirect=/dashboard')

  const { state, error } = await getAccountState(supabase, user.id)

  /* The identity comes from the session, not the profile row. A row that failed
     to read, or was never created, must not render a page addressed to nobody —
     and the email on the account is the one thing we always have. */
  const identities = user.identities?.map(i => i.provider) ?? []

  return (
    <DashboardClient
      email={user.email ?? ''}
      joinedAt={user.created_at ?? null}
      providers={identities}
      state={state}
      readError={error}
    />
  )
}
