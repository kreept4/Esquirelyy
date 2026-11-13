/**
 * Who may use /admin.
 *
 * By account id, not by email: an email can be changed in Supabase by its
 * owner, an id cannot. One person for now, at the owner's request on
 * 13 November 2026: Boluwatife Ogunleye (boluwatifeogunleye06@gmail.com).
 * To add someone, add their auth.users id here and deploy.
 *
 * ⚠ CHECKED ON THE SERVER, ON EVERY REQUEST AND EVERY SAVE. The page 404s for
 * anybody else, and every server action in app/admin/actions.ts calls
 * requireAdmin() before it touches the database, because a server action is a
 * public endpoint whether or not the page that calls it is shown.
 */

import { createClient } from '@/lib/supabase/server'

export const ADMIN_USER_IDS: readonly string[] = [
  'fa6b7d16-5ddd-4d47-9f7d-5df575dfed1a', // Boluwatife Ogunleye
]

/** The signed-in admin, or null for anybody else (including signed-out). */
export async function currentAdmin(): Promise<{ id: string; email: string } | null> {
  try {
    const { data: { user } } = await createClient().auth.getUser()
    if (!user || !ADMIN_USER_IDS.includes(user.id)) return null
    return { id: user.id, email: user.email ?? '' }
  } catch {
    return null
  }
}

/** For server actions: throws unless the caller is an admin. */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const admin = await currentAdmin()
  if (!admin) throw new Error('Not allowed')
  return admin
}
