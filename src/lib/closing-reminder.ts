/**
 * The "closing soon" reminder: one email to every member naming the openings
 * whose deadline is days away.
 *
 * ============================================================
 * WHY THIS IS ITS OWN MAILING AND NOT A NEW DROP
 * ============================================================
 *
 * NEW_ROLES in lib/new-roles.ts is the current announcement, and four surfaces
 * read it: the bell, the news carousel, the modal and the roles email.
 * Replacing it with these four would put "4 new opportunities" in the bell for
 * roles that went up on 5 November, which is untrue in the place members look
 * most. A reminder is a second kind of send, so it gets a second id and only
 * the email reads it. The bell already raises its own "closes in N days" rows
 * from the deadlines, so nothing is lost there.
 *
 * The cards are the roles email's cards (templates/new-roles.ts renders both),
 * so a reminder looks like the email members already know.
 *
 * To send the next reminder: replace `entries`, bump `id`, rewrite the copy.
 * The broadcast route refuses a run whose drop id matches neither this nor
 * NEW_ROLES.id, and skips anybody this id has already reached.
 */

import type { MailEntry } from '@/lib/email/templates/new-roles'

const ENTRIES: MailEntry[] = [
  /* Same wording as the 5 November drop, which these first went out in, with
     the closing date restated as the point of the message. Soonest first is
     meaningless here (all four close the same day), so the order is by
     audience: the NYSC seat, then the two experienced seats, then the open
     day for undergraduates. */
  {
    slug: 'stren-blan-trainee-associate-2027-nysc',
    employer: 'Stren & Blan Partners',
    employerShort: 'Stren & Blan',
    title: 'Trainee Associate, 2027 NYSC',
    line: 'A service year spent in practice. Stren & Blan Partners are taking on trainee associates from the 2027 NYSC batch, at a firm with offices in Lagos, Abuja and Enugu. A 2:1 LL.B or better is the bar. Applications go through the firm\'s online form and close on Friday 13 November.',
    prep: 'apply',
    deadline: '2026-11-13',
  },
  {
    /* The 5 November line said "CVs by 13 November" without the address. It
       is on the listing, so it is in the line now. */
    slug: 'ikeyi-shittu-lawyer-litigation-commercial-transactions',
    employer: 'Ikeyi Shittu & Co',
    employerShort: 'Ikeyi Shittu',
    title: 'Lawyer, Litigation and Commercial Transactions',
    line: 'For lawyers as sure-footed in court as on a transaction: five or more years\' call across litigation and commercial work, a First or 2:1 LL.B, and ideally an LL.M. Hybrid, in Lagos, Abuja or Enugu. Send your CV to careers@ikeyishittuco.com with the role and your preferred city as the subject, by Friday 13 November.',
    prep: 'apply',
    deadline: '2026-11-13',
  },
  {
    /* "Olajide Oyewole LLP" rather than the drop's "(DLA Piper Africa)" form:
       the logo resolves on the firm's own name, and the network is named in
       the line instead. */
    slug: 'olajide-oyewole-associate-dispute-resolution-abuja',
    employer: 'Olajide Oyewole LLP',
    employerShort: 'Olajide Oyewole',
    title: 'Associate, Dispute Resolution',
    line: 'An Abuja seat at the DLA Piper Africa member firm in Nigeria, for lawyers three to five years qualified: commercial litigation, arbitration, mediation, employment disputes and debt recovery. Apply by email to careers@oo.dlapiperafrica.com by Friday 13 November.',
    prep: 'apply',
    deadline: '2026-11-13',
  },
  {
    /* An opportunity, not a jobs row: the slug is opportunitySlug(title). */
    slug: 'blue-experience-2-0-olaniwun-ajayi-open-day-2026',
    employer: 'Olaniwun Ajayi LP',
    employerShort: 'Olaniwun Ajayi',
    title: 'Blue Experience 2.0, Open Day 2026',
    line: 'For law undergraduates: a day at Olaniwun Ajayi\'s Banana Island office with the firm\'s lawyers, in person on Wednesday 25 November. Applications go through the firm\'s online form and close on Friday 13 November.',
    prep: 'event',
    deadline: '2026-11-13',
  },
]

export const CLOSING_REMINDER = {
  /** Separate from NEW_ROLES.id: the route sends whichever mailing a run names. */
  id: 'closing-2026-11-13',
  entries: ENTRIES,
  /** 44 characters, inside what every client shows. */
  subject: 'Four openings close this Friday, 13 November',
  /** Set at 26px. The member's first name goes after it, as in the roles email. */
  headline: 'Four openings close this Friday',
  /** The hidden preview line in the inbox list. */
  preheader: 'Stren & Blan, Ikeyi Shittu, Olajide Oyewole and Olaniwun Ajayi all stop taking applications on Friday 13 November.',
  /** The paragraph under the cards. */
  footnote: 'All four close on Friday 13 November. If one of them is yours, send your application before then.',
  ctaLabel: 'See all four',
  ctaText: 'See all four here',
} as const

export const CLOSING_REMINDER_HREF = `/jobs?roles=${CLOSING_REMINDER.entries.map(e => e.slug).join(',')}`
