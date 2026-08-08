import { redirect } from 'next/navigation'

/**
 * The onboarding questionnaire is gone.
 *
 * It was three steps — career stage, goal, city — shown to every new account
 * before it could reach the board. Two things were wrong with that. It was a
 * gate: the first thing someone saw after proving their identity was a form
 * standing between them and what they signed up for, at the exact moment their
 * interest is highest and their patience for admin is lowest. And it was
 * redundant, because QuickQuestions on the home page asks the same three
 * questions, optionally, of someone who has already seen enough of the site to
 * have a reason to answer.
 *
 * A new account is now prompted the way every account is prompted — the unread
 * dot on the notification bell, carrying the welcome note. A prompt can be
 * ignored, which is the correct amount of force for a greeting.
 *
 * The form itself is not preserved here. It is in the history of this file if
 * the questions are ever wanted again, and the fields it wrote —
 * `career_stage`, `location`, `practice_areas` — are still on `profiles` and
 * still editable, which is where the settings page will pick them up.
 */
export default function OnboardingPage() {
  redirect('/jobs')
}
