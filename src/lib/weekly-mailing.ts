/**
 * The Monday mailing: new scholarships first, then the week's new roles.
 *
 * A third kind of send beside the roles drop (lib/new-roles.ts) and the
 * closing reminder (lib/closing-reminder.ts), for a week where the news is
 * mostly funding. The roles email cannot carry it: its only scholarship block
 * is a single "closing this week" nudge, and five new awards are the lead here,
 * not an aside.
 *
 * The scholarship cards take their title, provider and closing date from
 * scholarships-data.ts, so the email and /scholarships cannot disagree on a
 * fact. Only the two-sentence line is written here, because the page's
 * description is a paragraph and a card wants two sentences.
 *
 * ⚠ ASCII ONLY, as in every roles email: these strings are the plain-text part
 * too. That is why the roles below spell the employer "Ororun". It is the Latin
 * spelling the company uses for its own handle and domain; the site keeps
 * "Órọrùn".
 *
 * To send the next one: replace the lists, bump `id`, rewrite the copy. The
 * broadcast route refuses a run whose drop id it does not know, and skips
 * anybody this id has already reached.
 */

import type { MailEntry, MailScholarship } from '@/lib/email/templates/new-roles'
import { ROLE_ENTRIES } from '@/lib/new-roles'
import { scholarshipBySlug } from '@/lib/scholarships-data'

/** Card facts from the scholarships file, plus the line written for the email. */
function card(slug: string, line: string): MailScholarship {
  const s = scholarshipBySlug(slug)
  if (!s || !s.closesOn) throw new Error(`weekly-mailing: no dated scholarship "${slug}"`)
  return { slug, title: s.title, provider: s.provider, closesOn: s.closesOn, line }
}

/* In the order /scholarships shows them, which is the relevance order agreed
   on 12 November: Podell, Hauser, Georgetown, McGill, Edinburgh. */
const SCHOLARSHIPS: MailScholarship[] = [
  card(
    'nyu-podell-global-graduate-legal-scholarship',
    'One award a year, for an LLM student from a lower-income country who could not otherwise afford New York. Nigeria qualifies if you live here. It pays tuition, living costs and a return flight, and you are considered through your NYU application.'
  ),
  card(
    'nyu-hauser-global-scholarship',
    "NYU Law's top LLM award: full tuition and a living stipend, about ten a year, for graduates of law schools outside the United States. It needs one extra essay of 500 to 750 words with your NYU application."
  ),
  card(
    'georgetown-llm-scholarships',
    'Every admitted LL.M. student is considered automatically, but most awards cover part of the tuition. Full tuition goes to a small number of international students with a strong record in transnational practice.'
  ),
  card(
    'mcgill-obrien-graduate-fellowship',
    'Up to 25,000 Canadian dollars for a year of the LLM, for research in human rights and legal pluralism. Open to every nationality. Send the short form with your LLM application.'
  ),
  card(
    'edinburgh-llm-european-transnational-law-scholarship',
    'One award that pays the full tuition fee on the LLM in European Law. Fees only, and you apply to the LLM first.'
  ),
]

/** The roles drop's entries, with the employer's name in ASCII. */
const ascii = (t: string) => t.replace(/Órọrùn/g, 'Ororun')
const ENTRIES: MailEntry[] = ROLE_ENTRIES.map(r => ({
  slug: r.slug,
  employer: ascii(r.employer),
  employerShort: ascii(r.employerShort),
  title: r.title,
  line: ascii(r.line),
  prep: r.prep,
  deadline: r.deadline,
}))

export const WEEKLY_MAILING = {
  id: 'weekly-2026-11-16',
  entries: ENTRIES,
  scholarships: SCHOLARSHIPS,
  scholarshipsLabel: 'New LLM scholarships',
  rolesLabel: 'New internships',
  rolesLinkLabel: 'See both on the board',
  rolesHref: `/jobs?roles=${ENTRIES.map(e => e.slug).join(',')}`,
  /** 55 characters, inside what every client shows. */
  subject: 'Five new LLM scholarships, and two research internships',
  /** The member's first name goes after it, as in the roles email. */
  headline: 'Five new LLM scholarships and two research internships',
  /** The hidden preview line in the inbox list. */
  preheader:
    'NYU, Georgetown, McGill and Edinburgh are funding LLMs, and Ororun are taking research interns. Three of the deadlines fall in December.',
  /** The paragraph under the cards. */
  footnote:
    "We checked each award and both internships against the school's or employer's own page, so the terms and dates above are the ones they published. If one of the December awards is yours, start on the essays this week.",
  ctaLabel: 'See every scholarship',
  ctaText: 'See every scholarship here',
} as const

export const WEEKLY_MAILING_HREF = '/scholarships'
