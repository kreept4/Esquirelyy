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
function card(slug: string, logo: string, line: string): MailScholarship {
  const s = scholarshipBySlug(slug)
  if (!s || !s.closesOn) throw new Error(`weekly-mailing: no dated scholarship "${slug}"`)
  return { slug, title: s.title, provider: s.provider, closesOn: s.closesOn, logo, line }
}

/* The schools' own logos, from their own sites, with email plates built by
   scripts/build-email-assets.mjs. A logo without a plate falls back to the
   provider's name, so a missing file degrades rather than breaks. */
const NYU = '/employer-logos/nyu-law.png'
const GEORGETOWN = '/employer-logos/georgetown-law.png'
const MCGILL = '/employer-logos/mcgill.png'
const EDINBURGH = '/employer-logos/edinburgh-law.png'

/* In the order /scholarships shows them, which is the relevance order agreed
   on 12 November: Podell, Hauser, Georgetown, McGill, Edinburgh. */
const SCHOLARSHIPS: MailScholarship[] = [
  card(
    'nyu-podell-global-graduate-legal-scholarship',
    NYU,
    'One award a year covering tuition, living costs and a return flight for an LLM student from a lower-income country, including Nigeria.'
  ),
  card(
    'nyu-hauser-global-scholarship',
    NYU,
    "Full tuition and a living stipend for around ten international law graduates a year. Requires an additional 500 to 750 word essay."
  ),
  card(
    'georgetown-llm-scholarships',
    GEORGETOWN,
    'All admitted LL.M. students are considered for partial tuition awards. A small number of full-tuition awards are also available.'
  ),
  card(
    'mcgill-obrien-graduate-fellowship',
    MCGILL,
    'Up to 25,000 Canadian dollars for one year of the LLM, for research in human rights and legal pluralism.'
  ),
  card(
    'edinburgh-llm-european-transnational-law-scholarship',
    EDINBURGH,
    'One full-tuition scholarship for the LLM in European Law. Living costs are not covered.'
  ),
]

/** The roles drop's entries, with the employer's name in ASCII. */
const ascii = (t: string) => t.replace(/Órọrùn/g, 'Ororun')
const ENTRIES: MailEntry[] = [
  ...ROLE_ENTRIES.map(r => ({
    slug: r.slug,
    employer: ascii(r.employer),
    employerShort: ascii(r.employerShort),
    title: r.title,
    line: ascii(r.line),
    prep: r.prep,
    deadline: r.deadline,
  })),
  /* Added to the board on the evening of 9 November, hours after that day's
     roles email went out, so members were never told about it. */
  {
    slug: 'chapel-hill-denham-2027-management-development-programme',
    employer: 'Chapel Hill Denham',
    employerShort: 'Chapel Hill Denham',
    title: '2027 Management Development Programme',
    line: "A full-time graduate programme in Lagos that accepts law graduates with a 2:1 or First. Trainees rotate through investment banking, securities trading and investment management. Apply online by 30 November.",
    prep: 'apply',
    deadline: '2026-11-30',
  },
]

export const WEEKLY_MAILING = {
  id: 'weekly-2026-11-16',
  entries: ENTRIES,
  scholarships: SCHOLARSHIPS,
  scholarshipsLabel: 'New LLM scholarships',
  rolesLabel: 'New roles',
  rolesLinkLabel: 'See all three on the board',
  rolesHref: `/jobs?roles=${ENTRIES.map(e => e.slug).join(',')}`,
  /** 46 characters, inside what every client shows. */
  subject: 'Five new LLM scholarships and three new roles',
  /** The member's first name goes after it, as in the roles email. */
  headline: 'Five new LLM scholarships and three new roles',
  /** The hidden preview line in the inbox list. */
  preheader:
    "New LLM funding from NYU, Georgetown, McGill and Edinburgh, two research internships at Ororun, and Chapel Hill Denham's graduate programme.",
  /** The paragraph under the cards. */
  footnote:
    "Every listing has been checked against the provider's own page. Three scholarships close in December.",
  ctaLabel: 'See every scholarship',
  ctaText: 'See every scholarship here',
  notice: {
    text: 'We have updated our privacy policy. We now count site visits with cookieless analytics, and we name Zoho, which handles email sent to us.',
    linkLabel: 'Read the privacy policy',
    href: '/privacy',
  },
} as const

export const WEEKLY_MAILING_HREF = '/scholarships'
