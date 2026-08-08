import { redirect } from 'next/navigation'

/**
 * There is no welcome step, and no onboarding questionnaire behind it.
 *
 * This page forwarded to /auth/onboarding, a three-step form that every new
 * account was sent through before it could reach anything. It has been removed
 * from the sign-in path: the questions it asked are the ones QuickQuestions asks
 * on the home page, where they are optional and asked of someone who has already
 * seen what the site is for, and the greeting a new account is owed is delivered
 * by the unread dot on the notification bell rather than by a gate.
 *
 * The route stays rather than 404ing because it has been the OAuth destination
 * for every account created so far, and old links, bookmarks and back buttons
 * still point at it. A server redirect, not the client one that was here: this
 * never had anything to render, so bouncing through a blank client component
 * was a wasted paint.
 */
export default function WelcomePage() {
  redirect('/jobs')
}
