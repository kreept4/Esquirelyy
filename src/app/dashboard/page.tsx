import { redirect } from 'next/navigation'

/**
 * There is no dashboard, and there should not be one.
 *
 * The signed-in menu has linked to /dashboard since before this route existed,
 * so every signed-in user has had a menu item that 404s. The fix is not to
 * build the page: a dashboard here would summarise the tracker and duplicate
 * the notification bell, which between them already answer "what is happening
 * with my applications" and "what needs my attention".
 *
 * The tracker is the signed-in home. This redirect keeps the old link working
 * and keeps anyone from bookmarking a second personal surface into existence.
 */
export default function DashboardPage() {
  redirect('/tracker')
}
